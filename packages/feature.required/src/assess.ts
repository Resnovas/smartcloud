/**
 * @file packages/feature.required/src/assess.ts
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

import { compilePattern } from '@resnovas/conditions'
import { CHECK_RUN_EXTERNAL_ID, type CommitCheck } from '@resnovas/integrations.github'

/**
 * How the check runs smartcloud publishes for its features are named. They
 * report the run the aggregate belongs to, whose own job check already
 * carries their outcome, so the ones smartcloud published never count.
 *
 * @example
 * ```ts import.meta.vitest name="OWN_CHECK_PREFIX"
 * import { OWN_CHECK_PREFIX } from '@resnovas/feature.required'
 *
 * `${OWN_CHECK_PREFIX}reviews` // => 'smartcloud / reviews'
 * ```
 */
export const OWN_CHECK_PREFIX = 'smartcloud / '

/** Where the checks on a commit stand, leaving out the ones that do not count. */
export interface Assessment {
  /** The checks that count, in the order GitHub listed them. */
  readonly counted: ReadonlyArray<CommitCheck>
  readonly pending: ReadonlyArray<CommitCheck>
  readonly failed: ReadonlyArray<CommitCheck>
  /** Whether the job's own check run was listed; until it is, other runs of the aggregate cannot be told apart. */
  readonly selfListed: boolean
  /** The `expect` patterns no counted check matches yet. */
  readonly missing: ReadonlyArray<string>
}

// A check run is identified as a ruleset identifies a required check: by the
// app that published it and its name.
const identity = (check: CommitCheck) => `${check.app ?? ''}\u0000${check.name}`

/**
 * Keeps the latest check run of each app and name, and every status.
 *
 * @remarks
 * A commit lists a check run per check suite, so a re-run or a workflow
 * retriggered by an edit or a review leaves older runs of the same check
 * beside the new one, often cancelled or failed. Only the latest, the one
 * with the highest id, stands for the check, as it does for a ruleset's
 * required check of that name. Statuses are already one per context.
 *
 * @example
 * ```ts import.meta.vitest name="latestChecks"
 * import { latestChecks } from '@resnovas/feature.required'
 *
 * const latest = latestChecks([
 *   { name: 'test', source: 'checkRun', id: 1, app: 'github-actions', state: 'failure', detail: 'cancelled' },
 *   { name: 'test', source: 'checkRun', id: 2, app: 'github-actions', state: 'success', detail: 'success' },
 * ])
 * latest.length // => 1
 * latest[0]?.detail // => 'success'
 * ```
 *
 * @param checks - The commit's checks, as `listCommitChecks` returns them.
 * @returns The latest run of each check, in the order GitHub listed them.
 */
export const latestChecks = (checks: ReadonlyArray<CommitCheck>): ReadonlyArray<CommitCheck> => {
  const latest = new Map<string, CommitCheck>()
  for (const check of checks) {
    if (check.source !== 'checkRun') continue
    const seen = latest.get(identity(check))
    if (seen === undefined || (check.id ?? 0) > (seen.id ?? 0)) latest.set(identity(check), check)
  }
  return checks.filter((check) => check.source !== 'checkRun' || latest.get(identity(check)) === check)
}

/**
 * Sorts a commit's checks into pending and failed, counting only the latest
 * run of each check and leaving out every run of the job running the
 * aggregate, smartcloud's own feature checks, and every check an `ignore`
 * pattern matches.
 *
 * @remarks
 * The job's own check run is found by `checkRunId`; every run with its app
 * and name is another run of the aggregate, such as one started by a
 * review while this one waits, and is left out too, so two aggregates on
 * one commit never wait for each other. A `smartcloud / <feature>` run is
 * left out only when smartcloud published it: when it carries
 * {@link CHECK_RUN_EXTERNAL_ID} and comes from an app smartcloud runs as,
 * the job's own or one in `publishers`. Another app's or workflow's run of
 * that name, unmarked or marked otherwise, counts.
 *
 * @example
 * ```ts import.meta.vitest name="assessChecks"
 * import { assessChecks } from '@resnovas/feature.required'
 *
 * const assessment = assessChecks(
 *   [
 *     { name: 'smartcloud', source: 'checkRun', id: 7, app: 'github-actions', state: 'pending', detail: 'in_progress' },
 *     { name: 'smartcloud', source: 'checkRun', id: 5, app: 'github-actions', state: 'pending', detail: 'in_progress' },
 *     { name: 'ci / test', source: 'checkRun', id: 8, app: 'github-actions', state: 'failure', detail: 'failure' },
 *     { name: 'codecov/patch', source: 'status', state: 'pending', detail: 'pending' },
 *   ],
 *   { checkRunId: 7, ignore: ['^codecov/'] },
 * )
 * assessment.counted.length // => 1
 * assessment.failed[0]?.name // => 'ci / test'
 * ```
 *
 * @param checks - The commit's checks, as `listCommitChecks` returns them.
 * @param options - The job's own check run, and the patterns of checks that do not count.
 * @returns The checks that count, and which of them are pending or failed.
 */
export const assessChecks = (
  checks: ReadonlyArray<CommitCheck>,
  options: {
    readonly checkRunId: number
    readonly ignore: ReadonlyArray<string>
    /** Apps smartcloud publishes its feature checks as, beyond the job's own, such as the GitHub App whose token the run used. */
    readonly publishers?: ReadonlyArray<string> | undefined
    /** Patterns a counted check must match; one no check matches is missing. */
    readonly expect?: ReadonlyArray<string> | undefined
  },
): Assessment => {
  const ignored = options.ignore.map(compilePattern)
  const own = checks.find((check) => check.source === 'checkRun' && check.id === options.checkRunId)
  const aggregate = (check: CommitCheck) =>
    check.id === options.checkRunId || (own !== undefined && check.source === 'checkRun' && identity(check) === identity(own))
  // Only runs smartcloud itself published are left out: they carry its
  // marker and come from an app smartcloud runs as, so neither another app
  // nor another workflow of the same app can claim the name. A rerun
  // replaces an older unmarked run of the same name, so none is left behind.
  const publishers = new Set([...(own?.app === undefined ? [] : [own.app]), ...(options.publishers ?? [])])
  const smartcloudFeature = (check: CommitCheck) =>
    check.source === 'checkRun' &&
    check.name.startsWith(OWN_CHECK_PREFIX) &&
    check.externalId === CHECK_RUN_EXTERNAL_ID &&
    check.app !== undefined &&
    publishers.has(check.app)
  // The latest run of each check is picked first, so a newer marked smartcloud
  // run replaces an older unmarked one of the same app and name before it is left out.
  const counted = latestChecks(checks.filter((check) => !aggregate(check)))
    .filter((check) => !smartcloudFeature(check))
    .filter(
    (check) =>
      !ignored.some((pattern) => {
        // A global or sticky pattern moves lastIndex after a hit, so every name starts from 0.
        pattern.lastIndex = 0
        return pattern.test(check.name)
      }),
  )
  return {
    counted,
    pending: counted.filter((check) => check.state === 'pending'),
    failed: counted.filter((check) => check.state === 'failure'),
    selfListed: own !== undefined,
    missing: (options.expect ?? []).filter((source) => {
      const pattern = compilePattern(source)
      return !counted.some((check) => {
        pattern.lastIndex = 0
        return pattern.test(check.name)
      })
    }),
  }
}
