/**
 * @file tests/config/src/merge.spec.ts
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
import { Either } from 'effect'
import { empty, LockedRule, mergeLocked } from '@resnovas/config'

describe('mergeLocked', () => {
  const house = { labels: { bug: { name: 'bug', color: 'd73a4a', aliases: ['defect', 'error'] } } }

  it('allows restating a list exactly, and locks a different one', () => {
    const base = Either.getOrThrow(mergeLocked(empty, house, 'house'))
    expect(Either.isRight(mergeLocked(base, house, 'repo'))).toBe(true)
    const changed = mergeLocked(base, { labels: { bug: { aliases: ['defect'] } } }, 'repo')
    expect(Either.isLeft(changed) && changed.left.path).toBe('labels.bug.aliases')
    const reordered = mergeLocked(base, { labels: { bug: { aliases: ['error', 'defect'] } } }, 'repo')
    expect(Either.isLeft(reordered)).toBe(true)
  })

  it('merges records of the same size with different keys field by field', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { labels: { bug: { name: 'bug', color: 'd73a4a' } } }, 'house'))
    const merged = Either.getOrThrow(mergeLocked(base, { labels: { bug: { name: 'bug', description: 'x' } } }, 'repo'))
    expect(merged.value).toStrictEqual({ labels: { bug: { name: 'bug', color: 'd73a4a', description: 'x' } } })
    expect(merged.origins.get('labels.bug.description')).toBe('repo')
    expect(merged.origins.get('labels.bug.color')).toBe('house')
  })

  it('treats keys named like Object.prototype members as ordinary keys', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { labels: { bug: { name: 'bug' } } }, 'house'))
    const merged = mergeLocked(base, { labels: { constructor: { name: 'c' }, toString: { name: 't' } } }, 'repo')
    // toStrictEqual compares constructors, which an own `constructor` key replaces, so compare the JSON.
    expect(JSON.stringify(Either.getOrThrow(merged).value)).toBe(
      JSON.stringify({ labels: { bug: { name: 'bug' }, constructor: { name: 'c' }, toString: { name: 't' } } }),
    )
    const restated = mergeLocked(
      Either.getOrThrow(merged),
      { labels: { constructor: { name: 'c', hasOwnProperty: 1 } } },
      'x',
    )
    expect(Either.isRight(restated)).toBe(true)
  })

  it('keeps a __proto__ key as data rather than a prototype', () => {
    const next: Parameters<typeof mergeLocked>[1] = JSON.parse('{"labels": {"__proto__": {"name": "p"}}}')
    const merged = Either.getOrThrow(mergeLocked(empty, { labels: {} }, 'house'))
    const result = Either.getOrThrow(mergeLocked(merged, next, 'repo'))
    const labels = result.value['labels']
    expect(typeof labels === 'object' && labels !== null && Object.hasOwn(labels, '__proto__')).toBe(true)
  })

  it('does not confuse a rule whose key contains a dot with a field of another rule', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { rules: { x: { preset: 'a' } } }, 'house'))
    const merged = Either.getOrThrow(mergeLocked(base, { rules: { 'x.preset': { preset: 'b' } } }, 'repo'))
    expect(merged.origins.get('rules.x.preset')).toBe('house')
    expect(merged.origins.get('rules.x\\.preset')).toBe('repo')
    const error = mergeLocked(merged, { rules: { x: { preset: 'c' } } }, 'late')
    expect(Either.isLeft(error) && error.left).toStrictEqual(
      new LockedRule({ path: 'rules.x.preset', preset: 'house', source: 'late' }),
    )
  })

  it('cannot add requires or other fields to an inherited condition group', () => {
    const base = Either.getOrThrow(
      mergeLocked(
        empty,
        { labelling: { bug: { label: 'bug', when: { condition: [{ type: 'isOpen', condition: true }] } } } },
        'house',
      ),
    )
    const weakened = mergeLocked(
      base,
      { labelling: { bug: { label: 'bug', when: { requires: 0, condition: [{ type: 'isOpen', condition: true }] } } } },
      'repo',
    )
    expect(Either.isLeft(weakened) && weakened.left).toStrictEqual(
      new LockedRule({ path: 'labelling.bug.when.requires', preset: 'house', source: 'repo' }),
    )
  })

  it('locks a scalar against an object and an object against a scalar', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { a: { b: 1 }, c: 1 }, 'house'))
    expect(Either.isLeft(mergeLocked(base, { a: 1 }, 'repo'))).toBe(true)
    expect(Either.isLeft(mergeLocked(base, { c: { d: 1 } }, 'repo'))).toBe(true)
  })
})
