/**
 * @file tools/release/release.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
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
// Only the v<version> tag is pushed, so main never carries a release commit or
// the bundle, and branch protection is never bypassed. Nx then writes the
// release notes to a GitHub release on that tag, and the v<major> tag moves to
// it. Publishing to npm is a separate job that builds from the tag.
//
// The first release has no v* tag to count from, so it takes an explicit
// specifier and --first-release; its notes start at the newest earlier tag.
//
// With --dry-run nothing is written, committed, pushed or published: Nx prints
// the version and the release notes it would use. Runs on Node's built-in
// TypeScript support.

import { releaseChangelog, releaseVersion } from 'nx/release'
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'

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
await releaseChangelog({
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
})

if (!dryRun) {
  // Workflows pin the action by its major tag.
  git('tag', '--force', major, `${tag}^{commit}`)
  git('push', '--quiet', '--force', 'origin', `refs/tags/${major}`)
}

output('released', dryRun ? 'false' : 'true')
output('version', workspaceVersion)
output('tag', tag)
console.log(dryRun ? `Dry run of ${tag} complete.` : `Released ${tag}.`)
