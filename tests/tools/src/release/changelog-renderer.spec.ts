/**
 * @file tests/tools/src/release/changelog-renderer.spec.ts
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
import type { ChangelogChange } from 'nx/release/changelog-renderer'
import SmartcloudChangelogRenderer from '../../../../tools/release/changelog-renderer.js'

type Config = ConstructorParameters<typeof SmartcloudChangelogRenderer>[0]

const change = (overrides: Partial<ChangelogChange>): ChangelogChange => ({
  type: 'feat',
  scope: 'cli',
  description: 'add the plan command',
  affectedProjects: ['@resnovas/smartcloud'],
  authors: [{ name: 'Ada Lovelace', email: 'ada@example.com' }],
  ...overrides,
})

const changes: ChangelogChange[] = [
  change({}),
  change({
    type: 'fix',
    scope: 'action',
    description: 'drop the v1 inputs',
    affectedProjects: ['@resnovas/action'],
    isBreaking: true,
    body: 'BREAKING CHANGE: the v1 inputs are gone.',
  }),
]

// No remote repository, so the renderer adds no links and looks up no usernames.
const remoteReleaseClient = { getRemoteRepoData: () => null } as unknown as Config['remoteReleaseClient']

const render = (project: string | null, authors = true) =>
  new SmartcloudChangelogRenderer({
    changes,
    changelogEntryVersion: '2.1.0',
    project,
    entryWhenNoChanges: false,
    isVersionPlans: false,
    changelogRenderOptions: { authors, versionTitleDate: false },
    conventionalCommitsConfig: {
      useCommitScope: true,
      types: {
        feat: { semverBump: 'minor', changelog: { title: 'Features', hidden: false } },
        fix: { semverBump: 'patch', changelog: { title: 'Bug fixes', hidden: false } },
      },
    },
    remoteReleaseClient,
  }).render()

describe('SmartcloudChangelogRenderer', () => {
  it('renders the workspace notes, for the GitHub release and CHANGELOG.md, in words', async () => {
    const notes = await render(null)
    expect(notes).toContain('### Features\n\n- **cli:** add the plan command')
    expect(notes).toContain('- **Breaking:** **action:** drop the v1 inputs')
    expect(notes).toContain('### Breaking changes\n\n- **action:** drop the v1 inputs\n  the v1 inputs are gone.')
    expect(notes).toContain('### Thank you\n\n- Ada Lovelace')
    expect(notes).not.toMatch(/\p{Extended_Pictographic}/u)
  })

  it('renders a project changelog with only the changes to that project', async () => {
    const notes = await render('@resnovas/action')
    expect(notes).toContain('- **Breaking:** **action:** drop the v1 inputs')
    expect(notes).not.toContain('add the plan command')
    expect(notes).not.toMatch(/\p{Extended_Pictographic}/u)
  })

  it('leaves the authors out when they are turned off', async () => {
    expect(await render(null, false)).not.toContain('### Thank you')
  })
})
