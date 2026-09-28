/**
 * @file tests/feature.freeze/src/feature.spec.ts
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
import { FEATURE, FREEZE_CHECK, freezeCheck, freezeFeature, SWEEP_EVENTS } from '@resnovas/feature.freeze'
import {
  CHECK_RUN_EXTERNAL_ID,
  type CommitCheck,
  Forbidden,
  GitHub,
  type GitHubService,
  makeMemoryGitHub,
} from '@resnovas/integrations.github'
import { Effect, TestClock } from 'effect'

const SHA = 'abc123'
// A Saturday, inside the weekend window and outside the night one.
const SATURDAY = Date.parse('2026-09-26T12:00:00Z')
const WEDNESDAY = Date.parse('2026-09-30T12:00:00Z')

const weekend: SmartcloudConfig = {
  version: 2,
  freeze: {
    windows: { weekend: { from: 'Fri 16:00', to: 'Mon 08:00', reason: 'No weekend deploys' } },
    exempt: { labels: ['hotfix'] },
  },
}

const pullRequest = (labels: ReadonlyArray<string> = [], state: 'open' | 'closed' = 'open') => ({
  action: 'synchronize',
  pull_request: {
    number: 7,
    title: 'feat: x',
    body: '',
    user: { login: 'contributor' },
    state,
    locked: false,
    labels: labels.map((name) => ({ name })),
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'feature', sha: SHA },
  },
})

const ownCheck = (id: number, state: CommitCheck['state']): CommitCheck => ({
  name: FREEZE_CHECK,
  source: 'checkRun',
  id,
  app: 'github-actions',
  externalId: CHECK_RUN_EXTERNAL_ID,
  state,
  detail: state,
})

const run = (options: {
  readonly service: GitHubService
  readonly event: string
  readonly payload: unknown
  readonly config?: SmartcloudConfig
  readonly now?: number
}) =>
  Effect.gen(function* () {
    yield* TestClock.setTime(options.now ?? SATURDAY)
    return yield* runFeatures({
      config: options.config ?? weekend,
      event: options.event,
      payload: options.payload,
      features: [freezeFeature],
    }).pipe(Effect.provideService(GitHub, options.service))
  })

const findings = (result: Effect.Effect.Success<ReturnType<typeof run>>) =>
  result.findings.map((finding) => ({ rule: finding.rule, level: finding.level, message: finding.message }))

describe('freezeFeature', () => {
  it('names the feature, its check and the sweep events, and runs only when configured', () => {
    expect(FEATURE).toBe('freeze')
    expect(FREEZE_CHECK).toBe('smartcloud / merge freeze')
    expect(SWEEP_EVENTS).toStrictEqual(['schedule', 'workflow_dispatch'])
    expect(freezeFeature.enabled?.({ version: 2 })).toBe(false)
    expect(freezeFeature.enabled?.({ version: 2, freeze: {} })).toBe(true)
  })

  it('builds a failed check during a freeze, and a passed one when exempt or clear', () => {
    const frozen = { key: 'weekend', reason: undefined, until: 'Mon 08:00 (UTC)' }
    expect(freezeCheck(SHA, frozen, undefined)).toStrictEqual({
      name: FREEZE_CHECK,
      headSha: SHA,
      status: 'completed',
      conclusion: 'failure',
      title: 'Merges are frozen',
      summary: 'Merges are frozen by the weekend window until Mon 08:00 (UTC).',
    })
    expect(freezeCheck(SHA, frozen, 'hotfix').summary).toBe(
      'Merges are frozen by the weekend window until Mon 08:00 (UTC). This pull request has the hotfix label, so it may merge.',
    )
    expect(freezeCheck(SHA, undefined, undefined).conclusion).toBe('success')
  })
})

describe('freezeFeature on pull requests', () => {
  it.effect('fails the freeze check during a freeze, and warns without failing the job', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const result = yield* run({ service: memory.service, event: 'pull_request', payload: pullRequest() })
      expect(result.ran).toStrictEqual([FEATURE])
      expect(findings(result)).toStrictEqual([
        {
          rule: 'freeze.active',
          level: 'warning',
          message:
            'Merges are frozen by the weekend window (No weekend deploys) until Mon 08:00 (UTC). This pull request cannot merge until then.',
        },
      ])
      expect(memory.state.checkRuns.map((check) => [check.name, check.headSha, check.conclusion])).toStrictEqual([
        [FREEZE_CHECK, SHA, 'failure'],
      ])
    }),
  )

  it.effect('lets a pull request with an exempt label through', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const result = yield* run({ service: memory.service, event: 'pull_request', payload: pullRequest(['hotfix']) })
      expect(findings(result).map((finding) => [finding.rule, finding.level])).toStrictEqual([
        ['freeze.exempt', 'notice'],
      ])
      expect(memory.state.checkRuns.map((check) => check.conclusion)).toStrictEqual(['success'])
    }),
  )

  it.effect('passes the freeze check with no finding when no freeze is on', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const result = yield* run({
        service: memory.service,
        event: 'pull_request',
        payload: pullRequest(),
        now: WEDNESDAY,
      })
      expect(result.findings).toStrictEqual([])
      expect(memory.state.checkRuns.map((check) => check.conclusion)).toStrictEqual(['success'])
    }),
  )

  it.effect('publishes nothing when the latest freeze check smartcloud published already agrees', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      // An older passed run, another app's run of the same name and a status do not count; the latest own run failed.
      memory.state.commitChecks.set(SHA, [
        ownCheck(3, 'failure'),
        ownCheck(1, 'success'),
        {
          name: FREEZE_CHECK,
          source: 'checkRun',
          externalId: CHECK_RUN_EXTERNAL_ID,
          state: 'success',
          detail: 'success',
        },
        { name: FREEZE_CHECK, source: 'checkRun', id: 9, app: 'other', state: 'success', detail: 'success' },
        { name: FREEZE_CHECK, source: 'status', state: 'success', detail: 'success' },
      ])
      yield* run({ service: memory.service, event: 'pull_request', payload: pullRequest() })
      expect(memory.state.checkRuns).toStrictEqual([])
      yield* run({ service: memory.service, event: 'pull_request', payload: pullRequest(), now: WEDNESDAY })
      expect(memory.state.checkRuns.map((check) => check.conclusion)).toStrictEqual(['success'])
    }),
  )

  it.effect('leaves a closed pull request alone', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const result = yield* run({ service: memory.service, event: 'pull_request', payload: pullRequest([], 'closed') })
      expect(result.findings).toStrictEqual([])
      expect(memory.state.checkRuns).toStrictEqual([])
    }),
  )

  it.effect('warns instead of failing when the token cannot write check runs', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const service: GitHubService = {
        ...memory.service,
        createCheckRun: () =>
          Effect.fail(new Forbidden({ operation: 'createCheckRun', detail: 'Resource not accessible by integration' })),
      }
      const result = yield* run({ service, event: 'pull_request', payload: pullRequest() })
      expect(result.failed).toStrictEqual([])
      expect(findings(result).map((finding) => [finding.rule, finding.level])).toStrictEqual([
        ['freeze.active', 'warning'],
        ['freeze.check', 'warning'],
      ])
      expect(findings(result)[1]?.message).toBe(
        `Could not publish the ${FREEZE_CHECK} check: createCheckRun: forbidden (Resource not accessible by integration)`,
      )
    }),
  )
})

describe('freezeFeature on repository events', () => {
  const mergeGroup = {
    action: 'checks_requested',
    merge_group: { head_sha: SHA, head_ref: 'refs/heads/gh-readonly-queue/main/pr-7' },
  }

  it.effect('fails a merge queue entry during a freeze, whatever its labels', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const result = yield* run({ service: memory.service, event: 'merge_group', payload: mergeGroup })
      expect(findings(result)).toStrictEqual([
        {
          rule: 'freeze.active',
          level: 'error',
          message:
            'Merges are frozen by the weekend window (No weekend deploys) until Mon 08:00 (UTC). The merge queue cannot merge until then.',
        },
      ])
      expect(memory.state.checkRuns).toStrictEqual([])
    }),
  )

  it.effect('lets a merge queue entry through when no freeze is on', () =>
    Effect.gen(function* () {
      const result = yield* run({
        service: makeMemoryGitHub().service,
        event: 'merge_group',
        payload: mergeGroup,
        now: WEDNESDAY,
      })
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('reads a missing section as no freeze', () =>
    Effect.gen(function* () {
      const result = yield* run({
        service: makeMemoryGitHub().service,
        event: 'merge_group',
        payload: mergeGroup,
        config: { version: 2, freeze: { active: true } },
      })
      expect(result.findings.map((finding) => finding.message)).toStrictEqual([
        'Merges are frozen by freeze.active until it is turned off. The merge queue cannot merge until then.',
      ])
      // The runner never calls the feature without a section; called directly, it finds no freeze.
      const report = yield* makeReport
      yield* freezeFeature
        .run({ config: { version: 2 }, envelope: { kind: 'repository', event: 'merge_group', headSha: SHA } })
        .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, makeMemoryGitHub().service))
      expect((yield* report.snapshot).findings).toStrictEqual([])
    }),
  )

  it.effect('does nothing on other repository events', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      memory.state.openPullRequests.push({ number: 7, headSha: SHA, labels: [], draft: false })
      const result = yield* run({
        service: memory.service,
        event: 'push',
        payload: { ref: 'refs/heads/main', after: SHA },
      })
      expect(result.ran).toStrictEqual([FEATURE])
      expect(result.findings).toStrictEqual([])
      expect(memory.state.checkRuns).toStrictEqual([])
    }),
  )

  it.effect('brings the freeze check up to date on every open pull request on a schedule', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      memory.state.openPullRequests.push(
        { number: 1, headSha: 'a', labels: [], draft: false },
        { number: 2, headSha: 'b', labels: ['hotfix'], draft: false },
        { number: 3, headSha: 'c', labels: [], draft: true },
      )
      memory.state.commitChecks.set('c', [ownCheck(5, 'failure')])
      const frozen = yield* run({ service: memory.service, event: 'schedule', payload: {} })
      expect(memory.state.checkRuns.map((check) => [check.headSha, check.conclusion])).toStrictEqual([
        ['a', 'failure'],
        ['b', 'success'],
      ])
      expect(findings(frozen)).toStrictEqual([
        {
          rule: 'freeze.swept',
          level: 'notice',
          message: `Merges are frozen by the weekend window (No weekend deploys) until Mon 08:00 (UTC). Updated the ${FREEZE_CHECK} check on 2 of 3 open pull request(s).`,
        },
      ])

      memory.state.checkRuns.length = 0
      const open = yield* run({ service: memory.service, event: 'workflow_dispatch', payload: {}, now: WEDNESDAY })
      expect(memory.state.checkRuns.map((check) => [check.headSha, check.conclusion])).toStrictEqual([
        ['a', 'success'],
        ['b', 'success'],
        ['c', 'success'],
      ])
      expect(findings(open)[0]?.message).toBe(
        `No merge freeze is in effect. Updated the ${FREEZE_CHECK} check on 3 of 3 open pull request(s).`,
      )
    }),
  )

  it.effect('reports the pull requests it could not update, and carries on with the rest', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      memory.state.openPullRequests.push(
        { number: 1, headSha: 'a', labels: [], draft: false },
        { number: 2, headSha: 'b', labels: [], draft: false },
      )
      const service: GitHubService = {
        ...memory.service,
        createCheckRun: (check) =>
          check.headSha === 'a'
            ? Effect.fail(new Forbidden({ operation: 'createCheckRun', detail: 'no' }))
            : memory.service.createCheckRun(check),
      }
      const result = yield* run({ service, event: 'schedule', payload: {} })
      expect(memory.state.checkRuns.map((check) => check.headSha)).toStrictEqual(['b'])
      expect(findings(result).map((finding) => [finding.rule, finding.level, finding.message])).toStrictEqual([
        ['freeze.swept', 'notice', expect.stringContaining('on 1 of 2 open pull request(s)')],
        [
          'freeze.check',
          'warning',
          `Could not publish the ${FREEZE_CHECK} check on 1 pull request(s): createCheckRun: forbidden (no)`,
        ],
      ])
    }),
  )
})
