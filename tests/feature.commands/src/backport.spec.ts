/**
 * @file tests/feature.commands/src/backport.spec.ts
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
import {
  backport,
  BACKPORT_COMMIT_LIMIT,
  backportNames,
  isBranchName,
  type PullDetails,
} from '@resnovas/feature.commands'
import { GitHub, NotFound, Unavailable, ValidationFailed } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { calls, fail, makeGitHub, ok, type Route, type TestGitHub } from './fixtures.js'

const merged: PullDetails = {
  nodeId: 'PR_7',
  number: 7,
  title: 'Fix the thing',
  open: false,
  merged: true,
  mergeCommitSha: 'm1',
  author: 'sam',
  commits: 1,
  baseBranch: 'main',
}

const author = { name: 'Sam', email: 'sam@example.com', date: '2026-09-01T00:00:00Z' }
const commit = (
  sha: string,
  parents: ReadonlyArray<string>,
  message = 'Fix the thing (#7)\n\nSigned-off-by: Sam <sam@example.com>',
  by: unknown = author,
) => ({
  sha,
  parents: parents.map((parent) => ({ sha: parent })),
  commit: { message, author: by },
})

const BRANCH = 'backport/7-release--1.x'
const names = { labelPrefix: 'backport ', branchPrefix: 'backport/' }

// Every route a clean backport of m1 (parent p1) to release/1.x takes.
const happy = (overrides: Record<string, Route> = {}): Record<string, Route> => ({
  'GET /git/ref/heads/release/1.x': ok({ object: { sha: 't1' } }),
  'GET /commits/m1': ok(commit('m1', ['p1'])),
  'GET /git/commits/t1': ok({ sha: 't1', tree: { sha: 'tree-t1' } }),
  'POST /git/refs': ok({}),
  'POST /git/commits': (request) =>
    Effect.succeed({
      sha: request.body?.['message'] === 'smartcloud backport (temporary)' ? 'tmp' : 'final',
      tree: { sha: 'x' },
    }),
  'POST /merges': ok({ commit: { tree: { sha: 'tree-merged' } } }),
  'POST /pulls': ok({ number: 8, html_url: 'https://github.com/o/r/pull/8' }),
  ...overrides,
})

const attempt = (github: TestGitHub, pull: PullDetails = merged, dryRun = false) =>
  backport(pull, 'release/1.x', names, dryRun).pipe(Effect.provideService(GitHub, github.service))

const bodyOf = (github: TestGitHub, key: string, index = 0) =>
  github.requests.filter((request) => `${request.method} ${request.path}` === key)[index]?.body

describe('backport', () => {
  it.effect('applies a squashed pull request to a new branch from the target and opens a pull request', () =>
    Effect.gen(function* () {
      const github = makeGitHub(happy())
      expect(yield* attempt(github)).toStrictEqual({
        kind: 'opened',
        branch: BRANCH,
        number: 8,
        url: 'https://github.com/o/r/pull/8',
      })
      expect(bodyOf(github, 'POST /git/refs')).toStrictEqual({ ref: `refs/heads/${BRANCH}`, sha: 't1' })
      expect(bodyOf(github, 'POST /git/commits')).toStrictEqual({
        message: 'smartcloud backport (temporary)',
        tree: 'tree-t1',
        parents: ['p1'],
      })
      expect(bodyOf(github, `PATCH /git/refs/heads/${BRANCH}`)).toStrictEqual({ sha: 'tmp', force: true })
      expect(bodyOf(github, 'POST /merges')).toMatchObject({ base: BRANCH, head: 'm1' })
      expect(bodyOf(github, 'POST /git/commits', 1)).toStrictEqual({
        message:
          'Fix the thing (#7)\n\nBackport of #7 to release/1.x.\n\n(cherry picked from commit m1)\n\nSigned-off-by: Sam <sam@example.com>',
        tree: 'tree-merged',
        parents: ['t1'],
        author,
      })
      expect(bodyOf(github, `PATCH /git/refs/heads/${BRANCH}`, 1)).toStrictEqual({ sha: 'final', force: true })
      expect(bodyOf(github, 'POST /pulls')).toMatchObject({
        title: '[release/1.x] Fix the thing',
        head: BRANCH,
        base: 'release/1.x',
      })
      expect(calls(github)).not.toContain(`DELETE /git/refs/heads/${BRANCH}`)
    }),
  )

  it.effect('walks back over the commits a rebase merge laid on the base, and keeps every sign-off', () =>
    Effect.gen(function* () {
      const github = makeGitHub(
        happy({
          'GET /commits/m1': ok(commit('m1', ['c2'], 'Third\n\nSigned-off-by: Sam <sam@example.com>')),
          'GET /commits/c2/pulls': ok([{ number: 7 }]),
          'GET /commits/c2': ok(commit('c2', ['c1'], 'Second\n\nSigned-off-by: Kai <kai@example.com>')),
          'GET /commits/c1/pulls': ok([{ number: 3 }, { number: 7 }]),
          'GET /commits/c1': ok(commit('c1', ['base'], 'First\n\nSigned-off-by: Sam <sam@example.com>')),
        }),
      )
      yield* attempt(github, { ...merged, title: 'Fix the thing (#7)', commits: 3 })
      expect(bodyOf(github, 'POST /git/commits')).toMatchObject({ parents: ['base'] })
      expect(bodyOf(github, 'POST /git/commits', 1)).toMatchObject({
        message:
          'Fix the thing (#7)\n\nBackport of #7 to release/1.x.\n\n(cherry picked from commit m1)\n\nSigned-off-by: Sam <sam@example.com>\nSigned-off-by: Kai <kai@example.com>',
      })
    }),
  )

  it.effect('stops at a parent that belongs to another pull request, and uses the first parent of a merge commit', () =>
    Effect.gen(function* () {
      const squashed = makeGitHub(happy({ 'GET /commits/p1/pulls': ok([{ number: 5 }]) }))
      yield* attempt(squashed, { ...merged, commits: 4 })
      expect(bodyOf(squashed, 'POST /git/commits')).toMatchObject({ parents: ['p1'] })
      const mergeCommit = makeGitHub(
        happy({ 'GET /commits/m1': ok(commit('m1', ['main-head', 'branch-head'], 'Merge', null)) }),
      )
      yield* attempt(mergeCommit, { ...merged, commits: 4 })
      expect(bodyOf(mergeCommit, 'POST /git/commits')).toMatchObject({ parents: ['main-head'] })
      expect(bodyOf(mergeCommit, 'POST /git/commits', 1)).toStrictEqual({
        message: 'Fix the thing (#7)\n\nBackport of #7 to release/1.x.\n\n(cherry picked from commit m1)',
        tree: 'tree-merged',
        parents: ['t1'],
      })
    }),
  )

  it.effect('refuses what it cannot backport, before writing anything', () =>
    Effect.gen(function* () {
      const github = makeGitHub(
        happy({ 'GET /git/ref/heads/release/1.x': fail(new NotFound({ operation: 'x', detail: 'y' })) }),
      )
      expect(yield* attempt(github, { ...merged, merged: false })).toStrictEqual({ kind: 'not-merged' })
      expect(yield* attempt(github, { ...merged, mergeCommitSha: undefined })).toStrictEqual({ kind: 'not-merged' })
      expect(yield* attempt(github, { ...merged, commits: BACKPORT_COMMIT_LIMIT + 1 })).toStrictEqual({
        kind: 'too-large',
      })
      expect(yield* attempt(github)).toStrictEqual({ kind: 'no-target' })
      const root = makeGitHub(happy({ 'GET /commits/m1': ok(commit('m1', [])) }))
      expect(yield* attempt(root)).toStrictEqual({ kind: 'empty' })
      expect(github.requests.concat(root.requests).every((request) => request.method === 'GET')).toBe(true)
    }),
  )

  it.effect('only plans in a dry run', () =>
    Effect.gen(function* () {
      const github = makeGitHub(happy())
      expect(yield* attempt(github, merged, true)).toStrictEqual({ kind: 'planned', branch: BRANCH })
      expect(github.requests.every((request) => request.method === 'GET')).toBe(true)
    }),
  )

  it.effect('leaves an existing branch alone', () =>
    Effect.gen(function* () {
      const github = makeGitHub(
        happy({
          'POST /git/refs': fail(new ValidationFailed({ operation: 'x', detail: 'Reference already exists' })),
          [`GET /git/ref/heads/${BRANCH}`]: ok({ object: { sha: 'b1' } }),
        }),
      )
      expect(yield* attempt(github)).toStrictEqual({ kind: 'branch-exists', branch: BRANCH })
      expect(calls(github)).not.toContain(`DELETE /git/refs/heads/${BRANCH}`)
    }),
  )

  it.effect('fails when GitHub refuses a branch that does not exist, such as an invalid prefix', () =>
    Effect.gen(function* () {
      const refused = new ValidationFailed({ operation: 'x', detail: 'Reference name is not valid' })
      const github = makeGitHub(
        happy({
          'POST /git/refs': fail(refused),
          [`GET /git/ref/heads/${BRANCH}`]: fail(new NotFound({ operation: 'x', detail: 'y' })),
        }),
      )
      expect(yield* Effect.flip(attempt(github))).toBe(refused)
    }),
  )

  it.effect(
    'deletes the new branch on a conflict, when there is nothing to apply, and when GitHub fails part way',
    () =>
      Effect.gen(function* () {
        const conflict = makeGitHub(
          happy({ 'POST /merges': fail(new ValidationFailed({ operation: 'x', detail: 'Merge conflict' })) }),
        )
        expect(yield* attempt(conflict)).toStrictEqual({ kind: 'conflict' })
        expect(calls(conflict)).toContain(`DELETE /git/refs/heads/${BRANCH}`)
        const empty = makeGitHub(happy({ 'POST /merges': ok(null) }))
        expect(yield* attempt(empty)).toStrictEqual({ kind: 'empty' })
        expect(calls(empty)).toContain(`DELETE /git/refs/heads/${BRANCH}`)
        const broken = makeGitHub(
          happy({
            'POST /pulls': fail(new Unavailable({ operation: 'POST /pulls', detail: 'boom' })),
            [`DELETE /git/refs/heads/${BRANCH}`]: fail(new Unavailable({ operation: 'DELETE', detail: 'also boom' })),
          }),
        )
        expect((yield* Effect.flip(attempt(broken)))._tag).toBe('Unavailable')
        expect(calls(broken)).toContain(`DELETE /git/refs/heads/${BRANCH}`)
      }),
  )

  it('names branches it will backport to, and the prefixes it uses', () => {
    expect(['release/1.x', 'v2', 'main'].every(isBranchName)).toBe(true)
    expect(
      ['../main', '/main', 'main/', 'a..b', 'a b', 'x.lock', 'a//b', 'a@{1}', '.hidden', ''].some(isBranchName),
    ).toBe(false)
    expect(backportNames({ version: 2, commands: { backport: { labelPrefix: 'bp: ' } } })).toStrictEqual({
      labelPrefix: 'bp: ',
      branchPrefix: 'backport/',
    })
    // Without its own prefix, /backport uses the backport feature's, so that feature reads the labels.
    expect(backportNames({ version: 2, backport: { prefix: 'to ' }, commands: {} }).labelPrefix).toBe('to ')
  })
})
