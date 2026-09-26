/**
 * @file packages/feature.stale/src/sweep.ts
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

import { type ConditionGroup, evaluate, requiredFacets, type Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { Report } from '@resnovas/engine'
import { GitHub, type Comment, type GitHubError, type IssueSummary } from '@resnovas/integrations.github'
import { Clock, Effect } from 'effect'

const FEATURE = 'stale'
const DAY = 86_400_000

/** The config's `stale` section. */
export type StaleConfig = NonNullable<SmartcloudConfig['stale']>

/** Marks the one stale comment smartcloud keeps on an item. */
export const STALE_MARKER = '<!-- smartcloud:stale -->'

/** Marks the one abandoned comment smartcloud keeps on an item. */
export const ABANDONED_MARKER = '<!-- smartcloud:abandoned -->'

/**
 * How long after the stale mark smartcloud's own writes may still land.
 *
 * @remarks
 * Adding the label and writing the comment each bump GitHub's `updated_at`
 * a moment after the mark time is taken, so activity only counts once it is
 * this much later than the mark.
 */
export const MARK_GRACE_MS = 10 * 60_000

// The quantifier is bounded and the class excludes the closing delimiter, so
// matching a user-editable comment body stays linear.
const SINCE = /<!-- smartcloud:stale-since ([0-9TZ:.+-]{1,40}) -->/

/**
 * The stale comment's body: the marker, the mark time, and the configured text.
 *
 * @example
 * ```ts
 * staleBody('Closing soon unless there is activity.', new Date(0))
 * ```
 *
 * @param text - The configured `staleComment`.
 * @param since - When the item was marked stale.
 * @returns The comment body.
 */
export const staleBody = (text: string, since: Date): string =>
  `${STALE_MARKER}\n<!-- smartcloud:stale-since ${since.toISOString()} -->\n${text}`

/**
 * Reads when an item was marked stale from smartcloud's stale comment.
 *
 * @example
 * ```ts
 * markedSince([{ id: 1, author: 'bot', body: staleBody('text', new Date(0)) }]) // Date(0)
 * ```
 *
 * @param comments - The item's comments.
 * @returns The mark time, or undefined when there is no readable stale comment.
 */
export const markedSince = (comments: ReadonlyArray<Comment>): Date | undefined => {
  const found = comments.find((comment) => comment.body.includes(STALE_MARKER))?.body.match(SINCE)?.[1]
  const since = found === undefined ? Number.NaN : Date.parse(found)
  return Number.isNaN(since) ? undefined : new Date(since)
}

/**
 * The subject conditions see for an item from a scheduled sweep.
 *
 * @param item - The open issue or pull request.
 * @returns The subject, without facets.
 */
export const subjectOf = (item: IssueSummary): Subject => ({
  kind: item.isPullRequest ? 'pullRequest' : 'issue',
  number: item.number,
  title: item.title,
  body: item.body,
  author: item.author,
  open: item.open,
  locked: item.locked,
  labels: item.labels,
  updatedAt: item.updatedAt,
})

const has = (subject: Subject, label: string) =>
  subject.labels.some((name) => name.toLowerCase() === label.toLowerCase())

// One comment per marker: an existing one is edited rather than repeated.
const upsertComment = (number: number, marker: string, body: string, comments: ReadonlyArray<Comment>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const existing = comments.find((comment) => comment.body.includes(marker))
    if (existing === undefined) yield* github.createComment(number, body)
    else yield* github.updateComment(existing.id, body)
  })

const markStale = (stale: StaleConfig, subject: Subject, now: number) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    yield* github.addLabels(subject.number, [stale.staleLabel])
    yield* report.change({ feature: FEATURE, description: `labelled #${subject.number} "${stale.staleLabel}"` })
    if (stale.staleComment === undefined) return
    yield* upsertComment(
      subject.number,
      STALE_MARKER,
      staleBody(stale.staleComment, new Date(now)),
      yield* github.listComments(subject.number),
    )
    yield* report.change({ feature: FEATURE, description: `commented on #${subject.number} that it is stale` })
  })

const unmark = (stale: StaleConfig, subject: Subject) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    yield* github.removeLabel(subject.number, stale.staleLabel).pipe(
      Effect.zipRight(
        report.change({
          feature: FEATURE,
          description: `removed "${stale.staleLabel}" from #${subject.number} after new activity`,
        }),
      ),
      Effect.catchTag('NotFound', () =>
        report.add({
          feature: FEATURE,
          rule: 'stale.unmark',
          level: 'warning',
          message: `"${stale.staleLabel}" was already gone from #${subject.number} when smartcloud removed it`,
        }),
      ),
    )
  })

const abandon = (stale: StaleConfig, subject: Subject, label: string, comments: ReadonlyArray<Comment>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    yield* github.addLabels(subject.number, [label])
    yield* report.change({ feature: FEATURE, description: `labelled #${subject.number} "${label}"` })
    if (stale.abandonedComment !== undefined) {
      yield* upsertComment(subject.number, ABANDONED_MARKER, `${ABANDONED_MARKER}\n${stale.abandonedComment}`, comments)
      yield* report.change({ feature: FEATURE, description: `commented on #${subject.number} that it is abandoned` })
    }
    if (stale.close === true) {
      yield* github.closeIssue(subject.number)
      yield* report.change({ feature: FEATURE, description: `closed #${subject.number} as abandoned` })
    }
  })

/**
 * Moves one open item through the stale lifecycle.
 *
 * @remarks
 * An item not yet labelled stale is marked once it has been inactive for
 * `staleAfterDays`. A stale item with activity since its mark loses the
 * label; one that has stayed quiet for `abandonedAfterDays` is abandoned,
 * and closed when `close` is set. An item already labelled abandoned is
 * left alone, because abandoning it was itself an update.
 *
 * @example
 * ```ts
 * yield* sweepItem(config.stale, subject, yield* Clock.currentTimeMillis)
 * ```
 *
 * @param stale - The config's `stale` section.
 * @param subject - The item, as a subject.
 * @param now - The current time, in milliseconds.
 * @returns Nothing; the changes are in the report.
 */
export const sweepItem = (
  stale: StaleConfig,
  subject: Subject,
  now: number,
): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const age = (now - subject.updatedAt.getTime()) / DAY
    if (!has(subject, stale.staleLabel)) {
      if (age >= stale.staleAfterDays) yield* markStale(stale, subject, now)
      return
    }
    const abandonedLabel = stale.abandonedLabel ?? 'abandoned'
    if (has(subject, abandonedLabel)) return
    const comments = yield* (yield* GitHub).listComments(subject.number)
    const since = markedSince(comments)
    if (since !== undefined && subject.updatedAt.getTime() > since.getTime() + MARK_GRACE_MS)
      return yield* unmark(stale, subject)
    if (stale.abandonedAfterDays !== undefined && age >= stale.abandonedAfterDays) {
      yield* abandon(stale, subject, abandonedLabel, comments)
    }
  })

/**
 * Sweeps every open issue and pull request through the stale lifecycle.
 *
 * @remarks
 * Items of a kind not in `stale.on` (both when omitted) are skipped, as are
 * exempt ones: those carrying an `exempt.labels` label, or passing
 * `exempt.when`. A sweep lists items without facets, so an `exempt.when`
 * that needs files, reviews or commits cannot be answered; it is reported
 * once as a warning and exempts nothing. Age is read from Effect's `Clock`.
 *
 * @example
 * ```ts
 * yield* sweepStale(config) // with GitHub and Report provided
 * ```
 *
 * @param config - The whole config; only `stale` is read.
 * @returns Nothing; the changes and warnings are in the report.
 */
export const sweepStale = (config: SmartcloudConfig): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const stale = config.stale
    if (stale === undefined) return
    const github = yield* GitHub
    const report = yield* Report
    const kinds = stale.on ?? ['pullRequest', 'issue']
    const exemptLabels = stale.exempt?.labels ?? []
    let when: ConditionGroup | undefined = stale.exempt?.when
    if (when !== undefined && requiredFacets([when]).size > 0) {
      yield* report.add({
        feature: FEATURE,
        rule: 'stale.exempt',
        level: 'warning',
        message:
          'stale.exempt.when uses conditions that need pull request files, reviews or commits, which a sweep does not load; it exempts nothing',
      })
      when = undefined
    }
    const now = yield* Clock.currentTimeMillis
    for (const item of yield* github.listOpenIssues) {
      const subject = subjectOf(item)
      if (!kinds.includes(subject.kind)) continue
      if (exemptLabels.some((label) => has(subject, label))) continue
      // Without facet conditions evaluation cannot fail, so a failure here
      // would be a bug in the check above, not a user error.
      if (when !== undefined && (yield* Effect.orDie(evaluate(when, subject))).passed) continue
      yield* sweepItem(stale, subject, now)
    }
  })
