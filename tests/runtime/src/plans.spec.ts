/**
 * @file tests/runtime/src/plans.spec.ts
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

import { NodeContext } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { fileKey, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { identify } from '@resnovas/integrations.posthog'
import {
  command,
  NoSection,
  planRepositorySettings,
  planSettingsForRepository,
  renderRepositorySync,
  renderSyncForRepository,
  settingsPlanText,
  type Connect,
} from '@resnovas/runtime'
import { Effect } from 'effect'
import { memory, recording, withConfig } from './fixtures.js'

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

  it.effect('prints teams, webhooks without their URL, Pages and the variables check', () =>
    Effect.gen(function* () {
      const config = `version: 2
settings:
  teams: { docs: write }
  webhooks: { chat: { url: "https://hooks.example.com/T0K3N", events: [release] } }
  pages: { buildType: legacy }
  variables: { REGION: where it runs }
`
      const { service } = memory({ '.github/smartcloud.yml': config })
      const text = settingsPlanText(
        yield* planSettingsForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }),
      )
      expect(text).toContain('GraphQL updateTeamsRepository: team Resnovas/docs as WRITE')
      expect(text).toContain('create or update by URL: {"url":"(configured)","events":["release"]}')
      expect(text).not.toContain('T0K3N')
      expect(text).toContain(
        'create if missing: POST /repos/{owner}/{repo}/pages {"build_type":"legacy","source":{"branch":"main","path":"/"}}; update: PUT /repos/{owner}/{repo}/pages {"build_type":"legacy","source":{"branch":"main","path":"/"}}',
      )
      expect(text).toContain('check only: GET /repos/{owner}/{repo}/actions/variables for REGION')
      const unpublished = memory({ '.github/smartcloud.yml': 'version: 2\nsettings:\n  pages: { enabled: false }\n' })
      const off = settingsPlanText(
        yield* planSettingsForRepository(() => Effect.succeed(unpublished.service), { repository: 'Resnovas/example' }),
      )
      expect(off).toContain('DELETE /repos/{owner}/{repo}/pages')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('plans nothing without a settings section', () =>
    Effect.gen(function* () {
      const plan = yield* planRepositorySettings({ version: 2 }).pipe(Effect.provideService(GitHub, memory().service))
      expect(plan.steps).toStrictEqual([])
      expect(settingsPlanText(plan)).toBe(
        'Nothing to apply to Resnovas/example: the config sets no repository settings.',
      )
    }),
  )
})

describe('sync renders', () => {
  const template = (path: string) => fileKey('Resnovas', '.github', `templates/${path}`, 'main')
  const repo = (path: string) => fileKey('Resnovas', 'example', path)
  const managed = (ecosystem: string) =>
    `# house:managed:begin\nversion: 2\nupdates:\n  - package-ecosystem: ${ecosystem}\n    directory: /\n# house:managed:end\n# house:local\n`
  const SYNC =
    'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n  values: { HOLDER: Resnovas }\n  exclude: [KEEP.md]\n'

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
      const error = yield* Effect.flip(
        renderRepositorySync({ version: 2 }).pipe(Effect.provideService(GitHub, memory().service)),
      )
      expect(error).toBeInstanceOf(NoSection)
      expect(error.message).toBe('the config has no sync section')
    }),
  )
})

describe('runEvent with telemetry', () => {
  it.effect('records settings plans and sync renders as their invocations, for the bound repository', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const service = withConfig('version: 2\nsettings:\n  merging: { squash: true }\n')
      yield* command(
        planSettingsForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }),
        { command: 'plan settings' },
      ).pipe(Effect.provide(recorded.layer))
      yield* Effect.flip(
        command(
          renderSyncForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }),
          { command: 'sync' },
        ).pipe(Effect.provide(recorded.layer)),
      )
      expect(
        recorded.named('command run').map((event) => [event.properties['command'], event.properties['outcome']]),
      ).toStrictEqual([
        ['plan settings', 'success'],
        ['sync', 'failure'],
      ])
      expect(recorded.named('config resolved')).toHaveLength(2)
      expect(recorded.exceptions.map((exception) => exception.properties['error_tag'])).toStrictEqual(['NoSection'])
      expect(new Set(recorded.events.map((event) => event.identity.distinctId))).toStrictEqual(
        new Set([identify({ owner: 'Resnovas', repo: 'example' }).distinctId]),
      )
      expect(recorded.protectedValues).toContain('Resnovas/example')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('reports a sync render for the repository it rendered', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const github = makeMemoryGitHub()
      github.state.files.set(
        fileKey('Resnovas', 'example', '.github/smartcloud.yml'),
        'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n',
      )
      github.state.files.set(fileKey('Resnovas', '.github', 'templates/NEW.md', 'main'), 'new\n')
      const render = yield* command(
        renderSyncForRepository(() => Effect.succeed(github.service), { repository: 'Resnovas/example' }),
        { command: 'sync' },
      ).pipe(Effect.provide(recorded.layer))
      expect(render.files.length).toBeGreaterThan(0)
      expect(recorded.named('command run')[0]?.identity).toStrictEqual(identify({ owner: 'Resnovas', repo: 'example' }))
      expect(recorded.named('config resolved')[0]?.properties).toMatchObject({
        features_enabled: expect.arrayContaining(['sync']),
      })
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})
