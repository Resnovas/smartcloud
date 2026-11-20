/**
 * @file tests/tools/src/affected.spec.ts
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

import { expect, it } from '@effect/vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../..', import.meta.url))

it('runs staged transitive tests, preserves captured trees and propagates failures without building', () => {
  const scratch = join(root, '.amp/in/orb-backup')
  mkdirSync(scratch, { recursive: true })
  const cwd = mkdtempSync(join(scratch, 'affected-fixture-'))
  const env: NodeJS.ProcessEnv = { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' }
  const localNames = execFileSync('git', ['rev-parse', '--local-env-vars'], { cwd: root, encoding: 'utf8' })
    .trim()
    .split('\n')
  for (const name of localNames) delete env[name]
  const git = (...args: string[]) => execFileSync('git', args, { cwd, env, encoding: 'utf8' }).trim()
  git('init', '--quiet')
  git('config', 'core.hooksPath', '.git/hooks')
  symlinkSync(join(root, 'node_modules'), join(cwd, 'node_modules'), 'junction')
  writeFileSync(join(cwd, '.gitignore'), 'node_modules/\n.nx/\n.amp/\n')
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'affected-fixture', private: true }))
  writeFileSync(join(cwd, 'nx.json'), '{}')
  for (const name of ['alpha', 'beta', 'gamma']) {
    mkdirSync(join(cwd, name, 'src'), { recursive: true })
    writeFileSync(join(cwd, name, 'src/value.ts'), 'export const value = 1\n')
    writeFileSync(
      join(cwd, name, 'project.json'),
      JSON.stringify({
        name,
        implicitDependencies: name === 'beta' ? ['alpha'] : [],
        targets: {
          test: {
            executor: 'nx:run-commands',
            cache: false,
            dependsOn: ['build'],
            options: { command: `node .git/record.cjs ${name}` },
          },
          build: { executor: 'nx:run-commands', options: { command: 'node -e "process.exit(97)"' } },
        },
      }),
    )
  }
  writeFileSync(
    join(cwd, '.git/record.cjs'),
    `const fs = require('node:fs');
for (const name of ${JSON.stringify(localNames)}) require('node:assert/strict').equal(process.env[name], undefined);
fs.appendFileSync('.git/executed', process.argv[2] + '\\n');
if (fs.existsSync('.git/fail-' + process.argv[2])) process.exit(7);
`,
  )
  git('add', '.')
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '-qm',
    'fixture',
  )
  const run = (...args: string[]) => {
    writeFileSync(join(cwd, '.git/executed'), '')
    return spawnSync(process.execPath, [join(root, 'tools/test/affected.ts'), ...args], {
      cwd,
      env,
      encoding: 'utf8',
      timeout: 60000,
    })
  }
  const executed = () => readFileSync(join(cwd, '.git/executed'), 'utf8').trim().split('\n').filter(Boolean).sort()
  const empty = run()
  expect(empty.status, empty.stderr).toBe(0)
  expect(executed()).toEqual([])

  writeFileSync(join(cwd, 'alpha/src/value.ts'), 'export const value = 2\n')
  git('add', 'alpha')
  const captured = git('write-tree')
  writeFileSync(join(cwd, 'gamma/src/value.ts'), 'export const value = 3\n')
  const staged = run()
  expect(staged.status, staged.stdout + staged.stderr).toBe(0)
  expect(executed()).toEqual(['alpha', 'beta'])
  git('add', 'gamma')
  const snapshot = run('--staged-tree', captured)
  expect(snapshot.status, snapshot.stdout + snapshot.stderr).toBe(0)
  expect(executed()).toEqual(['alpha', 'beta'])

  // A real alternate index selects beta only. Neither the regular index nor
  // its Git-local environment may leak into selection or the test children.
  env.GIT_INDEX_FILE = join(cwd, '.git/alternate.index')
  git('read-tree', 'HEAD')
  writeFileSync(join(cwd, 'beta/src/value.ts'), 'export const value = 4\n')
  git('add', 'beta')
  const alternate = run()
  expect(alternate.status, alternate.stdout + alternate.stderr).toBe(0)
  expect(executed()).toEqual(['beta'])
  delete env.GIT_INDEX_FILE

  writeFileSync(join(cwd, 'workspace.json'), '{}')
  git('add', 'workspace.json')
  const workspace = run()
  expect(workspace.status, workspace.stdout + workspace.stderr).toBe(0)
  expect(executed()).toEqual(['alpha', 'beta', 'gamma'])
  writeFileSync(join(cwd, '.git/fail-alpha'), '')
  const failure = run('--staged-tree', captured)
  expect(failure.status, failure.stdout + failure.stderr).not.toBe(0)
  expect(executed()).toContain('alpha')
}, 120000)
