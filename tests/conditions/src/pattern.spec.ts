/**
 * @file tests/conditions/src/pattern.spec.ts
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
})
