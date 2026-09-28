/**
 * @file tests/integrations.github/src/restricted.spec.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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
import { Effect, Layer } from 'effect'
import {
  Forbidden,
  GitHub,
  type GitHubService,
  makeMemoryGitHub,
  Restricted,
  SkippedWrites,
  ValidationFailed,
} from '@resnovas/integrations.github'

const forbidden = (operation: string) =>
  Effect.fail(new Forbidden({ operation, detail: 'Resource not accessible by integration' }))

// A read-only token: every write is forbidden, reads work.
const readOnly = (): GitHubService => {
  const { service } = makeMemoryGitHub({ labels: [{ name: 'bug', color: 'd73a4a', description: '' }] })
  return {
    ...service,
    createLabel: () => forbidden('createLabel'),
    updateLabel: () => forbidden('updateLabel'),
    deleteLabel: () => forbidden('deleteLabel'),
    addLabels: () => forbidden('addLabels'),
    removeLabel: () => forbidden('removeLabel'),
    createComment: () => forbidden('createComment'),
    updateComment: () => forbidden('updateComment'),
    closeIssue: () => forbidden('closeIssue'),
    createReview: () => forbidden('createReview'),
    requestReviewers: () => forbidden('requestReviewers'),
    createCheckRun: () => forbidden('createCheckRun'),
    updateCheckRun: () => forbidden('updateCheckRun'),
    proposeChanges: () => forbidden('proposeChanges'),
    lockIssue: () => forbidden('lockIssue'),
    backport: () => forbidden('backport'),
    repositoryRequest: (request) =>
      request.method === 'GET' ? Effect.succeed({ read: true }) : forbidden('repositoryRequest'),
    graphql: (query) => (query.startsWith('mutation') ? forbidden('graphql') : Effect.succeed({ read: true })),
  }
}

const restricted = (service: GitHubService) => Restricted.pipe(Layer.provide(Layer.succeed(GitHub, service)))

describe('restricted token', () => {
  it.effect('skips and records every write the token is refused, and passes reads through', () =>
    Effect.gen(function* () {
      const github = yield* GitHub
      const bug = { name: 'bug', color: 'd73a4a', description: '' }
      expect(yield* github.listLabels).toStrictEqual([bug])
      yield* github.createLabel(bug)
      yield* github.updateLabel('bug', bug)
      yield* github.deleteLabel('bug')
      yield* github.addLabels(1, ['bug'])
      yield* github.removeLabel(1, 'bug')
      expect(yield* github.createComment(1, 'hi')).toStrictEqual({ id: 0, body: 'hi', author: '', bot: true })
      yield* github.updateComment(5, 'x')
      yield* github.closeIssue(1)
      yield* github.createReview(7, { event: 'COMMENT', body: 'b' })
      yield* github.requestReviewers(7, ['ann'])
      const run = {
        name: 'n',
        headSha: 'h',
        status: 'completed' as const,
        conclusion: 'success' as const,
        title: 't',
        summary: 's',
      }
      expect(yield* github.createCheckRun(run)).toBe(0)
      yield* github.updateCheckRun(0, run)
      expect(
        (yield* github.proposeChanges({ branch: 'b', base: 'main', title: 't', body: '', files: [] })).number,
      ).toBe(0)
      yield* github.lockIssue(1, 'resolved')
      const backport = { branch: 'b', base: 'v1', from: 'a', to: 'c', message: 'm', title: 't', body: '' }
      expect((yield* github.backport(backport)).status).toBe('opened')
      expect(yield* github.repositoryRequest({ method: 'GET', path: '' })).toStrictEqual({ read: true })
      expect(yield* github.repositoryRequest({ method: 'PATCH', path: '', body: {} })).toBeNull()
      expect(yield* github.graphql('query { y }', {})).toStrictEqual({ read: true })
      expect(yield* github.graphql('mutation { x }', {})).toBeNull()
      const writes = yield* Effect.flatMap(SkippedWrites, (log) => log.writes)
      expect(writes.map((write) => write.operation)).toStrictEqual([
        'createLabel',
        'updateLabel',
        'deleteLabel',
        'addLabels',
        'removeLabel',
        'createComment',
        'updateComment',
        'closeIssue',
        'createReview',
        'requestReviewers',
        'createCheckRun',
        'updateCheckRun',
        'proposeChanges',
        'lockIssue',
        'backport',
        'repositoryRequest',
        'graphql',
      ])
    }).pipe(Effect.provide(restricted(readOnly()))),
  )

  it.effect('makes the writes the token is allowed, and fails on any other error', () =>
    Effect.gen(function* () {
      const memory = makeMemoryGitHub()
      const rejecting: GitHubService = {
        ...memory.service,
        closeIssue: () => Effect.fail(new ValidationFailed({ operation: 'closeIssue', detail: 'locked' })),
      }
      const program = Effect.gen(function* () {
        const github = yield* GitHub
        yield* github.createLabel({ name: 'docs', color: '0075ca', description: '' })
        const error = yield* Effect.flip(github.closeIssue(1))
        return { error, skipped: yield* Effect.flatMap(SkippedWrites, (log) => log.writes) }
      })
      const { error, skipped } = yield* program.pipe(Effect.provide(restricted(rejecting)))
      expect(error._tag).toBe('ValidationFailed')
      expect(skipped).toStrictEqual([])
      expect(memory.state.labels.map((label) => label.name)).toStrictEqual(['docs'])
    }),
  )
})
