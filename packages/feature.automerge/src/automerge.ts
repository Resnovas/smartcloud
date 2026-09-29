/**
 * @file packages/feature.automerge/src/automerge.ts
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

import { evaluate, type MissingFacet, type Subject } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { Report } from '@resnovas/engine'
import {
  autoMergeRefusal,
  disableAutoMerge,
  enableAutoMerge,
  GitHub,
  type GitHubError,
  isTrustedComment,
  type MergeMethod,
  readAutoMerge,
} from '@resnovas/integrations.github'
import { Effect } from 'effect'

/**
 * The feature's name, as it appears in findings, changes and run results.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE"
 * import { FEATURE } from '@resnovas/feature.automerge'
 *
 * FEATURE // => 'automerge'
 * ```
 */
export const FEATURE = 'automerge'

type AutoMerge = NonNullable<SmartcloudConfig['autoMerge']>

/**
 * The hidden HTML marker on the comment smartcloud keeps on a pull request it
 * turned auto-merge on for, saying whether it is still on.
 *
 * @example
 * ```ts import.meta.vitest name="autoMergeMarker"
 * import { autoMergeMarker } from '@resnovas/feature.automerge'
 *
 * autoMergeMarker('on') // => '<!-- smartcloud:auto-merge:on -->'
 * ```
 *
 * @param state - Whether smartcloud turned auto-merge on, or has turned it off again.
 * @returns The marker.
 */
export const autoMergeMarker = (state: 'on' | 'off'): string => `<!-- smartcloud:auto-merge:${state} -->`

const MARKER_PREFIX = '<!-- smartcloud:auto-merge:'

/** The rule that passed, and the method it asks for. */
export interface AutoMergeMatch {
  readonly key: string
  readonly method: MergeMethod
}

/**
 * The first auto-merge rule, in order, whose conditions pass on a pull request.
 *
 * @example
 * ```ts import.meta.vitest name="matchingRule"
 * import { matchingRule } from '@resnovas/feature.automerge'
 * import { Effect } from 'effect'
 *
 * const subject = { kind: 'pullRequest' as const, number: 7, title: 'Bump a from 1.0.0 to 1.0.1', body: '', author: 'dependabot[bot]', open: true, locked: false, labels: [], assignees: [], updatedAt: new Date(0) }
 * const rules = { patch: { when: { condition: [{ type: 'dependencyUpdateType', condition: ['patch'] }] } } } as const
 * Effect.runSync(matchingRule(rules, subject))?.method // => 'squash'
 * ```
 *
 * @param rules - The rules, by key.
 * @param subject - The pull request.
 * @returns The rule's key and method, squash when it names none; undefined when none passes.
 */
export const matchingRule = (
  rules: NonNullable<AutoMerge['rules']>,
  subject: Subject,
): Effect.Effect<AutoMergeMatch | undefined, MissingFacet> =>
  Effect.gen(function* () {
    for (const [key, rule] of Object.entries(rules)) {
      const evaluation = yield* evaluate(rule.when, subject)
      yield* Effect.logDebug(`automerge: ${key} ${evaluation.passed ? 'passed' : 'did not pass'}`).pipe(
        Effect.annotateLogs({ feature: FEATURE, rule: `autoMerge.rules.${key}`, passed: evaluation.passed }),
      )
      if (evaluation.passed) return { key, method: rule.method ?? 'squash' }
    }
    return undefined
  })

// The one comment smartcloud keeps about auto-merge, edited rather than repeated.
const ourComment = (number: number, trusted: ReadonlyArray<string>) =>
  Effect.map(
    Effect.flatMap(GitHub, (github) => github.listComments(number)),
    (comments) =>
      comments.find((comment) => comment.body.includes(MARKER_PREFIX) && isTrustedComment(comment, trusted)),
  )

const upsertComment = (number: number, body: string, trusted: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const existing = yield* ourComment(number, trusted)
    if (existing === undefined) yield* github.createComment(number, body)
    else if (existing.body !== body) yield* github.updateComment(existing.id, body)
  })

const finding = (level: 'error' | 'warning' | 'notice', message: string) =>
  Effect.flatMap(Report, (report) => report.add({ feature: FEATURE, rule: 'autoMerge', level, message }))

/**
 * Turns on auto-merge for a pull request a rule matched, unless it is already
 * on, and says so in a comment on the pull request.
 *
 * @remarks
 * Auto-merge someone else turned on, with whatever method, is left as it is.
 * GitHub refusing because the repository does not allow auto-merge is a
 * warning, because the pull request can already be merged a notice, and a
 * read-only token (a pull request event from a fork) a warning; any other
 * failure is an error finding. None of them fails the run.
 *
 * @example
 * ```ts
 * import { turnOn } from '@resnovas/feature.automerge'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = turnOn({ version: 2, autoMerge: {} }, 7, { key: 'patch', method: 'squash' })
 * ```
 *
 * @param config - The whole config; `roles.trustedBots` is read.
 * @param number - The pull request.
 * @param match - The rule that passed.
 * @returns Nothing; the changes and findings are in the report.
 */
export const turnOn = (
  config: SmartcloudConfig,
  number: number,
  match: AutoMergeMatch,
): Effect.Effect<void, never, GitHub | Report> =>
  Effect.gen(function* () {
    const report = yield* Report
    const state = yield* readAutoMerge(number)
    if (!state.open) return
    if (state.autoMerge !== undefined) {
      yield* Effect.logDebug(`automerge: #${number} already has auto-merge on`).pipe(
        Effect.annotateLogs({ feature: FEATURE, rule: `autoMerge.rules.${match.key}`, method: state.autoMerge.method }),
      )
      return
    }
    yield* enableAutoMerge(state.nodeId, match.method)
    yield* report.change({
      feature: FEATURE,
      description: `Turned on auto-merge (${match.method}) for #${number} (${match.key}).`,
    })
    yield* upsertComment(
      number,
      `${autoMergeMarker('on')}\nAuto-merge is on (${match.method}), because the \`${match.key}\` auto-merge rule matched. GitHub merges this pull request once its required reviews and checks pass.`,
      config.roles?.trustedBots ?? [],
    )
  }).pipe(Effect.catchAll((error) => explain(error, number, match.key)))

const explain = (error: GitHubError, number: number, key: string) => {
  if (error._tag === 'Forbidden') {
    return finding(
      'warning',
      `Could not turn on auto-merge for #${number} (${key}) on a read-only token, for example a pull request from a fork.`,
    )
  }
  switch (autoMergeRefusal(error)) {
    case 'notAllowed':
      return finding(
        'warning',
        `Could not turn on auto-merge for #${number} (${key}): the repository does not allow auto-merge. Turn on "Allow auto-merge" in the repository settings, or set settings.repository.autoMerge to true.`,
      )
    case 'mergeable':
      return finding(
        'notice',
        `#${number} can already be merged, so GitHub has nothing for auto-merge to wait for (${key}). Require a status check or review in a ruleset for auto-merge to apply.`,
      )
    case undefined:
      return finding('error', `Could not turn on auto-merge for #${number} (${key}): ${error.message}`)
  }
}

/**
 * Turns auto-merge off again on a pull request no rule matches any more, but
 * only where smartcloud turned it on and nobody has changed it since.
 *
 * @remarks
 * smartcloud turned it on when its auto-merge comment on the pull request
 * says it is on and was written by whoever GitHub says turned auto-merge on.
 * Auto-merge a person turned on, or turned on again with another method, is
 * left alone. The comment is edited to say it was turned off.
 *
 * @example
 * ```ts
 * import { turnOff } from '@resnovas/feature.automerge'
 *
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = turnOff({ version: 2, autoMerge: { disableWhenUnmatched: true } }, 7)
 * ```
 *
 * @param config - The whole config; `roles.trustedBots` is read.
 * @param number - The pull request.
 * @returns Nothing; the changes and findings are in the report.
 */
export const turnOff = (config: SmartcloudConfig, number: number): Effect.Effect<void, never, GitHub | Report> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    const state = yield* readAutoMerge(number)
    const auto = state.autoMerge
    if (!state.open || auto === undefined) return
    const ours = yield* ourComment(number, config.roles?.trustedBots ?? [])
    const owned =
      ours !== undefined &&
      ours.body.includes(autoMergeMarker('on')) &&
      ours.author.toLowerCase() === auto.enabledBy.toLowerCase()
    yield* Effect.logDebug(`automerge: #${number} matches no rule; auto-merge ${owned ? 'is' : 'is not'} ours`).pipe(
      Effect.annotateLogs({ feature: FEATURE, rule: 'autoMerge.disableWhenUnmatched', owned }),
    )
    if (!owned) return
    yield* disableAutoMerge(state.nodeId)
    yield* report.change({
      feature: FEATURE,
      description: `Turned off auto-merge for #${number}, because no auto-merge rule matches it any more.`,
    })
    yield* github.updateComment(
      ours.id,
      `${autoMergeMarker('off')}\nAuto-merge was turned off, because no auto-merge rule matches this pull request any more.`,
    )
  }).pipe(
    Effect.catchAll((error) =>
      error._tag === 'Forbidden'
        ? finding(
            'warning',
            `Could not turn off auto-merge for #${number} on a read-only token, for example a pull request from a fork.`,
          )
        : finding('error', `Could not turn off auto-merge for #${number}: ${error.message}`),
    ),
  )

/**
 * Applies the auto-merge policy to an open pull request: turns auto-merge on
 * when a rule passes, or off again when none does and `disableWhenUnmatched`
 * is set.
 *
 * @remarks
 * A draft is left alone until it is ready for review, and a closed pull
 * request always.
 *
 * @example
 * ```ts
 * import type { Subject } from '@resnovas/conditions'
 * import { runAutoMerge } from '@resnovas/feature.automerge'
 *
 * declare const subject: Subject
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = runAutoMerge({ version: 2, autoMerge: { rules: {} } }, subject)
 * ```
 *
 * @param config - The whole config; `autoMerge` and `roles.trustedBots` are read.
 * @param subject - The pull request, with the facets its rules need.
 * @returns Nothing; the changes and findings are in the report.
 */
export const runAutoMerge = (
  config: SmartcloudConfig,
  subject: Subject,
): Effect.Effect<void, MissingFacet, GitHub | Report> =>
  Effect.gen(function* () {
    const section = config.autoMerge
    if (section === undefined || subject.kind !== 'pullRequest' || !subject.open) return
    if (subject.draft === true) {
      yield* Effect.logDebug(`automerge: #${subject.number} is a draft`).pipe(
        Effect.annotateLogs({ feature: FEATURE, rule: 'autoMerge' }),
      )
      return
    }
    const match = yield* matchingRule(section.rules ?? {}, subject)
    if (match !== undefined) yield* turnOn(config, subject.number, match)
    else if (section.disableWhenUnmatched === true) yield* turnOff(config, subject.number)
  })
