/**
 * @file tests/feature.settings/src/plan.spec.ts
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
import {
  DEFAULT_RULESET_NAME,
  environmentBody,
  environmentsFor,
  isProtectedEnvironment,
  pagesStep,
  planSettings,
  rulesetBody,
  type SettingsStep,
} from '@resnovas/feature.settings'
import { houseSettings, privateRepository, publicRepository, soleMaintainer, strongRuleset, twoMaintainers } from './fixtures.js'

const ids = (steps: ReadonlyArray<SettingsStep>) => steps.map((step) => step.id)
const find = (steps: ReadonlyArray<SettingsStep>, id: string) => steps.find((step) => step.id === id)
const houseRuleset = houseSettings.ruleset ?? {}

describe('environmentsFor', () => {
  it('project types choose their environments, and explicit names override them', () => {
    expect(environmentsFor({ projectType: 'saas' })).toStrictEqual(['Production', 'Staging', 'Development'])
    expect(environmentsFor({ projectType: 'desktop' })).toStrictEqual(['Windows', 'Linux', 'macOS', 'Windows Beta', 'Linux Beta', 'macOS Beta'])
    expect(environmentsFor({ projectType: 'library' })).toStrictEqual(['Release'])
    expect(environmentsFor({ projectType: 'none' })).toStrictEqual([])
    expect(environmentsFor({})).toStrictEqual([])
    expect(environmentsFor(undefined)).toStrictEqual([])
    expect(environmentsFor({ projectType: 'saas', names: ['Live', 'Preview'] })).toStrictEqual(['Live', 'Preview'])
  })

  it('an empty names list falls back to the project type', () => {
    expect(environmentsFor({ projectType: 'library', names: [] })).toStrictEqual(['Release'])
  })
})

describe('environments', () => {
  it('shipping environments deploy only from the default branch and release tags', () => {
    for (const name of ['Production', 'Windows', 'macOS', 'Release']) expect(isProtectedEnvironment(name), name).toBe(true)
    for (const name of ['Staging', 'Development', 'dev', 'Windows Beta', 'Preview']) expect(isProtectedEnvironment(name), name).toBe(false)
    // protected_branches would let every branch deploy on a repository with no
    // classic branch protection, so protected environments use custom policies.
    expect(environmentBody('Production')).toStrictEqual({ deployment_branch_policy: { protected_branches: false, custom_branch_policies: true } })
    expect(environmentBody('Staging')).toStrictEqual({ deployment_branch_policy: null })
  })

  it('environment names are URL encoded', () => {
    const step = find(planSettings({ environments: { projectType: 'desktop' } }, undefined, publicRepository), 'environment:Windows Beta')
    expect(step).toMatchObject({
      kind: 'rest',
      description: 'Environment "Windows Beta"',
      request: { method: 'PUT', path: '/environments/Windows%20Beta', body: { deployment_branch_policy: null } },
    })
    const release = find(planSettings({ environments: { projectType: 'library' } }, undefined, publicRepository), 'environment:Release')
    expect(release?.description).toBe('Environment "Release" (default branch and release tags only)')
  })

  it('a protected environment is followed by its deployment policies: the default branch and release tags', () => {
    const steps = planSettings({ environments: { names: ['Production', 'Staging'] } }, undefined, { ...publicRepository, defaultBranch: 'trunk' })
    expect(ids(steps)).toStrictEqual(['environment:Production', 'deployment-policies:Production', 'environment:Staging'])
    expect(find(steps, 'deployment-policies:Production')).toStrictEqual({
      kind: 'deploymentPolicies',
      id: 'deployment-policies:Production',
      description: 'Deployment policies for "Production": branch trunk, tag v*',
      optional: false,
      environment: 'Production',
      policies: [
        { name: 'trunk', type: 'branch' },
        { name: 'v*', type: 'tag' },
      ],
    })
  })
})

describe('planSettings', () => {
  it('leaves out every setting the repository already has, and plans no step when nothing changes', () => {
    const current = {
      ...publicRepository,
      current: { web_commit_signoff_required: true, has_wiki: false, has_discussions: true, allow_squash_merge: true },
    }
    const merging = find(planSettings(houseSettings, soleMaintainer, current), 'merging')
    const body = merging?.kind === 'rest' ? merging.request.body : undefined
    expect(body).not.toHaveProperty('web_commit_signoff_required')
    expect(body).not.toHaveProperty('has_wiki')
    expect(body).not.toHaveProperty('allow_squash_merge')
    expect(
      planSettings({ merging: { webCommitSignoff: true }, features: { wiki: false, discussions: true } }, undefined, current),
    ).toStrictEqual([])
    const features = find(
      planSettings({ features: { wiki: false, discussions: false, sponsorships: true } }, undefined, current),
      'features',
    )
    expect(features?.description).toBe('Repository features: hasDiscussionsEnabled: false, hasSponsorshipsEnabled: true')
  })

  it('the merge settings enforce squash or rebase, sign-off, and trailer-preserving squashes', () => {
    const merging = find(planSettings(houseSettings, soleMaintainer, publicRepository), 'merging')
    expect(merging).toStrictEqual({
      kind: 'rest',
      id: 'merging',
      description: 'Merging, branches, sign-off and wiki',
      optional: false,
      request: {
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
    })
  })

  it('a public repository gets every step, in order', () => {
    expect(ids(planSettings(houseSettings, soleMaintainer, publicRepository))).toStrictEqual([
      'merging',
      'features',
      'immutable-releases',
      'private-vulnerability-reporting',
      'dependabot-alerts',
      'dependabot-security-updates',
      'code-scanning',
      'secret-scanning',
      'ruleset',
      'environment:Production',
      'deployment-policies:Production',
      'environment:Staging',
      'environment:Development',
    ])
  })

  it('discussions and sponsorships go through GraphQL with the repository node id', () => {
    const features = find(planSettings(houseSettings, soleMaintainer, publicRepository), 'features')
    expect(features?.kind).toBe('graphql')
    if (features?.kind !== 'graphql') return
    expect(features.query).toBe(
      'mutation($id: ID!) { updateRepository(input: { repositoryId: $id, hasDiscussionsEnabled: true, hasSponsorshipsEnabled: true, hasWikiEnabled: false }) { repository { id } } }',
    )
    expect(features.variables).toStrictEqual({ id: 'R_1' })
  })

  it('a private repository skips paid secret scanning and treats the ruleset as optional', () => {
    const steps = planSettings(houseSettings, soleMaintainer, privateRepository)
    expect(ids(steps)).not.toContain('secret-scanning')
    expect(ids(steps)).not.toContain('private-vulnerability-reporting')
    expect(ids(planSettings(houseSettings, soleMaintainer, publicRepository))).toContain('private-vulnerability-reporting')
    expect(find(steps, 'ruleset')?.optional).toBe(true)
    expect(find(planSettings(houseSettings, soleMaintainer, publicRepository), 'ruleset')?.optional).toBe(false)
  })

  it('nothing configured plans nothing', () => {
    expect(planSettings({}, undefined, publicRepository)).toStrictEqual([])
    expect(planSettings({ merging: {}, features: {}, security: {}, environments: {} }, undefined, publicRepository)).toStrictEqual([])
  })

  it('plans only the configured fields, leaving the rest untouched', () => {
    const steps = planSettings({ merging: { squash: true, squashMessage: 'PR_BODY' } }, undefined, publicRepository)
    expect(steps).toStrictEqual([
      {
        kind: 'rest',
        id: 'merging',
        description: 'Merging, branches, sign-off and wiki',
        optional: false,
        request: { method: 'PATCH', path: '', body: { allow_squash_merge: true, squash_merge_commit_message: 'PR_BODY' } },
      },
    ])
  })

  it('the wiki alone is set through both REST and GraphQL, and nothing else is', () => {
    const steps = planSettings({ features: { wiki: true } }, undefined, publicRepository)
    expect(steps.map((step) => (step.kind === 'rest' ? step.request.body : step.kind === 'graphql' ? step.query : undefined))).toStrictEqual([
      { has_wiki: true },
      'mutation($id: ID!) { updateRepository(input: { repositoryId: $id, hasWikiEnabled: true }) { repository { id } } }',
    ])
  })

  it('security features switched on use PUT and switched off use DELETE', () => {
    const on = planSettings(
      { security: { immutableReleases: true, privateVulnerabilityReporting: true, dependabotAlerts: true, dependabotSecurityUpdates: true } },
      undefined,
      publicRepository,
    )
    expect(on.map((step) => (step.kind === 'rest' ? `${step.request.method} ${step.request.path}` : step.id))).toStrictEqual([
      'PUT /immutable-releases',
      'PUT /private-vulnerability-reporting',
      'PUT /vulnerability-alerts',
      'PUT /automated-security-fixes',
    ])
    const off = planSettings({ security: { immutableReleases: false, dependabotAlerts: false } }, undefined, publicRepository)
    expect(off).toStrictEqual([
      { kind: 'rest', id: 'immutable-releases', description: 'Release immutability off', optional: false, request: { method: 'DELETE', path: '/immutable-releases' } },
      {
        kind: 'rest',
        id: 'dependabot-alerts',
        description: 'Dependency graph and Dependabot alerts off',
        optional: false,
        request: { method: 'DELETE', path: '/vulnerability-alerts' },
      },
    ])
  })

  it('CodeQL default setup takes the query suite, and off sets it not configured', () => {
    const request = (codeScanning: 'default' | 'extended' | 'off') => {
      const step = find(planSettings({ security: { codeScanning } }, undefined, publicRepository), 'code-scanning')
      return step?.kind === 'rest' ? { optional: step.optional, request: step.request, description: step.description } : undefined
    }
    expect(request('extended')).toStrictEqual({
      optional: true,
      description: 'CodeQL default setup, extended queries',
      request: { method: 'PATCH', path: '/code-scanning/default-setup', body: { state: 'configured', query_suite: 'extended' } },
    })
    expect(request('default')?.request.body).toStrictEqual({ state: 'configured', query_suite: 'default' })
    expect(request('off')).toStrictEqual({
      optional: true,
      description: 'CodeQL default setup off',
      request: { method: 'PATCH', path: '/code-scanning/default-setup', body: { state: 'not-configured' } },
    })
  })

  it('secret scanning switches every part together on a public repository', () => {
    const body = (secretScanning: boolean) => {
      const step = find(planSettings({ security: { secretScanning } }, undefined, publicRepository), 'secret-scanning')
      return step?.kind === 'rest' ? step.request : undefined
    }
    expect(body(true)).toStrictEqual({
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
    })
    expect(JSON.stringify(body(false))).not.toContain('enabled')
    expect(planSettings({ security: { secretScanning: true } }, undefined, privateRepository)).toStrictEqual([])
  })

  it('the ruleset is planned only when configured', () => {
    expect(ids(planSettings({ environments: { projectType: 'library' } }, twoMaintainers, publicRepository))).toStrictEqual(['environment:Release', 'deployment-policies:Release'])
    const step = find(planSettings({ ruleset: { name: 'main' } }, undefined, publicRepository), 'ruleset')
    expect(step).toMatchObject({ kind: 'ruleset', description: 'Ruleset "main"', optional: false })
  })
})

describe('rulesetBody', () => {
  it('the ruleset targets the default branch with linear history and AI review', () => {
    const body = rulesetBody(houseRuleset, soleMaintainer)
    expect(body.name).toBe(DEFAULT_RULESET_NAME)
    expect(body.target).toBe('branch')
    expect(body.enforcement).toBe('active')
    expect(body.conditions).toStrictEqual({ ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } })
    expect(body.rules.map((rule) => rule.type)).toStrictEqual([
      'deletion',
      'non_fast_forward',
      'required_linear_history',
      'code_scanning',
      'copilot_code_review',
    ])
    expect(body.rules[3]?.parameters).toStrictEqual({
      code_scanning_tools: [{ tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' }],
    })
    expect(body.rules[4]?.parameters).toStrictEqual({ review_draft_pull_requests: true, review_on_push: true })
  })

  it('a sole maintainer can bypass and has no required checks', () => {
    const body = rulesetBody(houseRuleset, soleMaintainer)
    expect(body.bypass_actors).toStrictEqual([{ actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }])
    expect(body.rules.some((rule) => rule.type === 'required_status_checks')).toBe(false)
    expect(rulesetBody(houseRuleset, undefined).rules.some((rule) => rule.type === 'required_status_checks')).toBe(false)
  })

  it('two maintainers require the configured checks, and the owner can still bypass', () => {
    const body = rulesetBody(houseRuleset, twoMaintainers)
    expect(body.bypass_actors).toStrictEqual([{ actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }])
    expect(body.rules.find((rule) => rule.type === 'required_status_checks')?.parameters).toStrictEqual({
      strict_required_status_checks_policy: false,
      do_not_enforce_on_create: false,
      required_status_checks: [{ context: 'house-policy / policy' }, { context: 'house-policy / reviews' }],
    })
  })

  it('one maintainer listed twice, in another case or with an @, is still a sole maintainer', () => {
    const aliases = { maintainers: ['TGTGamer', 'tgtgamer', '@TGTGAMER'] }
    expect(rulesetBody(houseRuleset, aliases).rules.some((rule) => rule.type === 'required_status_checks')).toBe(false)
  })

  it('two maintainers with no checks configured require none', () => {
    expect(rulesetBody({ linearHistory: true }, twoMaintainers).rules).toStrictEqual([{ type: 'required_linear_history' }])
  })

  it('the code scanning gate can be switched off for repositories CodeQL cannot analyse', () => {
    expect(rulesetBody({ ...houseRuleset, codeScanningGate: false }, soleMaintainer).rules.some((rule) => rule.type === 'code_scanning')).toBe(false)
    expect(rulesetBody({ ...houseRuleset, codeScanningGate: true }, soleMaintainer).rules.some((rule) => rule.type === 'code_scanning')).toBe(true)
  })

  it('only switched-on rules are included, the name is configurable, and admin bypass can be turned off', () => {
    const body = rulesetBody({ name: 'protect main', blockDeletion: false, adminBypass: false }, soleMaintainer)
    expect(body).toStrictEqual({
      name: 'protect main',
      target: 'branch',
      enforcement: 'active',
      conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
      bypass_actors: [],
      rules: [],
    })
    expect(rulesetBody({ adminBypass: true }, undefined).bypass_actors).toHaveLength(1)
  })

  it('the full house ruleset writes every rule in GitHub\'s order', () => {
    const body = rulesetBody(strongRuleset, twoMaintainers)
    expect(body.rules).toStrictEqual([
      { type: 'deletion' },
      { type: 'non_fast_forward' },
      { type: 'required_linear_history' },
      {
        type: 'merge_queue',
        parameters: {
          merge_method: 'SQUASH',
          grouping_strategy: 'ALLGREEN',
          check_response_timeout_minutes: 60,
          max_entries_to_build: 5,
          min_entries_to_merge: 1,
          max_entries_to_merge: 5,
          min_entries_to_merge_wait_minutes: 5,
        },
      },
      { type: 'required_deployments', parameters: { required_deployment_environments: ['Staging'] } },
      { type: 'required_signatures' },
      {
        type: 'pull_request',
        parameters: {
          required_approving_review_count: 1,
          dismiss_stale_reviews_on_push: true,
          require_code_owner_review: false,
          require_last_push_approval: false,
          required_review_thread_resolution: true,
          require_extra_approval_for_unattributed_changes: true,
          allowed_merge_methods: ['squash', 'rebase'],
        },
      },
      {
        type: 'required_status_checks',
        parameters: {
          strict_required_status_checks_policy: true,
          do_not_enforce_on_create: true,
          required_status_checks: [{ context: 'smartcloud' }, { context: 'check' }],
        },
      },
      {
        type: 'code_scanning',
        parameters: {
          code_scanning_tools: [
            { tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' },
            { tool: 'ESLint', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' },
          ],
        },
      },
      { type: 'code_quality', parameters: { severity: 'errors' } },
      { type: 'code_coverage', parameters: { minimum_coverage: 80, max_coverage_drop: 5 } },
      { type: 'require_secret_scanning_alert_resolution', parameters: { secret_types: ['provider_patterns'] } },
      { type: 'copilot_code_review', parameters: { review_draft_pull_requests: true, review_on_push: true } },
    ])
  })

  it('a sole maintainer needs no approvals, but keyed status checks still bind', () => {
    const body = rulesetBody(strongRuleset, soleMaintainer)
    expect(body.rules.find((rule) => rule.type === 'pull_request')?.parameters?.['required_approving_review_count']).toBe(0)
    expect(body.rules.find((rule) => rule.type === 'required_status_checks')?.parameters?.['required_status_checks']).toStrictEqual([
      { context: 'smartcloud' },
      { context: 'check' },
    ])
  })

  it('omitted merge queue and pull request fields take GitHub\'s defaults', () => {
    const body = rulesetBody({ mergeQueue: { method: 'rebase', grouping: 'headGreen', maxEntriesToBuild: 1 }, pullRequest: {} }, twoMaintainers)
    expect(body.rules[0]?.parameters).toMatchObject({ merge_method: 'REBASE', grouping_strategy: 'HEADGREEN', max_entries_to_build: 1, max_entries_to_merge: 5 })
    expect(body.rules[1]?.parameters).toStrictEqual({
      required_approving_review_count: 0,
      dismiss_stale_reviews_on_push: false,
      require_code_owner_review: false,
      require_last_push_approval: false,
      required_review_thread_resolution: false,
      require_extra_approval_for_unattributed_changes: false,
      allowed_merge_methods: ['merge', 'squash', 'rebase'],
    })
    const queue = { checkTimeoutMinutes: 30, minEntriesToMerge: 2, maxEntriesToMerge: 3, minEntriesToMergeWaitMinutes: 0 }
    expect(rulesetBody({ mergeQueue: queue }, undefined).rules[0]?.parameters).toMatchObject({
      merge_method: 'SQUASH',
      check_response_timeout_minutes: 30,
      min_entries_to_merge: 2,
      max_entries_to_merge: 3,
      min_entries_to_merge_wait_minutes: 0,
    })
  })

  it('checks switched off, empty deployments and disabled coverage add no rules', () => {
    const body = rulesetBody(
      { statusChecks: { checks: { smartcloud: false }, strict: true }, requiredDeployments: [], codeCoverage: { minimum: 80 }, signedCommits: false },
      twoMaintainers,
    )
    expect(body.rules).toStrictEqual([])
  })

  it('code coverage writes only the limits it is given, and the CodeQL gate cannot be weakened', () => {
    expect(rulesetBody({ codeCoverage: { enabled: true, maxDrop: 2 } }, undefined).rules).toStrictEqual([
      { type: 'code_coverage', parameters: { max_coverage_drop: 2 } },
    ])
    expect(rulesetBody({ codeCoverage: { enabled: true, minimum: 90 } }, undefined).rules[0]?.parameters).toStrictEqual({ minimum_coverage: 90 })
    const codeScanning = { CodeQL: { securityAlerts: 'critical', alerts: 'none' } } as const
    expect(rulesetBody({ codeScanningGate: true, codeScanning }, undefined).rules[0]?.parameters).toStrictEqual({
      code_scanning_tools: [{ tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' }],
    })
    expect(rulesetBody({ codeScanning }, undefined).rules[0]?.parameters).toStrictEqual({
      code_scanning_tools: [{ tool: 'CodeQL', security_alerts_threshold: 'critical', alerts_threshold: 'none' }],
    })
  })

  it('a context in both lists is required once', () => {
    const body = rulesetBody({ statusChecks: { checks: { smartcloud: true } }, requiredChecks: ['smartcloud', 'check'] }, twoMaintainers)
    expect(body.rules[0]?.parameters?.['required_status_checks']).toStrictEqual([{ context: 'smartcloud' }, { context: 'check' }])
  })
})

describe('Actions permissions', () => {
  it('plans the permissions, the selected actions, the workflow token and the access level, in that order', () => {
    const steps = planSettings(
      {
        actions: {
          enabled: true,
          allowedActions: 'selected',
          shaPinningRequired: true,
          selectedActions: { githubOwned: true, verifiedCreators: false, patterns: ['Resnovas/*'] },
          workflowPermissions: 'read',
          createPullRequests: true,
          accessLevel: 'organization',
        },
      },
      undefined,
      privateRepository,
    )
    expect(steps).toStrictEqual([
      {
        kind: 'rest',
        id: 'actions',
        description: 'GitHub Actions on, selected actions allowed, SHA pinning required',
        optional: false,
        request: { method: 'PUT', path: '/actions/permissions', body: { enabled: true, allowed_actions: 'selected', sha_pinning_required: true } },
      },
      {
        kind: 'rest',
        id: 'actions-selected',
        description: 'Allowed actions and reusable workflows',
        optional: false,
        request: {
          method: 'PUT',
          path: '/actions/permissions/selected-actions',
          body: { github_owned_allowed: true, verified_allowed: false, patterns_allowed: ['Resnovas/*'] },
        },
      },
      {
        kind: 'rest',
        id: 'actions-workflow',
        description: 'Workflow token: read by default, may create and approve pull requests',
        optional: false,
        request: { method: 'PUT', path: '/actions/permissions/workflow', body: { default_workflow_permissions: 'read', can_approve_pull_request_reviews: true } },
      },
      {
        kind: 'rest',
        id: 'actions-access',
        description: 'Actions and reusable workflows usable from: organization repositories',
        optional: false,
        request: { method: 'PUT', path: '/actions/permissions/access', body: { access_level: 'organization' } },
      },
    ])
  })

  it('GitHub requires enabled, so configuring allowed actions alone keeps Actions on', () => {
    const step = find(planSettings({ actions: { allowedActions: 'local_only' } }, undefined, publicRepository), 'actions')
    expect(step).toMatchObject({ description: 'GitHub Actions on, local_only actions allowed', request: { body: { enabled: true, allowed_actions: 'local_only' } } })
  })

  it('turning Actions off, and SHA pinning optional, say so', () => {
    const step = find(planSettings({ actions: { enabled: false, shaPinningRequired: false } }, undefined, publicRepository), 'actions')
    expect(step).toMatchObject({ description: 'GitHub Actions off, SHA pinning optional', request: { body: { enabled: false, sha_pinning_required: false } } })
  })

  it('selected actions are only planned when only selected actions may run', () => {
    const steps = planSettings({ actions: { allowedActions: 'all', selectedActions: { githubOwned: true } } }, undefined, publicRepository)
    expect(ids(steps)).toStrictEqual(['actions'])
  })

  it('each workflow token field is planned on its own', () => {
    expect(find(planSettings({ actions: { workflowPermissions: 'write' } }, undefined, publicRepository), 'actions-workflow')).toMatchObject({
      description: 'Workflow token: write by default',
      request: { body: { default_workflow_permissions: 'write' } },
    })
    expect(find(planSettings({ actions: { createPullRequests: false } }, undefined, publicRepository), 'actions-workflow')).toMatchObject({
      description: 'Workflow token: may not create and approve pull requests',
      request: { body: { can_approve_pull_request_reviews: false } },
    })
  })

  it('the access level is only planned for a private repository, and none keeps workflows to the repository', () => {
    expect(planSettings({ actions: { accessLevel: 'organization' } }, undefined, publicRepository)).toStrictEqual([])
    expect(find(planSettings({ actions: { accessLevel: 'none' } }, undefined, privateRepository), 'actions-access')?.description).toBe(
      'Actions and reusable workflows usable from: this repository only',
    )
  })

  it('an empty actions section plans nothing', () => {
    expect(planSettings({ actions: {} }, undefined, publicRepository)).toStrictEqual([])
  })
})

describe('collaborators and teams', () => {
  it('collaborators get their REST role, and none removes one', () => {
    const steps = planSettings({ collaborators: { octocat: 'read', hubot: 'write', monalisa: 'admin', former: 'none' } }, undefined, publicRepository)
    expect(steps).toStrictEqual([
      {
        kind: 'rest',
        id: 'collaborator:octocat',
        description: 'Collaborator @octocat as read (invited if not yet a collaborator)',
        optional: false,
        request: { method: 'PUT', path: '/collaborators/octocat', body: { permission: 'pull' } },
      },
      {
        kind: 'rest',
        id: 'collaborator:hubot',
        description: 'Collaborator @hubot as write (invited if not yet a collaborator)',
        optional: false,
        request: { method: 'PUT', path: '/collaborators/hubot', body: { permission: 'push' } },
      },
      {
        kind: 'rest',
        id: 'collaborator:monalisa',
        description: 'Collaborator @monalisa as admin (invited if not yet a collaborator)',
        optional: false,
        request: { method: 'PUT', path: '/collaborators/monalisa', body: { permission: 'admin' } },
      },
      { kind: 'rest', id: 'collaborator:former', description: 'Collaborator @former removed', optional: false, request: { method: 'DELETE', path: '/collaborators/former' } },
    ])
  })

  it('teams belong to the repository owner and get their GraphQL role', () => {
    const steps = planSettings({ teams: { docs: 'triage', core: 'maintain' } }, undefined, publicRepository)
    expect(steps).toStrictEqual([
      { kind: 'team', id: 'team:docs', description: 'Team @Resnovas/docs as triage', optional: false, organization: 'Resnovas', slug: 'docs', repositoryId: 'R_1', permission: 'TRIAGE' },
      { kind: 'team', id: 'team:core', description: 'Team @Resnovas/core as maintain', optional: false, organization: 'Resnovas', slug: 'core', repositoryId: 'R_1', permission: 'MAINTAIN' },
    ])
    expect(planSettings({ teams: { a: 'read', b: 'write', c: 'admin' } }, undefined, publicRepository).map((step) => (step.kind === 'team' ? step.permission : ''))).toStrictEqual([
      'READ',
      'WRITE',
      'ADMIN',
    ])
  })
})

describe('webhooks', () => {
  it('names only the host, so a token in the URL never reaches a report', () => {
    const webhook = { url: 'https://hooks.example.com/services/T0K3N?key=secret', events: ['release'] }
    const steps = planSettings({ webhooks: { chat: webhook, off: { url: 'https://other.example.com/x', active: false } } }, undefined, publicRepository)
    expect(steps).toStrictEqual([
      { kind: 'webhook', id: 'webhook:chat', description: 'Webhook "chat" to hooks.example.com', optional: false, webhook },
      { kind: 'webhook', id: 'webhook:off', description: 'Webhook "off" to other.example.com (inactive)', optional: false, webhook: { url: 'https://other.example.com/x', active: false } },
    ])
  })

  it('a URL that does not parse is described without it', () => {
    expect(planSettings({ webhooks: { bad: { url: 'http://[' } } }, undefined, publicRepository)[0]?.description).toBe('Webhook "bad" to an invalid URL')
  })
})

describe('pagesStep', () => {
  it('a legacy site builds from the default branch root unless told otherwise', () => {
    expect(pagesStep({ buildType: 'legacy' }, publicRepository)).toStrictEqual({
      kind: 'pages',
      id: 'pages',
      description: 'GitHub Pages from main /',
      optional: false,
      enabled: true,
      create: { build_type: 'legacy', source: { branch: 'main', path: '/' } },
      update: { build_type: 'legacy', source: { branch: 'main', path: '/' } },
    })
  })

  it('a branch or path implies a source, and a new site builds from it', () => {
    const step = pagesStep({ path: '/docs', cname: 'docs.example.com', httpsEnforced: true }, publicRepository)
    expect(step.description).toBe('GitHub Pages from main /docs at docs.example.com')
    expect(step.create).toStrictEqual({ build_type: 'legacy', source: { branch: 'main', path: '/docs' } })
    expect(step.update).toStrictEqual({ source: { branch: 'main', path: '/docs' }, cname: 'docs.example.com', https_enforced: true })
    expect(pagesStep({ branch: 'gh-pages' }, publicRepository).create).toStrictEqual({ build_type: 'legacy', source: { branch: 'gh-pages', path: '/' } })
  })

  it('a site with no source builds from a workflow, and an update sends only what is configured', () => {
    const workflow = pagesStep({ buildType: 'workflow' }, publicRepository)
    expect(workflow.description).toBe('GitHub Pages built by a workflow')
    expect(workflow.create).toStrictEqual({ build_type: 'workflow' })
    const ignored = pagesStep({ buildType: 'workflow', branch: 'gh-pages', path: '/docs' }, publicRepository)
    expect(ignored.create).toStrictEqual({ build_type: 'workflow' })
    expect(ignored.update).toStrictEqual({ build_type: 'workflow' })
    const domain = pagesStep({ cname: 'example.com' }, publicRepository)
    expect(domain.description).toBe('GitHub Pages published at example.com')
    expect(domain.create).toStrictEqual({ build_type: 'workflow' })
    expect(domain.update).toStrictEqual({ cname: 'example.com' })
  })

  it('enabled false unpublishes the site', () => {
    expect(pagesStep({ enabled: false, buildType: 'legacy' }, publicRepository)).toStrictEqual({
      kind: 'pages',
      id: 'pages',
      description: 'GitHub Pages unpublished',
      optional: false,
      enabled: false,
      create: {},
      update: {},
    })
  })
})

describe('the new sections in the plan', () => {
  it('come after environments, in a fixed order, with the variables check last and optional', () => {
    const steps = planSettings(
      {
        variables: { DEPLOY_URL: 'where the site deploys' },
        pages: { buildType: 'workflow' },
        webhooks: { chat: { url: 'https://hooks.example.com/x' } },
        teams: { docs: 'write' },
        collaborators: { octocat: 'read' },
        actions: { workflowPermissions: 'read' },
        environments: { projectType: 'library' },
      },
      undefined,
      publicRepository,
    )
    expect(ids(steps)).toStrictEqual([
      'environment:Release',
      'deployment-policies:Release',
      'actions-workflow',
      'collaborator:octocat',
      'team:docs',
      'webhook:chat',
      'pages',
      'variables',
    ])
    expect(find(steps, 'variables')).toStrictEqual({
      kind: 'variables',
      id: 'variables',
      description: 'Required Actions variables DEPLOY_URL',
      optional: true,
      variables: { DEPLOY_URL: 'where the site deploys' },
    })
  })

  it('empty collaborators, teams, webhooks and variables plan nothing', () => {
    expect(planSettings({ collaborators: {}, teams: {}, webhooks: {}, variables: {} }, undefined, publicRepository)).toStrictEqual([])
  })
})
