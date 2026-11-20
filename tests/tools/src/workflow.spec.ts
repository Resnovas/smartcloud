/**
 * @file tests/tools/src/workflow.spec.ts
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
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

const root = fileURLToPath(new URL('../../..', import.meta.url))
const native = readFileSync(join(root, '.github/workflows/smartcloud.yml'), 'utf8').replaceAll('\r\n', '\n')
const require = createRequire(import.meta.url)

it('validates the real native workflow and rejects changes across its trust boundaries', () => {
  const caller = readFileSync(join(root, '.github/workflows/house-workflow-lint.yml'), 'utf8').replaceAll('\r\n', '\n')
  const script = caller
    .split('        run: |\n')[1]
    ?.split('\n# house:managed:end')[0]
    ?.split('\n')
    .map((line) => line.slice(10))
    .join('\n')
  expect(script).toBeTruthy()
  const check = (workflow: string, repository = 'Resnovas/smartcloud') => {
    const output: string[] = []
    runInNewContext(script ?? '', {
      process: { cwd: () => root, env: { GITHUB_REPOSITORY: repository } },
      require: (name: string) => (name === 'node:fs' ? { readFileSync: () => workflow } : require(name)),
      console: { log: (message: string) => output.push(message) },
    })
    return output
  }
  expect(check(native)).toEqual(['Trusted smartcloud native-self-build recipe accepted.'])
  expect(check(native.replaceAll('\n', '\r\n'))).toEqual(check(native))
  for (const repository of ['Resnovas/.github', 'Resnovas/Eventiva', 'fork/smartcloud', '']) {
    expect(() => check(native, repository)).toThrow('Required queue checks must execute')
  }
  for (const [before, after] of [
    ['  merge_group:', '  merge_group:\n    branches: [main]'],
    [
      "github.event_name != 'issue_comment' ||",
      "github.event_name != 'merge_group' && github.event_name != 'issue_comment' ||",
    ],
    ['    runs-on: ubuntu-latest', '    runs-on: ubuntu-latest\n    continue-on-error: true'],
    ['    timeout-minutes: 75', '    timeout-minutes: 5'],
    ['          ref: refs/heads/main', '          ref: ${{ github.sha }}'],
    [
      '          repository: Resnovas/smartcloud',
      '          repository: ${{ github.event.pull_request.head.repo.full_name }}',
    ],
    ['          persist-credentials: false', '          persist-credentials: true'],
    ['          configRef: refs/heads/main', '          configRef: ${{ github.sha }}'],
    ['          configRef: refs/heads/main', '          configJson: ${{ github.event.pull_request.body }}'],
    ['--frozen-lockfile --ignore-scripts', '--frozen-lockfile'],
    ['          run_install: false', '          run_install: true'],
    [' --skip-nx-cache', ''],
    ['        uses: ./', "        uses: ./\n        if: github.event_name != 'merge_group'"],
    ['          checkRunId: ${{ job.check_run_id }}', '          checkRunId: ""'],
    ['          CHECK_RUN_ID: ${{ job.check_run_id }}', '          CHECK_RUN_ID: 123'],
    ['group.head_sha !== process.env.GITHUB_SHA', 'false'],
    ['          permission-contents: read', '          permission-contents: write'],
    ['          repositories: smartcloud', '          repositories: smartcloud, .github'],
    ['["push", "schedule", "workflow_dispatch"]', '["push", "schedule", "workflow_dispatch", "merge_group"]'],
    ['      contents: read', '      contents: write'],
    [
      '          GITHUB_TOKEN: ${{ steps.app.outputs.token || github.token }}',
      '          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}',
    ],
    [
      '      - name: Bundle the trusted action',
      '      - run: echo ${{ secrets.RESNOVAS_BOT_PRIVATE_KEY }}\n\n      - name: Bundle the trusted action',
    ],
  ] as const) {
    expect(native).toContain(before)
    expect(() => check(native.replace(before, after))).toThrow('Required queue checks must execute')
  }
  const build =
    '      - name: Bundle the trusted action\n        run: pnpm exec nx run @resnovas/action:bundle --skip-nx-cache\n'
  expect(native).toContain(build)
  expect(() =>
    check(native.replace(build, '').replace('      - name: Run smartcloud', `${build}\n      - name: Run smartcloud`)),
  ).toThrow('Required queue checks must execute')
  const published =
    'on:\n  merge_group:\njobs:\n  smartcloud:\n    name: smartcloud\n    runs-on: ubuntu-latest\n    steps:\n      - uses: resnovas/smartcloud@v2\n'
  expect(check(published, 'Resnovas/.github')).toEqual([
    'Required smartcloud job and action are unconditional on merge_group.',
  ])
  expect(() => check(published)).toThrow('Required queue checks must execute')
})

it('executes the installed metadata guard and authorized-comment/token event matrices', () => {
  const script = native
    .split('        run: |\n')[1]
    ?.split('\n\n')[0]
    ?.split('\n')
    .map((line) => line.slice(10))
    .join('\n')
  expect(script).toBeTruthy()
  const head = 'a'.repeat(40)
  const base = 'b'.repeat(40)
  const ref = 'refs/heads/gh-readonly-queue/main/pr-42-synthetic'
  const event = {
    action: 'checks_requested',
    repository: { default_branch: 'main' },
    merge_group: { head_ref: ref, base_ref: 'refs/heads/main', base_sha: base, head_sha: head },
  }
  const env = {
    GITHUB_REPOSITORY: 'Resnovas/smartcloud',
    GITHUB_EVENT_NAME: 'merge_group',
    GITHUB_REF: ref,
    GITHUB_SHA: head,
    CHECK_RUN_ID: '42',
    GITHUB_EVENT_PATH: '/synthetic/event.json',
  }
  const guard = (payload: unknown, variables = env) =>
    runInNewContext(script ?? '', {
      process: { env: variables },
      require: (name: string) => {
        expect(name).toBe('node:fs')
        return { readFileSync: () => JSON.stringify(payload) }
      },
    })
  expect(() => guard(event)).not.toThrow()
  for (const payload of [
    {},
    { ...event, merge_group: undefined },
    { ...event, repository: {} },
    { ...event, action: undefined },
    ...[
      { head_ref: '' },
      { head_ref: 'refs/pull/42/merge' },
      { base_ref: 'refs/heads/feature' },
      { base_sha: '' },
      { head_sha: '' },
      { head_sha: base },
    ].map((change) => ({ ...event, merge_group: { ...event.merge_group, ...change } })),
  ])
    expect(() => guard(payload)).toThrow('Require smartcloud repository')
  for (const change of [
    { CHECK_RUN_ID: '' },
    { CHECK_RUN_ID: '0' },
    { CHECK_RUN_ID: 'abc' },
    { GITHUB_REPOSITORY: 'fork/smartcloud' },
    { GITHUB_SHA: '' },
    { GITHUB_REF: '' },
  ]) {
    expect(() => guard(event, { ...env, ...change })).toThrow('Require smartcloud repository')
  }
  expect(() => guard({}, { ...env, GITHUB_EVENT_NAME: 'schedule' })).not.toThrow()
  expect(() => guard({}, { ...env, GITHUB_EVENT_NAME: 'push', CHECK_RUN_ID: '' })).toThrow('checkRunId')

  // Evaluate only the checked-in recipe's expression subset, with GitHub's empty missing properties.
  const conditions = [...native.matchAll(/^\s+if: >-\n((?: +[^\n]+\n)+?)(?= {4}\w| {8}continue-on-error)/gm)].map(
    (match) => match[1]?.trim() ?? '',
  )
  expect(conditions).toHaveLength(3)
  const evaluate = (expression: string, context: unknown): boolean => {
    const expanded = expression.replace(/\b(?:github|env)(?:\.[A-Za-z_][\w]*)+/g, (path) =>
      JSON.stringify(
        path
          .split('.')
          .reduce<unknown>(
            (value, key) =>
              value !== null && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined,
            context,
          ) ?? '',
      ),
    )
    return (
      runInNewContext(expanded, {
        fromJSON: JSON.parse,
        contains: (value: string | string[], item: string) => value.includes(item),
      }) === true
    )
  }
  const [job = '', house = '', app = ''] = conditions
  const context = (name: string, extra: Record<string, unknown> = {}) => ({
    env: { HAS_APP_KEY: 'true' },
    github: {
      event_name: name,
      repository: 'Resnovas/smartcloud',
      actor: 'maintainer',
      ref_name: 'main',
      event: { repository: { default_branch: 'main' } },
      ...extra,
    },
  })
  for (const name of ['merge_group', 'push', 'schedule', 'workflow_dispatch', 'pull_request']) {
    expect(evaluate(job, context(name))).toBe(true)
    expect(evaluate(house, context(name))).toBe(true)
    expect(evaluate(app, context(name))).toBe(['push', 'schedule', 'workflow_dispatch'].includes(name))
  }
  for (const role of ['OWNER', 'MEMBER', 'COLLABORATOR', 'CONTRIBUTOR', 'NONE']) {
    const comment = context('issue_comment', { event: { comment: { body: '/check', author_association: role } } })
    expect(evaluate(job, comment)).toBe(['OWNER', 'MEMBER', 'COLLABORATOR'].includes(role))
    expect(evaluate(app, comment)).toBe(false)
  }
  expect(
    evaluate(job, context('issue_comment', { event: { comment: { body: 'hello', author_association: 'OWNER' } } })),
  ).toBe(false)
  expect(evaluate(app, context('workflow_dispatch', { ref_name: 'feature' }))).toBe(false)
  for (const repository of ['Resnovas/smartcloud', 'fork/smartcloud', '']) {
    for (const merged of [true, false]) {
      const closed = context('pull_request', {
        event: {
          action: 'closed',
          pull_request: { merged, head: { repo: { full_name: repository } }, user: { login: 'maintainer' } },
        },
      })
      expect(evaluate(house, closed)).toBe(repository === 'Resnovas/smartcloud')
      expect(evaluate(app, closed)).toBe(merged && repository === 'Resnovas/smartcloud')
    }
  }
  for (const token of [house, app]) {
    expect(evaluate(token, context('push', { actor: 'dependabot[bot]' }))).toBe(false)
    const missingKey = context('push')
    missingKey.env.HAS_APP_KEY = 'false'
    expect(evaluate(token, missingKey)).toBe(false)
  }
})
