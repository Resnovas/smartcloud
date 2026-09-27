/**
 * @file tests/ci/src/bundle-size.spec.ts
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
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

vi.mock('node:fs', () => ({ readFileSync: vi.fn(), appendFileSync: vi.fn() }))

const bundle = Buffer.from('export const action = "smartcloud";\n'.repeat(100))
const sizes = { raw: bundle.length, gzip: gzipSync(bundle, { level: 9 }).length }
const budget = {
  raw: { baseline: sizes.raw - 1, limit: sizes.raw },
  gzip: { baseline: sizes.gzip + 1, limit: sizes.gzip },
}
// Load the standalone CLI entry as a file; it has no library exports.
const run = () => import(fileURLToPath(new URL('../../../tools/ci/bundle-size.ts', import.meta.url)))
const originalExitCode = process.exitCode

beforeEach(() => {
  vi.resetModules()
  vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify(budget)).mockReturnValueOnce(bundle)
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  vi.stubEnv('GITHUB_STEP_SUMMARY', '')
  process.exitCode = undefined
})

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  process.exitCode = originalExitCode
})

describe('action bundle byte budgets', () => {
  it('accepts exact limits and reports growth and shrinkage from the baseline', async () => {
    await run()
    expect(process.exitCode).toBeUndefined()
    expect(console.error).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`| raw | ${sizes.raw - 1} | ${sizes.raw} | +1 | ${sizes.raw} | +0 |`),
    )
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`| gzip | ${sizes.gzip + 1} | ${sizes.gzip} | -1 | ${sizes.gzip} | +0 |`),
    )
    expect(appendFileSync).not.toHaveBeenCalled()
    expect(readFileSync).toHaveBeenNthCalledWith(1, new URL('../../../bundle-size.json', import.meta.url), 'utf8')
    expect(readFileSync).toHaveBeenNthCalledWith(2, new URL('../../../dist/index.js', import.meta.url))
  })

  it('accepts smaller bundles and appends the report to the CI summary', async () => {
    vi.stubEnv('GITHUB_STEP_SUMMARY', '/tmp/summary.md')
    vi.mocked(readFileSync)
      .mockReset()
      .mockReturnValueOnce(
        JSON.stringify({
          raw: { baseline: sizes.raw, limit: sizes.raw + 100 },
          gzip: { baseline: sizes.gzip, limit: sizes.gzip + 100 },
        }),
      )
      .mockReturnValueOnce(bundle)
    await run()
    expect(process.exitCode).toBeUndefined()
    expect(appendFileSync).toHaveBeenCalledWith(
      '/tmp/summary.md',
      expect.stringContaining(`| raw | ${sizes.raw} | ${sizes.raw} | +0 | ${sizes.raw + 100} | +100 |`),
    )
  })

  it.each(['raw', 'gzip'] as const)(
    'fails for one byte over the %s limit and still writes the summary',
    async (metric) => {
      vi.stubEnv('GITHUB_STEP_SUMMARY', '/tmp/summary.md')
      vi.mocked(readFileSync)
        .mockReset()
        .mockReturnValueOnce(
          JSON.stringify({
            ...budget,
            [metric]: { baseline: sizes[metric] - 2, limit: sizes[metric] - 1 },
          }),
        )
        .mockReturnValueOnce(bundle)
      await run()
      expect(process.exitCode).toBe(1)
      expect(console.error).toHaveBeenCalledExactlyOnceWith(
        `Bundle size exceeded (${metric}): ${sizes[metric]} bytes > ${sizes[metric] - 1} bytes by 1 bytes (baseline change +2 bytes).`,
      )
      expect(appendFileSync).toHaveBeenCalledWith(
        '/tmp/summary.md',
        expect.stringContaining(
          `| ${metric} | ${sizes[metric] - 2} | ${sizes[metric]} | +2 | ${sizes[metric] - 1} | -1 |`,
        ),
      )
    },
  )

  it.each([
    null,
    {},
    { ...budget, raw: { baseline: 0, limit: 10 } },
    { ...budget, gzip: { baseline: 10, limit: -1 } },
    { ...budget, raw: { baseline: 1, limit: 1.5 } },
    { ...budget, gzip: { baseline: 1, limit: '100' } },
  ])('rejects invalid budgets: %j', async (invalid) => {
    vi.mocked(readFileSync).mockReset().mockReturnValue(JSON.stringify(invalid))
    await expect(run()).rejects.toThrow('positive integer baseline and limit bytes')
  })

  it('rejects malformed JSON', async () => {
    vi.mocked(readFileSync).mockReset().mockReturnValue('{')
    await expect(run()).rejects.toThrow(SyntaxError)
  })

  it('fails when the budget is missing', async () => {
    vi.mocked(readFileSync)
      .mockReset()
      .mockImplementation(() => {
        throw new Error('ENOENT: bundle-size.json')
      })
    await expect(run()).rejects.toThrow('ENOENT: bundle-size.json')
  })

  it('fails when the bundle is missing', async () => {
    vi.mocked(readFileSync)
      .mockReset()
      .mockReturnValueOnce(JSON.stringify(budget))
      .mockImplementation(() => {
        throw new Error('ENOENT: dist/index.js')
      })
    await expect(run()).rejects.toThrow('ENOENT: dist/index.js')
  })

  it('rejects an empty bundle', async () => {
    vi.mocked(readFileSync).mockReset().mockReturnValueOnce(JSON.stringify(budget)).mockReturnValueOnce(Buffer.alloc(0))
    await expect(run()).rejects.toThrow('dist/index.js is empty')
  })
})
