/**
 * @file tests/integrations.posthog/src/redact.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { redact, REDACTED } from '@resnovas/integrations.posthog'

describe('redact', () => {
  it('removes GitHub tokens of every kind', () => {
    const tokens = ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_'].map((prefix) => `${prefix}abcdefghijklmnopqrstuvwxyz0123`)
    for (const token of [...tokens, 'github_pat_11ABCDEFG0123456789_abcdefghijklmnop']) {
      expect(redact(`failed with ${token} here`)).toBe(`failed with ${REDACTED} here`)
    }
  })

  it('removes bearer credentials and emails', () => {
    expect(redact('Authorization: Bearer abc.def-ghi==')).toBe(`Authorization: ${REDACTED}`)
    expect(redact('by jane.doe+x@example.co.uk today')).toBe(`by ${REDACTED} today`)
  })

  it('removes given secrets, ignoring case and URL encoding, longest first', () => {
    const text = 'Resnovas/SmartCloud at /repos/resnovas%2Fsmartcloud by resnovas'
    expect(redact(text, ['resnovas/smartcloud', 'resnovas'])).toBe(`${REDACTED} at /repos/${REDACTED} by ${REDACTED}`)
  })

  it('treats secrets as text, and ignores ones too short to be safe to remove', () => {
    expect(redact('a.b and a+b', ['a+b', 'ab'])).toBe(`a.b and ${REDACTED}`)
  })

  it('leaves clean text alone', () => {
    expect(redact('nothing to see', [])).toBe('nothing to see')
    expect(redact('nothing to see')).toBe('nothing to see')
  })

  it('stays fast on long hostile input', () => {
    const hostile = `${'a'.repeat(50_000)}@${'b'.repeat(50_000)}`
    const start = performance.now()
    redact(hostile, ['x/y'])
    expect(performance.now() - start).toBeLessThan(1000)
  })
})
