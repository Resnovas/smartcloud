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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { makeReport, Report } from '@resnovas/engine'
import { applySettings, planSettings, rulesetBody, type SettingsStep, upsertRuleset } from '@resnovas/feature.settings'
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
// answer the rulesets listing and fail chosen calls on top of it.
const github = (
  options: { readonly rulesets?: unknown; readonly fail?: (request: RepositoryRequest) => boolean; readonly failGraphql?: boolean } = {},
) => {
  const memory = makeMemoryGitHub({ repository: publicRepository })
  const service: GitHubService = {
    ...memory.service,
    repositoryRequest: (request) => {
      if (options.fail?.(request) === true) {
        return Effect.zipRight(
          memory.service.repositoryRequest(request),
          Effect.fail(new Forbidden({ operation: `${request.method} ${request.path}`, detail: 'Resource not accessible by integration' })),
        )
      }
      if (request.method === 'GET' && request.path.startsWith('/rulesets')) {
        return Effect.as(memory.service.repositoryRequest(request), options.rulesets === undefined ? [] : options.rulesets)
      }
      return memory.service.repositoryRequest(request)
    },
    graphql: (query, variables) =>
      options.failGraphql === true
        ? Effect.fail(new ValidationFailed({ operation: 'graphql', detail: 'bad input' }))
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
        { method: 'PATCH', path: '/code-scanning/default-setup', body: { state: 'configured', query_suite: 'extended' } },
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
                parameters: { code_scanning_tools: [{ tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' }] },
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
        { method: 'PUT', path: '/environments/Production', body: { deployment_branch_policy: { protected_branches: true, custom_branch_policies: false } } },
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
        'Environment "Production" (protected branches only)',
        'Environment "Staging"',
        'Environment "Development"',
      ])
      expect(snapshot.changes.every((change) => change.feature === 'settings')).toBe(true)
    }),
  )

  it.effect('failed optional steps are warnings, failed required steps are errors, and the run keeps going', () =>
    Effect.gen(function* () {
      const { service, state } = github({
        fail: (request) => request.path === '/code-scanning/default-setup' || request.path === '/vulnerability-alerts' || request.path === '/rulesets',
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
      expect(snapshot.changes).toHaveLength(6)
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
