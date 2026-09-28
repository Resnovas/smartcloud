/**
 * @file packages/notifications/src/compose.ts
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

import type { RunResult } from '@resnovas/engine'
import { Option } from 'effect'
import type { Notification, NotificationKind } from './channel.js'

/**
 * The most lines one notification carries; the rest are counted in a last line.
 *
 * @example
 * ```ts import.meta.vitest name="LINE_LIMIT"
 * import { LINE_LIMIT } from '@resnovas/notifications'
 *
 * LINE_LIMIT // => 20
 * ```
 */
export const LINE_LIMIT = 20

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

const capped = (lines: ReadonlyArray<string>): ReadonlyArray<string> =>
  lines.length > LINE_LIMIT ? [...lines.slice(0, LINE_LIMIT), `…and ${lines.length - LINE_LIMIT} more`] : lines

// The pull request or issue a run was about, or the repository itself.
const whereOf = (result: RunResult, repository: string) => {
  const base = `https://github.com/${repository}`
  const { envelope } = result
  // A comment is about the issue or pull request it was left on.
  const subject = envelope.kind === 'repository' || envelope.kind === 'unsupported' ? undefined : envelope.subject
  if (subject === undefined) return { url: base, label: repository }
  return subject.kind === 'pullRequest'
    ? { url: `${base}/pull/${subject.number}`, label: `pull request #${subject.number} in ${repository}` }
    : { url: `${base}/issues/${subject.number}`, label: `issue #${subject.number} in ${repository}` }
}

/**
 * The notification a run gives rise to, if any.
 *
 * @remarks
 * `failures` carries the run's findings at `level` or above (notices never
 * count), from every feature. `stale` carries what the stale feature changed:
 * items it marked, unmarked, abandoned or closed. Either is none when there
 * is nothing to say. At most {@link LINE_LIMIT} lines are listed.
 *
 * @example
 * ```ts import.meta.vitest name="composeNotification"
 * import type { RunResult } from '@resnovas/engine'
 * import { composeNotification } from '@resnovas/notifications'
 * import { Option } from 'effect'
 *
 * const result: RunResult = {
 *   envelope: { kind: 'repository', event: 'schedule' },
 *   ran: ['stale'], skipped: [], failed: [], durations: {}, findings: [], facts: [],
 *   changes: [{ feature: 'stale', description: 'closed #3 as abandoned' }],
 * }
 * Option.getOrThrow(composeNotification(result, 'stale', { repository: 'o/r', level: 'error' })).title // => '1 stale change in o/r'
 * Option.isNone(composeNotification(result, 'failures', { repository: 'o/r', level: 'error' })) // => true
 * ```
 *
 * @param result - The run.
 * @param kind - What to notify about.
 * @param options - The repository, as `owner/name`, and the lowest finding level that counts as a failure.
 * @returns The notification, or none.
 */
export const composeNotification = (
  result: RunResult,
  kind: NotificationKind,
  options: { readonly repository: string; readonly level: 'error' | 'warning' },
): Option.Option<Notification> => {
  const where = whereOf(result, options.repository)
  if (kind === 'stale') {
    const lines = result.changes.filter((change) => change.feature === 'stale').map((change) => change.description)
    if (lines.length === 0) return Option.none()
    return Option.some({
      kind,
      repository: options.repository,
      title: `${plural(lines.length, 'stale change')} in ${options.repository}`,
      lines: capped(lines),
      url: `https://github.com/${options.repository}`,
    })
  }
  const counted = options.level === 'warning' ? ['error', 'warning'] : ['error']
  const findings = result.findings.filter((finding) => counted.includes(finding.level))
  if (findings.length === 0) return Option.none()
  return Option.some({
    kind,
    repository: options.repository,
    title: `${plural(findings.length, 'policy failure')} on ${where.label}`,
    lines: capped(findings.map((finding) => `${finding.level} ${finding.rule}: ${finding.message}`)),
    url: where.url,
  })
}
