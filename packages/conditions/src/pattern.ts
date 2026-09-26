/**
 * @file packages/conditions/src/pattern.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Schema } from 'effect'

// v1 wrote patterns either as a bare regular expression source or as
// `/source/flags`; both forms keep working.
const DELIMITED = /^\/(.*)\/([a-z]*)$/s

/**
 * Compiles a smartcloud pattern string into a regular expression.
 *
 * @remarks
 * A pattern is either a bare regular expression source (`^feat`) or a
 * delimited one with flags (`/^feat/i`), exactly as v1 read them. The config
 * schema rejects invalid patterns, so this only throws for strings that never
 * passed through {@link Pattern}.
 *
 * @example
 * ```ts import.meta.vitest name="compilePattern"
 * import { compilePattern } from '@resnovas/conditions'
 *
 * compilePattern('/^fix/i').test('Fix: typo') // => true
 * compilePattern('^feat').source // => '^feat'
 * ```
 *
 * @param pattern - The pattern as written in the config.
 * @returns The compiled regular expression.
 */
export const compilePattern = (pattern: string): RegExp => {
  const delimited = DELIMITED.exec(pattern)
  return delimited ? new RegExp(delimited[1] ?? '', delimited[2]) : new RegExp(pattern)
}

/**
 * A regular expression written as a string, validated when the config is
 * decoded so a typo fails at startup rather than on the first event.
 *
 * @example
 * ```ts import.meta.vitest name="Pattern"
 * import { Pattern } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Pattern)('/^feat/i') // => true
 * Schema.is(Pattern)('(unclosed') // => false
 * ```
 */
export const Pattern = Schema.String.pipe(
  Schema.filter(
    (pattern) => {
      try {
        compilePattern(pattern)
        return true
      } catch (error) {
        return `invalid pattern ${JSON.stringify(pattern)}: ${error instanceof Error ? error.message : String(error)}`
      }
    },
    { identifier: 'Pattern', description: 'A regular expression, bare or as /source/flags.' },
  ),
)
