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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { type ConditionGroup, evaluate, requiredFacets, type Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { loadFacets, Report } from '@resnovas/engine'
import {
  GitHub,
  isTrustedComment,
  type Comment,
  type GitHubError,
  type IssueSummary,
} from '@resnovas/integrations.github'
import { Clock, Effect } from 'effect'

const FEATURE = 'stale'
const DAY = 86_400_000

/** The config's `stale` section. */
export type StaleConfig = NonNullable<SmartcloudConfig['stale']>

/**
 * Marks the one stale comment smartcloud keeps on an item.
 *
 * @example
 * ```ts import.meta.vitest name="STALE_MARKER"
 * import { STALE_MARKER } from '@resnovas/feature.stale'
 *
 * STALE_MARKER // => '<!-- smartcloud:stale -->'
 * ```
 */
export const STALE_MARKER = '<!-- smartcloud:stale -->'

/**
 * Marks the one abandoned comment smartcloud keeps on an item.
 *
 * @example
 * ```ts import.meta.vitest name="ABANDONED_MARKER"
 * import { ABANDONED_MARKER } from '@resnovas/feature.stale'
 *
 * ABANDONED_MARKER // => '<!-- smartcloud:abandoned -->'
 * ```
 */
export const ABANDONED_MARKER = '<!-- smartcloud:abandoned -->'

/**
 * How long after the stale mark smartcloud's own writes may still land.
 *
 * @remarks
 * Adding the label and writing the comment each bump GitHub's `updated_at`
 * a moment after the mark time is taken, so activity only counts once it is
 * this much later than the mark.
 *
 * @example
 * ```ts import.meta.vitest name="MARK_GRACE_MS"
 * import { MARK_GRACE_MS } from '@resnovas/feature.stale'
 *
 * MARK_GRACE_MS / 60_000 // => 10
 * ```
 */
export const MARK_GRACE_MS = 10 * 60_000

// The quantifier is bounded and the class excludes the closing delimiter, so
// matching a user-editable comment body stays linear.
const SINCE = /<!-- smartcloud:stale-since ([0-9TZ:.+-]{1,40}) -->/

/**
 * The stale comment's body: the marker, the mark time, and the configured text.
 *
 * @example
 * ```ts import.meta.vitest name="staleBody"
 * import { staleBody } from '@resnovas/feature.stale'
 *
 * const body = staleBody('Closing soon unless there is activity.', new Date(0))
 * body.split('\n')[1] // => '<!-- smartcloud:stale-since 1970-01-01T00:00:00.000Z -->'
 * ```
 *
 * @param text - The configured `staleComment`.
 * @param since - When the item was marked stale.
 * @returns The comment body.
 */
export const staleBody = (text: string, since: Date): string =>
  `${STALE_MARKER}\n<!-- smartcloud:stale-since ${since.toISOString()} -->\n${text}`

// The comment carrying a marker, when a bot or a trusted login wrote it:
// anyone can type a marker, so a human's comment never counts.
const markerComment = (comments: ReadonlyArray<Comment>, marker: string, trusted: ReadonlyArray<string>) =>
  comments.find((comment) => comment.body.includes(marker) && isTrustedComment(comment, trusted))

/**
 * Reads when an item was marked stale from smartcloud's stale comment.
 *
 * @remarks
 * Only a stale comment written by a bot account or a trusted login is read,
 * so nobody can forge the mark time by posting the marker themselves.
 *
 * @example
 * ```ts import.meta.vitest name="markedSince"
 * import { markedSince, staleBody } from '@resnovas/feature.stale'
 *
 * const comment = { id: 1, author: 'smartcloud[bot]', bot: true, body: staleBody('text', new Date(0)) }
 * markedSince([comment])?.getTime() // => 0
 * markedSince([{ ...comment, author: 'someone', bot: false }]) // => undefined
 * ```
 *
 * @param comments - The item's comments.
 * @param trusted - Logins trusted as well as bot accounts, normally `roles.trustedBots`.
 * @returns The mark time, or undefined when there is no readable stale comment.
 */
export const markedSince = (
  comments: ReadonlyArray<Comment>,
  trusted: ReadonlyArray<string> = [],
): Date | undefined => {
  const found = markerComment(comments, STALE_MARKER, trusted)?.body.match(SINCE)?.[1]
  const since = found === undefined ? Number.NaN : Date.parse(found)
  return Number.isNaN(since) ? undefined : new Date(since)
}

/**
 * The subject conditions see for an item from a scheduled sweep.
 *
 * @example
 * ```ts import.meta.vitest name="subjectOf"
 * import { subjectOf } from '@resnovas/feature.stale'
 *
 * const item = { number: 3, title: 'Bug', body: '', author: 'ann', open: true, locked: false, labels: [], updatedAt: new Date(0), isPullRequest: true }
 * subjectOf(item).kind // => 'pullRequest'
 * ```
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
  ...(item.association === undefined ? {} : { association: item.association }),
  ...(item.bot === undefined ? {} : { bot: item.bot }),
  open: item.open,
  locked: item.locked,
  labels: item.labels,
  updatedAt: item.updatedAt,
})

const has = (subject: Subject, label: string) =>
  subject.labels.some((name) => name.toLowerCase() === label.toLowerCase())

// One comment per marker: an existing trusted one is edited rather than
// repeated, and one anyone else wrote is left alone.
const upsertComment = (
  number: number,
  marker: string,
  body: string,
  comments: ReadonlyArray<Comment>,
  trusted: ReadonlyArray<string>,
) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const existing = markerComment(comments, marker, trusted)
    if (existing === undefined) yield* github.createComment(number, body)
    else yield* github.updateComment(existing.id, body)
  })

// The label is what later sweeps read as "marked", so it is written last: if
// the comment fails, the next sweep marks the item again instead of leaving a
// label with no mark time. The mark time is read just before the writes, not
// at the start of the sweep, so a long sweep's own writes stay within
// MARK_GRACE_MS of it and are not taken for activity.
const markStale = (stale: StaleConfig, subject: Subject, trusted: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    if (stale.staleComment !== undefined) {
      const comments = yield* github.listComments(subject.number)
      const since = new Date(yield* Clock.currentTimeMillis)
      yield* upsertComment(subject.number, STALE_MARKER, staleBody(stale.staleComment, since), comments, trusted)
      yield* report.change({ feature: FEATURE, description: `commented on #${subject.number} that it is stale` })
    }
    yield* github.addLabels(subject.number, [stale.staleLabel])
    yield* report.change({ feature: FEATURE, description: `labelled #${subject.number} "${stale.staleLabel}"` })
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

const abandon = (
  stale: StaleConfig,
  subject: Subject,
  label: string,
  comments: ReadonlyArray<Comment>,
  trusted: ReadonlyArray<string>,
) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    yield* github.addLabels(subject.number, [label])
    yield* report.change({ feature: FEATURE, description: `labelled #${subject.number} "${label}"` })
    if (stale.abandonedComment !== undefined) {
      yield* upsertComment(
        subject.number,
        ABANDONED_MARKER,
        `${ABANDONED_MARKER}\n${stale.abandonedComment}`,
        comments,
        trusted,
      )
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
 * import { subjectOf, sweepItem } from '@resnovas/feature.stale'
 * import { GitHub } from '@resnovas/integrations.github'
 * import { Clock, Effect } from 'effect'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const stale = { staleAfterDays: 30, staleLabel: 'stale' }
 * const program = Effect.gen(function* () {
 *   const now = yield* Clock.currentTimeMillis
 *   for (const item of yield* Effect.flatMap(GitHub, (github) => github.listOpenIssues)) yield* sweepItem(stale, subjectOf(item), now)
 * })
 * ```
 *
 * @param stale - The config's `stale` section.
 * @param subject - The item, as a subject.
 * @param now - The current time, in milliseconds.
 * @param trusted - Logins whose marker comments count as well as bot
 *   accounts', normally `roles.trustedBots`.
 * @returns Nothing; the changes are in the report.
 */
export const sweepItem = (
  stale: StaleConfig,
  subject: Subject,
  now: number,
  trusted: ReadonlyArray<string> = [],
): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const age = (now - subject.updatedAt.getTime()) / DAY
    if (!has(subject, stale.staleLabel)) {
      if (age >= stale.staleAfterDays) yield* markStale(stale, subject, trusted)
      return
    }
    const abandonedLabel = stale.abandonedLabel ?? 'abandoned'
    if (has(subject, abandonedLabel)) return
    const comments = yield* (yield* GitHub).listComments(subject.number)
    const since = markedSince(comments, trusted)
    if (since !== undefined && subject.updatedAt.getTime() > since.getTime() + MARK_GRACE_MS)
      return yield* unmark(stale, subject)
    if (stale.abandonedAfterDays !== undefined && age >= stale.abandonedAfterDays) {
      yield* abandon(stale, subject, abandonedLabel, comments, trusted)
    }
  })

// Fields a sweep's listing does not carry, and that facets do not load.
const UNLOADED = new Set(['isDraft', 'branchMatches', 'baseBranchMatches', 'changesSize'])

// Every condition type in a group, however deeply nested.
const conditionTypes = (value: unknown): ReadonlyArray<string> => {
  if (typeof value !== 'object' || value === null) return []
  const own = 'type' in value && typeof value.type === 'string' ? [value.type] : []
  return [...own, ...Object.values(value).flatMap(conditionTypes)]
}

/**
 * Sweeps every open issue and pull request through the stale lifecycle.
 *
 * @remarks
 * Items of a kind not in `stale.on` (both when omitted) are skipped, as are
 * exempt ones: those carrying an `exempt.labels` label, or passing
 * `exempt.when`. A pull request's files, reviews, commits, mergeability and
 * checks are loaded when `exempt.when` needs them. Its draft state, branches and size are not in a
 * sweep's listing, so an `exempt.when` that uses them cannot be answered for
 * a pull request: that is reported once as a warning, and pull requests are
 * skipped rather than risk acting on one that should be exempt. Issues are
 * unaffected, as those conditions never hold for an issue.
 *
 * Each item is swept on its own: a GitHub failure on one is reported as an
 * error naming the item, and the sweep carries on. A `staleLabel` that is
 * also the abandoned label, ignoring case, is a config error and nothing is
 * swept. Age is read from Effect's `Clock`. Marker comments count only when a
 * bot account or a `roles.trustedBots` login wrote them.
 *
 * @example
 * ```ts
 * import { sweepStale } from '@resnovas/feature.stale'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = sweepStale({ version: 2, stale: { staleAfterDays: 30, staleLabel: 'stale', close: true } })
 * ```
 *
 * @param config - The whole config; only `stale` is read.
 * @returns Nothing; the changes, warnings and errors are in the report.
 */
export const sweepStale = (config: SmartcloudConfig): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const stale = config.stale
    if (stale === undefined) return
    const github = yield* GitHub
    const report = yield* Report
    const abandonedLabel = stale.abandonedLabel ?? 'abandoned'
    if (stale.staleLabel.toLowerCase() === abandonedLabel.toLowerCase()) {
      return yield* report.add({
        feature: FEATURE,
        rule: 'stale.config',
        level: 'error',
        message: `stale.staleLabel and stale.abandonedLabel are both "${abandonedLabel}", so a stale item would look abandoned; give them different names`,
      })
    }
    const kinds = stale.on ?? ['pullRequest', 'issue']
    const exemptLabels = stale.exempt?.labels ?? []
    const when: ConditionGroup | undefined = stale.exempt?.when
    const facets = requiredFacets(when === undefined ? [] : [when])
    const unanswerable = conditionTypes(when).some((type) => UNLOADED.has(type))
    if (unanswerable) {
      yield* report.add({
        feature: FEATURE,
        rule: 'stale.exempt',
        level: 'warning',
        message:
          'stale.exempt.when uses isDraft, branchMatches, baseBranchMatches or changesSize, which a sweep cannot read for a pull request; pull requests are skipped',
      })
    }
    const now = yield* Clock.currentTimeMillis
    const items = yield* github.listOpenIssues
    const swept = items
      .map(subjectOf)
      .filter(
        (listed) =>
          kinds.includes(listed.kind) &&
          !exemptLabels.some((label) => has(listed, label)) &&
          !(unanswerable && listed.kind === 'pullRequest'),
      )
    yield* Effect.logInfo(`stale: sweeping ${swept.length} of ${items.length} open item(s)`).pipe(
      Effect.annotateLogs({ feature: FEATURE, rule: 'stale.sweep', open: items.length, swept: swept.length }),
    )
    for (const listed of swept) {
      yield* Effect.gen(function* () {
        const subject = yield* loadFacets(listed, facets)
        // With the facets loaded evaluation cannot fail, so a failure here
        // would be a bug, not a user error.
        if (when !== undefined && (yield* Effect.orDie(evaluate(when, subject))).passed) return
        yield* sweepItem(stale, subject, now, config.roles?.trustedBots ?? [])
      }).pipe(
        Effect.catchAll((error) =>
          report.add({
            feature: FEATURE,
            rule: 'stale.sweep',
            level: 'error',
            message: `#${listed.number} was not swept: ${error.message}`,
          }),
        ),
      )
    }
  })
