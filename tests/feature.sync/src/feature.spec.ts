/**
 * @file tests/feature.sync/src/feature.spec.ts
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
import { Effect } from 'effect'
import type { SmartcloudConfig } from '@resnovas/config'
import { decodeEvent, makeReport, Report, runFeatures } from '@resnovas/engine'
import { DEFAULT_POLICY_BASE, parseSource, syncFeature } from '@resnovas/feature.sync'
import { DryRun, DryRunLog, fileKey, GitHub, type GitHubService, makeMemoryGitHub, NotFound } from '@resnovas/integrations.github'

const SOURCE = 'Resnovas/.github/templates@main'
const LINK = `${DEFAULT_POLICY_BASE}/GOVERNANCE.md#synced-files`

const dependabot = (ecosystem: string) =>
  `# house:managed:begin\nversion: 2\nupdates:\n  - package-ecosystem: ${ecosystem}\n    directory: /\n# house:managed:end\n# house:local\n`

const config = (sync: Partial<NonNullable<SmartcloudConfig['sync']>> = {}, extra: Partial<SmartcloudConfig> = {}): SmartcloudConfig => ({
  version: 2,
  ...extra,
  sync: { source: SOURCE, values: { HOLDER: 'Resnovas' }, exclude: ['KEEP.md'], ...sync },
})

const template = (path: string) => fileKey('Resnovas', '.github', `templates/${path}`, 'main')
const repo = (path: string, ref?: string) => fileKey('Resnovas', 'example', path, ref)

// The templates, and a repository that has drifted from them.
const seed = () =>
  makeMemoryGitHub({
    files: new Map([
      [template('LICENSE'), '(c) {{HOLDER}} for {{REPOSITORY}}\n'],
      [template('.github/dependabot.yml'), dependabot('npm')],
      [template('tools/run'), '#!/bin/sh\n'],
      [template('KEEP.md'), '{{UNSUPPLIED}}'],
      [repo('LICENSE'), 'MIT\n'],
      [repo('.github/dependabot.yml'), `${dependabot('yarn')}  - package-ecosystem: npm\n    directory: /\n`],
      [repo('tools/run'), '#!/bin/sh\n'],
      [repo('KEEP.md'), 'our own\n'],
      [repo('src/index.ts'), 'unrelated\n'],
    ]),
    executables: new Set([template('tools/run')]),
  })

const run = (github: GitHubService, smartcloud: SmartcloudConfig, event: string, payload: unknown = {}) =>
  runFeatures({ config: smartcloud, event, payload, features: [syncFeature] }).pipe(Effect.provideService(GitHub, github))

const pullRequest = {
  action: 'synchronize',
  pull_request: {
    number: 7,
    title: 'docs: tweak',
    body: null,
    user: { login: 'jane' },
    state: 'open',
    locked: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    head: { ref: 'docs/tweak', sha: 'head-sha' },
  },
}

describe('sync run', () => {
  it.effect('proposes one pull request with every changed file, and warns about conflicting local rules', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const result = yield* run(service, config(), 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(state.proposals).toHaveLength(1)
      const [proposal] = state.proposals
      expect(proposal).toMatchObject({ branch: 'smartcloud/sync', base: 'main', title: 'chore(sync): sync files from Resnovas/.github', open: true })
      expect(proposal?.files).toStrictEqual([
        {
          path: '.github/dependabot.yml',
          content: `${dependabot('npm')}  - package-ecosystem: npm\n    directory: /\n`,
          executable: false,
        },
        { path: 'LICENSE', content: '(c) Resnovas for Resnovas/example\n', executable: false },
        { path: 'tools/run', content: '#!/bin/sh\n', executable: true },
      ])
      expect(proposal?.body).toContain('Syncs files from `Resnovas/.github/templates@main`.')
      expect(proposal?.body).toContain('- `tools/run` made executable')
      expect(result.changes.map((change) => change.description)).toStrictEqual([
        '.github/dependabot.yml updated',
        'LICENSE updated',
        'tools/run made executable',
        'Proposed 3 synced file(s) on smartcloud/sync in new pull request #1',
      ])
      expect(result.findings).toStrictEqual([
        {
          feature: 'sync',
          rule: 'SYNC',
          level: 'warning',
          message: '.github/dependabot.yml duplicates the synced Dependabot update for npm in /',
          path: '.github/dependabot.yml',
          link: LINK,
        },
      ])
    }),
  )

  it.effect('adds missing files, and updates the open pull request on the configured branch on the next run', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      state.files.delete(repo('LICENSE'))
      const smartcloud = config({ branch: 'chore/house' }, { links: { policyBase: 'https://example.com/policy' } })
      yield* run(service, smartcloud, 'push', { ref: 'refs/heads/main', after: 'abc' })
      const second = yield* run(service, smartcloud, 'workflow_dispatch')
      expect(state.proposals).toHaveLength(1)
      expect(state.proposals[0]?.branch).toBe('chore/house')
      expect(state.proposals[0]?.body).toContain('- `LICENSE` added')
      expect(second.changes.at(-1)?.description).toBe('Proposed 3 synced file(s) on chore/house in pull request #1')
      expect(second.findings[0]?.link).toBe('https://example.com/policy/GOVERNANCE.md#synced-files')
    }),
  )

  it.effect('proposes nothing when the repository is up to date', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      state.files.set(repo('LICENSE'), '(c) Resnovas for Resnovas/example\n')
      state.files.set(repo('.github/dependabot.yml'), dependabot('npm'))
      state.executables.add(repo('tools/run'))
      const result = yield* run(service, config(), 'schedule')
      expect(result.ran).toStrictEqual(['sync'])
      expect(state.proposals).toStrictEqual([])
      expect(result.changes).toStrictEqual([])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('treats a file that vanishes between listing and reading as missing', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const flaky: GitHubService = {
        ...service,
        getFile: (location) =>
          location.repo === 'example' && location.path === 'LICENSE'
            ? Effect.fail(new NotFound({ operation: 'getFile', detail: 'LICENSE' }))
            : service.getFile(location),
      }
      yield* run(flaky, config(), 'schedule')
      expect(state.proposals[0]?.body).toContain('- `LICENSE` added')
    }),
  )

  it.effect('records the proposal in a dry run without opening anything', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const writes = yield* Effect.gen(function* () {
        const github = yield* GitHub
        const result = yield* run(github, config(), 'schedule')
        expect(result.changes.at(-1)?.description).toBe('Proposed 3 synced file(s) on smartcloud/sync')
        return yield* (yield* DryRunLog).writes
      }).pipe(Effect.provide(DryRun), Effect.provideService(GitHub, service))
      expect(writes.map((write) => write.operation)).toStrictEqual(['proposeChanges'])
      expect(state.proposals).toStrictEqual([])
    }),
  )

  it.effect('reads templates from the default branch of the source when no ref is given, with no exclusions', () =>
    Effect.gen(function* () {
      const { service, state } = makeMemoryGitHub({
        files: new Map([
          [fileKey('Resnovas', '.github', 'templates/LICENSE'), '(c) {{REPOSITORY}}\n'],
          [template('LICENSE'), 'the main ref is not read'],
        ]),
      })
      const result = yield* run(service, { version: 2, sync: { source: 'Resnovas/.github/templates' } }, 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(state.proposals[0]?.files).toStrictEqual([{ path: 'LICENSE', content: '(c) Resnovas/example\n', executable: false }])
      state.files.set(repo('LICENSE', 'head-sha'), 'edited\n')
      const check = yield* run(service, { version: 2, sync: { source: 'Resnovas/.github/templates' } }, 'pull_request', pullRequest)
      expect(check.findings.map((finding) => finding.message)).toStrictEqual(['LICENSE edits a synced file. Change it in Resnovas/.github instead.'])
    }),
  )

  it.effect('does nothing on other repository events', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const result = yield* run(service, config(), 'repository_dispatch')
      expect(result.ran).toStrictEqual(['sync'])
      expect(state.proposals).toStrictEqual([])
    }),
  )

  it.effect('refuses a sync.branch that is the default branch, and writes nothing', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const result = yield* run(service, config({ branch: 'main' }), 'schedule')
      expect(result.failed[0]?.message).toContain('sync.branch is "main", the default branch')
      expect(state.proposals).toStrictEqual([])
    }),
  )

  it.effect('fails on a malformed source or a missing value, and is skipped without a sync section', () =>
    Effect.gen(function* () {
      const { service } = seed()
      const malformed = yield* run(service, config({ source: 'not a source' }), 'schedule')
      expect(malformed.failed[0]?.message).toContain('sync.source must be owner/repo/path@ref, got "not a source"')
      const missing = yield* run(service, config({ exclude: [] }), 'schedule')
      expect(missing.failed[0]?.message).toContain('KEEP.md: no value for {{UNSUPPLIED}}')
      const off = yield* run(service, { version: 2 }, 'schedule')
      expect(off.skipped).toStrictEqual([{ feature: 'sync', reason: 'not configured' }])
    }),
  )
})

describe('synced files check', () => {
  // A pull request that edits a synced document and a managed block, deletes a
  // synced file, and adds an allowed local rule.
  const withHead = () => {
    const memory = seed()
    const { files } = memory.state
    files.set(repo('LICENSE'), '(c) Resnovas for Resnovas/example\n')
    files.set(repo('LICENSE', 'head-sha'), 'Changed\n')
    files.set(repo('.github/dependabot.yml', 'head-sha'), dependabot('bun'))
    files.set(repo('KEEP.md', 'head-sha'), 'excluded, so edits are fine\n')
    return memory
  }

  it.effect('fails edits to synced content at the pull request head, linking the policy', () =>
    Effect.gen(function* () {
      const { service } = withHead()
      const result = yield* run(service, config(), 'pull_request', pullRequest)
      expect(result.failed).toStrictEqual([])
      expect(result.findings).toStrictEqual([
        {
          feature: 'sync',
          rule: 'SYNC',
          level: 'error',
          message: '.github/dependabot.yml edits the managed block; add local rules outside it. Change it in Resnovas/.github instead.',
          path: '.github/dependabot.yml',
          link: LINK,
        },
        {
          feature: 'sync',
          rule: 'SYNC',
          level: 'error',
          message: 'LICENSE edits a synced file. Change it in Resnovas/.github instead.',
          path: 'LICENSE',
          link: LINK,
        },
        {
          feature: 'sync',
          rule: 'SYNC',
          level: 'error',
          message: 'tools/run deletes a synced file. Change it in Resnovas/.github instead.',
          path: 'tools/run',
          link: LINK,
        },
      ])
    }),
  )

  it.effect('asks for a local conflict the pull request adds to be fixed here, not in the source', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      state.files.set(repo('.github/dependabot.yml'), dependabot('npm'))
      state.files.set(repo('.github/dependabot.yml', 'head-sha'), `${dependabot('npm')}  - package-ecosystem: npm\n    directory: /\n`)
      state.files.set(repo('LICENSE', 'head-sha'), 'MIT\n')
      state.files.set(repo('tools/run', 'head-sha'), '#!/bin/sh\n')
      const result = yield* run(service, config(), 'pull_request', pullRequest)
      expect(result.findings.map((finding) => finding.message)).toStrictEqual([
        '.github/dependabot.yml duplicates the synced Dependabot update for npm in /. Change the local rules in this repository.',
      ])
    }),
  )

  it.effect('allows a pull request that brings synced files up to date', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      state.files.set(repo('LICENSE', 'head-sha'), '(c) Resnovas for Resnovas/example\n')
      state.files.set(repo('.github/dependabot.yml', 'head-sha'), dependabot('npm'))
      state.files.set(repo('tools/run', 'head-sha'), '#!/bin/sh\n')
      const result = yield* run(service, config(), 'pull_request', pullRequest)
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('is off when sync.check is false, and in the source repository itself', () =>
    Effect.gen(function* () {
      const { service, state } = withHead()
      const off = yield* run(service, config({ check: false }), 'pull_request', pullRequest)
      expect(off.findings).toStrictEqual([])
      state.repository = { ...state.repository, owner: 'resnovas', name: '.github', fullName: 'resnovas/.github' }
      const source = yield* run(service, config(), 'pull_request', pullRequest)
      expect(source.ran).toStrictEqual(['sync'])
      expect(source.findings).toStrictEqual([])
    }),
  )

  it.effect('fails on a missing value, since the templates cannot be rendered to compare', () =>
    Effect.gen(function* () {
      const { service } = withHead()
      const result = yield* run(service, config({ exclude: [] }), 'pull_request', pullRequest)
      expect(result.failed[0]?.message).toContain('KEEP.md: no value for {{UNSUPPLIED}}')
    }),
  )
})

describe('syncFeature', () => {
  it.effect('ignores issue events and a config without a sync section when run directly', () => {
    const { service, state } = seed()
    return Effect.gen(function* () {
      const report = yield* makeReport
      const issue = yield* decodeEvent('issues', { action: 'opened', issue: { ...pullRequest.pull_request, number: 3 } })
      const repository = yield* decodeEvent('schedule', {})
      if (issue.kind === 'unsupported' || repository.kind === 'unsupported') return expect.unreachable()
      yield* syncFeature.run({ config: config(), envelope: issue }).pipe(Effect.provideService(Report, report))
      yield* syncFeature.run({ config: { version: 2 }, envelope: repository }).pipe(Effect.provideService(Report, report))
      expect(yield* report.snapshot).toStrictEqual({ findings: [], changes: [] })
      expect(state.proposals).toStrictEqual([])
    }).pipe(Effect.provideService(GitHub, service))
  })

  it.effect('parses the source as owner/repo/path@ref', () =>
    Effect.gen(function* () {
      expect(yield* parseSource(SOURCE)).toStrictEqual({ owner: 'Resnovas', repo: '.github', path: 'templates', ref: 'main' })
      expect((yield* Effect.flip(parseSource('x'))).message).toBe('sync.source must be owner/repo/path@ref, got "x"')
    }),
  )
})
