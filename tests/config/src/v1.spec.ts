/**
 * @file tests/config/src/v1.spec.ts
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
import { Effect } from 'effect'
import { readFileSync } from 'node:fs'
import { migrateV1, parseConfig } from '@resnovas/config'

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

describe('v1 compatibility: the real configs', () => {
  it.effect("smartcloud's own v1 config decodes, with every label and rule carried over", () =>
    Effect.gen(function* () {
      const { config, warnings } = yield* parseConfig(fixture('v1-smartcloud.json'), 'smartcloud/.github/config.json')
      // 94 entries in v1's labels, one of which is its $schema string.
      expect(Object.keys(config.labels ?? {})).toHaveLength(93)
      expect(config.labels?.['bug']).toMatchObject({ name: expect.any(String), color: expect.any(String) })
      expect(config.labelling?.['shared.bug']?.label).toBe('bug')
      expect(config.labelling?.['shared.bug']?.on).toBeUndefined()
      expect(config.conventions?.rules?.['shared.0']).toStrictEqual({ preset: 'semanticEmoji' })
      expect(config.stale).toStrictEqual({
        staleAfterDays: 60,
        staleLabel: 'stale',
        staleComment: 'This has been automatically marked as stale by the bot.',
        abandonedAfterDays: 30,
        abandonedLabel: 'abandoned',
        abandonedComment: 'This has been automatically marked as abandoned by the bot.',
      })
      expect(config.reviews?.automaticApprove?.['pr.0']?.when.condition[0]).toMatchObject({ type: 'creatorMatches' })
      expect(config.reviews?.requestApprovals?.['pr.all']).toMatchObject({ reviewers: ['tgtgamer'], when: { requires: 1 } })
      expect(warnings).toEqual(
        expect.arrayContaining([
          'smartcloud/.github/config.json: runners[0].pr.manageRelease: dropped, releases are release-please territory, as the v1 README advised',
          'smartcloud/.github/config.json: runners[0].issue.createBranch: dropped, v1 never implemented it',
          'smartcloud/.github/config.json: runners[0].root: dropped, v1 never read it',
        ]),
      )
    }),
  )

  it.effect("Eventiva's labels-only config decodes: v1 could not run it at all", () =>
    Effect.gen(function* () {
      const { config, warnings } = yield* parseConfig(fixture('v1-eventiva.json'), 'eventiva/.github/config.json')
      expect(Object.keys(config.labels ?? {})).toContain('type:core')
      expect(config.labels?.['type:core']).toMatchObject({ name: 'type:core', color: '0E8A16' })
      expect(Object.keys(config.labels ?? {})).toHaveLength(10)
      expect(warnings).toStrictEqual([])
    }),
  )
})

describe('migrateV1: edge cases', () => {
  it('prefixes rule keys by runner when there are several runners', () => {
    const { config } = migrateV1({
      runners: [{ pr: { labels: { bug: { condition: [] } } } }, { issue: { labels: { bug: { condition: [] } } } }],
    })
    expect(Object.keys(config['labelling'] ?? {})).toStrictEqual(['r0.pr.bug', 'r1.issue.bug'])
    expect(config['labelling']).toMatchObject({ 'r0.pr.bug': { on: ['pullRequest'] }, 'r1.issue.bug': { on: ['issue'] } })
  })

  it('maps enforceConventions with messages, contexts, conditions and comment text', () => {
    const { config, warnings } = migrateV1({
      runners: [
        {
          issue: {
            enforceConventions: {
              commentHeader: 'Please fix:',
              commentFooter: 'Thanks',
              onColumn: ['In review'],
              condition: [
                { condition: 'semanticTitle', failedComment: 'Use a semantic title', contexts: ['core'] },
                { requires: 1, condition: [{ type: 'isOpen', condition: true }] },
                { condition: [{ type: 'isLocked', condition: false }] },
                'not a rule',
              ],
            },
          },
        },
      ],
    })
    expect(config['conventions']).toStrictEqual({
      comment: { header: 'Please fix:', footer: 'Thanks' },
      rules: {
        'issue.0': { on: ['issue'], message: 'Use a semantic title', contexts: ['core'], preset: 'semanticTitle' },
        'issue.1': { on: ['issue'], when: { requires: 1, condition: [{ type: 'isOpen', condition: true }] } },
        'issue.2': { on: ['issue'], when: { condition: [{ type: 'isLocked', condition: false }] } },
      },
    })
    expect(warnings).toContain('runners[0].issue.enforceConventions: onColumn and moveToColumn dropped, it used classic Projects, which GitHub has retired')
  })

  it('reports dropped, unknown and not-yet-migrated keys instead of losing them silently', () => {
    const { warnings } = migrateV1({
      extra: true,
      runners: [
        'not a runner',
        { project: { syncRemote: {} }, mystery: 1, schedule: 'not an object', pr: { wat: 1, requestApprovals: {} } },
      ],
    })
    expect(warnings).toStrictEqual([
      'runners[1].project: dropped, it used classic Projects, which GitHub has retired',
      'runners[1].mystery: unknown v1 key, ignored',
      'runners[1].pr.wat: unknown v1 key, ignored',
      'extra: unknown v1 key, ignored',
    ])
  })

  it('skips malformed labels, keeps descriptions, and slugs array names', () => {
    const { config } = migrateV1({
      labels: [{ name: 'Needs Review!', color: 'ffffff', description: 'd' }, { name: 3 }, 'x'],
    })
    expect(config['labels']).toStrictEqual({ 'needs-review-': { name: 'Needs Review!', color: 'ffffff', description: 'd' } })
    expect(migrateV1({ labels: { a: { name: 'a' }, b: 'x' } }).config['labels']).toBeUndefined()
  })

  it('handles enforceConventions with no rules, and a rule with no condition', () => {
    expect(migrateV1({ runners: [{ pr: { enforceConventions: { commentFooter: 'f' } } }] }).config['conventions']).toStrictEqual({
      comment: { footer: 'f' },
      rules: {},
    })
    const { config } = migrateV1({ runners: [{ sharedConfig: { enforceConventions: { condition: [{ requires: 1 }, {}] } } }] })
    expect(config['conventions']).toStrictEqual({
      rules: { 'shared.0': { when: { requires: 1, condition: [] } }, 'shared.1': { when: { condition: [] } } },
    })
  })

  it('maps stale, approvals and review requests, keeping only the first stale section', () => {
    const { config, warnings } = migrateV1({
      runners: [
        {
          issue: { stale: { stale: {} } },
          pr: {
            stale: { staleLabel: 'old' },
            automaticApprove: { condition: [{ condition: [{ type: 'isDraft', condition: false }] }, 'x'] },
            requestApprovals: { team: { reviewers: ['ann'], condition: [] }, bad: { condition: [] }, odd: 'x' },
          },
        },
      ],
    })
    expect(config['stale']).toStrictEqual({ on: ['issue'], staleAfterDays: 60, staleLabel: 'stale' })
    expect(config['reviews']).toStrictEqual({
      requestApprovals: { 'pr.team': { reviewers: ['ann'], when: { condition: [] } } },
      automaticApprove: { 'pr.0': { when: { condition: [{ type: 'isDraft', condition: false }] } } },
    })
    expect(warnings).toStrictEqual(['runners[0].pr.stale: dropped, v2 has one stale section and an earlier context already set it'])
    expect(migrateV1({ runners: [{ pr: { requestApprovals: { a: { reviewers: [] } }, automaticApprove: {} } }] }).config['reviews']).toStrictEqual({
      requestApprovals: { 'pr.a': { reviewers: [], when: { condition: [] } } },
    })
  })

  it('produces a bare version 2 config from an empty v1 config', () => {
    expect(migrateV1({}).config).toStrictEqual({ version: 2 })
  })
})
