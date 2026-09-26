/**
 * @file tests/cli/src/cli.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { fileKey } from '@resnovas/integrations.github'
import { main, run, runWith } from '@resnovas/smartcloud'
import { Effect } from 'effect'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'
import { captureConsole, CONVENTIONS, fixture, liveTelemetry, memorySource, missingRepository, repository } from './fixtures.js'

let dir: string
let logs: Array<string>
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-cli-'))
  logs = []
  vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void logs.push(args.join(' ')))
})
afterEach(() => vi.restoreAllMocks())

describe('the smartcloud command', () => {
  it.effect('runs migrate and validate from an argument vector', () =>
    Effect.gen(function* () {
      const out = join(dir, 'out.yml')
      yield* run(['node', 'smartcloud', 'migrate', fixture('v1-eventiva.json'), '--out', out])
      expect(logs).toContain(`Wrote ${out}.`)
      yield* run(['node', 'smartcloud', 'validate', out])
      expect(logs).toContain(`${out} is a valid smartcloud config.`)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('validate finds the config in the working directory', () =>
    Effect.gen(function* () {
      yield* Effect.promise(async () => {
        await mkdir(join(dir, '.github'))
        await writeFile(join(dir, '.github/smartcloud.yml'), 'version: 2\n')
      })
      const cwd = process.cwd()
      process.chdir(dir)
      yield* run(['node', 'smartcloud', 'validate']).pipe(Effect.ensuring(Effect.sync(() => process.chdir(cwd))))
      expect(logs).toContain('.github/smartcloud.yml is a valid smartcloud config.')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('prints one line and sets exit code 1 on failure, and only the exit code on a usage error', () =>
    Effect.gen(function* () {
      const errors: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void errors.push(args.join(' ')))
      const before = process.exitCode
      yield* main(['node', 'smartcloud', 'validate', join(dir, 'missing.yml')])
      expect(errors).toHaveLength(1)
      expect(errors[0]).toMatch(/^smartcloud: .*missing\.yml/)
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      yield* main(['node', 'smartcloud', 'bogus'])
      expect(errors.filter((line) => line.startsWith('smartcloud: '))).toHaveLength(1)
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      yield* main(['node', 'smartcloud', 'validate', fixture('v1-eventiva.json')])
      expect(process.exitCode).toBe(before)
      // A schema error spans lines; the failure is still one line.
      const invalid = join(dir, 'invalid.yml')
      yield* Effect.promise(() => writeFile(invalid, 'version: 2\nlabels: nope\n'))
      yield* main(['node', 'smartcloud', 'validate', invalid])
      const last = errors.at(-1) ?? ''
      expect(last).toMatch(/^smartcloud: .*invalid\.yml is not a valid smartcloud config: /)
      expect(last).not.toContain('\n')
      process.exitCode = before
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('dry-run', () => {
  it.effect('prints the summary and the writes it recorded, writing nothing', () =>
    Effect.gen(function* () {
      const { connect, state } = repository({ [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: CONVENTIONS })
      yield* runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--pr', '7', '--features', 'conventions, labels'])
      expect(logs[0]).toContain('Event: `pull_request` (synchronize) on #7')
      expect(logs[0]).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun')
      expect(state.checkRuns).toStrictEqual([])
      expect(state.issues.get(7)?.comments ?? []).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('takes a local config and an event', () =>
    Effect.gen(function* () {
      const file = join(dir, 'smartcloud.yml')
      yield* Effect.promise(() => writeFile(file, 'version: 2\n'))
      const { connect } = repository({})
      yield* runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--event', 'schedule', '--config', file])
      expect(logs[0]).toContain('Event: `schedule`')
      expect(logs[0]).toContain('**Dry run:** nothing would have been written.')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('runs every feature when the feature list is empty', () =>
    Effect.gen(function* () {
      const { connect } = repository({ [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: CONVENTIONS })
      const dry = (...extra: Array<string>) =>
        Effect.map(runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--pr', '7', ...extra]), () => logs.splice(0).join('\n'))
      const all = yield* dry()
      expect(yield* dry('--features', ',')).toBe(all)
      expect(yield* dry('--features', 'conventions')).not.toBe(all)
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('plan settings', () => {
  it.effect('prints the planned steps without applying them', () =>
    Effect.gen(function* () {
      const { connect, state } = repository({
        [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: 'version: 2\nsettings:\n  merging: { squash: true }\n',
      })
      yield* runWith(connect)(['node', 'smartcloud', 'plan', 'settings', '--repo', 'Resnovas/example'])
      expect(logs[0]).toBe('Settings for Resnovas/example, in order:\n- `merging`: Merging, branches, sign-off and wiki\n  PATCH /repos/{owner}/{repo} {"allow_squash_merge":true}')
      expect(state.requests).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('check-commit', () => {
  const message = async (text: string) => {
    const file = join(dir, 'COMMIT_EDITMSG')
    await writeFile(file, text)
    return file
  }

  it.effect('runs from the command line', () =>
    Effect.gen(function* () {
      const file = yield* Effect.promise(() => message('fix: x\n\nSigned-off-by: Jane Doe <jane@example.com>\n'))
      yield* run(['node', 'smartcloud', 'check-commit', file, '--author-name', 'Jane Doe', '--author-email', 'jane@example.com'])
      expect(logs).toContain('The commit message passes.')
    }).pipe(Effect.provide(memorySource({})), Effect.provide(NodeContext.layer)),
  )
})

describe('telemetry for every command', () => {
  const failures: ReadonlyArray<{ readonly name: string; readonly argv: ReadonlyArray<string>; readonly command: string; readonly tag: string }> = [
    {
      name: 'a repository GitHub does not have',
      argv: ['dry-run', '--repo', 'Resnovas/this-repo-does-not-exist-xyz', '--event', 'push'],
      command: 'dry-run',
      tag: 'NotFound',
    },
    { name: 'a config file that cannot be read', argv: ['dry-run', '--repo', 'Resnovas/example', '--event', 'push', '--config', 'missing.yml'], command: 'dry-run', tag: 'SystemError' },
    { name: 'an invalid repository name', argv: ['plan', 'settings', '--repo', 'not-a-repo'], command: 'plan settings', tag: 'InvalidRepository' },
    { name: 'a missing file to validate', argv: ['validate', 'missing.yml'], command: 'validate', tag: 'SystemError' },
  ]
  for (const failure of failures) {
    it.live(`reports ${failure.name} as one exception, and prints only its own line`, () =>
      Effect.gen(function* () {
        const lines = captureConsole()
        const live = liveTelemetry()
        const before = process.exitCode
        yield* live.run(main(['node', 'smartcloud', ...failure.argv], missingRepository))
        expect(process.exitCode).toBe(1)
        process.exitCode = before
        // The diagnostic logs went to PostHog, never to the terminal.
        expect(lines).toHaveLength(1)
        expect(lines[0]).toMatch(/^smartcloud: /)
        const batch = live.batch()
        expect(batch.split('"event":"$exception"')).toHaveLength(2)
        expect(batch).toContain(`"error_tag":"${failure.tag}"`)
        expect(batch).toContain('"expected":true')
        expect(batch).toContain(`"command":"${failure.command}"`)
        expect(batch).toContain('"event":"command run"')
        expect(batch).toContain('"outcome":"failure"')
        expect(batch).not.toMatch(/this-repo-does-not-exist-xyz|not-a-repo/)
      }).pipe(Effect.provide(NodeContext.layer)),
    )
  }

  it.live('sends the GitHub reads before a dry run to PostHog, never to the terminal', () =>
    Effect.gen(function* () {
      const lines = captureConsole()
      const live = liveTelemetry()
      const before = process.exitCode
      yield* live.run(main(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/this-repo-does-not-exist-xyz', '--event', 'push'], missingRepository))
      process.exitCode = before
      expect(lines.some((line) => line.includes('DEBUG'))).toBe(false)
      expect(live.logs()).toContain('github getRepository: NotFound (404)')
      const traces = live.sent.filter((request) => request.path === '/i/v1/traces').map((request) => request.body).join('\n')
      expect(traces).toContain('"smartcloud.command"')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.live('reports a defect as unexpected, and prints one line', () =>
    Effect.gen(function* () {
      const lines = captureConsole()
      const live = liveTelemetry()
      const before = process.exitCode
      yield* live.run(main(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--event', 'schedule'], () => Effect.die(new TypeError('broken'))))
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      expect(lines).toStrictEqual(['smartcloud: unexpected failure: broken'])
      expect(live.batch()).toContain('"expected":false')
      expect(live.batch()).toContain('"error_tag":"TypeError"')
      yield* main(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--event', 'schedule'], () => Effect.die('not an error'))
      process.exitCode = before
      expect(lines.at(-1)).toBe('smartcloud: unexpected failure: not an error')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.live('records a successful command with the names of its options, never their values', () =>
    Effect.gen(function* () {
      captureConsole()
      const live = liveTelemetry()
      const { connect } = repository({ [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: CONVENTIONS })
      yield* live.run(runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--pr', '7']))
      const batch = live.batch()
      expect(batch).toContain('"options":["pr","repo"]')
      expect(batch).toContain('"event":"feature run"')
      expect(batch).toContain('"event":"config resolved"')
      expect(batch).not.toContain('Resnovas/example')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})
