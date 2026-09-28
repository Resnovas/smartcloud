/**
 * @file tools/release/release.ts
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

// Cuts a smartcloud release with Nx release.
//
//   node tools/release/release.ts [--dry-run] [--specifier <version or bump>] [--first-release]
//
// Run by .github/workflows/release.yml on a checkout of main with full history
// and tags. Nx works out the next version from the conventional commits since
// the last v* tag (or takes --specifier) and writes it to the apps' package.json
// files. This script then bundles the action and records the result in a
// release commit that is never on a branch: its parent is main's head, it adds
// dist/index.js and the bumped versions, and it drops externals/, which the
// action does not need and every run of the action would otherwise download.
// The bundle's source map is uploaded to PostHog error tracking for the
// release (tools/release/sourcemaps.ts) and never committed.
// Only the v<version> tag is pushed, so main never carries a release commit or
// the bundle, and branch protection is never bypassed. The release notes go to
// a draft GitHub release on that tag, which the workflow publishes once the
// SBOMs are attached, and the v<major> tag moves to it. Nx also writes the notes to CHANGELOG.md and to each app's CHANGELOG.md,
// which this script formats; they are left in the working tree for the
// workflow's changelogs job, which opens a pull request to bring them to main.
// Publishing to npm is a separate job that builds from the tag.
//
// The first release has no v* tag to count from, so it takes an explicit
// specifier and --first-release; its notes start at the newest earlier tag.
//
// With --dry-run nothing is written, committed, pushed or published: Nx prints
// the version, the release notes it would use and the changes it would make to
// each changelog file. Runs on Node's built-in TypeScript support.

import { releaseChangelog, releaseVersion } from 'nx/release'
import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { changedChangelogs } from './changelogs.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'first-release': { type: 'boolean', default: false },
    specifier: { type: 'string' },
    verbose: { type: 'boolean', default: false },
  },
})
const dryRun = values['dry-run']
const firstRelease = values['first-release']
const verbose = values.verbose
const specifier = values.specifier === undefined || values.specifier.trim() === '' ? undefined : values.specifier.trim()

// The release commit is authored and signed off by the Actions bot, for the DCO check.
const BOT = { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' }

const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
const tryGit = (...args: string[]): string | undefined => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return undefined
  }
}
const nx = (...args: string[]) =>
  execFileSync(join(root, 'node_modules', '.bin', 'nx'), args, { cwd: root, stdio: 'inherit' })

// Hands values to later workflow steps; a no-op outside GitHub Actions.
const output = (name: string, value: string) => {
  const file = process.env['GITHUB_OUTPUT']
  if (file !== undefined && file !== '') appendFileSync(file, `${name}=${value}\n`)
}

if (!dryRun && git('status', '--porcelain', '--untracked-files=no') !== '') {
  console.error('The working tree has uncommitted changes; release from a clean checkout of main.')
  process.exit(1)
}
const base = git('rev-parse', 'HEAD')

const { workspaceVersion, projectsVersionData, releaseGraph } = await releaseVersion({
  ...(specifier === undefined ? {} : { specifier }),
  firstRelease,
  dryRun,
  verbose,
  gitCommit: false,
  gitTag: false,
  stageChanges: false,
})

if (workspaceVersion === undefined || workspaceVersion === null) {
  console.log('No commits since the last release call for a new version, so there is nothing to release.')
  output('released', 'false')
  process.exit(0)
}

const tag = `v${workspaceVersion}`
const major = `v${workspaceVersion.split('.')[0]}`
if (tryGit('rev-parse', '--quiet', '--verify', `refs/tags/${tag}`) !== undefined) {
  console.error(`${tag} already exists.`)
  process.exit(1)
}

// Build the action bundle from this commit's source, with the new versions on disk.
nx('run', '@resnovas/action:bundle', '--output-style=static')

// Upload its source map to PostHog error tracking for this version, and drop
// it: the tag ships the bundle only. A dry run uploads nothing.
const { POSTHOG_CLI_API_KEY: _key, ...withoutKey } = process.env
execFileSync(process.execPath, [join(root, 'tools/release/sourcemaps.ts'), workspaceVersion, 'dist/index.js'], {
  cwd: root,
  stdio: 'inherit',
  env: dryRun ? withoutKey : process.env,
})

// The first release has no v* tag, so its notes start at the newest tag of any
// kind (for v2, the last v1 prerelease) rather than at the first commit.
const from = firstRelease ? tryGit('describe', '--tags', '--abbrev=0', 'HEAD') : undefined

if (dryRun) {
  console.log(
    `Dry run: would commit dist/index.js and the new versions, drop externals/, tag ${tag} and move ${major}.`,
  )
} else {
  git('checkout', '--quiet', '--detach')
  git('add', '--update')
  git('add', '--force', 'dist/index.js')
  git('rm', '-r', '--cached', '--ignore-unmatch', '--quiet', 'externals')
  git(
    '-c',
    `user.name=${BOT.name}`,
    '-c',
    `user.email=${BOT.email}`,
    'commit',
    '--quiet',
    '--signoff',
    '--message',
    `chore(release): ${tag}`,
  )
  git('-c', `user.name=${BOT.name}`, '-c', `user.email=${BOT.email}`, 'tag', '--annotate', tag, '--message', tag)
  // Only the tag: the release commit is reachable from it and from no branch.
  git('push', '--quiet', 'origin', `refs/tags/${tag}`)
}

// Notes run from the previous tag to HEAD, the release commit; chore(release) is hidden.
// Nx writes the changelog files but not the GitHub release: it would publish
// the release at once, and house repositories lock a published release's
// assets (immutable releases), so the workflow could no longer attach the
// SBOMs. The workflow creates it as a draft instead, from the notes below.
const { workspaceChangelog } = await releaseChangelog({
  version: workspaceVersion,
  versionData: projectsVersionData,
  releaseGraph,
  firstRelease,
  ...(from === undefined ? {} : { from }),
  dryRun,
  verbose,
  gitCommit: false,
  gitTag: false,
  stageChanges: false,
  gitPush: false,
  createRelease: false,
})
const notes = workspaceChangelog?.contents ?? ''

// The notes go to a draft GitHub release on the tag, which the workflow's
// draft-release job creates from this file: kept out of this script, so a
// failed GitHub request is retried by re-running that job alone, after the tag
// is already pushed. The attest job attaches the SBOMs to the draft, and the
// last job publishes it.
if (dryRun) {
  console.log(`Dry run: would write the notes above to a draft GitHub release for ${tag}.`)
} else {
  // The runner's own temporary directory, or a fresh private one.
  const notesFile = join(
    process.env['RUNNER_TEMP'] ?? mkdtempSync(join(tmpdir(), 'smartcloud-release-')),
    'release-notes.md',
  )
  writeFileSync(notesFile, notes)
  output('notes', notesFile)
}

if (!dryRun) {
  // Workflows pin the action by its major tag.
  git('tag', '--force', major, `${tag}^{commit}`)
  git('push', '--quiet', '--force', 'origin', `refs/tags/${major}`)
}

output('released', dryRun ? 'false' : 'true')
output('version', workspaceVersion)
output('tag', tag)
// The main commit the release was cut from, which the changelog pull request branches from.
output('base', base)

// The changelog files go to main through a pull request, which the format
// check runs on. The release is already out, so a failure here only warns: the
// pull request's own checks then show what to fix.
if (!dryRun) {
  const changelogs = changedChangelogs(git('ls-files', '--modified', '--others', '--exclude-standard'))
  try {
    if (changelogs.length > 0) {
      execFileSync(join(root, 'node_modules', '.bin', 'prettier'), ['--write', ...changelogs], {
        cwd: root,
        stdio: 'inherit',
      })
    }
  } catch {
    console.warn(`::warning::Prettier could not format ${changelogs.join(', ')}.`)
  }
}
console.log(dryRun ? `Dry run of ${tag} complete.` : `Released ${tag}.`)
