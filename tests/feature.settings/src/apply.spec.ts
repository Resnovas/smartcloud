/**
 * @file tests/feature.settings/src/apply.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { makeReport, Report } from '@resnovas/engine'
import {
  applySettings,
  checkVariables,
  deploymentPoliciesFor,
  ensureDeploymentPolicies,
  ensurePages,
  grantTeam,
  pagesStep,
  planSettings,
  rulesetBody,
  type SettingsStep,
  type TeamStep,
  upsertRuleset,
  upsertWebhook,
} from '@resnovas/feature.settings'
import {
  Forbidden,
  GitHub,
  type GitHubService,
  makeMemoryGitHub,
  NotFound,
  type RepositoryRequest,
  ValidationFailed,
} from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { houseSettings, privateRepository, publicRepository, soleMaintainer, twoMaintainers } from './fixtures.js'

// The in-memory GitHub records every request and answers null. These tests
// answer the rulesets and deployment policy listings and fail chosen calls
// on top of it.
const github = (
  options: {
    readonly rulesets?: unknown
    readonly policies?: unknown
    readonly hooks?: unknown
    /** The Pages site, or undefined for none. */
    readonly pages?: unknown
    /** Each page of the variables listing, in order. */
    readonly variables?: ReadonlyArray<unknown>
    /** What a GraphQL query (not a mutation) answers. */
    readonly query?: unknown
    readonly fail?: (request: RepositoryRequest) => boolean
    readonly failGraphql?: boolean
  } = {},
) => {
  const memory = makeMemoryGitHub({ repository: publicRepository })
  const service: GitHubService = {
    ...memory.service,
    repositoryRequest: (request) => {
      if (options.fail?.(request) === true) {
        return Effect.zipRight(
          memory.service.repositoryRequest(request),
          Effect.fail(
            new Forbidden({
              operation: `${request.method} ${request.path}`,
              detail: 'Resource not accessible by integration',
            }),
          ),
        )
      }
      if (request.method === 'GET' && request.path.startsWith('/rulesets')) {
        return Effect.as(
          memory.service.repositoryRequest(request),
          options.rulesets === undefined ? [] : options.rulesets,
        )
      }
      if (request.method === 'GET' && request.path.startsWith('/hooks')) {
        return Effect.as(memory.service.repositoryRequest(request), options.hooks === undefined ? [] : options.hooks)
      }
      if (
        request.path === '/pages' &&
        (request.method === 'GET' || request.method === 'DELETE') &&
        options.pages === undefined
      ) {
        return Effect.zipRight(
          memory.service.repositoryRequest(request),
          Effect.fail(new NotFound({ operation: `${request.method} /pages`, detail: 'Not Found' })),
        )
      }
      if (request.method === 'GET' && request.path === '/pages')
        return Effect.as(memory.service.repositoryRequest(request), options.pages)
      if (request.method === 'GET' && request.path.startsWith('/actions/variables')) {
        const page = Number(new URL(request.path, 'https://api.github.com').searchParams.get('page'))
        return Effect.as(
          memory.service.repositoryRequest(request),
          options.variables?.[page - 1] ?? { total_count: 0, variables: [] },
        )
      }
      if (request.method === 'GET' && request.path.includes('/deployment-branch-policies')) {
        const none = { total_count: 0, branch_policies: [] }
        return Effect.as(
          memory.service.repositoryRequest(request),
          options.policies === undefined ? none : options.policies,
        )
      }
      return memory.service.repositoryRequest(request)
    },
    graphql: (query, variables) =>
      options.failGraphql === true
        ? Effect.fail(new ValidationFailed({ operation: 'graphql', detail: 'bad input' }))
        : query.startsWith('query')
          ? Effect.as(memory.service.graphql(query, variables), options.query)
          : memory.service.graphql(query, variables),
  }
  return { service, state: memory.state }
}

const run = (service: GitHubService, steps: ReadonlyArray<SettingsStep>) =>
  Effect.gen(function* () {
    const report = yield* makeReport
    yield* applySettings(steps).pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, service))
    return yield* report.snapshot
  })

describe('applySettings', () => {
  it.effect('applies the full house baseline, in order, with the exact requests', () =>
    Effect.gen(function* () {
      const { service, state } = github()
      const snapshot = yield* run(service, planSettings(houseSettings, twoMaintainers, publicRepository))
      expect(snapshot.findings).toStrictEqual([])
      expect(state.graphql).toStrictEqual([
        {
          query:
            'mutation($id: ID!) { updateRepository(input: { repositoryId: $id, hasDiscussionsEnabled: true, hasSponsorshipsEnabled: true, hasWikiEnabled: false }) { repository { id } } }',
          variables: { id: 'R_1' },
        },
      ])
      expect(state.requests).toStrictEqual([
        {
          method: 'PATCH',
          path: '',
          body: {
            allow_merge_commit: false,
            allow_squash_merge: true,
            allow_rebase_merge: true,
            allow_auto_merge: true,
            allow_update_branch: true,
            delete_branch_on_merge: true,
            web_commit_signoff_required: true,
            has_wiki: false,
            squash_merge_commit_title: 'PR_TITLE',
            squash_merge_commit_message: 'COMMIT_MESSAGES',
          },
        },
        { method: 'PUT', path: '/immutable-releases' },
        { method: 'PUT', path: '/private-vulnerability-reporting' },
        { method: 'PUT', path: '/vulnerability-alerts' },
        { method: 'PUT', path: '/automated-security-fixes' },
        {
          method: 'PATCH',
          path: '/code-scanning/default-setup',
          body: { state: 'configured', query_suite: 'extended' },
        },
        {
          method: 'PATCH',
          path: '',
          body: {
            security_and_analysis: {
              secret_scanning: { status: 'enabled' },
              secret_scanning_push_protection: { status: 'enabled' },
              secret_scanning_ai_detection: { status: 'enabled' },
              secret_scanning_non_provider_patterns: { status: 'enabled' },
            },
          },
        },
        { method: 'GET', path: '/rulesets?per_page=100&includes_parents=false' },
        {
          method: 'POST',
          path: '/rulesets',
          body: {
            name: 'house: default branch',
            target: 'branch',
            enforcement: 'active',
            conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
            bypass_actors: [{ actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }],
            rules: [
              { type: 'deletion' },
              { type: 'non_fast_forward' },
              { type: 'required_linear_history' },
              { type: 'copilot_code_review', parameters: { review_draft_pull_requests: true, review_on_push: true } },
              {
                type: 'code_scanning',
                parameters: {
                  code_scanning_tools: [
                    { tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' },
                  ],
                },
              },
              {
                type: 'required_status_checks',
                parameters: {
                  strict_required_status_checks_policy: false,
                  required_status_checks: [{ context: 'house-policy / policy' }, { context: 'house-policy / reviews' }],
                },
              },
            ],
          },
        },
        {
          method: 'PUT',
          path: '/environments/Production',
          body: { deployment_branch_policy: { protected_branches: false, custom_branch_policies: true } },
        },
        { method: 'GET', path: '/environments/Production/deployment-branch-policies?per_page=100' },
        {
          method: 'POST',
          path: '/environments/Production/deployment-branch-policies',
          body: { name: 'main', type: 'branch' },
        },
        {
          method: 'POST',
          path: '/environments/Production/deployment-branch-policies',
          body: { name: 'v*', type: 'tag' },
        },
        { method: 'PUT', path: '/environments/Staging', body: { deployment_branch_policy: null } },
        { method: 'PUT', path: '/environments/Development', body: { deployment_branch_policy: null } },
      ])
      expect(snapshot.changes.map((change) => change.description)).toStrictEqual([
        'Merging, branches, sign-off and wiki',
        'Repository features: hasDiscussionsEnabled: true, hasSponsorshipsEnabled: true, hasWikiEnabled: false',
        'Release immutability on',
        'Private vulnerability reporting on',
        'Dependency graph and Dependabot alerts on',
        'Dependabot security updates on',
        'CodeQL default setup, extended queries',
        'Secret scanning, push protection, Copilot secret detection and non-provider patterns on',
        'Ruleset "house: default branch"',
        'Environment "Production" (default branch and release tags only)',
        'Deployment policies for "Production": branch main, tag v*',
        'Environment "Staging"',
        'Environment "Development"',
      ])
      expect(snapshot.changes.every((change) => change.feature === 'settings')).toBe(true)
    }),
  )

  it.effect('failed optional steps are warnings, failed required steps are errors, and the run keeps going', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        fail: (request) =>
          request.path === '/code-scanning/default-setup' ||
          request.path === '/vulnerability-alerts' ||
          request.path === '/rulesets',
        failGraphql: true,
      })
      const snapshot = yield* run(service, planSettings(houseSettings, soleMaintainer, privateRepository))
      expect(snapshot.findings.map(({ rule, level }) => ({ rule, level }))).toStrictEqual([
        { rule: 'settings.features', level: 'error' },
        { rule: 'settings.dependabot-alerts', level: 'error' },
        { rule: 'settings.code-scanning', level: 'warning' },
        { rule: 'settings.ruleset', level: 'warning' },
      ])
      expect(snapshot.findings[1]?.message).toBe(
        'Dependency graph and Dependabot alerts on: PUT /vulnerability-alerts: forbidden (Resource not accessible by integration)',
      )
      expect(snapshot.findings.every((finding) => finding.feature === 'settings')).toBe(true)
      expect(snapshot.changes).toHaveLength(7)
      expect(state.requests.at(-1)).toMatchObject({ method: 'PUT', path: '/environments/Development' })
    }),
  )
})

describe('ensureDeploymentPolicies', () => {
  const policies = deploymentPoliciesFor(publicRepository)
  const path = '/environments/Windows%20Store/deployment-branch-policies'

  it.effect('creates only the policies the environment is missing, matching name and type', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        policies: {
          total_count: 3,
          branch_policies: [
            { id: 1, name: 'main', type: 'branch' },
            { id: 2, name: 'v*', type: 'branch' },
            { id: 3, name: 'hotfix/*' },
          ],
        },
      })
      yield* ensureDeploymentPolicies('Windows Store', policies).pipe(Effect.provideService(GitHub, service))
      expect(state.requests).toStrictEqual([
        { method: 'GET', path: `${path}?per_page=100` },
        { method: 'POST', path, body: { name: 'v*', type: 'tag' } },
      ])
    }),
  )

  it.effect('writes nothing when every policy is already there, reading a policy without a type as a branch', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        policies: {
          total_count: 2,
          branch_policies: [
            { id: 1, name: 'main' },
            { id: 2, name: 'v*', type: 'tag' },
          ],
        },
      })
      yield* ensureDeploymentPolicies('Windows Store', policies).pipe(Effect.provideService(GitHub, service))
      expect(state.requests).toStrictEqual([{ method: 'GET', path: `${path}?per_page=100` }])
    }),
  )

  it.effect('an unexpected listing fails with a typed error and writes nothing', () =>
    Effect.gen(function* () {
      const { service, state } = github({ policies: [{ name: 'main' }] })
      const error = yield* Effect.flip(
        ensureDeploymentPolicies('Windows Store', policies).pipe(Effect.provideService(GitHub, service)),
      )
      expect(error._tag).toBe('UnexpectedResponse')
      expect(error.message).toBe(`GET ${path}: unexpected response (expected a list of deployment branch policies)`)
      expect(state.requests).toHaveLength(1)
    }),
  )

  it.effect('a failed listing is an error finding for that environment, and the run keeps going', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        fail: (request) => request.path.startsWith('/environments/Production/deployment-branch-policies'),
      })
      const snapshot = yield* run(
        service,
        planSettings({ environments: { projectType: 'saas' } }, undefined, publicRepository),
      )
      expect(snapshot.findings.map(({ rule, level }) => ({ rule, level }))).toStrictEqual([
        { rule: 'settings.deployment-policies:Production', level: 'error' },
      ])
      expect(state.requests.at(-1)).toMatchObject({ method: 'PUT', path: '/environments/Development' })
    }),
  )
})

describe('upsertRuleset', () => {
  const body = rulesetBody({ linearHistory: true }, undefined)

  it.effect('updates a ruleset of the same name in place', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        rulesets: [
          { id: 1, name: 'something else', enforcement: 'active' },
          { id: 42, name: 'house: default branch', enforcement: 'active' },
        ],
      })
      yield* upsertRuleset(body).pipe(Effect.provideService(GitHub, service))
      expect(state.requests.map(({ method, path }) => `${method} ${path}`)).toStrictEqual([
        'GET /rulesets?per_page=100&includes_parents=false',
        'PUT /rulesets/42',
      ])
      expect(state.requests[1]?.body).toStrictEqual(body)
    }),
  )

  it.effect('creates the ruleset when none has its name', () =>
    Effect.gen(function* () {
      const { service, state } = github({ rulesets: [{ id: 1, name: 'something else' }] })
      yield* upsertRuleset(body).pipe(Effect.provideService(GitHub, service))
      expect(state.requests[1]).toStrictEqual({ method: 'POST', path: '/rulesets', body })
    }),
  )

  it.effect('an unexpected listing fails with a typed error and writes nothing', () =>
    Effect.gen(function* () {
      const { service, state } = github({ rulesets: { message: 'nope' } })
      const error = yield* Effect.flip(upsertRuleset(body).pipe(Effect.provideService(GitHub, service)))
      expect(error._tag).toBe('UnexpectedResponse')
      expect(error.message).toBe('GET /rulesets: unexpected response (expected a list of rulesets)')
      expect(state.requests).toHaveLength(1)
    }),
  )

  it.effect('a failed listing surfaces the GitHub error', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const service: GitHubService = {
        ...memory.service,
        repositoryRequest: () => Effect.fail(new NotFound({ operation: 'GET /rulesets', detail: 'no repository' })),
      }
      const error = yield* Effect.flip(upsertRuleset(body).pipe(Effect.provideService(GitHub, service)))
      expect(error._tag).toBe('NotFound')
    }),
  )
})

describe('grantTeam', () => {
  const step: TeamStep = {
    kind: 'team',
    id: 'team:docs',
    description: 'Team @Resnovas/docs as write',
    optional: false,
    organization: 'Resnovas',
    slug: 'docs',
    repositoryId: 'R_1',
    permission: 'WRITE',
  }

  it.effect('looks the team up by slug, then grants it the role on the repository', () =>
    Effect.gen(function* () {
      const { service, state } = github({ query: { organization: { team: { id: 'T_9' } } } })
      yield* grantTeam(step).pipe(Effect.provideService(GitHub, service))
      expect(state.graphql).toHaveLength(2)
      expect(state.graphql[0]?.variables).toStrictEqual({ org: 'Resnovas', slug: 'docs' })
      expect(state.graphql[1]?.query).toContain('updateTeamsRepository')
      expect(state.graphql[1]?.variables).toStrictEqual({ repository: 'R_1', team: 'T_9', permission: 'WRITE' })
    }),
  )

  it.effect('a missing team or organisation fails with a typed error and grants nothing', () =>
    Effect.gen(function* () {
      for (const query of [{ organization: { team: null } }, { organization: null }]) {
        const { service, state } = github({ query })
        const error = yield* Effect.flip(grantTeam(step).pipe(Effect.provideService(GitHub, service)))
        expect(error.message).toBe('team Resnovas/docs: unexpected response (no team docs in Resnovas)')
        expect(state.graphql).toHaveLength(1)
      }
    }),
  )

  it.effect('an unexpected lookup fails with a typed error', () =>
    Effect.gen(function* () {
      const { service } = github({ query: { nope: true } })
      const error = yield* Effect.flip(grantTeam(step).pipe(Effect.provideService(GitHub, service)))
      expect(error.message).toBe('team Resnovas/docs: unexpected response (expected an organisation lookup)')
    }),
  )
})

describe('upsertWebhook', () => {
  const url = 'https://hooks.example.com/x'

  it.effect('creates a missing webhook, listening to push and active by default', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        hooks: [
          { id: 3, config: { url: 'https://other.example.com' } },
          { id: 4, config: {} },
        ],
      })
      yield* upsertWebhook({ url }).pipe(Effect.provideService(GitHub, service))
      expect(state.requests).toStrictEqual([
        { method: 'GET', path: '/hooks?per_page=100' },
        { method: 'POST', path: '/hooks', body: { name: 'web', active: true, events: ['push'], config: { url } } },
      ])
    }),
  )

  it.effect('creates a webhook with its configured events, content type and TLS check', () =>
    Effect.gen(function* () {
      const { service, state } = github()
      yield* upsertWebhook({ url, events: ['release'], active: false, contentType: 'json', insecureSsl: false }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(state.requests[1]?.body).toStrictEqual({
        name: 'web',
        active: false,
        events: ['release'],
        config: { url, content_type: 'json', insecure_ssl: '0' },
      })
    }),
  )

  it.effect('updates a webhook with the same URL, patching its config separately so a secret is kept', () =>
    Effect.gen(function* () {
      const { service, state } = github({ hooks: [{ id: 7, config: { url } }] })
      yield* upsertWebhook({ url, events: ['push', 'release'], active: true, insecureSsl: true }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(state.requests.slice(1)).toStrictEqual([
        { method: 'PATCH', path: '/hooks/7', body: { active: true, events: ['push', 'release'] } },
        { method: 'PATCH', path: '/hooks/7/config', body: { insecure_ssl: '1' } },
      ])
    }),
  )

  it.effect('a webhook that already exists with nothing else configured is left alone', () =>
    Effect.gen(function* () {
      const { service, state } = github({ hooks: [{ id: 7, config: { url } }] })
      yield* upsertWebhook({ url }).pipe(Effect.provideService(GitHub, service))
      expect(state.requests).toHaveLength(1)
    }),
  )

  it.effect('an unexpected listing fails with a typed error and writes nothing', () =>
    Effect.gen(function* () {
      const { service, state } = github({ hooks: { message: 'nope' } })
      const error = yield* Effect.flip(upsertWebhook({ url }).pipe(Effect.provideService(GitHub, service)))
      expect(error.message).toBe('GET /hooks: unexpected response (expected a list of webhooks)')
      expect(state.requests).toHaveLength(1)
    }),
  )
})

describe('ensurePages', () => {
  const paths = (requests: ReadonlyArray<RepositoryRequest>) => requests.map(({ method, path }) => `${method} ${path}`)

  it.effect('creates a missing site, then sets what only an update takes', () =>
    Effect.gen(function* () {
      const { service, state } = github()
      yield* ensurePages(pagesStep({ buildType: 'legacy', cname: 'example.com' }, publicRepository)).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(state.requests).toStrictEqual([
        { method: 'GET', path: '/pages' },
        { method: 'POST', path: '/pages', body: { build_type: 'legacy', source: { branch: 'main', path: '/' } } },
        { method: 'PUT', path: '/pages', body: { cname: 'example.com' } },
      ])
    }),
  )

  it.effect('a created site with nothing else to set gets no update', () =>
    Effect.gen(function* () {
      const { service, state } = github()
      yield* ensurePages(pagesStep({ buildType: 'workflow' }, publicRepository)).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(paths(state.requests)).toStrictEqual(['GET /pages', 'POST /pages'])
    }),
  )

  it.effect('updates an existing site with what the config sets, and leaves it alone when that is nothing', () =>
    Effect.gen(function* () {
      const site = { build_type: 'legacy' }
      const updated = github({ pages: site })
      yield* ensurePages(pagesStep({ buildType: 'workflow', httpsEnforced: true }, publicRepository)).pipe(
        Effect.provideService(GitHub, updated.service),
      )
      expect(updated.state.requests).toStrictEqual([
        { method: 'GET', path: '/pages' },
        { method: 'PUT', path: '/pages', body: { build_type: 'workflow' } },
        { method: 'PUT', path: '/pages', body: { https_enforced: true } },
      ])
      const secured = github({ pages: site })
      yield* ensurePages(pagesStep({ httpsEnforced: false }, publicRepository)).pipe(
        Effect.provideService(GitHub, secured.service),
      )
      expect(paths(secured.state.requests)).toStrictEqual(['GET /pages', 'PUT /pages'])
      const untouched = github({ pages: site })
      yield* ensurePages(pagesStep({}, publicRepository)).pipe(Effect.provideService(GitHub, untouched.service))
      expect(paths(untouched.state.requests)).toStrictEqual(['GET /pages'])
    }),
  )

  it.effect('unpublishes a site, and a site that does not exist is already unpublished', () =>
    Effect.gen(function* () {
      const existing = github({ pages: {} })
      yield* ensurePages(pagesStep({ enabled: false }, publicRepository)).pipe(
        Effect.provideService(GitHub, existing.service),
      )
      expect(paths(existing.state.requests)).toStrictEqual(['DELETE /pages'])
      const missing = github()
      yield* ensurePages(pagesStep({ enabled: false }, publicRepository)).pipe(
        Effect.provideService(GitHub, missing.service),
      )
      expect(paths(missing.state.requests)).toStrictEqual(['DELETE /pages'])
    }),
  )

  it.effect('any other failure reading the site is surfaced', () =>
    Effect.gen(function* () {
      const { service } = github({ fail: (request) => request.path === '/pages' })
      const error = yield* Effect.flip(
        ensurePages(pagesStep({}, publicRepository)).pipe(Effect.provideService(GitHub, service)),
      )
      expect(error._tag).toBe('Forbidden')
    }),
  )
})

describe('checkVariables', () => {
  const page = (total: number, ...names: ReadonlyArray<string>) => ({
    total_count: total,
    variables: names.map((name) => ({ name })),
  })

  it.effect('passes when every variable is present, comparing names ignoring case, across pages', () =>
    Effect.gen(function* () {
      const { service, state } = github({ variables: [page(2, 'DEPLOY_URL'), page(2, 'REGION')] })
      yield* checkVariables({ deploy_url: 'where it deploys', REGION: '' }).pipe(Effect.provideService(GitHub, service))
      expect(state.requests.map(({ path }) => path)).toStrictEqual([
        '/actions/variables?per_page=30&page=1',
        '/actions/variables?per_page=30&page=2',
      ])
    }),
  )

  it.effect('fails with the missing variables, and stops at an empty page', () =>
    Effect.gen(function* () {
      const { service, state } = github({ variables: [page(5, 'REGION')] })
      const error = yield* Effect.flip(
        checkVariables({ DEPLOY_URL: 'where it deploys', REGION: '', TEAM: '' }).pipe(
          Effect.provideService(GitHub, service),
        ),
      )
      expect(error._tag).toBe('MissingVariables')
      expect(error.message).toBe(
        'missing DEPLOY_URL (where it deploys), TEAM; set them in Settings > Secrets and variables > Actions > Variables',
      )
      expect(state.requests).toHaveLength(2)
    }),
  )

  it.effect('an unexpected listing fails with a typed error', () =>
    Effect.gen(function* () {
      const { service } = github({ variables: [{ message: 'nope' }] })
      const error = yield* Effect.flip(checkVariables({ REGION: '' }).pipe(Effect.provideService(GitHub, service)))
      expect(error.message).toBe('GET /actions/variables: unexpected response (expected a list of variables)')
    }),
  )
})

describe('applySettings with the new sections', () => {
  it.effect(
    'writes are changes, a passing variables check is neither applied nor failed, and a missing variable is a warning',
    () =>
      Effect.gen(function* () {
        const settings = {
          collaborators: { octocat: 'read' as const },
          teams: { docs: 'write' as const },
          webhooks: { chat: { url: 'https://hooks.example.com/x' } },
          pages: { buildType: 'workflow' as const },
          variables: { REGION: '' },
        }
        const passing = github({
          query: { organization: { team: { id: 'T_1' } } },
          variables: [{ total_count: 1, variables: [{ name: 'REGION' }] }],
        })
        const report = yield* makeReport
        const counts = yield* applySettings(planSettings(settings, undefined, publicRepository)).pipe(
          Effect.provideService(Report, report),
          Effect.provideService(GitHub, passing.service),
        )
        expect(counts).toStrictEqual({ applied: 4, failed: 0 })
        const snapshot = yield* report.snapshot
        expect(snapshot.findings).toStrictEqual([])
        expect(snapshot.changes.map(({ description }) => description)).toStrictEqual([
          'Collaborator @octocat as read (invited if not yet a collaborator)',
          'Team @Resnovas/docs as write',
          'Webhook "chat" to hooks.example.com',
          'GitHub Pages built by a workflow',
        ])

        const missing = github({ query: { organization: { team: { id: 'T_1' } } } })
        const failed = yield* run(missing.service, planSettings(settings, undefined, publicRepository))
        expect(failed.findings).toStrictEqual([
          {
            feature: 'settings',
            rule: 'settings.variables',
            level: 'warning',
            message:
              'Required Actions variables REGION: missing REGION; set it in Settings > Secrets and variables > Actions > Variables',
          },
        ])
      }),
  )
})
