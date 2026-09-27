/**
 * @file tests/ci/src/smoke/check.spec.ts
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

import { afterEach, beforeEach, describe, expect, it } from '@effect/vitest'
import { vi } from 'vitest'
import { appendFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { readFileSync: vi.fn(actual.readFileSync), appendFileSync: vi.fn() }
})

// Load the standalone CLI entry as a file; it has no library exports.
const run = () => import(fileURLToPath(new URL('../../../../tools/ci/smoke/check.ts', import.meta.url)))
const originalArgv = process.argv
const originalExitCode = process.exitCode

// What the action writes for the recorded pull request, as in a real run.
const pullRequestSummary = [
  '## smartcloud',
  '',
  'Event: `pull_request` (opened) on #634',
  '',
  '| Feature | Result |',
  '| --- | --- |',
  '| conventions | passed |',
  '| commits | passed |',
  '| labels | passed |',
  '',
  'Skipped:',
  '- disclosure: not configured',
  '',
  'Changes:',
  '- labels: added label "Smoke: CI" to #634',
  '',
  '**Dry run:** these writes were recorded, not made:',
  '- addLabels',
  '- createCheckRun',
  '',
].join('\n')

// Reads expected.json from disk and serves the summary for any other path.
let realRead: (path: URL, options: unknown) => string
const serve = (summary: () => string) =>
  vi
    .mocked(readFileSync)
    .mockImplementation(((path: unknown, options: unknown) =>
      path instanceof URL ? realRead(path, options) : summary()) as typeof readFileSync)

const check = (event: string, summary: string) => {
  serve(() => summary)
  process.argv = ['node', 'check.ts', event, '/tmp/smoke.md']
  return run()
}

const errors = () => vi.mocked(console.error).mock.calls.map(([line]) => String(line))

beforeEach(async () => {
  vi.resetModules()
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  realRead = (path, options) => String(actual.readFileSync(path, options as BufferEncoding))
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  vi.stubEnv('GITHUB_STEP_SUMMARY', '/tmp/step-summary.md')
  process.exitCode = undefined
})

afterEach(() => {
  vi.mocked(readFileSync).mockReset()
  vi.mocked(appendFileSync).mockReset()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  process.argv = originalArgv
  process.exitCode = originalExitCode
})

describe('checking a smoke test summary', () => {
  it('passes a summary that matches the recorded event and appends it to the step summary', async () => {
    await check('pull_request', pullRequestSummary)
    expect(errors()).toEqual([])
    expect(process.exitCode).toBeUndefined()
    expect(readFileSync).toHaveBeenCalledWith('/tmp/smoke.md', 'utf8')
    expect(appendFileSync).toHaveBeenCalledWith(
      '/tmp/step-summary.md',
      `### Smoke test: \`pull_request\` passed\n\n${pullRequestSummary}\n`,
    )
  })

  it('reads only the feature table, not the findings table after it', async () => {
    const withFindings = pullRequestSummary.replace(
      'Skipped:',
      [
        '| Level | Rule | Where | Finding |',
        '| --- | --- | --- | --- |',
        '| notice | `access.restricted` |  | ran with restricted access |',
        '',
        'Skipped:',
      ].join('\n'),
    )
    await check('pull_request', withFindings)
    expect(errors()).toEqual([])
    expect(process.exitCode).toBeUndefined()
  })

  it('reads a feature table that ends the summary', async () => {
    await check('pull_request', pullRequestSummary.slice(0, pullRequestSummary.indexOf('\n\nSkipped:')))
    expect(errors().filter((line) => line.includes('did not run') || line.includes('was not expected'))).toEqual([])
  })

  it('fails when the summary has no feature table', async () => {
    await check('pull_request', pullRequestSummary.replace('| Feature | Result |', '| Feature | Outcome |'))
    expect(errors()).toContain(
      '::error title=smoke test (pull_request)::conventions should have passed, but did not run.',
    )
  })

  it('only prints the report outside Actions', async () => {
    vi.stubEnv('GITHUB_STEP_SUMMARY', '')
    await check('pull_request', pullRequestSummary)
    expect(appendFileSync).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('### Smoke test: `pull_request` passed'))
  })

  it('fails when the action wrote no summary', async () => {
    serve(() => {
      throw new Error('ENOENT: /tmp/smoke.md')
    })
    process.argv = ['node', 'check.ts', 'issues', '/tmp/smoke.md']
    await run()
    expect(errors()).toEqual(['::error title=smoke test (issues)::the action wrote no job summary.'])
    expect(process.exitCode).toBe(1)
    expect(appendFileSync).toHaveBeenCalledWith(
      '/tmp/step-summary.md',
      expect.stringContaining('### Smoke test: `issues` failed: the action wrote no job summary.'),
    )
  })

  it('reports every way a summary can differ from the recording', async () => {
    const summary = pullRequestSummary
      .replace('## smartcloud', '## other')
      .replace('on #634', 'on #1')
      .replace('| commits | passed |', '| commits | failed |')
      .replace('| labels | passed |', '| stale | passed |')
      .replace('- labels: added label', '- labels: removed label')
      .replace('**Dry run:**', 'Dry run:')
    await check('pull_request', summary)
    expect(errors()).toEqual(
      [
        'the summary has no "## smartcloud" heading.',
        'the summary does not say "Event: `pull_request` (opened) on #634".',
        'commits should have passed, but failed.',
        'labels should have passed, but did not run.',
        'stale ran, but was not expected to.',
        'the summary does not list the change "labels: added label "Smoke: CI" to #634".',
        'the summary has no dry-run section.',
      ].map((problem) => `::error title=smoke test (pull_request)::${problem}`),
    )
    expect(process.exitCode).toBe(1)
  })

  it.each([
    ['an unknown event', ['node', 'check.ts', 'star', '/tmp/smoke.md']],
    ['no summary file', ['node', 'check.ts', 'issues']],
    ['no arguments', ['node', 'check.ts']],
  ])('rejects %s', async (_, argv) => {
    process.argv = argv
    await expect(run()).rejects.toThrow('Usage: check.ts <event> <summary file>, where the event is one of')
  })

  it.each([null, { push: { event: 'Event: `push`' } }, { push: { event: 1, results: {}, changes: [] } }])(
    'rejects invalid expectations: %j',
    async (invalid) => {
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(invalid))
      await expect(run()).rejects.toThrow('expected.json must map each event')
    },
  )
})
