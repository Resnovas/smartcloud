// Synced from Resnovas/.github templates/tools/release/changelog-renderer.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
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

/** Preserve Nx changelog content while replacing its decorative markers and headings with house wording. */
export default class HouseChangelogRenderer extends DefaultChangelogRenderer {
  /** Replace only Nx's leading breaking marker; preserve the remainder of the rendered change. */
  protected override formatChange(change: ChangelogChange): string {
    // Let Nx own links and change text; replacing only its prefix preserves the upstream rendering contract.
    const line = super.formatChange(change)
    return line.startsWith(`- ${BREAKING_MARKER}`) ? `- **Breaking:** ${line.slice(2 + BREAKING_MARKER.length)}` : line
  }

  /** Replace the upstream section heading while retaining its breaking-change entries. */
  protected override renderBreakingChanges(): string[] {
    const [, ...rest] = super.renderBreakingChanges()
    return ['### Breaking changes', ...rest]
  }

  /** Await Nx author attribution and substitute a plain-language heading without changing contributor lines. */
  protected override async renderAuthors(): Promise<string[]> {
    return (await super.renderAuthors()).map(
      /** Keep contributor attribution intact and replace heading lines only. */ (line) =>
        line.startsWith('### ') ? '### Thank you' : line,
    )
  }
}
