/**
 * @file tests/feature.sync/src/feature.spec.ts
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
import { Effect } from 'effect'
import type { SmartcloudConfig } from '@resnovas/config'
import { decodeEvent, makeReport, Report, runFeatures } from '@resnovas/engine'
import { DEFAULT_POLICY_BASE, parseSource, previewSync, syncFeature } from '@resnovas/feature.sync'
import {
  DryRun,
  DryRunLog,
  fileKey,
  Forbidden,
  GitHub,
  type GitHubService,
  makeMemoryGitHub,
  NotFound,
  refKey,
  Unavailable,
  ValidationFailed,
} from '@resnovas/integrations.github'

const SOURCE = 'Resnovas/.github/templates@main'
const LINK = `${DEFAULT_POLICY_BASE}/GOVERNANCE.md#synced-files`

const dependabot = (ecosystem: string) =>
  `# house:managed:begin\nversion: 2\nupdates:\n  - package-ecosystem: ${ecosystem}\n    directory: /\n# house:managed:end\n# house:local\n`

const config = (
  sync: Partial<NonNullable<SmartcloudConfig['sync']>> = {},
  extra: Partial<SmartcloudConfig> = {},
): SmartcloudConfig => ({
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
  runFeatures({ config: smartcloud, event, payload, features: [syncFeature] }).pipe(
    Effect.provideService(GitHub, github),
  )

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

// Records the files pull request #7 changes.
const changes = (memory: ReturnType<typeof seed>, files: ReadonlyArray<string>) => {
  memory.state.pulls.set(7, {
    commits: [],
    files: [...files],
    reviews: [],
    requestedReviewers: [],
    submittedReviews: [],
  })
  return memory
}

describe('sync run', () => {
  it.effect('proposes one pull request with every changed file, and warns about conflicting local rules', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const result = yield* run(service, config(), 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(state.proposals).toHaveLength(1)
      const [proposal] = state.proposals
      expect(proposal).toMatchObject({
        branch: 'smartcloud/sync',
        base: 'main',
        title: 'chore(sync): sync files from Resnovas/.github',
        open: true,
      })
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
      expect(result.facts).toStrictEqual([
        {
          feature: 'sync',
          name: 'sync proposed',
          values: { created: 0, updated: 2, mode: 1, conflicts: 1, pull_request: 'created' },
        },
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
      expect(second.facts[0]?.values).toMatchObject({ created: 1, pull_request: 'updated' })
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
      expect(result.facts[0]?.values).toStrictEqual({
        created: 0,
        updated: 0,
        mode: 0,
        conflicts: 0,
        pull_request: 'none',
      })
    }),
  )

  it.effect('treats a file that vanishes between listing and reading as missing', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      // Only the per-file path lists before it reads, so the repository's archive is made unreadable.
      const flaky: GitHubService = {
        ...service,
        getArchive: (location) =>
          location.repo === 'example'
            ? Effect.fail(new ValidationFailed({ operation: 'getArchive', detail: 'too large' }))
            : service.getArchive(location),
        getFile: (location) =>
          location.repo === 'example' && location.path === 'LICENSE'
            ? Effect.fail(new NotFound({ operation: 'getFile', detail: 'LICENSE' }))
            : service.getFile(location),
      }
      yield* run(flaky, config(), 'schedule')
      expect(state.proposals[0]?.body).toContain('- `LICENSE` added')
    }),
  )

  // A source of `count` templates spread over 60 directories, and a repository that has half of them.
  const many = (count: number) => {
    const memory = seed()
    for (let index = 0; index < count; index += 1) {
      const path = `.agents/skills/skill-${index % 60}/file-${index}.md`
      memory.state.files.set(template(path), `# {{HOLDER}} skill ${index}\n`)
      if (index % 2 === 0) memory.state.files.set(repo(path), `# Resnovas skill ${index}\n`)
    }
    return memory
  }

  it.effect('reads the source and the repository from one archive each, however many templates there are', () =>
    Effect.gen(function* () {
      const { service, state } = many(250)
      const result = yield* run(service, config(), 'schedule')
      expect(result.failed).toStrictEqual([])
      // The 125 templates the repository lacks, plus the three from the seed that differ.
      expect(state.proposals[0]?.files).toHaveLength(128)
      expect(state.calls).toStrictEqual([
        'getRepository',
        'resolveRef',
        'getArchive',
        'resolveRef',
        'getArchive',
        'proposeChanges',
      ])
      const doubled = many(500)
      yield* run(doubled.service, config(), 'schedule')
      expect(doubled.state.proposals[0]?.files).toHaveLength(253)
      expect(doubled.state.calls).toStrictEqual(state.calls)
    }),
  )

  it.effect('reads the source at the commit its ref resolves to', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      state.refs.set(refKey('Resnovas', '.github', 'main'), 'abc123')
      const reads: Array<string | undefined> = []
      const observed: GitHubService = {
        ...service,
        getArchive: (location) => {
          reads.push(location.ref)
          return service.getArchive(location)
        },
      }
      const result = yield* run(observed, config(), 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(reads).toStrictEqual(['abc123', 'main'])
      expect(state.proposals[0]?.files).toHaveLength(3)
    }),
  )

  it.effect('reads file by file, with a warning, where an archive cannot be read, and fails on anything else', () =>
    Effect.gen(function* () {
      const expected = (yield* run(seed().service, config(), 'schedule')).changes
      const outcomes = {
        source: new ValidationFailed({ operation: 'getArchive', detail: 'the archive is larger than 1 bytes' }),
        example: new NotFound({ operation: 'getArchive', detail: 'not for this token' }),
      }
      const memory = seed()
      const unarchived: GitHubService = {
        ...memory.service,
        getArchive: (location) =>
          location.repo === '.github' ? Effect.fail(outcomes.source) : Effect.fail(outcomes.example),
      }
      const result = yield* run(unarchived, config(), 'schedule')
      expect(result.failed).toStrictEqual([])
      expect(result.changes).toStrictEqual(expected)
      expect(memory.state.calls.filter((call) => call === 'getFile')).toHaveLength(7)
      const down = seed()
      const outage: GitHubService = {
        ...down.service,
        getArchive: () => Effect.fail(new Unavailable({ operation: 'getArchive', detail: 'down' })),
      }
      const failed = yield* run(outage, config(), 'schedule')
      expect(failed.failed[0]?.message).toContain('getArchive: GitHub unavailable (down)')
      expect(down.state.calls.filter((call) => call === 'getFile')).toHaveLength(0)
    }),
  )

  it.effect('records the proposal in a dry run without opening anything', () =>
    Effect.gen(function* () {
      const { service, state } = seed()
      const writes = yield* Effect.gen(function* () {
        const github = yield* GitHub
        const result = yield* run(github, config(), 'schedule')
        expect(result.changes.at(-1)?.description).toBe('Proposed 3 synced file(s) on smartcloud/sync')
        expect(result.facts[0]?.values['pull_request']).toBe('dry-run')
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
      expect(state.proposals[0]?.files).toStrictEqual([
        { path: 'LICENSE', content: '(c) Resnovas/example\n', executable: false },
      ])
      state.files.set(repo('LICENSE', 'head-sha'), 'edited\n')
      changes({ service, state }, ['LICENSE'])
      const check = yield* run(
        service,
        { version: 2, sync: { source: 'Resnovas/.github/templates' } },
        'pull_request',
        pullRequest,
      )
      expect(check.findings.map((finding) => finding.message)).toStrictEqual([
        'LICENSE edits a synced file. Change it in Resnovas/.github instead.',
      ])
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
    const memory = changes(seed(), ['LICENSE', '.github/dependabot.yml', 'KEEP.md', 'tools/run'])
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
          message:
            '.github/dependabot.yml edits the managed block; add local rules outside it. Change it in Resnovas/.github instead.',
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

  it.effect('warns a maintainer or the owner instead of failing them, unless sync.maintainerLevel says error', () =>
    Effect.gen(function* () {
      const levels = (result: { readonly findings: ReadonlyArray<{ readonly level: string }> }) => [
        ...new Set(result.findings.map((finding) => finding.level)),
      ]
      const { service } = withHead()
      const maintainer = yield* run(
        service,
        config({}, { roles: { maintainers: ['@Jane'] } }),
        'pull_request',
        pullRequest,
      )
      expect(levels(maintainer)).toStrictEqual(['warning'])
      const strict = yield* run(
        service,
        config({ maintainerLevel: 'error' }, { roles: { maintainers: ['jane'] } }),
        'pull_request',
        pullRequest,
      )
      expect(levels(strict)).toStrictEqual(['error'])
      const owner = { ...pullRequest, pull_request: { ...pullRequest.pull_request, user: { login: 'Resnovas' } } }
      expect(levels(yield* run(service, config(), 'pull_request', owner))).toStrictEqual(['warning'])
    }),
  )

  it.effect('asks for a local conflict the pull request adds to be fixed here, not in the source', () =>
    Effect.gen(function* () {
      const { service, state } = changes(seed(), ['.github/dependabot.yml'])
      state.files.set(repo('.github/dependabot.yml'), dependabot('npm'))
      state.files.set(
        repo('.github/dependabot.yml', 'head-sha'),
        `${dependabot('npm')}  - package-ecosystem: npm\n    directory: /\n`,
      )
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
      const { service, state } = changes(seed(), ['LICENSE', '.github/dependabot.yml', 'tools/run'])
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

  it.effect('reads the changed templates from the archive only when that costs fewer requests', () =>
    Effect.gen(function* () {
      const three = withHead()
      yield* run(three.service, config(), 'pull_request', pullRequest)
      const reads = (calls: ReadonlyArray<string>) => calls.filter((call) => call !== 'getRepository')
      expect(reads(three.state.calls)).toStrictEqual([
        'listFiles',
        'listDirectory',
        'listDirectory',
        'listDirectory',
        'resolveRef',
        'getArchive',
        ...Array.from({ length: 6 }, () => 'getFile'),
      ])
      const one = changes(seed(), ['LICENSE'])
      one.state.files.set(repo('LICENSE', 'head-sha'), 'Changed\n')
      one.state.files.set(repo('.github/dependabot.yml', 'head-sha'), dependabot('npm'))
      one.state.files.set(repo('tools/run', 'head-sha'), '#!/bin/sh\n')
      yield* run(one.service, config(), 'pull_request', pullRequest)
      expect(reads(one.state.calls)).toStrictEqual([
        'listFiles',
        'listDirectory',
        'listDirectory',
        'listDirectory',
        'getFile',
        'getFile',
        'getFile',
      ])
      const unarchived = withHead()
      const service: GitHubService = {
        ...unarchived.service,
        getArchive: () => Effect.fail(new Forbidden({ operation: 'getArchive', detail: 'no' })),
      }
      const result = yield* run(service, config(), 'pull_request', pullRequest)
      expect(result.findings.map((finding) => finding.path)).toStrictEqual([
        '.github/dependabot.yml',
        'LICENSE',
        'tools/run',
      ])
      expect(unarchived.state.calls.filter((call) => call === 'getFile')).toHaveLength(9)
    }),
  )

  it.effect('reads only the synced files the pull request changes', () =>
    Effect.gen(function* () {
      const memory = changes(seed(), ['src/index.ts'])
      // Differs from the base, as when the base branch moved on, but the pull request does not change it.
      memory.state.files.set(repo('LICENSE', 'head-sha'), 'Changed\n')
      memory.state.files.set(repo('.github/dependabot.yml', 'head-sha'), dependabot('npm'))
      memory.state.files.set(repo('tools/run', 'head-sha'), '#!/bin/sh\n')
      const reads: Array<string> = []
      const service: GitHubService = {
        ...memory.service,
        getFile: (location) => {
          reads.push(location.path)
          return memory.service.getFile(location)
        },
      }
      const result = yield* run(service, config(), 'pull_request', pullRequest)
      expect(result.findings).toStrictEqual([])
      expect(reads).toStrictEqual([])
    }),
  )

  it.effect('checks a synced file missing at the head, since a rename lists only its new path', () =>
    Effect.gen(function* () {
      const memory = changes(seed(), ['docs/LICENSE'])
      memory.state.files.set(repo('docs/LICENSE', 'head-sha'), 'MIT\n')
      memory.state.files.set(
        repo('.github/dependabot.yml', 'head-sha'),
        `${dependabot('yarn')}  - package-ecosystem: npm\n    directory: /\n`,
      )
      memory.state.files.set(repo('tools/run', 'head-sha'), '#!/bin/sh\n')
      const result = yield* run(memory.service, config(), 'pull_request', pullRequest)
      expect(result.findings.map((finding) => finding.message)).toStrictEqual([
        'LICENSE deletes a synced file. Change it in Resnovas/.github instead.',
      ])
    }),
  )

  it.effect('checks every synced file when the base or the head has too many files to list', () =>
    Effect.gen(function* () {
      for (const ref of [undefined, 'head-sha']) {
        const memory = changes(seed(), [])
        memory.state.files.set(repo('LICENSE', 'head-sha'), 'Changed\n')
        const service: GitHubService = {
          ...memory.service,
          listDirectory: (location) =>
            location.owner === 'Resnovas' && location.repo === 'example' && location.ref === ref
              ? Effect.fail(new ValidationFailed({ operation: 'listDirectory', detail: 'too many files' }))
              : memory.service.listDirectory(location),
        }
        const result = yield* run(service, config(), 'pull_request', pullRequest)
        expect(result.findings.map((finding) => finding.path)).toStrictEqual([
          '.github/dependabot.yml',
          'LICENSE',
          'tools/run',
        ])
      }
    }),
  )

  it.effect('checks every synced file when the pull request lists as many files as GitHub returns', () =>
    Effect.gen(function* () {
      const memory = changes(
        seed(),
        Array.from({ length: 3_000 }, (_, index) => `generated/${index}.txt`),
      )
      memory.state.files.set(repo('LICENSE', 'head-sha'), 'Changed\n')
      memory.state.files.set(repo('.github/dependabot.yml', 'head-sha'), dependabot('bun'))
      memory.state.files.set(repo('tools/run', 'head-sha'), '#!/bin/sh\n')
      const result = yield* run(memory.service, config(), 'pull_request', pullRequest)
      expect(result.findings.map((finding) => finding.path)).toStrictEqual(['.github/dependabot.yml', 'LICENSE'])
    }),
  )

  it.effect('reads nothing for a synced file neither the base nor the head has', () =>
    Effect.gen(function* () {
      const memory = changes(seed(), [])
      memory.state.files.delete(repo('tools/run'))
      memory.state.files.set(repo('LICENSE', 'head-sha'), 'MIT\n')
      memory.state.files.set(repo('.github/dependabot.yml', 'head-sha'), 'x')
      const reads: Array<string> = []
      const service: GitHubService = {
        ...memory.service,
        getFile: (location) => {
          reads.push(location.path)
          return memory.service.getFile(location)
        },
      }
      const result = yield* run(service, config(), 'pull_request', pullRequest)
      expect(result.findings).toStrictEqual([])
      expect(reads).toStrictEqual([])
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
      const issue = yield* decodeEvent('issues', {
        action: 'opened',
        issue: { ...pullRequest.pull_request, number: 3 },
      })
      const repository = yield* decodeEvent('schedule', {})
      if (issue.kind === 'unsupported' || repository.kind === 'unsupported') return expect.unreachable()
      yield* syncFeature.run({ config: config(), envelope: issue }).pipe(Effect.provideService(Report, report))
      yield* syncFeature
        .run({ config: { version: 2 }, envelope: repository })
        .pipe(Effect.provideService(Report, report))
      expect(yield* report.snapshot).toStrictEqual({ findings: [], changes: [], facts: [] })
      expect(state.proposals).toStrictEqual([])
    }).pipe(Effect.provideService(GitHub, service))
  })

  it.effect('parses the source as owner/repo/path@ref', () =>
    Effect.gen(function* () {
      expect(yield* parseSource(SOURCE)).toStrictEqual({
        owner: 'Resnovas',
        repo: '.github',
        path: 'templates',
        ref: 'main',
      })
      expect((yield* Effect.flip(parseSource('x'))).message).toBe('sync.source must be owner/repo/path@ref, got "x"')
    }),
  )
})

describe('previewSync', () => {
  it.effect('renders the same files from the archives as from reading file by file', () => {
    const { service } = seed()
    const unarchived: GitHubService = {
      ...service,
      getArchive: () => Effect.fail(new ValidationFailed({ operation: 'getArchive', detail: 'too large' })),
    }
    const preview = (github: GitHubService) =>
      previewSync(config().sync ?? { source: SOURCE }).pipe(Effect.provideService(GitHub, github))
    return Effect.gen(function* () {
      const archived = yield* preview(service)
      const each = yield* preview(unarchived)
      expect(each.templates).toStrictEqual(archived.templates)
      expect(each.current).toStrictEqual(archived.current)
      expect(each.plan).toStrictEqual(archived.plan)
      expect(archived.templates.find((file) => file.path === 'tools/run')?.executable).toBe(true)
      expect(archived.plan.files.find((file) => file.path === 'tools/run')?.executable).toBe(true)
    })
  })

  it.effect('plans the sync from what it reads, without proposing anything', () => {
    const { service, state } = seed()
    return Effect.gen(function* () {
      const preview = yield* previewSync(config().sync ?? { source: SOURCE })
      expect(preview.source).toStrictEqual({ owner: 'Resnovas', repo: '.github', path: 'templates', ref: 'main' })
      expect(preview.templates.map((file) => file.path).sort()).toStrictEqual([
        '.github/dependabot.yml',
        'LICENSE',
        'tools/run',
      ])
      expect([...preview.current.keys()].sort()).toStrictEqual(['.github/dependabot.yml', 'LICENSE', 'tools/run'])
      expect(preview.plan.files.map((file) => file.path)).toContain('LICENSE')
      expect(state.proposals).toStrictEqual([])
    }).pipe(Effect.provideService(GitHub, service))
  })
})
