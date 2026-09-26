/**
 * @file tests/runtime/src/runtime.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { ConfigSource, parseConfig } from '@resnovas/config'
import { fileKey, GitHub, type GitHubService, makeMemoryGitHub, type MemoryState, NotFound, Unavailable } from '@resnovas/integrations.github'
import {
  CONFIG_CANDIDATES,
  ConfigSourceFromGitHub,
  configLocationFor,
  describeWrite,
  dryRun,
  dryRunRepository,
  dryRunText,
  explainConfig,
  FEATURES,
  gitHubConfigSource,
  InvalidRepository,
  InvalidTrigger,
  liveConnect,
  loadConfig,
  loadConfigText,
  migrateConfigText,
  MissingToken,
  NoConfig,
  NoSection,
  parseFeatureList,
  parseRepository,
  planRepositorySettings,
  planSettingsForRepository,
  readLocalConfig,
  renderRepositorySync,
  renderSyncForRepository,
  resolveToken,
  runEvent,
  selectFeatures,
  settingsPlanText,
  syntheticEvent,
  triggerOf,
  UnexpectedResponse,
  UnknownFeatures,
  type Connect,
  presetError,
  PresetUnreadable,
} from '@resnovas/runtime'
import { ConfigProvider, Effect, Either, Redacted } from 'effect'
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'

const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)
const withEnv = (env: Record<string, string>) => Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-runtime-'))
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

// A fake `gh` on PATH, so the fallback is tested without the real CLI.
const withFakeGh = async (output: string) => {
  const bin = await mkdtemp(join(dir, 'bin-'))
  await writeFile(join(bin, 'gh'), `#!/bin/sh\nprintf '%s\\n' '${output}'\n`)
  await chmod(join(bin, 'gh'), 0o755)
  vi.stubEnv('PATH', `${bin}:${process.env['PATH'] ?? ''}`)
}

const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

const pull = {
  number: 7,
  title: 'Add things',
  body: null,
  user: { login: 'jane' },
  state: 'open',
  locked: false,
  draft: false,
  labels: [],
  updated_at: '2026-09-01T00:00:00Z',
  head: { ref: 'feat/x', sha: 'abc123' },
  additions: 3,
  deletions: 1,
}
const issue = { ...pull, number: 9, title: 'A bug' }

// The in-memory GitHub, answering the REST reads a dry run makes.
const memory = (files: Record<string, string> = {}, seed: Partial<MemoryState> = {}, routes: Record<string, unknown> = {}) => {
  const github = makeMemoryGitHub(seed)
  for (const [path, text] of Object.entries(files)) github.state.files.set(fileKey('Resnovas', 'example', path), text)
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  const answers = new Map(Object.entries({ '/pulls/7': pull, '/issues/9': issue, '/commits/main': { sha: 'def456' }, ...routes }))
  const service: GitHubService = {
    ...github.service,
    repositoryRequest: (request) =>
      request.method === 'GET' && answers.has(request.path) ? Effect.succeed(answers.get(request.path)) : github.service.repositoryRequest(request),
  }
  return { service, state: github.state }
}

describe('features', () => {
  it.effect('splits lists, selects features in order, and names unknown ones', () =>
    Effect.gen(function* () {
      expect(parseFeatureList(' labels, stale,,')).toStrictEqual(['labels', 'stale'])
      expect(yield* selectFeatures(undefined)).toBe(FEATURES)
      expect((yield* selectFeatures(['stale', 'labels'])).map((feature) => feature.name)).toStrictEqual(['labels', 'stale'])
      const unknown = yield* Effect.flip(selectFeatures(['labels', 'nope']))
      expect(unknown).toBeInstanceOf(UnknownFeatures)
      expect(unknown.message).toMatch(/^unknown feature\(s\): nope; expected some of conventions, /)
    }),
  )
})

describe('loading config', () => {
  it.effect('prefers text, then the named path at a ref, then the candidates', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yaml': CONVENTIONS })
      state.files.set(fileKey('Resnovas', 'example', 'custom.yml', 'v2'), 'version: 2\n')
      const run = <A, E>(effect: Effect.Effect<A, E, GitHub>) => Effect.provideService(effect, GitHub, service)
      expect(yield* run(loadConfigText({ text: { text: 'x', source: 'given' } }))).toStrictEqual({ text: 'x', source: 'given' })
      expect(yield* run(loadConfigText({ path: 'custom.yml', ref: 'v2' }))).toStrictEqual({ text: 'version: 2\n', source: 'custom.yml' })
      expect((yield* run(loadConfigText({}))).source).toBe('.github/smartcloud.yaml')
      const none = yield* Effect.flip(run(loadConfigText({ path: 'missing.yml', ref: 'v3' })))
      expect(none).toBeInstanceOf(NoConfig)
      expect(none.message).toBe('no smartcloud config in Resnovas/example@v3: looked for missing.yml')
      const empty = memory()
      const nothing = yield* Effect.flip(Effect.provideService(loadConfigText({}), GitHub, empty.service))
      expect(nothing.message).toBe(`no smartcloud config in Resnovas/example: looked for ${CONFIG_CANDIDATES.join(', ')}`)
    }),
  )

  it.effect('resolves presets through GitHub, and names a missing one', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': 'version: 2\nextends: [Resnovas/.github/house.yml]\n' })
      state.files.set(fileKey('Resnovas', '.github', 'house.yml'), CONVENTIONS)
      const resolved = yield* loadConfig({}).pipe(Effect.provideService(GitHub, service))
      expect(resolved.sources).toStrictEqual(['Resnovas/.github/house.yml', '.github/smartcloud.yml'])
      const read = yield* Effect.flip(
        Effect.flatMap(ConfigSource, (source) => source.read({ owner: 'Resnovas', repo: '.github', path: 'gone.yml' })).pipe(
          Effect.provide(ConfigSourceFromGitHub),
          Effect.provideService(GitHub, service),
        ),
      )
      expect(read).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/gone.yml' })
    }),
  )

  it.effect('reads a local file, and says where a request reads its config from', () =>
    Effect.gen(function* () {
      const file = join(dir, 'local.yml')
      yield* Effect.promise(() => writeFile(file, CONVENTIONS))
      expect(yield* readLocalConfig(file)).toStrictEqual({ text: CONVENTIONS, source: file })
      expect(yield* configLocationFor(file)).toStrictEqual({ text: { text: CONVENTIONS, source: file } })
      expect(yield* configLocationFor(undefined)).toStrictEqual({})
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('migrateConfigText', () => {
  it.effect('turns a v1 config into v2 YAML with a schema hint and warnings', () =>
    Effect.gen(function* () {
      const text = yield* Effect.promise(() => readFile(fixture('v1-smartcloud.json'), 'utf8'))
      const migrated = yield* migrateConfigText(text, 'config.json')
      expect(migrated.config.version).toBe(2)
      expect(migrated.yaml).toMatch(/^# yaml-language-server: \$schema=.*smartcloud\.schema\.json\nversion: 2\n/)
      expect(migrated.warnings.length).toBeGreaterThan(0)
      expect((yield* Effect.flip(migrateConfigText('[]', 'list.json')))._tag).toBe('ConfigDecodeError')
    }),
  )
})

describe('explainConfig', () => {
  it.effect('lists every feature, whether it is enabled, and the sections it reads', () =>
    Effect.gen(function* () {
      const { config } = yield* parseConfig(
        'version: 2\nlabels:\n  bug: { name: bug, color: d73a4a }\nroles: { maintainers: [a] }\nstale: { staleAfterDays: 30, staleLabel: stale }\n',
        'x.yml',
      )
      const explained = explainConfig({ config, sources: ['b.yml', 'a.yml'], locked: new Set(['z', 'roles.maintainers']), warnings: ['w'] })
      expect(explained.sources).toStrictEqual(['b.yml', 'a.yml'])
      expect(explained.locked).toStrictEqual(['roles.maintainers', 'z'])
      expect(explained.warnings).toStrictEqual(['w'])
      expect(explained.features.map((feature) => [feature.name, feature.enabled])).toStrictEqual([
        ['conventions', false],
        ['commits', false],
        ['disclosure', false],
        ['reviews', false],
        ['labels', true],
        ['stale', true],
        ['settings', false],
        ['sync', false],
      ])
      expect(explained.features[4]?.rules).toStrictEqual({ labels: { bug: { name: 'bug', color: 'd73a4a' } } })
      expect(explained.features[3]?.rules).toStrictEqual({ roles: { maintainers: ['a'] } })
      expect(explained.features[4]?.handles).toContain('pullRequest')
      const custom = explainConfig({ config, sources: [], locked: new Set(), warnings: [] }, [{ name: 'custom', handles: ['issue'], run: () => Effect.void }])
      expect(custom.features).toStrictEqual([{ name: 'custom', enabled: true, handles: ['issue'], rules: {} }])
    }),
  )
})

describe('tokens and connections', () => {
  it.effect('prefers GITHUB_TOKEN and keeps it redacted', () =>
    Effect.gen(function* () {
      const token = yield* resolveToken.pipe(withEnv({ GITHUB_TOKEN: 'from-env' }))
      expect(Redacted.value(token)).toBe('from-env')
      expect(String(token)).not.toContain('from-env')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it('falls back to the GitHub CLI, and fails when neither has a token', async () => {
    await withFakeGh('from-gh')
    const token = await Effect.runPromise(resolveToken.pipe(withEnv({}), Effect.provide(NodeContext.layer)))
    expect(Redacted.value(token)).toBe('from-gh')
    vi.unstubAllEnvs()
    await withFakeGh('')
    const missing = await Effect.runPromise(Effect.either(resolveToken.pipe(withEnv({}), Effect.provide(NodeContext.layer))))
    expect(missing).toStrictEqual(Either.left(new MissingToken()))
    expect(new MissingToken().message).toContain('GITHUB_TOKEN')
  })

  it('falls back to the GitHub CLI when GITHUB_TOKEN is set but blank', async () => {
    await withFakeGh('from-gh')
    const token = await Effect.runPromise(resolveToken.pipe(withEnv({ GITHUB_TOKEN: ' ' }), Effect.provide(NodeContext.layer)))
    expect(Redacted.value(token)).toBe('from-gh')
  })

  it.effect('parses owner/name, rejecting anything else', () =>
    Effect.gen(function* () {
      expect(yield* parseRepository('Resnovas/smartcloud')).toStrictEqual({ owner: 'Resnovas', repo: 'smartcloud' })
      for (const bad of ['Resnovas', 'a/b/c', 'a /b', '/b']) expect(yield* Effect.flip(parseRepository(bad))).toBeInstanceOf(InvalidRepository)
      expect(new InvalidRepository({ repository: 'x' }).message).toBe('the repository must be owner/name, got "x"')
    }),
  )

  const contents = (text: string) =>
    new Response(JSON.stringify({ type: 'file', content: Buffer.from(text).toString('base64'), encoding: 'base64' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

  it.effect('connects to the live API with the resolved token', () =>
    Effect.gen(function* () {
      const seen: Array<string> = []
      const fetch: typeof globalThis.fetch = (input, init) => {
        seen.push(`${String(input)} ${new Headers(init?.headers).get('authorization') ?? ''}`)
        return Promise.resolve(contents('hello'))
      }
      const github = yield* liveConnect({ fetch })({ owner: 'Resnovas', repo: 'example' }).pipe(withEnv({ GITHUB_TOKEN: 'secret' }))
      expect(yield* github.getFile({ owner: 'Resnovas', repo: 'example', path: 'a.txt' })).toBe('hello')
      expect(seen[0]).toContain('/repos/Resnovas/example/contents/a.txt')
      expect(seen[0]).toContain('secret')
      expect(liveConnect()).toBeTypeOf('function')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('reads presets from GitHub, turning any failure into ConfigNotFound', () =>
    Effect.gen(function* () {
      const ok: typeof globalThis.fetch = () => Promise.resolve(contents('version: 2\n'))
      const read = (fetch: typeof globalThis.fetch) =>
        Effect.flatMap(ConfigSource, (source) => source.read({ owner: 'Resnovas', repo: '.github', path: 'a.yml', ref: 'v1' })).pipe(
          Effect.provide(gitHubConfigSource({ fetch })),
          withEnv({ GITHUB_TOKEN: 'secret' }),
        )
      expect(yield* read(ok)).toBe('version: 2\n')
      const error = yield* Effect.flip(read(() => Promise.resolve(new Response('{"message":"Not Found"}', { status: 404 }))))
      expect(error).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/a.yml@v1' })
      expect(gitHubConfigSource()).toBeDefined()
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('preset read errors', () => {
  it.effect('keep why a preset could not be read when it is not simply missing', () =>
    Effect.gen(function* () {
      const read = (fetch: typeof globalThis.fetch, env: Record<string, string>) =>
        Effect.flip(
          Effect.flatMap(ConfigSource, (source) => source.read({ owner: 'Resnovas', repo: '.github', path: 'a.yml' })).pipe(
            Effect.provide(gitHubConfigSource({ fetch })),
            withEnv(env),
          ),
        )
      const unauthorised: typeof globalThis.fetch = () =>
        Promise.resolve(new Response('{"message":"Bad credentials"}', { status: 401, headers: { 'content-type': 'application/json' } }))
      const denied = yield* read(unauthorised, { GITHUB_TOKEN: 'secret' })
      expect(denied).toBeInstanceOf(PresetUnreadable)
      expect(denied).toMatchObject({ _tag: 'ConfigNotFound', source: 'Resnovas/.github/a.yml' })
      expect(denied.message).toBe('the extends preset Resnovas/.github/a.yml could not be read: getFile: forbidden (Bad credentials)')
      expect(denied.message).not.toContain('secret')
      yield* Effect.promise(() => withFakeGh(''))
      const unused: typeof globalThis.fetch = () => Promise.reject(new Error('GitHub must not be called without a token'))
      const signedOut = yield* read(unused, {})
      expect(signedOut.message).toBe(`the extends preset Resnovas/.github/a.yml could not be read: ${new MissingToken().message}`)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it('map a GitHub NotFound to a missing preset and anything else to PresetUnreadable', () => {
    const ref = { owner: 'Resnovas', repo: '.github', path: 'a.yml' }
    expect(presetError(ref)(new NotFound({ operation: 'getFile', detail: 'x' }))).not.toBeInstanceOf(PresetUnreadable)
    expect(presetError(ref)(new Unavailable({ operation: 'getFile', detail: 'down' }))).toBeInstanceOf(PresetUnreadable)
  })
})

describe('triggers and synthetic events', () => {
  it.effect('takes exactly one of a pull request, an issue or a known event', () =>
    Effect.gen(function* () {
      expect(yield* triggerOf({ pr: 7 })).toStrictEqual({ kind: 'pullRequest', number: 7 })
      expect(yield* triggerOf({ issue: 9, pr: undefined })).toStrictEqual({ kind: 'issue', number: 9 })
      expect(yield* triggerOf({ event: 'push' })).toStrictEqual({ kind: 'repository', event: 'push' })
      const none = yield* Effect.flip(triggerOf({}))
      expect(none).toBeInstanceOf(InvalidTrigger)
      expect(none.message).toBe('nothing to simulate: give exactly one of a pull request, an issue, or an event (schedule, push, workflow_dispatch)')
      expect((yield* Effect.flip(triggerOf({ pr: 1, event: 'push' }))).reason).toBe('more than one thing to simulate')
      expect((yield* Effect.flip(triggerOf({ event: 'issues' }))).reason).toBe('unknown event "issues"')
    }),
  )

  it.effect('builds each event from what GitHub says now', () =>
    Effect.gen(function* () {
      expect(yield* syntheticEvent({ kind: 'pullRequest', number: 7 })).toStrictEqual({
        name: 'pull_request',
        payload: { action: 'synchronize', pull_request: pull },
      })
      expect(yield* syntheticEvent({ kind: 'issue', number: 9 })).toStrictEqual({ name: 'issues', payload: { action: 'edited', issue } })
      expect(yield* syntheticEvent({ kind: 'repository', event: 'schedule' })).toStrictEqual({ name: 'schedule', payload: {} })
      expect(yield* syntheticEvent({ kind: 'repository', event: 'push' })).toStrictEqual({
        name: 'push',
        payload: { ref: 'refs/heads/main', after: 'def456' },
      })
    }).pipe(Effect.provideService(GitHub, memory().service)),
  )

  it.effect('fails on a commit that is not shaped as documented', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(syntheticEvent({ kind: 'repository', event: 'push' }))
      expect(error).toBeInstanceOf(UnexpectedResponse)
      expect(error.message).toBe('GET /commits/main: unexpected response from GitHub')
    }).pipe(Effect.provideService(GitHub, memory({}, {}, { '/commits/main': { nope: true } }).service)),
  )
})

describe('runEvent and dryRun', () => {
  it.effect('runs features and publishes the report', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const outcome = yield* Effect.flatMap(syntheticEvent({ kind: 'pullRequest', number: 7 }), (event) => runEvent({ config: {}, event })).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(outcome.result.findings.map((finding) => finding.rule)).toStrictEqual(['conventions.title'])
      expect(state.checkRuns).not.toHaveLength(0)
    }),
  )

  it.effect('lets the report reuse a marker comment only from a bot or a roles.trustedBots login', () =>
    Effect.gen(function* () {
      const config = `${CONVENTIONS}roles:\n  trustedBots: ["release-robot"]\n`
      const comments = [
        { id: 1, body: '<!-- smartcloud:report -->\nforged', author: 'mallory', bot: false },
        { id: 2, body: '<!-- smartcloud:report -->\nold', author: 'Release-Robot', bot: false },
      ]
      const { service, state } = memory({ '.github/smartcloud.yml': config }, { issues: new Map([[7, { labels: [], open: true, comments }]]) })
      const outcome = yield* Effect.flatMap(syntheticEvent({ kind: 'pullRequest', number: 7 }), (event) => runEvent({ config: {}, event })).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(outcome.published.comment).toBe('updated')
      const after = state.issues.get(7)?.comments ?? []
      expect(after).toHaveLength(2)
      expect(after[0]?.body).toBe('<!-- smartcloud:report -->\nforged')
      expect(after[1]?.body).not.toContain('old')
    }),
  )

  it.effect('records every write instead of making it', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': CONVENTIONS })
      const outcome = yield* dryRun({ trigger: { kind: 'pullRequest', number: 7 }, config: {}, features: ['conventions'] }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(state.checkRuns).toHaveLength(0)
      expect(state.issues.get(7)?.comments ?? []).toHaveLength(0)
      expect(outcome.event.name).toBe('pull_request')
      expect(outcome.writes.map((write) => write.operation)).toStrictEqual(['createCheckRun', 'createComment'])
      const text = dryRunText(outcome)
      expect(text).toContain('## smartcloud')
      expect(text).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun {"run":')
      expect(text).toContain('...')
    }),
  )

  it('describes writes and outcomes briefly', () => {
    expect(describeWrite({ operation: 'deleteLabel', details: { name: 'bug' } })).toBe('deleteLabel {"name":"bug"}')
    expect(describeWrite({ operation: 'x', details: { body: 'y'.repeat(300) } })).toHaveLength(2 + 160 + 3)
  })

  it.effect('says when nothing would be written, and lists warnings', () =>
    Effect.gen(function* () {
      const v1 = yield* Effect.promise(() => readFile(fixture('v1-smartcloud.json'), 'utf8'))
      const { service } = memory({ '.github/config.json': v1 })
      const outcome = yield* dryRun({ trigger: { kind: 'repository', event: 'schedule' }, config: {}, features: ['conventions'] }).pipe(
        Effect.provideService(GitHub, service),
      )
      const text = dryRunText(outcome)
      expect(text).toContain('warning: .github/config.json: ')
      expect(text.endsWith('**Dry run:** nothing would have been written.')).toBe(true)
      const quiet = yield* dryRun({ trigger: { kind: 'repository', event: 'schedule' }, config: { text: { text: 'version: 2\n', source: 'x' } } }).pipe(
        Effect.provideService(GitHub, service),
      )
      expect(dryRunText(quiet)).not.toContain('warning:')
    }),
  )

  it.effect('dry-runs a repository by name, with a local config', () =>
    Effect.gen(function* () {
      const file = join(dir, 'smartcloud.yml')
      yield* Effect.promise(() => writeFile(file, CONVENTIONS))
      const { service, state } = memory()
      const opened: Array<string> = []
      const connect: Connect = (coordinates) => Effect.sync(() => (opened.push(`${coordinates.owner}/${coordinates.repo}`), service))
      const outcome = yield* dryRunRepository(connect, { repository: 'Resnovas/example', pr: 7, config: file, features: undefined })
      expect(opened).toStrictEqual(['Resnovas/example'])
      expect(outcome.result.ran).toContain('conventions')
      expect(state.checkRuns).toHaveLength(0)
      expect((yield* Effect.flip(dryRunRepository(connect, { repository: 'nope', pr: 7 })))._tag).toBe('InvalidRepository')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('settings plans', () => {
  const SETTINGS = `version: 2
roles: { maintainers: [a, b] }
settings:
  merging: { squash: true }
  features: { discussions: true }
  security: { dependabotAlerts: false, codeScanning: default }
  ruleset: { blockDeletion: true }
  environments: { names: [Production] }
`

  it.effect('plans every configured step and prints each with its request', () =>
    Effect.gen(function* () {
      const { service, state } = memory({ '.github/smartcloud.yml': SETTINGS })
      const connect: Connect = () => Effect.succeed(service)
      const plan = yield* planSettingsForRepository(connect, { repository: 'Resnovas/example' })
      expect(plan.steps.map((step) => step.id)).toStrictEqual([
        'merging',
        'features',
        'dependabot-alerts',
        'code-scanning',
        'ruleset',
        'environment:Production',
        'deployment-policies:Production',
      ])
      const text = settingsPlanText(plan)
      expect(text.split('\n')[0]).toBe('Settings for Resnovas/example, in order:')
      expect(text).toContain('PATCH /repos/{owner}/{repo} {"allow_squash_merge":true}')
      expect(text).toContain('DELETE /repos/{owner}/{repo}/vulnerability-alerts\n')
      expect(text).toContain('GraphQL mutation($id: ID!)')
      expect(text).toContain('(may fail; reported as a warning)')
      expect(text).toContain('create or update by name: {"name":"house: default branch"')
      expect(text).toContain('{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}')
      expect(text).toContain(
        '- `deployment-policies:Production`: Deployment policies for "Production": branch main, tag v*\n' +
          '  create if missing: POST /repos/{owner}/{repo}/environments/Production/deployment-branch-policies {"name":"main","type":"branch"} {"name":"v*","type":"tag"}',
      )
      expect(state.requests).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('plans nothing without a settings section', () =>
    Effect.gen(function* () {
      const plan = yield* planRepositorySettings({ version: 2 }).pipe(Effect.provideService(GitHub, memory().service))
      expect(plan.steps).toStrictEqual([])
      expect(settingsPlanText(plan)).toBe('Nothing to apply to Resnovas/example: the config sets no repository settings.')
    }),
  )
})

describe('sync renders', () => {
  const template = (path: string) => fileKey('Resnovas', '.github', `templates/${path}`, 'main')
  const repo = (path: string) => fileKey('Resnovas', 'example', path)
  const managed = (ecosystem: string) =>
    `# house:managed:begin\nversion: 2\nupdates:\n  - package-ecosystem: ${ecosystem}\n    directory: /\n# house:managed:end\n# house:local\n`
  const SYNC = 'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n  values: { HOLDER: Resnovas }\n  exclude: [KEEP.md]\n'

  const seeded = () => {
    const github = memory({ '.github/smartcloud.yml': SYNC })
    const files: Array<readonly [string, string]> = [
      [template('LICENSE'), '(c) {{HOLDER}}\n'],
      [template('NEW.md'), 'new\n'],
      [template('SAME.md'), 'same\n'],
      [template('tools/run'), '#!/bin/sh\n'],
      [template('.github/dependabot.yml'), managed('npm')],
      [template('KEEP.md'), '{{UNSUPPLIED}}'],
      [repo('LICENSE'), 'MIT\n'],
      [repo('SAME.md'), 'same\n'],
      [repo('tools/run'), '#!/bin/sh\n'],
      [repo('.github/dependabot.yml'), `${managed('yarn')}  - package-ecosystem: npm\n    directory: /\n`],
    ]
    for (const [key, text] of files) github.state.files.set(key, text)
    github.state.executables.add(template('tools/run'))
    return github
  }

  it.effect('renders every synced file with what the sync would do to it, and the conflicts', () =>
    Effect.gen(function* () {
      const { service, state } = seeded()
      const render = yield* renderSyncForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' })
      expect(render.source).toBe('Resnovas/.github/templates@main')
      expect(render.files.map((file) => [file.path, file.status, file.executable])).toStrictEqual([
        ['.github/dependabot.yml', 'updated', false],
        ['LICENSE', 'updated', false],
        ['NEW.md', 'added', false],
        ['SAME.md', 'unchanged', false],
        ['tools/run', 'made executable', true],
      ])
      expect(render.files[1]?.content).toBe('(c) Resnovas\n')
      expect(render.conflicts.map((conflict) => conflict.path)).toStrictEqual(['.github/dependabot.yml'])
      expect(state.proposals).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('fails without a sync section', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(renderRepositorySync({ version: 2 }).pipe(Effect.provideService(GitHub, memory().service)))
      expect(error).toBeInstanceOf(NoSection)
      expect(error.message).toBe('the config has no sync section')
    }),
  )
})
