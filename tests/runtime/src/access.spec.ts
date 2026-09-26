/**
 * @file tests/runtime/src/access.spec.ts
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
  Forbidden,
  makeMemoryGitHub,
  NotFound,
  Unavailable,
  type GitHubError,
  type GitHubService,
} from '@resnovas/integrations.github'
import {
  accessFindings,
  accessFor,
  connectWithFallback,
  externalRun,
  FULL_ACCESS,
  restrictedFeatures,
  skippablePreset,
} from '@resnovas/runtime'
import { Effect, Option, Redacted } from 'effect'

const pullRequestFrom = (repo: { readonly full_name: string } | null) => ({
  name: 'pull_request',
  payload: { pull_request: { head: { repo } } },
})
const workflow = Redacted.make('ghs_workflow')
const pat = Redacted.make('github_pat_secret')
const fork = { restricted: true, reason: 'a pull request from a fork' } as const

describe('externalRun', () => {
  it('names a fork, a deleted fork and Dependabot, and nothing else', () => {
    expect(externalRun(pullRequestFrom({ full_name: 'someone/example' }), 'Resnovas/example', 'someone')).toBe(
      'a pull request from a fork',
    )
    expect(externalRun(pullRequestFrom(null), 'Resnovas/example', 'someone')).toBe('a pull request from a fork')
    expect(
      externalRun(pullRequestFrom({ full_name: 'resnovas/Example' }), 'Resnovas/example', 'TGTGamer'),
    ).toBeUndefined()
    expect(externalRun(pullRequestFrom({ full_name: 'Resnovas/example' }), 'Resnovas/example', 'dependabot[bot]')).toBe(
      'a run started by Dependabot',
    )
    expect(externalRun({ name: 'issues', payload: { issue: {} } }, 'Resnovas/example', undefined)).toBeUndefined()
  })
})

describe('accessFor', () => {
  it('drops an external run to the workflow token, and keeps the given token when there is none', () => {
    const dropped = accessFor({
      token: pat,
      workflowToken: Option.some(workflow),
      external: 'a run started by Dependabot',
    })
    expect(Redacted.value(dropped.token)).toBe('ghs_workflow')
    expect(dropped.access).toStrictEqual({ restricted: true, reason: 'a run started by Dependabot' })
    const kept = accessFor({ token: pat, workflowToken: Option.none(), external: 'a pull request from a fork' })
    expect(Redacted.value(kept.token)).toBe('github_pat_secret')
    expect(kept.access.restricted).toBe(true)
  })

  it('restricts a run acting with the workflow token, and gives any other token full access', () => {
    expect(
      accessFor({ token: workflow, workflowToken: Option.some(Redacted.make('ghs_workflow')), external: undefined })
        .access,
    ).toStrictEqual({
      restricted: true,
      reason: 'the workflow token, without the ACCESS_TOKEN secret',
    })
    expect(accessFor({ token: pat, workflowToken: Option.some(workflow), external: undefined }).access).toBe(
      FULL_ACCESS,
    )
    expect(accessFor({ token: pat, workflowToken: Option.none(), external: undefined }).access).toBe(FULL_ACCESS)
  })
})

describe('what a restricted run leaves out', () => {
  it('skips the features only a stronger token can run', () => {
    expect([...restrictedFeatures(fork).keys()]).toStrictEqual(['settings', 'sync'])
    expect(restrictedFeatures(fork).get('sync')).toBe(
      'restricted access (a pull request from a fork): cross-repository sync needs a token that can read the source and push workflow files',
    )
  })

  it('skips only presets from other repositories', () => {
    const here = { owner: 'Resnovas', repo: 'example' }
    expect(skippablePreset(fork, here)({ owner: 'Other', repo: 'example', path: 'a.yml' })).toBe(true)
    expect(skippablePreset(fork, here)({ owner: 'Resnovas', repo: 'other', path: 'a.yml' })).toBe(true)
    expect(skippablePreset(fork, here)({ owner: 'Resnovas', repo: 'example', path: 'a.yml' })).toBe(false)
  })

  it('reports the restriction as a notice and each left-out part as a warning', () => {
    expect(accessFindings(fork, ['the sync section: incomplete without the skipped preset(s)'])).toStrictEqual([
      {
        feature: 'access',
        rule: 'access.restricted',
        level: 'notice',
        message:
          'ran with restricted access (a pull request from a fork): features and writes that need a stronger token were skipped',
      },
      {
        feature: 'access',
        rule: 'access.config-skipped',
        level: 'warning',
        message:
          'left out the sync section: incomplete without the skipped preset(s); its rules were not checked in this run',
      },
    ])
  })
})

describe('connectWithFallback', () => {
  // Connects each token to a service whose repository read answers as given.
  const connector = (answers: Readonly<Record<string, GitHubError | undefined>>) => {
    const used: Array<string> = []
    const connect = (token: Redacted.Redacted<string>) =>
      Effect.sync((): GitHubService => {
        const value = Redacted.value(token)
        used.push(value)
        const service = makeMemoryGitHub().service
        const answer = answers[value]
        return answer === undefined ? service : { ...service, getRepository: Effect.fail(answer) }
      })
    return { connect, used }
  }
  const run = (answer: GitHubError | undefined, access = FULL_ACCESS, workflowToken = Option.some(workflow)) => {
    const { connect, used } = connector({ github_pat_secret: answer })
    return Effect.map(connectWithFallback({ token: pat, workflowToken, access, connect }), (connected) => ({
      connected,
      used,
    }))
  }

  it.effect('falls back to the workflow token when GitHub rejects the token as forbidden or not found', () =>
    Effect.gen(function* () {
      for (const error of [
        new Forbidden({ operation: 'getRepository', detail: 'Bad credentials' }),
        new NotFound({ operation: 'getRepository', detail: 'Not Found' }),
      ]) {
        const { connected, used } = yield* run(error)
        expect(used).toStrictEqual(['github_pat_secret', 'ghs_workflow'])
        expect(connected.access).toStrictEqual({
          restricted: true,
          reason: 'GitHub rejected the given token, so the run fell back to the workflow token',
        })
        expect(connected.rejected).toBe(error.message)
      }
    }),
  )

  it.effect('keeps the token when it works or GitHub is merely unavailable', () =>
    Effect.gen(function* () {
      const working = yield* run(undefined)
      expect(working.used).toStrictEqual(['github_pat_secret'])
      expect(working.connected.access).toBe(FULL_ACCESS)
      expect(working.connected.rejected).toBeUndefined()
      const outage = yield* run(new Unavailable({ operation: 'getRepository', detail: 'Bad Gateway' }))
      expect(outage.used).toStrictEqual(['github_pat_secret'])
      expect(outage.connected.access).toBe(FULL_ACCESS)
    }),
  )

  it.effect('does not probe a restricted run or one without a workflow token', () =>
    Effect.gen(function* () {
      const rejected = new Forbidden({ operation: 'getRepository', detail: 'Bad credentials' })
      const restricted = yield* run(rejected, fork)
      expect(restricted.used).toStrictEqual(['github_pat_secret'])
      expect(restricted.connected.access).toBe(fork)
      const alone = yield* run(rejected, FULL_ACCESS, Option.none())
      expect(alone.used).toStrictEqual(['github_pat_secret'])
      expect(alone.connected.access).toBe(FULL_ACCESS)
    }),
  )
})
