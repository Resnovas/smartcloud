/**
 * @file packages/feature.freeze/src/feature.ts
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

import type { Freeze } from '@resnovas/config'
import { type Feature, Report } from '@resnovas/engine'
import { CHECK_RUN_EXTERNAL_ID, type CheckRun, type CommitCheck, GitHub } from '@resnovas/integrations.github'
import { Clock, Effect, Either } from 'effect'
import { type ActiveFreeze, activeFreeze, describeFreeze } from './window.js'

/**
 * The feature's name, as it appears in findings, changes and run results.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE"
 * import { FEATURE } from '@resnovas/feature.freeze'
 *
 * FEATURE // => 'freeze'
 * ```
 */
export const FEATURE = 'freeze'

/**
 * The check run the feature keeps on each open pull request's head commit:
 * failed while a freeze is in effect, passed otherwise. A ruleset requires it
 * to block merges during a freeze.
 *
 * @example
 * ```ts import.meta.vitest name="FREEZE_CHECK"
 * import { FREEZE_CHECK } from '@resnovas/feature.freeze'
 *
 * FREEZE_CHECK // => 'smartcloud / merge freeze'
 * ```
 */
export const FREEZE_CHECK = 'smartcloud / merge freeze'

/**
 * The events on which the feature brings the freeze check up to date on
 * every open pull request, so it changes when a window starts or ends.
 *
 * @example
 * ```ts import.meta.vitest name="SWEEP_EVENTS"
 * import { SWEEP_EVENTS } from '@resnovas/feature.freeze'
 *
 * SWEEP_EVENTS.join(',') // => 'schedule,workflow_dispatch'
 * ```
 */
export const SWEEP_EVENTS: ReadonlyArray<string> = ['schedule', 'workflow_dispatch']

const exemptLabel = (freeze: Freeze, labels: ReadonlyArray<string>) =>
  freeze.exempt?.labels?.find((label) => labels.includes(label))

/**
 * The freeze check for a pull request's head commit.
 *
 * @example
 * ```ts import.meta.vitest name="freezeCheck"
 * import { freezeCheck } from '@resnovas/feature.freeze'
 *
 * const frozen = { key: 'weekend', reason: undefined, until: 'Mon 08:00 (UTC)' }
 * freezeCheck('abc', frozen, undefined).conclusion // => 'failure'
 * freezeCheck('abc', frozen, 'hotfix').conclusion // => 'success'
 * freezeCheck('abc', undefined, undefined).title // => 'No merge freeze'
 * ```
 *
 * @param headSha - The commit.
 * @param freeze - The freeze in effect, if any.
 * @param exempt - The label that exempts the pull request, if it has one.
 * @returns The check run to publish.
 */
export const freezeCheck = (
  headSha: string,
  freeze: ActiveFreeze | undefined,
  exempt: string | undefined,
): CheckRun => {
  const base = { name: FREEZE_CHECK, headSha, status: 'completed' as const }
  if (freeze === undefined)
    return { ...base, conclusion: 'success', title: 'No merge freeze', summary: 'No merge freeze is in effect.' }
  const summary = describeFreeze(freeze)
  return exempt === undefined
    ? { ...base, conclusion: 'failure', title: 'Merges are frozen', summary }
    : {
        ...base,
        conclusion: 'success',
        title: 'Exempt from the merge freeze',
        summary: `${summary} This pull request has the ${exempt} label, so it may merge.`,
      }
}

// The latest freeze check smartcloud published on the commit, if any.
const latestFreezeCheck = (checks: ReadonlyArray<CommitCheck>) =>
  checks
    .filter(
      (check) =>
        check.source === 'checkRun' && check.name === FREEZE_CHECK && check.externalId === CHECK_RUN_EXTERNAL_ID,
    )
    .reduce<CommitCheck | undefined>(
      (latest, check) => (latest === undefined || (check.id ?? 0) > (latest.id ?? 0) ? check : latest),
      undefined,
    )

/**
 * Publishes a freeze check, unless the latest one smartcloud published on
 * the commit already concludes the same way.
 *
 * @internal
 * @param run - The check run, from {@link freezeCheck}.
 * @returns Whether a check run was created.
 */
export const publishFreezeCheck = (run: CheckRun) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const latest = latestFreezeCheck(yield* github.listCommitChecks(run.headSha))
    if (latest?.state === run.conclusion) return false
    yield* github.createCheckRun(run)
    return true
  })

/**
 * A merge freeze, manual or scheduled, that blocks merges while it is in
 * effect.
 *
 * @remarks
 * Runs when the config has a `freeze` section. A freeze is in effect while
 * `freeze.active` is true or any of `freeze.windows` is open (see
 * `activeFreeze`).
 *
 * - On a pull request event it publishes the {@link FREEZE_CHECK} check on
 *   the head commit: failed during a freeze, unless the pull request has one
 *   of `freeze.exempt.labels`, and passed otherwise. A freeze is a warning
 *   finding, not an error, so the job's own check does not stay failed after
 *   the freeze ends; the freeze check is the one that blocks.
 * - On a `merge_group` event a freeze is an error finding, which fails the
 *   job and so the merge queue entry. Labels cannot exempt a queue entry.
 * - On {@link SWEEP_EVENTS} it brings the freeze check up to date on every
 *   open pull request, publishing a new one only where the conclusion
 *   changes, so a scheduled run turns it on when a window opens and off when
 *   it closes.
 *
 * A token that cannot write check runs, such as a fork's read-only one,
 * leaves a warning instead of failing the run. Logs carry counts only.
 *
 * @example
 * ```ts
 * import { freezeFeature } from '@resnovas/feature.freeze'
 * import { runFeatures } from '@resnovas/engine'
 *
 * const run = runFeatures({ config: { version: 2, freeze: { active: true } }, event: 'schedule', payload: {}, features: [freezeFeature] })
 * ```
 */
export const freezeFeature: Feature = {
  name: FEATURE,
  handles: ['pullRequest', 'repository'],
  enabled: (config) => config.freeze !== undefined,
  run: ({ config, envelope }) =>
    Effect.gen(function* () {
      const report = yield* Report
      const freeze = config.freeze ?? {}
      const active = activeFreeze(freeze, yield* Clock.currentTimeMillis)
      const add = (rule: string, level: 'error' | 'warning' | 'notice', message: string) =>
        report.add({ feature: FEATURE, rule, level, message })

      if (envelope.kind === 'pullRequest') {
        if (!envelope.subject.open) return
        const exempt = active === undefined ? undefined : exemptLabel(freeze, envelope.subject.labels)
        if (active !== undefined) {
          yield* exempt === undefined
            ? add('freeze.active', 'warning', `${describeFreeze(active)} This pull request cannot merge until then.`)
            : add(
                'freeze.exempt',
                'notice',
                `${describeFreeze(active)} This pull request has the ${exempt} label, so it may merge.`,
              )
        }
        yield* publishFreezeCheck(freezeCheck(envelope.headSha, active, exempt)).pipe(
          Effect.catchAll((error) =>
            add('freeze.check', 'warning', `Could not publish the ${FREEZE_CHECK} check: ${error.message}`),
          ),
        )
        return
      }

      if (envelope.event === 'merge_group') {
        if (active !== undefined)
          yield* add('freeze.active', 'error', `${describeFreeze(active)} The merge queue cannot merge until then.`)
        return
      }
      if (!SWEEP_EVENTS.includes(envelope.event)) return

      const github = yield* GitHub
      const pulls = yield* github.listOpenPullRequests
      const outcomes = yield* Effect.forEach(
        pulls,
        (pull) =>
          Effect.either(
            publishFreezeCheck(
              freezeCheck(pull.headSha, active, active === undefined ? undefined : exemptLabel(freeze, pull.labels)),
            ),
          ),
        { concurrency: 4 },
      )
      const updated = outcomes.filter((outcome) => Either.isRight(outcome) && outcome.right).length
      const failures = outcomes.filter(Either.isLeft).map((outcome) => outcome.left.message)
      const counts = { pulls: pulls.length, updated, failed: failures.length }
      yield* Effect.logDebug(
        `freeze: ${counts.pulls} open pull request(s), ${counts.updated} updated, ${counts.failed} failed`,
      ).pipe(Effect.annotateLogs({ feature: FEATURE, ...counts }))
      yield* add(
        'freeze.swept',
        'notice',
        `${active === undefined ? 'No merge freeze is in effect.' : describeFreeze(active)} Updated the ${FREEZE_CHECK} check on ${updated} of ${pulls.length} open pull request(s).`,
      )
      if (failures.length > 0) {
        yield* add(
          'freeze.check',
          'warning',
          `Could not publish the ${FREEZE_CHECK} check on ${failures.length} pull request(s): ${failures[0]}`,
        )
      }
    }),
}
