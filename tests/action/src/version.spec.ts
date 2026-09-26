/**
 * @file tests/action/src/version.spec.ts
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
import { VERSION } from '@resnovas/action'
import { vi } from 'vitest'

// Stamp the version as a release bundle does, before the action is loaded.
// An unbundled build's 0.0.0 is checked in the CLI and MCP tests, which share
// this module's logic.
vi.hoisted(() => {
  globalThis.__SMARTCLOUD_VERSION__ = '2.0.0'
})

describe('version', () => {
  it('is the version a release bundle stamps', () => {
    expect(VERSION).toBe('2.0.0')
  })
})
