/**
 * @file tests/feature.commands/src/feature.spec.ts
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
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { makeCommandsFeature, REPLY_MARKER } from '@resnovas/feature.commands'
import { DryRun, DryRunLog, Forbidden, GitHub, Unavailable, ValidationFailed } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import {
  base,
  calls,
  commentEvent,
  fail,
  makeGitHub,
  ok,
  pull,
  pullRequestEvent,
  replies,
  role,
  run,
  type Route,
  writer,
} from './fixtures.js'

const REACTION = 'POST /issues/comments/99/reactions'
const reactionOf = (github: ReturnType<typeof makeGitHub>) =>
  github.requests.find((request) => `${request.method} ${request.path}` === REACTION)?.body

describe('commands feature: answering comments', () => {
  it('handles comments and pull request events, when a commands section is configured', () => {
    const feature = makeCommandsFeature()
    expect(feature.enabled?.({ version: 2 })).toBe(false)
    expect(feature.handles).toStrictEqual(['comment', 'pullRequest'])
  })

  it.effect('runs a known command, reacts with a thumbs up, and does not reply when all went well', () =>
    Effect.gen(function* () {
      const github = makeGitHub(writer)
      const result = yield* run(github, commentEvent('Thanks!\n/label bug\n/frobnicate'))
      expect(result.ran).toStrictEqual(['commands'])
      expect(reactionOf(github)).toStrictEqual({ content: '+1' })
      expect(replies(github)).toStrictEqual([])
      expect(result.changes).toStrictEqual([{ feature: 'commands', description: '/label bug: labelled #7 "bug"' }])
    }),
  )

  it.effect('ignores edits, bots, comments without commands, and other events', () =>
    Effect.gen(function* () {
      for (const event of [
        commentEvent('/label bug', { action: 'edited' }),
        commentEvent('/label bug', { bot: true, commenter: 'smartcloud[bot]' }),
        commentEvent('Just a comment'),
        { name: 'issues', payload: commentEvent('').payload },
        pullRequestEvent('opened', ['backport v1']),
      ]) {
        const github = makeGitHub(writer)
        yield* run(github, event)
        expect(github.requests).toStrictEqual([])
      }
      const noRunner = yield* runFeatures({
        config: base,
        event: 'schedule',
        payload: {},
        features: [makeCommandsFeature()],
      }).pipe(Effect.provideService(GitHub, makeGitHub().service))
      expect(noRunner.skipped).toStrictEqual([{ feature: 'commands', reason: 'does not handle repository events' }])
      // Called directly with an event it does not handle, it does nothing.
      yield* makeCommandsFeature()
        .run({ config: base, envelope: { kind: 'repository', event: 'schedule' } })
        .pipe(Effect.provideService(GitHub, makeGitHub().service), Effect.provideServiceEffect(Report, makeReport))
    }),
  )

  it.effect('refuses commands the commenter may not use, and replies saying why', () =>
    Effect.gen(function* () {
      const github = makeGitHub({ 'GET /collaborators/maya/permission': ok(role('read')) })
      const result = yield* run(github, commentEvent('/label bug\n/close'))
      expect(result.findings.map((finding) => [finding.rule, finding.level, finding.message])).toStrictEqual([
        ['commands.denied', 'warning', '/label bug: needs the triage role; @maya has the read role'],
        ['commands.denied', 'warning', '/close: needs the triage role, or to be the author; @maya has the read role'],
      ])
      expect(reactionOf(github)).toStrictEqual({ content: 'confused' })
      expect(replies(github)).toStrictEqual([
        `${REPLY_MARKER}\n@maya\n- 🚫 \`/label bug\`: needs the triage role; @maya has the read role\n- 🚫 \`/close\`: needs the triage role, or to be the author; @maya has the read role`,
      ])
    }),
  )

  it.effect("lets the author use their own item's commands, and no role counts as none", () =>
    Effect.gen(function* () {
      const github = makeGitHub({
        'GET /collaborators/sam/permission': fail(new Forbidden({ operation: 'x', detail: 'no' })),
      })
      const result = yield* run(github, commentEvent('/close\n/lock', { commenter: 'sam' }))
      expect(result.changes.map((change) => change.description)).toStrictEqual(['/close: closed #7'])
      expect(result.findings.map((finding) => finding.message)).toStrictEqual([
        'could not read the role of @sam, so none is assumed: x: forbidden (no)',
        '/lock: needs the triage role; @sam has no role',
      ])
    }),
  )

  it.effect('refuses a turned-off command, a pull request command on an issue, and commands past the limit', () =>
    Effect.gen(function* () {
      const github = makeGitHub(writer)
      const config = { version: 2 as const, commands: { overrides: { merge: { enabled: false } } } }
      const body = ['/merge', '/rebase', ...Array.from({ length: 9 }, () => '/unlock')].join('\n')
      const result = yield* run(github, commentEvent(body, { pullRequest: false }), config)
      const messages = result.findings.map((finding) => finding.message)
      expect(messages[0]).toBe('/merge: /merge is turned off in this repository')
      expect(messages[1]).toBe('/rebase: /rebase only works on pull requests')
      expect(messages[2]).toBe('/unlock: only the first 10 commands in a comment are run')
      expect(result.changes).toHaveLength(8)
    }),
  )

  it.effect(
    'turns a GitHub failure into a failed command, and reports a reaction or reply that could not be written',
    () =>
      Effect.gen(function* () {
        const github = makeGitHub({
          ...writer,
          'PUT /pulls/7/merge': fail(
            new ValidationFailed({ operation: 'PUT /pulls/7/merge', detail: 'Pull Request is not mergeable' }),
          ),
          [REACTION]: fail(new Unavailable({ operation: 'reaction', detail: 'boom' })),
        })
        const failing: GitHub['Type'] = {
          ...github.service,
          createComment: () => Effect.fail(new Unavailable({ operation: 'createComment', detail: 'boom' })),
        }
        const result = yield* runFeatures({
          config: base,
          event: 'issue_comment',
          payload: commentEvent('/merge').payload,
          features: [makeCommandsFeature()],
        }).pipe(Effect.provideService(GitHub, failing))
        expect(result.findings.map((finding) => [finding.rule, finding.message])).toStrictEqual([
          ['commands.failed', '/merge: PUT /pulls/7/merge: rejected (Pull Request is not mergeable)'],
          ['commands.reply', 'reaction: reaction: GitHub unavailable (boom)'],
          ['commands.reply', 'reply: createComment: GitHub unavailable (boom)'],
        ])
      }),
  )

  it.effect('leaves reactions off when asked, and replies with the output of /help', () =>
    Effect.gen(function* () {
      const github = makeGitHub({ 'GET /collaborators/maya/permission': ok(role('triage')) })
      yield* run(github, commentEvent('/help', { pullRequest: false }), { version: 2, commands: { reactions: false } })
      expect(calls(github)).not.toContain(REACTION)
      const [reply] = replies(github)
      expect(reply).toContain('- ✅ `/help`: listed 11 command(s)')
      expect(reply).toContain('<details open><summary>`/help`</summary>')
      expect(reply).toContain('- `/label <label>...`: Add labels.')
      expect(reply).not.toContain('/merge')
      const onPull = makeGitHub({ 'GET /collaborators/maya/permission': ok(role('admin')) })
      yield* run(onPull, commentEvent('/help'))
      expect(replies(onPull)[0]).toContain('listed 22 command(s)')
    }),
  )

  it.effect('quotes a command with backticks safely', () =>
    Effect.gen(function* () {
      const github = makeGitHub(writer)
      yield* run(github, commentEvent('/label `x`'))
      expect(replies(github)[0]).toContain("`/label 'x'`")
    }),
  )

  it.effect('writes nothing in a dry run, and records the plan', () =>
    Effect.gen(function* () {
      const github = makeGitHub({
        ...writer,
        'GET /pulls/7': ok(pull({ state: 'closed', merged: true, merge_commit_sha: 'm1' })),
        'GET /git/ref/heads/v1': ok({ object: { sha: 't1' } }),
        'GET /commits/m1': ok({ sha: 'm1', parents: [{ sha: 'p1' }], commit: { message: 'x' } }),
      })
      const writes = yield* Effect.gen(function* () {
        const result = yield* runFeatures({
          config: base,
          event: 'issue_comment',
          payload: commentEvent('/backport v1').payload,
          features: [makeCommandsFeature()],
        })
        expect(result.changes.map((change) => change.description)).toStrictEqual([
          '/backport v1: would backport #7 to `v1` from `backport/7-v1`',
        ])
        return yield* Effect.flatMap(DryRunLog, (log) => log.writes)
      }).pipe(Effect.provide(DryRun), Effect.provideService(GitHub, github.service))
      expect(writes.map((write) => write.operation)).toStrictEqual(['repositoryRequest'])
      expect(github.requests.every((request) => request.method === 'GET')).toBe(true)
    }),
  )
})

describe('commands feature: backports on merge', () => {
  const mergedPull = (overrides: Record<string, unknown> = {}) =>
    ok(pull({ state: 'closed', merged: true, merge_commit_sha: 'm1', ...overrides }))
  const cleanRoutes: Record<string, Route> = {
    'GET /pulls/7': mergedPull(),
    'GET /git/ref/heads/v1': ok({ object: { sha: 't1' } }),
    'GET /git/ref/heads/v2': ok({ object: { sha: 't2' } }),
    'GET /commits/m1': ok({ sha: 'm1', parents: [{ sha: 'p1' }], commit: { message: 'x' } }),
    'GET /git/commits/t1': ok({ sha: 't1', tree: { sha: 'tree' } }),
    'GET /git/commits/t2': ok({ sha: 't2', tree: { sha: 'tree' } }),
    'POST /git/commits': ok({ sha: 'c', tree: { sha: 'tree' } }),
    'POST /merges': ok({ commit: { tree: { sha: 'merged' } } }),
    'POST /pulls': ok({ number: 8, html_url: 'u' }),
  }

  it.effect('leaves backports on merge to the backport feature when it is configured, so none opens twice', () =>
    Effect.gen(function* () {
      const github = makeGitHub({ ...cleanRoutes, 'POST /git/refs': ok({}) })
      yield* run(github, pullRequestEvent('closed', ['backport v1']), { ...base, backport: {} })
      expect(calls(github)).not.toContain('POST /git/refs')
      expect(replies(github)).toStrictEqual([])
    }),
  )

  it.effect('asks for nothing when a label names the branch the pull request merged into', () =>
    Effect.gen(function* () {
      const github = makeGitHub({ ...cleanRoutes, 'POST /git/refs': ok({}) })
      yield* run(github, pullRequestEvent('closed', ['backport main']))
      expect(calls(github)).not.toContain('POST /git/refs')
      expect(replies(github)).toStrictEqual([])
    }),
  )

  it.effect('backports to each branch its labels name, and comments with the results', () =>
    Effect.gen(function* () {
      const github = makeGitHub({
        ...cleanRoutes,
        'POST /git/refs': (request) =>
          String(request.body?.['ref']).endsWith('v2')
            ? Effect.fail(new ValidationFailed({ operation: 'x', detail: 'exists' }))
            : Effect.succeed({}),
        'GET /git/ref/heads/backport/7-v2': ok({ object: { sha: 'b2' } }),
      })
      const result = yield* run(
        github,
        pullRequestEvent('closed', ['bug', 'Backport v1', 'backport v2', 'backport ../bad']),
      )
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        'backport v1: opened #8 to backport #7 to `v1`',
      ])
      expect(result.findings.map((finding) => finding.message)).toStrictEqual([
        'backport v2: the branch `backport/7-v2` already exists; a backport to `v2` may already be open',
      ])
      expect(replies(github)).toStrictEqual([
        `${REPLY_MARKER}\nBackports of #7, asked for by its labels:\n\n- ✅ \`v1\`: opened #8 to backport #7 to \`v1\`\n- ❌ \`v2\`: the branch \`backport/7-v2\` already exists; a backport to \`v2\` may already be open`,
      ])
    }),
  )

  it.effect('says when there is nothing to do, a conflict, or too many commits', () =>
    Effect.gen(function* () {
      const cases: ReadonlyArray<readonly [Record<string, Route>, string]> = [
        [{ 'POST /merges': ok(null) }, '`v1` already has the changes of #7'],
        [
          { 'POST /merges': fail(new ValidationFailed({ operation: 'x', detail: 'Merge conflict' })) },
          'the changes of #7 do not apply cleanly to `v1`; backport them by hand',
        ],
        [{ 'GET /pulls/7': mergedPull({ commits: 101 }) }, '#7 has too many commits to backport'],
        [{ 'GET /pulls/7': mergedPull({ merge_commit_sha: null }) }, '#7 was closed without being merged'],
      ]
      for (const [routes, message] of cases) {
        const github = makeGitHub({ ...cleanRoutes, ...routes })
        const result = yield* run(github, pullRequestEvent('closed', ['backport v1']))
        expect([
          ...result.changes.map((change) => change.description),
          ...result.findings.map((finding) => finding.message),
        ]).toStrictEqual([`backport v1: ${message}`])
      }
    }),
  )

  it.effect(
    'does nothing for a pull request closed unmerged, with no backport labels, or with backport turned off',
    () =>
      Effect.gen(function* () {
        const unmerged = makeGitHub({ 'GET /pulls/7': ok(pull({ state: 'closed' })) })
        yield* run(unmerged, pullRequestEvent('closed', ['backport v1']))
        expect(calls(unmerged)).toStrictEqual(['GET /pulls/7'])
        const unlabelled = makeGitHub(cleanRoutes)
        yield* run(unlabelled, pullRequestEvent('closed', ['bug']))
        const off = makeGitHub(cleanRoutes)
        yield* run(off, pullRequestEvent('closed', ['backport v1']), {
          version: 2,
          commands: { overrides: { backport: { enabled: false } } },
        })
        expect([...unlabelled.requests, ...off.requests]).toStrictEqual([])
      }),
  )
})
