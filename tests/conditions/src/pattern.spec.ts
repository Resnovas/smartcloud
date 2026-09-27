/**
 * @file tests/conditions/src/pattern.spec.ts
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
import { Either, Schema } from 'effect'
import { compilePattern, Pattern } from '@resnovas/conditions'

describe('Pattern', () => {
  it('compiles bare and delimited patterns the way v1 did', () => {
    expect(compilePattern('^feat').source).toBe('^feat')
    expect(compilePattern('/^feat/gi').flags).toBe('gi')
    expect(compilePattern('/a/b/').source).toBe('a\\/b')
  })

  it('rejects an invalid pattern when the config is decoded', () => {
    const result = Schema.decodeUnknownEither(Pattern)('(unclosed')
    expect(Either.isLeft(result)).toBe(true)
    expect(String(Either.isLeft(result) && result.left)).toContain('invalid pattern "(unclosed"')
  })

  it('refuses a pattern open to catastrophic backtracking, naming it', () => {
    expect(() => compilePattern('^(a+)+$')).toThrow('catastrophic backtracking')
    expect(() => compilePattern('/^(A|a)+$/i')).toThrow('catastrophic backtracking')
    expect(compilePattern('/^(A|a)+$/').source).toBe('^(A|a)+$')
    const result = Schema.decodeUnknownEither(Pattern)('^(a+)+$')
    expect(String(Either.isLeft(result) && result.left)).toContain(
      'invalid pattern "^(a+)+$": the repeated part around character 3 can match the same text in more than one way',
    )
  })

  it('checks each pattern once, however often it is compiled', () => {
    for (let index = 0; index < 1_100; index += 1) expect(compilePattern(`^x${index}`).test(`x${index}`)).toBe(true)
    expect(compilePattern('^x1').test('x1')).toBe(true)
    expect(() => compilePattern('^(a+)+$')).toThrow('catastrophic backtracking')
  })
})
