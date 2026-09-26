/**
 * @file tests/feature.required/src/assess.spec.ts
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
import { assessChecks, latestChecks, OWN_CHECK_PREFIX } from '@resnovas/feature.required'
import { CHECK_RUN_EXTERNAL_ID, type CommitCheck } from '@resnovas/integrations.github'

const actions = 'github-actions'

const checks: ReadonlyArray<CommitCheck> = [
  { name: 'smartcloud', source: 'checkRun', id: 1, app: actions, state: 'pending', detail: 'in_progress' },
  { name: 'smartcloud', source: 'status', state: 'failure', detail: 'failure' },
  { name: 'smartcloud / reviews', source: 'checkRun', id: 2, app: actions, externalId: CHECK_RUN_EXTERNAL_ID, state: 'failure', detail: 'failure' },
  { name: 'ci / test', source: 'checkRun', id: 3, app: actions, state: 'success', detail: 'success' },
  { name: 'ci / build', source: 'checkRun', id: 4, app: actions, state: 'pending', detail: 'queued' },
  { name: 'Codecov/patch', source: 'status', state: 'failure', detail: 'failure' },
]

describe('assessChecks', () => {
  it('leaves out the job itself and smartcloud feature check runs, but not a status of the same name', () => {
    expect(OWN_CHECK_PREFIX).toBe('smartcloud / ')
    const assessment = assessChecks(checks, { checkRunId: 1, ignore: [] })
    expect(assessment.counted.map((check) => check.name)).toStrictEqual([
      'smartcloud',
      'ci / test',
      'ci / build',
      'Codecov/patch',
    ])
    expect(assessment.pending.map((check) => check.name)).toStrictEqual(['ci / build'])
    expect(assessment.failed.map((check) => check.name)).toStrictEqual(['smartcloud', 'Codecov/patch'])
  })

  it('leaves out checks an ignore pattern matches, bare or delimited with flags', () => {
    const assessment = assessChecks(checks, { checkRunId: 1, ignore: ['/^codecov\\//i', '^smartcloud$'] })
    expect(assessment.counted.map((check) => check.name)).toStrictEqual(['ci / test', 'ci / build'])
    expect(assessment.failed).toStrictEqual([])
  })

  it('leaves out every name a global or sticky ignore pattern matches', () => {
    for (const pattern of ['/^ci/g', '/^ci/y']) {
      const assessment = assessChecks(checks, { checkRunId: 1, ignore: [pattern] })
      expect(assessment.counted.map((check) => check.name)).toStrictEqual(['smartcloud', 'Codecov/patch'])
    }
  })
})

describe('latestChecks', () => {
  it('keeps the latest run of each app and name, whatever order GitHub lists them in, and every status', () => {
    const listed: ReadonlyArray<CommitCheck> = [
      { name: 'test', source: 'checkRun', id: 5, app: actions, state: 'success', detail: 'success' },
      { name: 'test', source: 'checkRun', id: 3, app: actions, state: 'failure', detail: 'cancelled' },
      { name: 'test', source: 'checkRun', id: 4, app: 'circleci', state: 'failure', detail: 'failure' },
      { name: 'build', source: 'checkRun', id: 1, app: actions, state: 'failure', detail: 'failure' },
      { name: 'build', source: 'checkRun', id: 6, app: actions, state: 'pending', detail: 'queued' },
      { name: 'deploy', source: 'status', state: 'success', detail: 'success' },
      { name: 'deploy', source: 'status', state: 'failure', detail: 'failure' },
    ]
    expect(latestChecks(listed).map((check) => `${check.app ?? 'status'} ${check.name} ${check.detail}`)).toStrictEqual([
      'github-actions test success',
      'circleci test failure',
      'github-actions build queued',
      'status deploy success',
      'status deploy failure',
    ])
  })

  it('treats runs with no app or id as one check, keeping the first', () => {
    const listed: ReadonlyArray<CommitCheck> = [
      { name: 'odd', source: 'checkRun', state: 'success', detail: 'success' },
      { name: 'odd', source: 'checkRun', state: 'failure', detail: 'failure' },
    ]
    expect(latestChecks(listed).map((check) => check.detail)).toStrictEqual(['success'])
  })
})

describe('assessChecks: stale, overlapping and foreign runs', () => {
  it('counts only the latest run of a re-run or retriggered check, so an older cancelled run does not fail it', () => {
    const assessment = assessChecks(
      [
        { name: 'ci / test', source: 'checkRun', id: 10, app: actions, state: 'failure', detail: 'cancelled' },
        { name: 'ci / test', source: 'checkRun', id: 12, app: actions, state: 'success', detail: 'success' },
        { name: 'smartcloud', source: 'checkRun', id: 20, app: actions, state: 'pending', detail: 'in_progress' },
      ],
      { checkRunId: 20, ignore: [] },
    )
    expect(assessment.counted.map((check) => check.id)).toStrictEqual([12])
    expect(assessment.failed).toStrictEqual([])
  })

  it('leaves out every other run of the aggregate job, older or newer, but not a same-named run of another app', () => {
    const assessment = assessChecks(
      [
        { name: 'smartcloud', source: 'checkRun', id: 20, app: actions, state: 'pending', detail: 'in_progress' },
        { name: 'smartcloud', source: 'checkRun', id: 15, app: actions, state: 'failure', detail: 'cancelled' },
        { name: 'smartcloud', source: 'checkRun', id: 25, app: actions, state: 'pending', detail: 'in_progress' },
        { name: 'smartcloud', source: 'checkRun', id: 30, app: 'other-app', state: 'pending', detail: 'queued' },
      ],
      { checkRunId: 20, ignore: [] },
    )
    expect(assessment.counted.map((check) => check.id)).toStrictEqual([30])
  })

  it('leaves out only the job itself while its own run is not listed yet', () => {
    const assessment = assessChecks(
      [{ name: 'smartcloud', source: 'checkRun', id: 25, app: actions, state: 'pending', detail: 'in_progress' }],
      { checkRunId: 20, ignore: [] },
    )
    expect(assessment.counted.map((check) => check.id)).toStrictEqual([25])
  })

  it('counts a smartcloud-named run that another app published, or that is marked otherwise', () => {
    const own: CommitCheck = { name: 'smartcloud', source: 'checkRun', id: 1, app: actions, state: 'pending', detail: 'in_progress' }
    const assessment = assessChecks(
      [
        own,
        { name: 'smartcloud / reviews', source: 'checkRun', id: 3, app: 'other-app', state: 'failure', detail: 'failure' },
        { name: 'smartcloud / labels', source: 'checkRun', id: 4, app: actions, externalId: 'someone-else', state: 'pending', detail: 'queued' },
        { name: 'smartcloud / labels', source: 'checkRun', id: 9, app: actions, externalId: CHECK_RUN_EXTERNAL_ID, state: 'success', detail: 'success' },
      ],
      { checkRunId: 1, ignore: [] },
    )
    expect(assessment.counted.map((check) => check.id)).toStrictEqual([3, 4])
    expect(assessment.selfListed).toBe(true)
  })

  it('leaves out an unmarked smartcloud run from the job app, as older smartcloud versions published them', () => {
    const assessment = assessChecks(
      [
        { name: 'smartcloud', source: 'checkRun', id: 1, app: actions, state: 'pending', detail: 'in_progress' },
        { name: 'smartcloud / reviews', source: 'checkRun', id: 3, app: actions, state: 'failure', detail: 'failure' },
      ],
      { checkRunId: 1, ignore: [] },
    )
    expect(assessment.counted).toStrictEqual([])
  })

  it('says when the job run is not listed yet, and then counts unmarked smartcloud runs', () => {
    const assessment = assessChecks(
      [{ name: 'smartcloud / reviews', source: 'checkRun', id: 3, app: actions, state: 'failure', detail: 'failure' }],
      { checkRunId: 1, ignore: [] },
    )
    expect(assessment.selfListed).toBe(false)
    expect(assessment.failed.map((check) => check.id)).toStrictEqual([3])
  })
})
