/**
 * @file ai-docs/src/80_release-and-ci/10_release-preview.ts
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

/**
 * @title Reading the bump a pull request's squash commit calls for
 *
 * The merge queue squashes a pull request into one commit: its title with the
 * number added, over its commits' messages. A `BREAKING CHANGE:` in any of
 * those messages makes the whole commit a major release, whatever the title's
 * type, which is what the release preview reports.
 */
// The release preview is a repository tool, not a workspace library, so no
// package name reaches it; the example imports it by path on purpose.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { bumpOf, renderPreview, squashMessage } from '../../../tools/release/preview.js'

const types = { feat: { semverBump: 'minor' }, fix: { semverBump: 'patch' } }

const message = squashMessage('feat(labels): colour aliases', 712, [
  'feat(labels): colour aliases',
  'fix(labels): drop the old colour field\n\nBREAKING CHANGE: labels.color is now labels.colour',
])

// 'major'
export const bump = bumpOf(message, types)

export const report = renderPreview({
  version: '3.0.0',
  current: '2.4.1',
  firstRelease: false,
  commit: message.split('\n')[0],
  bump,
  notes: '## 3.0.0\n\n### Breaking changes\n\n- **labels:** drop the old colour field',
})
