/**
 * @file packages/feature.conventions/src/feature.ts
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

import { type ConditionResult, evaluate, type Evaluation, type MissingFacet, requiredFacets, type Subject } from '@resnovas/conditions'
import type { ConventionRule, SmartcloudConfig } from '@resnovas/config'
import { type Feature, Report } from '@resnovas/engine'
import { Effect } from 'effect'
import { matchesPreset, presetDescription } from './presets.js'

/**
 * The conventions feature's name, as recorded on its findings.
 *
 * @remarks
 * Finding rule ids are `conventions.<rule key>`.
 *
 * @example
 * ```ts
 * findings.filter((finding) => finding.feature === FEATURE)
 * ```
 */
export const FEATURE = 'conventions'

const rulesOf = (config: SmartcloudConfig): ReadonlyArray<readonly [string, ConventionRule]> =>
  Object.entries(config.conventions?.rules ?? {})

// A failed `$not` only says "the group passed"; what the reader needs is
// which of the forbidden conditions held. A failed `$and` or `$or` only
// counts its groups, so it also names the conditions inside that failed.
// `$only` keeps its count: it can fail because too many groups passed.
const explain = (result: ConditionResult): ReadonlyArray<string> => {
  if (result.type === '$not') {
    return (result.groups ?? []).flatMap((group) => group.results.filter((inner) => inner.passed).map((inner) => `not expected: ${inner.detail}`))
  }
  if (result.type !== '$and' && result.type !== '$or') return [result.detail]
  const inner = (result.groups ?? []).flatMap((group) => group.results.filter((entry) => !entry.passed).flatMap(explain))
  return [inner.length === 0 ? result.detail : `${result.detail} (${inner.join('; ')})`]
}

/**
 * Explains why a rule's `when` failed.
 *
 * @remarks
 * Lists every condition that did not pass. For a `$not`, it lists the
 * conditions inside it that held, since those are what must change; for a
 * failed `$and` or `$or`, the conditions inside it that failed.
 *
 * @example
 * ```ts
 * describeEvaluation(yield* evaluate(rule.when, subject))
 * // 'Expected 1 of 1 condition(s) to pass, but 0 did: title does not match ^feat'
 * ```
 *
 * @param evaluation - A failed evaluation of the rule's `when`.
 * @returns A one-line explanation.
 */
export const describeEvaluation = (evaluation: Evaluation): string => {
  const failing = evaluation.results.filter((result) => !result.passed).flatMap(explain)
  return `Expected ${evaluation.required} of ${evaluation.results.length} condition(s) to pass, but ${evaluation.matched} did: ${failing.join('; ')}`
}

/**
 * Checks one convention rule against a subject.
 *
 * @remarks
 * The rule passes when its preset, if any, accepts the title and its
 * `when`, if any, passes. Both are always checked, so a failure explains
 * every part that needs fixing. The rule's `on` is not considered here.
 *
 * @example
 * ```ts
 * const failures = yield* checkRule({ preset: 'conventionalCommits' }, subject)
 * failures.length === 0 // the rule passed
 * ```
 *
 * @param rule - The convention rule.
 * @param subject - The pull request or issue, with the facets `when` needs.
 * @returns An explanation of each failing part: empty when the rule passes.
 */
export const checkRule = (rule: ConventionRule, subject: Subject): Effect.Effect<ReadonlyArray<string>, MissingFacet> =>
  Effect.gen(function* () {
    const failures: Array<string> = []
    if (rule.preset !== undefined && !matchesPreset(rule.preset, subject.title, rule.contexts)) {
      failures.push(presetDescription(rule.preset, rule.contexts))
    }
    if (rule.when !== undefined) {
      const evaluation = yield* evaluate(rule.when, subject)
      if (!evaluation.passed) failures.push(describeEvaluation(evaluation))
    }
    return failures
  })

const run: Feature['run'] = ({ config, subject }) =>
  Effect.gen(function* () {
    if (subject === undefined) return
    const report = yield* Report
    const failed: Array<string> = []
    const applicable = rulesOf(config).filter(([, rule]) => rule.on === undefined || rule.on.includes(subject.kind))
    for (const [id, rule] of applicable) {
      const failures = yield* checkRule(rule, subject)
      if (failures.length === 0) continue
      failed.push(`${FEATURE}.${id}`)
      yield* report.add({
        feature: FEATURE,
        rule: `${FEATURE}.${id}`,
        level: rule.level ?? 'error',
        message: rule.message ?? failures.join('\n\n'),
      })
    }
    yield* Effect.logInfo(`conventions: ${failed.length} of ${applicable.length} rule(s) failed`).pipe(
      Effect.annotateLogs({ feature: FEATURE, 'subject.kind': subject.kind, checked: applicable.length, failed: failed.length, rules: failed }),
    )
  })

/**
 * The conventions feature: title and description conventions for pull
 * requests and issues.
 *
 * @remarks
 * Every rule in `conventions.rules` whose `on` includes the subject's kind
 * (omitted means both) is checked with {@link checkRule}. A failing rule is
 * recorded as a finding with the rule id `conventions.<id>`, the rule's
 * level (default `error`) and its message, or an explanation of what was
 * expected. The feature only records findings: the reporters post them.
 *
 * @example
 * ```ts
 * const result = yield* runFeatures({ config, event: 'pull_request', payload, features: [conventions] })
 * result.findings.filter((finding) => finding.feature === 'conventions')
 * ```
 */
export const conventions: Feature = {
  name: FEATURE,
  handles: ['pullRequest', 'issue'],
  enabled: (config) => rulesOf(config).length > 0,
  // Facets are only loaded for pull requests, so a rule that never runs on
  // one must not make every pull-request run read them.
  facets: (config) =>
    requiredFacets(
      rulesOf(config).flatMap(([, rule]) =>
        rule.when === undefined || (rule.on !== undefined && !rule.on.includes('pullRequest')) ? [] : [rule.when],
      ),
    ),
  run,
}
