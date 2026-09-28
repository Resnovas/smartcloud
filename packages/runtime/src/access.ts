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

import type { ConfigNotFound, ExtendsRef } from '@resnovas/config'
import type { Finding } from '@resnovas/engine'
import type { FileLocation, GitHubError, GitHubService, RepositoryCoordinates } from '@resnovas/integrations.github'
import { Effect, Either, Option, Redacted, Schema } from 'effect'
import { PresetUnreadable } from './github.js'

/**
 * How much a run may do: everything its token allows, or the lowest viable
 * access, because it acts with the workflow token or was started from outside
 * the repository.
 */
export type Access =
  | { readonly restricted: false }
  | {
      readonly restricted: true
      readonly reason: string
      /**
       * Whether the run can still read the house repository (`.github`)
       * with a read-only house token, so the sync check on a pull request,
       * which only reads, need not be skipped.
       */
      readonly houseReads?: boolean
    }

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
 * The features only a GitHub App token or personal access token can run,
 * and why. A restricted run skips them.
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
    user: Schema.optional(Schema.NullOr(Schema.Struct({ login: Schema.String }))),
  }),
})
const decodeOrigin = Schema.decodeUnknownOption(PullRequestOrigin)

/**
 * Why a run was started from outside the repository, if it was: a pull
 * request from a fork, or a run Dependabot started or on its pull request.
 *
 * @remarks
 * Such a run never acts with more than the workflow token, whatever the
 * workflow passes in. A pull request whose head repository has been deleted
 * counts as a fork. A pull request Dependabot opened counts as Dependabot's
 * whoever started the run, such as a reviewer on `pull_request_review`.
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
  if (origin.value.pull_request.user?.login === 'dependabot[bot]') return 'a pull request from Dependabot'
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
        access: { restricted: true, reason: 'the workflow token, without an app or access token' },
      }
    : { token: options.token, access: FULL_ACCESS }
}

/**
 * The features a run with this access skips, and why.
 *
 * @remarks
 * On a pull request, a restricted run that can read the house repository
 * (`houseReads`) keeps the sync feature: there it only checks the pull
 * request against the templates, reading them with the house token.
 *
 * @example
 * ```ts import.meta.vitest name="restrictedFeatures"
 * import { FULL_ACCESS, restrictedFeatures } from '@resnovas/runtime'
 *
 * restrictedFeatures(FULL_ACCESS).size // => 0
 * restrictedFeatures({ restricted: true, reason: 'a pull request from a fork' }).get('settings') // => 'restricted access (a pull request from a fork): repository settings need an admin token'
 * restrictedFeatures({ restricted: true, reason: 'the workflow token', houseReads: true }, 'pull_request').has('sync') // => false
 * restrictedFeatures({ restricted: true, reason: 'the workflow token', houseReads: true }, 'schedule').has('sync') // => true
 * ```
 *
 * @param access - The run's access.
 * @param event - The event the run is for, such as `pull_request`; any event when omitted.
 * @returns Each skipped feature with its reason.
 */
export const restrictedFeatures = (access: Access, event?: string): ReadonlyMap<string, string> => {
  if (!access.restricted) return new Map()
  const readsOnly = access.houseReads === true && event?.startsWith('pull_request') === true
  return new Map(
    [...PAT_ONLY_FEATURES]
      .filter(([feature]) => !(readsOnly && feature === 'sync'))
      .map(([feature, why]) => [feature, `restricted access (${access.reason}): ${why}`]),
  )
}

/**
 * Whether a preset that could not be read may be left out: only in a
 * restricted run, and only from another repository, which the workflow
 * token cannot see when it is private. A missing preset in the repository
 * itself still fails, and so does a read that failed on a rate limit or an
 * outage, which says nothing about access.
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
 * @returns The check for one preset and the error its read failed with.
 */
export const skippablePreset =
  (access: Access, repository: RepositoryCoordinates) =>
  (ref: ExtendsRef, error?: ConfigNotFound): boolean =>
    access.restricted &&
    !(error instanceof PresetUnreadable && error.transient) &&
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

/**
 * The name of the house repository an organisation keeps its presets and
 * templates in, which a read-only house token may reach.
 *
 * @example
 * ```ts import.meta.vitest name="HOUSE_REPOSITORY"
 * import { HOUSE_REPOSITORY } from '@resnovas/runtime'
 *
 * HOUSE_REPOSITORY // => '.github'
 * ```
 */
export const HOUSE_REPOSITORY = '.github'

/**
 * Wraps a GitHub service so reads of files in another repository's house
 * repository (`.github`) go through the house service first.
 *
 * @remarks
 * Only `getFile` and `listDirectory` for a `.github` repository other than
 * the service's own are sent to `house`; everything else goes to `inner`
 * unchanged. When the house token cannot see the file (GitHub answers
 * forbidden or not found, as it does for another organisation's `.github`),
 * the read is made again through `inner`, so a house token scoped to one
 * organisation never hides another's presets.
 *
 * @example
 * ```ts import.meta.vitest name="withHouseReads"
 * import { fileKey, makeMemoryGitHub } from '@resnovas/integrations.github'
 * import { withHouseReads } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const inner = makeMemoryGitHub()
 * const house = makeMemoryGitHub()
 * house.state.files.set(fileKey('Resnovas', '.github', 'house.yml'), 'version: 2\n')
 * const github = withHouseReads(inner.service, house.service)
 * await Effect.runPromise(github.getFile({ owner: 'Resnovas', repo: '.github', path: 'house.yml' })) // => 'version: 2\n'
 * ```
 *
 * @param inner - The service to wrap.
 * @param house - The service acting with the read-only house token.
 * @returns The wrapped service.
 */
export const withHouseReads = (inner: GitHubService, house: GitHubService): GitHubService => {
  const isHouse = (location: FileLocation) =>
    location.repo.toLowerCase() === HOUSE_REPOSITORY &&
    !(
      location.owner.toLowerCase() === inner.coordinates.owner.toLowerCase() &&
      location.repo.toLowerCase() === inner.coordinates.repo.toLowerCase()
    )
  const route =
    <A>(read: (service: GitHubService, location: FileLocation) => Effect.Effect<A, GitHubError>) =>
    (location: FileLocation): Effect.Effect<A, GitHubError> =>
      isHouse(location)
        ? read(house, location).pipe(
            Effect.catchIf(
              (error) => error._tag === 'Forbidden' || error._tag === 'NotFound',
              () => read(inner, location),
            ),
          )
        : read(inner, location)
  return {
    ...inner,
    getFile: route((service, location) => service.getFile(location)),
    listDirectory: route((service, location) => service.listDirectory(location)),
  }
}

/** The services a run acts through, when its tokens are split. */
export interface SplitConnection extends Connected {
  /**
   * The service acting with the app or access token, for the privileged
   * features and presets in other repositories; absent when the run has only
   * one token, when `service` does everything.
   */
  readonly privileged?: GitHubService
}

/**
 * Connects a run with each token doing only its own job.
 *
 * @remarks
 * `service` acts with the workflow token in the repository itself: check
 * runs, comments, labels, reviews and statuses. `privileged` acts with the
 * app or access token, for settings, sync and presets in other
 * repositories. Both read files in another organisation's house repository
 * (`.github`) with the read-only house token when one is given (see
 * {@link withHouseReads}).
 *
 * The token is checked and replaced as {@link connectWithFallback} does. A
 * run with restricted access, or without a workflow token, has no
 * privileged service: `service` does everything, as before the split.
 *
 * @example
 * ```ts
 * import { makeMemoryGitHub } from '@resnovas/integrations.github'
 * import { connectTokens, FULL_ACCESS } from '@resnovas/runtime'
 * import { Effect, Option, Redacted } from 'effect'
 *
 * const connected = connectTokens({
 *   token: Redacted.make('ghs_app'),
 *   workflowToken: Option.some(Redacted.make('ghs_workflow')),
 *   houseToken: Option.some(Redacted.make('ghs_house')),
 *   access: FULL_ACCESS,
 *   connect: () => Effect.succeed(makeMemoryGitHub().service),
 * })
 * ```
 *
 * @param options - The token and access from {@link accessFor}, the workflow and house tokens, and how to connect with a token.
 * @returns The in-repository service, the privileged one when there is one, and the run's access.
 */
export const connectTokens = <E, R>(options: {
  readonly token: Redacted.Redacted<string>
  readonly workflowToken: Option.Option<Redacted.Redacted<string>>
  readonly houseToken: Option.Option<Redacted.Redacted<string>>
  readonly access: Access
  readonly connect: (token: Redacted.Redacted<string>) => Effect.Effect<GitHubService, E, R>
}): Effect.Effect<SplitConnection, E, R> =>
  Effect.gen(function* () {
    const connected = yield* connectWithFallback(options)
    const house = Option.isSome(options.houseToken) ? yield* options.connect(options.houseToken.value) : undefined
    const reads = (service: GitHubService) => (house === undefined ? service : withHouseReads(service, house))
    const access: Access =
      connected.access.restricted && house !== undefined ? { ...connected.access, houseReads: true } : connected.access
    const base = { access, ...(connected.rejected === undefined ? {} : { rejected: connected.rejected }) }
    if (connected.access.restricted || Option.isNone(options.workflowToken))
      return { ...base, service: reads(connected.service) }
    const inRepository = yield* options.connect(options.workflowToken.value)
    return { ...base, service: reads(inRepository), privileged: reads(connected.service) }
  })
