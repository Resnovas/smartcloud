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
import type { CommitCheck } from '@resnovas/integrations.github'

/**
 * How the check runs smartcloud publishes for its features are named. They
 * report the run the aggregate belongs to, whose own job check already
 * carries their outcome, so they never count.
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
}

/**
 * Sorts a commit's checks into pending and failed, leaving out the job
 * running the aggregate, smartcloud's own feature checks, and every check an
 * `ignore` pattern matches.
 *
 * @example
 * ```ts import.meta.vitest name="assessChecks"
 * import { assessChecks } from '@resnovas/feature.required'
 *
 * const assessment = assessChecks(
 *   [
 *     { name: 'smartcloud', source: 'checkRun', id: 7, state: 'pending', detail: 'in_progress' },
 *     { name: 'ci / test', source: 'checkRun', id: 8, state: 'failure', detail: 'failure' },
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
  options: { readonly checkRunId: number; readonly ignore: ReadonlyArray<string> },
): Assessment => {
  const ignored = options.ignore.map(compilePattern)
  const counted = checks.filter(
    (check) =>
      check.id !== options.checkRunId &&
      !(check.source === 'checkRun' && check.name.startsWith(OWN_CHECK_PREFIX)) &&
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
  }
}
