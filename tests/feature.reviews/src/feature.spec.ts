/**
 * @file tests/feature.reviews/src/feature.spec.ts
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
import type { Review } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { FEATURE, reviewsFeature } from '@resnovas/feature.reviews'
import { Forbidden, GitHub, makeMemoryGitHub, RateLimited } from '@resnovas/integrations.github'
import { Effect, Exit } from 'effect'

// A pull request payload with the fields GitHub sends, as in the engine tests.
const payload = (author = 'contributor', action = 'submitted') => ({
  action,
  pull_request: {
    number: 7,
    title: 'build(deps): bump effect',
    body: 'Bumps effect.',
    user: { login: author },
    state: 'open',
    locked: false,
    labels: [{ name: 'dependencies' }],
    updated_at: '2026-09-01T00:00:00Z',
    draft: false,
    head: { ref: 'dependabot/npm/effect', sha: 'abc123' },
    additions: 2,
    deletions: 2,
  },
})

const memory = (reviews: Array<Review> = [], files: Array<string> = ['package.json']) =>
  makeMemoryGitHub({
    pulls: new Map([[7, { commits: [], files, reviews, requestedReviewers: [], submittedReviews: [] }]]),
  })

const roles = { maintainers: ['owner-one', 'owner-two'], trustedBots: ['dependabot[bot]'] }

const run = (
  config: SmartcloudConfig,
  github = memory(),
  options: { readonly author?: string; readonly event?: string } = {},
) =>
  Effect.map(
    runFeatures({
      config,
      event: options.event ?? 'pull_request_review',
      payload: payload(options.author),
      features: [reviewsFeature],
    }).pipe(Effect.provideService(GitHub, github.service)),
    (result) => ({ result, state: github.state }),
  )

const pull = (state: ReturnType<typeof memory>['state']) => state.pulls.get(7)

// GitHub as a fork pull request's read-only token sees it: every review write is forbidden.
const readOnly = (reviews: Array<Review> = []) => {
  const github = memory(reviews)
  const forbidden = (operation: string) => () => Effect.fail(new Forbidden({ operation, detail: 'Resource not accessible by integration' }))
  return { ...github, service: { ...github.service, requestReviewers: forbidden('requestReviewers'), createReview: forbidden('createReview') } }
}

describe('reviewsFeature', () => {
  it('handles pull requests, and is enabled only by a reviews section', () => {
    expect(reviewsFeature.name).toBe(FEATURE)
    expect(reviewsFeature.handles).toStrictEqual(['pullRequest'])
    expect(reviewsFeature.enabled?.({ version: 2 })).toBe(false)
    expect(reviewsFeature.enabled?.({ version: 2, reviews: {} })).toBe(true)
  })

  it('loads the reviews and pending reviewer facets, plus what its rules need', () => {
    expect([...(reviewsFeature.facets?.({ version: 2 }) ?? [])]).toStrictEqual(['reviews', 'pendingReviewers'])
    const config: SmartcloudConfig = {
      version: 2,
      reviews: {
        requestApprovals: {
          docs: { reviewers: ['ann'], when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } },
        },
        automaticApprove: { deps: { when: { condition: [{ type: 'commitsSignedOff', condition: true }] } } },
      },
    }
    expect([...(reviewsFeature.facets?.(config) ?? [])].sort()).toStrictEqual([
      'commits',
      'files',
      'pendingReviewers',
      'reviews',
    ])
  })

  it('does nothing when the reviews section has no rules', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result } = yield* run({ version: 2, reviews: {} })
        expect(result.ran).toStrictEqual([FEATURE])
        expect(result.findings).toStrictEqual([])
        expect(result.changes).toStrictEqual([])
      }),
    ))

  it('skips when the config has no reviews section, even if run directly', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const report = yield* makeReport
        yield* reviewsFeature
          .run({ config: { version: 2 }, envelope: { kind: 'repository', event: 'schedule' } })
          .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, memory().service))
        expect(yield* report.snapshot).toStrictEqual({ findings: [], changes: [] })
      }),
    ))

  it('fails with MissingFacet rather than gating on reviews it was not given', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const report = yield* makeReport
        const exit = yield* Effect.exit(
          reviewsFeature
            .run({ config: { version: 2, reviews: { gate: {} } }, envelope: { kind: 'repository', event: 'schedule' } })
            .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, memory().service)),
        )
        expect(Exit.isFailure(exit)).toBe(true)
        expect(String(Exit.isFailure(exit) ? exit.cause : '')).toContain('MissingFacet')
      }),
    ))
})

describe('review gate', () => {
  it('is open with fewer than two maintainers: a notice, linked to the default policy base', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result } = yield* run({ version: 2, roles: { maintainers: ['owner-one'] }, reviews: { gate: {} } })
        expect(result.findings).toStrictEqual([
          {
            feature: FEATURE,
            rule: 'REVIEW',
            level: 'notice',
            message:
              'Fewer than two maintainers are configured, so the review gate is open and the owner merges at their discretion.',
            link: 'https://github.com/Resnovas/.github/blob/main/GOVERNANCE.md#review',
          },
        ])
      }),
    ))

  it('is open with no roles at all', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result } = yield* run({ version: 2, reviews: { gate: {} } })
        expect(result.findings.map((finding) => finding.level)).toStrictEqual(['notice'])
      }),
    ))

  it('fails an outside contribution with one approval, linking to the configured policy base', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result } = yield* run(
          { version: 2, roles, links: { policyBase: 'https://example.com/policy' }, reviews: { gate: {} } },
          memory([{ author: 'owner-one', state: 'APPROVED' }]),
        )
        expect(result.findings).toStrictEqual([
          {
            feature: FEATURE,
            rule: 'REVIEW',
            level: 'error',
            message:
              'Needs 2 maintainer approval(s) from someone other than the author; has 1 (approved by @owner-one).',
            link: 'https://example.com/policy/GOVERNANCE.md#review',
          },
        ])
      }),
    ))

  it('passes silently once enough maintainers approve, re-evaluated on the review event', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result } = yield* run(
          { version: 2, roles, reviews: { gate: {} } },
          memory([
            { author: 'owner-one', state: 'APPROVED' },
            { author: 'owner-two', state: 'APPROVED' },
          ]),
        )
        expect(result.envelope).toMatchObject({ kind: 'pullRequest', event: 'pull_request_review' })
        expect(result.findings).toStrictEqual([])
      }),
    ))

  it('uses the maintainer threshold for a maintainer author and ignores their own approval', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const own = yield* run(
          { version: 2, roles, reviews: { gate: {} } },
          memory([{ author: 'owner-one', state: 'APPROVED' }]),
          {
            author: 'owner-one',
          },
        )
        expect(own.result.findings.map((finding) => finding.message)).toStrictEqual([
          'Needs 1 other maintainer approval(s) from someone other than the author; has 0 (approved by nobody yet).',
        ])
        const custom = yield* run(
          { version: 2, roles, reviews: { gate: { maintainer: 2, outside: 3 } } },
          memory([{ author: 'owner-two', state: 'APPROVED' }]),
          {
            author: 'owner-one',
          },
        )
        expect(custom.result.findings.map((finding) => finding.message)).toStrictEqual([
          'Needs 2 other maintainer approval(s) from someone other than the author; has 1 (approved by @owner-two).',
        ])
      }),
    ))

  it('lets a trusted bot skip the gate with a notice', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result } = yield* run({ version: 2, roles, reviews: { gate: {} } }, memory(), {
          author: 'dependabot[bot]',
        })
        expect(result.findings).toMatchObject([
          {
            rule: 'REVIEW',
            level: 'notice',
            message: '@dependabot[bot] is a trusted bot, so the review gate does not apply.',
          },
        ])
      }),
    ))
})

describe('requestApprovals', () => {
  it('requests each passing rule reviewers except the author, and records a change', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result, state } = yield* run(
          {
            version: 2,
            reviews: {
              requestApprovals: {
                deps: {
                  reviewers: ['@owner-one', 'Contributor', 'owner-two'],
                  when: { condition: [{ type: 'filesMatch', condition: '*.json' }] },
                },
                docs: { reviewers: ['ann'], when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } },
                self: { reviewers: ['contributor'], when: { condition: [] } },
              },
            },
          },
          memory(),
          { event: 'pull_request' },
        )
        expect(pull(state)?.requestedReviewers).toStrictEqual(['owner-one', 'owner-two'])
        expect(result.changes).toStrictEqual([
          { feature: FEATURE, description: 'Requested review from @owner-one, @owner-two on #7 (deps).' },
        ])
      }),
    ))

  it('does not request a review again from someone who has already reviewed', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const config: SmartcloudConfig = {
          version: 2,
          reviews: { requestApprovals: { deps: { reviewers: ['owner-one', '@Owner-Two'], when: { condition: [] } } } },
        }
        const { state } = yield* run(config, memory([{ author: 'Owner-One', state: 'COMMENTED' }]))
        expect(pull(state)?.requestedReviewers).toStrictEqual(['Owner-Two'])
        const { result } = yield* run(config, memory([{ author: 'owner-one', state: 'APPROVED' }, { author: 'owner-two', state: 'CHANGES_REQUESTED' }]))
        expect(result.changes).toStrictEqual([])
      }),
    ))
})

describe('a read-only token, as on a pull request from a fork', () => {
  it('warns for each review request and approval it cannot make, rather than failing the run', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result, state } = yield* run(
          {
            version: 2,
            reviews: {
              requestApprovals: { deps: { reviewers: ['owner-one'], when: { condition: [] } } },
              automaticApprove: { deps: { when: { condition: [] } } },
            },
          },
          readOnly(),
          { event: 'pull_request' },
        )
        expect(result.failed).toStrictEqual([])
        expect(result.changes).toStrictEqual([])
        expect(pull(state)?.requestedReviewers).toStrictEqual([])
        expect(pull(state)?.submittedReviews).toStrictEqual([])
        expect(result.findings).toStrictEqual([
          {
            feature: FEATURE,
            rule: 'reviews.requestApprovals',
            level: 'warning',
            message: 'Could not request review from @owner-one on #7 (deps) on a read-only token, for example a pull request from a fork.',
          },
          {
            feature: FEATURE,
            rule: 'reviews.automaticApprove',
            level: 'warning',
            message: 'Could not approve #7 (deps) on a read-only token, for example a pull request from a fork.',
          },
        ])
      }),
    ))

  it('still fails on any other error from a review write', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const github = memory()
        const limited = {
          ...github,
          service: { ...github.service, createReview: () => Effect.fail(new RateLimited({ operation: 'createReview', detail: 'secondary limit' })) },
        }
        const { result } = yield* run({ version: 2, reviews: { automaticApprove: { deps: { when: { condition: [] } } } } }, limited, {
          event: 'pull_request',
        })
        expect(result.failed).toStrictEqual([{ feature: FEATURE, message: expect.stringContaining('createReview: rate limited (secondary limit)') }])
      }),
    ))
})

describe('automaticApprove', () => {
  const approve = (message?: string): SmartcloudConfig => ({
    version: 2,
    reviews: {
      automaticApprove: {
        docs: { when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } },
        deps: {
          when: { condition: [{ type: 'creatorMatches', condition: '^contributor$' }] },
          ...(message === undefined ? {} : { message }),
        },
        also: { when: { condition: [] } },
      },
    },
  })

  it('approves once, with the first passing rule message, and records a change', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result, state } = yield* run(approve('Dependency bump approved.'), memory(), { event: 'pull_request' })
        expect(pull(state)?.submittedReviews).toStrictEqual([{ event: 'APPROVE', body: 'Dependency bump approved.' }])
        expect(result.changes).toStrictEqual([{ feature: FEATURE, description: 'Approved #7 automatically (deps).' }])
      }),
    ))

  it('uses a default message', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { state } = yield* run(approve(), memory(), { event: 'pull_request' })
        expect(pull(state)?.submittedReviews).toStrictEqual([
          { event: 'APPROVE', body: 'Approved automatically by smartcloud.' },
        ])
      }),
    ))

  it('does not approve again while an approval stands, so synchronize events do not stack approvals', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result, state } = yield* run(
          approve(),
          memory([
            { author: 'smartcloud[bot]', state: 'APPROVED' },
            { author: 'ann', state: 'COMMENTED' },
          ]),
          {
            event: 'pull_request',
          },
        )
        expect(pull(state)?.submittedReviews).toStrictEqual([])
        expect(result.changes).toStrictEqual([])
        expect(result.findings).toStrictEqual([
          {
            feature: FEATURE,
            rule: 'reviews.automaticApprove',
            level: 'notice',
            message: '#7 already has a standing approval, so deps did not approve it again.',
          },
        ])
      }),
    ))

  it('approves again once the earlier approval is dismissed', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { state } = yield* run(approve(), memory([{ author: 'smartcloud[bot]', state: 'DISMISSED' }]), {
          event: 'pull_request',
        })
        expect(pull(state)?.submittedReviews).toHaveLength(1)
      }),
    ))

  it('falls through to a later passing rule, and does nothing when no rule passes', () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { result, state } = yield* run(approve(), memory(), { author: 'someone-else', event: 'pull_request' })
        expect(pull(state)?.submittedReviews).toHaveLength(1)
        expect(result.changes).toStrictEqual([{ feature: FEATURE, description: 'Approved #7 automatically (also).' }])
        const none = yield* run(
          {
            version: 2,
            reviews: {
              automaticApprove: { docs: { when: { condition: [{ type: 'filesMatch', condition: 'docs/**' }] } } },
            },
          },
          memory(),
          { event: 'pull_request' },
        )
        expect(pull(none.state)?.submittedReviews).toStrictEqual([])
        expect(none.result.changes).toStrictEqual([])
      }),
    ))
})
