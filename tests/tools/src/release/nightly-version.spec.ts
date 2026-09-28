/**
 * @file tests/tools/src/release/nightly-version.spec.ts
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
import { nightlyTakesMajor, nightlyVersion } from '../../../../tools/release/nightly-version.js'

const DAY = new Date('2026-09-27T03:00:00Z')

describe('nightlyVersion', () => {
  it('previews <major>.0.0 before the first stable release', () => {
    expect(nightlyVersion(['1.0.0-beta.8', 'v1.0.0'], 2, DAY)).toBe('2.0.0-nightly.20260927')
  })

  it('previews the next patch after the newest stable release of the major', () => {
    expect(nightlyVersion(['v2.0.0', 'v2.1.3', 'v2.1.10', 'v2.1.10-nightly.20260926', 'v3.0.0'], 2, DAY)).toBe(
      '2.1.11-nightly.20260927',
    )
  })

  it('numbers a second nightly on the same day', () => {
    expect(nightlyVersion(['v2.0.0-nightly.20260927'], 2, DAY)).toBe('2.0.0-nightly.20260927.1')
    expect(nightlyVersion(['v2.0.0-nightly.20260927', 'v2.0.0-nightly.20260927.1'], 2, DAY)).toBe(
      '2.0.0-nightly.20260927.2',
    )
  })
})

describe('nightlyTakesMajor', () => {
  it('moves the major tag until the major has a stable release', () => {
    expect(nightlyTakesMajor(['v1.0.0', 'v2.0.0-nightly.20260927'], 2)).toBe(true)
    expect(nightlyTakesMajor(['v2.0.0'], 2)).toBe(false)
  })
})
