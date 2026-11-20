/**
 * @file tools/test/affected.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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

import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// The native hook supplies its captured tree before isolating child Git environments.
// Direct and house-hook callers use the current index, including an alternate index.
const [option, tree, ...extra] = process.argv.slice(2)
if ((option !== undefined && (option !== '--staged-tree' || !tree)) || extra.length > 0) {
  throw new Error(
    'Use node tools/test/affected.ts [--staged-tree <tree>]; select the committing index, not unstaged files.',
  )
}
const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' })
const root = git('rev-parse', '--show-toplevel').trim()
let paths: string
if (tree === undefined) paths = git('diff', '--cached', '--name-only', '--no-renames', '-z')
else {
  if (git('cat-file', '-t', tree).trim() !== 'tree') throw new Error('Pass the staged tree from git write-tree.')
  const head = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'HEAD'], { encoding: 'utf8' })
  if (head.error || (head.status !== 0 && head.status !== 1)) throw new Error('Cannot resolve HEAD for affected tests.')
  paths =
    head.status === 0
      ? git('diff', '--name-only', '--no-renames', '-z', 'HEAD', tree)
      : git('ls-tree', '--name-only', '-r', '-z', tree)
}
const files = paths.split('\0').filter(Boolean)
if (files.length === 0) {
  console.log('Staged affected tests: none (the committing index has no changes).')
  process.exit(0)
}

const env: NodeJS.ProcessEnv = { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' }
for (const name of git('rev-parse', '--local-env-vars').trim().split('\n')) delete env[name]
const nx = join(root, 'node_modules/nx/dist/bin/nx.js')
const inspect = (...args: string[]) =>
  execFileSync(process.execPath, [nx, ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
const scratch = join(root, '.amp/in/orb-backup')
mkdirSync(scratch, { recursive: true })
const graphPath = join(mkdtempSync(join(scratch, 'affected-tests-')), 'graph.json')
inspect('graph', `--file=${graphPath}`)
const { graph } = JSON.parse(readFileSync(graphPath, 'utf8')) as {
  graph: { nodes: Record<string, { data: { root: string; targets?: Record<string, unknown> } }> }
}
const nodes = Object.entries(graph.nodes)
// Match CI's conservative workspace boundary. Never silently drop root tooling,
// dynamically read registry files, or paths Nx's comma/space CLI cannot represent.
const workspace = files.some(
  (file) => /[,\s]/.test(file) || !nodes.some(([, node]) => file.startsWith(`${node.data.root}/`)),
)
const projects = workspace
  ? nodes
      .filter(([, node]) => node.data.targets?.test !== undefined)
      .map(([name]) => name)
      .sort()
  : (JSON.parse(
      inspect('show', 'projects', '--affected', `--files=${files.join(',')}`, '-t', 'test', '--json'),
    ) as string[])
if (projects.length === 0)
  throw new Error('No test target covers the staged paths. Add their test ownership before committing.')
console.log(`Staged affected tests${workspace ? ' (workspace-wide paths)' : ''}: ${projects.join(', ')}`)
const result = spawnSync(
  process.execPath,
  [
    nx,
    'run-many',
    '-t',
    'test',
    `--projects=${projects.join(',')}`,
    '--excludeTaskDependencies',
    '--outputStyle=static',
  ],
  {
    cwd: root,
    env,
    stdio: 'inherit',
  },
)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
