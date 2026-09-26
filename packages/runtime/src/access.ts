/**
 * @file packages/runtime/src/access.ts
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

import type { ExtendsRef } from '@resnovas/config'
import type { Finding } from '@resnovas/engine'
import type { GitHubService, RepositoryCoordinates } from '@resnovas/integrations.github'
import { Effect, Either, Option, Redacted, Schema } from 'effect'

/**
 * How much a run may do: everything its token allows, or the lowest viable
 * access, because it acts with the workflow token or was started from outside
 * the repository.
 */
export type Access = { readonly restricted: false } | { readonly restricted: true; readonly reason: string }

/**
 * A run with the token it was given and nothing held back.
 *
 * @example
 * ```ts import.meta.vitest name="FULL_ACCESS"
 * import { FULL_ACCESS } from '@resnovas/runtime'
 *
 * FULL_ACCESS.restricted // => false
 * ```
 */
export const FULL_ACCESS: Access = { restricted: false }

/**
 * The features only a personal access token or app token (the `ACCESS_TOKEN`
 * secret) can run, and why. A restricted run skips them.
 *
 * @example
 * ```ts import.meta.vitest name="PAT_ONLY_FEATURES"
 * import { PAT_ONLY_FEATURES } from '@resnovas/runtime'
 *
 * [...PAT_ONLY_FEATURES.keys()].join(', ') // => 'settings, sync'
 * ```
 */
export const PAT_ONLY_FEATURES: ReadonlyMap<string, string> = new Map([
  ['settings', 'repository settings need an admin token'],
  ['sync', 'cross-repository sync needs a token that can read the source and push workflow files'],
])

// The parts of a pull request event that say where its code comes from.
const PullRequestOrigin = Schema.Struct({
  pull_request: Schema.Struct({
    head: Schema.Struct({ repo: Schema.NullOr(Schema.Struct({ full_name: Schema.String })) }),
  }),
})
const decodeOrigin = Schema.decodeUnknownOption(PullRequestOrigin)

/**
 * Why a run was started from outside the repository, if it was: a pull
 * request from a fork, or a run Dependabot started.
 *
 * @remarks
 * Such a run never acts with more than the workflow token, whatever the
 * workflow passes in. A pull request whose head repository has been deleted
 * counts as a fork.
 *
 * @example
 * ```ts import.meta.vitest name="externalRun"
 * import { externalRun } from '@resnovas/runtime'
 *
 * const fork = { pull_request: { head: { repo: { full_name: 'someone/smartcloud' } } } }
 * externalRun({ name: 'pull_request', payload: fork }, 'Resnovas/smartcloud', 'someone') // => 'a pull request from a fork'
 * externalRun({ name: 'push', payload: {} }, 'Resnovas/smartcloud', 'dependabot[bot]') // => 'a run started by Dependabot'
 * externalRun({ name: 'push', payload: {} }, 'Resnovas/smartcloud', 'TGTGamer') // => undefined
 * ```
 *
 * @param event - The event name and payload.
 * @param repository - The repository the run is in, as `owner/name`.
 * @param actor - Who started the run (`GITHUB_ACTOR`), if known.
 * @returns The reason, or undefined for a run from inside the repository.
 */
export const externalRun = (
  event: { readonly name: string; readonly payload: unknown },
  repository: string,
  actor: string | undefined,
): string | undefined => {
  if (actor === 'dependabot[bot]') return 'a run started by Dependabot'
  const origin = decodeOrigin(event.payload)
  if (Option.isNone(origin)) return undefined
  const head = origin.value.pull_request.head.repo?.full_name
  return head?.toLowerCase() === repository.toLowerCase() ? undefined : 'a pull request from a fork'
}

/**
 * Picks the token a run acts with and its access.
 *
 * @remarks
 * A run started from outside the repository acts with the workflow token
 * when it has one, even if the workflow passed a stronger token. A run
 * whose token is the workflow token is restricted too: it cannot read
 * private presets in other repositories, change settings or push workflow
 * files. Any other token runs with full access.
 *
 * @example
 * ```ts import.meta.vitest name="accessFor"
 * import { accessFor } from '@resnovas/runtime'
 * import { Option, Redacted } from 'effect'
 *
 * const workflow = Redacted.make('ghs_workflow')
 * const pat = Redacted.make('github_pat_x')
 * accessFor({ token: pat, workflowToken: Option.some(workflow), external: undefined }).access.restricted // => false
 * accessFor({ token: workflow, workflowToken: Option.some(workflow), external: undefined }).access.restricted // => true
 * Redacted.value(accessFor({ token: pat, workflowToken: Option.some(workflow), external: 'a pull request from a fork' }).token) // => 'ghs_workflow'
 * ```
 *
 * @param options - The token given, the workflow token if known, and why the run is external, if it is.
 * @returns The token to act with, and the access that goes with it.
 */
export const accessFor = (options: {
  readonly token: Redacted.Redacted<string>
  readonly workflowToken: Option.Option<Redacted.Redacted<string>>
  readonly external: string | undefined
}): { readonly token: Redacted.Redacted<string>; readonly access: Access } => {
  if (options.external !== undefined) {
    return {
      token: Option.getOrElse(options.workflowToken, () => options.token),
      access: { restricted: true, reason: options.external },
    }
  }
  const isWorkflowToken = Option.exists(
    options.workflowToken,
    (workflow) => Redacted.value(workflow) === Redacted.value(options.token),
  )
  return isWorkflowToken
    ? {
        token: options.token,
        access: { restricted: true, reason: 'the workflow token, without the ACCESS_TOKEN secret' },
      }
    : { token: options.token, access: FULL_ACCESS }
}

/**
 * The features a run with this access skips, and why.
 *
 * @example
 * ```ts import.meta.vitest name="restrictedFeatures"
 * import { FULL_ACCESS, restrictedFeatures } from '@resnovas/runtime'
 *
 * restrictedFeatures(FULL_ACCESS).size // => 0
 * restrictedFeatures({ restricted: true, reason: 'a pull request from a fork' }).get('settings') // => 'restricted access (a pull request from a fork): repository settings need an admin token'
 * ```
 *
 * @param access - The run's access.
 * @returns Each skipped feature with its reason.
 */
export const restrictedFeatures = (access: Access): ReadonlyMap<string, string> =>
  access.restricted
    ? new Map([...PAT_ONLY_FEATURES].map(([feature, why]) => [feature, `restricted access (${access.reason}): ${why}`]))
    : new Map()

/**
 * Whether a preset that could not be read may be left out: only in a
 * restricted run, and only from another repository, which the workflow
 * token cannot see when it is private. A missing preset in the repository
 * itself still fails.
 *
 * @example
 * ```ts import.meta.vitest name="skippablePreset"
 * import { FULL_ACCESS, skippablePreset } from '@resnovas/runtime'
 *
 * const restricted = { restricted: true, reason: 'a pull request from a fork' } as const
 * const here = { owner: 'Resnovas', repo: 'smartcloud' }
 * skippablePreset(restricted, here)({ owner: 'Resnovas', repo: '.github', path: 'house.yml' }) // => true
 * skippablePreset(restricted, here)({ owner: 'resnovas', repo: 'SmartCloud', path: 'house.yml' }) // => false
 * skippablePreset(FULL_ACCESS, here)({ owner: 'Resnovas', repo: '.github', path: 'house.yml' }) // => false
 * ```
 *
 * @param access - The run's access.
 * @param repository - The repository the run is in.
 * @returns The check for one preset.
 */
export const skippablePreset =
  (access: Access, repository: RepositoryCoordinates) =>
  (ref: ExtendsRef): boolean =>
    access.restricted &&
    (ref.owner.toLowerCase() !== repository.owner.toLowerCase() ||
      ref.repo.toLowerCase() !== repository.repo.toLowerCase())

/**
 * The findings that report a restricted run: a notice naming why it was
 * restricted, and a warning for everything left out of the config, whose
 * rules were therefore not checked.
 *
 * @example
 * ```ts import.meta.vitest name="accessFindings"
 * import { accessFindings, FULL_ACCESS } from '@resnovas/runtime'
 *
 * accessFindings(FULL_ACCESS, []).length // => 0
 * accessFindings({ restricted: true, reason: 'a pull request from a fork' }, ['the extends preset o/r/p.yml: not found']).map((finding) => finding.level).join(',') // => 'notice,warning'
 * ```
 *
 * @param access - The run's access.
 * @param skipped - What the config left out, as `ResolvedConfig.skipped` lists it.
 * @returns The findings, none for a run with full access.
 */
export const accessFindings = (access: Access, skipped: ReadonlyArray<string>): ReadonlyArray<Finding> =>
  access.restricted
    ? [
        {
          feature: 'access',
          rule: 'access.restricted',
          level: 'notice',
          message: `ran with restricted access (${access.reason}): features and writes that need a stronger token were skipped`,
        },
        ...skipped.map((item): Finding => ({
          feature: 'access',
          rule: 'access.config-skipped',
          level: 'warning',
          message: `left out ${item}; its rules were not checked in this run`,
        })),
      ]
    : []

/** The service a run acts through, its access, and why its token was dropped, if it was. */
export interface Connected {
  readonly service: GitHubService
  readonly access: Access
  /** GitHub's answer when it rejected the given token and the run fell back to the workflow token. */
  readonly rejected?: string
}

/**
 * Connects with the run's token, and falls back to the workflow token when
 * GitHub rejects it.
 *
 * @remarks
 * A token that is invalid, expired or refused by an organisation policy
 * fails every call. Before a run with full access starts, the token reads
 * the repository once; if GitHub answers forbidden or not found, the run
 * reconnects with the workflow token and is restricted, and `rejected`
 * carries GitHub's answer so the run can warn about it. Any other failure,
 * such as an outage, is left for the run to report as before. A run that
 * is already restricted, or has no workflow token to fall back to, is not
 * probed.
 *
 * @example
 * ```ts
 * import { makeMemoryGitHub } from '@resnovas/integrations.github'
 * import { connectWithFallback, FULL_ACCESS } from '@resnovas/runtime'
 * import { Effect, Option, Redacted } from 'effect'
 *
 * const connected = connectWithFallback({
 *   token: Redacted.make('github_pat_x'),
 *   workflowToken: Option.some(Redacted.make('ghs_workflow')),
 *   access: FULL_ACCESS,
 *   connect: () => Effect.succeed(makeMemoryGitHub().service),
 * })
 * ```
 *
 * @param options - The token and access from {@link accessFor}, the workflow token, and how to connect with a token.
 * @returns The service to act through and the run's access.
 */
export const connectWithFallback = <E, R>(options: {
  readonly token: Redacted.Redacted<string>
  readonly workflowToken: Option.Option<Redacted.Redacted<string>>
  readonly access: Access
  readonly connect: (token: Redacted.Redacted<string>) => Effect.Effect<GitHubService, E, R>
}): Effect.Effect<Connected, E, R> =>
  Effect.gen(function* () {
    const service = yield* options.connect(options.token)
    if (options.access.restricted || Option.isNone(options.workflowToken)) return { service, access: options.access }
    const probe = yield* Effect.either(service.getRepository)
    if (Either.isRight(probe) || (probe.left._tag !== 'Forbidden' && probe.left._tag !== 'NotFound'))
      return { service, access: options.access }
    const fallback = yield* options.connect(options.workflowToken.value)
    return {
      service: fallback,
      access: {
        restricted: true,
        reason: 'GitHub rejected the given token, so the run fell back to the workflow token',
      },
      rejected: probe.left.message,
    }
  })
