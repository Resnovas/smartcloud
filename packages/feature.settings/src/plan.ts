/**
 * @file packages/feature.settings/src/plan.ts
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

import type { Roles, Settings } from '@resnovas/config'
import type { Repository, RepositoryRequest } from '@resnovas/integrations.github'

// Pure planning for the repository settings baseline, ported from the house
// script (Resnovas/.github scripts/lib/settings.mjs). Every request shape was
// checked against GitHub's published REST description and GraphQL schema, so
// the bodies below keep that script's field names and order exactly. Unlike
// the script, the config is declarative: only configured fields are planned,
// and anything left out stays as it is on GitHub.

/** The repository settings section of the config. */
export type SettingsConfig = typeof Settings.Type

/** The roles section of the config. */
export type RolesConfig = typeof Roles.Type

/** What a repository ships, which decides its deployment environments. */
export type ProjectType = 'saas' | 'desktop' | 'library' | 'none'

/** The deployment environments each project type gets. */
export const ENVIRONMENT_SETS: Readonly<Record<ProjectType, ReadonlyArray<string>>> = {
  saas: ['Production', 'Staging', 'Development'],
  desktop: ['Windows', 'Linux', 'macOS', 'Windows Beta', 'Linux Beta', 'macOS Beta'],
  library: ['Release'],
  none: [],
}

/** The ruleset name used when the config does not name one. */
export const DEFAULT_RULESET_NAME = 'house: default branch'

/** Fields every planned step carries. */
interface StepBase {
  /** A stable id, used as the finding rule, for example `merging` or `environment:Production`. */
  readonly id: string
  readonly description: string
  /** Failure is expected on some repositories, so it is reported as a warning rather than an error. */
  readonly optional: boolean
}

/** A repository-scoped REST call. */
export interface RestStep extends StepBase {
  readonly kind: 'rest'
  readonly request: RepositoryRequest
}

/** A GraphQL mutation. */
export interface GraphqlStep extends StepBase {
  readonly kind: 'graphql'
  readonly query: string
  readonly variables: Readonly<Record<string, unknown>>
}

/** One ruleset rule, in the shape of GitHub's repository rulesets API. */
export interface RulesetRule {
  readonly type: string
  readonly parameters?: Readonly<Record<string, unknown>>
}

/** A ruleset bypass actor. */
export interface BypassActor {
  readonly actor_id: number
  readonly actor_type: 'RepositoryRole'
  readonly bypass_mode: 'always'
}

/** The body of `POST /rulesets` and `PUT /rulesets/{id}`. */
// A type alias rather than an interface, so it is assignable to a request body.
export type RulesetBody = {
  readonly name: string
  readonly target: 'branch'
  readonly enforcement: 'active'
  readonly conditions: { readonly ref_name: { readonly include: ReadonlyArray<string>; readonly exclude: ReadonlyArray<string> } }
  readonly bypass_actors: ReadonlyArray<BypassActor>
  readonly rules: ReadonlyArray<RulesetRule>
}

/** A ruleset to create or update, matched by name. */
export interface RulesetStep extends StepBase {
  readonly kind: 'ruleset'
  readonly ruleset: RulesetBody
}

/** One planned change to a repository. */
export type SettingsStep = RestStep | GraphqlStep | RulesetStep

/**
 * The environments to create: explicit `names` win, otherwise `projectType`
 * picks a set.
 *
 * @param environments - The `settings.environments` section.
 * @returns The environment names, in order; empty when nothing is configured.
 */
export const environmentsFor = (environments: SettingsConfig['environments']): ReadonlyArray<string> => {
  const explicit = environments?.names ?? []
  if (explicit.length > 0) return explicit
  return ENVIRONMENT_SETS[environments?.projectType ?? 'none']
}

/**
 * Whether an environment deploys only from protected branches.
 *
 * @remarks
 * Anything that ships to users deploys only from protected branches. Staging,
 * development, preview and beta channels accept any branch so they stay
 * useful for testing.
 *
 * @param name - The environment name.
 * @returns True for shipping environments.
 */
export const isProtectedEnvironment = (name: string): boolean =>
  !/^(staging|development|dev|preview)$/i.test(name) && !/\bbeta$/i.test(name)

/**
 * The body of `PUT /environments/{name}`.
 *
 * @param name - The environment name.
 * @returns The deployment branch policy for that environment.
 */
export const environmentBody = (name: string): Readonly<Record<string, unknown>> => ({
  deployment_branch_policy: isProtectedEnvironment(name) ? { protected_branches: true, custom_branch_policies: false } : null,
})

// Actor 5 is the repository admin role. The owner wants to be able to
// override the ruleset, including the review gate, whatever else is set.
const ADMIN_BYPASS: BypassActor = { actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }

/**
 * The ruleset for the default branch.
 *
 * @remarks
 * A rule is present only when its switch is true: the ruleset is written
 * whole, so a switch left out means the rule is not enforced. Required
 * status checks bind only once two or more maintainers are configured, so a
 * sole maintainer is never blocked by the review gate. Admins may bypass
 * unless `adminBypass` is false.
 *
 * @param ruleset - The `settings.ruleset` section.
 * @param roles - The `roles` section, for the maintainer count.
 * @returns The request body.
 */
export const rulesetBody = (ruleset: NonNullable<SettingsConfig['ruleset']>, roles: RolesConfig | undefined): RulesetBody => {
  const rules: Array<RulesetRule> = []
  if (ruleset.blockDeletion === true) rules.push({ type: 'deletion' })
  if (ruleset.blockForcePush === true) rules.push({ type: 'non_fast_forward' })
  if (ruleset.linearHistory === true) rules.push({ type: 'required_linear_history' })
  // AI review on every pull request, drafts included, so problems surface
  // before the accountable human marks it ready.
  if (ruleset.copilotReview === true) {
    rules.push({ type: 'copilot_code_review', parameters: { review_draft_pull_requests: true, review_on_push: true } })
  }
  if (ruleset.codeScanningGate === true) {
    rules.push({
      type: 'code_scanning',
      parameters: { code_scanning_tools: [{ tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' }] },
    })
  }
  const checks = ruleset.requiredChecks ?? []
  if (checks.length > 0 && (roles?.maintainers ?? []).length >= 2) {
    rules.push({
      type: 'required_status_checks',
      parameters: {
        strict_required_status_checks_policy: false,
        required_status_checks: checks.map((context) => ({ context })),
      },
    })
  }
  return {
    name: ruleset.name ?? DEFAULT_RULESET_NAME,
    target: 'branch',
    enforcement: 'active',
    conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
    bypass_actors: ruleset.adminBypass === false ? [] : [ADMIN_BYPASS],
    rules,
  }
}

// Copies the configured fields into a body under GitHub's names, in the
// order given, skipping anything the config leaves out.
const pick = <C extends object>(
  config: C | undefined,
  fields: ReadonlyArray<readonly [keyof C, string]>,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {}
  if (config === undefined) return body
  for (const [key, name] of fields) {
    const value = config[key]
    if (value !== undefined) body[name] = value
  }
  return body
}

type Merging = NonNullable<SettingsConfig['merging']>
type Features = NonNullable<SettingsConfig['features']>
type Security = NonNullable<SettingsConfig['security']>

const mergingBody = (settings: SettingsConfig): Record<string, unknown> => ({
  ...pick<Merging>(settings.merging, [
    ['mergeCommit', 'allow_merge_commit'],
    ['squash', 'allow_squash_merge'],
    ['rebase', 'allow_rebase_merge'],
    ['autoMerge', 'allow_auto_merge'],
    ['updateBranch', 'allow_update_branch'],
    ['deleteBranchOnMerge', 'delete_branch_on_merge'],
    ['webCommitSignoff', 'web_commit_signoff_required'],
  ]),
  ...pick<Features>(settings.features, [['wiki', 'has_wiki']]),
  // Keeping the commit messages preserves every Signed-off-by, Co-authored-by
  // and Assisted-by trailer through a squash.
  ...pick<Merging>(settings.merging, [
    ['squashTitle', 'squash_merge_commit_title'],
    ['squashMessage', 'squash_merge_commit_message'],
  ]),
})

// Discussions and sponsorships have no REST field, so they go through the
// GraphQL updateRepository mutation. The values are booleans from a decoded
// schema, so writing them into the query cannot inject anything.
const featuresInput = (features: SettingsConfig['features']): ReadonlyArray<string> =>
  Object.entries(
    pick<Features>(features, [
      ['discussions', 'hasDiscussionsEnabled'],
      ['sponsorships', 'hasSponsorshipsEnabled'],
      ['wiki', 'hasWikiEnabled'],
    ]),
  ).map(([name, value]) => `${name}: ${String(value)}`)

// Each of these endpoints turns a feature on with PUT and off with DELETE.
const toggles: ReadonlyArray<readonly [keyof Security, string, string, string]> = [
  ['immutableReleases', 'immutable-releases', 'Release immutability', '/immutable-releases'],
  ['privateVulnerabilityReporting', 'private-vulnerability-reporting', 'Private vulnerability reporting', '/private-vulnerability-reporting'],
  ['dependabotAlerts', 'dependabot-alerts', 'Dependency graph and Dependabot alerts', '/vulnerability-alerts'],
  ['dependabotSecurityUpdates', 'dependabot-security-updates', 'Dependabot security updates', '/automated-security-fixes'],
]

const onOff = (enabled: boolean) => (enabled ? 'on' : 'off')

const securitySteps = (security: SettingsConfig['security'], repository: Repository): ReadonlyArray<SettingsStep> => {
  if (security === undefined) return []
  const steps: Array<SettingsStep> = []
  for (const [key, id, description, path] of toggles) {
    const enabled = security[key]
    if (typeof enabled !== 'boolean') continue
    steps.push({ kind: 'rest', id, description: `${description} ${onOff(enabled)}`, optional: false, request: { method: enabled ? 'PUT' : 'DELETE', path } })
  }
  const codeScanning = security.codeScanning
  if (codeScanning !== undefined) {
    // Optional because a repository with no language CodeQL supports rejects
    // default setup. Copilot Autofix follows default setup automatically.
    steps.push({
      kind: 'rest',
      id: 'code-scanning',
      description: codeScanning === 'off' ? 'CodeQL default setup off' : `CodeQL default setup, ${codeScanning} queries`,
      optional: true,
      request: {
        method: 'PATCH',
        path: '/code-scanning/default-setup',
        body: codeScanning === 'off' ? { state: 'not-configured' } : { state: 'configured', query_suite: codeScanning },
      },
    })
  }
  // Secret scanning is free on public repositories; on private ones it needs
  // a paid Advanced Security licence, so it is left to the organisation.
  const secretScanning = security.secretScanning
  if (secretScanning !== undefined && !repository.private) {
    const status = secretScanning ? 'enabled' : 'disabled'
    steps.push({
      kind: 'rest',
      id: 'secret-scanning',
      description: `Secret scanning, push protection, Copilot secret detection and non-provider patterns ${onOff(secretScanning)}`,
      optional: true,
      request: {
        method: 'PATCH',
        path: '',
        body: {
          security_and_analysis: {
            secret_scanning: { status },
            secret_scanning_push_protection: { status },
            secret_scanning_ai_detection: { status },
            secret_scanning_non_provider_patterns: { status },
          },
        },
      },
    })
  }
  return steps
}

/**
 * Plans the calls that bring a repository to the configured settings.
 *
 * @remarks
 * Only configured fields are planned; a section or field left out produces
 * no call, so whatever GitHub has for it stays. Steps come in a fixed order:
 * merging, features, security, the ruleset, then environments. Optional steps
 * may legitimately fail and are reported as warnings: code scanning (no
 * supported language), secret scanning, and the ruleset on a private
 * repository (rulesets need a paid plan there). Secret scanning is only
 * planned for public repositories.
 *
 * @example
 * ```ts
 * const steps = planSettings({ merging: { squash: true } }, undefined, repository)
 * // [{ kind: 'rest', id: 'merging', request: { method: 'PATCH', path: '', body: { allow_squash_merge: true } }, ... }]
 * ```
 *
 * @param settings - The `settings` section.
 * @param roles - The `roles` section, for the review gate's maintainer count.
 * @param repository - The repository, for its node id and visibility.
 * @returns The ordered steps.
 */
export const planSettings = (
  settings: SettingsConfig,
  roles: RolesConfig | undefined,
  repository: Repository,
): ReadonlyArray<SettingsStep> => {
  const steps: Array<SettingsStep> = []
  const merging = mergingBody(settings)
  if (Object.keys(merging).length > 0) {
    steps.push({
      kind: 'rest',
      id: 'merging',
      description: 'Merging, branches, sign-off and wiki',
      optional: false,
      request: { method: 'PATCH', path: '', body: merging },
    })
  }
  const input = featuresInput(settings.features)
  if (input.length > 0) {
    steps.push({
      kind: 'graphql',
      id: 'features',
      description: `Repository features: ${input.join(', ')}`,
      optional: false,
      query: `mutation($id: ID!) { updateRepository(input: { repositoryId: $id, ${input.join(', ')} }) { repository { id } } }`,
      variables: { id: repository.nodeId },
    })
  }
  steps.push(...securitySteps(settings.security, repository))
  if (settings.ruleset !== undefined) {
    const ruleset = rulesetBody(settings.ruleset, roles)
    steps.push({ kind: 'ruleset', id: 'ruleset', description: `Ruleset "${ruleset.name}"`, optional: repository.private, ruleset })
  }
  for (const name of environmentsFor(settings.environments)) {
    steps.push({
      kind: 'rest',
      id: `environment:${name}`,
      description: `Environment "${name}"${isProtectedEnvironment(name) ? ' (protected branches only)' : ''}`,
      optional: false,
      request: { method: 'PUT', path: `/environments/${encodeURIComponent(name)}`, body: environmentBody(name) },
    })
  }
  return steps
}
