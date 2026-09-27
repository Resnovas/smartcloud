/**
 * @file tests/runtime/src/run.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { GitHub, Unavailable } from '@resnovas/integrations.github'
import {
  command,
  describeWrite,
  dryRun,
  dryRunRepository,
  dryRunText,
  FeatureFailed,
  InvalidTrigger,
  runEvent,
  syntheticEvent,
  triggerOf,
  UnexpectedResponse,
  type Connect,
} from '@resnovas/runtime'
import { Effect } from 'effect'
import { CONVENTIONS, fixture, issue, LABELS, memory, pull, PUSH, recording, withConfig } from './fixtures.js'
import { carried, observe, spanNamed } from './observe.js'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach } from 'vitest'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-runtime-'))
})

describe('triggers and synthetic events', () => {
  it.effect('takes exactly one of a pull request, an issue or a known event', () =>
    Effect.gen(function* () {
      expect(yield* triggerOf({ pr: 7 })).toStrictEqual({ kind: 'pullRequest', number: 7 })
      expect(yield* triggerOf({ issue: 9, pr: undefined })).toStrictEqual({ kind: 'issue', number: 9 })
      expect(yield* triggerOf({ event: 'push' })).toStrictEqual({ kind: 'repository', event: 'push' })
      const none = yield* Effect.flip(triggerOf({}))
      expect(none).toBeInstanceOf(InvalidTrigger)
      expect(none.message).toBe(
        'nothing to simulate: give exactly one of a pull request, an issue, or an event (schedule, push, workflow_dispatch)',
      )
      expect((yield* Effect.flip(triggerOf({ pr: 1, event: 'push' }))).reason).toBe('more than one thing to simulate')
      expect((yield* Effect.flip(triggerOf({ event: 'issues' }))).reason).toBe('unknown event "issues"')
    }),
  )

  it.effect('builds each event from what GitHub says now', () =>
    Effect.gen(function* () {
      expect(yield* syntheticEvent({ kind: 'pullRequest', number: 7 })).toStrictEqual({
        name: 'pull_request',
        payload: { action: 'synchronize', pull_request: pull },
      })
      expect(yield* syntheticEvent({ kind: 'issue', number: 9 })).toStrictEqual({
        name: 'issues',
        payload: { action: 'edited', issue },
      })
      expect(yield* syntheticEvent({ kind: 'repository', event: 'schedule' })).toStrictEqual({
        name: 'schedule',
        payload: {},
      })
      expect(yield* syntheticEvent({ kind: 'repository', event: 'push' })).toStrictEqual({
        name: 'push',
        payload: { ref: 'refs/heads/main', after: 'def456' },
      })
    }).pipe(Effect.provideService(GitHub, memory().service)),
  )

  it.effect('fails on a commit that is not shaped as documented', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(syntheticEvent({ kind: 'repository', event: 'push' }))
      expect(error).toBeInstanceOf(UnexpectedResponse)
      expect(error.message).toBe('GET /commits/main: unexpected response from GitHub')
    }).pipe(Effect.provideService(GitHub, memory({}, {}, { '/commits/main': { nope: true } }).service)),
  )
})

describe('runEvent and dryRun', () => {
  it.effect('runs features and publishes the report', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const outcome = yield* Effect.flatMap(syntheticEvent({ kind: 'pullRequest', number: 7 }), (event) =>
        runEvent({ config: {}, event }),
      ).pipe(Effect.provideService(GitHub, service))
      expect(outcome.result.findings.map((finding) => finding.rule)).toStrictEqual(['conventions.title'])
      expect(state.checkRuns).not.toHaveLength(0)
      expect(outcome.result.configSkipped).toBeUndefined()
    }),
  )

  it.effect('reports config it ignored as warnings in a config check run, and runs the rest', () =>
    Effect.gen(function* () {
      const config = `${CONVENTIONS}settings:\n  codespaces: { enabled: true }\n`
      const { service, state } = memory({ '.github/smartcloud.yml': config })
      const event = yield* syntheticEvent({ kind: 'pullRequest', number: 7 }).pipe(
        Effect.provideService(GitHub, service),
      )
      const outcome = yield* runEvent({ config: {}, event }).pipe(Effect.provideService(GitHub, service))
      expect(outcome.result.findings.map((finding) => `${finding.level} ${finding.rule}`)).toStrictEqual([
        'warning config.ignored',
        'error conventions.title',
      ])
      expect(outcome.result.findings[0]?.message).toMatch(
        /^\.github\/smartcloud\.yml: ignored settings\.codespaces, because /,
      )
      expect(state.checkRuns.map((check) => [check.name, check.conclusion])).toContainEqual([
        'smartcloud / config',
        'neutral',
      ])
      // Reported as a finding, so not repeated as a run warning.
      expect(outcome.warnings).toStrictEqual([])
    }),
  )

  it.effect('fails the config check, but runs every feature, when an invalid value loosened policy', () =>
    Effect.gen(function* () {
      const config = `${CONVENTIONS}roles:\n  maintainers: [a, 1]\n`
      const { service, state } = memory({ '.github/smartcloud.yml': config })
      const event = yield* syntheticEvent({ kind: 'pullRequest', number: 7 }).pipe(
        Effect.provideService(GitHub, service),
      )
      const outcome = yield* runEvent({ config: {}, event }).pipe(Effect.provideService(GitHub, service))
      expect(outcome.result.findings.map((finding) => `${finding.level} ${finding.rule}`)).toStrictEqual([
        'error config.ignored',
        'error conventions.title',
      ])
      expect(outcome.result.findings[0]?.message).toMatch(/only tightens policy/)
      expect(state.checkRuns.map((check) => [check.name, check.conclusion])).toContainEqual([
        'smartcloud / config',
        'failure',
      ])
    }),
  )

  it.effect(
    'a restricted run leaves out an unreadable preset from another repository and skips PAT-only features',
    () =>
      Effect.gen(function* () {
        const config = `version: 2\nextends: ['Resnovas/.github/smartcloud/house.yml@main']\n${CONVENTIONS.replace('version: 2\n', '')}sync:\n  exclude: [LICENSE]\n`
        const { service, state } = memory({ '.github/smartcloud.yml': config })
        const access = { restricted: true, reason: 'a pull request from a fork' } as const
        const event = yield* syntheticEvent({ kind: 'pullRequest', number: 7 }).pipe(
          Effect.provideService(GitHub, service),
        )
        const outcome = yield* runEvent({ config: {}, event, access }).pipe(Effect.provideService(GitHub, service))
        expect(outcome.result.configSkipped).toHaveLength(2)
        expect(state.checkRuns.map((check) => [check.name, check.conclusion])).toContainEqual([
          'smartcloud / access',
          'neutral',
        ])
        expect(outcome.result.findings.map((finding) => `${finding.level} ${finding.rule}`)).toStrictEqual([
          'notice access.restricted',
          'warning access.config-skipped',
          'warning access.config-skipped',
          'error conventions.title',
        ])
        expect(
          outcome.result.skipped
            .filter((skip) => skip.reason.startsWith('restricted access'))
            .map((skip) => skip.feature),
        ).toStrictEqual(['settings', 'sync'])
        const unrestricted = yield* Effect.flip(
          runEvent({ config: {}, event }).pipe(Effect.provideService(GitHub, service)),
        )
        expect(unrestricted._tag).toBe('ConfigNotFound')
      }),
  )

  it.effect('traces config, flags, features and reporting, naming no repository, title or login', () =>
    Effect.gen(function* () {
      const { service } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const observed = yield* observe(
        Effect.flatMap(syntheticEvent({ kind: 'pullRequest', number: 7 }), (event) =>
          runEvent({ config: {}, event, features: ['conventions', 'labels'] }),
        ),
      ).pipe(Effect.provideService(GitHub, service))
      expect(observed.value.result.findings.map((finding) => finding.rule)).toStrictEqual(['conventions.title'])
      expect(Object.fromEntries(spanNamed(observed, 'smartcloud.config.resolve').attributes)).toStrictEqual({
        'config.from': 'repository',
        sources: 1,
        warnings: 0,
        locked: 0,
      })
      expect(Object.fromEntries(spanNamed(observed, 'smartcloud.flags.evaluate').attributes)).toStrictEqual({
        features: 2,
        turned_off: [],
      })
      expect(spanNamed(observed, 'smartcloud.feature.conventions').attributes.get('findings')).toBe(1)
      expect(Object.fromEntries(spanNamed(observed, 'smartcloud.reporting.publish').attributes)).toMatchObject({
        'event.kind': 'pullRequest',
        findings: 1,
        check_runs: 1,
        comment: 'created',
        warnings: 0,
      })
      const messages = observed.logs.map((log) => log.message)
      expect(messages).toContain('conventions: 1 of 1 rule(s) failed')
      expect(messages).toContain('labels: skipped, not configured')
      expect(messages).toContain('reporting: 1 check run(s), comment created, 0 warning(s)')
      for (const value of carried(observed))
        for (const secret of ['Resnovas', 'example', 'jane', 'Add things', 'smartcloud.yml'])
          expect(value).not.toContain(secret)
    }),
  )

  it.effect('lets the report reuse a marker comment only from a bot or a roles.trustedBots login', () =>
    Effect.gen(function* () {
      const config = `${CONVENTIONS}roles:\n  trustedBots: ["release-robot"]\n`
      const comments = [
        { id: 1, body: '<!-- smartcloud:report -->\nforged', author: 'mallory', bot: false },
        { id: 2, body: '<!-- smartcloud:report -->\nold', author: 'Release-Robot', bot: false },
      ]
      const { service, state } = memory(
        { '.github/smartcloud.yml': config },
        { issues: new Map([[7, { labels: [], open: true, comments }]]) },
      )
      const outcome = yield* Effect.flatMap(syntheticEvent({ kind: 'pullRequest', number: 7 }), (event) =>
        runEvent({ config: {}, event }),
      ).pipe(Effect.provideService(GitHub, service))
      expect(outcome.published.comment).toBe('updated')
      const after = state.issues.get(7)?.comments ?? []
      expect(after).toHaveLength(2)
      expect(after[0]?.body).toBe('<!-- smartcloud:report -->\nforged')
      expect(after[1]?.body).not.toContain('old')
    }),
  )

  it.effect('records every write instead of making it', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const outcome = yield* dryRun({
        trigger: { kind: 'pullRequest', number: 7 },
        config: {},
        features: ['conventions'],
      }).pipe(Effect.provideService(GitHub, service))
      expect(state.checkRuns).toHaveLength(0)
      expect(state.issues.get(7)?.comments ?? []).toHaveLength(0)
      expect(outcome.event.name).toBe('pull_request')
      expect(outcome.writes.map((write) => write.operation)).toStrictEqual(['createCheckRun', 'createComment'])
      const text = dryRunText(outcome)
      expect(text).toContain('## smartcloud')
      expect(text).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun {"run":')
      expect(text).toContain('...')
    }),
  )

  it('describes writes and outcomes briefly', () => {
    expect(describeWrite({ operation: 'deleteLabel', details: { name: 'bug' } })).toBe('deleteLabel {"name":"bug"}')
    expect(describeWrite({ operation: 'x', details: { body: 'y'.repeat(300) } })).toHaveLength(2 + 160 + 3)
  })

  it.effect('says when nothing would be written, and lists warnings', () =>
    Effect.gen(function* () {
      const v1 = yield* Effect.promise(() => readFile(fixture('v1-smartcloud.json'), 'utf8'))
      const { service } = memory({ '.github/config.json': v1 })
      const outcome = yield* dryRun({
        trigger: { kind: 'repository', event: 'schedule' },
        config: {},
        features: ['conventions'],
      }).pipe(Effect.provideService(GitHub, service))
      const text = dryRunText(outcome)
      expect(text).toContain('warning: .github/config.json: ')
      expect(text.endsWith('**Dry run:** nothing would have been written.')).toBe(true)
      const quiet = yield* dryRun({
        trigger: { kind: 'repository', event: 'schedule' },
        config: { text: { text: 'version: 2\n', source: 'x' } },
      }).pipe(Effect.provideService(GitHub, service))
      expect(dryRunText(quiet)).not.toContain('warning:')
    }),
  )

  it.effect('dry-runs a repository by name, with a local config', () =>
    Effect.gen(function* () {
      const file = join(dir, 'smartcloud.yml')
      yield* Effect.promise(() => writeFile(file, CONVENTIONS))
      const { service, state } = memory()
      const opened: Array<string> = []
      const connect: Connect = (coordinates) =>
        Effect.sync(() => (opened.push(`${coordinates.owner}/${coordinates.repo}`), service))
      const outcome = yield* dryRunRepository(connect, {
        repository: 'Resnovas/example',
        pr: 7,
        config: file,
        features: undefined,
      })
      expect(opened).toStrictEqual(['Resnovas/example'])
      expect(outcome.result.ran).toContain('conventions')
      expect(state.checkRuns).toHaveLength(0)
      expect((yield* Effect.flip(dryRunRepository(connect, { repository: 'nope', pr: 7 })))._tag).toBe(
        'InvalidRepository',
      )
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('runEvent with telemetry', () => {
  it.effect('skips a feature its flag turns off and records the run', () =>
    Effect.gen(function* () {
      const flagged = recording({ 'smartcloud-labels': false })
      const outcome = yield* command(runEvent({ config: {}, event: PUSH }), { command: 'run' }).pipe(
        Effect.provideService(GitHub, withConfig(LABELS)),
        Effect.provide(flagged.layer),
      )
      expect(outcome.result.skipped).toContainEqual({
        feature: 'labels',
        reason: 'turned off by feature flag smartcloud-labels',
      })
      expect(outcome.result.ran).not.toContain('labels')
      expect(flagged.named('command run')).toHaveLength(1)
      expect(flagged.named('command run')[0]?.properties).toMatchObject({
        command: 'run',
        outcome: 'success',
        options: [],
      })
      const labels = flagged.named('feature run').find((event) => event.properties['feature'] === 'labels')
      expect(labels?.properties).toMatchObject({
        outcome: 'skipped',
        skip_reason: 'flag',
        github_event: 'push',
        event_kind: 'repository',
      })
      expect(flagged.named('config resolved')[0]?.properties).toMatchObject({
        config_version: 2,
        features_enabled: expect.arrayContaining(['labels']),
      })
      expect(flagged.organisations[0]).toMatchObject({ uses_house_preset: false })
    }),
  )

  it.effect('keeps the flag defaults, and sends nothing, when the config opts out', () =>
    Effect.gen(function* () {
      const flagged = recording({ 'smartcloud-labels': false })
      const outcome = yield* command(runEvent({ config: {}, event: PUSH }), { command: 'run' }).pipe(
        Effect.provideService(GitHub, withConfig(`${LABELS}telemetry: false\n`)),
        Effect.provide(flagged.layer),
      )
      expect(flagged.enabled()).toBe(false)
      expect(outcome.result.ran).toContain('labels')
      expect(flagged.events).toStrictEqual([])
      expect(flagged.organisations).toStrictEqual([])
    }),
  )

  it.effect('reports a feature that failed', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const unavailable = Effect.fail(new Unavailable({ operation: 'listLabels', detail: 'down' }))
      const outcome = yield* runEvent({ config: {}, event: PUSH }).pipe(
        Effect.provideService(GitHub, withConfig(LABELS, { listLabels: unavailable })),
        Effect.provide(recorded.layer),
      )
      expect(outcome.result.failed.map((failure) => failure.feature)).toStrictEqual(['labels'])
      expect(recorded.errors).toHaveLength(1)
      const error = recorded.errors[0]
      expect(error).toBeInstanceOf(FeatureFailed)
      expect(error instanceof FeatureFailed ? error.message : '').toMatch(/^the labels feature failed: /)
    }),
  )
})

describe('dry runs as invocations', () => {
  it.effect('reads the synthetic event inside the invocation span, and binds the repository first', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const { service } = memory({ '.github/smartcloud.yml': LABELS })
      const observed = yield* observe(
        command(
          dryRunRepository(() => Effect.succeed(service), { repository: 'Resnovas/example', event: 'push' }),
          { command: 'dry-run', options: ['event', 'repo'] },
        ),
      ).pipe(Effect.provide(recorded.layer))
      const root = spanNamed(observed, 'smartcloud.command')
      const run = spanNamed(observed, 'smartcloud.run')
      expect(run.parent._tag === 'Some' && run.parent.value.spanId).toBeTruthy()
      // Every span of the dry run, the reads for the push included, shares the invocation's trace.
      expect(observed.spans.every((span) => span.traceId === root.traceId)).toBe(true)
      expect(recorded.named('command run')[0]?.properties).toMatchObject({
        command: 'dry-run',
        options: ['event', 'repo'],
        outcome: 'success',
      })
      expect(recorded.named('feature run').map((event) => event.properties['feature'])).toContain('labels')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('reports a dry run that cannot start, with the name as typed protected', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const failure = yield* Effect.flip(
        command(
          dryRunRepository(() => Effect.succeed(memory().service), { repository: 'not a repo', pr: 7 }),
          { command: 'dry-run' },
        ).pipe(Effect.provide(recorded.layer)),
      )
      expect(failure._tag).toBe('InvalidRepository')
      expect(recorded.protectedValues).toStrictEqual(['not a repo'])
      expect(recorded.exceptions[0]?.properties).toMatchObject({
        command: 'dry-run',
        error_tag: 'InvalidRepository',
        expected: true,
      })
      expect(recorded.named('command run')[0]?.properties).toMatchObject({
        outcome: 'failure',
        error_tag: 'InvalidRepository',
      })
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})
