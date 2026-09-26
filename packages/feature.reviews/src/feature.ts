/**
 * @file packages/feature.reviews/src/feature.ts
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

import { evaluate, type Facet, MissingFacet, requiredFacets, type Review, type Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { type Feature, type FeatureContext, Report } from '@resnovas/engine'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { DEFAULT_POLICY_BASE, evaluateGate, gateMessage, latestDecisive, normaliseLogin, sameLogin } from './gate.js'

/** The feature's name, as it appears in findings, changes and run results. */
export const FEATURE = 'reviews'

type Reviews = NonNullable<SmartcloudConfig['reviews']>

const DEFAULT_APPROVAL_MESSAGE = 'Approved automatically by smartcloud.'

// A pull request from a fork runs with a read-only token, so GitHub forbids
// every write. That is a warning, not a failure of the whole run.
const readOnly = (rule: string, verb: string) => () =>
  Effect.flatMap(Report, (report) =>
    report.add({
      feature: FEATURE,
      rule,
      level: 'warning',
      message: `Could not ${verb} on a read-only token, for example a pull request from a fork.`,
    }),
  )

const conditionGroups = (reviews: Reviews) => [
  ...Object.values(reviews.requestApprovals ?? {}).map((rule) => rule.when),
  ...Object.values(reviews.automaticApprove ?? {}).map((rule) => rule.when),
]

// The runner always loads the facets this feature declares, so a missing one
// is an engine bug; failing loudly beats gating on an empty review list.
const withReviews = (
  subject: Subject | undefined,
  condition: string,
): Effect.Effect<{ readonly subject: Subject; readonly reviews: ReadonlyArray<Review> }, MissingFacet> =>
  subject?.reviews === undefined
    ? Effect.fail(new MissingFacet({ facet: 'reviews', condition }))
    : Effect.succeed({ subject, reviews: subject.reviews })

const runGate = (
  config: SmartcloudConfig,
  gate: NonNullable<Reviews['gate']>,
  subject: Subject,
  reviews: ReadonlyArray<Review>,
) =>
  Effect.gen(function* () {
    const report = yield* Report
    const author = subject.author
    const result = evaluateGate({
      author,
      reviews,
      maintainers: config.roles?.maintainers ?? [],
      trustedBots: config.roles?.trustedBots ?? [],
      outside: gate.outside ?? 2,
      maintainer: gate.maintainer ?? 1,
    })
    const link = `${config.links?.policyBase ?? DEFAULT_POLICY_BASE}/GOVERNANCE.md#review`
    if (result.status === 'open') {
      const message =
        result.reason === 'trustedBot'
          ? `@${normaliseLogin(author)} is a trusted bot, so the review gate does not apply.`
          : 'Fewer than two maintainers are configured, so the review gate is open and the owner merges at their discretion.'
      yield* report.add({ feature: FEATURE, rule: 'REVIEW', level: 'notice', message, link })
      return
    }
    if (result.status === 'failed') {
      yield* report.add({ feature: FEATURE, rule: 'REVIEW', level: 'error', message: gateMessage(result), link })
    }
  })

const runRequestApprovals = (rules: NonNullable<Reviews['requestApprovals']>, subject: Subject, reviews: ReadonlyArray<Review>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    // Requesting a review from someone who has already submitted one puts
    // them back on the pending list and notifies them again, which every
    // later review event would otherwise repeat.
    const reviewed = reviews.filter((review) => review.state !== 'PENDING').map((review) => review.author)
    for (const [key, rule] of Object.entries(rules)) {
      const evaluation = yield* evaluate(rule.when, subject)
      if (!evaluation.passed) continue
      // GitHub rejects a request for the author's own review, so drop them.
      const reviewers = rule.reviewers
        .filter((login) => !sameLogin(login, subject.author) && !reviewed.some((author) => sameLogin(login, author)))
        .map(normaliseLogin)
      if (reviewers.length === 0) continue
      const who = reviewers.map((login) => `@${login}`).join(', ')
      yield* github.requestReviewers(subject.number, reviewers).pipe(
        Effect.zipRight(report.change({ feature: FEATURE, description: `Requested review from ${who} on #${subject.number} (${key}).` })),
        Effect.catchTag('Forbidden', readOnly('reviews.requestApprovals', `request review from ${who} on #${subject.number} (${key})`)),
      )
    }
  })

// The service cannot tell which reviews are the token's own, so an earlier
// automatic approval is invisible. Approving only while no reviewer's standing
// review is an approval keeps synchronize events from stacking approvals, and
// re-approves once a stale approval is dismissed.
const runAutomaticApprove = (
  rules: NonNullable<Reviews['automaticApprove']>,
  subject: Subject,
  reviews: ReadonlyArray<Review>,
) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    const approved = [...latestDecisive(reviews).values()].includes('APPROVED')
    for (const [key, rule] of Object.entries(rules)) {
      const evaluation = yield* evaluate(rule.when, subject)
      if (!evaluation.passed) continue
      if (approved) {
        yield* report.add({
          feature: FEATURE,
          rule: 'reviews.automaticApprove',
          level: 'notice',
          message: `#${subject.number} already has a standing approval, so ${key} did not approve it again.`,
        })
        return
      }
      yield* github.createReview(subject.number, { event: 'APPROVE', body: rule.message ?? DEFAULT_APPROVAL_MESSAGE }).pipe(
        Effect.zipRight(report.change({ feature: FEATURE, description: `Approved #${subject.number} automatically (${key}).` })),
        Effect.catchTag('Forbidden', readOnly('reviews.automaticApprove', `approve #${subject.number} (${key})`)),
      )
      // One approval per run is enough: further rules would only duplicate it.
      return
    }
  })

const run = (context: FeatureContext): Effect.Effect<void, MissingFacet | GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const section = context.config.reviews
    if (section === undefined) return
    const { subject, reviews } = yield* withReviews(context.subject, 'reviews')
    if (section.gate !== undefined) yield* runGate(context.config, section.gate, subject, reviews)
    if (section.requestApprovals !== undefined) yield* runRequestApprovals(section.requestApprovals, subject, reviews)
    if (section.automaticApprove !== undefined) yield* runAutomaticApprove(section.automaticApprove, subject, reviews)
  })

/**
 * The reviews feature: the maintainer review gate, requested approvals and
 * automatic approval.
 *
 * @remarks
 * It runs on pull request events, including `pull_request_review`, so the
 * gate is re-evaluated whenever a review is submitted or dismissed. A review
 * request or approval GitHub forbids, as it does on the read-only token of a
 * pull request from a fork, is reported as a warning rather than failing. It is
 * enabled by a `reviews` section, and loads the reviews and pending reviewer
 * facets plus whatever its rules' conditions need.
 */
export const reviewsFeature: Feature = {
  name: FEATURE,
  handles: ['pullRequest'],
  enabled: (config) => config.reviews !== undefined,
  facets: (config) =>
    new Set<Facet>([
      'reviews',
      'pendingReviewers',
      ...requiredFacets(config.reviews === undefined ? [] : conditionGroups(config.reviews)),
    ]),
  run,
}
