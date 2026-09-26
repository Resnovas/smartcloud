/**
 * @file packages/feature.commits/src/policy.ts
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

import type { Commit, Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import type { Finding, FeatureContext } from '@resnovas/engine'
import { Data, Effect } from 'effect'

/** How the author of a pull request is treated by the policy features. */
export type Role = 'bot' | 'maintainer' | 'contributor'

/** The level a maintainer's findings are reported at. */
export type MaintainerLevel = 'error' | 'warning'

/**
 * Where findings link when `links.policyBase` is not set.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_POLICY_BASE"
 * import { DEFAULT_POLICY_BASE, policyBase } from '@resnovas/feature.commits'
 *
 * policyBase({ version: 2 }) === DEFAULT_POLICY_BASE // => true
 * ```
 */
export const DEFAULT_POLICY_BASE = 'https://github.com/Resnovas/.github/blob/main'

// Only a person can certify the DCO, so this stays an error even on a
// maintainer's own pull request.
const NEVER_DOWNGRADED: ReadonlySet<string> = new Set(['AI-03'])

const withoutAt = (login: string): string => (login.startsWith('@') ? login.slice(1) : login)

/**
 * Whether two GitHub logins are the same account: ignoring case, and with a
 * leading `@` optional on either.
 *
 * @example
 * ```ts import.meta.vitest name="sameLogin"
 * import { sameLogin } from '@resnovas/feature.commits'
 *
 * sameLogin('@Jane', 'jane') // => true
 * ```
 *
 * @param a - A login, for example `@Jane`.
 * @param b - Another login.
 * @returns True when they name the same account.
 */
export const sameLogin = (a: string, b: string): boolean => withoutAt(a).toLowerCase() === withoutAt(b).toLowerCase()

/**
 * Works out the author's role from `config.roles`.
 *
 * @example
 * ```ts import.meta.vitest name="authorRole"
 * import { authorRole } from '@resnovas/feature.commits'
 *
 * const roles = { maintainers: ['ann'], trustedBots: ['dependabot[bot]'] }
 * authorRole('dependabot[bot]', roles) // => 'bot'
 * authorRole('octo', roles, 'octo') // => 'maintainer'
 * authorRole('sam', roles) // => 'contributor'
 * ```
 *
 * @param author - The pull request author's login.
 * @param roles - The config's `roles` section.
 * @param owner - The repository owner's login; an author who owns the repository is a maintainer.
 * @returns `bot` for a trusted bot, `maintainer` for a listed maintainer or the owner, otherwise `contributor`.
 */
export const authorRole = (author: string, roles: SmartcloudConfig['roles'], owner?: string): Role => {
  if ((roles?.trustedBots ?? []).some((bot) => sameLogin(bot, author))) return 'bot'
  if ((roles?.maintainers ?? []).some((maintainer) => sameLogin(maintainer, author))) return 'maintainer'
  return owner !== undefined && sameLogin(owner, author) ? 'maintainer' : 'contributor'
}

/**
 * The level a finding is reported at for an author's role.
 *
 * @example
 * ```ts import.meta.vitest name="levelFor"
 * import { levelFor } from '@resnovas/feature.commits'
 *
 * levelFor('maintainer', 'DCO', undefined) // => 'warning'
 * levelFor('maintainer', 'AI-03', 'warning') // => 'error'
 * ```
 *
 * @param role - The author's role.
 * @param rule - The rule id; `AI-03` is never downgraded.
 * @param maintainerLevel - The configured level for maintainers, `warning` by default.
 * @returns `error`, or the maintainer level on a maintainer's own pull request.
 */
export const levelFor = (role: Role, rule: string, maintainerLevel: MaintainerLevel | undefined): Finding['level'] =>
  role === 'maintainer' && !NEVER_DOWNGRADED.has(rule) ? (maintainerLevel ?? 'warning') : 'error'

/**
 * The base URL findings link to, without a trailing slash.
 *
 * @example
 * ```ts import.meta.vitest name="policyBase"
 * import { policyBase } from '@resnovas/feature.commits'
 *
 * policyBase({ version: 2, links: { policyBase: 'https://example.com/policy/' } }) // => 'https://example.com/policy'
 * ```
 *
 * @param config - The config.
 * @returns `links.policyBase`, or the Resnovas governance repository.
 */
export const policyBase = (config: SmartcloudConfig): string => {
  let base = config.links?.policyBase ?? DEFAULT_POLICY_BASE
  while (base.endsWith('/')) base = base.slice(0, -1)
  return base
}

/**
 * The pull request's commits were not loaded, although the feature asked for them.
 *
 * @example
 * ```ts import.meta.vitest name="CommitsNotLoaded"
 * import { CommitsNotLoaded } from '@resnovas/feature.commits'
 *
 * new CommitsNotLoaded({ feature: 'commits' })._tag // => 'CommitsNotLoaded'
 * ```
 */
export class CommitsNotLoaded extends Data.TaggedError('CommitsNotLoaded')<{ readonly feature: string }> {
  override get message() {
    return `the ${this.feature} feature needs the pull request's commits, but they were not loaded`
  }
}

/**
 * The pull request and its commits, which the policy features ask the engine
 * to load.
 *
 * @example
 * ```ts import.meta.vitest name="pullRequestCommits"
 * import { pullRequestCommits } from '@resnovas/feature.commits'
 * import { Effect } from 'effect'
 *
 * const context = { config: { version: 2 as const }, envelope: { kind: 'repository' as const, event: 'schedule' } }
 * Effect.runSync(Effect.flip(pullRequestCommits(context, 'commits')))._tag // => 'CommitsNotLoaded'
 * ```
 *
 * @param context - The feature context.
 * @param feature - The feature's name, for the error.
 * @returns The subject and its commits, or `CommitsNotLoaded`.
 */
export const pullRequestCommits = (
  context: FeatureContext,
  feature: string,
): Effect.Effect<{ readonly subject: Subject; readonly commits: ReadonlyArray<Commit> }, CommitsNotLoaded> => {
  const subject = context.subject
  return subject?.commits === undefined ? Effect.fail(new CommitsNotLoaded({ feature })) : Effect.succeed({ subject, commits: subject.commits })
}
