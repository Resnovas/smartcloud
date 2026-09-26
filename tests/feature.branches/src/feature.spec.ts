/**
 * @file tests/feature.branches/src/feature.spec.ts
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
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { BRANCH_RULE, branchesFeature, branchExempt, checkBranch, FEATURE } from '@resnovas/feature.branches'
import { GitHub, GitHubMemory, makeMemoryGitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'

const pullRequest = (ref: string, login = 'ann') => ({
  action: 'opened',
  pull_request: {
    number: 7,
    title: 'feat: a thing',
    body: null,
    user: { login },
    state: 'open',
    locked: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    draft: false,
    head: { ref, sha: 'abc123' },
    additions: 3,
    deletions: 1,
  },
})

const config: SmartcloudConfig = {
  version: 2,
  branches: {
    names: { person: { preset: 'prefixed' }, issue: { preset: 'issueKey', keys: ['SMC'] } },
    exempt: { branches: ['^dependabot/'], authors: ['renovate[bot]'] },
  },
}

const run = (settings: SmartcloudConfig, payload: unknown, event: 'pull_request' | 'issues' = 'pull_request') =>
  runFeatures({ config: settings, event, payload, features: [branchesFeature] }).pipe(Effect.provide(GitHubMemory()))

describe('branchesFeature', () => {
  it('runs on pull requests, only when the policy names a branch form', () => {
    expect(branchesFeature.name).toBe(FEATURE)
    expect(branchesFeature.handles).toStrictEqual(['pullRequest'])
    expect(branchesFeature.enabled?.({ version: 2 })).toBe(false)
    expect(branchesFeature.enabled?.({ version: 2, branches: { names: {} } })).toBe(false)
    expect(branchesFeature.enabled?.(config)).toBe(true)
  })

  it.effect('records nothing for a branch that meets the policy', () =>
    Effect.gen(function* () {
      const result = yield* run(config, pullRequest('claude/smc-75-branch-names'))
      expect(result.ran).toStrictEqual([FEATURE])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('records an error explaining the accepted names, or a warning with the message', () =>
    Effect.gen(function* () {
      const failed = yield* run(config, pullRequest('patch-1'))
      expect(failed.findings).toStrictEqual([
        {
          feature: FEATURE,
          rule: BRANCH_RULE,
          level: 'error',
          message: checkBranch(config.branches ?? {}, 'patch-1', 'ann'),
        },
      ])
      expect(failed.findings[0]?.message).toContain('- issue: an issue key such as `SMC-123`, with the key `SMC`')
      const warned = yield* run(
        { version: 2, branches: { ...config.branches, level: 'warning', message: 'Use <you>/<what>.' } },
        pullRequest('patch-1'),
      )
      expect(warned.findings.map((finding) => [finding.level, finding.message])).toStrictEqual([
        [
          'warning',
          "The branch `patch-1` does not follow this repository's branch naming policy.\n\nUse <you>/<what>.\n\nPush the work to a branch named that way and open the pull request from it.",
        ],
      ])
    }),
  )

  it.effect('skips exempt pull requests', () =>
    Effect.gen(function* () {
      expect((yield* run(config, pullRequest('dependabot/npm/effect', 'dependabot[bot]'))).findings).toStrictEqual([])
      expect((yield* run(config, pullRequest('update-deps', 'renovate[bot]'))).findings).toStrictEqual([])
    }),
  )

  it.effect('does nothing without a subject, a section or a head branch, which the runner never gives it', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      const envelope = { kind: 'repository', event: 'schedule' } as const
      const subject = {
        kind: 'pullRequest' as const,
        number: 1,
        title: 't',
        body: '',
        author: 'ann',
        open: true,
        locked: false,
        labels: [],
        updatedAt: new Date(0),
        headBranch: 'patch-1',
      }
      yield* branchesFeature
        .run({ config, envelope })
        .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, makeMemoryGitHub().service))
      yield* branchesFeature
        .run({ config: { version: 2 }, envelope, subject })
        .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, makeMemoryGitHub().service))
      const { headBranch: _, ...withoutBranch } = subject
      yield* branchesFeature
        .run({ config, envelope, subject: withoutBranch })
        .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, makeMemoryGitHub().service))
      expect((yield* report.snapshot).findings).toStrictEqual([])
    }),
  )
})

describe('branchExempt and checkBranch', () => {
  it('exempts by author or branch pattern, and passes allowed branches', () => {
    const policy = config.branches ?? {}
    expect(branchExempt(policy, 'dependabot/x', 'ann')).toBe(true)
    expect(branchExempt({}, 'dependabot/x', 'ann')).toBe(false)
    expect(checkBranch(policy, 'ann/thing', 'ann')).toBeUndefined()
    expect(checkBranch(policy, 'update-deps', 'renovate[bot]')).toBeUndefined()
    expect(checkBranch(policy, 'update-deps', 'ann')).toContain('`update-deps`')
  })
})
