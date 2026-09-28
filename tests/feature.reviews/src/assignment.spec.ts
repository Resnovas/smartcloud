/**
 * @file tests/feature.reviews/src/assignment.spec.ts
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
import type { Subject, Review } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report } from '@resnovas/engine'
import { ownersForFiles, reviewsFeature } from '@resnovas/feature.reviews'
import { Forbidden, GitHub, makeMemoryGitHub, RateLimited, type RepositoryRequest } from '@resnovas/integrations.github'
import { Effect } from 'effect'

const subject: Subject = {
  kind: 'pullRequest',
  number: 7,
  title: 'Docs',
  body: '',
  author: 'AUTHOR',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
  reviews: [],
  pendingReviewers: 0,
}
type Rule = NonNullable<NonNullable<SmartcloudConfig['reviews']>['requestApprovals']>[string]
const rule = (strategy: NonNullable<Rule['strategy']>, reviewers = ['ann', 'bo', 'cy']): Rule => ({
  reviewers,
  strategy,
  when: { condition: [] },
})
const run = (
  config: Rule,
  options: {
    readonly pending?: ReadonlyArray<string>
    readonly reviews?: ReadonlyArray<Review>
    readonly subject?: Partial<Subject>
    readonly files?: ReadonlyArray<string>
    readonly codeowners?: ReadonlyArray<readonly [string, string]>
    readonly loads?: ReadonlyArray<ReadonlyArray<string>>
    readonly pastTeams?: ReadonlyArray<string>
    readonly forbidden?: boolean
    readonly rateLimited?: boolean
  } = {},
) =>
  Effect.gen(function* () {
    const github = makeMemoryGitHub({
      pulls: new Map([
        [
          7,
          {
            commits: [],
            files: [...(options.files ?? ['docs/guide.md'])],
            reviews: [],
            requestedReviewers: [],
            submittedReviews: [],
          },
        ],
      ]),
      openPullRequests: [7, ...(options.loads ?? []).map((_, index) => index + 10)].map((number) => ({
        number,
        headSha: 'head',
        labels: [],
        draft: false,
      })),
    })
    for (const [path, text] of options.codeowners ?? [])
      github.state.files.set(
        `${github.service.coordinates.owner}/${github.service.coordinates.repo}/${path}@base-sha`,
        text,
      )
    const writes: Array<RepositoryRequest> = []
    const pending = [...(options.pending ?? [])]
    const service = {
      ...github.service,
      repositoryRequest: (request: RepositoryRequest) => {
        if (options.forbidden) return Effect.fail(new Forbidden({ operation: 'assignment', detail: 'read only' }))
        if (options.rateLimited) return Effect.fail(new RateLimited({ operation: 'assignment', detail: 'rate limit' }))
        if (request.method === 'POST') {
          writes.push(request)
          return Effect.succeed(null)
        }
        if (request.path.includes('/timeline?'))
          return Effect.succeed(
            (options.pastTeams ?? []).map((slug) => ({ event: 'review_requested', requested_team: { slug } })),
          )
        const number = Number(request.path.split('/').at(-1))
        const names = number === 7 ? pending : (options.loads?.[number - 10] ?? [])
        return Effect.succeed({
          base: { sha: 'base-sha' },
          requested_reviewers: names.filter((name) => !name.includes('/')).map((login) => ({ login })),
          requested_teams: names.filter((name) => name.includes('/')).map((name) => ({ slug: name.split('/')[1] })),
        })
      },
    }
    const report = yield* makeReport
    yield* reviewsFeature
      .run({
        config: { version: 2, reviews: { requestApprovals: { selection: config } } },
        subject: { ...subject, reviews: options.reviews ?? [], ...options.subject },
        envelope: { kind: 'repository', event: 'schedule' },
      })
      .pipe(Effect.provideService(GitHub, service), Effect.provideService(Report, report))
    return { writes, report: yield* report.snapshot }
  })

describe('CODEOWNERS matching', () => {
  it('honours precedence, empty ownership, invalid rules, emails and case-sensitive paths', () => {
    expect(
      ownersForFiles(
        '* @Ann @ANN\n/docs/ @Acme/docs\n/docs/private/\n!bad @wrong\n[bad] @wrong\n*.ts @Cy person@example.com\n*.md invalid',
        ['a', 'docs/guide.md', 'docs/private/secret', 'src/a.ts', 'DOCS/b'],
      ),
    ).toEqual(['ann', 'acme/docs', 'cy'])
    expect(ownersForFiles('/root @ann\ndocs/ @bo\nfile?.txt @cy', ['nested/root', 'x/docs/a', 'x/file1.txt'])).toEqual([
      'bo',
      'cy',
    ])
    expect(ownersForFiles('/docs/* @ann\n/docs/**/index.md @bo', ['docs/nested/index.md'])).toEqual(['bo'])
    expect(ownersForFiles('foo\\ bar @ann', ['foo bar'])).toEqual(['ann'])
    expect(ownersForFiles('/docs/ @ann', ['docs'])).toEqual([])
    expect(ownersForFiles('docs/* @ann', ['docs/nested/file.md'])).toEqual([])
    expect(ownersForFiles('docs/* @ann', ['docs/file.md'])).toEqual(['ann'])
    expect(ownersForFiles('**/logs @ann', ['deep/logs/file.md'])).toEqual(['ann'])
    expect(ownersForFiles('file{a,b} @ann', ['filea'])).toEqual([])
    expect(ownersForFiles('a(b) @ann', ['ab'])).toEqual([])
    expect(ownersForFiles('a(b) @ann', ['a(b)'])).toEqual(['ann'])
  })
})

describe('reviewer assignment', () => {
  it.effect('rotates by PR number and caps requests', () =>
    Effect.gen(function* () {
      expect((yield* run(rule('round-robin'))).writes[0]?.body).toEqual({ reviewers: ['ann'], team_reviewers: [] })
      expect((yield* run({ ...rule('round-robin'), count: 8 })).writes[0]?.body).toEqual({
        reviewers: ['ann', 'bo', 'cy'],
        team_reviewers: [],
      })
    }),
  )
  it.effect('excludes author and deduplicates case-insensitively', () =>
    Effect.gen(function* () {
      expect((yield* run(rule('round-robin', ['@author', 'Ann', '@ANN', 'bo']))).writes[0]?.body).toEqual({
        reviewers: ['ann'],
        team_reviewers: [],
      })
    }),
  )
  it.effect("keeps the pool's turn when the author is in it", () =>
    Effect.gen(function* () {
      const pool = rule('round-robin', ['ann', 'bo', 'cy', 'di'])
      // #7 turns the pool of four by 6 % 4 = 2, to cy, whether or not bo wrote it.
      expect((yield* run(pool)).writes[0]?.body).toEqual({ reviewers: ['cy'], team_reviewers: [] })
      expect((yield* run(pool, { subject: { author: 'bo' } })).writes[0]?.body).toEqual({
        reviewers: ['cy'],
        team_reviewers: [],
      })
      expect((yield* run(pool, { subject: { author: 'cy' } })).writes[0]?.body).toEqual({
        reviewers: ['di'],
        team_reviewers: [],
      })
    }),
  )
  it.effect('counts pending and completed reviews without notifying them again', () =>
    Effect.gen(function* () {
      expect((yield* run(rule('round-robin'), { pending: ['ANN'] })).writes).toEqual([])
      expect((yield* run(rule('round-robin'), { reviews: [{ author: 'ANN', state: 'APPROVED' }] })).writes).toEqual([])
      expect((yield* run({ ...rule('round-robin'), count: 2 }, { pending: ['ann'] })).writes[0]?.body).toEqual({
        reviewers: ['bo'],
        team_reviewers: [],
      })
      expect((yield* run(rule('round-robin'), { reviews: [{ author: 'ann', state: 'PENDING' }] })).writes).toHaveLength(
        1,
      )
      expect((yield* run({ ...rule('round-robin'), count: 9 }, { pending: ['ann', 'bo', 'cy'] })).writes).toEqual([])
    }),
  )
  it.effect('does not assign drafts, closed PRs or empty pools', () =>
    Effect.gen(function* () {
      expect((yield* run(rule('round-robin'), { subject: { draft: true } })).writes).toEqual([])
      expect((yield* run(rule('round-robin'), { subject: { open: false } })).writes).toEqual([])
      expect((yield* run(rule('round-robin', []))).writes).toEqual([])
    }),
  )
  it.effect('balances pending reviews across open PRs with stable ties', () =>
    Effect.gen(function* () {
      expect(
        (yield* run(rule('load-balanced'), { loads: [['ann'], ['ANN', 'bo'], ['ann', 'bo']] })).writes[0]?.body,
      ).toEqual({ reviewers: ['cy'], team_reviewers: [] })
      expect((yield* run({ ...rule('load-balanced'), count: 2 }, { loads: [['ann', 'ANN']] })).writes[0]?.body).toEqual(
        { reviewers: ['bo', 'cy'], team_reviewers: [] },
      )
    }),
  )
  it.effect('reads the first CODEOWNERS at the base commit and requests users and teams', () =>
    Effect.gen(function* () {
      const result = yield* run(
        { ...rule('codeowners', []), count: 2 },
        {
          codeowners: [
            ['.github/CODEOWNERS', '* @Ann @Resnovas/docs'],
            ['CODEOWNERS', '* @wrong'],
          ],
        },
      )
      expect(result.writes[0]?.body).toEqual({ reviewers: ['ann'], team_reviewers: ['docs'] })
      expect(
        (yield* run(rule('codeowners', ['ann']), { codeowners: [['docs/CODEOWNERS', '* @Ann @other']] })).writes[0]
          ?.body,
      ).toEqual({ reviewers: ['ann'], team_reviewers: [] })
      expect((yield* run(rule('codeowners', []))).writes).toEqual([])
      expect((yield* run(rule('codeowners', []), { codeowners: [['CODEOWNERS', '* @OtherOrg/docs']] })).writes).toEqual(
        [],
      )
      expect(
        (yield* run(rule('codeowners', []), {
          codeowners: [['CODEOWNERS', '* @Resnovas/docs']],
          pending: ['Resnovas/docs'],
        })).writes,
      ).toEqual([])
    }),
  )
  it.effect('does not request a team again after a member reviewed or the team request was removed', () =>
    Effect.gen(function* () {
      expect(
        (yield* run(rule('codeowners', []), { codeowners: [['CODEOWNERS', '* @Resnovas/docs']], pastTeams: ['docs'] }))
          .writes,
      ).toEqual([])
    }),
  )

  it.effect('warns on inaccessible tokens and preserves rate-limit errors', () =>
    Effect.gen(function* () {
      expect((yield* run(rule('round-robin'), { forbidden: true })).report.findings[0]?.level).toBe('warning')
      const result = yield* Effect.either(run(rule('round-robin'), { rateLimited: true }))
      expect(result._tag).toBe('Left')
    }),
  )
})
