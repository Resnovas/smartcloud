/**
 * @file tests/feature.required/src/feature.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { FEATURE, POLL_INTERVAL, requiredFeature } from '@resnovas/feature.required'
import { type CommitCheck, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
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

const self: CommitCheck = { name: 'smartcloud', source: 'checkRun', id: SELF, state: 'pending', detail: 'in_progress' }
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
  it('names the feature and waits fifteen seconds between looks', () => {
    expect(FEATURE).toBe('required')
    expect(Duration.toSeconds(POLL_INTERVAL)).toBe(15)
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
      // Looks at 0, 15, 30, 45 and 60 seconds.
      expect(github.looks()).toBe(5)
    }),
  )

  it.effect('passes a commit that settles just as the deadline comes', () =>
    Effect.gen(function* () {
      const pending = [check('ci / test', 'pending')]
      const github = scripted([pending, pending, pending, pending, [check('ci / test', 'success')]])
      const result = yield* runPolling(github, { version: 2, required: { timeout: 1 } })
      expect(findings(result).map((finding) => finding.rule)).toStrictEqual(['required.passed'])
      expect(github.looks()).toBe(5)
    }),
  )

  it.effect('leaves out its own job, smartcloud feature checks and ignored checks', () =>
    Effect.gen(function* () {
      const github = scripted([
        [
          check('smartcloud / reviews', 'failure'),
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
