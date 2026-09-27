/**
 * @file tools/ci/changes.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

// Decides which CI jobs a change needs, so a pull request that only touches
// documentation, or only some projects, skips the jobs it cannot affect.
//
//   node tools/ci/changes.ts <base> <head>
//
// Every changed file between the merge base of <base> and <head> is one of:
//
//   document   Markdown, MDX or anything under docs/, which no code in the
//              committed Graphify graph (graphify-out/graph.json) depends on.
//              It needs the lint job (Prettier) and the docs job (the
//              configuration reference check), nothing else.
//   project    inside an Nx project. Nx works out, per target, which projects
//              the change affects, through the project graph.
//   workspace  anything else: workflows, root configuration, the lockfile,
//              tools/ and scripts/. Nx cannot tell what these reach, so they
//              run every job.
//
// Writes typecheck, test, build and docs (true or false) to $GITHUB_OUTPUT and
// the reasons to $GITHUB_STEP_SUMMARY, or prints them when run locally. Anything
// it cannot work out, such as a missing base commit, runs every job. Runs on
// Node's built-in TypeScript support.

import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const nxBin = join(root, 'node_modules', '.bin', 'nx')

type Job = 'typecheck' | 'test' | 'build' | 'docs'
const JOBS: ReadonlyArray<Job> = ['typecheck', 'test', 'build', 'docs']

// The Nx targets whose affected projects decide each job. typecheck also runs
// the test projects' type-check, so a change that affects a test needs it.
const TARGETS: Record<Job, ReadonlyArray<string>> = {
  typecheck: ['typecheck', 'test'],
  test: ['test'],
  build: ['build'],
  docs: ['docgen', 'contracts'],
}

const DOCUMENT = /\.mdx?$|^docs\//

interface Decision {
  readonly jobs: Record<Job, boolean>
  readonly reasons: ReadonlyArray<string>
}

const everything = (reason: string): Decision => ({
  jobs: { typecheck: true, test: true, build: true, docs: true },
  reasons: [reason],
})

const run = (command: string, args: ReadonlyArray<string>) =>
  execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NX_NO_CLOUD: 'true', NX_DAEMON: 'false' },
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

const changedFiles = (base: string, head: string): ReadonlyArray<string> | undefined => {
  try {
    // Without renames, a moved file lists both paths, so the project it left counts too.
    const out = run('git', ['diff', '--name-only', '--no-renames', `${base}...${head}`])
    return out === '' ? [] : out.split('\n')
  } catch {
    return undefined
  }
}

interface GraphNode {
  readonly id: string
  readonly file_type?: string
  readonly source_file?: string
}
interface GraphLink {
  readonly source: string
  readonly target: string
}

// Files the Graphify graph shows code in another file depending on: an edge
// from a code node into one of the file's nodes. Graphify records a document
// referring to code as an edge from the document, so a document in this set is
// one that code loads, and changing it can change what the code does.
const codeDependencies = (): ReadonlySet<string> | undefined => {
  const path = join(root, 'graphify-out', 'graph.json')
  if (!existsSync(path)) return undefined
  try {
    const graph = JSON.parse(readFileSync(path, 'utf8')) as {
      readonly nodes: ReadonlyArray<GraphNode>
      readonly links: ReadonlyArray<GraphLink>
    }
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]))
    const files = new Set<string>()
    for (const link of graph.links) {
      const source = nodes.get(link.source)
      const target = nodes.get(link.target)
      if (
        source?.file_type === 'code' &&
        target?.source_file !== undefined &&
        target.source_file !== source.source_file
      ) {
        files.add(target.source_file)
      }
    }
    return files
  } catch {
    return undefined
  }
}

const projectRoots = (): ReadonlyArray<string> => {
  const directory = mkdtempSync(join(tmpdir(), 'smartcloud-changes-'))
  try {
    const file = join(directory, 'graph.json')
    run(nxBin, ['graph', `--file=${file}`])
    const { graph } = JSON.parse(readFileSync(file, 'utf8')) as {
      readonly graph: { readonly nodes: Record<string, { readonly data: { readonly root: string } }> }
    }
    return Object.values(graph.nodes).map((node) => node.data.root)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

// Projects with the target that the files affect, through the Nx project graph.
const affectedBy = (files: ReadonlyArray<string>) => {
  const byTarget = new Map<string, ReadonlyArray<string>>()
  return (target: string): ReadonlyArray<string> => {
    let projects = byTarget.get(target)
    if (projects === undefined) {
      const out = run(nxBin, ['show', 'projects', '--affected', `--files=${files.join(',')}`, '-t', target, '--json'])
      projects = JSON.parse(out) as ReadonlyArray<string>
      byTarget.set(target, projects)
    }
    return projects
  }
}

const decide = (base: string | undefined, head: string | undefined): Decision => {
  const event = process.env['GITHUB_EVENT_NAME']
  if (event !== undefined && event !== 'pull_request' && event !== 'merge_group') {
    return everything(`A ${event} run checks everything.`)
  }
  if (base === undefined || head === undefined || base === '' || head === '') {
    return everything('No base and head commits to compare.')
  }
  const files = changedFiles(base, head)
  if (files === undefined) return everything(`Could not list the files changed since ${base}.`)
  if (files.length === 0) return everything('No changed files to classify.')

  const graph = codeDependencies()
  const roots = projectRoots()
  const documents: string[] = []
  const projects: string[] = []
  for (const file of files) {
    if (DOCUMENT.test(file) && !graph?.has(file)) documents.push(file)
    else if (roots.some((projectRoot) => file.startsWith(`${projectRoot}/`))) projects.push(file)
    else return everything(`\`${file}\` is outside every Nx project, so it may affect any job.`)
  }

  const reasons: string[] = []
  if (graph === undefined) reasons.push('No Graphify graph, so documents are recognised by path alone.')
  if (documents.length > 0) {
    reasons.push(`${documents.length} document(s) changed: lint and the configuration reference check run.`)
  }
  const jobs = { typecheck: false, test: false, build: false, docs: documents.length > 0 }
  const affected = affectedBy(projects)
  for (const job of JOBS) {
    const reached = projects.length === 0 ? [] : [...new Set(TARGETS[job].flatMap(affected))]
    if (reached.length > 0) {
      jobs[job] = true
      reasons.push(`${job}: ${reached.length} affected project(s) with ${TARGETS[job].join(' or ')}.`)
    } else if (!jobs[job]) {
      reasons.push(`${job}: skipped, no affected project has ${TARGETS[job].join(' or ')}.`)
    }
  }
  return { jobs, reasons }
}

const [base, head] = process.argv.slice(2)
let decision: Decision
try {
  decision = decide(base, head)
} catch (error) {
  decision = everything(`Could not classify the change (${error instanceof Error ? error.message : String(error)}).`)
}

const output = process.env['GITHUB_OUTPUT']
const summary = process.env['GITHUB_STEP_SUMMARY']
const lines = JOBS.map((job) => `${job}=${decision.jobs[job]}`)
if (output) appendFileSync(output, `${lines.join('\n')}\n`)
if (summary) {
  appendFileSync(
    summary,
    [
      '### Jobs this change needs',
      '',
      ...JOBS.map((job) => `- ${job}: ${decision.jobs[job] ? 'runs' : 'skipped'}`),
      '',
      ...decision.reasons.map((reason) => `- ${reason}`),
      '',
    ].join('\n'),
  )
}
console.log([...lines, ...decision.reasons].join('\n'))
