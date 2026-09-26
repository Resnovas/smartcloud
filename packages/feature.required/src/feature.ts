/**
 * @file packages/feature.required/src/feature.ts
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

import { REQUIRED_TIMEOUT } from '@resnovas/config'
import { type Feature, Report } from '@resnovas/engine'
import { type CommitCheck, GitHub } from '@resnovas/integrations.github'
import { Clock, Duration, Effect } from 'effect'
import { type Assessment, assessChecks } from './assess.js'

/**
 * The feature's name, as it appears in findings, changes and run results.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE"
 * import { FEATURE } from '@resnovas/feature.required'
 *
 * FEATURE // => 'required'
 * ```
 */
export const FEATURE = 'required'

/**
 * How long the feature waits between looks at the commit's checks.
 *
 * @example
 * ```ts import.meta.vitest name="POLL_INTERVAL"
 * import { POLL_INTERVAL } from '@resnovas/feature.required'
 * import { Duration } from 'effect'
 *
 * Duration.toSeconds(POLL_INTERVAL) // => 15
 * ```
 */
export const POLL_INTERVAL = Duration.seconds(15)

// The names of the checks that count, so a settled commit is only trusted
// once two looks in a row agree: a workflow queued a moment after the rest
// adds its checks between them.
const namesOf = (assessment: Assessment) =>
  assessment.counted
    .map((check) => check.name)
    .sort()
    .join('\n')

/**
 * Looks at a commit's checks until one of them fails, all of them have
 * passed on two looks in a row, or the deadline passes.
 *
 * @internal
 * @param headSha - The commit.
 * @param options - The job's own check run and the ignore patterns.
 * @param deadline - When to stop waiting, in epoch milliseconds.
 * @returns The last assessment; checks still pending in it timed out.
 */
export const waitForChecks = (
  headSha: string,
  options: { readonly checkRunId: number; readonly ignore: ReadonlyArray<string> },
  deadline: number,
) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    let settled: string | undefined
    for (;;) {
      const assessment = assessChecks(yield* github.listCommitChecks(headSha), options)
      const names = namesOf(assessment)
      const counts = {
        counted: assessment.counted.length,
        pending: assessment.pending.length,
        failed: assessment.failed.length,
      }
      yield* Effect.logDebug(
        `required: ${counts.counted} check(s), ${counts.pending} pending, ${counts.failed} failed`,
      ).pipe(Effect.annotateLogs({ feature: FEATURE, ...counts }))
      if (assessment.failed.length > 0 || (assessment.pending.length === 0 && names === settled)) return assessment
      settled = assessment.pending.length === 0 ? names : undefined
      // A settled commit at the deadline has passed on the one look it had.
      if ((yield* Clock.currentTimeMillis) >= deadline) return assessment
      yield* Effect.sleep(POLL_INTERVAL)
    }
  })

const describe = (check: CommitCheck) =>
  check.source === 'status' ? `The ${check.name} status` : `The ${check.name} check`

const linked = (check: CommitCheck) => (check.url === undefined ? {} : { link: check.url })

/**
 * The aggregate "all required" check: the job running smartcloud passes only
 * when every other check on the pull request's head commit has passed, so a
 * ruleset requires that one check instead of a list of names.
 *
 * @remarks
 * Runs on pull request events when the config has a `required` section and
 * the workflow passes the job's `checkRunId`; without it the job would wait
 * for itself, so the feature is skipped. It looks at the head commit's
 * latest run of each check and latest status of each context every
 * {@link POLL_INTERVAL}, leaving out every run of its own job,
 * smartcloud's per-feature checks and `required.ignore` matches (see
 * `assessChecks`). Success, neutral and skipped pass. It fails as soon as any check
 * fails, passes once every check has passed on two looks in a row, and
 * fails the checks still pending after `required.timeout` minutes. Each
 * failed or unfinished check is an error finding, which fails the job.
 *
 * Traced with the rest of the run; logs carry counts only, never check
 * names.
 *
 * @example
 * ```ts
 * import { requiredFeature } from '@resnovas/feature.required'
 * import { runFeatures } from '@resnovas/engine'
 *
 * declare const payload: unknown
 * const run = runFeatures({ config: { version: 2, required: {} }, event: 'pull_request', payload, features: [requiredFeature], checkRunId: 42 })
 * ```
 */
export const requiredFeature: Feature = {
  name: FEATURE,
  handles: ['pullRequest'],
  needsCheckRun: true,
  enabled: (config) => config.required !== undefined,
  run: ({ config, envelope, checkRunId }) =>
    Effect.gen(function* () {
      // The runner only calls a feature that needs a check run with one, on the events it handles.
      if (envelope.kind !== 'pullRequest' || checkRunId === undefined) return
      const report = yield* Report
      const timeout = config.required?.timeout ?? REQUIRED_TIMEOUT
      const deadline = (yield* Clock.currentTimeMillis) + Duration.toMillis(Duration.minutes(timeout))
      const assessment = yield* waitForChecks(
        envelope.headSha,
        { checkRunId, ignore: config.required?.ignore ?? [] },
        deadline,
      )
      for (const check of assessment.failed) {
        yield* report.add({
          feature: FEATURE,
          rule: 'required.failed',
          level: 'error',
          message: `${describe(check)} concluded ${check.detail}.`,
          ...linked(check),
        })
      }
      if (assessment.failed.length > 0) return
      for (const check of assessment.pending) {
        yield* report.add({
          feature: FEATURE,
          rule: 'required.pending',
          level: 'error',
          message: `${describe(check)} did not finish within ${timeout} minute(s); it was still ${check.detail}.`,
          ...linked(check),
        })
      }
      if (assessment.pending.length > 0) return
      const count = assessment.counted.length
      yield* report.add({
        feature: FEATURE,
        rule: 'required.passed',
        level: 'notice',
        message:
          count === 0 ? 'No other checks ran on this commit.' : `All ${count} other check(s) on this commit passed.`,
      })
    }),
}
