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
import type { RepositoryCoordinates } from '@resnovas/integrations.github'
import { Option, Redacted, Schema } from 'effect'

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
