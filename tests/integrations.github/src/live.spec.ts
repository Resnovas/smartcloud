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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { ConfigProvider, Effect, Exit, Layer, Redacted, Schedule } from 'effect'
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
          body: { owner: { login: 'Resnovas' }, name: 'example', full_name: 'Resnovas/example', node_id: 'R_1', private: true, default_branch: 'main' },
        },
      })
      expect(yield* (yield* service).getRepository).toStrictEqual({
        owner: 'Resnovas',
        name: 'example',
        fullName: 'Resnovas/example',
        nodeId: 'R_1',
        private: true,
        defaultBranch: 'main',
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
        { method: 'POST', path: `${REPO}/labels`, body: { name: 'docs', color: '0075ca', description: 'Documentation' } },
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
        [`GET ${REPO}/issues/3/comments`]: { body: [{ id: 9, body: null, user: null }] },
        [`POST ${REPO}/issues/3/comments`]: [
          { status: 201, body: { id: 10, body: 'hi', user: { login: 'bot' } } },
          { status: 201, body: { id: 11, body: null, user: null } },
        ],
        [`PATCH ${REPO}/issues/comments/10`]: { body: {} },
        [`PATCH ${REPO}/issues/3`]: { body: {} },
      })
      const github = yield* service
      yield* github.addLabels(3, ['bug'])
      yield* github.removeLabel(3, 'bug')
      expect(yield* github.listComments(3)).toStrictEqual([{ id: 9, body: '', author: '' }])
      expect(yield* github.createComment(3, 'hi')).toStrictEqual({ id: 10, body: 'hi', author: 'bot' })
      yield* github.updateComment(10, 'edited')
      yield* github.closeIssue(3)
      expect(yield* github.createComment(3, '')).toStrictEqual({ id: 11, body: '', author: '' })
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
            { number: 1, title: 'a', body: null, user: null, state: 'open', locked: false, labels: ['bug', { name: 'stale' }, {}], updated_at: '2026-01-01T00:00:00Z' },
            { number: 2, title: 'b', body: 'x', user: { login: 'jane' }, state: 'open', locked: true, labels: [], updated_at: '2026-01-02T00:00:00Z', pull_request: {} },
          ],
        },
      })
      const issues = yield* (yield* service).listOpenIssues
      expect(issues).toStrictEqual([
        { number: 1, title: 'a', body: '', author: '', open: true, locked: false, labels: ['bug', 'stale', ''], updatedAt: new Date('2026-01-01T00:00:00Z'), isPullRequest: false },
        { number: 2, title: 'b', body: 'x', author: 'jane', open: true, locked: true, labels: [], updatedAt: new Date('2026-01-02T00:00:00Z'), isPullRequest: true },
      ])
      expect(requests[0]?.query).toContain('state=open')
    }),
  )
})

describe('live GitHub: pull requests', () => {
  const routes: Routes = {
    [`GET ${REPO}/pulls/7/commits`]: {
      body: [
        { sha: 'a', commit: { message: 'feat: x', author: { name: 'Jane', email: 'jane@example.com' } }, parents: [{}] },
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
    [`GET ${REPO}/pulls/7/requested_reviewers`]: { body: { users: [{}], teams: [{}, {}] } },
    [`POST ${REPO}/pulls/7/reviews`]: { body: {} },
    [`POST ${REPO}/pulls/7/requested_reviewers`]: { status: 201, body: {} },
  }

  it.effect('reads commits, files, reviews and requested reviewers, once each', () =>
    Effect.gen(function* () {
      const { service, requests } = live(routes)
      const github = yield* service
      expect(yield* github.listCommits(7)).toStrictEqual([
        { sha: 'a', message: 'feat: x', authorName: 'Jane', authorEmail: 'jane@example.com', parents: 1 },
        { sha: 'b', message: 'Merge', authorName: '', authorEmail: '', parents: 2 },
      ])
      expect(yield* github.listFiles(7)).toStrictEqual(['src/a.ts'])
      // An unknown review state neither approves nor blocks.
      expect(yield* github.listReviews(7)).toStrictEqual([
        { author: 'ann', state: 'APPROVED' },
        { author: '', state: 'COMMENTED' },
      ])
      expect(yield* github.countRequestedReviewers(7)).toBe(3)
      yield* github.listCommits(7)
      yield* github.listFiles(7)
      yield* github.listReviews(7)
      yield* github.countRequestedReviewers(7)
      expect(requests).toHaveLength(4)
    }),
  )

  it.effect('submits reviews and requests reviewers', () =>
    Effect.gen(function* () {
      const { service, requests } = live(routes)
      const github = yield* service
      yield* github.createReview(7, { event: 'COMMENT', body: 'Looks fine' })
      yield* github.requestReviewers(7, ['ann'])
      expect(requests.map(({ body }) => body)).toStrictEqual([{ event: 'COMMENT', body: 'Looks fine' }, { reviewers: ['ann'] }])
    }),
  )
})

describe('live GitHub: checks, files, settings and GraphQL', () => {
  it.effect('creates and updates check runs, capping annotations at 50', () =>
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
      yield* github.updateCheckRun(42, { name: 'smartcloud', headSha: 'abc', status: 'completed', conclusion: 'success', title: 't', summary: 's' })
      yield* github.createCheckRun({ name: 'smartcloud', headSha: 'abc', status: 'completed', conclusion: 'neutral', title: 't', summary: 's' })
      yield* github.updateCheckRun(42, { name: 'smartcloud', headSha: 'abc', status: 'in_progress', title: 't', summary: 's' })
      expect(requests[2]?.body).toMatchObject({ conclusion: 'neutral' })
      expect(requests[3]?.body).not.toHaveProperty('conclusion')
      expect(requests[0]?.body).toMatchObject({ head_sha: 'abc', status: 'in_progress', output: { title: 't', summary: 's' } })
      expect(requests[0]?.body).toHaveProperty(['output', 'annotations', '0'], {
        path: 'a.ts',
        start_line: 1,
        end_line: 1,
        annotation_level: 'warning',
        message: 'm',
        title: 'x',
      })
      expect(JSON.stringify(requests[0]?.body).match(/"path":"a\.ts"/g)).toHaveLength(50)
      expect(requests[1]?.body).toMatchObject({ conclusion: 'success', output: { annotations: [] } })
    }),
  )

  it.effect('reads a file at a ref, and refuses a directory', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`GET /repos/Resnovas/.github/contents/smartcloud/house.yml`]: {
          body: { type: 'file', content: Buffer.from('version: 2\n').toString('base64') },
        },
        [`GET /repos/Resnovas/.github/contents/templates`]: { body: [{ type: 'file' }] },
      })
      const github = yield* service
      expect(yield* github.getFile({ owner: 'Resnovas', repo: '.github', path: 'smartcloud/house.yml', ref: 'main' })).toBe('version: 2\n')
      expect(requests[0]?.query).toBe('?ref=main')
      const error = yield* Effect.flip(github.getFile({ owner: 'Resnovas', repo: '.github', path: 'templates' }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'templates is not a file' })
    }),
  )

  it.effect('makes repository-scoped requests and GraphQL calls', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        [`PATCH ${REPO}`]: { body: { ok: true } },
        [`POST /graphql`]: { body: { data: { repository: { id: 'R_1' } } } },
      })
      const github = yield* service
      expect(yield* github.repositoryRequest({ method: 'PATCH', path: '', body: { has_wiki: false } })).toStrictEqual({ ok: true })
      expect(yield* github.graphql('query($id: ID!) { node(id: $id) { id } }', { id: 'R_1' })).toStrictEqual({ repository: { id: 'R_1' } })
      expect(requests[0]?.body).toStrictEqual({ has_wiki: false })
      expect(requests[1]?.body).toMatchObject({ variables: { id: 'R_1' } })
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
      const entries = yield* (yield* service).listDirectory({ owner: 'Resnovas', repo: '.github', path: '/templates/', ref: 'v2' })
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
    [`POST ${REPO}/git/blobs`]: [{ status: 201, body: { sha: 'blob-1' } }, { status: 201, body: { sha: 'blob-2' } }],
    [`POST ${REPO}/git/trees`]: { status: 201, body: { sha: 'new-tree' } },
    [`POST ${REPO}/git/commits`]: { status: 201, body: { sha: 'new-commit' } },
  }

  it.effect('builds a signed-off commit on the base, creates the branch and opens a pull request', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        ...baseRoutes,
        [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { status: 404, body: { message: 'Not Found' } },
        [`POST ${REPO}/git/refs`]: { status: 201, body: {} },
        [`GET ${REPO}/pulls`]: { body: [] },
        [`POST ${REPO}/pulls`]: { status: 201, body: { number: 5, html_url: 'https://github.com/Resnovas/example/pull/5' } },
      })
      const result = yield* (yield* service).proposeChanges({ ...proposal, deletions: ['OLD.md'] })
      expect(result).toStrictEqual({ number: 5, url: 'https://github.com/Resnovas/example/pull/5', created: true })
      const sent = (method: string, path: string) => requests.filter((request) => request.method === method && request.path === path)
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
        author: DEFAULT_COMMITTER,
        committer: DEFAULT_COMMITTER,
      })
      expect(sent('POST', `${REPO}/git/refs`)[0]?.body).toStrictEqual({ ref: 'refs/heads/smartcloud/sync', sha: 'new-commit' })
      expect(sent('GET', `${REPO}/pulls`)[0]?.query).toContain('head=Resnovas%3Asmartcloud%2Fsync')
      expect(sent('POST', `${REPO}/pulls`)[0]?.body).toStrictEqual({ head: 'smartcloud/sync', base: 'main', title: proposal.title, body: 'Synced.' })
    }),
  )

  it.effect('resets an existing branch as the configured committer, and updates the open pull request', () =>
    Effect.gen(function* () {
      const bot = { name: 'smartcloud[bot]', email: '1+smartcloud[bot]@users.noreply.github.com' }
      const { service, requests } = live(
        {
          ...baseRoutes,
          [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { body: { object: { sha: 'old-commit' } } },
          [`GET ${REPO}/git/commits/old-commit`]: { body: { sha: 'old-commit', tree: { sha: 'old-tree' }, parents: [{ sha: 'base' }] } },
          [`PATCH ${REPO}/git/refs/heads/smartcloud/sync`]: { body: {} },
          [`GET ${REPO}/pulls`]: { body: [{ number: 9, html_url: 'https://github.com/Resnovas/example/pull/9' }] },
          [`PATCH ${REPO}/pulls/9`]: { body: {} },
        },
        bot,
      )
      const result = yield* (yield* service).proposeChanges(proposal)
      expect(result).toStrictEqual({ number: 9, url: 'https://github.com/Resnovas/example/pull/9', created: false })
      expect(requests.find((request) => request.path === `${REPO}/git/commits` && request.method === 'POST')?.body).toMatchObject({
        message: signOff(proposal.title, bot),
        author: bot,
        committer: bot,
      })
      expect(requests.find((request) => request.method === 'PATCH' && request.path.endsWith('smartcloud/sync'))?.body).toStrictEqual({
        sha: 'new-commit',
        force: true,
      })
      expect(requests.at(-1)?.body).toStrictEqual({ title: proposal.title, body: 'Synced.' })
    }),
  )

  it.effect('leaves a branch that already holds the same changes on the same base', () =>
    Effect.gen(function* () {
      const { service, requests } = live({
        ...baseRoutes,
        [`GET ${REPO}/git/ref/heads/smartcloud/sync`]: { body: { object: { sha: 'old-commit' } } },
        [`GET ${REPO}/git/commits/old-commit`]: { body: { sha: 'old-commit', tree: { sha: 'new-tree' }, parents: [{ sha: 'base' }] } },
        [`GET ${REPO}/pulls`]: { body: [{ number: 9, html_url: 'u' }] },
        [`PATCH ${REPO}/pulls/9`]: { body: {} },
      })
      expect((yield* (yield* service).proposeChanges(proposal)).created).toBe(false)
      expect(requests.some((request) => request.method === 'POST' && request.path === `${REPO}/git/commits`)).toBe(false)
      expect(requests.some((request) => request.method === 'PATCH' && request.path.includes('/git/refs/'))).toBe(false)
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
      expect((yield* Effect.flip(github.createLabel({ name: 'a', color: 'ffffff', description: '' })))._tag).toBe('ValidationFailed')
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
    Effect.provide(Layer.provide(GitHubLive, Layer.setConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))))

  it.effect('reads the token and repository from config', () =>
    Effect.map(GitHub, (github) => expect(github.coordinates).toStrictEqual({ owner: 'Resnovas', repo: 'smartcloud' })).pipe(
      provide({ GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'Resnovas/smartcloud' }),
    ),
  )

  it.effect('rejects a malformed repository name', () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(GitHub.pipe(provide({ GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'smartcloud' })))
      expect(Exit.isFailure(exit) && String(exit.cause)).toContain('GITHUB_REPOSITORY must be owner/name')
    }),
  )
})
