// Synced from Resnovas/.github templates/tools/release/release-preview.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Previews the release a pull request would lead to.
//
//   node tools/release/release-preview.ts
//
// Run by the house release preview workflow on a pull request's merge
// commit, checked out with full history and tags. It replaces that merge
// commit with the squash commit the merge queue would land (the pull request's
// title and number over its commits' messages, tools/release/preview.ts), then
// asks Nx release, in dry-run mode, for the next version and its notes, as
// tools/release/release.ts would work them out. Nx applies no version or
// changelog changes; no bundles are built and no tags are created or pushed.
// The synthetic squash commit and checkout still change local Git state on
// CI. The report goes to stdout and appends the job summary and `report`
// output files when configured; the comment job posts it on the pull request.
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
import { loadReleaseConfig } from './config.ts'

// A pull request comment holds at most 65,536 characters; the notes leave room for the rest.
const COMMENT_NOTES = 60_000
const BOT = { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' }

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
// The version the first stable release takes, from release.config.json.
const FIRST_RELEASE = loadReleaseConfig(root).firstRelease
/** Execute required Git reads or temporary checkout mutations in the repository root, propagating failures. */
const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
/** Probe optional parents or tags; command failures become an absent result for preview fallback logic. */
const tryGit = (...args: string[]): string | undefined => {
  // Missing merge parents or earlier tags are valid preview states, unlike required Git operations.
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return undefined
  }
}

// Workflow command escaping, as in @actions/core.
/** Escape warning text so a preview error cannot introduce another workflow command. */
const escapeData = (text: string) => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')

// Hands the full report to the job summary, and the comment's copy to the
// comment job; no-ops outside GitHub Actions.
/** Print the full report and optionally append summary/output files; use a unique delimiter for multiline comment output. */
const publish = (report: string, comment: string) => {
  // The comment may contain arbitrary release-note lines, so a fresh delimiter avoids ordinary content collisions.
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
/** Replace a merge checkout with a synthetic squash commit on the same tree, or decline when either parent is missing. */
const squash = (title: string, number: number): string | undefined => {
  // Keep the merged tree but change history shape so Nx sees the conventional title the queue would actually land.
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

/** Compute Nx version and notes in dry-run mode, synthesizing squash history only in an explicitly identified CI PR checkout. */
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
