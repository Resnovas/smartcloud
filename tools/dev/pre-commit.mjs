// Synced from Resnovas/.github templates/tools/dev/pre-commit.mjs. Edit it there.
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const hook = '#!/bin/sh\n# house:pre-commit\nexec node "$(git rev-parse --show-toplevel)/tools/dev/pre-commit.mjs" run\n'

/** Install only into an empty hook slot; foreign hooks require explicit composition. */
export function installPreCommit(root, dryRun = false, native = undefined) {
  let expected = hook
  if (native !== undefined) {
    if (!native || typeof native !== 'object' || Object.keys(native).sort().join(',') !== 'marker,script' ||
        typeof native.script !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9:_-]*$/.test(native.script) ||
        typeof native.marker !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9 :_-]*$/.test(native.marker)) {
      throw new Error('preCommit must contain only a package script name and a single-line marker; keep the native runner in repository code.')
    }
    const scripts = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).scripts
    for (const name of [native.script, 'verify:static', 'test:affected']) {
      if (typeof scripts?.[name] !== 'string' || !scripts[name].trim()) throw new Error(`Define package script ${name} before composing preCommit; the native runner must execute static checks and staged affected tests only.`)
    }
    expected = `#!/bin/sh\n# ${native.marker}\nexec node --run ${native.script}\n`
  }
  const hooks = execFileSync('git', ['rev-parse', '--git-path', 'hooks'], { cwd: root, encoding: 'utf8' }).trim()
  const path = resolve(root, hooks, 'pre-commit')
  if (!dryRun) {
    mkdirSync(dirname(path), { recursive: true })
    try {
      // Exclusive creation never overwrites a hook installed concurrently after inspection.
      writeFileSync(path, expected, { flag: 'wx', mode: 0o755 })
      return 'Pre-commit hook: installed.'
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
  }
  try {
    if (readFileSync(path, 'utf8') !== expected) throw new Error('Preserve the existing pre-commit hook. Declare its reviewed package runner and marker in .agents/surfaces.jsonc preCommit, or review and replace it explicitly; setup will not overwrite it.')
    return 'Pre-commit hook: already installed.'
  } catch (error) {
    if (dryRun && error.code === 'ENOENT') return 'Pre-commit hook: would install.'
    throw error
  }
}

/** Check the staged snapshot with static checks and affected tests; full verification belongs in CI. */
export function runPreCommit(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })
  const assertSnapshot = () => {
    if (git('diff', '--name-only').trim() || git('ls-files', '--others', '--exclude-standard').trim()) {
      throw new Error('Verification must match the commit. Stage or preserve unstaged/untracked work before committing; do not auto-stash or certify a different working tree.')
    }
  }
  assertSnapshot()
  const index = git('write-tree').trim()
  const scripts = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).scripts
  for (const name of ['verify:static', 'test:affected']) {
    if (!scripts?.[name]) throw new Error(`Define package script ${name} for static checks or staged affected tests only; keep full verification, smoke and evidence in CI. Do not substitute an empty success.`)
    const result = spawnSync(process.execPath, ['--run', name], { cwd: root, stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`${name} failed. Fix the reported path; do not skip checks or weaken coverage.`)
    assertSnapshot()
    if (git('write-tree').trim() !== index) throw new Error('The staged tree changed during verification. Review it and rerun the commit.')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv[2] !== 'run') throw new Error('Usage: node tools/dev/pre-commit.mjs run')
    runPreCommit(process.cwd())
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
