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
import { ConfigNotFound } from '@resnovas/config'
import {
  fileKey,
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
  connectTokens,
  connectWithFallback,
  externalRun,
  FULL_ACCESS,
  PresetUnreadable,
  restrictedFeatures,
  skippablePreset,
  withHouseReads,
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

  it("names Dependabot's pull request whoever started the run, such as a reviewer", () => {
    const review = (user: { readonly login: string } | null) => ({
      name: 'pull_request_review',
      payload: { pull_request: { head: { repo: { full_name: 'Resnovas/example' } }, user } },
    })
    expect(externalRun(review({ login: 'dependabot[bot]' }), 'Resnovas/example', 'TGTGamer')).toBe(
      'a pull request from Dependabot',
    )
    expect(externalRun(review({ login: 'TGTGamer' }), 'Resnovas/example', 'someone')).toBeUndefined()
    expect(externalRun(review(null), 'Resnovas/example', 'someone')).toBeUndefined()
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
      reason: 'the workflow token, without an app or access token',
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

  it('keeps the read-only sync check on a pull request when the house repository can be read', () => {
    const house = { ...fork, houseReads: true }
    expect([...restrictedFeatures(house, 'pull_request').keys()]).toStrictEqual(['settings'])
    expect([...restrictedFeatures(house, 'pull_request_review').keys()]).toStrictEqual(['settings'])
    expect([...restrictedFeatures(house, 'push').keys()]).toStrictEqual(['settings', 'sync'])
    expect([...restrictedFeatures(house).keys()]).toStrictEqual(['settings', 'sync'])
    expect([...restrictedFeatures(fork, 'pull_request').keys()]).toStrictEqual(['settings', 'sync'])
    expect(restrictedFeatures(FULL_ACCESS, 'pull_request').size).toBe(0)
  })

  it('skips only presets from other repositories', () => {
    const here = { owner: 'Resnovas', repo: 'example' }
    expect(skippablePreset(fork, here)({ owner: 'Other', repo: 'example', path: 'a.yml' })).toBe(true)
    expect(skippablePreset(fork, here)({ owner: 'Resnovas', repo: 'other', path: 'a.yml' })).toBe(true)
    expect(skippablePreset(fork, here)({ owner: 'Resnovas', repo: 'example', path: 'a.yml' })).toBe(false)
  })

  it('never skips a preset whose read failed on a rate limit or an outage', () => {
    const here = { owner: 'Resnovas', repo: 'example' }
    const ref = { owner: 'Resnovas', repo: '.github', path: 'a.yml' }
    expect(skippablePreset(fork, here)(ref, new ConfigNotFound({ source: 'Resnovas/.github/a.yml' }))).toBe(true)
    expect(skippablePreset(fork, here)(ref, new PresetUnreadable(ref, 'forbidden'))).toBe(true)
    expect(skippablePreset(fork, here)(ref, new PresetUnreadable(ref, 'rate limited', true))).toBe(false)
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

describe('withHouseReads', () => {
  const setup = () => {
    const inner = makeMemoryGitHub()
    const house = makeMemoryGitHub()
    const calls: Array<string> = []
    const tracked = (name: string, service: GitHubService): GitHubService => ({
      ...service,
      getFile: (location) =>
        Effect.zipRight(
          Effect.sync(() => calls.push(`${name} getFile ${location.owner}/${location.repo}`)),
          service.getFile(location),
        ),
      listDirectory: (location) =>
        Effect.zipRight(
          Effect.sync(() => calls.push(`${name} listDirectory ${location.owner}/${location.repo}`)),
          service.listDirectory(location),
        ),
    })
    const github = withHouseReads(tracked('inner', inner.service), tracked('house', house.service))
    return { inner, house, calls, github }
  }

  it.effect('reads files in another .github repository with the house token', () =>
    Effect.gen(function* () {
      const { house, calls, github } = setup()
      house.state.files.set(fileKey('Resnovas', '.GitHub', 'house.yml'), 'version: 2\n')
      expect(yield* github.getFile({ owner: 'Resnovas', repo: '.GitHub', path: 'house.yml' })).toBe('version: 2\n')
      yield* github.listDirectory({ owner: 'Resnovas', repo: '.github', path: 'templates' })
      expect(calls).toStrictEqual(['house getFile Resnovas/.GitHub', 'house listDirectory Resnovas/.github'])
    }),
  )

  it.effect('falls back to the wrapped service when the house token cannot see the file', () =>
    Effect.gen(function* () {
      const { inner, calls, github } = setup()
      inner.state.files.set(fileKey('Climb', '.github', 'house.yml'), 'version: 2\n')
      expect(yield* github.getFile({ owner: 'Climb', repo: '.github', path: 'house.yml' })).toBe('version: 2\n')
      expect(calls).toStrictEqual(['house getFile Climb/.github', 'inner getFile Climb/.github'])
    }),
  )

  it.effect('keeps other failures, and sends every other read to the wrapped service', () =>
    Effect.gen(function* () {
      const inner = makeMemoryGitHub()
      const down = new Unavailable({ operation: 'getFile', detail: 'Bad Gateway' })
      const house = { ...makeMemoryGitHub().service, getFile: () => Effect.fail(down) }
      const github = withHouseReads(inner.service, house)
      expect(yield* Effect.flip(github.getFile({ owner: 'Resnovas', repo: '.github', path: 'a.yml' }))).toBe(down)
      inner.state.files.set(fileKey('Resnovas', 'other', 'a.yml'), 'other')
      expect(yield* github.getFile({ owner: 'Resnovas', repo: 'other', path: 'a.yml' })).toBe('other')
      const own = withHouseReads({ ...inner.service, coordinates: { owner: 'Resnovas', repo: '.github' } }, house)
      inner.state.files.set(fileKey('Resnovas', '.github', 'a.yml'), 'own')
      expect(yield* own.getFile({ owner: 'Resnovas', repo: '.github', path: 'a.yml' })).toBe('own')
    }),
  )
})

describe('connectTokens', () => {
  const house = Redacted.make('ghs_house')
  // Connects each token to its own service, recording the order.
  const connector = (rejected: ReadonlyArray<string> = []) => {
    const used: Array<string> = []
    const services = new Map<string, GitHubService>()
    const memories = new Map<string, ReturnType<typeof makeMemoryGitHub>>()
    const connect = (token: Redacted.Redacted<string>) =>
      Effect.sync((): GitHubService => {
        const value = Redacted.value(token)
        used.push(value)
        const memory = makeMemoryGitHub()
        memories.set(value, memory)
        const base = memory.service
        const service = rejected.includes(value)
          ? {
              ...base,
              getRepository: Effect.fail(new Forbidden({ operation: 'getRepository', detail: 'Bad credentials' })),
            }
          : base
        services.set(value, service)
        return service
      })
    return { connect, used, services, memories }
  }

  it.effect('acts with the workflow token in the repository, and the given token only as the privileged service', () =>
    Effect.gen(function* () {
      const { connect, used, services } = connector()
      const connected = yield* connectTokens({
        token: pat,
        workflowToken: Option.some(workflow),
        houseToken: Option.none(),
        access: FULL_ACCESS,
        connect,
      })
      expect(used).toStrictEqual(['github_pat_secret', 'ghs_workflow'])
      expect(connected.service).toBe(services.get('ghs_workflow'))
      expect(connected.privileged).toBe(services.get('github_pat_secret'))
      expect(connected.access).toBe(FULL_ACCESS)
      expect(connected.rejected).toBeUndefined()
    }),
  )

  it.effect('reads the house repository with the house token through both services', () =>
    Effect.gen(function* () {
      const { connect, used, memories } = connector()
      const connected = yield* connectTokens({
        token: pat,
        workflowToken: Option.some(workflow),
        houseToken: Option.some(house),
        access: FULL_ACCESS,
        connect,
      })
      expect(used).toStrictEqual(['github_pat_secret', 'ghs_house', 'ghs_workflow'])
      memories.get('ghs_house')?.state.files.set(fileKey('Resnovas', '.github', 'a.yml'), 'house')
      const preset = { owner: 'Resnovas', repo: '.github', path: 'a.yml' }
      expect(yield* connected.service.getFile(preset)).toBe('house')
      expect(yield* connected.privileged?.getFile(preset) ?? Effect.succeed('')).toBe('house')
      expect(connected.access).toBe(FULL_ACCESS)
    }),
  )

  it.effect('has no privileged service in a restricted run, and marks it able to read the house repository', () =>
    Effect.gen(function* () {
      const { connect, used } = connector()
      const connected = yield* connectTokens({
        token: workflow,
        workflowToken: Option.some(workflow),
        houseToken: Option.some(house),
        access: fork,
        connect,
      })
      expect(used).toStrictEqual(['ghs_workflow', 'ghs_house'])
      expect(connected.privileged).toBeUndefined()
      expect(connected.access).toStrictEqual({ ...fork, houseReads: true })
      const alone = yield* connectTokens({
        token: pat,
        workflowToken: Option.none(),
        houseToken: Option.none(),
        access: FULL_ACCESS,
        connect,
      })
      expect(alone.privileged).toBeUndefined()
      expect(alone.access).toBe(FULL_ACCESS)
    }),
  )

  it.effect('drops a rejected token, keeping the reason', () =>
    Effect.gen(function* () {
      const { connect, used } = connector(['github_pat_secret'])
      const connected = yield* connectTokens({
        token: pat,
        workflowToken: Option.some(workflow),
        houseToken: Option.none(),
        access: FULL_ACCESS,
        connect,
      })
      expect(used).toStrictEqual(['github_pat_secret', 'ghs_workflow'])
      expect(connected.privileged).toBeUndefined()
      expect(connected.access.restricted).toBe(true)
      expect(connected.rejected).toContain('Bad credentials')
    }),
  )
})
