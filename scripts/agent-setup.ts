/**
 * @file scripts/agent-setup.ts
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

// Prepares a clean machine, a cached snapshot or a resumed session to build,
// test and run the workspace. Every editor, Orca, Codex, Cursor, Claude Code
// and Copilot surface calls this one script, so it must stay idempotent,
// non-interactive and cross-platform.
//
//   node scripts/agent-setup.ts              check Node, provide pnpm, install, sync, build, smoke test
//   node scripts/agent-setup.ts --no-build   stop after install and nx sync
//
// The launchers scripts/agent-setup (POSIX shell) and scripts/agent-setup.cmd
// (Windows) check that Node can run this file first. Runs on Node's built-in
// TypeScript support, so it needs no build step.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const windows = process.platform === 'win32'
const build = !process.argv.includes('--no-build')

const log = (message: string) => console.log(`agent-setup: ${message}`)
const fail = (message: string): never => {
  console.error(`agent-setup: ${message}`)
  process.exit(1)
}

// Nx Cloud is not configured for this workspace; never let a run try to reach it.
const env = { ...process.env, NX_NO_CLOUD: 'true' }

const run = (command: string, args: ReadonlyArray<string>) =>
  spawnSync(command, args, { cwd: root, env, stdio: 'inherit', shell: windows })

const probe = (command: string, args: ReadonlyArray<string>) => {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    shell: windows,
  })
  return result.status === 0 ? result.stdout.trim() : undefined
}

const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  readonly packageManager: string
  readonly engines: { readonly node: string }
}

// 1. Node: the major version in .nvmrc is the minimum, as engines.node says.
const wanted = Number.parseInt(readFileSync(join(root, '.nvmrc'), 'utf8').trim(), 10)
const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)
if (major < wanted)
  fail(`Node ${wanted} or newer is required (engines.node ${manifest.engines.node}); found ${process.versions.node}.`)
log(`Node ${process.versions.node}`)

// 2. pnpm at the version packageManager pins. An installed pnpm switches itself
// to that version; otherwise corepack provides it, and npx is the last resort.
const pnpmVersion = manifest.packageManager.replace(/^pnpm@/, '').split('+')[0] ?? ''
const resolvePnpm = (): ReadonlyArray<string> => {
  if (probe('pnpm', ['--version']) !== undefined) return ['pnpm']
  if (probe('corepack', ['--version']) !== undefined) {
    if (run('corepack', ['enable', 'pnpm']).status === 0 && probe('pnpm', ['--version']) !== undefined) return ['pnpm']
    if (probe('corepack', ['pnpm', '--version']) !== undefined) return ['corepack', 'pnpm']
  }
  if (probe('npx', ['--version']) !== undefined) return ['npx', '--yes', `pnpm@${pnpmVersion}`]
  return fail(`pnpm ${pnpmVersion} is not installed and neither corepack nor npx can provide it.`)
}
const [pnpmCommand = 'pnpm', ...pnpmPrefix] = resolvePnpm()
const pnpm = (...args: ReadonlyArray<string>) => {
  const result = run(pnpmCommand, [...pnpmPrefix, ...args])
  if (result.status !== 0) fail(`\`pnpm ${args.join(' ')}\` failed (exit ${result.status ?? result.signal}).`)
}
log(`pnpm ${probe(pnpmCommand, [...pnpmPrefix, '--version']) ?? pnpmVersion}`)

// 3. Dependencies. The lockfile is never rewritten on a CI or cloud runner.
pnpm('install', ...(process.env['CI'] ? ['--frozen-lockfile'] : []))

// 4. Keep the TypeScript project references in line with the Nx project graph.
pnpm('nx', 'sync')

// 5. Build every project, then prove the CLI starts.
if (build) {
  pnpm('nx', 'run-many', '-t', 'build')
  pnpm('--silent', 'run', 'cli', '--version')
}

// 6. Register the repo's actions and agent prompts with Orca and OpenChamber,
// which keep them in per-user settings. Skipped on CI; never fails the setup.
if (!process.env['CI']) {
  const result = run(process.execPath, [join(root, 'tools/dev/surfaces.mjs'), 'install'])
  if (result.status !== 0)
    log('note: registering Orca and OpenChamber actions failed; run `node tools/dev/surfaces.mjs install`.')
}

// Secrets are never needed to set up; say where the optional one comes from.
if (!process.env['GITHUB_TOKEN']?.trim() && probe('gh', ['auth', 'token']) === undefined) {
  log('note: GITHUB_TOKEN is not set and `gh` is not signed in; commands that read GitHub need one of them.')
}

log('ok')
