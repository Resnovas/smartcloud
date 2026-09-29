/**
 * @file tests/integrations.posthog/src/identity.spec.ts
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
import { identify } from '@resnovas/integrations.posthog'
import { createHash } from 'node:crypto'

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

describe('identify', () => {
  it('hashes the lower-cased full name and owner', () => {
    expect(identify({ owner: 'Resnovas', repo: 'SmartCloud' })).toStrictEqual({
      distinctId: sha256('resnovas/smartcloud'),
      organization: sha256('resnovas'),
    })
  })

  it('never contains the names', () => {
    const identity = JSON.stringify(identify({ owner: 'Resnovas', repo: 'smartcloud' }))
    expect(identity).not.toContain('Resnovas')
    expect(identity).not.toContain('smartcloud')
  })
})
