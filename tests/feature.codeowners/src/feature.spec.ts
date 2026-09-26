/**
 * @file tests/feature.codeowners/src/feature.spec.ts
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
import type { CodeOwnersRule, SmartcloudConfig } from '@resnovas/config'
import { decodeEvent, makeReport, Report, runFeatures } from '@resnovas/engine'
import {
  CodeOwnersBranchIsBase,
  codeownersErrors,
  codeownersFeature,
  combineProblems,
  DEFAULT_CODEOWNERS_BRANCH,
  editsGenerated,
  FEATURE,
  GENERATED_RULE,
  renderGenerated,
  SHADOWED_RULE,
  SYNTAX_RULE,
} from '@resnovas/feature.codeowners'
import {
  DryRun,
  DryRunLog,
  fileKey,
  Forbidden,
  GitHub,
  type GitHubService,
  makeMemoryGitHub,
  type MemoryState,
} from '@resnovas/integrations.github'
import { Effect } from 'effect'

const SHA = 'head-sha'
const repo = (path: string, ref?: string) => fileKey('Resnovas', 'example', path, ref)

const rules: Readonly<Record<string, CodeOwnersRule>> = { docs: { paths: ['/docs/'], owners: ['@Resnovas/docs'] } }
const GENERATED = renderGenerated(rules)

const config = (codeowners: NonNullable<SmartcloudConfig['codeowners']> = {}): SmartcloudConfig => ({
  version: 2,
  codeowners,
})

const pullRequest = {
  action: 'synchronize',
  pull_request: {
    number: 7,
    title: 'chore: owners',
    body: '',
    user: { login: 'contributor' },
    state: 'open',
    locked: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'owners', sha: SHA },
  },
}

const seed = (
  files: ReadonlyArray<readonly [string, string]>,
  changed: ReadonlyArray<string> = ['.github/CODEOWNERS'],
  extra: Partial<MemoryState> = {},
) =>
  makeMemoryGitHub({
    files: new Map(files),
    pulls: new Map([
      [7, { commits: [], files: [...changed], reviews: [], requestedReviewers: [], submittedReviews: [] }],
    ]),
    ...extra,
  })

// GitHub's CODEOWNERS errors endpoint, answering for any ref.
const withErrors = (
  service: GitHubService,
  errors: ReadonlyArray<{ line: number; message: string; path: string }>,
): GitHubService => ({
  ...service,
  repositoryRequest: (request) =>
    request.path.startsWith('/codeowners/errors') ? Effect.succeed({ errors }) : service.repositoryRequest(request),
})

const run = (github: GitHubService, smartcloud: SmartcloudConfig, event: string, payload: unknown = {}) =>
  runFeatures({ config: smartcloud, event, payload, features: [codeownersFeature] }).pipe(
    Effect.provideService(GitHub, github),
  )

const findings = (result: Effect.Effect.Success<ReturnType<typeof run>>) =>
  result.findings.map((finding) => [finding.rule, finding.level, finding.message, finding.path, finding.line])

describe('codeownersFeature', () => {
  it('names the feature and its rules, and runs only when configured', () => {
    expect(FEATURE).toBe('codeowners')
    expect([SYNTAX_RULE, SHADOWED_RULE, GENERATED_RULE]).toStrictEqual([
      'codeowners.syntax',
      'codeowners.shadowed',
      'codeowners.generated',
    ])
    expect(DEFAULT_CODEOWNERS_BRANCH).toBe('smartcloud/codeowners')
    expect(codeownersFeature.enabled?.({ version: 2 })).toBe(false)
    expect(codeownersFeature.enabled?.(config())).toBe(true)
    expect(new CodeOwnersBranchIsBase({ branch: 'main' }).message).toContain('codeowners.branch is "main"')
  })

  it.effect('ignores issue events and a config without a codeowners section when run directly', () => {
    const { service, state } = seed([])
    return Effect.gen(function* () {
      const report = yield* makeReport
      const issue = yield* decodeEvent('issues', {
        action: 'opened',
        issue: { ...pullRequest.pull_request, number: 3 },
      })
      const repository = yield* decodeEvent('schedule', {})
      if (issue.kind === 'unsupported' || repository.kind === 'unsupported') return expect.unreachable()
      yield* codeownersFeature.run({ config: config(), envelope: issue }).pipe(Effect.provideService(Report, report))
      yield* codeownersFeature
        .run({ config: { version: 2 }, envelope: repository })
        .pipe(Effect.provideService(Report, report))
      expect(yield* report.snapshot).toStrictEqual({ findings: [], changes: [], facts: [] })
      expect(state.requests).toStrictEqual([])
    }).pipe(Effect.provideService(GitHub, service))
  })
})

describe('codeownersErrors and combineProblems', () => {
  it.effect("reads GitHub's errors at a ref, keeping the first line of each message", () =>
    Effect.gen(function* () {
      const { service, state } = seed([])
      const github = withErrors(service, [
        { line: 2, message: 'Unknown owner on line 2\n\n  * @ghost\n    ^', path: 'CODEOWNERS' },
      ])
      const errors = yield* codeownersErrors('feature/x').pipe(Effect.provideService(GitHub, github))
      expect(errors).toStrictEqual([
        { line: 2, path: 'CODEOWNERS', kind: 'syntax', message: 'Unknown owner on line 2' },
      ])
      expect(yield* codeownersErrors('main').pipe(Effect.provideService(GitHub, service))).toBeUndefined()
      expect(state.requests).toStrictEqual([{ method: 'GET', path: '/codeowners/errors?ref=main' }])
    }),
  )

  it("lets GitHub's errors stand for the lines they flag, and always adds shadowed rules", () => {
    const text = '* team\n* @a\nsrc/ nope\n'
    const github = [
      { path: 'CODEOWNERS', line: 1, kind: 'syntax' as const, message: 'Invalid owner on line 1' },
      { path: 'docs/CODEOWNERS', line: 3, kind: 'syntax' as const, message: 'Elsewhere' },
    ]
    expect(
      combineProblems('CODEOWNERS', text, github).map((problem) => [problem.path, problem.line, problem.kind]),
    ).toStrictEqual([
      ['CODEOWNERS', 1, 'syntax'],
      ['docs/CODEOWNERS', 3, 'syntax'],
      ['CODEOWNERS', 1, 'shadowed'],
      ['CODEOWNERS', 3, 'syntax'],
    ])
  })

  it('tells hand edits and removals of the generated block from regeneration', () => {
    expect(editsGenerated(GENERATED, null, `* @a\n${GENERATED}\n`)).toBeUndefined()
    expect(editsGenerated(GENERATED, null, '* @a\n')).toBeUndefined()
    expect(editsGenerated(GENERATED, '* @a\n', `${GENERATED.replace('@Resnovas/docs', '@b')}\n`)).toBe('edits')
    expect(editsGenerated(GENERATED, `${GENERATED}\n`, '* @a\n')).toBe('removes')
  })
})

describe('codeownersFeature on pull requests', () => {
  it.effect('does nothing when the pull request leaves CODEOWNERS alone, or when check is false', () =>
    Effect.gen(function* () {
      const { service, state } = seed([[repo('.github/CODEOWNERS', SHA), '!bad @a\n']], ['src/index.ts'])
      const untouched = yield* run(service, config(), 'pull_request', pullRequest)
      expect(untouched.ran).toStrictEqual([FEATURE])
      expect(untouched.findings).toStrictEqual([])
      const touched = seed([[repo('.github/CODEOWNERS', SHA), '!bad @a\n']])
      const off = yield* run(touched.service, config({ check: false }), 'pull_request', pullRequest)
      expect(off.findings).toStrictEqual([])
      expect([...state.requests, ...touched.state.requests]).toStrictEqual([])
    }),
  )

  it.effect("reports GitHub's errors and its own checks at the head, as errors by default", () =>
    Effect.gen(function* () {
      const { service } = seed([
        [repo('.github/CODEOWNERS', SHA), '* @ghost\n*.md docs\n* @a\n'],
        [repo('CODEOWNERS', SHA), 'not the one GitHub reads\n'],
      ])
      const github = withErrors(service, [
        { line: 1, message: 'Unknown owner on line 1: make sure @ghost exists', path: '.github/CODEOWNERS' },
      ])
      const result = yield* run(github, config(), 'pull_request', pullRequest)
      expect(findings(result)).toStrictEqual([
        [
          SYNTAX_RULE,
          'error',
          '.github/CODEOWNERS line 1: Unknown owner on line 1: make sure @ghost exists',
          '.github/CODEOWNERS',
          1,
        ],
        [
          SHADOWED_RULE,
          'warning',
          '.github/CODEOWNERS line 1: the rule for `*` never applies: line 3 has the same pattern, and the last matching rule wins',
          '.github/CODEOWNERS',
          1,
        ],
        [
          SYNTAX_RULE,
          'error',
          '.github/CODEOWNERS line 2: `docs` is not a user (@login), a team (@org/team) or an email address',
          '.github/CODEOWNERS',
          2,
        ],
      ])
    }),
  )

  it.effect("falls back to its own checks when GitHub's errors cannot be read, at the configured level and path", () =>
    Effect.gen(function* () {
      const { service } = seed([[repo('docs/CODEOWNERS', SHA), '!vendor/ @a\n']], ['docs/CODEOWNERS'])
      const github: GitHubService = {
        ...service,
        repositoryRequest: () =>
          Effect.fail(new Forbidden({ operation: 'GET /codeowners/errors', detail: 'Resource not accessible' })),
      }
      const result = yield* run(
        github,
        config({ path: 'docs/CODEOWNERS', level: 'warning' }),
        'pull_request',
        pullRequest,
      )
      expect(findings(result)).toStrictEqual([
        [
          SYNTAX_RULE,
          'warning',
          'docs/CODEOWNERS line 1: negation (!) is not supported in CODEOWNERS',
          'docs/CODEOWNERS',
          1,
        ],
      ])
      expect(result.failed).toStrictEqual([])
    }),
  )

  it.effect('passes a pull request that removes CODEOWNERS', () =>
    Effect.gen(function* () {
      const { service } = seed([[repo('.github/CODEOWNERS'), '* @a\n']])
      const result = yield* run(service, config({ rules }), 'pull_request', pullRequest)
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('fails a hand edit or removal of the generated block, and allows regenerating it', () =>
    Effect.gen(function* () {
      const edited = seed([
        [repo('.github/CODEOWNERS'), `* @a\n${GENERATED}\n`],
        [repo('.github/CODEOWNERS', SHA), `* @a\n${GENERATED.replace('@Resnovas/docs', '@a')}\n`],
      ])
      expect(findings(yield* run(edited.service, config({ rules }), 'pull_request', pullRequest))).toStrictEqual([
        [
          GENERATED_RULE,
          'error',
          '.github/CODEOWNERS edits the block generated from codeowners.rules. Change codeowners.rules in the smartcloud config instead; smartcloud regenerates the block.',
          '.github/CODEOWNERS',
          undefined,
        ],
      ])
      const removed = seed([
        [repo('.github/CODEOWNERS'), `* @a\n${GENERATED}\n`],
        [repo('.github/CODEOWNERS', SHA), '* @a\n'],
      ])
      const result = yield* run(removed.service, config({ rules, level: 'warning' }), 'pull_request', pullRequest)
      expect(result.findings.map((finding) => [finding.level, finding.message.split(' the block')[0]])).toStrictEqual([
        ['warning', '.github/CODEOWNERS removes'],
      ])
      const regenerated = seed([[repo('.github/CODEOWNERS', SHA), `* @a\n\n${GENERATED}\n`]])
      expect((yield* run(regenerated.service, config({ rules }), 'pull_request', pullRequest)).findings).toStrictEqual(
        [],
      )
      const unconfigured = seed([
        [repo('.github/CODEOWNERS', SHA), `* @a\n\n${GENERATED.replace('@Resnovas/docs', '@a')}\n`],
      ])
      expect(
        (yield* run(unconfigured.service, config({ rules: {} }), 'pull_request', pullRequest)).findings,
      ).toStrictEqual([])
    }),
  )
})

describe('codeownersFeature on repository events', () => {
  it.effect("warns about the default branch's problems, and proposes the generated block", () =>
    Effect.gen(function* () {
      const { service, state } = seed([[repo('CODEOWNERS'), '* @a\n*.md docs\n']])
      const result = yield* run(service, config({ rules }), 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(findings(result)).toStrictEqual([
        [
          SYNTAX_RULE,
          'warning',
          'CODEOWNERS line 2: `docs` is not a user (@login), a team (@org/team) or an email address',
          'CODEOWNERS',
          2,
        ],
      ])
      expect(state.requests).toStrictEqual([{ method: 'GET', path: '/codeowners/errors?ref=main' }])
      expect(state.proposals.map(({ branch, base, title, files }) => ({ branch, base, title, files }))).toStrictEqual([
        {
          branch: 'smartcloud/codeowners',
          base: 'main',
          title: 'chore(codeowners): generate CODEOWNERS from the smartcloud config',
          files: [{ path: 'CODEOWNERS', content: `* @a\n*.md docs\n\n${GENERATED}\n`, executable: false }],
        },
      ])
      expect(state.proposals[0]?.body).toContain('generated from `codeowners.rules`')
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        `Proposed the generated CODEOWNERS on smartcloud/codeowners in new pull request #${state.proposals[0]?.number}`,
      ])
      const again = yield* run(service, config({ rules }), 'push', { ref: 'refs/heads/main', after: 'abc' })
      expect(again.changes.map((change) => change.description)).toStrictEqual([
        `Proposed the generated CODEOWNERS on smartcloud/codeowners in pull request #${state.proposals[0]?.number}`,
      ])
    }),
  )

  it.effect('creates the file at the configured path, or the first GitHub reads, on the configured branch', () =>
    Effect.gen(function* () {
      const empty = seed([])
      yield* run(empty.service, config({ rules, branch: 'owners' }), 'workflow_dispatch')
      expect(
        empty.state.proposals.map((proposal) => [proposal.branch, proposal.files[0]?.path, proposal.files[0]?.content]),
      ).toStrictEqual([['owners', '.github/CODEOWNERS', `${GENERATED}\n`]])
      const configured = seed([[repo('.github/CODEOWNERS'), '* @a\n']])
      yield* run(configured.service, config({ rules, path: 'docs/CODEOWNERS' }), 'schedule')
      expect(configured.state.proposals[0]?.files[0]?.path).toBe('docs/CODEOWNERS')
    }),
  )

  it.effect('proposes nothing when the file is up to date or there are no rules, and ignores other events', () =>
    Effect.gen(function* () {
      const { service, state } = seed([[repo('.github/CODEOWNERS'), `* @a\n\n${GENERATED}\n`]])
      const current = yield* run(service, config({ rules }), 'schedule')
      expect(current.findings).toStrictEqual([])
      yield* run(service, config(), 'schedule')
      yield* run(service, config({ rules }), 'repository_dispatch')
      expect(state.proposals).toStrictEqual([])
      expect(state.requests).toHaveLength(2)
    }),
  )

  it.effect('refuses a codeowners.branch that is the default branch, and warns on a token that cannot push', () =>
    Effect.gen(function* () {
      const { service, state } = seed([])
      const base = yield* run(service, config({ rules, branch: 'main' }), 'schedule')
      expect(base.failed[0]?.message).toContain('codeowners.branch is "main", the default branch')
      const readOnly: GitHubService = {
        ...service,
        proposeChanges: () =>
          Effect.fail(new Forbidden({ operation: 'proposeChanges', detail: 'Resource not accessible by integration' })),
      }
      const result = yield* run(readOnly, config({ rules }), 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(findings(result)).toStrictEqual([
        [
          'codeowners.generate',
          'warning',
          'Could not propose the generated .github/CODEOWNERS: the token cannot push to smartcloud/codeowners or open pull requests.',
          '.github/CODEOWNERS',
          undefined,
        ],
      ])
      expect(result.changes).toStrictEqual([])
      expect(state.proposals).toStrictEqual([])
    }),
  )

  it.effect('records the proposal in a dry run without opening anything', () =>
    Effect.gen(function* () {
      const { service, state } = seed([])
      const writes = yield* Effect.gen(function* () {
        const github = yield* GitHub
        const result = yield* run(github, config({ rules }), 'schedule')
        expect(result.changes.at(-1)?.description).toBe(
          'Proposed the generated .github/CODEOWNERS on smartcloud/codeowners',
        )
        return yield* (yield* DryRunLog).writes
      }).pipe(Effect.provide(DryRun), Effect.provideService(GitHub, service))
      expect(writes.map((write) => write.operation)).toStrictEqual(['proposeChanges'])
      expect(state.proposals).toStrictEqual([])
    }),
  )
})
