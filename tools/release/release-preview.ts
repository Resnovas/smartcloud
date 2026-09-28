/**
 * @file tools/release/release-preview.ts
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

// Previews the release a pull request would lead to.
//
//   node tools/release/release-preview.ts
//
// Run by .github/workflows/release-preview.yml on a pull request's merge
// commit, checked out with full history and tags. It replaces that merge
// commit with the squash commit the merge queue would land (the pull request's
// title and number over its commits' messages, tools/release/preview.ts), then
// asks Nx release, in dry-run mode, for the next version and its notes, as
// tools/release/release.ts would work them out. Nothing is written, built,
// tagged or pushed. The report goes to stdout, the job summary and the
// `report` output, which the workflow's comment job posts on the pull request.
//
// The squash commit is made only on GitHub Actions (GITHUB_ACTIONS=true) with
// PR_TITLE and PR_NUMBER set, since it moves HEAD; run locally, the script
// previews the checked-out commit as it is. A preview problem never fails the
// run: it becomes a warning and a short report. Runs on Node's built-in
// TypeScript support.

import { releaseChangelog, releaseVersion } from 'nx/release'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  bumpOf,
  type CommitTypes,
  isFirstRelease,
  type Preview,
  renderFailure,
  renderPreview,
  squashMessage,
} from './preview.ts'

// The version the first stable release takes, as docs/releasing.mdx tells the
// maintainer to set it.
const FIRST_RELEASE = '2.0.0'
// A pull request comment holds at most 65,536 characters; the notes leave room for the rest.
const COMMENT_NOTES = 60_000
const BOT = { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' }

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
const tryGit = (...args: string[]): string | undefined => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return undefined
  }
}

// Workflow command escaping, as in @actions/core.
const escapeData = (text: string) => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')

// Hands the full report to the job summary, and the comment's copy to the
// comment job; no-ops outside GitHub Actions.
const publish = (report: string, comment: string) => {
  console.log(report)
  const summary = process.env['GITHUB_STEP_SUMMARY']
  if (summary !== undefined && summary !== '') appendFileSync(summary, report)
  const output = process.env['GITHUB_OUTPUT']
  if (output !== undefined && output !== '') {
    const delimiter = `REPORT_${randomUUID()}`
    appendFileSync(output, `report<<${delimiter}\n${comment}\n${delimiter}\n`)
  }
}

// Replaces the merge commit with the squash commit, on the same tree, and
// returns that commit's message.
const squash = (title: string, number: number): string | undefined => {
  const base = tryGit('rev-parse', '--verify', '--quiet', 'HEAD^1')
  const head = tryGit('rev-parse', '--verify', '--quiet', 'HEAD^2')
  if (base === undefined || head === undefined) return undefined
  const messages = git('log', '--reverse', '--format=%B%x00', `${base}..${head}`).split('\0')
  const message = squashMessage(title, number, messages)
  const commit = execFileSync(
    'git',
    [
      '-c',
      `user.name=${BOT.name}`,
      '-c',
      `user.email=${BOT.email}`,
      'commit-tree',
      'HEAD^{tree}',
      '-p',
      base,
      '-F',
      '-',
    ],
    { cwd: root, encoding: 'utf8', input: message, stdio: ['pipe', 'pipe', 'inherit'] },
  ).trim()
  git('checkout', '--quiet', '--detach', commit)
  return message
}

const preview = async (): Promise<Preview> => {
  const title = process.env['PR_TITLE'] ?? ''
  const number = Number(process.env['PR_NUMBER'] ?? '')
  const message =
    process.env['GITHUB_ACTIONS'] === 'true' && title.trim() !== '' && Number.isInteger(number) && number > 0
      ? squash(title, number)
      : undefined

  const nxJson = JSON.parse(readFileSync(join(root, 'nx.json'), 'utf8')) as {
    readonly release?: { readonly conventionalCommits?: { readonly types?: CommitTypes } }
  }
  const types = nxJson.release?.conventionalCommits?.types ?? {}

  const firstRelease = isFirstRelease(git('tag', '--list', 'v*').split('\n'))
  const { workspaceVersion, projectsVersionData, releaseGraph } = await releaseVersion({
    ...(firstRelease ? { specifier: FIRST_RELEASE } : {}),
    firstRelease,
    dryRun: true,
    verbose: false,
    gitCommit: false,
    gitTag: false,
    stageChanges: false,
  })
  const version = workspaceVersion ?? undefined
  const current = firstRelease ? undefined : Object.values(projectsVersionData)[0]?.currentVersion

  let notes = ''
  if (version !== undefined) {
    // As in release.ts: the first release's notes start at the newest tag of any kind.
    const from = firstRelease ? tryGit('describe', '--tags', '--abbrev=0', 'HEAD') : undefined
    const { workspaceChangelog } = await releaseChangelog({
      version,
      versionData: projectsVersionData,
      releaseGraph,
      firstRelease,
      ...(from === undefined ? {} : { from }),
      dryRun: true,
      verbose: false,
      gitCommit: false,
      gitTag: false,
      stageChanges: false,
      gitPush: false,
      createRelease: false,
    })
    notes = workspaceChangelog?.contents ?? ''
  }

  const commit = message?.split('\n')[0]
  return {
    version,
    current,
    firstRelease,
    commit,
    bump: message === undefined ? undefined : bumpOf(message, types),
    notes,
  }
}

try {
  const result = await preview()
  publish(renderPreview(result), renderPreview(result, COMMENT_NOTES))
} catch (error) {
  const reason = (error instanceof Error ? error.message : String(error)).split('\n')[0] ?? 'unknown error'
  console.log(`::warning title=Release preview::${escapeData(`The release preview could not be made: ${reason}`)}`)
  const report = renderFailure(reason)
  publish(report, report)
}
