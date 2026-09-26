/**
 * @file tests/conditions/src/trailers.spec.ts
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

  it('matches keys without regard to case', () => {
    expect(hasKey({ key: 'SIGNED-OFF-BY', value: '' }, 'signed-off-by')).toBe(true)
    expect(hasKey({ key: 'Signed-off-by', value: '' }, 'co-authored-by')).toBe(false)
  })
})
