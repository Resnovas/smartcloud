/**
 * @file tools/release/changelog-renderer.ts
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

// Renders the release notes Nx release writes to each GitHub release.
//
// Nx's default renderer, with its emoji headings and markers replaced by
// words, for the house style. nx.json points release.changelog at this file.

import renderer, { type ChangelogChange } from 'nx/release/changelog-renderer'

// The module is CommonJS, so from ESM its default export sits on the namespace's default.
const DefaultChangelogRenderer = renderer.default

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
