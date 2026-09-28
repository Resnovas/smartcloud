/**
 * @file tests/feature.commands/src/commands.spec.ts
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
import type { RunResult } from '@resnovas/engine'
import { COMMANDS, type Runner } from '@resnovas/feature.commands'
import { snoozeBody } from '@resnovas/feature.stale'
import { NotFound, Unavailable, ValidationFailed } from '@resnovas/integrations.github'
import { Data, Effect } from 'effect'
import {
  base,
  calls,
  commentEvent,
  fail,
  makeGitHub,
  NOW,
  ok,
  pull,
  replies,
  role,
  run,
  type Route,
  type TestGitHub,
  writer,
} from './fixtures.js'

class Exploded extends Data.TaggedError('Exploded')<{ readonly message: string }> {}

const DAY = 86_400_000

const bodyOf = (github: TestGitHub, key: string) =>
  github.requests.find((request) => `${request.method} ${request.path}` === key)?.body

// Runs one comment as a writer and returns what was recorded for it.
const answer = (
  body: string,
  routes: Record<string, Route> = {},
  options: Parameters<typeof commentEvent>[1] = {},
  config = base,
  runner?: Runner,
  itemLabels = options.labels ?? [],
) =>
  Effect.gen(function* () {
    const github = makeGitHub({ ...writer, 'GET /pulls/7': ok(pull()), ...routes }, undefined, itemLabels)
    const result = yield* run(github, commentEvent(body, options), config, runner)
    return {
      github,
      result,
      changes: result.changes.map((change) => change.description),
      warnings: result.findings.map((finding) => finding.message),
    }
  })

describe('commands: labels and people', () => {
  it.effect('/label adds existing labels, ignoring case, and refuses unknown ones', () =>
    Effect.gen(function* () {
      const { github, changes } = yield* answer('/label BUG "good first issue"')
      expect(github.state.issues.get(7)?.labels).toStrictEqual(['bug', 'good first issue'])
      expect(changes).toStrictEqual(['/label BUG "good first issue": labelled #7 "bug", "good first issue"'])
      const unknown = yield* answer('/label bug nope')
      expect(unknown.warnings).toStrictEqual(['/label bug nope: there is no label called "nope"'])
      expect((yield* answer('/label')).warnings).toStrictEqual(['/label: name at least one label'])
    }),
  )

  it.effect('/unlabel removes the labels the item has, and says when it has none of them', () =>
    Effect.gen(function* () {
      const { changes } = yield* answer('/unlabel Bug nope', {}, { labels: ['bug', 'gone'] })
      expect(changes).toStrictEqual(['/unlabel Bug nope: removed "bug" from #7'])
      // Already gone on GitHub: still counted, since the item no longer has it.
      expect((yield* answer('/unlabel gone', {}, { labels: ['gone'] }, base, undefined, [])).changes).toStrictEqual([
        '/unlabel gone: removed "gone" from #7',
      ])
      expect((yield* answer('/unlabel bug', {}, { labels: [] })).warnings).toStrictEqual([
        '/unlabel bug: #7 has none of those labels',
      ])
      expect((yield* answer('/unlabel')).warnings).toStrictEqual(['/unlabel: name at least one label'])
    }),
  )

  it.effect('/assign and /unassign take logins, or the commenter when none are named', () =>
    Effect.gen(function* () {
      const self = yield* answer('/assign')
      expect(bodyOf(self.github, 'POST /issues/7/assignees')).toStrictEqual({ assignees: ['maya'] })
      const others = yield* answer('/unassign @sam renovate[bot]')
      expect(bodyOf(others.github, 'DELETE /issues/7/assignees')).toStrictEqual({ assignees: ['sam', 'renovate[bot]'] })
      expect(others.changes).toStrictEqual(['/unassign @sam renovate[bot]: unassigned @sam, @renovate[bot] from #7'])
      expect((yield* answer('/assign not/a-login')).warnings).toStrictEqual([
        '/assign not/a-login: name people by their GitHub login, such as @octocat',
      ])
      expect((yield* answer('/unassign @@x')).warnings).toHaveLength(1)
    }),
  )

  it.effect('/reviewer and /unreviewer take people and teams', () =>
    Effect.gen(function* () {
      const added = yield* answer('/reviewer @kai @Resnovas/maintainers')
      expect(bodyOf(added.github, 'POST /pulls/7/requested_reviewers')).toStrictEqual({
        reviewers: ['kai'],
        team_reviewers: ['maintainers'],
      })
      expect(added.changes).toStrictEqual([
        '/reviewer @kai @Resnovas/maintainers: requested reviews from @kai, team maintainers on #7',
      ])
      const removed = yield* answer('/unreviewer kai')
      expect(removed.changes).toStrictEqual(['/unreviewer kai: withdrew the review requests to @kai on #7'])
      expect((yield* answer('/reviewer')).warnings).toStrictEqual(['/reviewer: name at least one person or team'])
      expect((yield* answer('/reviewer a/b/c')).warnings).toStrictEqual([
        '/reviewer a/b/c: "a/b/c" is not a login or a team, such as @octocat or @org/team',
      ])
    }),
  )
})

describe('commands: state', () => {
  it.effect("/retitle changes the title, within GitHub's length", () =>
    Effect.gen(function* () {
      const { github } = yield* answer('/retitle fix(api): handle "empty" bodies')
      expect(bodyOf(github, 'PATCH /issues/7')).toStrictEqual({ title: 'fix(api): handle "empty" bodies' })
      expect((yield* answer('/retitle')).warnings).toStrictEqual(['/retitle: give the new title'])
      expect((yield* answer(`/retitle ${'x'.repeat(257)}`)).warnings[0]).toContain('at most 256 characters')
    }),
  )

  it.effect('/close takes a reason on an issue only, and /reopen reopens', () =>
    Effect.gen(function* () {
      expect(bodyOf((yield* answer('/close')).github, 'PATCH /issues/7')).toStrictEqual({ state: 'closed' })
      const reasoned = yield* answer('/close Not-Planned', {}, { pullRequest: false })
      expect(bodyOf(reasoned.github, 'PATCH /issues/7')).toStrictEqual({ state: 'closed', state_reason: 'not_planned' })
      expect((yield* answer('/close duplicate')).warnings).toStrictEqual([
        '/close duplicate: a pull request is closed without a reason',
      ])
      expect((yield* answer('/close later', {}, { pullRequest: false })).warnings).toStrictEqual([
        '/close later: the reason is completed, not-planned or duplicate',
      ])
      expect((yield* answer('/close completed twice', {}, { pullRequest: false })).warnings).toHaveLength(1)
      expect(bodyOf((yield* answer('/reopen')).github, 'PATCH /issues/7')).toStrictEqual({ state: 'open' })
    }),
  )

  it.effect('/lock takes an optional reason, and /unlock unlocks', () =>
    Effect.gen(function* () {
      expect(bodyOf((yield* answer('/lock Too-Heated')).github, 'PUT /issues/7/lock')).toStrictEqual({
        lock_reason: 'too heated',
      })
      expect(bodyOf((yield* answer('/lock')).github, 'PUT /issues/7/lock')).toStrictEqual({})
      expect((yield* answer('/lock boring')).warnings).toStrictEqual([
        '/lock boring: the reason is off-topic, too-heated, resolved or spam',
      ])
      expect((yield* answer('/lock spam spam')).warnings).toHaveLength(1)
      expect(calls((yield* answer('/unlock')).github)).toContain('DELETE /issues/7/lock')
    }),
  )
})

describe('commands: pull requests', () => {
  it.effect('/draft, /ready and /rebase run GraphQL mutations on the pull request', () =>
    Effect.gen(function* () {
      const { github, changes } = yield* answer('/draft\n/ready\n/rebase')
      expect(github.state.graphql.map((call) => [call.query.match(/\{ (\w+)\(/)?.[1], call.variables])).toStrictEqual([
        ['convertPullRequestToDraft', { id: 'PR_7' }],
        ['markPullRequestReadyForReview', { id: 'PR_7' }],
        ['updatePullRequestBranch', { id: 'PR_7' }],
      ])
      expect(changes).toStrictEqual([
        '/draft: made #7 a draft',
        '/ready: marked #7 ready for review',
        '/rebase: rebased #7 on its base branch',
      ])
    }),
  )

  it.effect('/update merges the base branch in', () =>
    Effect.map(answer('/update'), ({ github }) =>
      expect(bodyOf(github, 'PUT /pulls/7/update-branch')).toStrictEqual({}),
    ),
  )

  it.effect("/approve approves on the commenter's behalf, never on the author's own pull request", () =>
    Effect.gen(function* () {
      const { github } = yield* answer('/approve')
      expect(github.state.pulls.get(7)?.submittedReviews).toStrictEqual([
        { event: 'APPROVE', body: 'Approved on behalf of @maya, who asked with `/approve`.' },
      ])
      const own = yield* answer('/approve', {}, { author: 'Maya' })
      expect(own.warnings).toStrictEqual(['/approve: you cannot approve your own pull request'])
    }),
  )

  it.effect('/merge uses the method given, the configured one, or squash', () =>
    Effect.gen(function* () {
      expect(bodyOf((yield* answer('/merge')).github, 'PUT /pulls/7/merge')).toStrictEqual({ merge_method: 'squash' })
      expect(bodyOf((yield* answer('/merge REBASE')).github, 'PUT /pulls/7/merge')).toStrictEqual({
        merge_method: 'rebase',
      })
      const configured = yield* answer('/merge', {}, {}, { version: 2, commands: { mergeMethod: 'merge' } })
      expect(bodyOf(configured.github, 'PUT /pulls/7/merge')).toStrictEqual({ merge_method: 'merge' })
      expect((yield* answer('/merge fast-forward')).warnings).toStrictEqual([
        '/merge fast-forward: the method is merge, squash or rebase',
      ])
      expect((yield* answer('/merge squash now')).warnings).toHaveLength(1)
    }),
  )

  it.effect('/automerge turns auto-merge on with a method, or off', () =>
    Effect.gen(function* () {
      const on = yield* answer('/automerge rebase')
      expect(on.github.state.graphql[0]?.variables).toStrictEqual({ id: 'PR_7', method: 'REBASE' })
      expect(on.changes).toStrictEqual(['/automerge rebase: turned on auto-merge (rebase) for #7'])
      const off = yield* answer('/automerge OFF')
      expect(off.github.state.graphql[0]?.query).toContain('disablePullRequestAutoMerge')
      expect((yield* answer('/automerge later')).warnings).toStrictEqual([
        '/automerge later: the method is merge, squash, rebase or off',
      ])
    }),
  )
})

describe('commands: stale-snooze', () => {
  const stale = {
    version: 2 as const,
    commands: { snoozeDays: 10 },
    stale: { staleAfterDays: 30, staleLabel: 'stale' },
  }

  it.effect('snoozes for the configured days, or those given, and takes the stale label off', () =>
    Effect.gen(function* () {
      const { github, changes } = yield* answer('/stale-snooze', {}, { labels: ['stale'] }, stale)
      const until = new Date(NOW + 10 * DAY)
      expect(replies(github)).toStrictEqual([snoozeBody('@maya snoozed stale checks on this until 2026-10-06.', until)])
      expect(changes).toStrictEqual(['/stale-snooze: snoozed stale checks on #7 until 2026-10-06, and removed "stale"'])
      expect((yield* answer('/stale-snooze 1', {}, {}, stale)).changes).toStrictEqual([
        '/stale-snooze 1: snoozed stale checks on #7 until 2026-09-27',
      ])
      expect(
        (yield* answer('/stale-snooze', {}, {}, { version: 2, commands: {}, stale: stale.stale })).changes[0],
      ).toContain('until 2026-10-26')
    }),
  )

  it.effect('refuses bad days, and works only with the stale feature configured', () =>
    Effect.gen(function* () {
      for (const days of ['0', '366', '1.5', 'soon', '3 4']) {
        expect((yield* answer(`/stale-snooze ${days}`, {}, {}, stale)).warnings).toStrictEqual([
          `/stale-snooze ${days}: give a whole number of days from 1 to 365`,
        ])
      }
      expect((yield* answer('/stale-snooze')).warnings).toStrictEqual([
        '/stale-snooze: the stale feature is not configured',
      ])
    }),
  )
})

describe('commands: backport', () => {
  const mergedPull = ok(pull({ state: 'closed', merged: true, merge_commit_sha: 'm1' }))

  it.effect('labels an open pull request to backport on merge', () =>
    Effect.gen(function* () {
      const { github, changes } = yield* answer('/backport release/1.x v2')
      expect(github.state.issues.get(7)?.labels).toStrictEqual(['backport release/1.x', 'backport v2'])
      expect(changes).toStrictEqual([
        '/backport release/1.x v2: will backport #7 to `release/1.x`, `v2` when it is merged',
      ])
    }),
  )

  it.effect('backports a merged pull request now, reporting each target', () =>
    Effect.gen(function* () {
      const { warnings, changes } = yield* answer('/backport v1 v2', {
        'GET /pulls/7': mergedPull,
        'GET /git/ref/heads/v1': fail(new NotFound({ operation: 'x', detail: 'y' })),
        'GET /git/ref/heads/v2': fail(new Unavailable({ operation: 'GET ref', detail: 'boom' })),
      })
      expect(changes).toStrictEqual([])
      expect(warnings).toStrictEqual([
        '/backport v1 v2: there is no branch called `v1`; backporting to `v2` failed: GET ref: GitHub unavailable (boom)',
      ])
    }),
  )

  it.effect('refuses no branch, a bad branch name, and a pull request closed unmerged', () =>
    Effect.gen(function* () {
      expect((yield* answer('/backport')).warnings).toStrictEqual(['/backport: name at least one branch'])
      expect((yield* answer('/backport ../main')).warnings).toStrictEqual([
        '/backport ../main: "../main" is not a branch name',
      ])
      expect((yield* answer('/backport v1', { 'GET /pulls/7': ok(pull({ state: 'closed' })) })).warnings).toStrictEqual(
        ['/backport v1: #7 was closed without being merged'],
      )
    }),
  )
})

describe('commands: run', () => {
  const result = (overrides: Partial<RunResult> = {}): RunResult => ({
    envelope: { kind: 'repository', event: 'workflow_dispatch' },
    ran: [],
    skipped: [],
    failed: [],
    durations: {},
    findings: [],
    changes: [],
    facts: [],
    ...overrides,
  })
  const features: Runner['features'] = [
    { name: 'conventions', handles: ['pullRequest', 'issue'] },
    { name: 'reviews', handles: ['pullRequest'] },
    { name: 'settings', handles: ['repository'] },
    { name: 'commands', handles: ['comment', 'pullRequest'] },
  ]
  const recording = (answerWith: (features: ReadonlyArray<string>) => Effect.Effect<RunResult, unknown>) => {
    const requests: Array<{ readonly event: string; readonly features: ReadonlyArray<string> }> = []
    const runner: Runner = {
      features,
      run: (request) => {
        requests.push({ event: request.event.name, features: request.features })
        return answerWith(request.features)
      },
    }
    return { runner, requests }
  }

  it.effect('runs every feature for the item when none are named, on a fresh event for it', () =>
    Effect.gen(function* () {
      const { runner, requests } = recording((names) => Effect.succeed(result({ ran: [...names] })))
      const { changes } = yield* answer('/run', {}, {}, base, runner)
      expect(requests).toStrictEqual([{ event: 'pull_request', features: ['conventions', 'reviews'] }])
      expect(changes).toStrictEqual(['/run: ran conventions, reviews on #7: 0 error(s), 0 warning(s)'])
      const onIssue = yield* answer(
        '/run',
        { 'GET /issues/7': ok({ number: 7 }) },
        { pullRequest: false },
        base,
        runner,
      )
      expect(requests[1]).toStrictEqual({ event: 'issues', features: ['conventions'] })
      expect(onIssue.changes).toHaveLength(1)
    }),
  )

  it.effect('runs repository features as a manual dispatch, for maintainers only, and lists what they found', () =>
    Effect.gen(function* () {
      const found = result({
        ran: ['settings'],
        failed: [{ feature: 'conventions', message: 'boom' }],
        findings: [
          { feature: 'settings', rule: 'x', level: 'error', message: 'drifted' },
          { feature: 'settings', rule: 'y', level: 'warning', message: 'hmm' },
        ],
      })
      const { runner, requests } = recording(() => Effect.succeed(found))
      const maintainer = { 'GET /collaborators/maya/permission': ok(role('maintain')) }
      const { github, changes } = yield* answer('/run Conventions settings', maintainer, {}, base, runner)
      expect(requests.map((request) => request.event)).toStrictEqual(['pull_request', 'workflow_dispatch'])
      expect(changes[0]).toBe(
        '/run Conventions settings: ran settings, conventions on #7: 1 error(s), 1 warning(s), 1 failed to run; ran settings, conventions on the repository: 1 error(s), 1 warning(s), 1 failed to run',
      )
      expect(replies(github)[0]).toContain('- **settings** error: drifted')
      expect(replies(github)[0]).toContain('- **conventions** failed to run')
      const admin = yield* answer(
        '/run settings',
        { 'GET /collaborators/maya/permission': ok(role('admin')) },
        {},
        base,
        recording(() => Effect.succeed(result())).runner,
      )
      expect(admin.changes).toStrictEqual(['/run settings: ran nothing on the repository: 0 error(s), 0 warning(s)'])
      expect((yield* answer('/run settings', {}, {}, base, runner)).warnings).toStrictEqual([
        '/run settings: running settings changes the whole repository, which needs the maintain role',
      ])
    }),
  )

  it.effect('refuses unknown features, itself, and features that cannot run on the item', () =>
    Effect.gen(function* () {
      const { runner } = recording(() => Effect.succeed(result()))
      expect((yield* answer('/run deploy commands', {}, {}, base, runner)).warnings).toStrictEqual([
        '/run deploy commands: no feature called deploy, commands; there are conventions, reviews, settings',
      ])
      expect(
        (yield* answer('/run reviews', { 'GET /issues/7': ok({}) }, { pullRequest: false }, base, runner)).warnings,
      ).toStrictEqual(['/run reviews: reviews cannot run on an issue'])
      expect((yield* answer('/run')).warnings).toStrictEqual(['/run: running features is not available here'])
    }),
  )

  it.effect('reports a run that fails, with what ran before it', () =>
    Effect.gen(function* () {
      const broken = recording(() => Effect.fail(new Exploded({ message: 'exploded' })))
      expect((yield* answer('/run', {}, {}, base, broken.runner)).warnings).toStrictEqual([
        '/run: running failed: exploded',
      ])
      const odd = recording(() => Effect.fail('odd'))
      expect((yield* answer('/run', {}, {}, base, odd.runner)).warnings).toStrictEqual(['/run: running failed: odd'])
      const unreadable = recording(() => Effect.succeed(result()))
      const failed = yield* answer(
        '/run',
        { 'GET /pulls/7': fail(new ValidationFailed({ operation: 'GET /pulls/7', detail: 'gone' })) },
        {},
        base,
        unreadable.runner,
      )
      expect(failed.warnings[0]).toContain('running failed: GET /pulls/7')
    }),
  )
})

describe('COMMANDS', () => {
  it('describes every command for /help', () => {
    for (const spec of Object.values(COMMANDS)) {
      expect(spec.usage.startsWith('/')).toBe(true)
      expect(spec.summary.endsWith('.')).toBe(true)
    }
  })
})
