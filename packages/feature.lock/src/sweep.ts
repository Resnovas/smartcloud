/**
 * @file packages/feature.lock/src/sweep.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { Report } from '@resnovas/engine'
import { GitHub, isTrustedComment, type ClosedIssueSummary, type GitHubError } from '@resnovas/integrations.github'
import { Clock, Effect } from 'effect'

const FEATURE = 'lock'
const DAY = 86_400_000

/** The config's `lock` section. */
export type LockConfig = NonNullable<SmartcloudConfig['lock']>

/**
 * Marks the one lock comment smartcloud keeps on an item.
 *
 * @example
 * ```ts import.meta.vitest name="LOCK_MARKER"
 * import { LOCK_MARKER } from '@resnovas/feature.lock'
 *
 * LOCK_MARKER // => '<!-- smartcloud:lock -->'
 * ```
 */
export const LOCK_MARKER = '<!-- smartcloud:lock -->'

/**
 * The time before which an item must have been closed to be locked.
 *
 * @example
 * ```ts import.meta.vitest name="closedBefore"
 * import { closedBefore } from '@resnovas/feature.lock'
 *
 * closedBefore(1.5, 3 * 86_400_000).toISOString() // => '1970-01-02T12:00:00.000Z'
 * ```
 *
 * @param afterDays - The config's `lock.afterDays`.
 * @param now - The current time, in milliseconds.
 * @returns The cut-off time.
 */
export const closedBefore = (afterDays: number, now: number): Date => new Date(now - afterDays * DAY)

const hasAny = (item: ClosedIssueSummary, labels: ReadonlyArray<string>) =>
  item.labels.some((name) => labels.some((label) => label.toLowerCase() === name.toLowerCase()))

/**
 * Comments on, labels and locks one closed item, as `lock` says.
 *
 * @remarks
 * The comment and the label come first, so the thread is still open to
 * them. The comment is kept once per item: an existing `<!-- smartcloud:lock -->`
 * comment written by a bot account or a trusted login is edited rather than
 * repeated, so an item that failed to lock part way, or that GitHub's search
 * still lists as unlocked, is not commented on twice.
 *
 * @example
 * ```ts
 * import { lockItem } from '@resnovas/feature.lock'
 * import { GitHub } from '@resnovas/integrations.github'
 * import { Effect } from 'effect'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const lock = { afterDays: 30, reason: 'resolved' as const }
 * const program = Effect.gen(function* () {
 *   for (const item of yield* (yield* GitHub).listClosedUnlocked('issue', new Date())) yield* lockItem(lock, item)
 * })
 * ```
 *
 * @param lock - The config's `lock` section.
 * @param item - The closed, unlocked item.
 * @param trusted - Logins whose lock comments count as well as bot
 *   accounts', normally `roles.trustedBots`.
 * @returns Nothing; the changes are in the report.
 */
export const lockItem = (
  lock: LockConfig,
  item: ClosedIssueSummary,
  trusted: ReadonlyArray<string> = [],
): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    if (lock.comment !== undefined) {
      const body = `${LOCK_MARKER}\n${lock.comment}`
      const existing = (yield* github.listComments(item.number)).find(
        (comment) => comment.body.includes(LOCK_MARKER) && isTrustedComment(comment, trusted),
      )
      if (existing === undefined) yield* github.createComment(item.number, body)
      else yield* github.updateComment(existing.id, body)
      yield* report.change({ feature: FEATURE, description: `commented on #${item.number} before locking it` })
    }
    if (lock.label !== undefined) {
      yield* github.addLabels(item.number, [lock.label])
      yield* report.change({ feature: FEATURE, description: `labelled #${item.number} "${lock.label}"` })
    }
    yield* github.lockIssue(item.number, lock.reason)
    yield* report.change({
      feature: FEATURE,
      description: `locked #${item.number}${lock.reason === undefined ? '' : ` as ${lock.reason}`}`,
    })
  })

/**
 * Locks every issue and pull request that has been closed for `lock.afterDays`.
 *
 * @remarks
 * Items of a kind not in `lock.on` (both when omitted) are not searched, and
 * items carrying an `exempt.labels` label, ignoring case, are skipped. The
 * items come from GitHub's search, which returns at most 1,000 for each
 * kind, so a backlog larger than that is worked through over several sweeps.
 *
 * Each item is locked on its own: a GitHub failure on one is reported as an
 * error naming the item, and the sweep carries on. Age is read from Effect's
 * `Clock`. Lock comments count only when a bot account or a
 * `roles.trustedBots` login wrote them.
 *
 * @example
 * ```ts
 * import { sweepLocks } from '@resnovas/feature.lock'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = sweepLocks({ version: 2, lock: { afterDays: 30, reason: 'resolved' } })
 * ```
 *
 * @param config - The whole config; `lock` and `roles.trustedBots` are read.
 * @returns Nothing; the changes and errors are in the report.
 */
export const sweepLocks = (config: SmartcloudConfig): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const lock = config.lock
    if (lock === undefined) return
    const github = yield* GitHub
    const report = yield* Report
    const before = closedBefore(lock.afterDays, yield* Clock.currentTimeMillis)
    const exempt = lock.exempt?.labels ?? []
    const trusted = config.roles?.trustedBots ?? []
    for (const kind of lock.on ?? ['pullRequest', 'issue']) {
      const items = yield* github.listClosedUnlocked(kind, before)
      const swept = items.filter((item) => !hasAny(item, exempt))
      yield* Effect.logInfo(`lock: locking ${swept.length} of ${items.length} closed ${kind}(s)`).pipe(
        Effect.annotateLogs({ feature: FEATURE, rule: 'lock.sweep', kind, closed: items.length, swept: swept.length }),
      )
      for (const item of swept) {
        yield* lockItem(lock, item, trusted).pipe(
          Effect.catchAll((error) =>
            report.add({
              feature: FEATURE,
              rule: 'lock.sweep',
              level: 'error',
              message: `#${item.number} was not locked: ${error.message}`,
            }),
          ),
        )
      }
    }
  })
