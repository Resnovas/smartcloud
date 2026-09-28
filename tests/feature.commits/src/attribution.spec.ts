/**
 * @file tests/feature.commits/src/attribution.spec.ts
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
import { classifyAttribution, isAiIdentity, readAttribution } from '@resnovas/feature.commits'

describe('readAttribution', () => {
  it('parses trailers case-insensitively, lower-casing emails', () => {
    const { coAuthors, signOffs } = readAttribution(
      'x\n\nco-authored-by: Bot <A@Anthropic.com>\nSIGNED-OFF-BY: Me <me@x.io>',
    )
    expect(coAuthors).toStrictEqual([{ name: 'Bot', email: 'a@anthropic.com' }])
    expect(signOffs).toStrictEqual([{ name: 'Me', email: 'me@x.io' }])
  })

  it('parses Assisted-by in the kernel form', () => {
    expect(readAttribution('x\n\nAssisted-by: claude-code:claude-opus-5-5 ripgrep\n').assistedBy).toStrictEqual([
      'claude-code:claude-opus-5-5 ripgrep',
    ])
  })

  it('ignores identity trailers without an email', () => {
    expect(readAttribution('x\n\nSigned-off-by: Nobody\nCo-authored-by: Claude').signOffs).toStrictEqual([])
  })
})

describe('classifyAttribution', () => {
  const isAi = (identity: { readonly name: string; readonly email: string }) => isAiIdentity(identity)

  it('an AI co-author or any Assisted-by credits an AI tool', () => {
    expect(classifyAttribution('x\n\nCo-authored-by: Claude <noreply@anthropic.com>', isAi)).toMatchObject({
      aiCoAuthored: true,
      aiAttributed: true,
    })
    expect(classifyAttribution('x\n\nAssisted-by: aider:gpt-5', isAi)).toMatchObject({
      aiCoAuthored: false,
      aiAttributed: true,
    })
    expect(classifyAttribution('x\n\nCo-authored-by: Jane <jane@example.com>', isAi)).toMatchObject({
      aiCoAuthored: false,
      aiAttributed: false,
    })
  })
})
