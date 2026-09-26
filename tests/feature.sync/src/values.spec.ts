/**
 * @file tests/feature.sync/src/values.spec.ts
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
import { Either } from 'effect'
import { list, parseValues, unquote } from '@resnovas/feature.sync'

describe('values', () => {
  it('parse flat keys, strip comments and one pair of quotes', () => {
    const values = parseValues('# heading\nORG_NAME: Resnovas  # trailing\nURL: "https://x.io/#a"\n\nEMPTY:\n')
    expect(values).toStrictEqual(Either.right({ ORG_NAME: 'Resnovas', URL: 'https://x.io/#a', EMPTY: '' }))
  })

  it('reject anything that is not KEY: value, naming the file and line', () => {
    const lower = parseValues('lower: nope', 'house.yml')
    expect(Either.isLeft(lower) && lower.left.message).toBe('house.yml:1: expected "KEY: value", got "lower: nope"')
    const item = parseValues('A: 1\r\n- a list\r\n')
    expect(Either.isLeft(item) && item.left.message).toBe('values:2: expected "KEY: value", got "- a list"')
  })

  it('stay linear on long lines of whitespace', () => {
    const line = `KEY: a${' '.repeat(100_000)}b`
    expect(parseValues(line)).toStrictEqual(Either.right({ KEY: `a${' '.repeat(100_000)}b` }))
  })

  it('unquote only a matching pair', () => {
    expect(unquote('"a"')).toBe('a')
    expect(unquote("'a'")).toBe('a')
    expect(unquote('"a\'')).toBe('"a\'')
    expect(unquote('"')).toBe('"')
    expect(unquote('a')).toBe('a')
  })
})

describe('list', () => {
  it('splits on commas and drops blanks', () => {
    expect(list(' a, b ,, c ')).toStrictEqual(['a', 'b', 'c'])
    expect(list(undefined)).toStrictEqual([])
  })
})
