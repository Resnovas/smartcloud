/**
 * @file tests/notifications/src/compose.spec.ts
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
import type { Finding } from '@resnovas/engine'
import { composeNotification, LINE_LIMIT } from '@resnovas/notifications'
import { Option } from 'effect'
import { run, subject } from './fixtures.js'

const finding = (level: Finding['level'], rule = 'AI-02'): Finding => ({
  feature: 'commits',
  rule,
  level,
  message: 'sign-off missing',
})
const options = { repository: 'o/r', level: 'error' } as const

describe('composeNotification: failures', () => {
  it('counts errors only by default, and warnings too at level warning; never notices', () => {
    const result = run({ findings: [finding('error'), finding('warning'), finding('notice')] })
    expect(Option.getOrThrow(composeNotification(result, 'failures', options)).lines).toStrictEqual([
      'error AI-02: sign-off missing',
    ])
    const both = Option.getOrThrow(composeNotification(result, 'failures', { ...options, level: 'warning' }))
    expect(both.title).toBe('2 policy failures on o/r')
    expect(both.url).toBe('https://github.com/o/r')
    expect(Option.isNone(composeNotification(run({ findings: [finding('notice')] }), 'failures', options))).toBe(true)
  })

  it('names and links the pull request or issue the run was about', () => {
    const pull = run({
      envelope: { kind: 'pullRequest', event: 'pull_request', subject: subject('pullRequest', 7), headSha: 'abc' },
      findings: [finding('error')],
    })
    const onPull = Option.getOrThrow(composeNotification(pull, 'failures', options))
    expect(onPull.title).toBe('1 policy failure on pull request #7 in o/r')
    expect(onPull.url).toBe('https://github.com/o/r/pull/7')
    const issue = run({
      envelope: { kind: 'issue', event: 'issues', subject: subject('issue', 3) },
      findings: [finding('error')],
    })
    const onIssue = Option.getOrThrow(composeNotification(issue, 'failures', options))
    expect(onIssue.title).toBe('1 policy failure on issue #3 in o/r')
    expect(onIssue.url).toBe('https://github.com/o/r/issues/3')
  })

  it(`lists at most ${LINE_LIMIT} lines and counts the rest`, () => {
    const many = run({ findings: Array.from({ length: LINE_LIMIT + 3 }, (_, index) => finding('error', `R-${index}`)) })
    const lines = Option.getOrThrow(composeNotification(many, 'failures', options)).lines
    expect(lines).toHaveLength(LINE_LIMIT + 1)
    expect(lines.at(-1)).toBe('…and 3 more')
  })
})

describe('composeNotification: stale', () => {
  it("carries only the stale feature's changes", () => {
    const result = run({
      changes: [
        { feature: 'stale', description: 'labelled #3 "stale"' },
        { feature: 'labels', description: 'created label bug' },
        { feature: 'stale', description: 'closed #4 as abandoned' },
      ],
    })
    const stale = Option.getOrThrow(composeNotification(result, 'stale', options))
    expect(stale.title).toBe('2 stale changes in o/r')
    expect(stale.lines).toStrictEqual(['labelled #3 "stale"', 'closed #4 as abandoned'])
    expect(
      Option.isNone(composeNotification(run({ changes: [{ feature: 'labels', description: 'x' }] }), 'stale', options)),
    ).toBe(true)
  })
})
