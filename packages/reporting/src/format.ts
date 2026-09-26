/**
 * @file packages/reporting/src/format.ts
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

import type { Finding, RunResult } from '@resnovas/engine'
import type { Annotation, CheckRun } from '@resnovas/integrations.github'

/** Marks smartcloud's comment on an issue or pull request, so each run updates it in place. */
export const MARKER = '<!-- smartcloud:report -->'

/** A check run's conclusion. */
export type Conclusion = 'success' | 'failure' | 'neutral'

/**
 * The conclusion for a set of findings: failure on any error, neutral when
 * there are only warnings, success otherwise. Notices never change it.
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

const rule = (finding: Finding) => (finding.link === undefined ? `\`${finding.rule}\`` : `[\`${finding.rule}\`](${finding.link})`)

const where = (finding: Finding) =>
  finding.path !== undefined
    ? `${finding.path}${finding.line === undefined ? '' : `:${finding.line}`}`
    : finding.commit === undefined
      ? ''
      : finding.commit.slice(0, 12)

/**
 * Renders findings as a Markdown table.
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
        ...findings.map((finding) => `| ${finding.level} | ${rule(finding)} | ${where(finding)} | ${cell(finding.message)} |`),
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
  const subject = envelope.kind === 'pullRequest' || envelope.kind === 'issue' ? ` on #${envelope.subject.number}` : ''
  return `\`${envelope.event}\`${action}${subject}`
}

/**
 * The job summary for a run: every feature's outcome, what was skipped and
 * why, every finding, and every change.
 *
 * @param result - The run.
 * @returns Markdown for `GITHUB_STEP_SUMMARY`.
 */
export const summaryMarkdown = (result: RunResult): string => {
  const lines = ['## smartcloud', '', `Event: ${eventLine(result)}`, '']
  const features = [
    ...result.ran.map((feature) => `| ${feature} | ${tally(result.findings.filter((finding) => finding.feature === feature))} |`),
    ...result.failed.map((failure) => `| ${failure.feature} | failed to run |`),
  ]
  if (features.length > 0) lines.push('| Feature | Result |', '| --- | --- |', ...features, '')
  for (const failure of result.failed) lines.push(`**${failure.feature}** failed to run:`, '', '```', failure.message, '```', '')
  if (result.skipped.length > 0) {
    lines.push('Skipped:', ...result.skipped.map((skip) => `- ${skip.feature}: ${skip.reason}`), '')
  }
  if (result.findings.length > 0) lines.push(findingsTable(result.findings), '')
  if (result.changes.length > 0) lines.push('Changes:', ...result.changes.map((change) => `- ${change.feature}: ${change.description}`), '')
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

/**
 * One completed check run per feature that ran or failed.
 *
 * @remarks
 * A feature that failed to run concludes as failure, so a broken feature can
 * never pass a required check. Findings with a file and line become
 * annotations on the diff.
 *
 * @param result - The run.
 * @param headSha - The commit the checks belong to.
 * @returns The check runs to create.
 */
export const checkRunsFor = (result: RunResult, headSha: string): ReadonlyArray<CheckRun> => [
  ...result.ran.map((feature) => {
    const findings = result.findings.filter((finding) => finding.feature === feature)
    const annotations = findings.flatMap((finding) =>
      finding.path === undefined || finding.line === undefined
        ? []
        : [{ path: finding.path, line: finding.line, level: LEVEL[finding.level], message: finding.message, title: finding.rule }],
    )
    return {
      name: `smartcloud / ${feature}`,
      headSha,
      status: 'completed' as const,
      conclusion: conclusionOf(findings),
      title: tally(findings),
      summary: findings.length === 0 ? 'No findings.' : findingsTable(findings),
      annotations,
    }
  }),
  ...result.failed.map((failure) => ({
    name: `smartcloud / ${failure.feature}`,
    headSha,
    status: 'completed' as const,
    conclusion: 'failure' as const,
    title: 'failed to run',
    summary: ['```', failure.message, '```'].join('\n'),
  })),
]
