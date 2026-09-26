/**
 * @file tests/mcp/src/version.spec.ts
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
import { stampedVersion, VERSION } from '@resnovas/smartcloud-mcp'

describe('version', () => {
  it('is 0.0.0 until a release bundle stamps it', () => {
    expect(VERSION).toBe('0.0.0')
    expect(stampedVersion(undefined)).toBe('0.0.0')
    expect(stampedVersion('2.0.0')).toBe('2.0.0')
  })
})
