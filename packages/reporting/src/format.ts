/**
 * @file packages/reporting/src/format.ts
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

import type { Finding, RunResult } from '@resnovas/engine'
import type { Annotation, CheckRun } from '@resnovas/integrations.github'

/**
 * Marks smartcloud's comment on an issue or pull request, so each run updates it in place.
 *
 * @example
 * ```ts import.meta.vitest name="MARKER"
 * import { commentBody, MARKER } from '@resnovas/reporting'
 *
 * commentBody([]).startsWith(MARKER) // => true
 * ```
 */
export const MARKER = '<!-- smartcloud:report -->'

/**
 * How v1 began each of its comments: `<!--${NPM_PACKAGE_NAME}: ${job}-->`.
 * Actions never set `NPM_PACKAGE_NAME`, so released v1 wrote `undefined`
 * there; `smartcloud` covers a run that did set it.
 *
 * @internal
 */
export const LEGACY_MARKERS: ReadonlyArray<string> = ['<!--smartcloud: ', '<!--undefined: ']

/**
 * Whether a comment body is a v1 smartcloud comment, which the next report
 * takes over rather than posting alongside.
 *
 * @internal
 * @param body - The comment body.
 * @returns True for a v1 comment.
 */
export const isLegacyReport = (body: string): boolean => LEGACY_MARKERS.some((marker) => body.startsWith(marker))

/** A check run's conclusion. */
export type Conclusion = 'success' | 'failure' | 'neutral'

/**
 * The conclusion for a set of findings: failure on any error, neutral when
 * there are only warnings, success otherwise. Notices never change it.
 *
 * @example
 * ```ts import.meta.vitest name="conclusionOf"
 * import { conclusionOf } from '@resnovas/reporting'
 *
 * conclusionOf([{ feature: 'sync', rule: 'SYNC', level: 'warning', message: 'edits a synced file' }]) // => 'neutral'
 * conclusionOf([]) // => 'success'
 * ```
 *
 * @param findings - The findings to judge.
 * @returns The conclusion.
 */
export const conclusionOf = (findings: ReadonlyArray<Finding>): Conclusion =>
  findings.some((finding) => finding.level === 'error')
    ? 'failure'
    : findings.some((finding) => finding.level === 'warning')
      ? 'neutral'
      : 'success'

// Table cells and workflow commands carry text from pull requests, so escaping
// is plain replacement, never a backtracking pattern.
const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll('\r', '').replaceAll('\n', ' ')

const rule = (finding: Finding) =>
  finding.link === undefined ? `\`${finding.rule}\`` : `[\`${finding.rule}\`](${finding.link})`

const where = (finding: Finding) =>
  finding.path !== undefined
    ? `${finding.path}${finding.line === undefined ? '' : `:${finding.line}`}`
    : finding.commit === undefined
      ? ''
      : finding.commit.slice(0, 12)

/**
 * Renders findings as a Markdown table.
 *
 * @example
 * ```ts import.meta.vitest name="findingsTable"
 * import { findingsTable } from '@resnovas/reporting'
 *
 * findingsTable([{ feature: 'commits', rule: 'DCO', level: 'error', message: 'No sign-off' }]).split('\n').length // => 3
 * findingsTable([]) // => ''
 * ```
 *
 * @param findings - The findings, in order.
 * @returns The table, or an empty string when there are none.
 */
export const findingsTable = (findings: ReadonlyArray<Finding>): string =>
  findings.length === 0
    ? ''
    : [
        '| Level | Rule | Where | Finding |',
        '| --- | --- | --- | --- |',
        // A file name may hold a pipe or a line break, so it is escaped like the message.
        ...findings.map(
          (finding) => `| ${finding.level} | ${rule(finding)} | ${cell(where(finding))} | ${cell(finding.message)} |`,
        ),
      ].join('\n')

const count = (findings: ReadonlyArray<Finding>, level: Finding['level']) =>
  findings.filter((finding) => finding.level === level).length

const tally = (findings: ReadonlyArray<Finding>) => {
  const errors = count(findings, 'error')
  const warnings = count(findings, 'warning')
  return errors === 0 && warnings === 0 ? 'passed' : `${errors} error(s), ${warnings} warning(s)`
}

/**
 * The body of smartcloud's single comment on an issue or pull request.
 *
 * @remarks
 * Only errors and warnings are listed; notices belong in the job summary.
 * The hidden {@link MARKER} lets the next run find and update the comment
 * instead of adding another.
 *
 * @example
 * ```ts import.meta.vitest name="commentBody"
 * import { commentBody } from '@resnovas/reporting'
 *
 * commentBody([{ feature: 'reviews', rule: 'REVIEW', level: 'notice', message: 'gate open' }]).endsWith('All smartcloud checks pass.') // => true
 * ```
 *
 * @param findings - Everything the run found.
 * @returns The comment body.
 */
export const commentBody = (findings: ReadonlyArray<Finding>): string => {
  const actionable = findings.filter((finding) => finding.level !== 'notice')
  if (actionable.length === 0) return `${MARKER}\nAll smartcloud checks pass.`
  return [
    MARKER,
    `**smartcloud** found ${tally(actionable)}.`,
    '',
    findingsTable(actionable),
    '',
    'This comment updates itself when you push a fix.',
  ].join('\n')
}

const eventLine = (result: RunResult) => {
  const { envelope } = result
  const action = 'action' in envelope && envelope.action !== undefined ? ` (${envelope.action})` : ''
  const subject =
    envelope.kind === 'pullRequest' || envelope.kind === 'issue' || envelope.kind === 'comment'
      ? ` on #${envelope.subject.number}`
      : ''
  return `\`${envelope.event}\`${action}${subject}`
}

/**
 * The job summary for a run: every feature's outcome, what was skipped and
 * why, every finding, and every change.
 *
 * @example
 * ```ts import.meta.vitest name="summaryMarkdown"
 * import type { RunResult } from '@resnovas/engine'
 * import { summaryMarkdown } from '@resnovas/reporting'
 *
 * const result: RunResult = { envelope: { kind: 'repository', event: 'schedule' }, ran: [], skipped: [], failed: [], durations: {}, findings: [], changes: [], facts: [] }
 * summaryMarkdown(result) // => '## smartcloud\n\nEvent: `schedule`\n'
 * ```
 *
 * @param result - The run.
 * @returns Markdown for `GITHUB_STEP_SUMMARY`.
 */
export const summaryMarkdown = (result: RunResult): string => {
  const lines = ['## smartcloud', '', `Event: ${eventLine(result)}`, '']
  const features = [
    ...result.ran.map(
      (feature) => `| ${feature} | ${tally(result.findings.filter((finding) => finding.feature === feature))} |`,
    ),
    ...result.failed.map((failure) => `| ${failure.feature} | failed to run |`),
  ]
  if (features.length > 0) lines.push('| Feature | Result |', '| --- | --- |', ...features, '')
  for (const failure of result.failed)
    lines.push(`**${failure.feature}** failed to run:`, '', '```', failure.message, '```', '')
  if (result.skipped.length > 0) {
    lines.push('Skipped:', ...result.skipped.map((skip) => `- ${skip.feature}: ${skip.reason}`), '')
  }
  if (result.findings.length > 0) lines.push(findingsTable(result.findings), '')
  if (result.changes.length > 0)
    lines.push('Changes:', ...result.changes.map((change) => `- ${change.feature}: ${change.description}`), '')
  return lines.join('\n')
}

// Workflow commands need %, carriage returns and newlines escaped in the
// message, and additionally : and , in properties.
const escapeData = (text: string) => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')
const escapeProperty = (text: string) => escapeData(text).replaceAll(':', '%3A').replaceAll(',', '%2C')

/**
 * The findings as GitHub workflow commands, which Actions shows as
 * annotations on the run and, with a file, on the diff.
 *
 * @example
 * ```ts import.meta.vitest name="annotationLines"
 * import { annotationLines } from '@resnovas/reporting'
 *
 * annotationLines([{ feature: 'sync', rule: 'SYNC', level: 'warning', message: 'edited', path: 'LICENSE', line: 3 }])[0] // => '::warning title=SYNC,file=LICENSE,line=3::edited'
 * ```
 *
 * @param findings - The findings.
 * @returns One `::level ...::message` line per finding.
 */
export const annotationLines = (findings: ReadonlyArray<Finding>): ReadonlyArray<string> =>
  findings.map((finding) => {
    const properties = [`title=${escapeProperty(finding.rule)}`]
    if (finding.path !== undefined) properties.push(`file=${escapeProperty(finding.path)}`)
    if (finding.line !== undefined) properties.push(`line=${finding.line}`)
    const commit = finding.commit === undefined ? '' : ` (commit ${finding.commit.slice(0, 12)})`
    const link = finding.link === undefined ? '' : ` See ${finding.link}`
    return `::${finding.level} ${properties.join(',')}::${escapeData(`${finding.message}${commit}${link}`)}`
  })

const LEVEL: Record<Finding['level'], Annotation['level']> = { error: 'failure', warning: 'warning', notice: 'notice' }

type CompletedCheckRun = Extract<CheckRun, { readonly status: 'completed' }>

// A feature's own check: its findings as the conclusion and summary, and the
// located ones as annotations on the diff.
const findingsCheckRun = (feature: string, findings: ReadonlyArray<Finding>, headSha: string): CompletedCheckRun => ({
  name: `smartcloud / ${feature}`,
  headSha,
  status: 'completed',
  conclusion: conclusionOf(findings),
  title: tally(findings),
  summary: findings.length === 0 ? 'No findings.' : findingsTable(findings),
  annotations: findings.flatMap((finding) =>
    finding.path === undefined || finding.line === undefined
      ? []
      : [
          {
            path: finding.path,
            line: finding.line,
            level: LEVEL[finding.level],
            message: finding.message,
            title: finding.rule,
          },
        ],
  ),
})

// A skipped preset may have configured any feature, so a feature that ran
// without it cannot pass outright: success becomes neutral, and the summary
// names what was left out.
const withConfigSkipped = (run: CompletedCheckRun, skipped: ReadonlyArray<string>): CompletedCheckRun => ({
  ...run,
  conclusion: run.conclusion === 'success' ? 'neutral' : run.conclusion,
  title: `${run.title}; config left out`,
  summary: [
    run.summary,
    '',
    'This restricted run left out config, so some of its rules may not have been checked:',
    '',
    ...skipped.map((item) => `- ${cell(item)}`),
  ].join('\n'),
})

/**
 * One completed check run per feature that ran or failed, and one for each
 * other source of findings, such as `access` in a restricted run.
 *
 * @remarks
 * A feature that failed to run concludes as failure, so a broken feature can
 * never pass a required check. Findings with a file and line become
 * annotations on the diff.
 *
 * When a restricted run left config out (`configSkipped`), no feature that
 * ran can say which of its rules came from what was left out, so each one
 * that would pass concludes as neutral instead, and every feature's summary
 * lists what was left out. The `smartcloud / access` check carries the
 * restriction and a warning for each item.
 *
 * @example
 * ```ts import.meta.vitest name="checkRunsFor"
 * import type { RunResult } from '@resnovas/engine'
 * import { checkRunsFor } from '@resnovas/reporting'
 *
 * const result: RunResult = { envelope: { kind: 'repository', event: 'push', headSha: 'abc123' }, ran: ['labels'], skipped: [], failed: [], durations: {}, findings: [], changes: [], facts: [] }
 * checkRunsFor(result, 'abc123')[0]?.conclusion // => 'success'
 * checkRunsFor({ ...result, configSkipped: ['the extends preset o/r/p.yml: not found'] }, 'abc123')[0]?.conclusion // => 'neutral'
 * ```
 *
 * @param result - The run.
 * @param headSha - The commit the checks belong to.
 * @returns The check runs to create.
 */
export const checkRunsFor = (result: RunResult, headSha: string): ReadonlyArray<CheckRun> => {
  const findingsOf = (feature: string) => result.findings.filter((finding) => finding.feature === feature)
  const skipped = result.configSkipped ?? []
  const ran = result.ran.map((feature) => findingsCheckRun(feature, findingsOf(feature), headSha))
  const failed = result.failed.map((failure): CompletedCheckRun => ({
    name: `smartcloud / ${failure.feature}`,
    headSha,
    status: 'completed',
    conclusion: 'failure',
    title: 'failed to run',
    summary: ['```', failure.message, '```'].join('\n'),
  }))
  const covered = new Set([...result.ran, ...result.failed.map((failure) => failure.feature)])
  const others = [...new Set(result.findings.map((finding) => finding.feature))]
    .filter((feature) => !covered.has(feature))
    .map((feature) => findingsCheckRun(feature, findingsOf(feature), headSha))
  return [
    ...(skipped.length === 0 ? [...ran, ...failed] : [...ran, ...failed].map((run) => withConfigSkipped(run, skipped))),
    ...others,
  ]
}
