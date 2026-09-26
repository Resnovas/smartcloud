/**
 * @file tests/integrations.github/src/cache.spec.ts
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
import { Effect, Redacted, Ref, Schedule } from 'effect'
import { DEFAULT_COMMITTER, dryRunGitHub, makeLiveGitHub, type RecordedWrite } from '@resnovas/integrations.github'
import { fakeFetch, type Recorded, type Routes } from './fake-fetch.js'

// The live service routes every read through Effect Requests; these tests
// count the HTTP calls the fake fetch sees to prove what is shared, cached
// and invalidated.

const REPO = '/repos/Resnovas/example'

const live = (routes: Routes) => {
  const fake = fakeFetch(routes)
  const service = makeLiveGitHub({
    token: Redacted.make('test-token'),
    coordinates: { owner: 'Resnovas', repo: 'example' },
    fetch: fake.fetch,
    retry: Schedule.recurs(2),
    // One read per call, so the counts below show what the cache shares.
    mergeablePoll: Schedule.stop,
  })
  const calls = (method: string, path: string) =>
    fake.requests.filter((request: Recorded) => request.method === method && request.path === path).length
  return { service, requests: fake.requests, calls }
}

const label = (name: string) => ({ name, color: 'ffffff', description: null })
const issue = (number: number, labels: ReadonlyArray<string>) => ({
  number,
  title: 't',
  body: null,
  user: null,
  state: 'open',
  locked: false,
  labels,
  updated_at: '2026-01-01T00:00:00Z',
})

describe('cached reads: sharing and caching', () => {
  it.effect('makes each distinct read once, however often or concurrently it is asked for', () =>
    Effect.gen(function* () {
      const { service, requests, calls } = live({
        [`GET ${REPO}`]: {
          body: {
            owner: { login: 'Resnovas' },
            name: 'example',
            full_name: 'Resnovas/example',
            node_id: 'R_1',
            private: false,
            default_branch: 'main',
          },
        },
        [`GET ${REPO}/labels`]: { body: [label('bug')] },
        [`GET ${REPO}/issues`]: { body: [issue(1, ['bug'])] },
        [`GET ${REPO}/issues/3/comments`]: { body: [{ id: 1, body: 'a', user: null }] },
        [`GET ${REPO}/issues/4/comments`]: { body: [] },
      })
      const github = yield* service
      // Concurrent equal reads wait on the same call.
      const concurrent = yield* Effect.all([github.listLabels, github.listLabels, github.listLabels], {
        concurrency: 'unbounded',
      })
      expect(concurrent.map((labels) => labels.map(({ name }) => name))).toStrictEqual([['bug'], ['bug'], ['bug']])
      // With batching on, the reads go out together, still one call per distinct read.
      yield* Effect.all(
        [
          github.getRepository,
          github.listOpenIssues,
          github.listComments(3),
          github.listComments(3),
          github.listComments(4),
        ],
        {
          batching: true,
        },
      )
      yield* github.getRepository
      yield* github.listOpenIssues
      yield* github.listLabels
      yield* github.listComments(3)
      expect(calls('GET', REPO)).toBe(1)
      expect(calls('GET', `${REPO}/labels`)).toBe(1)
      expect(calls('GET', `${REPO}/issues`)).toBe(1)
      expect(calls('GET', `${REPO}/issues/3/comments`)).toBe(1)
      expect(calls('GET', `${REPO}/issues/4/comments`)).toBe(1)
      expect(requests).toHaveLength(5)
    }),
  )

  it.effect('keys file reads by location and ref, not by object identity', () =>
    Effect.gen(function* () {
      const content = { type: 'file', encoding: 'base64', content: Buffer.from('x').toString('base64') }
      const { service, requests, calls } = live({
        [`GET /repos/Resnovas/.github/contents/a.yml`]: { body: content },
        [`GET /repos/Resnovas/.github/git/trees/HEAD:templates`]: { body: { truncated: false, tree: [] } },
      })
      const github = yield* service
      const location = { owner: 'Resnovas', repo: '.github', path: 'a.yml' }
      yield* github.getFile(location)
      yield* github.getFile({ owner: 'Resnovas', repo: '.github', path: 'a.yml' })
      yield* github.getFile({ ...location, ref: 'v2' })
      yield* github.getFile({ ...location, ref: 'v2' })
      yield* github.listDirectory({ owner: 'Resnovas', repo: '.github', path: 'templates' })
      yield* github.listDirectory({ owner: 'Resnovas', repo: '.github', path: 'templates' })
      expect(calls('GET', '/repos/Resnovas/.github/contents/a.yml')).toBe(2)
      expect(requests.map(({ query }) => query).slice(0, 2)).toStrictEqual(['', '?ref=v2'])
      expect(calls('GET', '/repos/Resnovas/.github/git/trees/HEAD:templates')).toBe(1)
    }),
  )

  it.effect('does not cache a failed read, so the next one tries again', () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/labels`]: [{ status: 404, body: { message: 'Not Found' } }, { body: [label('bug')] }],
      })
      const github = yield* service
      expect((yield* Effect.flip(github.listLabels))._tag).toBe('NotFound')
      expect(yield* github.listLabels).toHaveLength(1)
      yield* github.listLabels
      expect(calls('GET', `${REPO}/labels`)).toBe(2)
    }),
  )
})

describe('cached reads: invalidation after writes', () => {
  it.effect('label writes invalidate the labels, and renames and deletions the open issues', () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/labels`]: [{ body: [] }, { body: [label('bug')] }, { body: [label('defect')] }, { body: [] }],
        [`GET ${REPO}/issues`]: { body: [issue(1, [])] },
        [`POST ${REPO}/labels`]: { status: 201, body: {} },
        [`PATCH ${REPO}/labels/bug`]: { body: {} },
        [`DELETE ${REPO}/labels/defect`]: { status: 204 },
      })
      const github = yield* service
      yield* github.listOpenIssues
      expect(yield* github.listLabels).toStrictEqual([])
      yield* github.createLabel({ name: 'bug', color: 'ffffff', description: '' })
      expect((yield* github.listLabels).map(({ name }) => name)).toStrictEqual(['bug'])
      yield* github.listOpenIssues
      expect(calls('GET', `${REPO}/issues`)).toBe(1)
      yield* github.updateLabel('bug', { name: 'defect', color: 'ffffff', description: '' })
      expect((yield* github.listLabels).map(({ name }) => name)).toStrictEqual(['defect'])
      yield* github.listOpenIssues
      yield* github.deleteLabel('defect')
      expect(yield* github.listLabels).toStrictEqual([])
      yield* github.listOpenIssues
      expect(calls('GET', `${REPO}/labels`)).toBe(4)
      expect(calls('GET', `${REPO}/issues`)).toBe(3)
    }),
  )

  it.effect("labelling an issue or closing it invalidates the open issues but not the repository's labels", () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/labels`]: { body: [label('bug')] },
        [`GET ${REPO}/issues`]: [
          { body: [issue(3, [])] },
          { body: [issue(3, ['bug'])] },
          { body: [issue(3, [])] },
          { body: [] },
        ],
        [`POST ${REPO}/issues/3/labels`]: { body: [] },
        [`DELETE ${REPO}/issues/3/labels/bug`]: { body: [] },
        [`PATCH ${REPO}/issues/3`]: { body: {} },
      })
      const github = yield* service
      const labelsOf = Effect.map(github.listOpenIssues, (issues) => issues.map(({ labels }) => labels))
      yield* github.listLabels
      expect(yield* labelsOf).toStrictEqual([[]])
      yield* github.addLabels(3, ['bug'])
      expect(yield* labelsOf).toStrictEqual([['bug']])
      yield* github.removeLabel(3, 'bug')
      expect(yield* labelsOf).toStrictEqual([[]])
      yield* github.closeIssue(3)
      expect(yield* labelsOf).toStrictEqual([])
      yield* github.listLabels
      expect(calls('GET', `${REPO}/issues`)).toBe(4)
      expect(calls('GET', `${REPO}/labels`)).toBe(1)
    }),
  )

  it.effect("a new comment invalidates that issue's comments, and an edit every issue's", () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/issues/3/comments`]: [
          { body: [] },
          { body: [{ id: 10, body: 'hi', user: null }] },
          { body: [{ id: 10, body: 'edited', user: null }] },
        ],
        [`GET ${REPO}/issues/4/comments`]: { body: [] },
        [`POST ${REPO}/issues/3/comments`]: { status: 201, body: { id: 10, body: 'hi', user: null } },
        [`PATCH ${REPO}/issues/comments/10`]: { body: {} },
      })
      const github = yield* service
      const bodies = Effect.map(github.listComments(3), (comments) => comments.map(({ body }) => body))
      expect(yield* bodies).toStrictEqual([])
      yield* github.listComments(4)
      yield* github.createComment(3, 'hi')
      expect(yield* bodies).toStrictEqual(['hi'])
      yield* github.listComments(4)
      expect(calls('GET', `${REPO}/issues/4/comments`)).toBe(1)
      yield* github.updateComment(10, 'edited')
      expect(yield* bodies).toStrictEqual(['edited'])
      yield* github.listComments(4)
      expect(calls('GET', `${REPO}/issues/3/comments`)).toBe(3)
      expect(calls('GET', `${REPO}/issues/4/comments`)).toBe(2)
    }),
  )

  it.effect(
    'a review invalidates the reviews and requested reviewers, and a review request the requested reviewers only',
    () =>
      Effect.gen(function* () {
        const { service, calls } = live({
          [`GET ${REPO}/pulls/7/commits`]: { body: [] },
          [`GET ${REPO}/pulls/7/files`]: { body: [] },
          [`GET ${REPO}/pulls/7`]: { body: { mergeable: true } },
          [`GET ${REPO}/pulls/7/reviews`]: [{ body: [] }, { body: [{ user: { login: 'bot' }, state: 'COMMENTED' }] }],
          [`GET ${REPO}/pulls/7/requested_reviewers`]: [
            { body: { users: [], teams: [] } },
            { body: { users: [], teams: [] } },
            { body: { users: [{ login: 'ann' }], teams: [] } },
            { body: { users: [{ login: 'ann' }], teams: [] } },
            { body: { users: [], teams: [] } },
            { body: { users: [], teams: [] } },
          ],
          [`POST ${REPO}/pulls/7/requested_reviewers`]: { status: 201, body: {} },
          [`POST ${REPO}/pulls/7/reviews`]: { body: {} },
        })
        const github = yield* service
        const read = Effect.all([
          github.listCommits(7),
          github.listFiles(7),
          github.listReviews(7),
          github.countRequestedReviewers(7),
          github.listRequestedReviewers(7),
          github.getMergeable(7),
        ])
        yield* read
        yield* github.requestReviewers(7, ['ann'])
        expect(yield* github.countRequestedReviewers(7)).toBe(1)
        expect(yield* github.listRequestedReviewers(7)).toStrictEqual(['ann'])
        expect(yield* github.listReviews(7)).toStrictEqual([])
        yield* github.createReview(7, { event: 'COMMENT', body: 'b' })
        expect(yield* github.listReviews(7)).toStrictEqual([{ author: 'bot', state: 'COMMENTED' }])
        expect(yield* github.countRequestedReviewers(7)).toBe(0)
        expect(yield* github.listRequestedReviewers(7)).toStrictEqual([])
        yield* read
        expect(calls('GET', `${REPO}/pulls/7/commits`)).toBe(1)
        expect(calls('GET', `${REPO}/pulls/7/files`)).toBe(1)
        expect(calls('GET', `${REPO}/pulls/7`)).toBe(1)
        expect(calls('GET', `${REPO}/pulls/7/reviews`)).toBe(2)
        expect(calls('GET', `${REPO}/pulls/7/requested_reviewers`)).toBe(6)
      }),
  )

  it.effect('a proposal invalidates file and directory reads, the open issues, pull request reads and checks', () =>
    Effect.gen(function* () {
      const file = (text: string) => ({
        body: { type: 'file', encoding: 'base64', content: Buffer.from(text).toString('base64') },
      })
      const pull = (mergeable: boolean) => ({ body: { mergeable, head: { sha: 'head' } } })
      const { service, calls } = live({
        [`GET ${REPO}/contents/LICENSE`]: [file('old'), file('new')],
        [`GET ${REPO}/git/trees/HEAD:`]: { body: { truncated: false, tree: [] } },
        [`GET ${REPO}/issues`]: { body: [] },
        [`GET ${REPO}/git/ref/heads/main`]: { body: { object: { sha: 'base' } } },
        [`GET ${REPO}/git/commits/base`]: { body: { sha: 'base', tree: { sha: 'base-tree' }, parents: [] } },
        [`POST ${REPO}/git/blobs`]: { status: 201, body: { sha: 'blob' } },
        [`POST ${REPO}/git/trees`]: { status: 201, body: { sha: 'tree' } },
        [`GET ${REPO}/git/ref/heads/sync`]: { status: 404, body: { message: 'Not Found' } },
        [`POST ${REPO}/git/commits`]: {
          status: 201,
          body: { sha: 'commit', author: DEFAULT_COMMITTER, verification: { verified: true } },
        },
        [`POST ${REPO}/git/refs`]: { status: 201, body: {} },
        [`GET ${REPO}/pulls`]: { body: [] },
        [`POST ${REPO}/pulls`]: { status: 201, body: { number: 5, html_url: 'u' } },
        // Mergeability and then the checks read the pull request, before and after the proposal.
        [`GET ${REPO}/pulls/5`]: [pull(true), pull(true), pull(false), pull(false)],
        [`GET ${REPO}/commits/head/check-runs`]: { body: { total_count: 0, check_runs: [] } },
        [`GET ${REPO}/commits/head/statuses`]: { body: [] },
      })
      const github = yield* service
      const read = Effect.all([
        github.getFile({ owner: 'Resnovas', repo: 'example', path: 'LICENSE' }),
        github.listDirectory({ owner: 'Resnovas', repo: 'example', path: '' }),
        github.listOpenIssues,
        github.getMergeable(5),
        github.listChecks(5),
      ])
      expect((yield* read)[0]).toBe('old')
      yield* read
      yield* github.proposeChanges({
        branch: 'sync',
        base: 'main',
        title: 't',
        body: 'b',
        files: [{ path: 'LICENSE', content: 'new', executable: false }],
      })
      const after = yield* read
      expect(after[0]).toBe('new')
      expect(after[3]).toBe('CONFLICTING')
      expect(calls('GET', `${REPO}/pulls/5`)).toBe(4)
      expect(calls('GET', `${REPO}/commits/head/check-runs`)).toBe(2)
      expect(calls('GET', `${REPO}/contents/LICENSE`)).toBe(2)
      expect(calls('GET', `${REPO}/git/trees/HEAD:`)).toBe(2)
      expect(calls('GET', `${REPO}/issues`)).toBe(2)
    }),
  )

  it.effect("a check run write invalidates the checks, since smartcloud's own run is one of them", () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/pulls/7`]: { body: { head: { sha: 'head' } } },
        [`GET ${REPO}/commits/head/check-runs`]: { body: { total_count: 0, check_runs: [] } },
        [`GET ${REPO}/commits/head/statuses`]: { body: [] },
        [`POST ${REPO}/check-runs`]: { status: 201, body: { id: 1 } },
        [`PATCH ${REPO}/check-runs/1`]: { body: {} },
      })
      const github = yield* service
      const run = { name: 'n', headSha: 'head', status: 'in_progress', title: 't', summary: 's' } as const
      yield* Effect.all([github.listChecks(7), github.listChecks(7)])
      expect(calls('GET', `${REPO}/commits/head/check-runs`)).toBe(1)
      yield* github.createCheckRun(run)
      yield* github.listChecks(7)
      yield* github.updateCheckRun(1, run)
      yield* github.listChecks(7)
      expect(calls('GET', `${REPO}/commits/head/check-runs`)).toBe(3)
      expect(calls('GET', `${REPO}/commits/head/statuses`)).toBe(3)
    }),
  )

  it.effect('an unknown mergeability is not cached', () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/pulls/7`]: [{ body: { mergeable: null } }, { body: { mergeable: false } }],
      })
      const github = yield* service
      expect(yield* github.getMergeable(7)).toBe('UNKNOWN')
      expect(yield* github.getMergeable(7)).toBe('CONFLICTING')
      expect(yield* github.getMergeable(7)).toBe('CONFLICTING')
      expect(calls('GET', `${REPO}/pulls/7`)).toBe(2)
    }),
  )

  it.effect('a failed write still invalidates, since GitHub may have applied it', () =>
    Effect.gen(function* () {
      const { service, calls } = live({
        [`GET ${REPO}/labels`]: { body: [] },
        [`POST ${REPO}/labels`]: { status: 502, body: { message: 'Bad Gateway' } },
      })
      const github = yield* service
      yield* github.listLabels
      yield* Effect.flip(github.createLabel({ name: 'bug', color: 'ffffff', description: '' }))
      yield* github.listLabels
      expect(calls('GET', `${REPO}/labels`)).toBe(2)
    }),
  )
})

describe('cached reads: repository requests and GraphQL', () => {
  it.effect(
    'caches repository GETs, which every write invalidates, and a raw write or mutation invalidates everything',
    () =>
      Effect.gen(function* () {
        const { service, calls } = live({
          [`GET ${REPO}/rulesets`]: { body: [] },
          [`GET ${REPO}/labels`]: { body: [] },
          [`POST ${REPO}/check-runs`]: { status: 201, body: { id: 1 } },
          [`PATCH ${REPO}/check-runs/1`]: { body: {} },
          [`PATCH ${REPO}`]: { body: {} },
          [`POST /graphql`]: { body: { data: { x: 1 } } },
        })
        const github = yield* service
        const rulesets = github.repositoryRequest({ method: 'GET', path: '/rulesets' })
        const run = { name: 'n', headSha: 'h', status: 'in_progress', title: 't', summary: 's' } as const
        yield* Effect.all([rulesets, rulesets, github.listLabels])
        // A GET with a body is never cached.
        yield* github.repositoryRequest({ method: 'GET', path: '/rulesets', body: {} })
        expect(calls('GET', `${REPO}/rulesets`)).toBe(2)
        yield* github.createCheckRun(run)
        yield* rulesets
        yield* github.updateCheckRun(1, run)
        yield* rulesets
        yield* github.listLabels
        expect(calls('GET', `${REPO}/rulesets`)).toBe(4)
        expect(calls('GET', `${REPO}/labels`)).toBe(1)
        yield* github.repositoryRequest({ method: 'PATCH', path: '', body: { has_wiki: false } })
        yield* github.listLabels
        yield* rulesets
        expect(calls('GET', `${REPO}/labels`)).toBe(2)
        expect(calls('GET', `${REPO}/rulesets`)).toBe(5)
        // A GraphQL query is not cached; a mutation invalidates everything.
        yield* github.graphql('query { x }', {})
        yield* github.graphql('query { x }', {})
        yield* github.graphql('mutation { x }', {})
        yield* github.listLabels
        expect(calls('POST', '/graphql')).toBe(3)
        expect(calls('GET', `${REPO}/labels`)).toBe(3)
      }),
  )
})

describe('cached reads: dry run', () => {
  it.effect('passes reads through to the cache and records writes without making them', () =>
    Effect.gen(function* () {
      const { service, requests, calls } = live({ [`GET ${REPO}/labels`]: { body: [] } })
      const log = yield* Ref.make<ReadonlyArray<RecordedWrite>>([])
      const github = dryRunGitHub(yield* service, log)
      yield* github.listLabels
      yield* github.createLabel({ name: 'bug', color: 'ffffff', description: '' })
      yield* github.listLabels
      expect(calls('GET', `${REPO}/labels`)).toBe(1)
      expect(requests).toHaveLength(1)
      expect((yield* Ref.get(log)).map(({ operation }) => operation)).toStrictEqual(['createLabel'])
    }),
  )
})
