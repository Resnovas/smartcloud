/**
 * @file tools/release/nightly.ts
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

// Cuts a nightly pre-release of smartcloud.
//
//   node tools/release/nightly.ts [--dry-run]
//
// Run by .github/workflows/nightly.yml on a checkout of main with full history
// and tags. It skips a night when main has not moved since the last nightly.
// Otherwise it names the version (tools/release/nightly-version.ts), stamps it
// into the apps' package.json files, bundles the action and records the result
// the way tools/release/release.ts does: a release commit on no branch, with
// dist/index.js and without externals/, reachable only from the
// v<version> tag. It creates a GitHub pre-release on that tag with generated
// notes, and moves v<major> to it while the major has no stable release, so
// workflows pinned to v<major> run the newest nightly until the first stable
// release. Nothing is published to npm and no changelog is written.
//
// A run that finds a nightly already cut from main's head finishes whatever
// that one left undone (the pre-release, the major tag) instead of cutting
// another. With --dry-run it only prints the version and what it would do,
// before writing or building anything. Runs on Node's built-in TypeScript
// support.

import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { nightlyTakesMajor, nightlyVersion } from './nightly-version.ts'

// The major version the nightlies preview.
const MAJOR = 2
const APPS = ['apps/action', 'apps/cli', 'apps/mcp']

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } })
const dryRun = values['dry-run']

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
const run = (command: string, ...args: string[]) => execFileSync(command, args, { cwd: root, stdio: 'inherit' })

// Hands values to later workflow steps; a no-op outside GitHub Actions.
const output = (name: string, value: string) => {
  const file = process.env['GITHUB_OUTPUT']
  if (file !== undefined && file !== '') appendFileSync(file, `${name}=${value}\n`)
}

if (!dryRun && git('status', '--porcelain', '--untracked-files=no') !== '') {
  console.error('The working tree has uncommitted changes; cut a nightly from a clean checkout of main.')
  process.exit(1)
}
const head = git('rev-parse', 'HEAD')
const tags = git('tag', '--list', 'v*')
  .split('\n')
  .filter((tag) => tag !== '')

// Every release commit, nightly or stable, has the main commit it was cut from
// as its parent. A night with nothing new on main since the last one cuts
// nothing, and neither does a commit a stable release was already cut from.
// A tag on a root commit, or on no commit, was not cut from main.
const cutFrom = (tag: string) => tryGit('rev-parse', '--verify', '--quiet', `${tag}^{commit}^`)
const nightlies = git('tag', '--list', `v${MAJOR}.*-nightly.*`, '--sort=-creatordate')
  .split('\n')
  .filter((tag) => tag !== '')
const major = `v${MAJOR}`
const takesMajor = nightlyTakesMajor(tags, MAJOR)

const tryRun = (command: string, ...args: string[]): boolean => {
  try {
    execFileSync(command, args, { cwd: root, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Creates the pre-release and moves the major tag, skipping whichever is
// already done, so a run that failed after pushing the version tag is finished
// by the next one rather than skipped.
const publish = (tag: string) => {
  const previous = nightlies.find((nightly) => nightly !== tag)
  if (tryRun('gh', 'release', 'view', tag)) {
    console.log(`The ${tag} pre-release exists.`)
  } else {
    run(
      'gh',
      'release',
      'create',
      tag,
      '--prerelease',
      '--latest=false',
      '--verify-tag',
      '--title',
      `${tag} (nightly)`,
      '--generate-notes',
      ...(previous === undefined ? [] : ['--notes-start-tag', previous]),
    )
  }
  if (takesMajor && tryGit('rev-parse', `${major}^{commit}`) !== git('rev-parse', `${tag}^{commit}`)) {
    // Workflows pin the action by its major tag. A lightweight tag, as
    // release.ts moves it, whatever the machine's tag signing.
    git('-c', 'tag.gpgSign=false', 'tag', '--force', major, `${tag}^{commit}`)
    git('push', '--quiet', '--force', 'origin', `refs/tags/${major}`)
    console.log(`Moved ${major} to ${tag}.`)
  }
}

// Version tags only: a bare major tag points at one of them.
const already = tags.filter((tag) => /^v\d+\.\d+\.\d+/.test(tag)).find((tag) => cutFrom(tag) === head)
if (already !== undefined) {
  if (nightlies.includes(already) && !dryRun) {
    console.log(`${already} was already cut from ${head}; finishing whatever it left undone.`)
    publish(already)
  } else {
    console.log(`${already} was already cut from ${head}; main has not changed since, so there is no nightly to cut.`)
  }
  output('released', 'false')
  process.exit(0)
}

const version = nightlyVersion(tags, MAJOR, new Date())
const tag = `v${version}`

// A dry run reports the plan before anything is written or built.
if (dryRun) {
  console.log(
    `Dry run: would tag ${tag} on a release commit of ${head}, create a pre-release${takesMajor ? ` and move ${major}` : ''}.`,
  )
  output('released', 'false')
  process.exit(0)
}

for (const app of APPS) {
  const path = join(root, app, 'package.json')
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  writeFileSync(path, `${JSON.stringify({ ...manifest, version }, null, 2)}\n`)
}

// The bundle carries the version, and its source map goes to PostHog when the
// key is set (and is deleted either way), as for a release.
run(join(root, 'node_modules', '.bin', 'nx'), 'run', '@resnovas/action:bundle', '--output-style=static')
run(process.execPath, join(root, 'tools/release/sourcemaps.ts'), version, 'dist/index.js')

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
git('push', '--quiet', 'origin', `refs/tags/${tag}`)
publish(tag)

output('released', 'true')
output('tag', tag)
console.log(`Cut ${tag}.`)
