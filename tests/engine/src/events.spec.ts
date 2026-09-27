/**
 * @file tests/engine/src/events.spec.ts
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
import { Effect } from 'effect'
import { decodeEvent } from '@resnovas/engine'
import {
  commentOnPullRequestPayload,
  issuePayload,
  mergeGroupPayload,
  pullRequestPayload,
  pushPayload,
} from './fixtures.js'

describe('decodeEvent', () => {
  for (const event of ['pull_request', 'pull_request_target', 'pull_request_review', 'pull_request_review_comment']) {
    it.effect(`${event} becomes a pull request subject`, () =>
      Effect.map(decodeEvent(event, pullRequestPayload), (envelope) =>
        expect(envelope).toStrictEqual({
          kind: 'pullRequest',
          event,
          action: 'opened',
          headSha: 'abc123',
          subject: {
            kind: 'pullRequest',
            number: 7,
            title: 'feat(labels): sync labels',
            body: 'Adds label sync.',
            author: 'jane',
            association: 'CONTRIBUTOR',
            bot: false,
            open: true,
            locked: false,
            labels: ['bug'],
            updatedAt: new Date('2026-09-01T00:00:00Z'),
            draft: true,
            headBranch: 'feat/labels',
            baseBranch: 'main',
            changes: 40,
          },
        }),
      ),
    )
  }

  it.effect('fills defaults for optional pull request fields', () =>
    Effect.map(
      decodeEvent('pull_request', {
        pull_request: {
          ...pullRequestPayload.pull_request,
          draft: undefined,
          additions: undefined,
          deletions: undefined,
          user: null,
          body: null,
        },
      }),
      (envelope) => expect(envelope).toMatchObject({ subject: { draft: false, changes: 0, author: '', body: '' } }),
    ),
  )

  it.effect('leaves the base branch out when the payload has none', () =>
    Effect.map(
      decodeEvent('pull_request', { pull_request: { ...pullRequestPayload.pull_request, base: undefined } }),
      (envelope) => expect(envelope).not.toHaveProperty('subject.baseBranch'),
    ),
  )

  it.effect('reads a bot author, and leaves out an association GitHub may add later', () =>
    Effect.map(
      decodeEvent('pull_request', {
        pull_request: {
          ...pullRequestPayload.pull_request,
          user: { login: 'bot[bot]', type: 'Bot' },
          author_association: 'SOMETHING_NEW',
        },
      }),
      (envelope) => {
        expect(envelope).toMatchObject({ subject: { author: 'bot[bot]', bot: true } })
        expect(envelope).not.toHaveProperty('subject.association')
      },
    ),
  )

  it.effect('issues and issue comments become an issue subject', () =>
    Effect.gen(function* () {
      expect(yield* decodeEvent('issues', issuePayload)).toMatchObject({
        kind: 'issue',
        action: 'labeled',
        subject: { kind: 'issue', number: 3, body: '', author: 'sam', labels: ['bug'] },
      })
      expect((yield* decodeEvent('issue_comment', { issue: issuePayload.issue })).kind).toBe('issue')
    }),
  )

  it.effect('a comment on a pull request is unsupported, with the reason', () =>
    Effect.map(decodeEvent('issue_comment', commentOnPullRequestPayload), (envelope) =>
      expect(envelope).toMatchObject({
        kind: 'unsupported',
        reason: expect.stringContaining('comments on pull requests'),
      }),
    ),
  )

  it.effect('merge queue entries, pushes, schedules and dispatches are repository events', () =>
    Effect.gen(function* () {
      expect(yield* decodeEvent('merge_group', mergeGroupPayload)).toStrictEqual({
        kind: 'repository',
        event: 'merge_group',
        action: 'checks_requested',
        headSha: 'def456',
      })
      expect(yield* decodeEvent('push', pushPayload)).toStrictEqual({
        kind: 'repository',
        event: 'push',
        headSha: 'fed789',
      })
      expect(yield* decodeEvent('schedule', {})).toStrictEqual({ kind: 'repository', event: 'schedule' })
      expect(yield* decodeEvent('workflow_dispatch', {})).toStrictEqual({
        kind: 'repository',
        event: 'workflow_dispatch',
      })
      expect(yield* decodeEvent('merge_group', { merge_group: mergeGroupPayload.merge_group })).not.toHaveProperty(
        'action',
      )
    }),
  )

  it.effect('a repository dispatch keeps its event type as the action', () =>
    Effect.gen(function* () {
      expect(yield* decodeEvent('repository_dispatch', { action: 'sync-templates', client_payload: {} })).toStrictEqual(
        {
          kind: 'repository',
          event: 'repository_dispatch',
          action: 'sync-templates',
        },
      )
      expect(yield* decodeEvent('repository_dispatch', {})).toStrictEqual({
        kind: 'repository',
        event: 'repository_dispatch',
      })
      expect((yield* Effect.flip(decodeEvent('repository_dispatch', { action: 7 })))._tag).toBe('EventDecodeError')
    }),
  )

  it.effect('a malformed timestamp is a typed error, not an invalid date', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        decodeEvent('issues', { ...issuePayload, issue: { ...issuePayload.issue, updated_at: 'yesterday' } }),
      )
      expect(error).toMatchObject({ _tag: 'EventDecodeError', event: 'issues' })
    }),
  )

  it.effect('any other event is unsupported rather than a crash (v1 threw here)', () =>
    Effect.map(decodeEvent('release', {}), (envelope) =>
      expect(envelope).toStrictEqual({
        kind: 'unsupported',
        event: 'release',
        reason: 'smartcloud does not act on release events',
      }),
    ),
  )

  it.effect('a malformed payload is a typed error naming the event', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(decodeEvent('pull_request', { pull_request: { number: 'seven' } }))
      expect(error._tag).toBe('EventDecodeError')
      expect(error.message).toContain('the pull_request payload could not be read')
    }),
  )
})
