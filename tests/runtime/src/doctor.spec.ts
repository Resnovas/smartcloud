/**
 * @file tests/runtime/src/doctor.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import {
  fileKey,
  Forbidden,
  type GitHubService,
  makeMemoryGitHub,
  type MemoryState,
  NotFound,
  Unavailable,
} from '@resnovas/integrations.github'
import {
  doctorRepository,
  doctorText,
  tokenChecks,
  tokenKind,
  workflowUsage,
  type Connect,
  type DoctorReport,
} from '@resnovas/runtime'
import { Effect, Redacted } from 'effect'
import { recording } from './fixtures.js'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const token = (value: string) => Effect.succeed(Redacted.make(value))

// An in-memory repository answering GET requests from `routes`; an Error value fails the request, and a missing route is not found.
const repo = (
  name: string,
  {
    files = {},
    routes = {},
    seed = {},
  }: { files?: Record<string, string>; routes?: Record<string, unknown>; seed?: Partial<MemoryState> } = {},
) => {
  const [owner = '', repoName = ''] = name.split('/')
  const github = makeMemoryGitHub({
    repository: {
      owner,
      name: repoName,
      fullName: name,
      nodeId: `R_${repoName}`,
      private: false,
      defaultBranch: 'main',
    },
    ...seed,
  })
  for (const [key, text] of Object.entries(files))
    github.state.files.set(key.includes('@') ? key : fileKey(owner, repoName, key), text)
  const service: GitHubService = {
    ...github.service,
    coordinates: { owner, repo: repoName },
    repositoryRequest: (request) => {
      const answer = routes[request.path]
      if (answer instanceof Error) return Effect.fail(answer as Forbidden)
      return answer === undefined
        ? Effect.fail(new NotFound({ operation: request.path, detail: '404' }))
        : Effect.succeed(answer)
    },
  }
  return service
}

const connectTo =
  (...services: ReadonlyArray<GitHubService>): Connect =>
  ({ owner, repo: name }) =>
    Effect.succeed(
      services.find((service) => service.coordinates.owner === owner && service.coordinates.repo === name) ??
        repo(`${owner}/${name}`, {
          seed: {
            repository: {
              owner,
              name,
              fullName: `${owner}/${name}`,
              nodeId: 'R',
              private: false,
              defaultBranch: 'main',
            },
          },
        }),
    )

const list = (field: string, names: ReadonlyArray<string>) => ({
  total_count: names.length,
  [field]: names.map((name) => ({ name })),
})
const page = (path: string) => `/${path}?per_page=30&page=1`

const HOUSE = 'version: 2\nextends:\n  - Resnovas/.github/smartcloud/house.yml@main\n'
const WORKFLOW = `name: smartcloud
jobs:
  smartcloud:
    steps:
      # uses: Someone/commented@v1 with \${{ secrets.COMMENTED }}
      - uses: actions/create-github-app-token@v3
        with:
          client-id: \${{ vars.RESNOVAS_BOT_APP_ID }}
          private-key: \${{ secrets.RESNOVAS_BOT_PRIVATE_KEY }}
      - uses: resnovas/smartcloud@v2
        with:
          GITHUB_TOKEN: \${{ secrets.ACCESS_TOKEN }}
  graphify:
    uses: Resnovas/.github/.github/workflows/graphify.yml@main
`

const statuses = (report: DoctorReport) => report.checks.map((check) => `${check.status} ${check.name}`)
const messages = (report: DoctorReport, name: string) =>
  report.checks.filter((check) => check.name === name).map((check) => check.message)

describe('tokenKind', () => {
  it('tells every kind from its prefix', () => {
    expect(['ghp_1', 'github_pat_1', 'gho_1', 'ghu_1', 'ghs_1', 'x'].map(tokenKind)).toStrictEqual([
      'classic',
      'fine-grained',
      'oauth',
      'app-user',
      'installation',
      'unknown',
    ])
  })
})

describe('tokenChecks', () => {
  it('fails a scoped token without repo and warns without workflow', () => {
    const checks = tokenChecks('classic', [])
    expect(checks.map((check) => check.status)).toStrictEqual(['ok', 'failure', 'warning', 'warning'])
    expect(checks[0]?.message).toBe('a classic personal access token with scopes: none')
  })

  it('warns that a personal token cannot create check runs', () => {
    expect(tokenChecks('oauth', ['repo', 'workflow']).map((check) => check.name)).toStrictEqual(['token', 'check runs'])
    expect(tokenChecks('fine-grained', undefined).map((check) => check.name)).toStrictEqual(['token', 'check runs'])
    expect(tokenChecks('unknown', undefined).map((check) => check.name)).toStrictEqual(['token'])
  })
})

describe('workflowUsage', () => {
  it('collects repositories, secrets, variables and the token passed to smartcloud', () => {
    const usage = workflowUsage('Resnovas/example', [
      { path: 'a.yml', text: WORKFLOW },
      {
        path: 'b.yml',
        text: "steps:\n  - uses: './local'\n  - uses: docker://alpine\n  - uses: Resnovas/example/.github/actions/x@main\n  - run: echo ${{ secrets.github_token }} ${{ secrets.late }} ${{ secrets.LATE }}\n    env:\n      GITHUB_TOKEN: ${{ secrets.OTHER }}\n",
      },
    ])
    expect([...usage.repositories]).toStrictEqual([
      ['actions/create-github-app-token', 'a.yml'],
      ['resnovas/smartcloud', 'a.yml'],
      ['Resnovas/.github', 'a.yml'],
    ])
    expect([...usage.secrets.keys()]).toStrictEqual(['RESNOVAS_BOT_PRIVATE_KEY', 'ACCESS_TOKEN', 'LATE', 'OTHER'])
    expect([...usage.variables]).toStrictEqual([['RESNOVAS_BOT_APP_ID', 'a.yml']])
    expect([...usage.smartcloudTokens]).toStrictEqual([['ACCESS_TOKEN', 'a.yml']])
  })

  it('leaves out the secrets a reusable workflow declares, and reads a file that is not valid YAML', () => {
    const usage = workflowUsage('Resnovas/.github', [
      {
        path: 'graphify.yml',
        text: 'on:\n  workflow_call:\n    secrets:\n      token: { required: false }\njobs:\n  a:\n    steps:\n      - run: echo ${{ secrets.TOKEN }} ${{ secrets.OWN }}\n',
      },
      { path: 'broken.yml', text: 'on: [\nrun: ${{ secrets.BROKEN }}\n' },
    ])
    expect([...usage.secrets.keys()]).toStrictEqual(['OWN', 'BROKEN'])
  })

  it('reads the token smartcloud passes to its own action', () => {
    const usage = workflowUsage('Resnovas/smartcloud', [
      {
        path: 'a.yml',
        text: 'steps:\n  - uses: ./\n    with:\n      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n  - uses: ./\n    with:\n      GITHUB_TOKEN: ${{ secrets.PAT }}\n',
      },
    ])
    expect([...usage.smartcloudTokens.keys()]).toStrictEqual(['PAT'])
    expect(
      workflowUsage('Resnovas/other', [
        { path: 'a.yml', text: '- uses: ./\n  with:\n    GITHUB_TOKEN: ${{ secrets.PAT }}\n' },
      ]).smartcloudTokens.size,
    ).toBe(0)
  })
})

describe('doctorRepository', () => {
  const healthy = (routes: Record<string, unknown> = {}) => {
    const target = repo('Resnovas/example', {
      files: {
        '.github/smartcloud.yml': HOUSE,
        [fileKey('Resnovas', '.github', 'smartcloud/house.yml', 'main')]: 'version: 2\n',
        '.github/workflows/smartcloud.yml': WORKFLOW,
        '.github/workflows/nested/skip.yml': 'uses: Skipped/repo@v1\n',
        '.github/workflows/README.md': 'uses: Skipped/too@v1\n',
      },
      seed: { tokenScopes: ['repo', 'workflow'] },
      routes: {
        '': { permissions: { admin: true, push: true } },
        [page('actions/secrets')]: list('secrets', ['RESNOVAS_BOT_PRIVATE_KEY']),
        [page('actions/organization-secrets')]: list('secrets', ['ACCESS_TOKEN']),
        [page('environments')]: list('environments', ['Production']),
        '/environments/Production/secrets?per_page=30&page=1': list('secrets', []),
        [page('actions/variables')]: list('variables', []),
        [page('actions/organization-variables')]: list('variables', ['resnovas_bot_app_id']),
        '/environments/Production/variables?per_page=30&page=1': list('variables', []),
        ...routes,
      },
    })
    const house = repo('Resnovas/.github', {
      seed: {
        repository: {
          owner: 'Resnovas',
          name: '.github',
          fullName: 'Resnovas/.github',
          nodeId: 'R',
          private: true,
          defaultBranch: 'main',
        },
      },
      routes: { '/actions/permissions/access': { access_level: 'organization' } },
    })
    return { target, house }
  }

  it.effect('passes a healthy repository, noting a token passed to smartcloud from a secret', () =>
    Effect.gen(function* () {
      const { target, house } = healthy()
      const report = yield* doctorRepository(
        connectTo(target, house),
        { repository: 'Resnovas/example' },
        token('gho_x'),
      )
      expect(statuses(report)).toStrictEqual([
        'ok token',
        'warning check runs',
        'ok repository',
        'ok config',
        'ok presets',
        'ok workflows',
        'warning check runs',
        'ok actions access',
        'ok actions access',
        'ok secrets',
        'ok variables',
      ])
      expect(messages(report, 'presets')[0]).toContain('Resnovas/.github is private')
      expect(messages(report, 'actions access')).toContain(
        'Resnovas/.github is private and its Actions access (organization) lets .github/workflows/smartcloud.yml use it',
      )
      expect(messages(report, 'workflows')).toStrictEqual(['read 1 workflow file(s)'])
      expect(messages(report, 'actions access')[0]).toBe(
        'public, so usable from any workflow: actions/create-github-app-token, resnovas/smartcloud',
      )
      const text = doctorText(report)
      expect(text.split('\n')[0]).toBe('smartcloud doctor for Resnovas/example:')
      expect(text.split('\n').at(-1)).toBe('0 failure(s), 2 warning(s).')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('records the operation with its failure count', () =>
    Effect.gen(function* () {
      const { target, house } = healthy()
      const telemetry = recording()
      const report = yield* doctorRepository(
        connectTo(target, house),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      ).pipe(Effect.provide(telemetry.layer))
      expect(report.checks.every((check) => check.status !== 'failure')).toBe(true)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('fails a private reusable workflow repository whose Actions access is none', () =>
    Effect.gen(function* () {
      const { target } = healthy()
      const house = repo('Resnovas/.github', {
        seed: {
          repository: {
            owner: 'Resnovas',
            name: '.github',
            fullName: 'Resnovas/.github',
            nodeId: 'R',
            private: true,
            defaultBranch: 'main',
          },
        },
        routes: { '/actions/permissions/access': { access_level: 'none' } },
      })
      const report = yield* doctorRepository(
        connectTo(target, house),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(report.checks.find((check) => check.status === 'failure')?.message).toContain('its Actions access is none')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect(
    'fails organisation access from another owner, and warns when the access or the repository cannot be read',
    () =>
      Effect.gen(function* () {
        const { target } = healthy()
        const workflows =
          'uses: Other/private/.github/workflows/a.yml@v1\nuses: Other/locked/a@v1\nuses: Other/gone@v1\nuses: Other/odd@v1\nuses: Other/user@v1\n'
        const other = (name: string, access: unknown) =>
          repo(`Other/${name}`, {
            seed: {
              repository: {
                owner: 'Other',
                name,
                fullName: `Other/${name}`,
                nodeId: 'R',
                private: true,
                defaultBranch: 'main',
              },
            },
            routes: { '/actions/permissions/access': access },
          })
        const gone: GitHubService = {
          ...repo('Other/gone'),
          getRepository: Effect.fail(new Forbidden({ operation: 'getRepository', detail: 'no' })),
        }
        const withWorkflows: GitHubService = {
          ...target,
          getFile: (location) =>
            location.path.endsWith('smartcloud.yml') && location.path.startsWith('.github/workflows')
              ? Effect.succeed(workflows)
              : target.getFile(location),
        }
        const report = yield* doctorRepository(
          connectTo(
            withWorkflows,
            other('private', { access_level: 'organization' }),
            other('locked', new Forbidden({ operation: 'access', detail: 'admin only' })),
            gone,
            other('odd', {}),
            other('user', { access_level: 'enterprise' }),
          ),
          { repository: 'Resnovas/example' },
          token('ghs_x'),
        )
        expect(
          report.checks.filter((check) => check.name === 'actions access').map((check) => check.status),
        ).toStrictEqual(['failure', 'warning', 'warning', 'failure', 'ok'])
        expect(messages(report, 'actions access')[3]).toContain('its Actions access is unknown')
      }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('fails missing secrets and variables, and only warns when a list cannot be read', () =>
    Effect.gen(function* () {
      const { target, house } = healthy({
        [page('actions/organization-secrets')]: list('secrets', []),
        [page('actions/organization-variables')]: new Forbidden({ operation: 'vars', detail: 'no' }),
      })
      const both = yield* doctorRepository(
        connectTo(
          healthy({
            [page('actions/secrets')]: list('secrets', []),
            [page('actions/organization-secrets')]: list('secrets', []),
          }).target,
          house,
        ),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(messages(both, 'secrets')[0]).toContain('; add them in Settings')
      const report = yield* doctorRepository(
        connectTo(target, house),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(report.checks.find((check) => check.name === 'secrets')).toStrictEqual({
        name: 'secrets',
        status: 'failure',
        message:
          'missing ACCESS_TOKEN (read by .github/workflows/smartcloud.yml); add it in Settings > Secrets and variables > Actions, for the repository or the organisation',
      })
      expect(report.checks.find((check) => check.name === 'variables')?.status).toBe('warning')
      expect(messages(report, 'variables')[0]).toContain('could not read organisation variables')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('lists every page, and names environments and lists it could not read', () =>
    Effect.gen(function* () {
      const { target, house } = healthy({
        [page('actions/secrets')]: { total_count: 2, secrets: [{ name: 'RESNOVAS_BOT_PRIVATE_KEY' }] },
        '/actions/secrets?per_page=30&page=2': { total_count: 2, secrets: [{ name: 'ACCESS_TOKEN' }] },
        [page('actions/organization-secrets')]: { total_count: 5, secrets: [] },
        [page('environments')]: new Unavailable({ operation: 'environments', detail: 'down' }),
        [page('actions/variables')]: { unexpected: true },
        [page('actions/organization-variables')]: list('variables', []),
      })
      const report = yield* doctorRepository(
        connectTo(target, house),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(report.checks.find((check) => check.name === 'secrets')?.status).toBe('ok')
      const variables = messages(report, 'variables')[0] ?? ''
      expect(variables).toContain('environments (')
      expect(variables).toContain('repository variables (GET /actions/variables: unexpected response from GitHub)')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('stops when the token cannot read the repository', () =>
    Effect.gen(function* () {
      const target = repo('Resnovas/example', {
        routes: { '': new Forbidden({ operation: 'repo', detail: 'Resource not accessible' }) },
      })
      const failing: GitHubService = {
        ...target,
        tokenScopes: Effect.fail(new Forbidden({ operation: 'scopes', detail: 'no' })),
      }
      const report = yield* doctorRepository(connectTo(failing), { repository: 'Resnovas/example' }, token('ghs_x'))
      expect(statuses(report)).toStrictEqual(['ok token', 'failure repository'])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('reports what the token may do in the repository', () =>
    Effect.gen(function* () {
      const check = (answer: unknown) =>
        Effect.map(
          doctorRepository(
            connectTo(
              repo('Resnovas/example', { routes: { '': answer }, files: { '.github/smartcloud.yml': 'version: 2\n' } }),
            ),
            { repository: 'Resnovas/example' },
            token('ghs_x'),
          ),
          (report) => report.checks.find((found) => found.name === 'repository'),
        )
      expect((yield* check({ permissions: { admin: false, push: true } }))?.message).toContain('not an admin')
      expect((yield* check({ permissions: { admin: false, push: false } }))?.message).toContain('can only read')
      expect((yield* check({}))?.message).toContain("an app token's permissions come from its installation")
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('fails a missing config and warns about unreadable presets, migration warnings and workflows', () =>
    Effect.gen(function* () {
      const missing = yield* doctorRepository(
        connectTo(repo('Resnovas/example', { routes: { '': {} } })),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(missing.checks.find((check) => check.name === 'config')?.status).toBe('failure')
      expect(messages(missing, 'secrets')).toStrictEqual(['the workflows read no secrets'])

      const target = repo('Resnovas/example', {
        routes: { '': {} },
        files: {
          '.github/config.json': '{"labels": {}, "unknownKey": true}',
          [fileKey('Other', 'presets', 'p.yml')]: 'version: 2\n',
        },
      })
      const failingWorkflows: GitHubService = {
        ...target,
        listDirectory: () => Effect.fail(new Unavailable({ operation: 'listDirectory', detail: 'down' })),
      }
      const warned = yield* doctorRepository(
        connectTo(failingWorkflows),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(statuses(warned)).toContain('warning config')
      expect(statuses(warned)).toContain('warning workflows')
      const noWorkflows: GitHubService = {
        ...target,
        listDirectory: () => Effect.fail(new NotFound({ operation: 'listDirectory', detail: '404' })),
      }
      expect(
        messages(
          yield* doctorRepository(connectTo(noWorkflows), { repository: 'Resnovas/example' }, token('ghs_x')),
          'workflows',
        ),
      ).toStrictEqual(['read 0 workflow file(s)'])

      const presetTarget = repo('Resnovas/example', {
        routes: { '': {} },
        files: {
          '.github/smartcloud.yml': 'version: 2\nextends:\n  - Other/presets/p.yml\n  - Resnovas/example/local.yml\n',
          'local.yml': 'version: 2\n',
          [fileKey('Other', 'presets', 'p.yml')]: 'version: 2\n',
        },
      })
      const unreadable: GitHubService = {
        ...repo('Other/presets'),
        getRepository: Effect.fail(new Forbidden({ operation: 'getRepository', detail: 'no' })),
      }
      const presets = yield* doctorRepository(
        connectTo(presetTarget, unreadable),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(statuses(presets).filter((status) => status.endsWith('presets'))).toStrictEqual(['warning presets'])
      const publicPreset = yield* doctorRepository(
        connectTo(presetTarget),
        { repository: 'Resnovas/example' },
        token('ghs_x'),
      )
      expect(messages(publicPreset, 'presets')).toStrictEqual(['Other/presets is public'])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('checks a local config file instead of the repository one', () =>
    Effect.gen(function* () {
      const file = join(yield* Effect.promise(() => mkdtemp(join(tmpdir(), 'doctor-'))), 'smartcloud.yml')
      yield* Effect.promise(() => writeFile(file, 'version: 2\n'))
      const report = yield* doctorRepository(
        connectTo(repo('Resnovas/example', { routes: { '': {} } })),
        { repository: 'Resnovas/example', config: file },
        token('ghs_x'),
      )
      expect(messages(report, 'config')).toStrictEqual(['the config is valid and extends no presets'])
      const missing = yield* Effect.flip(
        doctorRepository(
          connectTo(repo('Resnovas/example')),
          { repository: 'Resnovas/example', config: `${file}.missing` },
          token('ghs_x'),
        ),
      )
      expect(missing._tag).toBe('SystemError')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})
