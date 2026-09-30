/**
 * @file tests/tools/src/posthog/flags.spec.ts
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
import { FLAG_PREFIX, flagDefinition, flagsInTable, planFlags, renderPlan } from '../../../../tools/posthog/flags.js'

const FLAGS = { 'smartcloud-labels': true, 'smartcloud-stale': true, 'smartcloud-trial': false }

describe('flagDefinition', () => {
  it('releases the flag to everyone in the state the code defaults to', () => {
    expect(flagDefinition('smartcloud-labels', true)).toStrictEqual({
      key: 'smartcloud-labels',
      name: 'smartcloud: the labels feature',
      active: true,
      filters: { groups: [{ properties: [], rollout_percentage: 100 }] },
    })
    expect(flagDefinition('other', false)).toMatchObject({ name: 'smartcloud: the other feature', active: false })
    expect(FLAG_PREFIX).toBe('smartcloud-')
  })
})

describe('planFlags', () => {
  it('sorts the flags in code into present, missing, deleted and differing', () => {
    const plan = planFlags(FLAGS, [
      { key: 'smartcloud-labels', active: false },
      { key: 'smartcloud-trial', active: true, deleted: true },
      { key: 'unrelated', active: true },
    ])
    expect(plan).toStrictEqual({
      present: ['smartcloud-labels'],
      missing: ['smartcloud-stale'],
      deleted: ['smartcloud-trial'],
      differing: ['smartcloud-labels'],
    })
  })

  it('finds nothing to do when every flag exists as the code defaults it', () => {
    const remote = Object.entries(FLAGS).map(([key, active]) => ({ key, active }))
    expect(planFlags(FLAGS, remote)).toStrictEqual({
      present: Object.keys(FLAGS).sort(),
      missing: [],
      deleted: [],
      differing: [],
    })
  })
})

describe('flagsInTable', () => {
  it('reads the flag key from each table row and ignores the rest of the page', () => {
    const page = [
      'Each feature has a flag, named `smartcloud-<feature>`.',
      '',
      '| Flag | Feature | Default |',
      '| --- | --- | --- |',
      '| `smartcloud-labels`   | [Labels](features/labels) | on |',
      '|`smartcloud-stale`| [Stale](features/stale) | on |',
      '',
      '`smartcloud-lock` is mentioned in prose only.',
    ].join('\n')
    expect(flagsInTable(page)).toStrictEqual(['smartcloud-labels', 'smartcloud-stale'])
    expect(flagsInTable('')).toStrictEqual([])
  })
})

describe('renderPlan', () => {
  it('reports each group, and how to create the missing flags when only checking', () => {
    const plan = { present: ['a'], missing: ['b'], deleted: ['c'], differing: ['a'] }
    const checked = renderPlan(plan, { check: true })
    expect(checked).toContain('1 flag(s) present in PostHog.')
    expect(checked).toContain('set differently from the in-code default in PostHog (left as set):\n  a')
    expect(checked).toContain('deleted in PostHog; restore them there')
    expect(checked).toContain('missing from PostHog (run: node tools/posthog/feature-flags.ts):\n  b')
    expect(renderPlan(plan, { check: false })).toContain('missing from PostHog, creating them:\n  b')
    expect(renderPlan({ present: [], missing: [], deleted: [], differing: [] }, { check: true })).toBe(
      '0 flag(s) present in PostHog.',
    )
  })
})
