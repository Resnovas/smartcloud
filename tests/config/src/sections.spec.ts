/**
 * @file tests/config/src/sections.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { Effect, Schema } from 'effect'
import { parseConfig, SmartcloudConfig } from '@resnovas/config'

describe('feature sections', () => {
  const full = `
version: 2
roles: { maintainers: [TGTGamer], trustedBots: ['dependabot[bot]'] }
links: { policyBase: 'https://github.com/Resnovas/.github/blob/main' }
commits: { dco: true, aiAttribution: true, aiIdentities: { emails: ['@example-ai\\.dev$'] }, maintainerLevel: warning }
disclosure: { fields: { level: 'AI level' }, requireDraft: true, maintainerLevel: warning }
reviews:
  gate: { outside: 2, maintainer: 1 }
  requestApprovals:
    maintainers: { reviewers: [TGTGamer], when: { condition: [{ type: isDraft, condition: false }] } }
  automaticApprove:
    dependabot: { when: { condition: [{ type: creatorMatches, condition: '^dependabot' }] }, message: Approved }
stale:
  on: [issue]
  staleAfterDays: 60
  staleLabel: stale
  abandonedAfterDays: 30
  abandonedLabel: abandoned
  close: false
  exempt: { labels: [pinned], when: { condition: [{ type: isLocked, condition: true }] } }
settings:
  merging: { mergeCommit: false, squash: true, rebase: true, squashTitle: PR_TITLE, squashMessage: COMMIT_MESSAGES }
  features: { wiki: false, discussions: true, sponsorships: true }
  security: { immutableReleases: true, codeScanning: extended, secretScanning: true }
  ruleset: { name: 'house: default branch', linearHistory: true, copilotReview: true, requiredChecks: ['smartcloud / policy'], adminBypass: true }
  environments: { projectType: saas }
sync:
  source: Resnovas/.github/templates@main
  values: { ORG_NAME: Resnovas }
  exclude: [LICENSE]
  branch: smartcloud/sync
  check: true
`

  it.effect('decode and round-trip every section', () =>
    Effect.gen(function* () {
      const { config } = yield* parseConfig(full, 'full.yml')
      expect(config.reviews?.gate).toStrictEqual({ outside: 2, maintainer: 1 })
      expect(config.settings?.security?.codeScanning).toBe('extended')
      expect(config.sync?.values).toStrictEqual({ ORG_NAME: 'Resnovas' })
      expect(Schema.decodeUnknownSync(SmartcloudConfig)(Schema.encodeSync(SmartcloudConfig)(config))).toStrictEqual(config)
    }),
  )

  it.effect('reject sync values whose keys are not SCREAMING_SNAKE_CASE', () =>
    Effect.map(Effect.flip(parseConfig('version: 2\nsync: { source: o/r/t, values: { orgName: x } }\n', 'x.yml')), (error) =>
      expect(error._tag).toBe('ConfigDecodeError'),
    ),
  )
})
