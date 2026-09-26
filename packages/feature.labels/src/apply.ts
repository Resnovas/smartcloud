/**
 * @file packages/feature.labels/src/apply.ts
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

import {
  type ConditionGroup,
  evaluate,
  type MissingFacet,
  requiredFacets,
  type Facet,
  type Subject,
} from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { Report } from '@resnovas/engine'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { sameName } from './sync.js'

const FEATURE = 'labels'

/**
 * Why a write was refused, for the warning a forbidden write leaves.
 *
 * @internal
 */
export const READ_ONLY_TOKEN = 'on a read-only token, for example a pull request from a fork'

type Rules = NonNullable<SmartcloudConfig['labelling']>

/**
 * The name a labelling rule applies.
 *
 * @remarks
 * `rule.label` is usually a key of the config's `labels` section, and the
 * label's `name` is what GitHub knows it by. A key that is not defined there
 * is taken as the label's name itself.
 *
 * @example
 * ```ts import.meta.vitest name="labelName"
 * import { labelName } from '@resnovas/feature.labels'
 *
 * labelName({ version: 2, labels: { bug: { name: 'Type: Bug', color: 'd73a4a' } } }, 'bug') // => 'Type: Bug'
 * labelName({ version: 2 }, 'docs') // => 'docs'
 * ```
 *
 * @param config - The whole config.
 * @param label - The rule's `label`.
 * @returns The label's name on GitHub.
 */
export const labelName = (config: SmartcloudConfig, label: string): string => config.labels?.[label]?.name ?? label

/**
 * The facets the conditions of every labelling rule that can run on a pull
 * request need loaded.
 *
 * @example
 * ```ts import.meta.vitest name="labellingFacets"
 * import { labellingFacets } from '@resnovas/feature.labels'
 *
 * const when = { condition: [{ type: 'filesMatch' as const, condition: '**' }] }
 * labellingFacets({ version: 2, labelling: { big: { label: 'big', when } } }).has('files') // => true
 * ```
 *
 * @param config - The whole config.
 * @returns The facets, empty when there is no `labelling` section.
 */
export const labellingFacets = (config: SmartcloudConfig): ReadonlySet<Facet> =>
  requiredFacets(
    Object.values(config.labelling ?? {})
      // Facets are only loaded for pull requests, so issue-only rules need none.
      .filter((rule) => rule.on === undefined || rule.on.includes('pullRequest'))
      .map((rule): ConditionGroup => rule.when),
  )

// A label is wanted when any rule for it passes, so two rules naming the same
// label (for example one per subject kind) never fight each other.
const decide = (config: SmartcloudConfig, rules: Rules, subject: Subject) =>
  Effect.reduce(Object.values(rules), new Map<string, { name: string; wanted: boolean }>(), (decisions, rule) => {
    if (!(rule.on ?? ['pullRequest', 'issue']).includes(subject.kind)) return Effect.succeed(decisions)
    const name = labelName(config, rule.label)
    return Effect.map(evaluate(rule.when, subject), (evaluation) => {
      const key = name.toLowerCase()
      decisions.set(key, { name, wanted: (decisions.get(key)?.wanted ?? false) || evaluation.passed })
      return decisions
    })
  })

/**
 * Adds and removes labels on a pull request or issue as its `labelling`
 * rules pass and fail.
 *
 * @remarks
 * A rule applies to the subject kinds in its `on`, or both when omitted. A
 * label whose rule passes is added when missing; one whose rules all fail is
 * removed when present. Names compare ignoring case, as GitHub does. When a
 * label disappears between reading the subject and removing it, GitHub
 * answers NotFound; that race is a warning, not a failure. So is a Forbidden
 * write: a pull request from a fork runs with a read-only token, and one
 * label the token cannot set should not fail the whole run.
 *
 * @example
 * ```ts
 * import type { Subject } from '@resnovas/conditions'
 * import type { SmartcloudConfig } from '@resnovas/config'
 * import { applyLabels } from '@resnovas/feature.labels'
 *
 * declare const config: SmartcloudConfig
 * declare const subject: Subject
 * const program = applyLabels(config, subject) // run with GitHub and Report provided
 * ```
 *
 * @param config - The whole config; `labelling` and `labels` are read.
 * @param subject - The pull request or issue, with the facets its rules need.
 * @returns Nothing; the changes and warnings are in the report.
 */
export const applyLabels = (
  config: SmartcloudConfig,
  subject: Subject,
): Effect.Effect<void, GitHubError | MissingFacet, GitHub | Report> =>
  Effect.gen(function* () {
    if (config.labelling === undefined) return
    const github = yield* GitHub
    const report = yield* Report
    const decisions = yield* decide(config, config.labelling, subject)
    const present = (name: string) => subject.labels.some((label) => sameName(label, name))
    const decided = [...decisions.values()]

    const toAdd = decided.filter((entry) => entry.wanted && !present(entry.name)).map((entry) => entry.name)
    const toRemove = decided.filter((candidate) => !candidate.wanted && present(candidate.name))
    yield* Effect.logInfo(`labels: ${toAdd.length} to add, ${toRemove.length} to remove`).pipe(
      Effect.annotateLogs({ feature: FEATURE, rule: 'labels.apply', rules: decided.length, add: toAdd.length, remove: toRemove.length }),
    )
    if (toAdd.length > 0) {
      yield* github.addLabels(subject.number, toAdd).pipe(
        Effect.zipRight(
          Effect.forEach(toAdd, (name) => report.change({ feature: FEATURE, description: `added label "${name}" to #${subject.number}` }), {
            discard: true,
          }),
        ),
        Effect.catchTag('Forbidden', () =>
          report.add({
            feature: FEATURE,
            rule: 'labels.add',
            level: 'warning',
            message: `could not add ${toAdd.map((name) => `"${name}"`).join(', ')} to #${subject.number} ${READ_ONLY_TOKEN}`,
          }),
        ),
      )
    }

    for (const entry of toRemove) {
      yield* github.removeLabel(subject.number, entry.name).pipe(
        Effect.zipRight(
          report.change({ feature: FEATURE, description: `removed label "${entry.name}" from #${subject.number}` }),
        ),
        Effect.catchTag('NotFound', () =>
          report.add({
            feature: FEATURE,
            rule: 'labels.remove',
            level: 'warning',
            message: `label "${entry.name}" was already gone from #${subject.number} when smartcloud removed it`,
          }),
        ),
        Effect.catchTag('Forbidden', () =>
          report.add({
            feature: FEATURE,
            rule: 'labels.remove',
            level: 'warning',
            message: `could not remove "${entry.name}" from #${subject.number} ${READ_ONLY_TOKEN}`,
          }),
        ),
      )
    }
  })
