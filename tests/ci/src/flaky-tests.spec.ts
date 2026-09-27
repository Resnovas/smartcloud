/**
 * @file tests/ci/src/flaky-tests.spec.ts
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
import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { TestCase } from 'vitest/node'

vi.mock('node:fs', () => ({ appendFileSync: vi.fn() }))

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url))
// Load the reporter as a file, as Vitest does from its path in vitest.shared.ts.
const { default: FlakyTestReporter } = (await import(
  fileURLToPath(new URL('../../../tools/ci/flaky-tests.ts', import.meta.url))
)) as { default: new () => { onTestCaseResult: (testCase: TestCase) => void; onTestRunEnd: () => void } }

// The parts of a Vitest test case the reporter reads.
const testCase = (options: {
  readonly flaky?: boolean
  readonly retries?: number
  readonly line?: number
  readonly name?: string
  readonly diagnostic?: boolean
}) =>
  ({
    project: { name: 'config' },
    module: { moduleId: join(workspaceRoot, 'tests', 'config', 'src', 'load.spec.ts') },
    location: options.line === undefined ? undefined : { line: options.line, column: 3 },
    fullName: options.name ?? 'load > reads the file',
    diagnostic: () =>
      options.diagnostic === false ? undefined : { flaky: options.flaky ?? true, retryCount: options.retries ?? 1 },
  }) as unknown as TestCase

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  vi.stubEnv('GITHUB_STEP_SUMMARY', '/tmp/summary.md')
})

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('flaky test reporter', () => {
  it('ignores tests that passed first time, failed or have not run', () => {
    const reporter = new FlakyTestReporter()
    reporter.onTestCaseResult(testCase({ flaky: false }))
    reporter.onTestCaseResult(testCase({ diagnostic: false }))
    reporter.onTestRunEnd()
    expect(console.log).not.toHaveBeenCalled()
    expect(appendFileSync).not.toHaveBeenCalled()
  })

  it('annotates a test that passed on a retry and lists it in the job summary', () => {
    const reporter = new FlakyTestReporter()
    reporter.onTestCaseResult(testCase({ line: 12 }))
    reporter.onTestCaseResult(testCase({ retries: 2, name: 'a | b, 100%: c\nd' }))
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      '::warning file=tests/config/src/load.spec.ts,line=12,title=Flaky test::load > reads the file (config) failed, then passed after 1 retry.',
    )
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      '::warning file=tests/config/src/load.spec.ts,title=Flaky test::a | b, 100%25: c%0Ad (config) failed, then passed after 2 retries.',
    )
    reporter.onTestRunEnd()
    expect(appendFileSync).toHaveBeenCalledWith(
      '/tmp/summary.md',
      [
        '### Flaky tests in config',
        '',
        'These tests failed, then passed on a retry. Fix or quarantine them; the retry only keeps the run green.',
        '',
        '| Test file | Test | Retries |',
        '| --- | --- | --- |',
        '| `tests/config/src/load.spec.ts:12` | load > reads the file | 1 |',
        '| `tests/config/src/load.spec.ts` | a \\| b, 100%: c d | 2 |',
        '',
        '',
      ].join('\n'),
    )
  })

  it('escapes the file path in the annotation', () => {
    const reporter = new FlakyTestReporter()
    reporter.onTestCaseResult({
      ...testCase({}),
      module: { moduleId: join(workspaceRoot, 'tests', 'a,b:c', 'x.spec.ts') },
    } as unknown as TestCase)
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('file=tests/a%2Cb%3Ac/x.spec.ts,title='))
  })

  it('writes no summary outside GitHub Actions', () => {
    vi.stubEnv('GITHUB_STEP_SUMMARY', '')
    const reporter = new FlakyTestReporter()
    reporter.onTestCaseResult(testCase({}))
    reporter.onTestRunEnd()
    expect(console.log).toHaveBeenCalledOnce()
    expect(appendFileSync).not.toHaveBeenCalled()
  })
})
