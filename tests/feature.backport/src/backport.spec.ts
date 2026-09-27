/**
 * @file tests/feature.backport/src/backport.spec.ts
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
import { makeReport, Report } from '@resnovas/engine'
import {
  BACKPORT_PREFIX,
  backportBranch,
  backportMarker,
  backportTargets,
  pickRange,
  runBackports,
} from '@resnovas/feature.backport'
import { Forbidden, GitHub, NotFound, Unavailable } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { commentsOf, memory, payload, run } from './fixtures.js'

const config = { version: 2, backport: {} } as const

describe('backportTargets', () => {
  it('reads the branch after the prefix, ignoring case, once per branch', () => {
    expect(
      backportTargets(BACKPORT_PREFIX, ['Backport v1', 'backport  v2 ', 'backport v1', 'backport ', 'bug']),
    ).toStrictEqual(['v1', 'v2'])
    expect(backportTargets('to/', ['to/release/1.x', 'backport v1'])).toStrictEqual(['release/1.x'])
  })
})

describe('backportBranch and backportMarker', () => {
  it('name the branch and the comment after the pull request and the target', () => {
    expect(backportBranch(7, 'v1')).toBe('backport/7-to-v1')
    expect(backportMarker('v1')).toBe('<!-- smartcloud:backport:v1 -->')
  })
})

describe('pickRange', () => {
  const range = (sha: string, commits = 2) =>
    pickRange(7, sha).pipe(Effect.provideService(GitHub, memory({ commits }).service))

  it.effect('measures a merge commit from its first parent', () =>
    Effect.map(range('merge'), (picked) =>
      expect(picked).toStrictEqual({ from: 'base', to: 'merge', mergeCommit: true }),
    ),
  )

  it.effect('measures a squash from its parent, whatever the pull request holds', () =>
    Effect.gen(function* () {
      expect(yield* range('squash')).toStrictEqual({ from: 'base', to: 'squash', mergeCommit: false })
      expect(yield* range('squash', 1)).toStrictEqual({ from: 'base', to: 'squash', mergeCommit: false })
    }),
  )

  it.effect('starts a rebase merge before the first rebased commit', () =>
    Effect.map(range('rebased-two'), (picked) =>
      expect(picked).toStrictEqual({ from: 'base', to: 'rebased-two', mergeCommit: false }),
    ),
  )

  it.effect('takes a last commit whose earlier messages do not match as a squash', () =>
    Effect.map(range('lookalike'), (picked) =>
      expect(picked).toStrictEqual({ from: 'base', to: 'lookalike', mergeCommit: false }),
    ),
  )

  it.effect('refuses a commit without a parent', () =>
    Effect.map(Effect.flip(range('root')), (error) =>
      expect(error.message).toBe('backport: rejected (root has no parent to backport from)'),
    ),
  )
})

describe('runBackports', () => {
  it.effect('backports a merged pull request to every labelled branch but its own base', () =>
    Effect.gen(function* () {
      // Comment ids and pull request numbers share one counter in the memory GitHub.
      const github = memory()
      const result = yield* run(
        { version: 2, backport: { labels: ['backport'] } },
        github,
        payload({ labels: ['backport v1', 'Backport v2', 'bug', 'backport main'] }),
      )
      expect(github.state.backports).toStrictEqual([
        {
          branch: 'backport/7-to-v1',
          base: 'v1',
          from: 'base',
          to: 'squash',
          message: 'fix: a bug\n\nBackport of #7 (squash) to v1.',
          title: 'fix: a bug',
          body: 'Backport of #7 to `v1`, cherry-picked from squash.\n\n---\n\nFixes the bug.',
          number: 100,
          open: true,
        },
        expect.objectContaining({ branch: 'backport/7-to-v2', base: 'v2', number: 102 }),
      ])
      expect(github.state.issues.get(100)?.labels).toStrictEqual(['backport'])
      expect(commentsOf(github)).toStrictEqual([
        '<!-- smartcloud:backport:v1 -->\nBackported to `v1` in #100.',
        '<!-- smartcloud:backport:v2 -->\nBackported to `v2` in #102.',
      ])
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'opened #100 to backport #7 to v1',
        'opened #102 to backport #7 to v2',
      ])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('reads its own prefix, and leaves out an empty description', () =>
    Effect.gen(function* () {
      const github = memory()
      yield* run(
        { version: 2, backport: { prefix: 'to/' } },
        github,
        payload({ labels: ['to/v1', 'backport v2'], body: null }),
      )
      expect(github.state.backports.map(({ base, body }) => [base, body])).toStrictEqual([
        ['v1', 'Backport of #7 to `v1`, cherry-picked from squash.'],
      ])
      expect(github.state.issues.get(100)?.labels ?? []).toStrictEqual([])
    }),
  )

  it.effect('on a labeled event, backports only to the branch the new label names', () =>
    Effect.gen(function* () {
      const github = memory()
      yield* run(
        config,
        github,
        payload({ action: 'labeled', label: 'backport v2', labels: ['backport v1', 'backport v2'] }),
      )
      expect(github.state.backports.map(({ base }) => base)).toStrictEqual(['v2'])
      yield* run(config, github, payload({ action: 'labeled', label: 'bug' }))
      yield* run(config, github, payload({ action: 'labeled' }))
      expect(github.state.backports).toHaveLength(1)
    }),
  )

  it.effect('waits for the merge, and ignores other actions', () =>
    Effect.gen(function* () {
      const github = memory()
      yield* run(config, github, payload({ action: 'labeled', label: 'backport v1', merged: false }))
      yield* run(config, github, payload({ action: 'closed', merged: false }))
      yield* run(config, github, payload({ action: 'synchronize' }))
      expect(github.state.backports).toStrictEqual([])
      expect(github.state.gitCommits.size).toBeGreaterThan(0)
    }),
  )

  it.effect('keeps one comment per branch, and leaves an open backport alone', () =>
    Effect.gen(function* () {
      const github = memory({
        comments: [{ id: 1, body: '<!-- smartcloud:backport:v1 -->\nforged', author: 'mallory', bot: false }],
      })
      yield* run(config, github)
      const second = yield* run(config, github)
      expect(github.state.backports).toHaveLength(1)
      expect(second.changes).toStrictEqual([])
      expect(commentsOf(github)).toStrictEqual([
        '<!-- smartcloud:backport:v1 -->\nforged',
        '<!-- smartcloud:backport:v1 -->\nBackported to `v1` in #100.',
      ])
    }),
  )

  it.effect('edits its comment when the outcome changes', () =>
    Effect.gen(function* () {
      const github = memory()
      github.state.backportOutcomes.set('v1', 'conflict')
      yield* run(config, github)
      github.state.backportOutcomes.delete('v1')
      yield* run(config, github)
      expect(commentsOf(github)).toStrictEqual(['<!-- smartcloud:backport:v1 -->\nBackported to `v1` in #101.'])
    }),
  )

  it.effect('explains a conflict with the commands to backport by hand', () =>
    Effect.gen(function* () {
      for (const [sha, pick] of [
        ['squash', 'git cherry-pick -x base..squash'],
        ['merge', 'git cherry-pick -x -m 1 merge'],
      ] as const) {
        const github = memory()
        github.state.backportOutcomes.set('v1', 'conflict')
        const result = yield* run(config, github, payload({ sha }))
        expect(commentsOf(github)).toStrictEqual([
          '<!-- smartcloud:backport:v1 -->\nThe backport to `v1` did not apply cleanly, so no pull request was opened. To backport by hand:\n\n' +
            `\`\`\`sh\ngit fetch origin\ngit switch -c backport/7-to-v1 origin/v1\n${pick}\n\`\`\``,
        ])
        expect(result.findings).toMatchObject([
          {
            level: 'warning',
            message: '#7 does not apply cleanly to v1; the pull request says how to backport it by hand.',
          },
        ])
      }
    }),
  )

  it.effect('quotes a branch name in the commands, so copying them cannot run it', () =>
    Effect.gen(function* () {
      const github = memory()
      const target = "v1$(id);'x'"
      github.state.branches.add(target)
      github.state.backportOutcomes.set(target, 'conflict')
      yield* run(config, github, payload({ labels: [`backport ${target}`] }))
      expect(commentsOf(github)[0]).toContain(
        "git switch -c 'backport/7-to-v1$(id);'\\''x'\\''' 'origin/v1$(id);'\\''x'\\'''",
      )
    }),
  )

  it.effect('adds the labels to an open backport again, repairing a run that failed after opening it', () =>
    Effect.gen(function* () {
      const github = memory()
      const labelled = { version: 2, backport: { labels: ['backport'] } } as const
      const failing = {
        ...github.service,
        addLabels: () => Effect.fail(new Unavailable({ operation: 'addLabels', detail: 'Bad Gateway' })),
      }
      const first = yield* run(labelled, github, payload(), 'pull_request', failing)
      expect(first.findings.map(({ level }) => level)).toStrictEqual(['error'])
      const second = yield* run(labelled, github)
      expect(second.changes).toStrictEqual([])
      expect(github.state.issues.get(100)?.labels).toStrictEqual(['backport'])
    }),
  )

  it.effect('reports a 404 other than a missing branch as an error, not as a missing branch', () =>
    Effect.gen(function* () {
      const github = memory()
      const service = {
        ...github.service,
        backport: () => Effect.fail(new NotFound({ operation: 'backport: merge', detail: 'commit two' })),
      }
      const result = yield* run(config, github, payload(), 'pull_request', service)
      expect(result.findings.map(({ level, message }) => [level, message])).toStrictEqual([
        ['error', '#7 was not backported to v1: backport: merge: not found (commit two)'],
      ])
      expect(commentsOf(github)).toStrictEqual([])
    }),
  )

  it.effect('says when a branch already has the changes, or does not exist', () =>
    Effect.gen(function* () {
      const github = memory()
      github.state.backportOutcomes.set('v1', 'empty')
      const result = yield* run(config, github, payload({ labels: ['backport v1', 'backport v9'] }))
      expect(commentsOf(github)).toStrictEqual([
        '<!-- smartcloud:backport:v1 -->\n`v1` already has the changes from this pull request, so there is nothing to backport.',
        '<!-- smartcloud:backport:v9 -->\nThere is no `v9` branch to backport to.',
      ])
      expect(result.findings.map(({ level, message }) => [level, message])).toStrictEqual([
        ['notice', 'v1 already has the changes from #7.'],
        ['warning', '#7 was not backported: there is no v9 branch.'],
      ])
    }),
  )

  it.effect('warns on a read-only token, reports other failures, and carries on with the other branches', () =>
    Effect.gen(function* () {
      const github = memory()
      const service = {
        ...github.service,
        backport: (request: Parameters<typeof github.service.backport>[0]) =>
          request.base === 'v1'
            ? Effect.fail(
                new Forbidden({
                  operation: 'backport: create scratch commit',
                  detail: 'Resource not accessible by integration',
                }),
              )
            : request.base === 'v2'
              ? Effect.fail(new Unavailable({ operation: 'backport: merge', detail: 'Bad Gateway' }))
              : github.service.backport(request),
      }
      const result = yield* run(
        config,
        github,
        payload({ labels: ['backport v1', 'backport v2', 'backport v3'] }),
        'pull_request',
        service,
      )
      expect(result.findings.map(({ level, message }) => [level, message])).toStrictEqual([
        ['warning', '#7 was not backported to v1 on a read-only token, for example a pull request event from a fork.'],
        ['error', '#7 was not backported to v2: backport: merge: GitHub unavailable (Bad Gateway)'],
      ])
      expect(github.state.backports.map(({ base }) => base)).toStrictEqual(['v3'])
    }),
  )

  it.effect('does nothing without a backport section', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      const github = memory()
      const envelope = {
        kind: 'pullRequest' as const,
        event: 'pull_request',
        action: 'closed',
        headSha: 'head',
        merge: { sha: 'squash', base: 'main' },
        subject: {
          kind: 'pullRequest' as const,
          number: 7,
          title: 't',
          body: '',
          author: 'a',
          open: false,
          locked: false,
          labels: ['backport v1'],
          updatedAt: new Date(0),
        },
      }
      yield* runBackports({ version: 2 }, envelope).pipe(
        Effect.provideService(GitHub, github.service),
        Effect.provideService(Report, report),
      )
      expect(github.state.backports).toStrictEqual([])
    }),
  )
})
