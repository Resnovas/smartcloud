/**
 * @file tests/runtime/src/plans.spec.ts
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
import { fileKey, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'
import { NoSection, planRepositorySettings, planSettingsForRepository, renderRepositorySync, renderSyncForRepository, settingsPlanText, type Connect } from '@resnovas/runtime'
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

describe('runEvent with telemetry', () => {
  it.effect('records settings plans and sync renders', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const service = withConfig('version: 2\nsettings:\n  merging: { squash: true }\n')
      yield* planSettingsForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }).pipe(Effect.provide(recorded.layer))
      yield* Effect.flip(renderSyncForRepository(() => Effect.succeed(service), { repository: 'Resnovas/example' }).pipe(Effect.provide(recorded.layer)))
      expect(recorded.events.map((event) => [event.event, event.properties['outcome']])).toStrictEqual([
        ['smartcloud settings plan', 'success'],
        ['smartcloud sync render', 'failure'],
      ])
      expect(recorded.events[0]?.properties['steps']).toBe(1)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('describes the files a sync render produced', () =>
    Effect.gen(function* () {
      const recorded = recording()
      const github = makeMemoryGitHub()
      github.state.files.set(fileKey('Resnovas', 'example', '.github/smartcloud.yml'), 'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n')
      github.state.files.set(fileKey('Resnovas', '.github', 'templates/NEW.md', 'main'), 'new\n')
      const render = yield* renderSyncForRepository(() => Effect.succeed(github.service), { repository: 'Resnovas/example' }).pipe(
        Effect.provide(recorded.layer),
      )
      expect(recorded.events[0]?.properties['files']).toBe(render.files.length)
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})
