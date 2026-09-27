/**
 * @file tests/reporting/src/format.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import {
  annotationLines,
  checkRunsFor,
  commentBody,
  conclusionOf,
  findingsTable,
  MARKER,
  summaryMarkdown,
} from '@resnovas/reporting'
import { error, notice, run, warning } from './fixtures.js'

describe('formatting', () => {
  it('concludes failure on errors, neutral on warnings, success otherwise', () => {
    expect(conclusionOf([error, warning])).toBe('failure')
    expect(conclusionOf([warning, notice])).toBe('neutral')
    expect(conclusionOf([notice])).toBe('success')
  })

  it('renders findings as a table, escaping pipes and newlines from pull request text', () => {
    const table = findingsTable([error, warning])
    expect(table).toContain(
      '| error | [`DCO`](https://x/CONTRIBUTING.md#dco) | abcdef123456 | No Signed-off-by \\| for <a@b> |',
    )
    expect(table).toContain('| warning | `SYNC` | LICENSE:3 | edits a synced file |')
    expect(findingsTable([])).toBe('')
    const { line: _line, ...unlocated } = warning
    expect(findingsTable([{ ...unlocated, path: 'x' }])).toContain('| x |')
    expect(findingsTable([notice])).toContain('| notice | `REVIEW` |  | gate open |')
  })

  it('escapes pipes and line breaks in file names, so a path cannot add columns or rows', () => {
    const table = findingsTable([{ ...warning, path: 'docs/a|b\r\nc.md' }])
    expect(table).toContain('| warning | `SYNC` | docs/a\\|b c.md:3 | edits a synced file |')
    expect(table.split('\n')).toHaveLength(3)
  })

  it('writes one comment body with the marker, listing only actionable findings', () => {
    const body = commentBody([error, notice])
    expect(body.startsWith(MARKER)).toBe(true)
    expect(body).toContain('found 1 error(s), 0 warning(s)')
    expect(body).not.toContain('gate open')
    expect(commentBody([notice])).toBe(`${MARKER}\nAll smartcloud checks pass.`)
  })

  it('summarises features, failures, skips, findings and changes', () => {
    const summary = summaryMarkdown(run({ failed: [{ feature: 'broken', message: 'boom' }] }))
    expect(summary).toContain('Event: `pull_request` (opened) on #7')
    expect(summary).toContain('| commits | 1 error(s), 0 warning(s) |')
    expect(summary).toContain('| reviews | passed |')
    expect(summary).toContain('| broken | failed to run |')
    expect(summary).toContain('**broken** failed to run:')
    expect(summary).toContain('- stale: does not handle pullRequest events')
    expect(summary).toContain('- labels: added label bug to #7')
    const quiet = summaryMarkdown(
      run({ envelope: { kind: 'repository', event: 'schedule' }, ran: [], skipped: [], findings: [], changes: [] }),
    )
    expect(quiet).toBe('## smartcloud\n\nEvent: `schedule`\n')
  })

  it('writes workflow commands with properties and data escaped', () => {
    expect(annotationLines([error, warning, notice])).toStrictEqual([
      '::error title=DCO::No Signed-off-by | for <a@b> (commit abcdef123456) See https://x/CONTRIBUTING.md#dco',
      '::warning title=SYNC,file=LICENSE,line=3::edits%0Aa synced file',
      '::notice title=REVIEW::gate open',
    ])
    expect(annotationLines([{ ...notice, rule: 'a:b,c', message: '100%\r' }])).toStrictEqual([
      '::notice title=a%3Ab%2Cc::100%25%0D',
    ])
  })

  it('builds one check run per feature, failing features that broke, with annotations for located findings', () => {
    const runs = checkRunsFor(run({ failed: [{ feature: 'broken', message: 'boom' }] }), 'abc123')
    expect(runs.map((entry) => [entry.name, entry.conclusion, entry.title])).toStrictEqual([
      ['smartcloud / commits', 'failure', '1 error(s), 0 warning(s)'],
      ['smartcloud / sync', 'neutral', '0 error(s), 1 warning(s)'],
      ['smartcloud / reviews', 'success', 'passed'],
      ['smartcloud / broken', 'failure', 'failed to run'],
    ])
    expect(runs[1]?.annotations).toStrictEqual([
      { path: 'LICENSE', line: 3, level: 'warning', message: 'edits\na synced file', title: 'SYNC' },
    ])
    expect(runs[0]?.annotations).toStrictEqual([])
    expect(checkRunsFor(run({ ran: ['quiet'], findings: [] }), 'x')[0]?.summary).toBe('No findings.')
    expect(
      checkRunsFor(run({ ran: ['r'], findings: [{ ...notice, feature: 'r', path: 'a.ts', line: 1 }] }), 'x')[0]
        ?.annotations,
    ).toStrictEqual([{ path: 'a.ts', line: 1, level: 'notice', message: 'gate open', title: 'REVIEW' }])
  })

  it('gives findings from outside the features, such as access, their own check run', () => {
    const access = {
      feature: 'access',
      rule: 'access.config-skipped',
      level: 'warning' as const,
      message: 'left out the sync section',
    }
    const runs = checkRunsFor(run({ ran: ['reviews'], findings: [access, { ...access, message: 'again' }] }), 'x')
    expect(runs.map((entry) => [entry.name, entry.conclusion])).toStrictEqual([
      ['smartcloud / reviews', 'success'],
      ['smartcloud / access', 'neutral'],
    ])
  })

  it('makes every feature neutral at best, and lists what was left out, when a restricted run left config out', () => {
    const left = ['the extends preset o/r/p.yml: not found', 'the sync section: incomplete | without\nit']
    const runs = checkRunsFor(run({ failed: [{ feature: 'broken', message: 'boom' }], configSkipped: left }), 'abc123')
    expect(runs.map((entry) => [entry.name, entry.conclusion, entry.title])).toStrictEqual([
      ['smartcloud / commits', 'failure', '1 error(s), 0 warning(s); config left out'],
      ['smartcloud / sync', 'neutral', '0 error(s), 1 warning(s); config left out'],
      ['smartcloud / reviews', 'neutral', 'passed; config left out'],
      ['smartcloud / broken', 'failure', 'failed to run; config left out'],
    ])
    expect(runs[2]?.summary).toContain(
      '| gate open |\n\nThis restricted run left out config, so some of its rules may not have been checked:\n\n- the extends preset o/r/p.yml: not found\n- the sync section: incomplete \\| without it',
    )
    expect(checkRunsFor(run({ configSkipped: [] }), 'x').map((entry) => entry.conclusion)).toContain('success')
  })
})
