/**
 * @file tests/integrations.github/src/live.spec.ts
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

import { describe, expect, it, vi } from '@effect/vitest'
import { ConfigProvider, Effect, Exit, Fiber, Layer, Redacted, Schedule, TestClock } from 'effect'
import { DEFAULT_COMMITTER, GitHub, GitHubLive, makeLiveGitHub, signOff } from '@resnovas/integrations.github'
import { fakeFetch, type Routes } from './fake-fetch.js'

const REPO = '/repos/Resnovas/example'

const live = (routes: Routes, committer?: { name: string; email: string }) => {
  const fake = fakeFetch(routes)
  const service = makeLiveGitHub({
    token: Redacted.make('test-token'),
    coordinates: { owner: 'Resnovas', repo: 'example' },
    fetch: fake.fetch,
    retry: Schedule.recurs(2),
    ...(committer === undefined ? {} : { committer }),
  })
  return { service, requests: fake.requests }
}

describe('live GitHub: repository and labels', () => {
  it.effect('reads the repository', () =>
    Effect.gen(function* () {
      const { service } = live({
        [`GET ${REPO}`]: {
          body: {
            owner: { login: 'Resnovas' },
            name: 'example',
            full_name: 'Resnovas/example',
            node_id: 'R_1',
            private: true,
            default_branch: 'main',
          },
        },
      })
      expect(yield* (yield* service).getRepository).toStrictEqual({
        owner: 'Resnovas',
        name: 'example',
        fullName: 'Resnovas/example',
        nodeId: 'R_1',
        private: true,
        defaultBranch: 'main',
        current: {},
      })
    }),
  )

  it.effect('reads the current settings it can compare, and skips any value of another type', () =>
    Effect.gen(function* () {
      const { service } = live({
        [`GET ${REPO}`]: {
          body: {
            owner: { login: 'Resnovas' },
            name: 'example',
            full_name: 'Resnovas/example',
            node_id: 'R_1',
            private: false,
            default_branch: 'main',
            has_wiki: false,
            web_commit_signoff_required: true,
            squash_merge_commit_title: 'PR_TITLE',
            allow_auto_merge: null,
          },
        },
      })
      expect((yield* (yield* service).getRepository).current).toStrictEqual({
        has_wiki: false,
        web_commit_signoff_required: true,
        squash_merge_commit_title: 'PR_TITLE',
      })
    }),
  )

  it.effect('lists, creates, renames and deletes labels', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET ${REPO}/labels`]: { body: [{ name: 'bug', color: 'd73a4a', description: null }] },
        [`POST ${REPO}/labels`]: { status: 201, body: {} },
        [`PATCH ${REPO}/labels/bug`]: { body: {} },
        [`DELETE ${REPO}/labels/old`]: { status: 204 },
      })
      const github = yield* service
      expect(yield* github.listLabels).toStrictEqual([{ name: 'bug', color: 'd73a4a', description: '' }])
      yield* github.createLabel({ name: 'docs', color: '0075ca', description: 'Documentation' })
      yield* github.updateLabel('bug', { name: 'defect', color: 'd73a4a', description: '' })
      yield* github.deleteLabel('old')
      expect(requests.slice(1).map(({ method, path, body }) => ({ method, path, body }))).toStrictEqual([
        {
          method: 'POST',
          path: `${REPO}/labels`,
          body: { name: 'docs', color: '0075ca', description: 'Documentation' },
        },
        { method: 'PATCH', path: `${REPO}/labels/bug`, body: { new_name: 'defect', color: 'd73a4a', description: '' } },
        { method: 'DELETE', path: `${REPO}/labels/old`, body: undefined },
      ])
    }),
  )
})

describe('live GitHub: issues and comments', () => {
  it.effect('labels, comments on and closes issues', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`POST ${REPO}/issues/3/labels`]: { body: [] },
        [`DELETE ${REPO}/issues/3/labels/bug`]: { body: [] },
        [`GET ${REPO}/issues/3/comments`]: {
          body: [
            { id: 9, body: null, user: null },
            { id: 12, body: 'x', user: { login: 'app[bot]', type: 'Bot' } },
          ],
        },
        [`POST ${REPO}/issues/3/comments`]: [
          { status: 201, body: { id: 10, body: 'hi', user: { login: 'bot', type: 'Bot' } } },
          { status: 201, body: { id: 11, body: null, user: null } },
        ],
        [`PATCH ${REPO}/issues/comments/10`]: { body: {} },
        [`PATCH ${REPO}/issues/3`]: { body: {} },
      })
      const github = yield* service
      yield* github.addLabels(3, ['bug'])
      yield* github.removeLabel(3, 'bug')
      expect(yield* github.listComments(3)).toStrictEqual([
        { id: 9, body: '', author: '', bot: false },
        { id: 12, body: 'x', author: 'app[bot]', bot: true },
      ])
      expect(yield* github.createComment(3, 'hi')).toStrictEqual({ id: 10, body: 'hi', author: 'bot', bot: true })
      yield* github.updateComment(10, 'edited')
      yield* github.closeIssue(3)
      expect(yield* github.createComment(3, '')).toStrictEqual({ id: 11, body: '', author: '', bot: false })
      expect(requests.map(({ method, body }) => `${method} ${JSON.stringify(body)}`)).toStrictEqual([
        'POST {"labels":["bug"]}',
        'DELETE undefined',
        'GET undefined',
        'POST {"body":"hi"}',
        'PATCH {"body":"edited"}',
        'PATCH {"state":"closed"}',
        'POST {"body":""}',
      ])
    }),
  )

  it.effect('lists open issues and pull requests for scheduled sweeps', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET ${REPO}/issues`]: {
          body: [
            {
              number: 1,
              title: 'a',
              body: null,
              user: null,
              state: 'open',
              locked: false,
              labels: ['bug', { name: 'stale' }, {}],
              updated_at: '2026-01-01T00:00:00Z',
            },
            {
              number: 2,
              title: 'b',
              body: 'x',
              user: { login: 'jane', type: 'User' },
              author_association: 'MEMBER',
              state: 'open',
              locked: true,
              labels: [],
              assignees: [{ login: 'ann' }, { login: 'bo' }],
              milestone: { title: 'v2.0' },
              updated_at: '2026-01-02T00:00:00Z',
              pull_request: {},
            },
            {
              number: 3,
              title: 'c',
              body: '',
              user: { login: 'bot[bot]', type: 'Bot' },
              author_association: 'SOMETHING_NEW',
              state: 'open',
              locked: false,
              labels: [],
              assignees: null,
              milestone: null,
              updated_at: '2026-01-03T00:00:00Z',
            },
          ],
        },
      })
      const issues = yield* (yield* service).listOpenIssues
      expect(issues).toStrictEqual([
        {
          number: 1,
          title: 'a',
          body: '',
          author: '',
          open: true,
          locked: false,
          labels: ['bug', 'stale', ''],
          assignees: [],
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          isPullRequest: false,
        },
        {
          number: 2,
          title: 'b',
          body: 'x',
          author: 'jane',
          association: 'MEMBER',
          bot: false,
          open: true,
          locked: true,
          labels: [],
          assignees: ['ann', 'bo'],
          milestone: 'v2.0',
          updatedAt: new Date('2026-01-02T00:00:00Z'),
          isPullRequest: true,
        },
        {
          number: 3,
          title: 'c',
          body: '',
          author: 'bot[bot]',
          bot: true,
          open: true,
          locked: false,
          labels: [],
          assignees: [],
          updatedAt: new Date('2026-01-03T00:00:00Z'),
          isPullRequest: false,
        },
      ])
      expect(requests[0]?.query).toContain('state=open')
    }),
  )
})

describe('live GitHub: pull requests', () => {
  const routes: Routes = {
    [`GET ${REPO}/pulls/7/commits`]: {
      body: [
        {
          sha: 'a',
          commit: {
            message: 'feat: x',
            author: { name: 'Jane', email: 'jane@example.com' },
            verification: { verified: true, reason: 'valid' },
          },
          parents: [{}],
        },
        { sha: 'b', commit: { message: 'Merge', author: null }, parents: [{}, {}] },
      ],
    },
    [`GET ${REPO}/pulls/7/files`]: { body: [{ filename: 'src/a.ts' }] },
    [`GET ${REPO}/pulls/7/reviews`]: {
      body: [
        { user: { login: 'ann' }, state: 'APPROVED' },
        { user: null, state: 'SOMETHING_NEW' },
      ],
    },
    [`GET ${REPO}/pulls/7/requested_reviewers`]: {
      body: { users: [{ login: 'ann' }], teams: [{ slug: 'security' }, { slug: 'docs' }] },
    },
    [`POST ${REPO}/pulls/7/reviews`]: { body: {} },
    [`POST ${REPO}/pulls/7/requested_reviewers`]: { status: 201, body: {} },
  }

  it.effect('reads commits, files, reviews and requested reviewers, once each', () =>
    Effect.gen(function* () {
      const { service, requests } = live(routes)
      const github = yield* service
      expect(yield* github.listCommits(7)).toStrictEqual([
        {
          sha: 'a',
          message: 'feat: x',
          authorName: 'Jane',
          authorEmail: 'jane@example.com',
          parents: 1,
          verified: true,
        },
        { sha: 'b', message: 'Merge', authorName: '', authorEmail: '', parents: 2, verified: false },
      ])
      expect(yield* github.listFiles(7)).toStrictEqual(['src/a.ts'])
      // An unknown review state neither approves nor blocks.
      expect(yield* github.listReviews(7)).toStrictEqual([
        { author: 'ann', state: 'APPROVED' },
        { author: '', state: 'COMMENTED' },
      ])
      expect(yield* github.countRequestedReviewers(7)).toBe(3)
      expect(yield* github.listRequestedReviewers(7)).toStrictEqual(['ann', 'security', 'docs'])
      yield* github.listCommits(7)
      yield* github.listFiles(7)
      yield* github.listReviews(7)
      yield* github.countRequestedReviewers(7)
      yield* github.listRequestedReviewers(7)
      expect(requests).toHaveLength(5)
    }),
  )

  it.effect('reads changed files with their status, marking those without a diff or lines as binary', () =>
    Effect.gen(function* () {
      const { service } = live({
        [`GET ${REPO}/pulls/7/files`]: {
          body: [
            { filename: 'src/a.ts', status: 'modified', changes: 3, patch: '@@ -1 +1 @@' },
            { filename: 'logo.png', status: 'added', changes: 0 },
            { filename: 'huge.json', status: 'added', changes: 90000 },
          ],
        },
      })
      const github = yield* service
      expect(yield* github.listChangedFiles(7)).toStrictEqual([
        { path: 'src/a.ts', status: 'modified', binary: false },
        { path: 'logo.png', status: 'added', binary: true },
        { path: 'huge.json', status: 'added', binary: false },
      ])
    }),
  )

  it.effect('reads whether a pull request conflicts with its base branch', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET ${REPO}/pulls/7`]: { body: { mergeable: false } },
        [`GET ${REPO}/pulls/8`]: { body: { mergeable: true } },
      })
      const github = yield* service
      expect(yield* github.getMergeable(7)).toBe('CONFLICTING')
      expect(yield* github.getMergeable(8)).toBe('MERGEABLE')
      yield* github.getMergeable(7)
      expect(requests).toHaveLength(2)
    }),
  )

  it.effect('reads mergeability again while GitHub is still computing it', () =>
    Effect.gen(function* () {
      const fake = fakeFetch({
        [`GET ${REPO}/pulls/7`]: [
          { body: { mergeable: null } },
          { body: { mergeable: null } },
          { body: { mergeable: false } },
        ],
        [`GET ${REPO}/pulls/8`]: { body: { mergeable: null } },
      })
      const github = yield* makeLiveGitHub({
        token: Redacted.make('test-token'),
        coordinates: { owner: 'Resnovas', repo: 'example' },
        fetch: fake.fetch,
        mergeablePoll: Schedule.recurs(3),
      })
      expect(yield* github.getMergeable(7)).toBe('CONFLICTING')
      expect(fake.requests).toHaveLength(3)
      // Still unknown after every poll: the answer stays unknown rather than failing.
      expect(yield* github.getMergeable(8)).toBe('UNKNOWN')
      expect(fake.requests).toHaveLength(7)
    }),
  )

  it.effect('waits between mergeability reads by default', () =>
    Effect.gen(function* () {
      const fake = fakeFetch({
        [`GET ${REPO}/pulls/7`]: [{ body: { mergeable: null } }, { body: { mergeable: true } }],
      })
      const github = yield* makeLiveGitHub({
        token: Redacted.make('test-token'),
        coordinates: { owner: 'Resnovas', repo: 'example' },
        fetch: fake.fetch,
      })
      const read = yield* Effect.fork(github.getMergeable(7))
      yield* TestClock.adjust('2 seconds')
      expect(yield* Fiber.join(read)).toBe('MERGEABLE')
      expect(fake.requests).toHaveLength(2)
    }),
  )

  it.effect("reads the check runs and latest commit statuses on a pull request's head commit", () =>
    Effect.gen(function* () {
      const run = (name: string, status: string, conclusion: string | null) => ({ name, status, conclusion })
      const { service, requests } = live({
        [`GET ${REPO}/pulls/7`]: { body: { head: { sha: 'abc' } } },
        [`GET ${REPO}/commits/abc/check-runs`]: {
          body: {
            total_count: 7,
            check_runs: [
              run('build', 'completed', 'success'),
              run('docs', 'completed', 'skipped'),
              run('audit', 'completed', 'neutral'),
              run('test', 'completed', 'failure'),
              run('e2e', 'completed', 'cancelled'),
              run('lint', 'in_progress', null),
              run('odd', 'completed', null),
            ],
          },
        },
        [`GET ${REPO}/commits/abc/statuses`]: {
          body: [
            { context: 'ci/circle', state: 'success' },
            { context: 'ci/circle', state: 'failure' },
            { context: 'deploy', state: 'pending' },
            { context: 'coverage', state: 'error' },
            { context: 'legacy', state: 'failure' },
          ],
        },
      })
      const github = yield* service
      expect(yield* github.listChecks(7)).toStrictEqual([
        { name: 'build', state: 'success' },
        { name: 'docs', state: 'success' },
        { name: 'audit', state: 'success' },
        { name: 'test', state: 'failure' },
        { name: 'e2e', state: 'failure' },
        { name: 'lint', state: 'pending' },
        { name: 'odd', state: 'failure' },
        { name: 'ci/circle', state: 'success' },
        { name: 'deploy', state: 'pending' },
        { name: 'coverage', state: 'failure' },
        { name: 'legacy', state: 'failure' },
      ])
      expect(requests.find((request) => request.path === `${REPO}/commits/abc/check-runs`)?.query).toContain(
        'per_page=100',
      )
    }),
  )

  it.effect('submits reviews and requests reviewers', () =>
    Effect.gen(function* () {
      const { service, requests } = live(routes)
      const github = yield* service
      yield* github.createReview(7, { event: 'COMMENT', body: 'Looks fine' })
      yield* github.requestReviewers(7, ['ann'])
      expect(requests.map(({ body }) => body)).toStrictEqual([
        { event: 'COMMENT', body: 'Looks fine' },
        { reviewers: ['ann'] },
      ])
    }),
  )
})

describe('live GitHub: checks, files, settings and GraphQL', () => {
  it.effect(
    'lists the checks on a commit: the latest run of each name per suite and the latest status of each context',
    () =>
      Effect.gen(function* () {
        const { service, requests } = live({
          [`GET ${REPO}/commits/abc/check-runs`]: {
            body: {
              total_count: 7,
              check_runs: [
                {
                  id: 1,
                  name: 'ci / test',
                  status: 'completed',
                  conclusion: 'success',
                  html_url: 'https://github.com/r/1',
                  details_url: null,
                  external_id: '',
                  app: { slug: 'github-actions' },
                },
                {
                  id: 2,
                  name: 'ci / lint',
                  status: 'completed',
                  conclusion: 'skipped',
                  html_url: null,
                  details_url: 'https://ci/2',
                  external_id: null,
                  app: null,
                },
                {
                  id: 3,
                  name: 'ci / build',
                  status: 'in_progress',
                  conclusion: null,
                  html_url: null,
                  details_url: null,
                  external_id: null,
                  app: {},
                },
                {
                  id: 4,
                  name: 'ci / docs',
                  status: 'completed',
                  conclusion: 'timed_out',
                  html_url: null,
                  details_url: null,
                  external_id: null,
                  app: null,
                },
                {
                  id: 5,
                  name: 'ci / odd',
                  status: 'completed',
                  conclusion: null,
                  html_url: null,
                  details_url: null,
                  external_id: null,
                  app: null,
                },
                {
                  id: 6,
                  name: 'smartcloud / reviews',
                  status: 'completed',
                  conclusion: 'failure',
                  html_url: null,
                  details_url: null,
                  external_id: 'smartcloud',
                  app: { slug: 'github-actions' },
                },
                {
                  id: 7,
                  name: 'ci / test',
                  status: 'completed',
                  conclusion: 'cancelled',
                  html_url: null,
                  details_url: null,
                  external_id: null,
                  app: { slug: 'github-actions' },
                },
              ],
            },
          },
          [`GET ${REPO}/commits/abc/statuses`]: {
            body: [
              { context: 'deploy', state: 'success', target_url: 'https://deploy' },
              { context: 'deploy', state: 'pending', target_url: null },
              { context: 'coverage', state: 'error', target_url: null },
              { context: 'preview', state: 'pending', target_url: null },
              { context: 'legal', state: 'failure', target_url: null },
            ],
          },
        })
        const github = yield* service
        expect(yield* github.listCommitChecks('abc')).toStrictEqual([
          {
            name: 'ci / test',
            source: 'checkRun',
            id: 1,
            app: 'github-actions',
            state: 'success',
            detail: 'success',
            url: 'https://github.com/r/1',
          },
          { name: 'ci / lint', source: 'checkRun', id: 2, state: 'success', detail: 'skipped', url: 'https://ci/2' },
          { name: 'ci / build', source: 'checkRun', id: 3, state: 'pending', detail: 'in_progress' },
          { name: 'ci / docs', source: 'checkRun', id: 4, state: 'failure', detail: 'timed_out' },
          { name: 'ci / odd', source: 'checkRun', id: 5, state: 'failure', detail: 'completed' },
          {
            name: 'smartcloud / reviews',
            source: 'checkRun',
            id: 6,
            app: 'github-actions',
            externalId: 'smartcloud',
            state: 'failure',
            detail: 'failure',
          },
          // Another suite's run of the same check is listed too; the reader picks the latest.
          {
            name: 'ci / test',
            source: 'checkRun',
            id: 7,
            app: 'github-actions',
            state: 'failure',
            detail: 'cancelled',
          },
          { name: 'deploy', source: 'status', state: 'success', detail: 'success', url: 'https://deploy' },
          { name: 'coverage', source: 'status', state: 'failure', detail: 'error' },
          { name: 'preview', source: 'status', state: 'pending', detail: 'pending' },
          { name: 'legal', source: 'status', state: 'failure', detail: 'failure' },
        ])
        expect(requests.find((request) => request.path.endsWith('/check-runs'))?.query).toContain('filter=all')
        // Polled, so never served from the cache.
        yield* github.listCommitChecks('abc')
        expect(requests).toHaveLength(4)
      }),
  )

  it.effect('reads the checks on a commit with the checks token, and writes with the main token', () =>
    Effect.gen(function* () {
      const fake = fakeFetch({
        [`GET ${REPO}/commits/abc/check-runs`]: { body: { total_count: 0, check_runs: [] } },
        [`GET ${REPO}/commits/abc/statuses`]: { body: [] },
        [`POST ${REPO}/check-runs`]: { status: 201, body: { id: 42 } },
      })
      const github = yield* makeLiveGitHub({
        token: Redacted.make('access-token'),
        checksToken: Redacted.make('workflow-token'),
        coordinates: { owner: 'Resnovas', repo: 'example' },
        fetch: fake.fetch,
      })
      expect(yield* github.listCommitChecks('abc')).toStrictEqual([])
      yield* github.createCheckRun({
        name: 'smartcloud / labels',
        headSha: 'abc',
        status: 'completed',
        conclusion: 'success',
        title: 't',
        summary: 's',
      })
      expect(fake.tokens).toStrictEqual(['workflow-token', 'workflow-token', 'access-token'])
    }),
  )

  it.effect('reads a pull request’s checks for conditions with the checks token too', () =>
    Effect.gen(function* () {
      const fake = fakeFetch({
        [`GET ${REPO}/pulls/7`]: { body: { head: { sha: 'abc' } } },
        [`GET ${REPO}/commits/abc/check-runs`]: { body: { total_count: 0, check_runs: [] } },
        [`GET ${REPO}/commits/abc/statuses`]: { body: [] },
      })
      const github = yield* makeLiveGitHub({
        token: Redacted.make('access-token'),
        checksToken: Redacted.make('workflow-token'),
        coordinates: { owner: 'Resnovas', repo: 'example' },
        fetch: fake.fetch,
      })
      expect(yield* github.listChecks(7)).toStrictEqual([])
      expect(fake.tokens).toStrictEqual(['access-token', 'workflow-token', 'workflow-token'])
    }),
  )

  it.effect('reads the checks on a commit with the main token when no checks token is given', () =>
    Effect.gen(function* () {
      const fake = fakeFetch({
        [`GET ${REPO}/commits/abc/check-runs`]: { body: { total_count: 0, check_runs: [] } },
        [`GET ${REPO}/commits/abc/statuses`]: { body: [] },
      })
      const github = yield* makeLiveGitHub({
        token: Redacted.make('test-token'),
        coordinates: { owner: 'Resnovas', repo: 'example' },
        fetch: fake.fetch,
      })
      yield* github.listCommitChecks('abc')
      expect(fake.tokens).toStrictEqual(['test-token', 'test-token'])
    }),
  )

  it.effect('creates and updates check runs, sending annotations 50 at a time', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`POST ${REPO}/check-runs`]: { status: 201, body: { id: 42 } },
        [`PATCH ${REPO}/check-runs/42`]: { body: {} },
      })
      const github = yield* service
      const annotation = { path: 'a.ts', line: 1, level: 'warning' as const, message: 'm' }
      const id = yield* github.createCheckRun({
        name: 'smartcloud',
        headSha: 'abc',
        status: 'in_progress',
        title: 't',
        summary: 's',
        annotations: [{ ...annotation, title: 'x' }, ...Array.from({ length: 60 }, () => annotation)],
      })
      expect(id).toBe(42)
      yield* github.updateCheckRun(42, {
        name: 'smartcloud',
        headSha: 'abc',
        status: 'completed',
        conclusion: 'success',
        title: 't',
        summary: 's',
      })
      yield* github.createCheckRun({
        name: 'smartcloud',
        headSha: 'abc',
        status: 'completed',
        conclusion: 'neutral',
        title: 't',
        summary: 's',
      })
      yield* github.updateCheckRun(42, {
        name: 'smartcloud',
        headSha: 'abc',
        status: 'in_progress',
        title: 't',
        summary: 's',
      })
      yield* github.updateCheckRun(42, {
        name: 'smartcloud',
        headSha: 'abc',
        status: 'completed',
        conclusion: 'failure',
        title: 't',
        summary: 's',
        annotations: Array.from({ length: 120 }, () => annotation),
      })
      expect(requests.map(({ method }) => method)).toStrictEqual([
        'POST',
        'PATCH',
        'PATCH',
        'POST',
        'PATCH',
        'PATCH',
        'PATCH',
        'PATCH',
      ])
      const count = (index: number) => JSON.stringify(requests[index]?.body).match(/"path":"a\.ts"/g)?.length ?? 0
      expect([0, 1, 5, 6, 7].map(count)).toStrictEqual([50, 11, 50, 50, 20])
      expect(requests[1]?.body).toStrictEqual({ output: expect.objectContaining({ title: 't', summary: 's' }) })
      expect(requests[5]?.body).toMatchObject({ status: 'completed', conclusion: 'failure' })
      expect(requests[6]?.body).not.toHaveProperty('conclusion')
      expect(requests[3]?.body).toMatchObject({ conclusion: 'neutral' })
      expect(requests[4]?.body).not.toHaveProperty('conclusion')
      expect(requests[0]?.body).toMatchObject({
        head_sha: 'abc',
        external_id: 'smartcloud',
        status: 'in_progress',
        output: { title: 't', summary: 's' },
      })
      expect(requests[0]?.body).toHaveProperty(['output', 'annotations', '0'], {
        path: 'a.ts',
        start_line: 1,
        end_line: 1,
        annotation_level: 'warning',
        message: 'm',
        title: 'x',
      })
      expect(requests[2]?.body).toMatchObject({ conclusion: 'success', output: { annotations: [] } })
    }),
  )

  it.effect('reads a file at a ref, and refuses a directory', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET /repos/Resnovas/.github/contents/smartcloud/house.yml`]: {
          body: { type: 'file', encoding: 'base64', content: Buffer.from('version: 2\n').toString('base64') },
        },
        [`GET /repos/Resnovas/.github/contents/templates`]: { body: [{ type: 'file' }] },
        [`GET /repos/Resnovas/.github/contents/large.yml`]: { body: { type: 'file', encoding: 'none', content: '' } },
      })
      const github = yield* service
      expect(
        yield* github.getFile({ owner: 'Resnovas', repo: '.github', path: 'smartcloud/house.yml', ref: 'main' }),
      ).toBe('version: 2\n')
      expect(requests[0]?.query).toBe('?ref=main')
      const error = yield* Effect.flip(github.getFile({ owner: 'Resnovas', repo: '.github', path: 'templates' }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'templates is not a file' })
      // Over 1 MB, GitHub sends no inline content: that is not an empty file.
      const large = yield* Effect.flip(github.getFile({ owner: 'Resnovas', repo: '.github', path: 'large.yml' }))
      expect(large).toMatchObject({ _tag: 'ValidationFailed', detail: 'large.yml is too large to read (over 1 MB)' })
    }),
  )

  it.effect('makes repository-scoped requests and GraphQL calls', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`PATCH ${REPO}`]: { body: { ok: true } },
        [`POST /graphql`]: { body: { data: { repository: { id: 'R_1' } } } },
      })
      const github = yield* service
      expect(yield* github.repositoryRequest({ method: 'PATCH', path: '', body: { has_wiki: false } })).toStrictEqual({
        ok: true,
      })
      expect(yield* github.graphql('query($id: ID!) { node(id: $id) { id } }', { id: 'R_1' })).toStrictEqual({
        repository: { id: 'R_1' },
      })
      expect(requests[0]?.body).toStrictEqual({ has_wiki: false })
      expect(requests[1]?.body).toMatchObject({ variables: { id: 'R_1' } })
    }),
  )

  it.effect('keeps a request body and GraphQL variables out of the request options and the repository path', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`POST ${REPO}/rulesets`]: { status: 201, body: { id: 1 } },
        [`GET ${REPO}/rulesets`]: { body: [] },
      })
      const github = yield* service
      const body = {
        owner: 'someone-else',
        repo: 'other',
        baseUrl: 'https://attacker.example',
        headers: { authorization: 'x' },
        name: 'r',
      }
      yield* github.repositoryRequest({ method: 'POST', path: '/rulesets', body })
      yield* github.repositoryRequest({ method: 'GET', path: '/rulesets?per_page=100' })
      expect(requests.map(({ method, path, query }) => `${method} ${path}${query}`)).toStrictEqual([
        `POST ${REPO}/rulesets`,
        `GET ${REPO}/rulesets?per_page=100`,
      ])
      expect(requests[0]?.body).toStrictEqual(body)
      for (const path of ['/../../orgs/x', '/%2E%2E/other', '/./x', 'rulesets', '/a\\b', '/a#b', '/{owner}']) {
        const error = yield* Effect.flip(github.repositoryRequest({ method: 'GET', path }))
        expect(error._tag).toBe('ValidationFailed')
      }
      const error = yield* Effect.flip(
        github.graphql('query { x }', { baseUrl: 'https://attacker.example', headers: {} }),
      )
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'variables cannot be named baseUrl, headers' })
      expect(requests).toHaveLength(2)
    }),
  )
})

describe('live GitHub: directories', () => {
  it.effect('lists the files under a directory at a ref, recursively, with their execute bits', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET /repos/Resnovas/.github/git/trees/v2:templates`]: {
          body: {
            truncated: false,
            tree: [
              { path: 'LICENSE', mode: '100644', type: 'blob', sha: '1' },
              { path: '.github', mode: '040000', type: 'tree', sha: '2' },
              { path: '.github/dependabot.yml', mode: '100644', type: 'blob', sha: '3' },
              { path: 'tools/run', mode: '100755', type: 'blob', sha: '4' },
              { path: 'link', mode: '120000', type: 'blob', sha: '5' },
              { path: 'vendor', mode: '160000', type: 'commit', sha: '6' },
            ],
          },
        },
      })
      const entries = yield* (yield* service).listDirectory({
        owner: 'Resnovas',
        repo: '.github',
        path: '/templates/',
        ref: 'v2',
      })
      expect(entries).toStrictEqual([
        { path: 'LICENSE', executable: false },
        { path: '.github/dependabot.yml', executable: false },
        { path: 'tools/run', executable: true },
      ])
      expect(requests[0]?.query).toBe('?recursive=true')
    }),
  )

  it.effect('lists the default branch when no ref is given, and refuses a listing GitHub truncated', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET ${REPO}/git/trees/HEAD:`]: { body: { truncated: true, tree: [] } },
      })
      const error = yield* Effect.flip((yield* service).listDirectory({ owner: 'Resnovas', repo: 'example', path: '' }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: ' has too many files to list' })
      expect(requests).toHaveLength(1)
    }),
  )
})

describe('live GitHub: proposing changes', () => {
  const proposal = {
    branch: 'smartcloud/sync',
    base: 'main',
    title: 'chore(sync): sync files',
    body: 'Synced.',
    files: [
      { path: 'LICENSE', content: 'MIT', executable: false },
      { path: 'tools/run', content: '#!/bin/sh', executable: true },
    ],
  }
  const baseRoutes: Routes = {
    [`GET ${REPO}/git/ref/heads/main`]: { body: { object: { sha: 'base' } } },
    [`GET ${REPO}/git/commits/base`]: { body: { sha: 'base', tree: { sha: 'base-tree' }, parents: [] } },
    [`POST ${REPO}/git/blobs`]: [
      { status: 201, body: { sha: 'blob-1' } },
      { status: 201, body: { sha: 'blob-2' } },
    ],
    [`POST ${REPO}/git/trees`]: { status: 201, body: { sha: 'new-tree' } },
    [`POST ${REPO}/git/commits`]: {
      status: 201,
      body: { sha: 'new-commit', author: DEFAULT_COMMITTER, verification: { verified: true } },
    },
  }

  it.effect('builds a signed-off commit on the base as the token, creates the branch and opens a pull request', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        ...baseRoutes,
        [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { status: 404, body: { message: 'Not Found' } },
        [`POST ${REPO}/git/refs`]: { status: 201, body: {} },
        [`GET ${REPO}/pulls`]: { body: [] },
        [`POST ${REPO}/pulls`]: {
          status: 201,
          body: { number: 5, html_url: 'https://github.com/Resnovas/example/pull/5' },
        },
      })
      const result = yield* (yield* service).proposeChanges({ ...proposal, deletions: ['OLD.md'] })
      expect(result).toStrictEqual({ number: 5, url: 'https://github.com/Resnovas/example/pull/5', created: true })
      const sent = (method: string, path: string) =>
        requests.filter((request) => request.method === method && request.path === path)
      expect(sent('POST', `${REPO}/git/blobs`).map(({ body }) => body)).toStrictEqual([
        { content: Buffer.from('MIT').toString('base64'), encoding: 'base64' },
        { content: Buffer.from('#!/bin/sh').toString('base64'), encoding: 'base64' },
      ])
      expect(sent('POST', `${REPO}/git/trees`)[0]?.body).toStrictEqual({
        base_tree: 'base-tree',
        tree: [
          { path: 'LICENSE', mode: '100644', type: 'blob', sha: 'blob-1' },
          { path: 'tools/run', mode: '100755', type: 'blob', sha: 'blob-2' },
          { path: 'OLD.md', mode: '100644', type: 'blob', sha: null },
        ],
      })
      expect(sent('POST', `${REPO}/git/commits`)[0]?.body).toStrictEqual({
        message: `chore(sync): sync files\n\nSigned-off-by: ${DEFAULT_COMMITTER.name} <${DEFAULT_COMMITTER.email}>`,
        tree: 'new-tree',
        parents: ['base'],
      })
      expect(sent('POST', `${REPO}/git/commits`)).toHaveLength(1)
      expect(sent('POST', `${REPO}/git/refs`)[0]?.body).toStrictEqual({
        ref: 'refs/heads/smartcloud/sync',
        sha: 'new-commit',
      })
      expect(sent('GET', `${REPO}/pulls`)[0]?.query).toContain('head=Resnovas%3Asmartcloud%2Fsync')
      expect(sent('POST', `${REPO}/pulls`)[0]?.body).toStrictEqual({
        head: 'smartcloud/sync',
        base: 'main',
        title: proposal.title,
        body: 'Synced.',
      })
    }),
  )

  it.effect('resets an existing branch as the configured committer, and updates the open pull request', () =>
    Effect.gen(function* () {
      const bot = { name: 'smartcloud[bot]', email: '1+smartcloud[bot]@users.noreply.github.com' }
      const { service, requests } = live(
        {
          ...baseRoutes,
          [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { body: { object: { sha: 'old-commit' } } },
          [`GET ${REPO}/git/commits/old-commit`]: {
            body: { sha: 'old-commit', tree: { sha: 'old-tree' }, parents: [{ sha: 'base' }] },
          },
          [`PATCH ${REPO}/git/refs/heads/smartcloud/sync`]: { body: {} },
          [`GET ${REPO}/pulls`]: { body: [{ number: 9, html_url: 'https://github.com/Resnovas/example/pull/9' }] },
          [`PATCH ${REPO}/pulls/9`]: { body: {} },
        },
        bot,
      )
      const result = yield* (yield* service).proposeChanges(proposal)
      expect(result).toStrictEqual({ number: 9, url: 'https://github.com/Resnovas/example/pull/9', created: false })
      expect(
        requests.find((request) => request.path === `${REPO}/git/commits` && request.method === 'POST')?.body,
      ).toMatchObject({
        message: signOff(proposal.title, bot),
        author: bot,
        committer: bot,
      })
      expect(
        requests.find((request) => request.method === 'PATCH' && request.path.endsWith('smartcloud/sync'))?.body,
      ).toStrictEqual({
        sha: 'new-commit',
        force: true,
      })
      expect(requests.at(-1)?.body).toStrictEqual({ title: proposal.title, body: 'Synced.' })
    }),
  )

  it.effect('signs off as the identity GitHub records for the token, and remembers it for the next proposal', () =>
    Effect.gen(function* () {
      const app = { name: 'resnovas-bot[bot]', email: '7+resnovas-bot[bot]@users.noreply.github.com' }
      const { service, requests } = live({
        ...baseRoutes,
        [`POST ${REPO}/git/blobs`]: { status: 201, body: { sha: 'blob' } },
        [`POST ${REPO}/git/commits`]: [
          { status: 201, body: { sha: 'guessed', author: app, verification: { verified: true } } },
          { status: 201, body: { sha: 'signed-off', author: app, verification: { verified: true } } },
          { status: 201, body: { sha: 'again', author: app, verification: { verified: true } } },
        ],
        [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { status: 404, body: { message: 'Not Found' } },
        [`POST ${REPO}/git/refs`]: { status: 201, body: {} },
        [`GET ${REPO}/pulls`]: { body: [] },
        [`POST ${REPO}/pulls`]: { status: 201, body: { number: 5, html_url: 'u' } },
      })
      const github = yield* service
      yield* github.proposeChanges(proposal)
      yield* github.proposeChanges(proposal)
      const commits = requests.filter((request) => request.method === 'POST' && request.path === `${REPO}/git/commits`)
      expect(commits.map(({ body }) => (body as { message: string }).message)).toStrictEqual([
        signOff(proposal.title, DEFAULT_COMMITTER),
        signOff(proposal.title, app),
        signOff(proposal.title, app),
      ])
      expect(commits.every(({ body }) => !Object.hasOwn(body as object, 'author'))).toBe(true)
      expect(requests.filter((request) => request.path === `${REPO}/git/refs`).map(({ body }) => body)).toStrictEqual([
        { ref: 'refs/heads/smartcloud/sync', sha: 'signed-off' },
        { ref: 'refs/heads/smartcloud/sync', sha: 'again' },
      ])
    }),
  )

  const sameChanges = (verified: boolean): Routes => ({
    ...baseRoutes,
    [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { body: { object: { sha: 'old-commit' } } },
    [`GET ${REPO}/git/commits/old-commit`]: {
      body: { sha: 'old-commit', tree: { sha: 'new-tree' }, parents: [{ sha: 'base' }], verification: { verified } },
    },
    [`PATCH ${REPO}/git/refs/heads/smartcloud/sync`]: { body: {} },
    [`GET ${REPO}/pulls`]: { body: [{ number: 9, html_url: 'u' }] },
    [`PATCH ${REPO}/pulls/9`]: { body: {} },
  })

  it.effect('leaves a signed branch that already holds the same changes on the same base', () =>
    Effect.gen(function* () {
      const { service, requests } = live(sameChanges(true))
      expect((yield* (yield* service).proposeChanges(proposal)).created).toBe(false)
      expect(requests.some((request) => request.method === 'POST' && request.path === `${REPO}/git/commits`)).toBe(
        false,
      )
      expect(requests.some((request) => request.method === 'PATCH' && request.path.includes('/git/refs/'))).toBe(false)
    }),
  )

  it.effect('makes an unsigned branch again as the token, even when it holds the same changes', () =>
    Effect.gen(function* () {
      const { service, requests } = live(sameChanges(false))
      expect((yield* (yield* service).proposeChanges(proposal)).created).toBe(false)
      expect(
        requests.filter((request) => request.method === 'POST' && request.path === `${REPO}/git/commits`),
      ).toHaveLength(1)
      expect(
        requests.find((request) => request.method === 'PATCH' && request.path.includes('/git/refs/'))?.body,
      ).toStrictEqual({
        sha: 'new-commit',
        force: true,
      })
    }),
  )

  it.effect('leaves an unsigned branch with the same changes when the token cannot sign either', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        ...sameChanges(false),
        [`POST ${REPO}/git/commits`]: {
          status: 201,
          body: { sha: 'unsigned', author: DEFAULT_COMMITTER, verification: { verified: false } },
        },
      })
      expect((yield* (yield* service).proposeChanges(proposal)).created).toBe(false)
      expect(
        requests.filter((request) => request.method === 'POST' && request.path === `${REPO}/git/commits`),
      ).toHaveLength(1)
      expect(requests.some((request) => request.method === 'PATCH' && request.path.includes('/git/refs/'))).toBe(false)
    }),
  )

  it.effect(
    'leaves an unsigned branch with the same changes when a committer is named, whose commits are never signed',
    () =>
      Effect.gen(function* () {
        const bot = { name: 'smartcloud[bot]', email: '1+smartcloud[bot]@users.noreply.github.com' }
        const { service, requests } = live(sameChanges(false), bot)
        expect((yield* (yield* service).proposeChanges(proposal)).created).toBe(false)
        expect(requests.some((request) => request.method === 'POST' && request.path === `${REPO}/git/commits`)).toBe(
          false,
        )
      }),
  )

  it.effect('refuses to propose from the base branch itself, before any request', () =>
    Effect.gen(function* () {
      const { service, requests } = live(baseRoutes)
      const error = yield* Effect.flip((yield* service).proposeChanges({ ...proposal, branch: 'main' }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'the proposal branch cannot be its base, main' })
      expect(requests).toStrictEqual([])
    }),
  )

  it.effect('surfaces a missing base branch as NotFound', () =>
    Effect.gen(function* () {
      const { service } = live({ [`GET ${REPO}/git/ref/heads/main`]: { status: 404, body: { message: 'Not Found' } } })
      const error = yield* Effect.flip((yield* service).proposeChanges(proposal))
      expect(error.message).toBe('proposeChanges: read base: not found (Not Found)')
    }),
  )
})

describe('live GitHub: failures', () => {
  it.effect('maps GitHub statuses to typed errors', () =>
    Effect.gen(function* () {
      const { service } = live({
        [`DELETE ${REPO}/labels/missing`]: { status: 404, body: { message: 'Not Found' } },
        [`POST ${REPO}/labels`]: { status: 422, body: { message: 'Validation Failed' } },
        [`GET ${REPO}/labels`]: { status: 403, body: { message: 'Resource not accessible by integration' } },
      })
      const github = yield* service
      expect((yield* Effect.flip(github.deleteLabel('missing')))._tag).toBe('NotFound')
      expect((yield* Effect.flip(github.createLabel({ name: 'a', color: 'ffffff', description: '' })))._tag).toBe(
        'ValidationFailed',
      )
      expect((yield* Effect.flip(github.listLabels))._tag).toBe('Forbidden')
    }),
  )

  it.effect('retries rate limits and outages, then succeeds', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET ${REPO}/labels`]: [
          { status: 403, body: { message: 'API rate limit exceeded for installation' } },
          { networkError: 'socket hang up' },
          { body: [] },
        ],
      })
      expect(yield* (yield* service).listLabels).toStrictEqual([])
      expect(requests).toHaveLength(3)
    }),
  )

  it.effect('does not repeat a write that creates something after an outage, since GitHub may have applied it', () =>
    Effect.gen(function* () {
      const outage = { status: 502, body: { message: 'Bad Gateway' } }
      const { service, requests } = live({
        [`POST ${REPO}/issues/3/comments`]: [outage, { status: 201, body: { id: 1 } }],
        [`POST ${REPO}/pulls/7/reviews`]: outage,
        [`POST ${REPO}/labels`]: outage,
        [`POST ${REPO}/check-runs`]: outage,
        [`POST ${REPO}/rulesets`]: outage,
        [`POST /graphql`]: outage,
      })
      const github = yield* service
      const failures = yield* Effect.all(
        [
          github.createComment(3, 'hi'),
          github.createReview(7, { event: 'COMMENT', body: 'b' }),
          github.createLabel({ name: 'a', color: 'ffffff', description: '' }),
          github.createCheckRun({ name: 'n', headSha: 'h', status: 'in_progress', title: 't', summary: 's' }),
          github.repositoryRequest({ method: 'POST', path: '/rulesets', body: {} }),
          github.graphql('# note\nmutation { x }', {}),
        ].map(Effect.flip),
      )
      expect(failures.map((error) => error._tag)).toStrictEqual(Array.from({ length: 6 }, () => 'Unavailable'))
      expect(requests).toHaveLength(6)
    }),
  )

  it.effect('retries a write that creates something after a rate limit, which GitHub rejected before acting', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`POST ${REPO}/issues/3/comments`]: [
          { status: 429, body: { message: 'slow down' } },
          { status: 201, body: { id: 1, body: 'hi' } },
        ],
      })
      expect(yield* (yield* service).createComment(3, 'hi')).toMatchObject({ id: 1 })
      expect(requests).toHaveLength(2)
    }),
  )

  it.effect('fails a bad request or a GraphQL error at once instead of retrying it as an outage', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET ${REPO}/labels`]: { status: 400, body: { message: 'Problems parsing JSON' } },
        [`POST /graphql`]: [
          { body: { data: null, errors: [{ type: 'NOT_FOUND', message: 'Could not resolve to a Repository' }] } },
          { body: { data: null, errors: [{ type: 'RATE_LIMITED', message: 'API rate limit exceeded' }] } },
          { body: { data: { x: 1 } } },
        ],
      })
      const github = yield* service
      expect((yield* Effect.flip(github.listLabels))._tag).toBe('ValidationFailed')
      expect(yield* Effect.flip(github.graphql('query { x }', {}))).toMatchObject({
        _tag: 'ValidationFailed',
        operation: 'graphql',
      })
      expect(yield* github.graphql('query { x }', {})).toStrictEqual({ x: 1 })
      expect(requests.map(({ path }) => path)).toStrictEqual([`${REPO}/labels`, '/graphql', '/graphql', '/graphql'])
    }),
  )

  it.effect('gives up after the retries run out', () =>
    Effect.gen(function* () {
      const { service, requests } = live({ [`GET ${REPO}/labels`]: { status: 502, body: { message: 'Bad Gateway' } } })
      const error = yield* Effect.flip((yield* service).listLabels)
      expect(error._tag).toBe('Unavailable')
      expect(error.message).toContain('listLabels: GitHub unavailable')
      expect(requests).toHaveLength(3)
    }),
  )
})

describe('GitHubLive', () => {
  const provide = (env: Record<string, string>) =>
    Effect.provide(
      Layer.provide(GitHubLive, Layer.setConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))),
    )

  it.effect('reads the token and repository from config', () =>
    Effect.map(GitHub, (github) =>
      expect(github.coordinates).toStrictEqual({ owner: 'Resnovas', repo: 'smartcloud' }),
    ).pipe(provide({ GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'Resnovas/smartcloud' })),
  )

  it.effect('commits as a named committer, filling in the half not set from the default', () =>
    Effect.gen(function* () {
      const cases = [
        [{ SMARTCLOUD_COMMITTER_NAME: 'Ann' }, { name: 'Ann', email: DEFAULT_COMMITTER.email }],
        [{ SMARTCLOUD_COMMITTER_EMAIL: 'ann@example.com' }, { name: DEFAULT_COMMITTER.name, email: 'ann@example.com' }],
      ] as const
      for (const [env, identity] of cases) {
        const own = '/repos/Resnovas/smartcloud'
        const fake = fakeFetch({
          [`GET ${own}/git/ref/heads/main`]: { body: { object: { sha: 'base' } } },
          [`GET ${own}/git/commits/base`]: { body: { sha: 'base', tree: { sha: 'base-tree' }, parents: [] } },
          [`POST ${own}/git/blobs`]: { status: 201, body: { sha: 'blob' } },
          [`POST ${own}/git/trees`]: { status: 201, body: { sha: 'tree' } },
          [`GET ${own}/git/ref/heads/smartcloud/sync`]: { status: 404, body: { message: 'Not Found' } },
          [`POST ${own}/git/commits`]: {
            status: 201,
            body: { sha: 'commit', author: identity, verification: { verified: false } },
          },
          [`POST ${own}/git/refs`]: { status: 201, body: {} },
          [`GET ${own}/pulls`]: { body: [] },
          [`POST ${own}/pulls`]: { status: 201, body: { number: 1, html_url: 'u' } },
        })
        vi.stubGlobal('fetch', fake.fetch)
        const github = yield* GitHub.pipe(
          provide({ GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'Resnovas/smartcloud', ...env }),
        )
        yield* github.proposeChanges({
          branch: 'smartcloud/sync',
          base: 'main',
          title: 'chore(sync): sync files',
          body: 'Synced.',
          files: [{ path: 'LICENSE', content: 'MIT', executable: false }],
        })
        vi.unstubAllGlobals()
        const commit = fake.requests.find(
          (request) => request.method === 'POST' && request.path === `${own}/git/commits`,
        )
        expect(commit?.body).toMatchObject({
          message: signOff('chore(sync): sync files', identity),
          author: identity,
          committer: identity,
        })
      }
    }),
  )

  it.effect('rejects a malformed repository name', () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(GitHub.pipe(provide({ GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'smartcloud' })))
      expect(Exit.isFailure(exit) && String(exit.cause)).toContain('GITHUB_REPOSITORY must be owner/name')
    }),
  )
})
