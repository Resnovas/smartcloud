/**
 * @file packages/feature.branches/src/names.ts
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
import type { BranchName, Branches } from '@resnovas/config'

// A key and number between separators, such as smc-75 in claude/smc-75-freeze.
// The key is bounded, so matching stays linear in the branch name's length.
const ISSUE_KEY = /(?:^|[^A-Za-z0-9])([A-Za-z][A-Za-z0-9]{0,9})-\d+(?![A-Za-z0-9])/g

/**
 * Lists the issue keys a branch name holds, in upper case.
 *
 * @remarks
 * An issue key is a letter, up to nine more letters or digits, a hyphen and
 * a number, with no letter or digit either side, so `smc-75` counts in
 * `claude/smc-75-freeze` but not in `docs75-1x`. GitHub's own `patch-1` has
 * that shape too, so a policy usually lists its tracker's keys.
 *
 * @example
 * ```ts import.meta.vitest name="issueKeys"
 * import { issueKeys } from '@resnovas/feature.branches'
 *
 * issueKeys('claude/smc-75-branch-names').join() // => 'SMC'
 * issueKeys('feat/labels').length // => 0
 * ```
 *
 * @param branch - The branch name.
 * @returns The keys, such as `SMC`, in the order they appear.
 */
export const issueKeys = (branch: string): ReadonlyArray<string> =>
  Array.from(branch.matchAll(ISSUE_KEY), (match) => (match[1] ?? '').toUpperCase())

const prefixed = (name: BranchName, branch: string): boolean => {
  const slash = branch.indexOf('/')
  if (slash <= 0 || slash === branch.length - 1) return false
  return name.prefixes === undefined || name.prefixes.includes(branch.slice(0, slash))
}

const keyed = (name: BranchName, branch: string): boolean => {
  const found = issueKeys(branch)
  if (name.keys === undefined) return found.length > 0
  const keys = name.keys.map((key) => key.toUpperCase())
  return found.some((key) => keys.includes(key))
}

/**
 * Whether a branch name meets one accepted form.
 *
 * @remarks
 * Every part the form sets must hold: its preset and its pattern.
 * `prefixed` needs a non-empty prefix, a slash and a non-empty description,
 * with the prefix one of `prefixes` when they are given. `issueKey` needs an
 * issue key (see {@link issueKeys}), one of `keys` when they are given, in any
 * case.
 *
 * @example
 * ```ts import.meta.vitest name="matchesBranchName"
 * import { matchesBranchName } from '@resnovas/feature.branches'
 *
 * matchesBranchName({ preset: 'prefixed' }, 'ann/fix-typo') // => true
 * matchesBranchName({ preset: 'prefixed', prefixes: ['feat'] }, 'ann/fix-typo') // => false
 * matchesBranchName({ preset: 'issueKey', keys: ['SMC'] }, 'claude/smc-75-names') // => true
 * matchesBranchName({ pattern: '^release/' }, 'release/2.0') // => true
 * ```
 *
 * @param name - The accepted form.
 * @param branch - The branch name.
 * @returns Whether the branch meets every part of the form.
 */
export const matchesBranchName = (name: BranchName, branch: string): boolean =>
  (name.preset !== 'prefixed' || prefixed(name, branch)) &&
  (name.preset !== 'issueKey' || keyed(name, branch)) &&
  (name.pattern === undefined || compilePattern(name.pattern).test(branch))

const code = (text: string) => `\`${text}\``
const either = (items: ReadonlyArray<string>) => items.map(code).join(' or ')

/**
 * Explains one accepted form of branch name.
 *
 * @example
 * ```ts import.meta.vitest name="describeBranchName"
 * import { describeBranchName } from '@resnovas/feature.branches'
 *
 * describeBranchName({ preset: 'prefixed', prefixes: ['feat', 'fix'] }) // => '`<prefix>/<description>`, where the prefix is `feat` or `fix`'
 * describeBranchName({ preset: 'issueKey', keys: ['SMC'] }) // => 'an issue key such as `SMC-123`, with the key `SMC`'
 * describeBranchName({ pattern: '^release/' }) // => 'matching `^release/`'
 * ```
 *
 * @param name - The accepted form.
 * @returns A plain-text explanation, its parts joined by "and".
 */
export const describeBranchName = (name: BranchName): string => {
  const parts: Array<string> = []
  if (name.preset === 'prefixed') {
    parts.push(
      name.prefixes === undefined
        ? '`<prefix>/<description>`'
        : `\`<prefix>/<description>\`, where the prefix is ${either(name.prefixes)}`,
    )
  }
  if (name.preset === 'issueKey') {
    const example = `${name.keys?.[0]?.toUpperCase() ?? 'ABC'}-123`
    parts.push(
      name.keys === undefined
        ? `an issue key such as ${code(example)}`
        : `an issue key such as ${code(example)}, with the key ${either(name.keys.map((key) => key.toUpperCase()))}`,
    )
  }
  if (name.pattern !== undefined) parts.push(`matching ${code(name.pattern)}`)
  return parts.join(' and ')
}

/**
 * Whether a branch name meets any of the policy's accepted forms.
 *
 * @example
 * ```ts import.meta.vitest name="branchAllowed"
 * import { branchAllowed } from '@resnovas/feature.branches'
 *
 * const policy = { names: { person: { preset: 'prefixed' as const }, issue: { preset: 'issueKey' as const, keys: ['SMC'] } } }
 * branchAllowed(policy, 'smc-75') // => true
 * branchAllowed(policy, 'patch-1') // => false
 * ```
 *
 * @param policy - The `branches` section.
 * @param branch - The branch name.
 * @returns Whether some accepted form matches.
 */
export const branchAllowed = (policy: Branches, branch: string): boolean =>
  Object.values(policy.names ?? {}).some((name) => matchesBranchName(name, branch))

/**
 * Explains what the policy expects of a branch name.
 *
 * @remarks
 * The policy's `message` when it sets one; otherwise a list of the accepted
 * forms by key. The branches feature and the CLI's rule explanation use it.
 *
 * @example
 * ```ts import.meta.vitest name="describeBranches"
 * import { describeBranches } from '@resnovas/feature.branches'
 *
 * describeBranches({ names: { person: { preset: 'prefixed' } } }) // => 'Name the branch one of these ways:\n- person: `<prefix>/<description>`'
 * describeBranches({ message: 'Use <you>/<what>.' }) // => 'Use <you>/<what>.'
 * ```
 *
 * @param policy - The `branches` section.
 * @returns A plain-text explanation, lines separated by `\n`.
 */
export const describeBranches = (policy: Branches): string =>
  policy.message ??
  [
    'Name the branch one of these ways:',
    ...Object.entries(policy.names ?? {}).map(([key, name]) => `- ${key}: ${describeBranchName(name)}`),
  ].join('\n')
