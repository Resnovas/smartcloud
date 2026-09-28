// Synced from Resnovas/.github templates/tools/release/release.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Cuts a release with Nx release.
//
//   node tools/release/release.ts [--dry-run] [--specifier <version or bump>] [--first-release]
//
// Run by the house release workflow on a checkout of the default branch with
// full history and tags. Nx works out the next version from the conventional
// commits since the last v* tag (or takes --specifier) and writes it to the
// released projects' package.json files. This script then builds the bundles
// release.config.json lists and records the result in a release commit that
// is never on a branch: its parent is the branch head, it adds the bundles and
// the bumped versions, and it drops the paths dropFromReleaseCommit names
// (vendored source a released tree does not need, for example). Each bundle's
// source map is uploaded for error tracking (tools/release/sourcemaps.ts) and
// never committed. Only the v<version> tag is pushed, so the branch never
// carries a release commit or a bundle, and branch protection is never
// bypassed. The release notes go to a draft GitHub release on that tag, which
// the workflow publishes once the SBOMs are attached, and with majorTag the
// v<major> tag moves to it. Nx also writes the notes to CHANGELOG.md and to
// each app's CHANGELOG.md, which this script formats; they are left in the
// working tree for the workflow's changelogs job, which opens a pull request
// to bring them to the default branch.
//
// The first release has no v* tag to count from, so it takes an explicit
// specifier and --first-release; its notes start at the newest earlier tag.
//
// With --dry-run nothing is written, committed, pushed or published: Nx prints
// the version, the release notes it would use and the changes it would make to
// each changelog file. Runs on Node's built-in TypeScript support.

import { releaseChangelog, releaseVersion } from 'nx/release'
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { changedChangelogs } from './changelogs.ts'
import { loadReleaseConfig } from './config.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const config = loadReleaseConfig(root)
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
  console.error('The working tree has uncommitted changes; release from a clean checkout of the default branch.')
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

// Build each bundle from this commit's source, with the new versions on disk,
// then hand its source map to error tracking and drop it: the tag ships the
// bundle only. A dry run uploads nothing.
const { POSTHOG_CLI_API_KEY: _key, ...withoutKey } = process.env
for (const bundle of config.bundles) nx('run', bundle.target, '--output-style=static')
if (config.bundles.length > 0) {
  execFileSync(
    process.execPath,
    [join(root, 'tools/release/sourcemaps.ts'), workspaceVersion, ...config.bundles.map((bundle) => bundle.output)],
    { cwd: root, stdio: 'inherit', env: dryRun ? withoutKey : process.env },
  )
}

// The first release has no v* tag, so its notes start at the newest tag of any
// kind rather than at the first commit.
const from = firstRelease ? tryGit('describe', '--tags', '--abbrev=0', 'HEAD') : undefined

const outputs = config.bundles.map((bundle) => bundle.output)
if (dryRun) {
  console.log(
    `Dry run: would commit ${[...outputs, 'the new versions'].join(', ')}${config.dropFromReleaseCommit.length > 0 ? `, drop ${config.dropFromReleaseCommit.join(', ')}` : ''}, tag ${tag}${config.majorTag ? ` and move ${major}` : ''}.`,
  )
} else {
  git('checkout', '--quiet', '--detach')
  git('add', '--update')
  for (const path of outputs) git('add', '--force', path)
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
// is already pushed.
if (dryRun) {
  console.log(`Dry run: would write the notes above to a draft GitHub release for ${tag}.`)
} else {
  // The runner's own temporary directory, or a fresh private one.
  const notesFile = join(
    process.env['RUNNER_TEMP'] ?? mkdtempSync(join(tmpdir(), `${config.name}-release-`)),
    'release-notes.md',
  )
  writeFileSync(notesFile, notes)
  output('notes', notesFile)
}

if (!dryRun && config.majorTag) {
  // Workflows pin a GitHub Action by its major tag.
  git('tag', '--force', major, `${tag}^{commit}`)
  git('push', '--quiet', '--force', 'origin', `refs/tags/${major}`)
}

output('released', dryRun ? 'false' : 'true')
output('version', workspaceVersion)
output('tag', tag)
// The branch commit the release was cut from, which the changelog pull request branches from.
output('base', base)

// The changelog files go to the default branch through a pull request, which
// the format check runs on. The release is already out, so a failure here
// only warns: the pull request's own checks then show what to fix.
if (!dryRun) {
  const changelogs = changedChangelogs(git('ls-files', '--modified', '--others', '--exclude-standard'))
  const prettier = join(root, 'node_modules', '.bin', 'prettier')
  try {
    if (changelogs.length > 0 && existsSync(prettier)) {
      execFileSync(prettier, ['--write', ...changelogs], { cwd: root, stdio: 'inherit' })
    }
  } catch {
    console.warn(`::warning::Prettier could not format ${changelogs.join(', ')}.`)
  }
}
console.log(dryRun ? `Dry run of ${tag} complete.` : `Released ${tag}.`)
