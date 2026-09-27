/**
 * @file tools/ci/bundle-size.ts
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

// Checks the built action against the reviewed baseline and byte budgets.
// Run through pnpm bundle:check to build dist/index.js first.

import { Schema } from 'effect'
import { appendFileSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const bytes = Schema.Number.pipe(Schema.int(), Schema.positive())
const measurement = Schema.Struct({ baseline: bytes, limit: bytes })
const budgetSchema = Schema.Struct({ raw: measurement, gzip: measurement })
const config: unknown = JSON.parse(readFileSync(new URL('../../bundle-size.json', import.meta.url), 'utf8'))
if (!Schema.is(budgetSchema)(config)) {
  throw new Error('bundle-size.json must contain positive integer baseline and limit bytes for raw and gzip.')
}

const bundle = readFileSync(new URL('../../dist/index.js', import.meta.url))
if (bundle.length === 0) throw new Error('dist/index.js is empty; build the action before checking its size.')
const sizes = { raw: bundle.length, gzip: gzipSync(bundle, { level: 9 }).length }
const signed = (value: number): string => `${value >= 0 ? '+' : ''}${value}`
const lines = [
  '### Action bundle size: dist/index.js',
  '',
  '| Measure | Baseline (bytes) | Current (bytes) | Change (bytes) | Limit (bytes) | Budget remaining (bytes) |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
]
for (const metric of ['raw', 'gzip'] as const) {
  const { baseline, limit } = config[metric]
  const current = sizes[metric]
  lines.push(
    `| ${metric} | ${baseline} | ${current} | ${signed(current - baseline)} | ${limit} | ${signed(limit - current)} |`,
  )
  if (current > limit) {
    console.error(
      `Bundle size exceeded (${metric}): ${current} bytes > ${limit} bytes by ${current - limit} bytes (baseline change ${signed(current - baseline)} bytes).`,
    )
    process.exitCode = 1
  }
}
const report = `${lines.join('\n')}\n`
console.log(report)
const summary = process.env['GITHUB_STEP_SUMMARY']
if (summary) appendFileSync(summary, report)
