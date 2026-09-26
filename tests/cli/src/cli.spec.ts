/**
 * @file tests/cli/src/cli.spec.ts
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
import { parseConfig } from '@resnovas/config'
import { fileKey, GitHub, type GitHubService, makeMemoryGitHub } from '@resnovas/integrations.github'
import type { Connect } from '@resnovas/runtime'
import {
  checkCommitCommand,
  CommitCheckFailed,
  ConfigSourceFromGitHub,
  isWithin,
  locateConfig,
  main,
  migrate,
  NoConfig,
  run,
  runWith,
  stampedVersion,
  UnknownAuthor,
  UnsafePath,
  validate,
  VERSION,
} from '@resnovas/smartcloud'
import { Path } from '@effect/platform'
import { Effect, Layer } from 'effect'
import { chmod, mkdir, mkdtemp, readdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, vi } from 'vitest'

const fixture = (name: string) => join(import.meta.dirname, '../../config/src/fixtures', name)

let dir: string
let logs: Array<string>
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'smartcloud-cli-'))
  logs = []
  vi.spyOn(console, 'log').mockImplementation((...args: Array<unknown>) => void logs.push(args.join(' ')))
})
afterEach(() => vi.restoreAllMocks())

describe('locateConfig', () => {
  it.effect('finds the first candidate, and says where it looked otherwise', () =>
    Effect.gen(function* () {
      const missing = yield* Effect.flip(locateConfig(dir))
      expect(missing).toBeInstanceOf(NoConfig)
      expect(missing.message).toContain('.github/smartcloud.yml')
      yield* Effect.promise(async () => {
        await mkdir(join(dir, '.github'))
        await writeFile(join(dir, '.github/config.json'), '{}')
      })
      expect(yield* locateConfig(dir)).toBe(join(dir, '.github/config.json'))
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

const memorySource = (files: Record<string, string>) => {
  const { service, state } = makeMemoryGitHub()
  for (const [key, text] of Object.entries(files)) state.files.set(key, text)
  return ConfigSourceFromGitHub.pipe(Layer.provide(Layer.succeed(GitHub, service)))
}

describe('validate', () => {
  it.effect('resolves extends and reports sources and warnings', () =>
    Effect.gen(function* () {
      const file = join(dir, 'smartcloud.yml')
      yield* Effect.promise(() =>
        writeFile(file, 'version: 2\nextends: [Resnovas/.github/smartcloud.yml@main]\nlabels:\n  bug: { name: bug, color: d73a4a }\n'),
      )
      const resolved = yield* validate(file).pipe(
        Effect.provide(memorySource({ [fileKey('Resnovas', '.github', 'smartcloud.yml', 'main')]: 'version: 2\nroles: { maintainers: [TGTGamer] }\n' })),
      )
      expect(resolved.config.roles?.maintainers).toStrictEqual(['TGTGamer'])
      expect(logs[0]).toBe(`${file} is a valid smartcloud config.`)
      expect(logs[1]).toContain('Resnovas/.github/smartcloud.yml@main')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('prints migration warnings for a v1 config and fails on a missing preset', () =>
    Effect.gen(function* () {
      yield* validate(fixture('v1-smartcloud.json')).pipe(Effect.provide(memorySource({})))
      expect(logs.some((line) => line.startsWith('warning: '))).toBe(true)
      const file = join(dir, 'broken.yml')
      yield* Effect.promise(() => writeFile(file, 'version: 2\nextends: [Resnovas/.github/missing.yml]\n'))
      const error = yield* Effect.flip(validate(file).pipe(Effect.provide(memorySource({}))))
      expect(error._tag).toBe('ConfigNotFound')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('migrate', () => {
  it.effect('prints only v2 YAML with a schema hint on stdout, and every warning on stderr', () =>
    Effect.gen(function* () {
      const errors: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void errors.push(args.join(' ')))
      const config = yield* migrate(fixture('v1-smartcloud.json'), undefined)
      expect(config.version).toBe(2)
      expect(logs).toHaveLength(1)
      expect(logs[0]).toMatch(/^# yaml-language-server: \$schema=.*smartcloud\.schema\.json\nversion: 2\n/)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.every((line) => line.startsWith('warning: '))).toBe(true)
      // Redirected stdout is a config that parses as it is.
      yield* parseConfig(logs.join('\n'), 'stdout')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('writes to a file, and round-trips through validate', () =>
    Effect.gen(function* () {
      const out = join(dir, 'smartcloud.yml')
      yield* migrate(fixture('v1-eventiva.json'), out)
      expect(logs).toContain(`Wrote ${out}.`)
      const written = yield* Effect.promise(() => readFile(out, 'utf8'))
      expect(written).toContain('version: 2')
      yield* validate(out).pipe(Effect.provide(memorySource({})))
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('rejects a file that does not parse, or is not a mapping', () =>
    Effect.gen(function* () {
      const bad = join(dir, 'bad.json')
      yield* Effect.promise(() => writeFile(bad, '{ nope'))
      expect((yield* Effect.flip(migrate(bad, undefined)))._tag).toBe('ConfigParseError')
      const list = join(dir, 'list.json')
      yield* Effect.promise(() => writeFile(list, '[]'))
      expect((yield* Effect.flip(migrate(list, undefined)))._tag).toBe('ConfigDecodeError')
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('the smartcloud command', () => {
  it.effect('runs migrate and validate from an argument vector', () =>
    Effect.gen(function* () {
      const out = join(dir, 'out.yml')
      yield* run(['node', 'smartcloud', 'migrate', fixture('v1-eventiva.json'), '--out', out])
      expect(logs).toContain(`Wrote ${out}.`)
      yield* run(['node', 'smartcloud', 'validate', out])
      expect(logs).toContain(`${out} is a valid smartcloud config.`)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('validate finds the config in the working directory', () =>
    Effect.gen(function* () {
      yield* Effect.promise(async () => {
        await mkdir(join(dir, '.github'))
        await writeFile(join(dir, '.github/smartcloud.yml'), 'version: 2\n')
      })
      const cwd = process.cwd()
      process.chdir(dir)
      yield* run(['node', 'smartcloud', 'validate']).pipe(Effect.ensuring(Effect.sync(() => process.chdir(cwd))))
      expect(logs).toContain('.github/smartcloud.yml is a valid smartcloud config.')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('prints one line and sets exit code 1 on failure, and only the exit code on a usage error', () =>
    Effect.gen(function* () {
      const errors: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void errors.push(args.join(' ')))
      const before = process.exitCode
      yield* main(['node', 'smartcloud', 'validate', join(dir, 'missing.yml')])
      expect(errors).toHaveLength(1)
      expect(errors[0]).toMatch(/^smartcloud: .*missing\.yml/)
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      yield* main(['node', 'smartcloud', 'bogus'])
      expect(errors.filter((line) => line.startsWith('smartcloud: '))).toHaveLength(1)
      expect(process.exitCode).toBe(1)
      process.exitCode = before
      yield* main(['node', 'smartcloud', 'validate', fixture('v1-eventiva.json')])
      expect(process.exitCode).toBe(before)
      // A schema error spans lines; the failure is still one line.
      const invalid = join(dir, 'invalid.yml')
      yield* Effect.promise(() => writeFile(invalid, 'version: 2\nlabels: nope\n'))
      yield* main(['node', 'smartcloud', 'validate', invalid])
      const last = errors.at(-1) ?? ''
      expect(last).toMatch(/^smartcloud: .*invalid\.yml is not a valid smartcloud config: /)
      expect(last).not.toContain('\n')
      process.exitCode = before
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

const CONVENTIONS = 'version: 2\nconventions:\n  rules:\n    title:\n      preset: conventionalCommits\n'

const pull = {
  number: 7,
  title: 'Add things',
  body: '',
  user: { login: 'jane' },
  state: 'open',
  locked: false,
  labels: [],
  updated_at: '2026-09-01T00:00:00Z',
  head: { ref: 'feat/x', sha: 'abc123' },
}

// The in-memory GitHub, answering the pull request read a dry run makes.
const repository = (files: Record<string, string>) => {
  const github = makeMemoryGitHub()
  for (const [key, text] of Object.entries(files)) github.state.files.set(key, text)
  github.state.pulls.set(7, { commits: [], files: [], reviews: [], requestedReviewers: [], submittedReviews: [] })
  const service: GitHubService = {
    ...github.service,
    repositoryRequest: (request) =>
      request.method === 'GET' && request.path === '/pulls/7' ? Effect.succeed(pull) : github.service.repositoryRequest(request),
  }
  const connect: Connect = () => Effect.succeed(service)
  return { connect, state: github.state }
}

describe('dry-run', () => {
  it.effect('prints the summary and the writes it recorded, writing nothing', () =>
    Effect.gen(function* () {
      const { connect, state } = repository({ [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: CONVENTIONS })
      yield* runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--pr', '7', '--features', 'conventions, labels'])
      expect(logs[0]).toContain('Event: `pull_request` (synchronize) on #7')
      expect(logs[0]).toContain('**Dry run:** these writes were recorded, not made:\n- createCheckRun')
      expect(state.checkRuns).toStrictEqual([])
      expect(state.issues.get(7)?.comments ?? []).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('takes a local config and an event', () =>
    Effect.gen(function* () {
      const file = join(dir, 'smartcloud.yml')
      yield* Effect.promise(() => writeFile(file, 'version: 2\n'))
      const { connect } = repository({})
      yield* runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--event', 'schedule', '--config', file])
      expect(logs[0]).toContain('Event: `schedule`')
      expect(logs[0]).toContain('**Dry run:** nothing would have been written.')
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('runs every feature when the feature list is empty', () =>
    Effect.gen(function* () {
      const { connect } = repository({ [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: CONVENTIONS })
      const dry = (...extra: Array<string>) =>
        Effect.map(runWith(connect)(['node', 'smartcloud', 'dry-run', '--repo', 'Resnovas/example', '--pr', '7', ...extra]), () => logs.splice(0).join('\n'))
      const all = yield* dry()
      expect(yield* dry('--features', ',')).toBe(all)
      expect(yield* dry('--features', 'conventions')).not.toBe(all)
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('plan settings', () => {
  it.effect('prints the planned steps without applying them', () =>
    Effect.gen(function* () {
      const { connect, state } = repository({
        [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: 'version: 2\nsettings:\n  merging: { squash: true }\n',
      })
      yield* runWith(connect)(['node', 'smartcloud', 'plan', 'settings', '--repo', 'Resnovas/example'])
      expect(logs[0]).toBe('Settings for Resnovas/example, in order:\n- `merging`: Merging, branches, sign-off and wiki\n  PATCH /repos/{owner}/{repo} {"allow_squash_merge":true}')
      expect(state.requests).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('sync', () => {
  const template = (path: string) => fileKey('Resnovas', '.github', `templates/${path}`, 'main')
  const SYNC = 'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n  values: { HOLDER: Resnovas }\n'
  const managed = (ecosystem: string) =>
    `# house:managed:begin\nversion: 2\nupdates:\n  - package-ecosystem: ${ecosystem}\n    directory: /\n# house:managed:end\n# house:local\n`

  it.effect('renders the synced files into a directory and lists conflicts, proposing nothing', () =>
    Effect.gen(function* () {
      const { connect, state } = repository({
        [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: SYNC,
        [template('LICENSE')]: '(c) {{HOLDER}}\n',
        [template('tools/run')]: '#!/bin/sh\n',
        [template('.github/dependabot.yml')]: managed('npm'),
        [fileKey('Resnovas', 'example', '.github/dependabot.yml')]: `${managed('npm')}  - package-ecosystem: npm\n    directory: /\n`,
      })
      state.executables.add(template('tools/run'))
      const out = join(dir, 'out')
      yield* runWith(connect)(['node', 'smartcloud', 'sync', '--repo', 'Resnovas/example', '--out', out])
      expect(yield* Effect.promise(() => readFile(join(out, 'LICENSE'), 'utf8'))).toBe('(c) Resnovas\n')
      expect((yield* Effect.promise(() => stat(join(out, 'tools/run')))).mode & 0o777).toBe(0o755)
      expect((yield* Effect.promise(() => stat(join(out, 'LICENSE')))).mode & 0o777).toBe(0o644)
      expect(logs).toContain(`Rendered 3 file(s) from Resnovas/.github/templates@main into ${out}:`)
      expect(logs).toContain('- LICENSE (added)')
      expect(logs).toContain('- .github/dependabot.yml (unchanged)')
      expect(logs.some((line) => line.startsWith('conflict: .github/dependabot.yml '))).toBe(true)
      expect(state.proposals).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('refuses to write outside the output directory', () =>
    Effect.gen(function* () {
      const { connect } = repository({ [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: SYNC, [template('../../escape')]: 'x' })
      const errors: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void errors.push(args.join(' ')))
      const before = process.exitCode
      yield* main(['node', 'smartcloud', 'sync', '--repo', 'Resnovas/example', '--out', join(dir, 'out')], connect)
      expect(errors).toStrictEqual([new UnsafePath({ path: '../../escape' }).message].map((message) => `smartcloud: ${message}`))
      expect(process.exitCode).toBe(1)
      process.exitCode = before
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('treats every path under a root of / as inside it, and a sibling directory as outside', () =>
    Effect.gen(function* () {
      const path = yield* Path.Path
      expect(isWithin(path, '/', '/LICENSE')).toBe(true)
      expect(isWithin(path, '/', '/')).toBe(true)
      expect(isWithin(path, '/out', '/out/a/b')).toBe(true)
      expect(isWithin(path, '/out', '/out-other/a')).toBe(false)
      expect(isWithin(path, '/out', '/')).toBe(false)
    }).pipe(Effect.provide(NodeContext.layer)),
  )

  it.effect('refuses to write through a symlink inside the output directory', () =>
    Effect.gen(function* () {
      const { connect } = repository({
        [fileKey('Resnovas', 'example', '.github/smartcloud.yml')]: SYNC,
        [template('LICENSE')]: '(c) {{HOLDER}}\n',
        [template('tools/run')]: '#!/bin/sh\n',
      })
      const out = join(dir, 'out')
      const outside = join(dir, 'outside')
      const sync = () => Effect.flip(runWith(connect)(['node', 'smartcloud', 'sync', '--repo', 'Resnovas/example', '--out', out]))
      yield* Effect.promise(async () => {
        await mkdir(outside)
        await mkdir(join(out, 'real'), { recursive: true })
        await symlink(outside, join(out, 'tools'))
      })
      // A directory linked to somewhere outside.
      const linked = yield* sync()
      expect(linked).toBeInstanceOf(UnsafePath)
      expect(linked.message).toBe(`refusing to write tools/run: ${join(out, 'tools')} resolves outside the output directory`)
      // A dangling link to a file outside, which would be created by the write.
      yield* Effect.promise(async () => {
        await rm(join(out, 'tools'))
        await symlink(join(outside, 'LICENSE'), join(out, 'LICENSE'))
      })
      expect((yield* sync()).message).toBe(`refusing to write LICENSE: ${join(out, 'LICENSE')} is a symlink, and smartcloud does not write through symlinks`)
      // Even a link that stays inside is not written through.
      yield* Effect.promise(async () => {
        await rm(join(out, 'LICENSE'))
        await symlink(join(out, 'real'), join(out, 'tools'))
      })
      expect((yield* sync()).message).toContain(`${join(out, 'tools')} is a symlink`)
      expect(yield* Effect.promise(() => readdir(outside))).toStrictEqual([])
      expect(yield* Effect.promise(() => readdir(join(out, 'real')))).toStrictEqual([])
    }).pipe(Effect.provide(NodeContext.layer)),
  )
})

describe('version', () => {
  it('is 0.0.0 until a release bundle stamps it', () => {
    expect(VERSION).toBe('0.0.0')
    expect(stampedVersion(undefined)).toBe('0.0.0')
    expect(stampedVersion('2.0.0')).toBe('2.0.0')
  })
})

describe('check-commit', () => {
  // A fake git on PATH, so the author is read without the real repository.
  const withFakeGit = async (ident: string) => {
    const bin = join(dir, 'bin')
    await mkdir(bin)
    await writeFile(join(bin, 'git'), `#!/bin/sh\nprintf '%s\\n' '${ident}'\n`)
    await chmod(join(bin, 'git'), 0o755)
    vi.stubEnv('PATH', `${bin}:${process.env['PATH'] ?? ''}`)
  }
  afterEach(() => vi.unstubAllEnvs())

  const message = async (text: string) => {
    const file = join(dir, 'COMMIT_EDITMSG')
    await writeFile(file, text)
    return file
  }
  const jane = { authorName: 'Jane Doe', authorEmail: 'jane@example.com' }

  it.effect('passes a signed-off message, ignoring comment lines, with the author given', () =>
    Effect.gen(function* () {
      const file = yield* Effect.promise(() => message('fix: x\n\n# Please enter the commit message\nSigned-off-by: Jane Doe <jane@example.com>\n'))
      expect(yield* checkCommitCommand(file, jane)).toStrictEqual([])
      expect(logs).toContain('The commit message passes.')
    }).pipe(Effect.provide(memorySource({})), Effect.provide(NodeContext.layer)),
  )

  it.effect("reads git's author, prints each broken rule to stderr and fails", () =>
    Effect.gen(function* () {
      const errors: Array<string> = []
      vi.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => void errors.push(args.join(' ')))
      yield* Effect.promise(() => withFakeGit('Jane Doe <jane@example.com> 1790000000 +0100'))
      const file = yield* Effect.promise(() => message('fix: x\n'))
      const failed = yield* Effect.flip(checkCommitCommand(file, {}))
      expect(failed).toBeInstanceOf(CommitCheckFailed)
      expect(failed.message).toBe('the commit message breaks 1 rule(s); see above')
      expect(errors[0]).toMatch(/^DCO: No Signed-off-by matching the author <jane@example\.com>\..* See https:\/\/.*CONTRIBUTING\.md#dco$/)
    }).pipe(Effect.provide(memorySource({})), Effect.provide(NodeContext.layer)),
  )

  it.effect('uses a config file, or the repository config in the working directory', () =>
    Effect.gen(function* () {
      const file = yield* Effect.promise(() => message('fix: x\n'))
      const config = join(dir, 'off.yml')
      yield* Effect.promise(() => writeFile(config, 'version: 2\ncommits: { dco: false }\n'))
      expect(yield* checkCommitCommand(file, { ...jane, config })).toStrictEqual([])
      yield* Effect.promise(async () => {
        await mkdir(join(dir, '.github'))
        await writeFile(join(dir, '.github/smartcloud.yml'), 'version: 2\ncommits: { dco: false }\n')
      })
      const cwd = process.cwd()
      process.chdir(dir)
      const found = yield* checkCommitCommand(file, jane).pipe(Effect.ensuring(Effect.sync(() => process.chdir(cwd))))
      expect(found).toStrictEqual([])
    }).pipe(Effect.provide(memorySource({})), Effect.provide(NodeContext.layer)),
  )

  it.effect('says so when git gives no usable author', () =>
    Effect.gen(function* () {
      yield* Effect.promise(() => withFakeGit('nobody'))
      const file = yield* Effect.promise(() => message('fix: x\n'))
      const error = yield* Effect.flip(checkCommitCommand(file, {}))
      expect(error).toBeInstanceOf(UnknownAuthor)
      expect(error.message).toContain('pass --author-name and --author-email')
    }).pipe(Effect.provide(memorySource({})), Effect.provide(NodeContext.layer)),
  )

  it.effect('runs from the command line', () =>
    Effect.gen(function* () {
      const file = yield* Effect.promise(() => message('fix: x\n\nSigned-off-by: Jane Doe <jane@example.com>\n'))
      yield* run(['node', 'smartcloud', 'check-commit', file, '--author-name', 'Jane Doe', '--author-email', 'jane@example.com'])
      expect(logs).toContain('The commit message passes.')
    }).pipe(Effect.provide(memorySource({})), Effect.provide(NodeContext.layer)),
  )
})
