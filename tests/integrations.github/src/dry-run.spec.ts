/**
 * @file tests/integrations.github/src/dry-run.spec.ts
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
import { DryRun, DryRunLog, GitHub, GitHubMemory } from '@resnovas/integrations.github'

const bug = { name: 'bug', color: 'd73a4a', description: '' }

describe('dry run', () => {
  it.effect('passes reads through and records writes in order, touching nothing', () =>
    Effect.gen(function* () {
      const github = yield* GitHub
      const log = yield* DryRunLog
      expect(yield* github.listLabels).toStrictEqual([bug])
      yield* github.createLabel({ ...bug, name: 'docs' })
      yield* github.updateLabel('bug', bug)
      yield* github.deleteLabel('bug')
      yield* github.addLabels(1, ['bug'])
      yield* github.removeLabel(1, 'bug')
      expect(yield* github.createComment(1, 'hi')).toStrictEqual({ id: 0, body: 'hi', author: '', bot: true })
      yield* github.updateComment(5, 'x')
      yield* github.closeIssue(1)
      yield* github.lockIssue(1, 'resolved')
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
        yield* github.proposeChanges({ branch: 'b', base: 'main', title: 't', body: '', files: [] }),
      ).toStrictEqual({
        number: 0,
        url: '',
        created: false,
      })
      const backport = { branch: 'b', base: 'main', from: 'p', to: 't', message: 'm', title: 't', body: '' }
      expect(yield* github.backport(backport)).toStrictEqual({ status: 'opened', number: 0, url: '' })
      expect(yield* github.listDirectory({ owner: 'Resnovas', repo: 'example', path: '' })).toStrictEqual([])
      expect(yield* github.repositoryRequest({ method: 'PATCH', path: '', body: { has_wiki: false } })).toBeNull()
      yield* github.repositoryRequest({ method: 'GET', path: '/rulesets' })
      yield* github.graphql('mutation { x }', {})
      yield* github.graphql('query { y }', {})
      const hook = (url: string) => ({
        method: 'POST' as const,
        path: '/hooks',
        body: { events: ['push'], config: { url } },
      })
      yield* github.repositoryRequest(hook('https://hooks.example.com/services/T0/B0/secret?token=x'))
      yield* github.repositoryRequest(hook('https://:token@hooks.example.com/'))
      yield* github.repositoryRequest(hook('https://hooks.example.com/#token'))
      yield* github.repositoryRequest(hook('https://hooks.example.com/'))
      yield* github.repositoryRequest(hook('not a url'))
      const writes = yield* log.writes
      expect(writes.slice(-5).map((write) => write.details)).toStrictEqual(
        [
          'https://hooks.example.com/...',
          'https://hooks.example.com/...',
          'https://hooks.example.com/...',
          'https://hooks.example.com/',
          '[redacted]',
        ].map((url) => ({
          request: { method: 'POST', path: '/hooks', body: { events: ['push'], config: { url } } },
        })),
      )
      expect(writes.slice(0, -5).map((write) => write.operation)).toStrictEqual([
        'createLabel',
        'updateLabel',
        'deleteLabel',
        'addLabels',
        'removeLabel',
        'createComment',
        'updateComment',
        'closeIssue',
        'lockIssue',
        'createReview',
        'requestReviewers',
        'createCheckRun',
        'updateCheckRun',
        'proposeChanges',
        'backport',
        'repositoryRequest',
        'graphql',
      ])
      expect(yield* github.listLabels).toStrictEqual([bug])
    }).pipe(Effect.provide(Layer.provideMerge(DryRun, GitHubMemory({ labels: [bug] })))),
  )
})
