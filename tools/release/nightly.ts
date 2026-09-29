// Synced from Resnovas/.github templates/tools/release/nightly.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Cuts a nightly pre-release.
//
//   node tools/release/nightly.ts [--dry-run]
//
// Run by the house nightly workflow on a checkout of the default branch with
// full history and tags, in a repository whose release.config.json has a
// nightly section (elsewhere it says so and does nothing). It skips a night
// when the branch has not moved since the last nightly. Otherwise it names
// the version (tools/release/nightly-version.ts), stamps it into the apps'
// package.json files, builds the bundles and records the result the way
// tools/release/release.ts does: a release commit on no branch, with the
// bundles and without the dropped paths, reachable only from the v<version>
// tag. It creates a GitHub pre-release on that tag with generated notes, and
// with majorTag moves v<major> to it while the major has no stable release,
// so workflows pinned to v<major> run the newest nightly until the first
// stable release. Nothing is published to npm and no changelog is written.
//
// A run that finds a nightly already cut from the branch head finishes
// whatever that one left undone (the pre-release, the major tag) instead of
// cutting another. With --dry-run it only prints the version and what it
// would do, before writing or building anything. Runs on Node's built-in
// TypeScript support.

import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { loadReleaseConfig } from './config.ts'
import { nightlyTakesMajor, nightlyVersion } from './nightly-version.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const config = loadReleaseConfig(root)
const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } })
const dryRun = values['dry-run']

// Hands values to later workflow steps; a no-op outside GitHub Actions.
const output = (name: string, value: string) => {
  const file = process.env['GITHUB_OUTPUT']
  if (file !== undefined && file !== '') appendFileSync(file, `${name}=${value}\n`)
}

if (config.nightly === undefined) {
  console.log('release.config.json has no nightly section, so this repository cuts no nightlies.')
  output('released', 'false')
  process.exit(0)
}
// The major version the nightlies preview.
const MAJOR = config.nightly.major

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

if (!dryRun && git('status', '--porcelain', '--untracked-files=no') !== '') {
  console.error('The working tree has uncommitted changes; cut a nightly from a clean checkout of the default branch.')
  process.exit(1)
}
const head = git('rev-parse', 'HEAD')
const tags = git('tag', '--list', 'v*')
  .split('\n')
  .filter((tag) => tag !== '')

// Every release commit, nightly or stable, has the branch commit it was cut
// from as its parent. A night with nothing new since the last one cuts
// nothing, and neither does a commit a stable release was already cut from.
// A tag on a root commit, or on no commit, was not cut from the branch.
const cutFrom = (tag: string) => tryGit('rev-parse', '--verify', '--quiet', `${tag}^{commit}^`)
const nightlies = git('tag', '--list', `v${MAJOR}.*-nightly.*`, '--sort=-creatordate')
  .split('\n')
  .filter((tag) => tag !== '')
const major = `v${MAJOR}`
const takesMajor = config.majorTag && nightlyTakesMajor(tags, MAJOR)

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
    // A lightweight tag, as release.ts moves it, whatever the machine's tag signing.
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
    console.log(`${already} was already cut from ${head}; the branch has not changed since, so there is no nightly to cut.`)
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

for (const app of config.apps) {
  const path = join(root, app, 'package.json')
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  writeFileSync(path, `${JSON.stringify({ ...manifest, version }, null, 2)}\n`)
}

// Each bundle carries the version, and its source map goes to error tracking
// when the key is set (and is deleted either way), as for a release.
for (const bundle of config.bundles) run(join(root, 'node_modules', '.bin', 'nx'), 'run', bundle.target, '--output-style=static')
if (config.bundles.length > 0) {
  run(process.execPath, join(root, 'tools/release/sourcemaps.ts'), version, ...config.bundles.map((bundle) => bundle.output))
}

git('checkout', '--quiet', '--detach')
git('add', '--update')
for (const bundle of config.bundles) git('add', '--force', bundle.output)
for (const path of config.dropFromReleaseCommit) git('rm', '-r', '--cached', '--ignore-unmatch', '--quiet', path)
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
