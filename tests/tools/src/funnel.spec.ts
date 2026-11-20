/**
 * @file tests/tools/src/funnel.spec.ts
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

import { beforeAll, describe, expect, it } from '@effect/vitest'
import { ESLint } from 'eslint'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import {
  closeSync,
  fstatSync,
  futimesSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const eslint = new ESLint({ cwd: root })

/** Run the real discovered project config, not a second copy of the selectors. */
const violations = async (code: string, filePath = 'packages/conditions/src/funnel-probe.ts') => {
  const results = await eslint.lintText(code, { filePath })
  return results.flatMap((result) => result.messages.filter((message) => message.ruleId?.startsWith('no-restricted-')))
}

describe('production funnel lint', () => {
  beforeAll(async () => {
    // Load the real Nx/TypeScript config once as setup, not inside the first rule assertion's time budget.
    await eslint.calculateConfigForFile('packages/conditions/src/funnel-probe.ts')
  })

  it.each([
    ['export const run = async () => 1', 'Effect.gen'],
    ['await work()', 'Effect.gen'],
    ['new Promise(resolve => resolve(1))', 'Effect.tryPromise'],
    ['try { parse() } catch { fallback() }', 'Either.try'],
    ['setTimeout(work, 0)', 'Effect.yieldNow'],
    ['globalThis.setInterval(work, 100)', 'Schedule'],
    ["import { setTimeout as delay } from 'node:timers/promises'; delay(0)", 'Effect.sleep'],
    ["import { Octokit } from '@octokit/rest'; new Octokit()", '@resnovas/integrations.github'],
    ["export { PostHog } from 'posthog-node'", '@resnovas/integrations.posthog'],
  ])('rejects %s with a corrective message', async (code, correction) => {
    const messages = await violations(code)
    expect(messages.some((message) => message.message.includes(correction))).toBe(true)
  })

  it('keeps production restrictions active through app and package configs', async () => {
    expect(await violations('setTimeout(work, 0)', 'apps/action/src/funnel-probe.ts')).toHaveLength(1)
    expect(await violations('setTimeout(work, 0)', 'packages/runtime/src/funnel-probe.ts')).toHaveLength(1)
  })

  it('allows Effect composition, explicit parse outcomes and unrelated method names', async () => {
    expect(
      await violations(`import { Effect, Either } from 'effect'
      export const pause = Effect.sleep('1 second')
      export const valid = Either.isRight(Either.try(() => new URL('https://example.com')))
      export const label = 'async await setTimeout'
    `),
    ).toEqual([])
  })

  it('leaves SDK callbacks, tests and repository tooling outside production restrictions', async () => {
    for (const filePath of [
      'packages/integrations.github/src/funnel-probe.ts',
      'packages/integrations.posthog/src/funnel-probe.ts',
      'tests/conditions/src/funnel-probe.ts',
      'tools/funnel-probe.ts',
    ]) {
      expect(await violations('export const run = async () => 1', filePath)).toEqual([])
    }
  })
})

describe('funnel pre-commit', () => {
  it('preserves hooks and rejects snapshots or failed checks without running later phases', () => {
    const scratch = join(root, '.amp/in/orb-backup')
    mkdirSync(scratch, { recursive: true })
    const cwd = mkdtempSync(join(scratch, 'funnel-hook-'))
    // A real repository exercises Git's index/worktree contract without touching this checkout.
    // Git exports index/worktree locations inside hooks; never inherit those into the fixture.
    const env = { ...process.env }
    const localEnv = spawnSync('git', ['rev-parse', '--local-env-vars'], { cwd: root, encoding: 'utf8' })
    expect(localEnv.status, localEnv.stderr).toBe(0)
    for (const name of localEnv.stdout.trim().split('\n')) delete env[name]
    const git = (...args: string[]) => {
      const result = spawnSync('git', args, { cwd, env, encoding: 'utf8' })
      expect(result.status, result.stderr).toBe(0)
      return result.stdout.trim()
    }
    const run = (...args: string[]) =>
      spawnSync(process.execPath, [join(root, 'tools/dev/funnel.ts'), ...args], { cwd, env, encoding: 'utf8' })
    git('init', '--quiet')
    git('config', 'core.hooksPath', '.git/hooks')
    const hookPath = join(cwd, '.git/hooks/pre-commit')
    expect(run('--install').status).toBe(0)
    // Reinstallation must not rewrite a hook another process could replace after validation.
    const installedAt = new Date('2001-01-01T00:00:00Z')
    // Keep metadata operations on the same file instead of checking and reopening its path.
    const hookFile = openSync(hookPath, 'r+')
    try {
      futimesSync(hookFile, installedAt, installedAt)
      expect(run('--install').status).toBe(0)
      expect(fstatSync(hookFile).mtimeMs).toBe(installedAt.getTime())
    } finally {
      closeSync(hookFile)
    }
    const installedHook = readFileSync(hookPath, 'utf8')
    expect(installedHook).toContain('exec node --run funnel:pre-commit')
    writeFileSync(hookPath, '#!/bin/sh\necho existing-hook\n')
    expect(run('--install').status).toBe(1)
    expect(readFileSync(hookPath, 'utf8')).toBe('#!/bin/sh\necho existing-hook\n')
    writeFileSync(hookPath, installedHook)

    const manifest = (staticExit: number) =>
      JSON.stringify({
        scripts: {
          'funnel:pre-commit': `"${process.execPath}" "${join(root, 'tools/dev/funnel.ts')}"`,
          'funnel:static': `node -e "console.log('static-sentinel'); process.exit(${staticExit})"`,
          'funnel:verify': 'node -e "console.log(\'verify-sentinel\')"',
        },
      })
    writeFileSync(join(cwd, 'package.json'), manifest(0))
    expect(run().stderr).toContain('Untracked files')
    git('add', 'package.json')
    writeFileSync(join(cwd, 'package.json'), manifest(1))
    expect(run().stderr).toContain('Unstaged tracked changes')
    git('add', 'package.json')
    const failed = run()
    expect(failed.status).toBe(1)
    expect(failed.stdout).toContain('static-sentinel')
    expect(failed.stdout).not.toContain('verify-sentinel')
    writeFileSync(join(cwd, 'package.json'), manifest(0))
    git('add', 'package.json')
    const passed = run()
    expect(passed.status, passed.stderr).toBe(0)
    expect(passed.stdout).toContain('verify-sentinel')
    expect(passed.stdout).toContain('passed for the staged tree')
    const commit = spawnSync(
      'git',
      [
        '-c',
        'user.name=Funnel fixture',
        '-c',
        'user.email=fixture@example.invalid',
        '-c',
        'commit.gpgsign=false',
        'commit',
        '-m',
        'test: exercise the installed hook',
      ],
      { cwd, env, encoding: 'utf8' },
    )
    expect(commit.status, commit.stderr).toBe(0)
    expect(commit.stderr).toContain('passed for the staged tree')
  })
})
