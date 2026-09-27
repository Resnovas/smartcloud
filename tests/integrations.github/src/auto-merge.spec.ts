/**
 * @file tests/integrations.github/src/auto-merge.spec.ts
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
  autoMergeRefusal,
  disableAutoMerge,
  enableAutoMerge,
  Forbidden,
  GitHub,
  makeMemoryGitHub,
  readAutoMerge,
  ValidationFailed,
} from '@resnovas/integrations.github'
import { Effect } from 'effect'

const answering = (answer: unknown) => {
  const memory = makeMemoryGitHub()
  const service: GitHub['Type'] = { ...memory.service, repositoryRequest: () => Effect.succeed(answer) }
  return { memory, service }
}

describe('auto-merge', () => {
  it.effect('turns auto-merge on with the method in capitals, and off', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      yield* enableAutoMerge('PR_7', 'rebase').pipe(Effect.provideService(GitHub, memory.service))
      yield* disableAutoMerge('PR_7').pipe(Effect.provideService(GitHub, memory.service))
      expect(memory.state.graphql.map(({ variables }) => variables)).toStrictEqual([
        { id: 'PR_7', method: 'REBASE' },
        { id: 'PR_7' },
      ])
      expect(memory.state.graphql[0]?.query).toContain('enablePullRequestAutoMerge')
      expect(memory.state.graphql[1]?.query).toContain('disablePullRequestAutoMerge')
    }),
  )

  it.effect('reads whether auto-merge is on, how and who turned it on', () =>
    Effect.gen(function* () {
      const on = answering({
        node_id: 'PR_7',
        state: 'open',
        auto_merge: { enabled_by: { login: 'smartcloud[bot]' }, merge_method: 'squash' },
      })
      expect(yield* readAutoMerge(7).pipe(Effect.provideService(GitHub, on.service))).toStrictEqual({
        nodeId: 'PR_7',
        open: true,
        autoMerge: { method: 'squash', enabledBy: 'smartcloud[bot]' },
      })
      const unknown = answering({
        node_id: 'PR_7',
        state: 'open',
        auto_merge: { enabled_by: null, merge_method: 'merge' },
      })
      expect(yield* readAutoMerge(7).pipe(Effect.provideService(GitHub, unknown.service))).toStrictEqual({
        nodeId: 'PR_7',
        open: true,
        autoMerge: { method: 'merge', enabledBy: '' },
      })
      const off = answering({ node_id: 'PR_7', state: 'closed' })
      expect(yield* readAutoMerge(7).pipe(Effect.provideService(GitHub, off.service))).toStrictEqual({
        nodeId: 'PR_7',
        open: false,
      })
    }),
  )

  it.effect('fails on an answer that is not a pull request', () =>
    Effect.gen(function* () {
      const broken = answering(null)
      const error = yield* Effect.flip(readAutoMerge(7).pipe(Effect.provideService(GitHub, broken.service)))
      expect(error._tag).toBe('ValidationFailed')
      expect(error.operation).toBe('readAutoMerge')
    }),
  )

  it('tells the refusals it can explain from other errors', () => {
    const refused = (detail: string) => autoMergeRefusal(new ValidationFailed({ operation: 'graphql', detail }))
    expect(refused('Pull request Auto-merge is not allowed for this repository')).toBe('notAllowed')
    expect(refused('Pull request Pull request is in unstable status')).toBe('mergeable')
    expect(refused('Pull request is in has_hooks status')).toBe('mergeable')
    expect(refused('Something else')).toBeUndefined()
    expect(autoMergeRefusal(new Forbidden({ operation: 'graphql', detail: 'is in clean status' }))).toBeUndefined()
  })
})
