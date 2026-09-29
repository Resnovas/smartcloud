/**
 * @file tests/conditions/src/trailers.spec.ts
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
import { hasKey, parseIdentity, parseTrailers } from '@resnovas/conditions'

describe('trailers', () => {
  it('parses every Key: value line', () => {
    const trailers = parseTrailers(
      'feat: x\n\nbody text\n\nCo-authored-by: Claude <noreply@anthropic.com>\nSigned-off-by: Jane Doe <jane@example.com>',
    )
    expect(trailers.map((trailer) => trailer.key)).toStrictEqual(['Co-authored-by', 'Signed-off-by'])
    expect(trailers[1]?.value).toBe('Jane Doe <jane@example.com>')
  })

  it('ignores lines that are not trailers', () => {
    expect(parseTrailers('fix: x\n\njust a sentence\n: no key')).toStrictEqual([])
  })

  it('never reads the subject line as a trailer', () => {
    expect(parseTrailers('feat: add x')).toStrictEqual([])
    expect(parseTrailers('feat: add x\n\nbody\n\nRefs: SMC-3\n')).toStrictEqual([{ key: 'Refs', value: 'SMC-3' }])
  })

  it('splits identities and lower-cases the email', () => {
    expect(parseIdentity('Jane Doe <Jane@Example.com>')).toStrictEqual({ name: 'Jane Doe', email: 'jane@example.com' })
    expect(parseIdentity('no email here')).toBeUndefined()
  })

  it('rejects identities without a well-formed <email>', () => {
    expect(parseIdentity('Jane <>')).toBeUndefined()
    expect(parseIdentity('Jane <a>b>')).toBeUndefined()
    expect(parseIdentity('Jane <jane@example.com')).toBeUndefined()
    expect(parseIdentity('<jane@example.com>')).toStrictEqual({ name: '', email: 'jane@example.com' })
  })

  it('keeps only well-formed trailer lines in the final paragraph', () => {
    expect(parseTrailers('x\n\nFixes: #1\nnot a trailer\nBad Key: x\nEmpty:\n:nokey')).toStrictEqual([
      { key: 'Fixes', value: '#1' },
    ])
  })

  it('parses adversarial messages in linear time (CodeQL js/polynomial-redos)', () => {
    const spaces = ' '.repeat(50_000)
    const started = performance.now()
    parseTrailers(`x\n\nA:!${spaces}`)
    parseTrailers(`x\n\n${'a'.repeat(50_000)}:${spaces}x`)
    parseIdentity(`<${'<='.repeat(25_000)}`)
    parseIdentity(`${spaces}<`)
    expect(performance.now() - started).toBeLessThan(200)
  })

  it('matches keys without regard to case', () => {
    expect(hasKey({ key: 'SIGNED-OFF-BY', value: '' }, 'signed-off-by')).toBe(true)
    expect(hasKey({ key: 'Signed-off-by', value: '' }, 'co-authored-by')).toBe(false)
  })
})
