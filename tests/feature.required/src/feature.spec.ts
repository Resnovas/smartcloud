/**
 * @file tests/feature.required/src/feature.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { FEATURE, MAX_POLL_INTERVAL, POLL_INTERVAL, requiredFeature } from '@resnovas/feature.required'
import {
  CHECK_RUN_EXTERNAL_ID,
  type CommitCheck,
  GitHub,
  makeMemoryGitHub,
  Unavailable,
} from '@resnovas/integrations.github'
import { Duration, Effect, Fiber, TestClock } from 'effect'

const SHA = 'abc123'
const SELF = 42

const payload = {
  action: 'synchronize',
  pull_request: {
    number: 7,
    title: 'feat: aggregate',
    body: '',
    user: { login: 'contributor' },
    state: 'open',
    locked: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'feature', sha: SHA },
  },
}

const self: CommitCheck = {
  name: 'smartcloud',
  source: 'checkRun',
  id: SELF,
  app: 'github-actions',
  state: 'pending',
  detail: 'in_progress',
}
const check = (
  name: string,
  state: CommitCheck['state'],
  detail: string = state === 'pending' ? 'in_progress' : state,
): CommitCheck => ({
  name,
  source: 'checkRun',
  id: name.length,
  state,
  detail,
})

// Serves one list of checks per look, repeating the last, and counts the looks.
const scripted = (looks: ReadonlyArray<ReadonlyArray<CommitCheck>>) => {
  const memory = makeMemoryGitHub()
  let served = 0
  const service = {
    ...memory.service,
    listCommitChecks: (sha: string) =>
      Effect.sync(() => {
        expect(sha).toBe(SHA)
        return [self, ...(looks[Math.min(served++, looks.length - 1)] ?? [])]
      }),
  }
  return { service, looks: () => served }
}

const run = (
  github: ReturnType<typeof scripted>,
  config: SmartcloudConfig = { version: 2, required: {} },
  checkRunId: number | 'none' = SELF,
) =>
  runFeatures({
    config,
    event: 'pull_request',
    payload,
    features: [requiredFeature],
    checkRunId: checkRunId === 'none' ? undefined : checkRunId,
  }).pipe(Effect.provideService(GitHub, github.service))

// Runs the feature on the test clock, moving time on one poll interval at a time until it finishes.
const runPolling = (github: ReturnType<typeof scripted>, config?: SmartcloudConfig) =>
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(run(github, config))
    for (let step = 0; step < 100; step++) {
      const done = yield* Fiber.poll(fiber)
      if (done._tag === 'Some') break
      yield* TestClock.adjust(POLL_INTERVAL)
    }
    return yield* Fiber.join(fiber)
  })

const findings = (result: Effect.Effect.Success<ReturnType<typeof run>>) =>
  result.findings.map((finding) => ({
    rule: finding.rule,
    level: finding.level,
    message: finding.message,
    link: finding.link,
  }))

describe('requiredFeature', () => {
  it('names the feature and waits fifteen seconds between looks, backing off to a minute', () => {
    expect(FEATURE).toBe('required')
    expect(Duration.toSeconds(POLL_INTERVAL)).toBe(15)
    expect(Duration.toSeconds(MAX_POLL_INTERVAL)).toBe(60)
    expect(requiredFeature.enabled?.({ version: 2 })).toBe(false)
    expect(requiredFeature.enabled?.({ version: 2, required: {} })).toBe(true)
  })

  it.effect('passes once every other check has passed on two looks in a row', () =>
    Effect.gen(function* () {
      const github = scripted([[check('ci / test', 'success'), check('ci / lint', 'success', 'skipped')]])
      const result = yield* runPolling(github)
      expect(result.ran).toStrictEqual(['required'])
      expect(findings(result)).toStrictEqual([
        {
          rule: 'required.passed',
          level: 'notice',
          message: 'All 2 other check(s) on this commit passed.',
          link: undefined,
        },
      ])
      expect(github.looks()).toBe(2)
    }),
  )

  it.effect('leaves out the checks the app the token acts as published', () =>
    Effect.gen(function* () {
      const github = scripted([
        [
          check('ci / test', 'success'),
          {
            name: 'smartcloud / reviews',
            source: 'checkRun',
            id: 99,
            app: 'resnovas-smartcloud',
            externalId: CHECK_RUN_EXTERNAL_ID,
            state: 'failure',
            detail: 'cancelled',
          },
        ],
      ])
      const service = {
        ...github.service,
        graphql: () => Effect.succeed({ viewer: { login: 'resnovas-smartcloud[bot]' } }),
      }
      const result = yield* runPolling({ ...github, service })
      expect(findings(result).map((finding) => finding.message)).toStrictEqual([
        'All 1 other check(s) on this commit passed.',
      ])
    }),
  )

  it.effect('counts every smartcloud-named run from another app when the viewer cannot be read', () =>
    Effect.gen(function* () {
      const github = scripted([
        [
          {
            name: 'smartcloud / reviews',
            source: 'checkRun',
            id: 99,
            app: 'resnovas-smartcloud',
            state: 'failure',
            detail: 'cancelled',
          },
        ],
      ])
      const service = {
        ...github.service,
        graphql: () => Effect.fail(new Unavailable({ operation: 'graphql', detail: 'down' })),
      }
      const result = yield* runPolling({ ...github, service })
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.failed'])
    }),
  )

  it.effect("fails when GitHub never lists the job's own run before the deadline, rather than pass unconfirmed", () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const service = { ...memory.service, listCommitChecks: () => Effect.succeed([check('ci / test', 'success')]) }
      const result = yield* runPolling({ service, looks: () => 0 }, { version: 2, required: { timeout: 1 } })
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.unconfirmed'])
    }),
  )

  it.effect('does not take two looks at same-named checks from different apps as settled', () =>
    Effect.gen(function* () {
      const github = scripted([
        [{ ...check('test', 'success'), app: 'circleci' }],
        [{ ...check('test', 'success'), app: 'github-actions' }],
      ])
      const result = yield* runPolling(github)
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.passed'])
      expect(github.looks()).toBe(3)
    }),
  )

  it.effect('starts the two looks over when a look misses the job’s own run', () =>
    Effect.gen(function* () {
      const passing = [self, check('ci / test', 'success')]
      const looks = [passing, [check('ci / test', 'success')], passing, passing]
      let served = 0
      const memory = makeMemoryGitHub()
      const service = {
        ...memory.service,
        listCommitChecks: () => Effect.sync(() => looks[Math.min(served++, looks.length - 1)] ?? []),
      }
      const result = yield* runPolling({ service, looks: () => served })
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.passed'])
      expect(served).toBe(4)
    }),
  )

  it.effect('waits for an expected check and fails when it never appears', () =>
    Effect.gen(function* () {
      const late = yield* runPolling(
        scripted([[check('lint', 'success')], [check('lint', 'success'), check('check', 'success')]]),
        { version: 2, required: { expect: ['^check$'] } },
      )
      expect(findings(late).map((finding) => finding.rule)).toStrictEqual(['required.passed'])
      const never = yield* runPolling(scripted([[check('lint', 'success')]]), {
        version: 2,
        required: { expect: ['^check$'], timeout: 1 },
      })
      expect(findings(never)).toStrictEqual([
        {
          rule: 'required.missing',
          level: 'error',
          message: 'No check matching ^check$ passed on this commit within 1 minute(s); required.expect needs one.',
          link: undefined,
        },
      ])
    }),
  )

  it.effect('waits for pending checks, and for a check that appears after the rest settled', () =>
    Effect.gen(function* () {
      const github = scripted([
        [check('ci / test', 'pending')],
        [check('ci / test', 'success')],
        [check('ci / test', 'success'), check('docs', 'pending')],
        [check('ci / test', 'success'), check('docs', 'success')],
      ])
      const result = yield* runPolling(github)
      expect(findings(result).map((finding) => finding.message)).toStrictEqual([
        'All 2 other check(s) on this commit passed.',
      ])
      expect(github.looks()).toBe(5)
    }),
  )

  it.effect('fails as soon as a check fails, linking each failure', () =>
    Effect.gen(function* () {
      const github = scripted([
        [
          check('ci / build', 'pending'),
          {
            name: 'ci / test',
            source: 'checkRun',
            id: 9,
            state: 'failure',
            detail: 'timed_out',
            url: 'https://github.com/runs/9',
          },
          { name: 'deploy', source: 'status', state: 'failure', detail: 'error' },
        ],
      ])
      const result = yield* run(github)
      expect(findings(result)).toStrictEqual([
        {
          rule: 'required.failed',
          level: 'error',
          message: 'The ci / test check concluded timed_out.',
          link: 'https://github.com/runs/9',
        },
        { rule: 'required.failed', level: 'error', message: 'The deploy status concluded error.', link: undefined },
      ])
      expect(github.looks()).toBe(1)
    }),
  )

  it.effect('fails the checks still pending at the timeout', () =>
    Effect.gen(function* () {
      const github = scripted([
        [
          check('ci / slow', 'pending', 'queued'),
          { name: 'preview', source: 'status', state: 'pending', detail: 'pending' },
        ],
      ])
      const result = yield* runPolling(github, { version: 2, required: { timeout: 1 } })
      expect(findings(result)).toStrictEqual([
        {
          rule: 'required.pending',
          level: 'error',
          message: 'The ci / slow check did not finish within 1 minute(s); it was still queued.',
          link: undefined,
        },
        {
          rule: 'required.pending',
          level: 'error',
          message: 'The preview status did not finish within 1 minute(s); it was still pending.',
          link: undefined,
        },
      ])
      // Looks at 0, 15, 45 and, the wait cut short by the deadline, 60 seconds.
      expect(github.looks()).toBe(4)
    }),
  )

  it.effect('backs off while nothing changes, up to a minute, and looks again soon after a change', () =>
    Effect.gen(function* () {
      const pending = [check('ci / test', 'pending')]
      const github = scripted([
        ...Array.from({ length: 5 }, () => pending),
        [check('ci / test', 'success')],
        [check('ci / test', 'success')],
      ])
      const fiber = yield* Effect.fork(run(github))
      // Waits of 15, 30, 60 and 60 seconds: five looks by 165 seconds, not twelve.
      for (const seconds of [0, 15, 30, 60, 60]) {
        yield* TestClock.adjust(Duration.seconds(seconds))
      }
      expect(github.looks()).toBe(5)
      // The sixth look, a minute on, finds the change; the confirming look comes 15 seconds later.
      yield* TestClock.adjust(Duration.seconds(60))
      expect(github.looks()).toBe(6)
      yield* TestClock.adjust(POLL_INTERVAL)
      const result = yield* Fiber.join(fiber)
      expect(github.looks()).toBe(7)
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.passed'])
    }),
  )

  it.effect('passes a commit that settles just as the deadline comes', () =>
    Effect.gen(function* () {
      const pending = [check('ci / test', 'pending')]
      const github = scripted([pending, pending, pending, [check('ci / test', 'success')]])
      const result = yield* runPolling(github, { version: 2, required: { timeout: 1 } })
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.passed'])
      expect(github.looks()).toBe(4)
    }),
  )

  it.effect('leaves out its own job, smartcloud feature checks and ignored checks', () =>
    Effect.gen(function* () {
      const github = scripted([
        [
          { ...check('smartcloud / reviews', 'failure'), app: 'github-actions', externalId: CHECK_RUN_EXTERNAL_ID },
          check('codecov/patch', 'failure'),
          { name: 'smartcloud / legacy', source: 'status', state: 'success', detail: 'success' },
        ],
      ])
      const result = yield* runPolling(github, { version: 2, required: { ignore: ['^codecov/'] } })
      expect(findings(result).map((finding) => finding.message)).toStrictEqual([
        'All 1 other check(s) on this commit passed.',
      ])
    }),
  )

  it.effect(
    'passes beside another run of the aggregate and a stale run of a check, and fails on a foreign smartcloud-named run',
    () =>
      Effect.gen(function* () {
        const other = { ...self, id: SELF + 1 }
        const stale = { ...check('ci / test', 'failure', 'cancelled'), id: 1, app: 'github-actions' }
        const latest = { ...check('ci / test', 'success'), id: 2, app: 'github-actions' }
        const passing = yield* runPolling(scripted([[other, stale, latest]]))
        expect(findings(passing).map((finding) => finding.message)).toStrictEqual([
          'All 1 other check(s) on this commit passed.',
        ])
        const foreign = yield* runPolling(scripted([[other, check('smartcloud / reviews', 'failure')]]))
        expect(findings(foreign).map((finding) => finding.message)).toStrictEqual([
          'The smartcloud / reviews check concluded failure.',
        ])
      }),
  )

  it.effect('concludes nothing until its own run is listed, so another aggregate run cannot fail it', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const other = { ...self, id: SELF + 1, state: 'failure' as const, detail: 'cancelled' }
      let looks = 0
      const service = {
        ...memory.service,
        listCommitChecks: () => Effect.sync(() => (looks++ === 0 ? [other] : [self, other])),
      }
      const result = yield* runPolling({ service, looks: () => looks })
      expect(findings(result).map((finding) => finding.message)).toStrictEqual(['No other checks ran on this commit.'])
      expect(looks).toBe(3)
    }),
  )

  it.effect('says so when no other check ran', () =>
    Effect.gen(function* () {
      const result = yield* runPolling(scripted([[]]))
      expect(findings(result).map((finding) => finding.message)).toStrictEqual(['No other checks ran on this commit.'])
    }),
  )

  it.effect('is skipped without the job check run, since the job would wait for itself', () =>
    Effect.gen(function* () {
      const github = scripted([[]])
      const result = yield* run(github, { version: 2, required: {} }, 'none')
      expect(result.skipped).toStrictEqual([
        { feature: 'required', reason: 'runs only in a job that passes checkRunId' },
      ])
      expect(github.looks()).toBe(0)
    }),
  )

  it.effect('does nothing when called without a pull request or a check run', () => {
    const github = scripted([[]])
    return Effect.gen(function* () {
      const report = yield* Report
      const config: SmartcloudConfig = { version: 2, required: {} }
      yield* requiredFeature.run({
        config,
        envelope: { kind: 'repository', event: 'push', headSha: SHA },
        checkRunId: SELF,
      })
      yield* requiredFeature.run({
        config,
        envelope: {
          kind: 'pullRequest',
          event: 'pull_request',
          headSha: SHA,
          subject: {
            kind: 'pullRequest',
            number: 7,
            title: '',
            body: '',
            author: '',
            open: true,
            locked: false,
            labels: [],
            updatedAt: new Date(0),
          },
        },
      })
      expect((yield* report.snapshot).findings).toStrictEqual([])
      expect(github.looks()).toBe(0)
    }).pipe(Effect.provideServiceEffect(Report, makeReport), Effect.provideService(GitHub, github.service))
  })
})
