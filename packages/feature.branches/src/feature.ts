/**
 * @file packages/feature.branches/src/feature.ts
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

import { compilePattern, type Subject } from '@resnovas/conditions'
import type { Branches } from '@resnovas/config'
import { type Feature, Report } from '@resnovas/engine'
import { Effect } from 'effect'
import { branchAllowed, describeBranches } from './names.js'

/**
 * The branches feature's name, as recorded on its findings.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE"
 * import { branchesFeature, FEATURE } from '@resnovas/feature.branches'
 *
 * branchesFeature.name === FEATURE // => true
 * ```
 */
export const FEATURE = 'branches'

/**
 * The rule id of a branch name finding.
 *
 * @example
 * ```ts import.meta.vitest name="BRANCH_RULE"
 * import { BRANCH_RULE } from '@resnovas/feature.branches'
 *
 * BRANCH_RULE // => 'branches.name'
 * ```
 */
export const BRANCH_RULE = `${FEATURE}.name`

/**
 * Whether the policy leaves a pull request unchecked.
 *
 * @remarks
 * A pull request is exempt when its author is one of `exempt.authors`, or
 * its head branch matches one of `exempt.branches`.
 *
 * @example
 * ```ts import.meta.vitest name="branchExempt"
 * import { branchExempt } from '@resnovas/feature.branches'
 *
 * const policy = { exempt: { branches: ['^dependabot/'], authors: ['renovate[bot]'] } }
 * branchExempt(policy, 'dependabot/npm/effect-3.20', 'dependabot[bot]') // => true
 * branchExempt(policy, 'update-deps', 'renovate[bot]') // => true
 * branchExempt(policy, 'patch-1', 'ann') // => false
 * ```
 *
 * @param policy - The `branches` section.
 * @param branch - The pull request's head branch.
 * @param author - The pull request's author.
 * @returns Whether the branch is not checked.
 */
export const branchExempt = (policy: Branches, branch: string, author: string): boolean =>
  (policy.exempt?.authors ?? []).includes(author) ||
  (policy.exempt?.branches ?? []).some((pattern) => compilePattern(pattern).test(branch))

const namesOf = (policy: Branches | undefined) => Object.keys(policy?.names ?? {})

/**
 * Checks a pull request's head branch against the policy.
 *
 * @example
 * ```ts import.meta.vitest name="checkBranch"
 * import { checkBranch } from '@resnovas/feature.branches'
 *
 * const policy = { names: { person: { preset: 'prefixed' as const } } }
 * checkBranch(policy, 'ann/fix-typo', 'ann') // => undefined
 * checkBranch(policy, 'patch-1', 'ann')?.startsWith('The branch `patch-1` does not follow') // => true
 * ```
 *
 * @param policy - The `branches` section.
 * @param branch - The pull request's head branch.
 * @param author - The pull request's author.
 * @returns The finding's message when the branch fails the policy; undefined when it passes or is exempt.
 */
export const checkBranch = (policy: Branches, branch: string, author: string): string | undefined =>
  branchExempt(policy, branch, author) || branchAllowed(policy, branch)
    ? undefined
    : [
        `The branch \`${branch}\` does not follow this repository's branch naming policy.`,
        describeBranches(policy),
        'Push the work to a branch named that way and open the pull request from it.',
      ].join('\n\n')

const check = (policy: Branches, subject: Subject) =>
  Effect.gen(function* () {
    const branch = subject.headBranch
    if (branch === undefined) return yield* Effect.logDebug('branches: no head branch on the subject')
    const message = checkBranch(policy, branch, subject.author)
    if (message !== undefined) {
      const report = yield* Report
      yield* report.add({ feature: FEATURE, rule: BRANCH_RULE, level: policy.level ?? 'error', message })
    }
    yield* Effect.logInfo(`branches: ${branch} ${message === undefined ? 'passed' : 'failed'}`).pipe(
      Effect.annotateLogs({ feature: FEATURE, branch, passed: message === undefined }),
    )
  })

/**
 * The branches feature: a branch naming policy for pull requests.
 *
 * @remarks
 * A pull request whose head branch meets none of `branches.names` is
 * recorded as a finding with the rule id {@link BRANCH_RULE}, at the policy's
 * level (default `error`), with its message or a list of the accepted names.
 * Pull requests matched by `branches.exempt` are not checked. The feature
 * runs only when `branches.names` has an entry.
 *
 * @example
 * ```ts import.meta.vitest name="branchesFeature"
 * import { branchesFeature } from '@resnovas/feature.branches'
 *
 * branchesFeature.enabled?.({ version: 2, branches: { names: { person: { preset: 'prefixed' } } } }) // => true
 * branchesFeature.enabled?.({ version: 2 }) // => false
 * ```
 */
export const branchesFeature: Feature = {
  name: FEATURE,
  handles: ['pullRequest'],
  enabled: (config) => namesOf(config.branches).length > 0,
  run: ({ config, subject }) =>
    subject === undefined || config.branches === undefined ? Effect.void : check(config.branches, subject),
}
