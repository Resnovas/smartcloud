/**
 * @file tests/feature.automerge/src/automerge.spec.ts
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
import type { Subject } from '@resnovas/conditions'
import { makeReport, Report } from '@resnovas/engine'
import { autoMergeMarker, matchingRule, runAutoMerge } from '@resnovas/feature.automerge'
import { Forbidden, GitHub, Unavailable, ValidationFailed } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { commentsOf, config, MINOR, memory, PATCH, payload, run } from './fixtures.js'

const ON = autoMergeMarker('on')
const OFF = autoMergeMarker('off')
const ours = (body: string) => ({ id: 1, body, author: 'smartcloud[bot]', bot: true })
const unmatched = config({ rules: { minor: { when: MINOR } }, disableWhenUnmatched: true })

describe('matchingRule', () => {
  const subject: Subject = {
    kind: 'pullRequest',
    number: 7,
    title: 'Bump effect from 3.1.0 to 3.1.1',
    body: '',
    author: 'dependabot[bot]',
    open: true,
    locked: false,
    labels: [],
    assignees: [],
    updatedAt: new Date(0),
  }

  it.effect('returns the first rule that passes, in order, with its method', () =>
    Effect.gen(function* () {
      const rules = {
        minor: { when: MINOR, method: 'merge' as const },
        patch: { when: PATCH, method: 'rebase' as const },
      }
      expect(yield* matchingRule(rules, subject)).toStrictEqual({ key: 'patch', method: 'rebase' })
      expect(yield* matchingRule({ minor: { when: MINOR } }, subject)).toBeUndefined()
    }),
  )
})

describe('turning auto-merge on', () => {
  it.effect('turns it on with squash for a pull request a rule matches, and comments why', () =>
    Effect.gen(function* () {
      const github = memory()
      const result = yield* run(config(), github)
      expect(github.mutations).toHaveLength(1)
      expect(github.mutations[0]?.query).toContain('enablePullRequestAutoMerge')
      expect(github.mutations[0]?.variables).toStrictEqual({ id: 'PR_7', method: 'SQUASH' })
      expect(result.changes).toStrictEqual([
        { feature: 'automerge', description: 'Turned on auto-merge (squash) for #7 (patch).' },
      ])
      expect(result.findings).toStrictEqual([])
      expect(commentsOf(github)).toStrictEqual([
        `${ON}\nAuto-merge is on (squash), because the \`patch\` auto-merge rule matched. GitHub merges this pull request once its required reviews and checks pass.`,
      ])
    }),
  )

  it.effect('uses the method the rule names', () =>
    Effect.gen(function* () {
      const github = memory()
      yield* run(config({ rules: { patch: { when: PATCH, method: 'rebase' } } }), github)
      expect(github.mutations[0]?.variables).toStrictEqual({ id: 'PR_7', method: 'REBASE' })
    }),
  )

  it.effect('leaves auto-merge that is already on alone, whoever turned it on', () =>
    Effect.gen(function* () {
      const github = memory({ autoMerge: { enabledBy: 'maya', method: 'merge' } })
      const result = yield* run(config(), github)
      expect(github.mutations).toStrictEqual([])
      expect(result.changes).toStrictEqual([])
      expect(commentsOf(github)).toStrictEqual([])
    }),
  )

  it.effect('edits its earlier comment rather than adding another, and ignores untrusted look-alikes', () =>
    Effect.gen(function* () {
      const fake = { id: 2, body: `${OFF}\nfake`, author: 'mallory', bot: false }
      const github = memory({ comments: [fake, ours(`${OFF}\nAuto-merge was turned off.`)] })
      yield* run(config(), github)
      const bodies = commentsOf(github)
      expect(bodies).toHaveLength(2)
      expect(bodies[0]).toBe(fake.body)
      expect(bodies[1]?.startsWith(ON)).toBe(true)
      // A second run with auto-merge off again finds the comment already right.
      github.pull.autoMerge = undefined
      yield* run(config(), github)
      expect(commentsOf(github)).toStrictEqual(bodies)
    }),
  )

  it.effect('does nothing for a draft or a closed pull request', () =>
    Effect.gen(function* () {
      const github = memory()
      yield* run(config(), github, payload({ draft: true }))
      yield* run(config(), github, payload({ state: 'closed', action: 'closed' }))
      expect(github.mutations).toStrictEqual([])
    }),
  )

  it.effect('does nothing when GitHub says the pull request has closed since the event', () =>
    Effect.gen(function* () {
      const github = memory({ state: 'closed' })
      yield* run(config(), github)
      expect(github.mutations).toStrictEqual([])
    }),
  )

  it.effect('warns when the repository does not allow auto-merge', () =>
    Effect.gen(function* () {
      const refuse = new ValidationFailed({
        operation: 'graphql',
        detail: 'Pull request Auto merge is not allowed for this repository',
      })
      const result = yield* run(config(), memory({ refuse }))
      expect(result.failed).toStrictEqual([])
      expect(result.findings).toMatchObject([{ level: 'warning', rule: 'autoMerge' }])
      expect(result.findings[0]?.message).toContain('settings.repository.autoMerge')
    }),
  )

  it.effect('notes a pull request GitHub could merge straight away', () =>
    Effect.gen(function* () {
      const refuse = new ValidationFailed({ operation: 'graphql', detail: 'Pull request is in clean status' })
      const result = yield* run(config(), memory({ refuse }))
      expect(result.findings).toMatchObject([{ level: 'notice' }])
    }),
  )

  it.effect('warns on a read-only token, and reports other failures as errors without failing the run', () =>
    Effect.gen(function* () {
      const readOnly = yield* run(config(), memory({ refuse: new Forbidden({ operation: 'graphql', detail: 'no' }) }))
      expect(readOnly.findings).toMatchObject([{ level: 'warning' }])
      expect(readOnly.findings[0]?.message).toContain('read-only token')
      const broken = yield* run(config(), memory({ refuse: new Unavailable({ operation: 'graphql', detail: 'down' }) }))
      expect(broken.failed).toStrictEqual([])
      expect(broken.findings).toMatchObject([{ level: 'error' }])
      expect(broken.findings[0]?.message).toContain('graphql: GitHub unavailable (down)')
    }),
  )
})

describe('turning auto-merge off', () => {
  it.effect('turns off auto-merge smartcloud turned on once no rule matches, and edits its comment', () =>
    Effect.gen(function* () {
      const github = memory({
        autoMerge: { enabledBy: 'smartcloud[bot]', method: 'squash' },
        comments: [ours(`${ON}\nAuto-merge is on.`)],
      })
      const result = yield* run(unmatched, github)
      expect(github.mutations.map(({ query }) => query.includes('disablePullRequestAutoMerge'))).toStrictEqual([true])
      expect(github.pull.autoMerge).toBeUndefined()
      expect(result.changes).toStrictEqual([
        {
          feature: 'automerge',
          description: 'Turned off auto-merge for #7, because no auto-merge rule matches it any more.',
        },
      ])
      expect(commentsOf(github)).toStrictEqual([
        `${OFF}\nAuto-merge was turned off, because no auto-merge rule matches this pull request any more.`,
      ])
    }),
  )

  it.effect('leaves auto-merge someone else turned on, or on without its comment, alone', () =>
    Effect.gen(function* () {
      const byPerson = memory({
        autoMerge: { enabledBy: 'maya', method: 'squash' },
        comments: [ours(`${ON}\nAuto-merge is on.`)],
      })
      yield* run(unmatched, byPerson)
      expect(byPerson.mutations).toStrictEqual([])
      const noComment = memory({ autoMerge: { enabledBy: 'smartcloud[bot]', method: 'squash' } })
      yield* run(unmatched, noComment)
      expect(noComment.mutations).toStrictEqual([])
      const turnedOff = memory({
        autoMerge: { enabledBy: 'smartcloud[bot]', method: 'squash' },
        comments: [ours(`${OFF}\nAuto-merge was turned off.`)],
      })
      yield* run(unmatched, turnedOff)
      expect(turnedOff.mutations).toStrictEqual([])
    }),
  )

  it.effect('does nothing while auto-merge is off, or without disableWhenUnmatched', () =>
    Effect.gen(function* () {
      const off = memory()
      yield* run(config({ disableWhenUnmatched: true }), off)
      expect(off.mutations).toStrictEqual([])
      const kept = memory({ autoMerge: { enabledBy: 'smartcloud[bot]', method: 'squash' }, comments: [ours(ON)] })
      yield* run(config({ rules: { minor: { when: MINOR } } }), kept)
      expect(kept.mutations).toStrictEqual([])
    }),
  )

  it.effect('warns on a read-only token, and reports other failures as errors', () =>
    Effect.gen(function* () {
      const readOnly = yield* run(unmatched, memory({ readError: new Forbidden({ operation: 'read', detail: 'no' }) }))
      expect(readOnly.findings).toMatchObject([{ level: 'warning' }])
      const broken = yield* run(
        unmatched,
        memory({ readError: new Unavailable({ operation: 'read', detail: 'down' }) }),
      )
      expect(broken.findings).toMatchObject([{ level: 'error' }])
      expect(broken.findings[0]?.message).toBe('Could not turn off auto-merge for #7: read: GitHub unavailable (down)')
    }),
  )
})

describe('runAutoMerge', () => {
  it.effect('ignores an issue, and a config without an autoMerge section', () =>
    Effect.gen(function* () {
      const github = memory()
      const report = yield* makeReport
      const subject: Subject = {
        kind: 'issue',
        number: 7,
        title: 'Bump effect from 3.1.0 to 3.1.1',
        body: '',
        author: 'dependabot[bot]',
        open: true,
        locked: false,
        labels: [],
        assignees: [],
        updatedAt: new Date(0),
      }
      const provide = <A, E>(effect: Effect.Effect<A, E, GitHub | Report>) =>
        effect.pipe(Effect.provideService(GitHub, github.service), Effect.provideService(Report, report))
      yield* provide(runAutoMerge(config(), subject))
      yield* provide(runAutoMerge({ version: 2 }, { ...subject, kind: 'pullRequest' }))
      expect(github.mutations).toStrictEqual([])
    }),
  )
})
