/**
 * @file packages/feature.reviews/src/gate.ts
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

import type { Review } from '@resnovas/conditions'

/**
 * The default base URL findings link to when the config sets no `links.policyBase`.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_POLICY_BASE"
 * import { DEFAULT_POLICY_BASE } from '@resnovas/feature.reviews'
 *
 * `${DEFAULT_POLICY_BASE}/GOVERNANCE.md#review`.endsWith('/GOVERNANCE.md#review') // => true
 * ```
 */
export const DEFAULT_POLICY_BASE = 'https://github.com/Resnovas/.github/blob/main'

/**
 * Compares two GitHub logins the way GitHub does: case-insensitively, and
 * ignoring a leading `@` that configs often carry.
 *
 * @example
 * ```ts import.meta.vitest name="sameLogin"
 * import { sameLogin } from '@resnovas/feature.reviews'
 *
 * sameLogin('@Octocat', 'octocat') // => true
 * ```
 *
 * @param a - One login.
 * @param b - The other login.
 * @returns Whether both name the same account.
 */
export const sameLogin = (a: string, b: string): boolean =>
  normaliseLogin(a).toLowerCase() === normaliseLogin(b).toLowerCase()

/**
 * Strips the leading `@` a config may write before a login.
 *
 * @example
 * ```ts import.meta.vitest name="normaliseLogin"
 * import { normaliseLogin } from '@resnovas/feature.reviews'
 *
 * normaliseLogin('@octocat') // => 'octocat'
 * ```
 *
 * @param login - A login, with or without `@`.
 * @returns The bare login.
 */
export const normaliseLogin = (login: string): string => login.replace(/^@/, '')

/** The roles and thresholds the gate applies. */
export interface GateInput {
  readonly author: string
  /** Every review on the pull request, oldest first, as GitHub lists them. */
  readonly reviews: ReadonlyArray<Review>
  readonly maintainers: ReadonlyArray<string>
  readonly trustedBots: ReadonlyArray<string>
  /** Approvals needed when the author is not a maintainer. */
  readonly outside: number
  /** Approvals needed when the author is a maintainer. */
  readonly maintainer: number
}

/** Why the gate asks for nothing. */
export type GateOpen = { readonly status: 'open'; readonly reason: 'fewerThanTwoMaintainers' | 'trustedBot' }

/** The gate applied: how many approvals were needed and who gave them. */
export type GateApplied = {
  readonly status: 'passed' | 'failed'
  readonly required: number
  readonly approvedBy: ReadonlyArray<string>
  readonly authorIsMaintainer: boolean
}

/** The outcome of the maintainer review gate. */
export type GateResult = GateOpen | GateApplied

// One account listed twice, in another case or with an `@`, is still one
// maintainer: it counts once towards the gate and fills one approval.
const uniqueLogins = (logins: ReadonlyArray<string>): ReadonlyArray<string> => {
  const unique = new Map<string, string>()
  for (const login of logins) {
    const key = normaliseLogin(login).toLowerCase()
    if (!unique.has(key)) unique.set(key, login)
  }
  return [...unique.values()]
}

/**
 * The latest decisive review state of each reviewer, keyed by lowercased login.
 *
 * @remarks
 * COMMENTED and PENDING reviews do not change a reviewer's standing, so they
 * are skipped; a later CHANGES_REQUESTED or DISMISSED replaces an earlier
 * approval, which is how an approval is withdrawn.
 *
 * @example
 * ```ts import.meta.vitest name="latestDecisive"
 * import { latestDecisive } from '@resnovas/feature.reviews'
 *
 * const latest = latestDecisive([
 *   { author: 'Ann', state: 'APPROVED' },
 *   { author: 'ann', state: 'COMMENTED' },
 * ])
 * latest.get('ann') // => 'APPROVED'
 * ```
 *
 * @param reviews - Every review, oldest first.
 * @returns Each reviewer's standing review state.
 */
export const latestDecisive = (reviews: ReadonlyArray<Review>): ReadonlyMap<string, Review['state']> => {
  const latest = new Map<string, Review['state']>()
  for (const review of reviews) {
    if (review.state === 'COMMENTED' || review.state === 'PENDING') continue
    latest.set(normaliseLogin(review.author).toLowerCase(), review.state)
  }
  return latest
}

/**
 * Applies the maintainer review gate from GOVERNANCE.md ("Review requirements").
 *
 * @remarks
 * While fewer than two maintainers are configured the owner has full
 * discretion, so the gate is open. Trusted bots skip it. Otherwise each
 * maintainer's latest decisive review counts, and the author's own review
 * never does: the author's review is part of their accountability.
 *
 * @example
 * ```ts import.meta.vitest name="evaluateGate"
 * import { evaluateGate } from '@resnovas/feature.reviews'
 *
 * const result = evaluateGate({
 *   author: 'contributor',
 *   reviews: [{ author: 'ann', state: 'APPROVED' }],
 *   maintainers: ['ann', 'bob'],
 *   trustedBots: [],
 *   outside: 1,
 *   maintainer: 1,
 * })
 * result.status // => 'passed'
 * ```
 *
 * @param input - The author, the reviews, the roles and the thresholds.
 * @returns Whether the gate is open, passed or failed, with the approvers.
 */
export const evaluateGate = (input: GateInput): GateResult => {
  const maintainers = uniqueLogins(input.maintainers)
  if (maintainers.length < 2) return { status: 'open', reason: 'fewerThanTwoMaintainers' }
  if (input.trustedBots.some((bot) => sameLogin(bot, input.author))) return { status: 'open', reason: 'trustedBot' }
  const authorIsMaintainer = maintainers.some((login) => sameLogin(login, input.author))
  const required = authorIsMaintainer ? input.maintainer : input.outside
  const latest = latestDecisive(input.reviews)
  const approvedBy = maintainers
    .filter(
      (login) => !sameLogin(login, input.author) && latest.get(normaliseLogin(login).toLowerCase()) === 'APPROVED',
    )
    .map(normaliseLogin)
  return { status: approvedBy.length >= required ? 'passed' : 'failed', required, approvedBy, authorIsMaintainer }
}

/**
 * The message for a failed gate: how many approvals are needed, and who approved.
 *
 * @example
 * ```ts import.meta.vitest name="gateMessage"
 * import { gateMessage } from '@resnovas/feature.reviews'
 *
 * const message = gateMessage({ status: 'failed', required: 2, approvedBy: ['ann'], authorIsMaintainer: false })
 * message.endsWith('has 1 (approved by @ann).') // => true
 * ```
 *
 * @param result - A failed gate.
 * @returns A sentence for the finding.
 */
export const gateMessage = (result: GateApplied): string => {
  const who = result.authorIsMaintainer ? 'other maintainer' : 'maintainer'
  const approvers =
    result.approvedBy.length === 0 ? 'nobody yet' : result.approvedBy.map((login) => `@${login}`).join(', ')
  return (
    `Needs ${result.required} ${who} approval(s) from someone other than the author; ` +
    `has ${result.approvedBy.length} (approved by ${approvers}).`
  )
}
