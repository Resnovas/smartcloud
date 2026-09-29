/**
 * @file tools/ci/smoke/check.ts
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

// Checks the job summary the action wrote for a recorded event in the CI smoke
// job against tools/ci/smoke/expected.json, then appends it to this step's
// summary. Usage: node tools/ci/smoke/check.ts <event> <summary file>

import { Schema } from 'effect'
import { appendFileSync, readFileSync } from 'node:fs'

const expectation = Schema.Struct({
  event: Schema.String,
  results: Schema.Record({ key: Schema.String, value: Schema.String }),
  changes: Schema.Array(Schema.String),
})
const expectations = Schema.Record({ key: Schema.String, value: expectation })
const config: unknown = JSON.parse(readFileSync(new URL('expected.json', import.meta.url), 'utf8'))
if (!Schema.is(expectations)(config)) {
  throw new Error('expected.json must map each event to its event line, feature results and changes.')
}

const [event = '', path = ''] = process.argv.slice(2)
const expected = config[event]
if (expected === undefined || path === '') {
  throw new Error(
    `Usage: check.ts <event> <summary file>, where the event is one of ${Object.keys(config).join(', ')}.`,
  )
}

// An action that failed before reporting writes no summary at all.
const read = (file: string): string => {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}
const summary = read(path)
const lines = summary.split('\n').map((line) => line.trimEnd())
const problems: Array<string> = []
if (summary.trim() === '') problems.push('the action wrote no job summary.')
else {
  if (!lines.includes('## smartcloud')) problems.push('the summary has no "## smartcloud" heading.')
  if (!lines.includes(expected.event)) problems.push(`the summary does not say "${expected.event}".`)
  const results = new Map<string, string>()
  // The feature table's rows, without its header and separator. Only that
  // table: the findings table after it has the same shape.
  const start = lines.indexOf('| Feature | Result |')
  const end = lines.indexOf('', start + 1)
  const table = start === -1 ? [] : lines.slice(start + 1, end === -1 ? undefined : end)
  for (const line of table) {
    const row = /^\| (?!---)(\S+) \| (.+) \|$/.exec(line)
    if (row) results.set(String(row[1]), String(row[2]))
  }
  for (const [feature, result] of Object.entries(expected.results)) {
    const actual = results.get(feature)
    if (actual !== result) problems.push(`${feature} should have ${result}, but ${actual ?? 'did not run'}.`)
  }
  for (const feature of results.keys())
    if (!(feature in expected.results)) problems.push(`${feature} ran, but was not expected to.`)
  for (const change of expected.changes)
    if (!lines.includes(`- ${change}`)) problems.push(`the summary does not list the change "${change}".`)
  if (!lines.some((line) => line.startsWith('**Dry run:**'))) problems.push('the summary has no dry-run section.')
}

for (const problem of problems) console.error(`::error title=smoke test (${event})::${problem}`)
if (problems.length > 0) process.exitCode = 1
const verdict = problems.length === 0 ? 'passed' : `failed: ${problems.join(' ')}`
const report = `### Smoke test: \`${event}\` ${verdict}\n\n${summary}\n`
console.log(report)
const stepSummary = process.env['GITHUB_STEP_SUMMARY']
if (stepSummary) appendFileSync(stepSummary, report)
