/**
 * @file packages/feature.settings/src/apply.ts
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

import { Report } from '@resnovas/engine'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Data, Effect, Either, Option, Schema } from 'effect'
import type { DeploymentPolicy, PagesStep, RulesetBody, SettingsStep, TeamStep, WebhookConfig } from './plan.js'

/**
 * The feature name findings and changes are recorded under.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE"
 * import { FEATURE } from '@resnovas/feature.settings'
 *
 * FEATURE // => 'settings'
 * ```
 */
export const FEATURE = 'settings'

/**
 * GitHub answered with something other than the documented shape.
 *
 * @example
 * ```ts import.meta.vitest name="UnexpectedResponse"
 * import { UnexpectedResponse } from '@resnovas/feature.settings'
 *
 * const error = new UnexpectedResponse({ operation: 'GET /rulesets', detail: 'expected a list' })
 * error.message // => 'GET /rulesets: unexpected response (expected a list)'
 * ```
 */
export class UnexpectedResponse extends Data.TaggedError('UnexpectedResponse')<{
  readonly operation: string
  readonly detail: string
}> {
  override get message() {
    return `${this.operation}: unexpected response (${this.detail})`
  }
}

// Only the fields the upsert needs; GitHub sends many more.
const RulesetList = Schema.Array(Schema.Struct({ id: Schema.Number, name: Schema.String }))

/**
 * Creates or updates a repository ruleset, matched by name.
 *
 * @remarks
 * Matching by name means re-running updates the ruleset in place instead of
 * stacking duplicates. Rulesets inherited from the organisation are left out
 * of the listing: they cannot be updated through the repository endpoint.
 *
 * @example
 * ```ts
 * import { rulesetBody, upsertRuleset } from '@resnovas/feature.settings'
 *
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = upsertRuleset(rulesetBody({ blockForcePush: true }, undefined))
 * ```
 *
 * @param ruleset - The ruleset body.
 * @returns Nothing; fails when GitHub rejects a call or lists rulesets in an unexpected shape.
 */
export const upsertRuleset = (ruleset: RulesetBody): Effect.Effect<void, GitHubError | UnexpectedResponse, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const operation = 'GET /rulesets'
    const response = yield* github.repositoryRequest({
      method: 'GET',
      path: '/rulesets?per_page=100&includes_parents=false',
    })
    const listed = Schema.decodeUnknownEither(RulesetList)(response)
    if (Either.isLeft(listed))
      return yield* new UnexpectedResponse({ operation, detail: 'expected a list of rulesets' })
    const existing = listed.right.find((entry) => entry.name === ruleset.name)
    yield* github.repositoryRequest(
      existing === undefined
        ? { method: 'POST', path: '/rulesets', body: ruleset }
        : { method: 'PUT', path: `/rulesets/${existing.id}`, body: ruleset },
    )
  })

// Only the fields the check needs. GitHub sends `type` on every policy now;
// one without it predates tag policies, so it is a branch policy.
const PolicyList = Schema.Struct({
  branch_policies: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      type: Schema.optionalWith(Schema.Literal('branch', 'tag'), { default: () => 'branch' as const }),
    }),
  ),
})

/**
 * Creates the deployment branch and tag policies an environment is missing.
 *
 * @remarks
 * Existing policies are listed first and matched by name and type, so
 * re-running creates nothing new. Policies the environment has that are not
 * asked for are left alone. The environment must already use custom branch
 * policies, which `environmentBody` sets for a protected environment.
 *
 * @example
 * ```ts
 * import { ensureDeploymentPolicies } from '@resnovas/feature.settings'
 *
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = ensureDeploymentPolicies('Production', [{ name: 'main', type: 'branch' }])
 * ```
 *
 * @param environment - The environment name.
 * @param policies - The policies it must have.
 * @returns Nothing; fails when GitHub rejects a call or lists policies in an unexpected shape.
 */
export const ensureDeploymentPolicies = (
  environment: string,
  policies: ReadonlyArray<DeploymentPolicy>,
): Effect.Effect<void, GitHubError | UnexpectedResponse, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const path = `/environments/${encodeURIComponent(environment)}/deployment-branch-policies`
    const response = yield* github.repositoryRequest({ method: 'GET', path: `${path}?per_page=100` })
    const listed = Schema.decodeUnknownEither(PolicyList)(response)
    if (Either.isLeft(listed)) {
      return yield* new UnexpectedResponse({
        operation: `GET ${path}`,
        detail: 'expected a list of deployment branch policies',
      })
    }
    const existing = listed.right.branch_policies
    for (const policy of policies) {
      if (existing.some((entry) => entry.name === policy.name && entry.type === policy.type)) continue
      yield* github.repositoryRequest({ method: 'POST', path, body: policy })
    }
  })

/**
 * The repository lacks Actions variables the config requires.
 *
 * @example
 * ```ts import.meta.vitest name="MissingVariables"
 * import { MissingVariables } from '@resnovas/feature.settings'
 *
 * const error = new MissingVariables({ variables: { DEPLOY_URL: 'where the site deploys' } })
 * error.message // => 'missing DEPLOY_URL (where the site deploys); set it in Settings > Secrets and variables > Actions > Variables'
 * ```
 */
export class MissingVariables extends Data.TaggedError('MissingVariables')<{
  readonly variables: Readonly<Record<string, string>>
}> {
  override get message() {
    const missing = Object.entries(this.variables).map(([name, purpose]) =>
      purpose === '' ? name : `${name} (${purpose})`,
    )
    return `missing ${missing.join(', ')}; set ${missing.length === 1 ? 'it' : 'them'} in Settings > Secrets and variables > Actions > Variables`
  }
}

const TeamLookup = Schema.Struct({
  organization: Schema.NullOr(Schema.Struct({ team: Schema.NullOr(Schema.Struct({ id: Schema.String })) })),
})

/**
 * Gives an organisation team its role on the repository.
 *
 * @remarks
 * The team is looked up by slug, then granted the role through GraphQL's
 * `updateTeamsRepository`, which adds the team when it has no access yet.
 * The repository API has no team endpoint, and this keeps every call bound
 * to the repository's own organisation.
 *
 * @example
 * ```ts
 * import { grantTeam } from '@resnovas/feature.settings'
 *
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = grantTeam({
 *   kind: 'team',
 *   id: 'team:docs',
 *   description: 'Team @Resnovas/docs as write',
 *   optional: false,
 *   organization: 'Resnovas',
 *   slug: 'docs',
 *   repositoryId: 'R_1',
 *   permission: 'WRITE',
 * })
 * ```
 *
 * @param step - The team step.
 * @returns Nothing; fails when GitHub rejects a call or the organisation has no such team.
 */
export const grantTeam = (step: TeamStep): Effect.Effect<void, GitHubError | UnexpectedResponse, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const response = yield* github.graphql(
      'query($org: String!, $slug: String!) { organization(login: $org) { team(slug: $slug) { id } } }',
      {
        org: step.organization,
        slug: step.slug,
      },
    )
    const operation = `team ${step.organization}/${step.slug}`
    const decoded = Schema.decodeUnknownEither(TeamLookup)(response)
    if (Either.isLeft(decoded))
      return yield* new UnexpectedResponse({ operation, detail: 'expected an organisation lookup' })
    const team = decoded.right.organization?.team
    if (team === null || team === undefined)
      return yield* new UnexpectedResponse({ operation, detail: `no team ${step.slug} in ${step.organization}` })
    yield* github.graphql(
      'mutation($repository: ID!, $team: ID!, $permission: RepositoryPermission!) { updateTeamsRepository(input: { repositoryId: $repository, teamIds: [$team], permission: $permission }) { clientMutationId } }',
      { repository: step.repositoryId, team: team.id, permission: step.permission },
    )
  })

// Only the fields the match needs; GitHub sends many more.
const HookList = Schema.Array(
  Schema.Struct({ id: Schema.Number, config: Schema.Struct({ url: Schema.optional(Schema.String) }) }),
)

const hookConfig = (webhook: WebhookConfig): Record<string, unknown> => ({
  ...(webhook.contentType === undefined ? {} : { content_type: webhook.contentType }),
  ...(webhook.insecureSsl === undefined ? {} : { insecure_ssl: webhook.insecureSsl ? '1' : '0' }),
})

/**
 * Creates or updates a webhook, matched by URL.
 *
 * @remarks
 * A new webhook listens to `push` unless `events` says otherwise, and is
 * active unless `active` is false. An existing one gets only the configured
 * fields; its configuration is patched on its own endpoint, so a secret set
 * by hand is never touched. smartcloud never sets a webhook secret.
 *
 * @example
 * ```ts
 * import { upsertWebhook } from '@resnovas/feature.settings'
 *
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = upsertWebhook({ url: 'https://example.com/hook', events: ['release'], contentType: 'json' })
 * ```
 *
 * @param webhook - The webhook from the config.
 * @returns Nothing; fails when GitHub rejects a call or lists webhooks in an unexpected shape.
 */
export const upsertWebhook = (webhook: WebhookConfig): Effect.Effect<void, GitHubError | UnexpectedResponse, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const response = yield* github.repositoryRequest({ method: 'GET', path: '/hooks?per_page=100' })
    const listed = Schema.decodeUnknownEither(HookList)(response)
    if (Either.isLeft(listed))
      return yield* new UnexpectedResponse({ operation: 'GET /hooks', detail: 'expected a list of webhooks' })
    const existing = listed.right.find((hook) => hook.config.url === webhook.url)
    const config = hookConfig(webhook)
    if (existing === undefined) {
      yield* github.repositoryRequest({
        method: 'POST',
        path: '/hooks',
        body: {
          name: 'web',
          active: webhook.active ?? true,
          events: webhook.events ?? ['push'],
          config: { url: webhook.url, ...config },
        },
      })
      return
    }
    const hook = {
      ...(webhook.active === undefined ? {} : { active: webhook.active }),
      ...(webhook.events === undefined ? {} : { events: webhook.events }),
    }
    if (Object.keys(hook).length > 0)
      yield* github.repositoryRequest({ method: 'PATCH', path: `/hooks/${existing.id}`, body: hook })
    if (Object.keys(config).length > 0)
      yield* github.repositoryRequest({ method: 'PATCH', path: `/hooks/${existing.id}/config`, body: config })
  })

/**
 * Publishes, updates or unpublishes the GitHub Pages site.
 *
 * @remarks
 * The site is read first: a missing one is created, then updated when the
 * config sets fields only an update takes (the custom domain and HTTPS); an
 * existing one is updated with whatever the config sets. HTTPS is enforced
 * in a call of its own after the rest, because GitHub refuses it until the
 * custom domain has a certificate: the domain is then stored, and a later
 * run enforces HTTPS once the certificate is issued. Unpublishing a site
 * that does not exist does nothing.
 *
 * @example
 * ```ts
 * import { ensurePages, pagesStep } from '@resnovas/feature.settings'
 *
 * const repository = { owner: 'o', name: 'r', fullName: 'o/r', nodeId: 'R_1', private: false, defaultBranch: 'main' }
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = ensurePages(pagesStep({ buildType: 'workflow' }, repository))
 * ```
 *
 * @param step - The Pages step.
 * @returns Nothing; fails when GitHub rejects a call.
 */
export const ensurePages = (step: PagesStep): Effect.Effect<void, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    if (!step.enabled) {
      yield* github
        .repositoryRequest({ method: 'DELETE', path: '/pages' })
        .pipe(Effect.catchTag('NotFound', () => Effect.void))
      return
    }
    const site = yield* github.repositoryRequest({ method: 'GET', path: '/pages' }).pipe(
      Effect.map(Option.some),
      Effect.catchTag('NotFound', () => Effect.succeedNone),
    )
    const update = Option.isNone(site)
      ? Object.fromEntries(Object.entries(step.update).filter(([key]) => !(key in step.create)))
      : step.update
    if (Option.isNone(site)) yield* github.repositoryRequest({ method: 'POST', path: '/pages', body: step.create })
    const { https_enforced: https, ...rest } = update
    if (Object.keys(rest).length > 0) yield* github.repositoryRequest({ method: 'PUT', path: '/pages', body: rest })
    if (https !== undefined)
      yield* github.repositoryRequest({ method: 'PUT', path: '/pages', body: { https_enforced: https } })
  })

const VariableList = Schema.Struct({
  total_count: Schema.Number,
  variables: Schema.Array(Schema.Struct({ name: Schema.String })),
})

/**
 * Checks the repository has the named Actions variables, without reading
 * their values.
 *
 * @remarks
 * GitHub stores variable names in upper case, so names compare ignoring
 * case. Nothing is written: a variable can only be set by hand.
 *
 * @example
 * ```ts
 * import { checkVariables } from '@resnovas/feature.settings'
 *
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = checkVariables({ DEPLOY_URL: 'where the site deploys' })
 * ```
 *
 * @param variables - Each required name with what it is for.
 * @returns Nothing; fails with the missing variables, or when GitHub rejects a call or lists variables in an unexpected shape.
 */
export const checkVariables = (
  variables: Readonly<Record<string, string>>,
): Effect.Effect<void, GitHubError | UnexpectedResponse | MissingVariables, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const present = new Set<string>()
    // 30 is the most GitHub returns per page for variables.
    for (let page = 1; ; page += 1) {
      const response = yield* github.repositoryRequest({
        method: 'GET',
        path: `/actions/variables?per_page=30&page=${page}`,
      })
      const listed = Schema.decodeUnknownEither(VariableList)(response)
      if (Either.isLeft(listed))
        return yield* new UnexpectedResponse({
          operation: 'GET /actions/variables',
          detail: 'expected a list of variables',
        })
      for (const variable of listed.right.variables) present.add(variable.name.toUpperCase())
      if (listed.right.variables.length === 0 || present.size >= listed.right.total_count) break
    }
    const missing = Object.entries(variables).filter(([name]) => !present.has(name.toUpperCase()))
    if (missing.length > 0) return yield* new MissingVariables({ variables: Object.fromEntries(missing) })
  })

const perform = (
  step: SettingsStep,
): Effect.Effect<void, GitHubError | UnexpectedResponse | MissingVariables, GitHub> => {
  switch (step.kind) {
    case 'ruleset':
      return upsertRuleset(step.ruleset)
    case 'graphql':
      return Effect.flatMap(GitHub, (github) => github.graphql(step.query, step.variables))
    case 'rest':
      return Effect.flatMap(GitHub, (github) => github.repositoryRequest(step.request))
    case 'deploymentPolicies':
      return ensureDeploymentPolicies(step.environment, step.policies)
    case 'team':
      return grantTeam(step)
    case 'webhook':
      return upsertWebhook(step.webhook)
    case 'pages':
      return ensurePages(step)
    case 'variables':
      return checkVariables(step.variables)
  }
}

/** How many settings steps were applied, and how many failed. */
export interface AppliedSettings {
  readonly applied: number
  readonly failed: number
}

/**
 * Performs planned steps in order, recording each outcome.
 *
 * @remarks
 * Every applied step is a change, except the variables check, which writes
 * nothing and so counts as neither applied nor failed when it passes. A
 * failed step is a finding and does not
 * stop the others: a warning when the step is optional, an error otherwise.
 * Under the dry-run layer writes are only recorded, so the changes read as
 * what would change.
 *
 * @example
 * ```ts
 * import { applySettings, planSettings } from '@resnovas/feature.settings'
 * import { GitHub } from '@resnovas/integrations.github'
 * import { Effect } from 'effect'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = Effect.flatMap(GitHub, (github) => github.getRepository).pipe(
 *   Effect.flatMap((repository) => applySettings(planSettings({ merging: { squash: true } }, undefined, repository))),
 * )
 * ```
 *
 * @param steps - The steps from `planSettings`.
 * @returns How many steps were applied and how many failed; each outcome also goes to the {@link Report}.
 */
export const applySettings = (
  steps: ReadonlyArray<SettingsStep>,
): Effect.Effect<AppliedSettings, never, GitHub | Report> =>
  Effect.gen(function* () {
    const report = yield* Report
    yield* Effect.logInfo(`settings: ${steps.length} step(s) to apply`).pipe(
      Effect.annotateLogs({
        feature: FEATURE,
        steps: steps.length,
        optional: steps.filter((step) => step.optional).length,
      }),
    )
    let applied = 0
    let failed = 0
    for (const step of steps) {
      // A check writes nothing, so passing it is not a change.
      const writes = step.kind !== 'variables'
      const outcome = yield* perform(step).pipe(
        Effect.tapBoth({
          onSuccess: () =>
            Effect.logDebug(`settings: ${step.id} applied`).pipe(
              Effect.annotateLogs({ feature: FEATURE, rule: `settings.${step.id}`, outcome: 'applied' }),
            ),
          onFailure: (error) =>
            Effect.logDebug(`settings: ${step.id} failed`).pipe(
              Effect.annotateLogs({ feature: FEATURE, rule: `settings.${step.id}`, outcome: error._tag }),
            ),
        }),
        Effect.matchEffect({
          onSuccess: () =>
            writes
              ? Effect.as(report.change({ feature: FEATURE, description: step.description }), 'applied' as const)
              : Effect.succeed('checked' as const),
          onFailure: (error) =>
            Effect.as(
              report.add({
                feature: FEATURE,
                rule: `settings.${step.id}`,
                level: step.optional ? 'warning' : 'error',
                message: `${step.description}: ${error.message}`,
              }),
              'failed' as const,
            ),
        }),
      )
      if (outcome === 'applied') applied += 1
      if (outcome === 'failed') failed += 1
    }
    const counts: AppliedSettings = { applied, failed }
    return counts
  })
