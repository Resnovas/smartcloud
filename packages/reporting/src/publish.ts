/**
 * @file packages/reporting/src/publish.ts
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

import type { RunResult } from '@resnovas/engine'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { annotationLines, checkRunsFor, commentBody, isLegacyReport, MARKER, summaryMarkdown } from './format.js'

/** What publishing did, for the action to log and write out. */
export interface Published {
  readonly checkRuns: number
  readonly comment: 'created' | 'updated' | 'unchanged' | 'skipped'
  /** Markdown for `GITHUB_STEP_SUMMARY`. */
  readonly summary: string
  /** Workflow commands for the action to print. */
  readonly annotations: ReadonlyArray<string>
  /** Reporting steps that could not complete, such as check runs on a fork's read-only token. */
  readonly warnings: ReadonlyArray<string>
}

const headShaOf = (result: RunResult) =>
  result.envelope.kind === 'pullRequest' || result.envelope.kind === 'repository' ? result.envelope.headSha : undefined

const subjectOf = (result: RunResult) =>
  result.envelope.kind === 'pullRequest' || result.envelope.kind === 'issue' ? result.envelope.subject.number : undefined

/**
 * Publishes a run to GitHub: check runs on the commit, one updatable comment
 * on the issue or pull request, plus the summary and annotations for the
 * action to write out.
 *
 * @remarks
 * Reporting never fails the run. On a pull request from a fork the token is
 * read-only, so check runs and comments cannot be written; publishing records
 * a warning and the summary and annotations still carry every finding. The
 * comment is created only when there is something to act on, and once
 * created it is updated in place, including to say that everything passes.
 * A comment left by v1 is taken over the same way when there is no v2 one.
 *
 * @param result - The run.
 * @param options - Set `comment` to false to leave issues and pull requests alone.
 * @returns What was published.
 */
export const publishReport = (result: RunResult, options: { readonly comment?: boolean } = {}): Effect.Effect<Published, never, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const warnings: Array<string> = []
    const noteFailure = (step: string) => (error: GitHubError) => Effect.sync(() => void warnings.push(`${step}: ${error.message}`))

    let checkRuns = 0
    const headSha = headShaOf(result)
    if (headSha !== undefined) {
      // Stop at the first failure: on a read-only token every later call fails the same way.
      yield* Effect.forEach(checkRunsFor(result, headSha), (run) => Effect.map(github.createCheckRun(run), () => void checkRuns++), {
        discard: true,
      }).pipe(Effect.catchAll(noteFailure('check runs')))
    }

    let comment: Published['comment'] = 'skipped'
    const number = subjectOf(result)
    if (number !== undefined && options.comment !== false) {
      const body = commentBody(result.findings)
      const actionable = result.findings.some((finding) => finding.level !== 'notice')
      yield* Effect.gen(function* () {
        const comments = yield* github.listComments(number)
        const existing = comments.find((entry) => entry.body.includes(MARKER)) ?? comments.find((entry) => isLegacyReport(entry.body))
        if (existing !== undefined) {
          if (existing.body === body) comment = 'unchanged'
          else {
            yield* github.updateComment(existing.id, body)
            comment = 'updated'
          }
        } else if (actionable) {
          yield* github.createComment(number, body)
          comment = 'created'
        }
      }).pipe(Effect.catchAll(noteFailure('comment')))
    }

    return { checkRuns, comment, summary: summaryMarkdown(result), annotations: annotationLines(result.findings), warnings }
  })
