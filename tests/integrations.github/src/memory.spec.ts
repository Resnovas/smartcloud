/**
 * @file tests/integrations.github/src/memory.spec.ts
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
import { Effect, Layer } from 'effect'
import {
  DryRun,
  DryRunLog,
  fileKey,
  fromGraphqlErrors,
  fromStatus,
  GitHub,
  GitHubMemory,
  isTrustedComment,
  makeMemoryGitHub,
} from '@resnovas/integrations.github'

const bug = { name: 'bug', color: 'd73a4a', description: '' }

describe('in-memory GitHub', () => {
  it.effect('behaves like GitHub for labels: unique, renames carry over, deletes clean up', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({ labels: [bug] })
      yield* service.addLabels(1, ['BUG', 'bug'])
      yield* service.addLabels(2, ['docs'])
      expect(state.issues.get(1)?.labels).toStrictEqual(['BUG'])
      expect((yield* Effect.flip(service.createLabel({ ...bug, name: 'Bug' })))._tag).toBe('ValidationFailed')
      yield* service.updateLabel('bug', { ...bug, name: 'defect' })
      expect(state.issues.get(1)?.labels).toStrictEqual(['defect'])
      expect(state.issues.get(2)?.labels).toStrictEqual(['docs'])
      expect((yield* Effect.flip(service.updateLabel('nope', bug)))._tag).toBe('NotFound')
      yield* service.createLabel(bug)
      yield* service.deleteLabel('defect')
      expect(state.labels.map((label) => label.name)).toStrictEqual(['bug'])
      expect(state.issues.get(1)?.labels).toStrictEqual([])
      expect((yield* Effect.flip(service.deleteLabel('defect')))._tag).toBe('NotFound')
      expect(yield* service.listLabels).toStrictEqual([bug])
    }),
  )

  it.effect('refuses to rename a label onto a name another label already has, ignoring case', () =>
    Effect.gen(function* () {
      const docs = { name: 'docs', color: '0075ca', description: '' }
      const { service, state } = makeMemoryGitHub({ labels: [bug, docs] })
      const error = yield* Effect.flip(service.updateLabel('docs', { ...docs, name: 'BUG' }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'label BUG already exists' })
      expect(state.labels).toStrictEqual([bug, docs])
      yield* service.updateLabel('bug', { ...bug, name: 'Bug', color: 'ffffff' })
      expect(state.labels.map((label) => label.name)).toStrictEqual(['Bug', 'docs'])
    }),
  )

  it.effect('removes labels, and fails to remove one that is not there', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      yield* service.addLabels(2, ['bug', 'docs'])
      yield* service.removeLabel(2, 'BUG')
      expect(state.issues.get(2)?.labels).toStrictEqual(['docs'])
      expect((yield* Effect.flip(service.removeLabel(2, 'bug')))._tag).toBe('NotFound')
    }),
  )

  it.effect('creates, lists and updates comments, and closes issues', () =>
    Effect.gen(function* () {
      const { service } = makeMemoryGitHub({
        openIssues: [
          { number: 3, title: 't', body: '', author: 'a', open: true, locked: false, labels: [], updatedAt: new Date(0), isPullRequest: false },
        ],
      })
      const comment = yield* service.createComment(3, 'first')
      yield* service.updateComment(comment.id, 'edited')
      expect(yield* service.listComments(3)).toStrictEqual([{ id: comment.id, body: 'edited', author: 'smartcloud[bot]', bot: true }])
      expect((yield* Effect.flip(service.updateComment(999, 'x')))._tag).toBe('NotFound')
      expect(yield* service.listOpenIssues).toHaveLength(1)
      yield* service.closeIssue(3)
      expect(yield* service.listOpenIssues).toHaveLength(0)
    }),
  )

  it.effect('serves pull request data and records reviews', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        pulls: new Map([[7, { commits: [], files: ['a.ts'], reviews: [{ author: 'ann', state: 'APPROVED' }], requestedReviewers: ['bo'], submittedReviews: [] }]]),
      })
      expect(yield* service.listCommits(7)).toStrictEqual([])
      expect(yield* service.listFiles(7)).toStrictEqual(['a.ts'])
      expect(yield* service.listReviews(7)).toHaveLength(1)
      expect(yield* service.countRequestedReviewers(7)).toBe(1)
      yield* service.requestReviewers(7, ['cy'])
      yield* service.createReview(7, { event: 'APPROVE', body: 'ok' })
      expect(state.pulls.get(7)).toMatchObject({ requestedReviewers: ['bo', 'cy'], submittedReviews: [{ event: 'APPROVE', body: 'ok' }] })
      const missing = yield* Effect.flip(service.listFiles(8))
      expect(missing.message).toBe('listFiles: not found (pull request #8)')
    }),
  )

  it.effect('records check runs, files, requests and GraphQL calls', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({ files: new Map([[fileKey('o', 'r', 'p.yml', 'v2'), 'version: 2']]) })
      const run = { name: 'n', headSha: 'h', status: 'in_progress' as const, title: 't', summary: 's' }
      const id = yield* service.createCheckRun(run)
      yield* service.updateCheckRun(id, { ...run, status: 'completed', conclusion: 'success' })
      expect(state.checkRuns).toStrictEqual([{ ...run, status: 'completed', conclusion: 'success', id }])
      expect((yield* Effect.flip(service.updateCheckRun(999, run)))._tag).toBe('NotFound')
      expect(yield* service.getFile({ owner: 'o', repo: 'r', path: 'p.yml', ref: 'v2' })).toBe('version: 2')
      expect((yield* Effect.flip(service.getFile({ owner: 'o', repo: 'r', path: 'p.yml' })))._tag).toBe('NotFound')
      yield* service.repositoryRequest({ method: 'PUT', path: '/vulnerability-alerts' })
      yield* service.graphql('query { viewer { login } }', {})
      expect(state.requests).toStrictEqual([{ method: 'PUT', path: '/vulnerability-alerts' }])
      expect(state.graphql).toHaveLength(1)
      expect((yield* service.getRepository).fullName).toBe('Resnovas/example')
    }),
  )
})

describe('in-memory GitHub: directories and proposals', () => {
  it.effect('lists the files under a directory at a ref, with their execute bits', () =>
    Effect.gen(function* () {
      const { service } = makeMemoryGitHub({
        files: new Map([
          [fileKey('o', 'r', 'templates/b.md', 'v2'), 'b'],
          [fileKey('o', 'r', 'templates/tools/run', 'v2'), 'run'],
          [fileKey('o', 'r', 'templates/a.md'), 'default branch'],
          [fileKey('o', 'r', 'other/c.md', 'v2'), 'c'],
        ]),
        executables: new Set([fileKey('o', 'r', 'templates/tools/run', 'v2')]),
      })
      expect(yield* service.listDirectory({ owner: 'o', repo: 'r', path: 'templates/', ref: 'v2' })).toStrictEqual([
        { path: 'b.md', executable: false },
        { path: 'tools/run', executable: true },
      ])
      expect(yield* service.listDirectory({ owner: 'o', repo: 'r', path: '' })).toStrictEqual([{ path: 'templates/a.md', executable: false }])
    }),
  )

  it.effect('opens a pull request for a proposal, updates it while open, and opens another once it is closed', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const proposal = { branch: 'smartcloud/sync', base: 'main', title: 't', body: 'b', files: [{ path: 'a', content: 'x', executable: false }] }
      const first = yield* service.proposeChanges(proposal)
      expect(first).toStrictEqual({ number: 1, url: 'https://github.com/Resnovas/example/pull/1', created: true })
      expect(yield* service.proposeChanges({ ...proposal, title: 'updated' })).toStrictEqual({ ...first, created: false })
      expect(state.proposals).toStrictEqual([{ ...proposal, title: 'updated', number: 1, open: true }])
      const [opened] = state.proposals
      if (opened !== undefined) opened.open = false
      expect((yield* service.proposeChanges(proposal)).number).toBe(2)
      expect(state.proposals).toHaveLength(2)
    }),
  )
})

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
      yield* github.createReview(7, { event: 'COMMENT', body: 'b' })
      yield* github.requestReviewers(7, ['ann'])
      const run = { name: 'n', headSha: 'h', status: 'completed' as const, conclusion: 'success' as const, title: 't', summary: 's' }
      expect(yield* github.createCheckRun(run)).toBe(0)
      yield* github.updateCheckRun(0, run)
      expect(yield* github.proposeChanges({ branch: 'b', base: 'main', title: 't', body: '', files: [] })).toStrictEqual({
        number: 0,
        url: '',
        created: false,
      })
      expect(yield* github.listDirectory({ owner: 'Resnovas', repo: 'example', path: '' })).toStrictEqual([])
      expect(yield* github.repositoryRequest({ method: 'PATCH', path: '', body: { has_wiki: false } })).toBeNull()
      yield* github.repositoryRequest({ method: 'GET', path: '/rulesets' })
      yield* github.graphql('mutation { x }', {})
      yield* github.graphql('query { y }', {})
      const writes = yield* log.writes
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
        'repositoryRequest',
        'graphql',
      ])
      expect(yield* github.listLabels).toStrictEqual([bug])
    }).pipe(Effect.provide(DryRun), Effect.provide(GitHubMemory({ labels: [bug] }))),
  )

  it.effect('records a GraphQL mutation wherever it sits in the document, and passes plain queries through', () => {
    const { service, state } = makeMemoryGitHub()
    const writes = [
      '# create the label\nmutation { createLabel(input: {}) { clientMutationId } }',
      'fragment Id on Repository { id }\nmutation Update { updateRepository(input: {}) { repository { ...Id } } }',
      'query Read { viewer { login } }\nmutation Write { x }',
      'subscription { x }',
      'query($a: String = "unclosed) { x }',
      'query { x(a: """unclosed) }',
      'query { x(a: "line\nbreak") }',
      'query { x',
      'query { x } }',
    ]
    const reads = [
      'query { viewer { login } }',
      '{ repository(name: "mutation") { id } }',
      '# mutation in a comment only\nquery { x }',
      'query($a: String = "say \\"mutation\\"") { x(b: """block \\""" mutation""") { y } }',
      'query Read($ids: [ID!]!) { nodes(ids: $ids) { id } } fragment F on Mutation { x }',
      'query { x } # trailing comment with no newline',
    ]
    return Effect.gen(function* () {
      const github = yield* GitHub
      const log = yield* DryRunLog
      for (const query of [...writes, ...reads]) yield* github.graphql(query, {})
      expect((yield* log.writes).map((write) => write.details['query'])).toStrictEqual(writes)
      expect(state.graphql.map((call) => call.query)).toStrictEqual(reads)
    }).pipe(Effect.provide(DryRun), Effect.provide(Layer.succeed(GitHub, service)))
  })
})

describe('fromStatus', () => {
  it('maps every status family', () => {
    expect(fromStatus('op', 404, 'x')._tag).toBe('NotFound')
    expect(fromStatus('op', 429, 'x')._tag).toBe('RateLimited')
    expect(fromStatus('op', 401, 'API rate limit exceeded')._tag).toBe('RateLimited')
    expect(fromStatus('op', 401, 'Bad credentials')._tag).toBe('Forbidden')
    expect(fromStatus('op', 409, 'x')._tag).toBe('ValidationFailed')
    expect(fromStatus('op', 400, 'x')._tag).toBe('ValidationFailed')
    expect(fromStatus('op', 410, 'x')._tag).toBe('ValidationFailed')
    expect(fromStatus('op', 408, 'x')._tag).toBe('Unavailable')
    expect(fromStatus('op', 503, 'x')._tag).toBe('Unavailable')
    expect(fromStatus('op', undefined, 'x')._tag).toBe('Unavailable')
  })

  it('writes messages that name the operation', () => {
    expect(fromStatus('listLabels', 404, 'Not Found').message).toBe('listLabels: not found (Not Found)')
    expect(fromStatus('listLabels', 403, 'nope').message).toBe('listLabels: forbidden (nope)')
    expect(fromStatus('listLabels', 429, 'slow down').message).toBe('listLabels: rate limited (slow down)')
    expect(fromStatus('createLabel', 422, 'exists').message).toBe('createLabel: rejected (exists)')
    expect(fromStatus('listLabels', 503, 'down').message).toBe('listLabels: GitHub unavailable (down)')
  })

  it('maps GraphQL errors: rate limits are retried, anything else is the request itself', () => {
    expect(fromGraphqlErrors('graphql', 'API rate limit exceeded')._tag).toBe('RateLimited')
    expect(fromGraphqlErrors('graphql', 'Field x does not exist')._tag).toBe('ValidationFailed')
  })
})

describe('isTrustedComment', () => {
  const by = (author: string, bot: boolean) => ({ id: 1, body: '<!-- smartcloud:report -->', author, bot })

  it('trusts bot accounts and listed logins, ignoring case and a leading @', () => {
    expect(isTrustedComment(by('smartcloud[bot]', true))).toBe(true)
    expect(isTrustedComment(by('Release-Robot', false), ['@release-robot'])).toBe(true)
    expect(isTrustedComment(by('@release-robot', false), ['Release-Robot'])).toBe(true)
  })

  it('does not trust a person, however their comment is worded', () => {
    expect(isTrustedComment(by('mallory', false))).toBe(false)
    expect(isTrustedComment(by('mallory', false), ['release-robot'])).toBe(false)
  })
})
