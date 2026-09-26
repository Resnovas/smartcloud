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
  planSettings,
  rulesetBody,
  type SettingsStep,
} from '@resnovas/feature.settings'
import { houseSettings, privateRepository, publicRepository, soleMaintainer, twoMaintainers } from './fixtures.js'

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
      'copilot_code_review',
      'code_scanning',
    ])
    expect(body.rules[3]?.parameters).toStrictEqual({ review_draft_pull_requests: true, review_on_push: true })
    expect(body.rules[4]?.parameters).toStrictEqual({
      code_scanning_tools: [{ tool: 'CodeQL', security_alerts_threshold: 'high_or_higher', alerts_threshold: 'errors' }],
    })
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
})
