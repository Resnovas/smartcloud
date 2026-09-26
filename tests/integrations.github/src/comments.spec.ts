/**
 * @file tests/integrations.github/src/comments.spec.ts
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
import { isTrustedComment } from '@resnovas/integrations.github'

describe('isTrustedComment', () => {
  const by = (author: string, bot: boolean) => ({ id: 1, body: '<!-- smartcloud:report -->', author, bot })

  it('trusts bot accounts and listed logins, ignoring case and a leading @', () => {
    expect(isTrustedComment(by('smartcloud[bot]', true))).toBe(true)
    expect(isTrustedComment(by('Release-Robot', false), ['@release-robot'])).toBe(true)
    expect(isTrustedComment(by('@release-robot', false), ['Release-Robot'])).toBe(true)
  })

  it('does not trust a person, however their comment is worded', () => {
    expect(isTrustedComment(by('mallory', false))).toBe(false)
    expect(isTrustedComment(by('mallory', false), ['release-robot'])).toBe(false)
  })
})
