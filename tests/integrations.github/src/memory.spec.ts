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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { fileKey, makeMemoryGitHub, refKey } from '@resnovas/integrations.github'

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
          {
            number: 3,
            title: 't',
            body: '',
            author: 'a',
            open: true,
            locked: false,
            labels: [],
            updatedAt: new Date(0),
            isPullRequest: false,
          },
        ],
      })
      const comment = yield* service.createComment(3, 'first')
      yield* service.updateComment(comment.id, 'edited')
      expect(yield* service.listComments(3)).toStrictEqual([
        { id: comment.id, body: 'edited', author: 'smartcloud[bot]', bot: true },
      ])
      expect((yield* Effect.flip(service.updateComment(999, 'x')))._tag).toBe('NotFound')
      expect(yield* service.listOpenIssues).toHaveLength(1)
      yield* service.closeIssue(3)
      expect(yield* service.listOpenIssues).toHaveLength(0)
    }),
  )

  it.effect('reads the reactions seeded on an issue, and none on any other', () =>
    Effect.gen(function* () {
      const none = { '+1': 0, '-1': 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0 }
      const { service } = makeMemoryGitHub({
        issues: new Map([[3, { labels: [], comments: [], open: true, reactions: { ...none, '+1': 6 } }]]),
      })
      expect(yield* service.getReactions(3)).toStrictEqual({ ...none, '+1': 6 })
      expect(yield* service.getReactions(4)).toStrictEqual(none)
    }),
  )

  it.effect('lists closed, unlocked items closed before a time, and locks them', () =>
    Effect.gen(function* () {
      const closed = (number: number, isPullRequest: boolean, closedAt: number, locked = false) => ({
        number,
        title: 't',
        body: '',
        author: 'a',
        open: false,
        locked,
        labels: [],
        updatedAt: new Date(closedAt),
        closedAt: new Date(closedAt),
        isPullRequest,
      })
      const { service, state } = makeMemoryGitHub({
        closedIssues: [closed(1, false, 0), closed(2, true, 0), closed(3, false, 100), closed(4, false, 0, true)],
      })
      const numbers = (kind: 'issue' | 'pullRequest') =>
        Effect.map(service.listClosedUnlocked(kind, new Date(50)), (items) => items.map((item) => item.number))
      expect(yield* numbers('issue')).toStrictEqual([1])
      expect(yield* numbers('pullRequest')).toStrictEqual([2])
      yield* service.lockIssue(1, 'resolved')
      yield* service.lockIssue(2)
      expect(state.issues.get(1)).toMatchObject({ locked: true, lockReason: 'resolved' })
      expect(state.issues.get(2)?.lockReason).toBeUndefined()
      expect(yield* numbers('issue')).toStrictEqual([])
      expect(yield* numbers('pullRequest')).toStrictEqual([])
    }),
  )

  it.effect('reads seeded commits, and opens, keeps or stops backports', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        gitCommits: new Map([['abc', { sha: 'abc', message: 'fix: x', parents: ['p'] }]]),
        branches: new Set(['main', 'v1', 'v2', 'v3']),
        backportOutcomes: new Map([
          ['v2', 'conflict'],
          ['v3', 'empty'],
        ]),
      })
      expect(yield* service.getCommit('abc')).toStrictEqual({ sha: 'abc', message: 'fix: x', parents: ['p'] })
      expect((yield* Effect.flip(service.getCommit('nope')))._tag).toBe('NotFound')
      const request = {
        branch: 'backport/1-to-v1',
        base: 'v1',
        from: 'p',
        to: 'abc',
        message: 'm',
        title: 't',
        body: 'b',
      }
      const url = 'https://github.com/Resnovas/example/pull/1'
      expect(yield* service.backport(request)).toStrictEqual({ status: 'opened', number: 1, url })
      expect(yield* service.backport(request)).toStrictEqual({ status: 'existing', number: 1, url })
      expect(state.backports).toStrictEqual([{ ...request, number: 1, open: true }])
      if (state.backports[0] !== undefined) state.backports[0].open = false
      expect((yield* service.backport(request)).status).toBe('opened')
      expect(yield* service.backport({ ...request, base: 'v2' })).toStrictEqual({ status: 'conflict' })
      expect(yield* service.backport({ ...request, base: 'v3' })).toStrictEqual({ status: 'empty' })
      expect((yield* Effect.flip(service.backport({ ...request, base: 'v9' })))._tag).toBe('NotFound')
    }),
  )

  it.effect('serves pull request data and records reviews', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        pulls: new Map([
          [
            7,
            {
              commits: [],
              files: ['a.ts'],
              reviews: [{ author: 'ann', state: 'APPROVED' }],
              requestedReviewers: ['bo'],
              submittedReviews: [],
            },
          ],
        ]),
      })
      expect(yield* service.listCommits(7)).toStrictEqual([])
      expect(yield* service.listFiles(7)).toStrictEqual(['a.ts'])
      expect(yield* service.listChangedFiles(7)).toStrictEqual([{ path: 'a.ts', status: 'modified', binary: false }])
      expect(yield* service.listReviews(7)).toHaveLength(1)
      expect(yield* service.countRequestedReviewers(7)).toBe(1)
      expect(yield* service.listRequestedReviewers(7)).toStrictEqual(['bo'])
      expect(yield* service.getMergeable(7)).toBe('MERGEABLE')
      state.pulls.set(8, {
        commits: [],
        files: [],
        reviews: [],
        requestedReviewers: [],
        submittedReviews: [],
        mergeable: 'CONFLICTING',
      })
      expect(yield* service.getMergeable(8)).toBe('CONFLICTING')
      expect(yield* service.listChecks(7)).toStrictEqual([])
      state.pulls.set(10, {
        commits: [],
        files: [],
        reviews: [],
        requestedReviewers: [],
        submittedReviews: [],
        checks: [{ name: 'test', state: 'failure' }],
      })
      expect(yield* service.listChecks(10)).toStrictEqual([{ name: 'test', state: 'failure' }])
      yield* service.requestReviewers(7, ['cy'])
      yield* service.createReview(7, { event: 'APPROVE', body: 'ok' })
      expect(state.pulls.get(7)).toMatchObject({
        requestedReviewers: ['bo', 'cy'],
        submittedReviews: [{ event: 'APPROVE', body: 'ok' }],
      })
      const logo = { path: 'logo.png', status: 'added' as const, binary: true }
      state.pulls.set(11, {
        commits: [],
        files: ['logo.png'],
        changedFiles: [logo],
        reviews: [],
        requestedReviewers: [],
        submittedReviews: [],
      })
      expect(yield* service.listChangedFiles(11)).toStrictEqual([logo])
      const missing = yield* Effect.flip(service.listFiles(9))
      expect(missing.message).toBe('listFiles: not found (pull request #9)')
    }),
  )

  it.effect('records check runs, files, requests and GraphQL calls', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        files: new Map([[fileKey('o', 'r', 'p.yml', 'v2'), 'version: 2']]),
      })
      const run = { name: 'n', headSha: 'h', status: 'in_progress' as const, title: 't', summary: 's' }
      const id = yield* service.createCheckRun(run)
      yield* service.updateCheckRun(id, { ...run, status: 'completed', conclusion: 'success' })
      expect(state.checkRuns).toStrictEqual([{ ...run, status: 'completed', conclusion: 'success', id }])
      expect((yield* Effect.flip(service.updateCheckRun(999, run)))._tag).toBe('NotFound')
      expect(yield* service.listCommitChecks('h')).toStrictEqual([])
      expect(yield* service.listOpenPullRequests).toStrictEqual([])
      state.openPullRequests.push({ number: 4, headSha: 'h', labels: [], draft: false })
      expect((yield* service.listOpenPullRequests).map((pull) => pull.headSha)).toStrictEqual(['h'])
      state.commitChecks.set('h', [{ name: 'ci', source: 'status', state: 'pending', detail: 'pending' }])
      expect((yield* service.listCommitChecks('h')).map((check) => check.name)).toStrictEqual(['ci'])
      expect(yield* service.getFile({ owner: 'o', repo: 'r', path: 'p.yml', ref: 'v2' })).toBe('version: 2')
      expect((yield* Effect.flip(service.getFile({ owner: 'o', repo: 'r', path: 'p.yml' })))._tag).toBe('NotFound')
      yield* service.repositoryRequest({ method: 'PUT', path: '/vulnerability-alerts' })
      yield* service.graphql('query { viewer { login } }', {})
      expect(state.requests).toStrictEqual([{ method: 'PUT', path: '/vulnerability-alerts' }])
      expect(state.graphql).toHaveLength(1)
      expect((yield* service.getRepository).fullName).toBe('Resnovas/example')
      expect(yield* service.tokenScopes).toBeUndefined()
      expect(yield* makeMemoryGitHub({ tokenScopes: ['repo'] }).service.tokenScopes).toStrictEqual(['repo'])
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
      expect(yield* service.listDirectory({ owner: 'o', repo: 'r', path: '' })).toStrictEqual([
        { path: 'templates/a.md', executable: false },
      ])
    }),
  )

  it.effect('opens a pull request for a proposal, updates it while open, and opens another once it is closed', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub()
      const proposal = {
        branch: 'smartcloud/sync',
        base: 'main',
        title: 't',
        body: 'b',
        files: [{ path: 'a', content: 'x', executable: false }],
      }
      const first = yield* service.proposeChanges(proposal)
      expect(first).toStrictEqual({ number: 1, url: 'https://github.com/Resnovas/example/pull/1', created: true })
      expect(yield* service.proposeChanges({ ...proposal, title: 'updated' })).toStrictEqual({
        ...first,
        created: false,
      })
      expect(state.proposals).toStrictEqual([{ ...proposal, title: 'updated', number: 1, open: true }])
      const [opened] = state.proposals
      if (opened !== undefined) opened.open = false
      expect((yield* service.proposeChanges(proposal)).number).toBe(2)
      expect(state.proposals).toHaveLength(2)
    }),
  )
})

describe('in-memory GitHub: refs and archives', () => {
  const seed = () =>
    makeMemoryGitHub({
      files: new Map([
        [fileKey('Resnovas', '.github', 'templates/LICENSE', 'main'), 'MIT\n'],
        [fileKey('Resnovas', '.github', 'templates/tools/run', 'main'), '#!/bin/sh\n'],
        [fileKey('Resnovas', '.github', 'README.md', 'main'), 'outside the templates\n'],
        [fileKey('Resnovas', 'example', 'LICENSE'), 'ours\n'],
        [fileKey('Resnovas', 'example', 'LICENSE', 'head'), 'theirs\n'],
      ]),
      executables: new Set([fileKey('Resnovas', '.github', 'templates/tools/run', 'main')]),
      refs: new Map([[refKey('Resnovas', '.github', 'main'), 'abc123']]),
    })

  it.effect('resolves a seeded ref to its SHA, and any other to itself', () =>
    Effect.gen(function* () {
      const { service } = seed()
      expect(yield* service.resolveRef({ owner: 'Resnovas', repo: '.github', ref: 'main' })).toBe('abc123')
      expect(yield* service.resolveRef({ owner: 'Resnovas', repo: '.github', ref: 'v2' })).toBe('v2')
      expect(yield* service.resolveRef({ owner: 'Resnovas', repo: 'example' })).toBe('')
    }),
  )

  it.effect('serves an archive of a directory at a ref or at the SHA it resolved to, with execute bits', () =>
    Effect.gen(function* () {
      const { service } = seed()
      const expected = [
        { path: 'LICENSE', content: 'MIT\n', executable: false },
        { path: 'tools/run', content: '#!/bin/sh\n', executable: true },
      ]
      const source = { owner: 'Resnovas', repo: '.github', path: '/templates/' }
      expect(yield* service.getArchive({ ...source, ref: 'main' })).toStrictEqual(expected)
      expect(yield* service.getArchive({ ...source, ref: 'abc123' })).toStrictEqual(expected)
      expect(yield* service.getArchive({ ...source, ref: 'abc123', paths: ['tools/run'] })).toStrictEqual([expected[1]])
      expect(yield* service.getArchive({ owner: 'Resnovas', repo: '.github', ref: 'main' })).toHaveLength(3)
      expect(yield* service.getArchive({ owner: 'Resnovas', repo: '.github', ref: 'nope' })).toStrictEqual([])
    }),
  )

  it.effect('serves the default branch of its own repository by name as well as by an empty ref', () =>
    Effect.gen(function* () {
      const { service } = seed()
      const own = { owner: 'Resnovas', repo: 'example' }
      const ours = [{ path: 'LICENSE', content: 'ours\n', executable: false }]
      expect(yield* service.getArchive({ ...own, ref: 'main' })).toStrictEqual(ours)
      expect(yield* service.getArchive(own)).toStrictEqual(ours)
      expect(yield* service.getArchive({ ...own, ref: 'head' })).toStrictEqual([
        { path: 'LICENSE', content: 'theirs\n', executable: false },
      ])
    }),
  )

  it.effect('refuses an archive over the limit, and records every call by name', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const source = { owner: 'Resnovas', repo: '.github', ref: 'main', path: 'templates' }
      const error = yield* Effect.flip(service.getArchive({ ...source, maxBytes: 5 }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'the archive is larger than 5 bytes' })
      expect(yield* service.getArchive({ ...source, maxBytes: 14 })).toHaveLength(2)
      yield* service.getRepository
      yield* Effect.flip(service.getFile({ owner: 'Resnovas', repo: 'example', path: 'nope' }))
      expect(state.calls).toStrictEqual(['getArchive', 'getArchive', 'getRepository', 'getFile'])
    }),
  )
})
