/**
 * @file tools/release/changelog-renderer.ts
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

// Renders the release notes Nx release writes to each GitHub release, to the
// workspace CHANGELOG.md and to each app's CHANGELOG.md.
//
// Nx's default renderer, with its emoji headings and markers replaced by
// words, for the house style. nx.json points release.changelog's workspace and
// project changelogs at this file.

import { createRequire } from 'node:module'
import type renderer from 'nx/release/changelog-renderer'
import type { ChangelogChange } from 'nx/release/changelog-renderer'

// The module is CommonJS. Node's ESM loader and Vitest disagree on where its
// default export lands on a default import, so it is required, which both load
// the same way.
const { default: DefaultChangelogRenderer } = createRequire(import.meta.url)(
  'nx/release/changelog-renderer',
) as typeof renderer

// The warning sign Nx puts before a breaking change, written as escapes.
const BREAKING_MARKER = '\u26a0\ufe0f  '

export default class SmartcloudChangelogRenderer extends DefaultChangelogRenderer {
  protected override formatChange(change: ChangelogChange): string {
    const line = super.formatChange(change)
    return line.startsWith(`- ${BREAKING_MARKER}`) ? `- **Breaking:** ${line.slice(2 + BREAKING_MARKER.length)}` : line
  }

  protected override renderBreakingChanges(): string[] {
    const [, ...rest] = super.renderBreakingChanges()
    return ['### Breaking changes', ...rest]
  }

  protected override async renderAuthors(): Promise<string[]> {
    return (await super.renderAuthors()).map((line) => (line.startsWith('### ') ? '### Thank you' : line))
  }
}
