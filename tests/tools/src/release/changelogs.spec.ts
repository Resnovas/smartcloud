/**
 * @file tests/tools/src/release/changelogs.spec.ts
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
import { changedChangelogs } from '../../../../tools/release/changelogs.js'

describe('changedChangelogs', () => {
  it('keeps the workspace and project changelogs, in order', () => {
    const changed = [
      'apps/action/package.json',
      'CHANGELOG.md',
      'apps/cli/CHANGELOG.md',
      'dist/index.js',
      'apps/mcp/CHANGELOG.md',
    ]
    expect(changedChangelogs(changed.join('\n'))).toEqual([
      'CHANGELOG.md',
      'apps/cli/CHANGELOG.md',
      'apps/mcp/CHANGELOG.md',
    ])
  })

  it('ignores files that only end like a changelog', () => {
    expect(changedChangelogs('docs/OLD-CHANGELOG.md\nCHANGELOG.mdx')).toEqual([])
  })

  it('finds nothing when nothing changed', () => {
    expect(changedChangelogs('')).toEqual([])
  })
})
