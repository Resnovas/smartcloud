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
import { fileURLToPath, pathToFileURL } from 'node:url'
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
    await eslint.calculateConfigForFile('packages/feature.lock/src/funnel-probe.ts')
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

  it.each(['.', 'packages/feature.lock'])('enforces shared documentation contracts from cwd %s', async (cwd) => {
    const projectLint = new ESLint({ cwd: join(root, cwd) })
    const repositoryPath = 'packages/feature.lock/src/funnel-probe.ts'
    const filePath = join(root, repositoryPath)
    const undocumented = await projectLint.lintText('export const eligible = (age: number) => age > 30', { filePath })
    expect(
      undocumented.flatMap((result) => result.messages).some((message) => message.ruleId === 'jsdoc/require-jsdoc'),
    ).toBe(true)

    const declaration = `/**
 * Keep conversations open through the thirty-day grace period.
 *
 * @param age - Whole days since the conversation closed.
 * @returns Whether the grace period has elapsed.
 * @example eligible(31) // true
 */
export const eligible = (age: number) => age > 30`
    const header = readFileSync(join(root, 'tools/license/header.txt'), 'utf8')
      .replace('__FILE__', repositoryPath)
      .replace('__YEAR__', String(new Date().getFullYear()))
    const documentationMessages = async (code: string) =>
      (await projectLint.lintText(code, { filePath })).flatMap((result) =>
        result.messages.filter((message) => /^(jsdoc|house)\//.test(message.ruleId ?? '')),
      )
    expect(await documentationMessages(declaration)).toEqual([])
    expect(await documentationMessages(`${header}\n${declaration}`)).toEqual([])
    for (const noncanonical of [
      header.replace(repositoryPath, 'packages/feature.lock/src/other.ts'),
      header.replace(repositoryPath, 'src/funnel-probe.ts'),
      header.replace(`Copyright ${new Date().getFullYear()}`, `Copyright ${new Date().getFullYear() - 1}`),
    ]) {
      expect(
        (await documentationMessages(`${noncanonical}\n${declaration}`)).map((message) => message.ruleId),
      ).toContain('house/require-description')
    }
    expect(
      (
        await documentationMessages(`${header}\n${declaration.replace('Keep conversations', 'keep conversations')}`)
      ).map((message) => message.ruleId),
    ).toContain('house/match-description')
    expect(await violations('setTimeout(work, 0)', filePath)).toHaveLength(1)
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
  it.each([
    ['staged', 'static', 'Staged tree changed'],
    ['staged', 'verify', 'Staged tree changed'],
    ['worktree', 'static', 'Unstaged tracked changes'],
    ['worktree', 'verify', 'Unstaged tracked changes'],
    ['untracked', 'static', 'Untracked files'],
    ['untracked', 'verify', 'Untracked files'],
    ['isolated', 'verify', 'passed for the staged tree'],
  ])('checks %s state after %s through an installed hook', (mutation, phase, diagnostic) => {
    const scratch = join(root, '.amp/in/orb-backup')
    mkdirSync(scratch, { recursive: true })
    const cwd = mkdtempSync(join(scratch, 'funnel-mutation-'))
    const env = { ...process.env }
    const localEnv = spawnSync('git', ['rev-parse', '--local-env-vars'], { cwd: root, encoding: 'utf8' })
    expect(localEnv.status, localEnv.stderr).toBe(0)
    const localNames = localEnv.stdout.trim().split('\n')
    for (const name of localNames) delete env[name]
    const git = (...args: string[]) => spawnSync('git', args, { cwd, env, encoding: 'utf8' })
    expect(git('init', '--quiet').status).toBe(0)
    expect(git('config', 'core.hooksPath', '.git/hooks').status).toBe(0)
    if (mutation === 'isolated') {
      // Only this alternate index contains the staged files. The hook must inspect it,
      // while child Git commands must be free to operate in their own repositories.
      env.GIT_INDEX_FILE = join(cwd, '.git/checked.index')
      env.GIT_DIR = join(cwd, '.git')
      env.GIT_WORK_TREE = cwd
    }
    writeFileSync(join(cwd, 'feature.mjs'), 'export const value = 1\n')
    writeFileSync(
      join(cwd, 'generate.mjs'),
      `import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
console.log(process.argv[2] + '-sentinel')
if (${JSON.stringify(mutation)} === 'isolated') {
  for (const name of ${JSON.stringify(localNames)}) assert.equal(process.env[name], undefined, name)
  const nested = resolve('.git/nested-' + process.argv[2])
  mkdirSync(nested)
  execFileSync('git', ['init', '--quiet'], { cwd: nested })
  assert.equal(execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: nested, encoding: 'utf8' }).trim().replaceAll('\\\\', '/'), nested.replaceAll('\\\\', '/'))
} else if (process.argv[2] === ${JSON.stringify(phase)}) {
  writeFileSync(${JSON.stringify(mutation === 'untracked' ? 'unexpected.mjs' : 'feature.mjs')}, 'export const value = ;\\n')
  if (${JSON.stringify(mutation)} === 'staged') execFileSync('git', ['add', 'feature.mjs'])
}
`,
    )
    writeFileSync(
      join(cwd, 'package.json'),
      JSON.stringify({
        scripts: {
          'funnel:pre-commit': `"${process.execPath}" "${join(root, 'tools/dev/funnel.ts')}"`,
          'verify:static': 'node --check feature.mjs && node generate.mjs static',
          'test:affected': 'node generate.mjs verify',
        },
      }),
    )
    expect(git('add', '.').status).toBe(0)
    const before = git('write-tree')
    expect(before.status).toBe(0)
    const install = spawnSync(process.execPath, [join(root, 'tools/dev/funnel.ts'), '--install'], {
      cwd,
      env,
      encoding: 'utf8',
    })
    expect(install.status, install.stderr).toBe(0)
    const commit = git(
      '-c',
      'user.name=Funnel fixture',
      '-c',
      'user.email=fixture@example.invalid',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '-m',
      'test: verify the original staged tree',
    )
    const output = commit.stdout + commit.stderr
    if (mutation === 'isolated') {
      expect(commit.status, output).toBe(0)
      expect(git('rev-parse', 'HEAD^{tree}').stdout).toBe(before.stdout)
      expect(output).toContain('static-sentinel')
      expect(output).toContain('verify-sentinel')
    } else {
      const after = git('write-tree')
      expect(after.status).toBe(0)
      if (mutation === 'staged') {
        expect(after.stdout).not.toBe(before.stdout)
        expect(git('diff', '--quiet').status).toBe(0)
      }
      const invalid = spawnSync(
        process.execPath,
        ['--check', mutation === 'untracked' ? 'unexpected.mjs' : 'feature.mjs'],
        { cwd, env, encoding: 'utf8' },
      )
      expect(invalid.status).toBe(1)
      expect(
        commit.status,
        `${output}\nTrees: ${before.stdout.trim()} -> ${after.stdout.trim()}; final syntax exit ${invalid.status}`,
      ).toBe(1)
      expect(git('rev-parse', '--verify', 'HEAD').status).not.toBe(0)
      expect(output).not.toContain('passed for the staged tree')
      if (phase === 'static') expect(output).not.toContain('verify-sentinel')
      else expect(output).toContain('verify-sentinel')
      expect(output).toContain(`after ${phase === 'static' ? 'verify:static' : 'test:affected'}`)
    }
    expect(output).toContain(diagnostic)
  })

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
    const installedHook = readFileSync(hookPath, 'utf8')
    expect(installedHook).toContain('exec node --run funnel:pre-commit')
    writeFileSync(hookPath, '#!/bin/sh\necho existing-hook\n')
    expect(run('--install').status).toBe(1)
    expect(readFileSync(hookPath, 'utf8')).toBe('#!/bin/sh\necho existing-hook\n')
    writeFileSync(hookPath, installedHook)

    // Reinstallation must not rewrite a hook another process could replace after validation.
    const installedAt = new Date('2001-01-01T00:00:00Z')
    // Finish fixture replacements before opening the file whose metadata must remain unchanged.
    const hookFile = openSync(hookPath, 'r+')
    try {
      futimesSync(hookFile, installedAt, installedAt)
      expect(run('--install').status).toBe(0)
      expect(fstatSync(hookFile).mtimeMs).toBe(installedAt.getTime())
    } finally {
      closeSync(hookFile)
    }

    const manifest = (staticExit: number, affectedExit = 0) =>
      JSON.stringify({
        scripts: {
          'funnel:pre-commit': `"${process.execPath}" "${join(root, 'tools/dev/funnel.ts')}"`,
          'verify:static': `node -e "console.log('static-sentinel'); process.exit(${staticExit})"`,
          'test:affected': `node -e "console.log('verify-sentinel'); process.exit(${affectedExit})" --`,
        },
      })
    writeFileSync(join(cwd, 'package.json'), manifest(0))
    const declaration = readFileSync(join(root, '.agents/surfaces.jsonc'), 'utf8').match(/"preCommit":\s*(\{[^}]+\})/)
    expect(declaration).not.toBeNull()
    const compose = (configuration = declaration?.[1] ?? '{}') =>
      spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '--eval',
          `import { installPreCommit } from ${JSON.stringify(pathToFileURL(join(root, 'tools/dev/pre-commit.mjs')).href)}; console.log(installPreCommit(process.cwd(), false, JSON.parse(process.argv[1])))`,
          configuration,
        ],
        { cwd, env, encoding: 'utf8' },
      )
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = compose()
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toContain('already installed')
      expect(readFileSync(hookPath, 'utf8')).toBe(installedHook)
    }
    expect(compose('{"script":"missing","marker":"smartcloud-funnel pre-commit"}').status).toBe(1)
    expect(compose('{"script":"funnel:pre-commit; true","marker":"smartcloud-funnel pre-commit"}').status).toBe(1)
    writeFileSync(hookPath, '#!/bin/sh\necho foreign\n')
    expect(compose().status).toBe(1)
    expect(readFileSync(hookPath, 'utf8')).toContain('echo foreign')
    writeFileSync(hookPath, installedHook)
    expect(run().stderr).toContain('Untracked files')
    git('add', 'package.json')
    writeFileSync(join(cwd, 'package.json'), manifest(1))
    expect(run().stderr).toContain('Unstaged tracked changes')
    git('add', 'package.json')
    const failed = run()
    expect(failed.status).toBe(1)
    expect(failed.stdout).toContain('static-sentinel')
    expect(failed.stdout).not.toContain('verify-sentinel')
    writeFileSync(join(cwd, 'package.json'), manifest(0, 1))
    git('add', 'package.json')
    const affectedFailed = spawnSync(
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
        'test: reject failed affected tests',
      ],
      { cwd, env, encoding: 'utf8' },
    )
    expect(affectedFailed.status).toBe(1)
    expect(affectedFailed.stderr).toContain('test:affected failed')
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
