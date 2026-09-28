/**
 * @file tests/feature.labels/src/size.spec.ts
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
import { Effect } from 'effect'
import { type Subject, evaluate } from '@resnovas/conditions'
import { sizePreset, withSizeLabels } from '@resnovas/feature.labels'

const withChanges = (changes: number): Subject => ({
  kind: 'pullRequest',
  number: 7,
  title: 't',
  body: '',
  author: 'jane',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
  changes,
})

describe('sizePreset', () => {
  it('defines Size: XS to Size: XL, each described by its band of changed lines', () => {
    const { labels } = sizePreset({})
    expect(labels).toStrictEqual({
      'size-xs': { name: 'Size: XS', color: '3CBF00', description: 'Changes 0 to 9 lines' },
      'size-s': { name: 'Size: S', color: '5D9801', description: 'Changes 10 to 99 lines' },
      'size-m': { name: 'Size: M', color: '7F7203', description: 'Changes 100 to 499 lines' },
      'size-l': { name: 'Size: L', color: 'A14C05', description: 'Changes 500 to 999 lines' },
      'size-xl': { name: 'Size: XL', color: 'C32607', description: 'Changes 1000 lines or more' },
    })
  })

  it('names the one line count of a band that holds only one', () => {
    const { labels } = sizePreset({ thresholds: { s: 1, m: 2, l: 4, xl: 5 } })
    expect(labels['size-xs']?.description).toBe('Changes 0 lines')
    expect(labels['size-s']?.description).toBe('Changes 1 line')
    expect(labels['size-m']?.description).toBe('Changes 2 to 3 lines')
    expect(labels['size-xl']?.description).toBe('Changes 5 lines or more')
  })

  it('puts every pull request in exactly one size, on its thresholds', () =>
    Effect.gen(function* () {
      const { labelling } = sizePreset({ thresholds: { s: 20 } })
      const sizes = (changes: number) =>
        Effect.gen(function* () {
          const passed: Array<string> = []
          for (const [key, rule] of Object.entries(labelling)) {
            if ((yield* evaluate(rule.when, withChanges(changes))).passed) passed.push(key)
          }
          return passed
        })
      expect(yield* sizes(0)).toStrictEqual(['size-xs'])
      expect(yield* sizes(19)).toStrictEqual(['size-xs'])
      expect(yield* sizes(20)).toStrictEqual(['size-s'])
      expect(yield* sizes(499)).toStrictEqual(['size-m'])
      expect(yield* sizes(999)).toStrictEqual(['size-l'])
      expect(yield* sizes(50_000)).toStrictEqual(['size-xl'])
      expect(Object.values(labelling).every((rule) => rule.on?.join() === 'pullRequest')).toBe(true)
    }).pipe(Effect.runSync))
})

describe('withSizeLabels', () => {
  it('leaves a config without sizeLabels as it is', () => {
    const config = { version: 2 as const, labels: { bug: { name: 'bug', color: 'd73a4a' } } }
    expect(withSizeLabels(config)).toBe(config)
  })

  it("adds the preset's labels and rules, letting the config's own keys win", () => {
    const config = withSizeLabels({
      version: 2,
      sizeLabels: {},
      labels: { bug: { name: 'bug', color: 'd73a4a' }, 'size-m': { name: 'medium', color: 'ffff00' } },
      labelling: { 'size-xl': { label: 'size-xl', when: { condition: [] } } },
    })
    expect(Object.keys(config.labels ?? {})).toStrictEqual(['size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'bug'])
    expect(config.labels?.['size-m']).toStrictEqual({ name: 'medium', color: 'ffff00', aliases: ['Size: M'] })
    expect(config.labelling?.['size-xl']).toStrictEqual({ label: 'size-xl', when: { condition: [] } })
    expect(config.labelling?.['size-xs']?.label).toBe('size-xs')
  })

  it('adds the preset name as an alias only when an override renames the label', () => {
    const config = withSizeLabels({
      version: 2,
      sizeLabels: {},
      labels: {
        'size-xs': { name: 'size: xs', color: '000000' },
        'size-s': { name: 'small', color: '000000', aliases: ['SIZE: S'] },
        'size-m': { name: 'medium', color: '000000', aliases: ['mid'] },
      },
    })
    expect(config.labels?.['size-xs']?.aliases).toBeUndefined()
    expect(config.labels?.['size-s']?.aliases).toStrictEqual(['SIZE: S'])
    expect(config.labels?.['size-m']?.aliases).toStrictEqual(['mid', 'Size: M'])
  })
})
