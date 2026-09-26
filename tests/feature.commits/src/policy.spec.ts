/**
 * @file tests/feature.commits/src/policy.spec.ts
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
import { authorRole, DEFAULT_POLICY_BASE, levelFor, policyBase, sameLogin } from '@resnovas/feature.commits'

describe('roles', () => {
  it('compares logins ignoring case and a leading @', () => {
    expect(sameLogin('@Jane', 'jane')).toBe(true)
    expect(sameLogin('jane', '@JANE')).toBe(true)
    expect(sameLogin('jane', 'john')).toBe(false)
  })

  it('works out the author role', () => {
    const roles = { maintainers: ['Owner-One'], trustedBots: ['renovate[bot]'] }
    expect(authorRole('RENOVATE[bot]', roles)).toBe('bot')
    expect(authorRole('owner-one', roles)).toBe('maintainer')
    expect(authorRole('someone', roles, 'Someone')).toBe('maintainer')
    expect(authorRole('someone', roles, 'Resnovas')).toBe('contributor')
    expect(authorRole('someone', undefined)).toBe('contributor')
  })

  it('downgrades maintainer errors, except AI-03', () => {
    expect(levelFor('maintainer', 'DCO', undefined)).toBe('warning')
    expect(levelFor('maintainer', 'DCO', 'error')).toBe('error')
    expect(levelFor('maintainer', 'AI-03', 'warning')).toBe('error')
    expect(levelFor('contributor', 'DCO', 'warning')).toBe('error')
  })

  it('links to links.policyBase without a trailing slash, or the Resnovas governance repository', () => {
    expect(policyBase({ version: 2 })).toBe(DEFAULT_POLICY_BASE)
    expect(policyBase({ version: 2, links: { policyBase: 'https://example.com/p//' } })).toBe('https://example.com/p')
  })
})
