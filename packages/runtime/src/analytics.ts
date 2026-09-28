/**
 * @file packages/runtime/src/analytics.ts
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

// The product analytics taxonomy: every event smartcloud sends, its
// properties as a schema, and the builders that make them from what a run
// did. Nothing else names an analytics event.

import { parseExtendsRef, SmartcloudConfig, type ResolvedConfig } from '@resnovas/config'
import type { Feature, Finding, RunResult } from '@resnovas/engine'
import {
  describeOrganization,
  emit,
  invocation,
  type InvocationSummary,
  type TelemetryEvent,
} from '@resnovas/integrations.posthog'
import { Effect, Option, Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import { FEATURE_SECTIONS, FEATURES } from './features.js'

const Count = Schema.Int.pipe(Schema.nonNegative())
const Counts = Schema.Record({ key: Schema.String, value: Count })
const Names = Schema.Array(Schema.String)

/**
 * The properties of `command run`: one event per action run, CLI command or
 * MCP tool call.
 *
 * @remarks
 * `options` holds the names of the options or inputs given, never their
 * values. `error_tag` and `expected` are set only when the invocation
 * failed. The surface and the version are added to every event.
 *
 * @example
 * ```ts import.meta.vitest name="CommandRun"
 * import { Schema } from 'effect'
 * import { CommandRun } from '@resnovas/runtime'
 *
 * Schema.is(CommandRun)({ command: 'dry-run', options: ['event', 'repo'], outcome: 'success', duration_ms: 812 }) // => true
 * ```
 */
export const CommandRun = Schema.Struct({
  command: Schema.String,
  options: Names,
  outcome: Schema.Literal('success', 'failure', 'interrupted'),
  duration_ms: Count,
  error_tag: Schema.optionalWith(Schema.String, { exact: true }),
  expected: Schema.optionalWith(Schema.Boolean, { exact: true }),
})

/**
 * The properties of `config resolved`, sent each time a config is read.
 *
 * @remarks
 * Presets are only ever `house` (smartcloud's own house preset) or `other`;
 * their names are never sent. The event is only sent while telemetry is on,
 * so a config that sets `telemetry: false` never sends it.
 *
 * @example
 * ```ts import.meta.vitest name="ConfigResolved"
 * import { Schema } from 'effect'
 * import { ConfigResolved } from '@resnovas/runtime'
 *
 * const properties = { config_version: 2, migrated_from_v1: false, extends_count: 1, presets: ['house'], features_enabled: ['commits'], rule_counts: { commits: 2 } }
 * Schema.is(ConfigResolved)(properties) // => true
 * ```
 */
export const ConfigResolved = Schema.Struct({
  /** The version the repository's own file is written in. */
  config_version: Schema.Literal(1, 2),
  migrated_from_v1: Schema.Boolean,
  /** Presets included, directly or through other presets. */
  extends_count: Count,
  presets: Schema.Array(Schema.Literal('house', 'other')),
  features_enabled: Names,
  /** Entries in each feature's config sections. */
  rule_counts: Counts,
})

/**
 * The properties of `feature run`, one event per feature a run considered.
 *
 * @remarks
 * Rule ids are sanitised by {@link sanitiseRule}, so a rule named by the
 * repository is never sent as written.
 *
 * @example
 * ```ts import.meta.vitest name="FeatureRun"
 * import { Schema } from 'effect'
 * import { FeatureRun } from '@resnovas/runtime'
 *
 * const properties = {
 *   feature: 'commits', outcome: 'success', event_kind: 'pullRequest', github_event: 'pull_request',
 *   findings: 1, findings_error: 1, findings_warning: 0, findings_notice: 0, findings_by_rule: { DCO: 1 }, rules: ['DCO'],
 *   changes: 0, duration_ms: 40,
 * }
 * Schema.is(FeatureRun)(properties) // => true
 * ```
 */
export const FeatureRun = Schema.Struct({
  feature: Schema.String,
  outcome: Schema.Literal('success', 'failure', 'skipped'),
  /** Why it was skipped, when it was. */
  skip_reason: Schema.optionalWith(Schema.Literal('flag', 'not configured', 'unsupported event'), { exact: true }),
  /** The kind of event: `pullRequest`, `issue`, `repository` or `unsupported`. */
  event_kind: Schema.String,
  github_event: Schema.String,
  findings: Count,
  findings_error: Count,
  findings_warning: Count,
  findings_notice: Count,
  findings_by_rule: Counts,
  rules: Names,
  changes: Count,
  duration_ms: Count,
})

/**
 * The properties of `sync proposed`, sent when the sync feature plans a
 * proposal.
 *
 * @example
 * ```ts import.meta.vitest name="SyncProposed"
 * import { Schema } from 'effect'
 * import { SyncProposed } from '@resnovas/runtime'
 *
 * Schema.is(SyncProposed)({ created: 2, updated: 1, mode: 0, conflicts: 0, pull_request: 'updated' }) // => true
 * ```
 */
export const SyncProposed = Schema.Struct({
  created: Count,
  updated: Count,
  mode: Count,
  conflicts: Count,
  pull_request: Schema.Literal('created', 'updated', 'none', 'dry-run'),
})

/**
 * The properties of `settings applied`, sent when the settings feature
 * applies a config's repository settings.
 *
 * @example
 * ```ts import.meta.vitest name="SettingsApplied"
 * import { Schema } from 'effect'
 * import { SettingsApplied } from '@resnovas/runtime'
 *
 * Schema.is(SettingsApplied)({ applied: 4, failed: 1, skipped: 0, project_type: 'library' }) // => true
 * ```
 */
export const SettingsApplied = Schema.Struct({
  applied: Count,
  failed: Count,
  skipped: Count,
  project_type: Schema.Literal('saas', 'desktop', 'library', 'none'),
})

/**
 * Every analytics event smartcloud sends, by name, with the schema of its
 * properties.
 *
 * @example
 * ```ts import.meta.vitest name="ANALYTICS_EVENTS"
 * import { ANALYTICS_EVENTS } from '@resnovas/runtime'
 *
 * Object.keys(ANALYTICS_EVENTS).join(', ') // => 'command run, config resolved, feature run, sync proposed, settings applied'
 * ```
 */
export const ANALYTICS_EVENTS = {
  'command run': CommandRun,
  'config resolved': ConfigResolved,
  'feature run': FeatureRun,
  'sync proposed': SyncProposed,
  'settings applied': SettingsApplied,
} as const

/** The name of an analytics event. */
export type AnalyticsEventName = keyof typeof ANALYTICS_EVENTS

/** An analytics event, its properties checked against its schema. */
export interface AnalyticsEvent<Name extends AnalyticsEventName = AnalyticsEventName> {
  readonly event: Name
  readonly properties: Schema.Schema.Type<(typeof ANALYTICS_EVENTS)[Name]>
}

/**
 * The house preset: smartcloud's own shared config.
 *
 * @example
 * ```ts import.meta.vitest name="HOUSE_PRESET"
 * import { HOUSE_PRESET } from '@resnovas/runtime'
 *
 * HOUSE_PRESET // => 'Resnovas/.github/smartcloud/house.yml'
 * ```
 */
export const HOUSE_PRESET = 'Resnovas/.github/smartcloud/house.yml'

/**
 * Classifies a preset without naming it: `house` for the house preset at
 * any ref, `other` for anything else.
 *
 * @example
 * ```ts import.meta.vitest name="presetKind"
 * import { presetKind } from '@resnovas/runtime'
 *
 * presetKind('resnovas/.github/smartcloud/house.yml@v2') // => 'house'
 * presetKind('Acme/presets/smartcloud.yml') // => 'other'
 * ```
 *
 * @param entry - An `extends` entry or a resolved source, `owner/repo/path@ref`.
 * @returns The kind.
 */
export const presetKind = (entry: string): 'house' | 'other' => {
  const ref = parseExtendsRef(entry)
  return ref !== undefined && `${ref.owner}/${ref.repo}/${ref.path}`.toLowerCase() === HOUSE_PRESET.toLowerCase()
    ? 'house'
    : 'other'
}

// The policy rules, whose ids are fixed by the policy documents.
const POLICY = /^(?:AI-\d{2}|DCO|SYNC|REVIEW)$/i
// A rule segment smartcloud's own code writes; a user-chosen one may contain anything.
const SEGMENT = /^[A-Za-z][A-Za-z0-9-]*$/
const OWNERS = new Set([...FEATURES.map((feature) => feature.name), 'engine'])

/**
 * A rule id as it may be sent: a policy id, or a feature's own rule, with
 * anything a repository chose replaced.
 *
 * @remarks
 * Convention rules are named by the repository, so every `conventions.<id>`
 * becomes `conventions.custom`. Other feature rules keep only their first
 * segment, which smartcloud's code writes, so `settings.environment:prod`
 * becomes `settings.environment`. Anything else becomes `other`.
 *
 * @example
 * ```ts import.meta.vitest name="sanitiseRule"
 * import { sanitiseRule } from '@resnovas/runtime'
 *
 * sanitiseRule('ai-02') // => 'AI-02'
 * sanitiseRule('conventions.no-jira-keys') // => 'conventions.custom'
 * sanitiseRule('settings.environment:production') // => 'settings.environment'
 * sanitiseRule('Acme/secret') // => 'other'
 * ```
 *
 * @param rule - The rule id from a finding.
 * @returns The id to send.
 */
export const sanitiseRule = (rule: string): string => {
  if (POLICY.test(rule)) return rule.toUpperCase()
  const dot = rule.indexOf('.')
  const owner = dot < 0 ? rule : rule.slice(0, dot)
  if (!OWNERS.has(owner)) return 'other'
  if (owner === 'conventions') return 'conventions.custom'
  if (dot < 0) return owner
  // Only the first segment after the feature, up to a dot or a colon, is smartcloud's own.
  const segment = rule
    .slice(dot + 1)
    .split(/[.:]/, 1)
    .join('')
  return SEGMENT.test(segment) ? `${owner}.${segment}` : `${owner}.other`
}

// GitHub's event names are its own; anything unexpected is not sent as written.
const eventName = (name: string) => (/^[a-z_]{1,64}$/.test(name) ? name : 'other')

const byRule = (findings: ReadonlyArray<Finding>) => {
  const counts: Record<string, number> = {}
  for (const finding of findings) {
    const rule = sanitiseRule(finding.rule)
    counts[rule] = (counts[rule] ?? 0) + 1
  }
  return counts
}

/**
 * The `command run` event for how an invocation ended.
 *
 * @example
 * ```ts import.meta.vitest name="commandRun"
 * import { commandRun } from '@resnovas/runtime'
 *
 * commandRun({ command: 'validate', options: [], outcome: 'failure', duration_ms: 3, error_tag: 'ConfigDecodeError', expected: true }).event // => 'command run'
 * ```
 *
 * @param summary - The invocation's summary.
 * @returns The event.
 */
export const commandRun = (summary: InvocationSummary): AnalyticsEvent<'command run'> => ({
  event: 'command run',
  properties: {
    command: summary.command,
    options: summary.options,
    outcome: summary.outcome,
    duration_ms: Math.max(0, Math.round(summary.duration_ms)),
    ...(summary.error_tag === undefined ? {} : { error_tag: summary.error_tag }),
    ...(summary.expected === undefined ? {} : { expected: summary.expected }),
  },
})

// How many entries a config section holds: its keys, or a convention's rules, which are under `rules`.
const entries = (value: unknown): number => {
  if (typeof value !== 'object' || value === null) return 0
  const rules: unknown = 'rules' in value ? value.rules : undefined
  return Object.keys(typeof rules === 'object' && rules !== null ? rules : value).length
}

// The version the file is written in; anything that is not version 2 is read as v1 and migrated.
const writtenVersion = (text: string): 1 | 2 => {
  try {
    const raw: unknown = parseYaml(text)
    return typeof raw === 'object' && raw !== null && 'version' in raw && raw.version === 2 ? 2 : 1
  } catch {
    return 2
  }
}

/**
 * The `config resolved` event for a resolved config.
 *
 * @example
 * ```ts import.meta.vitest name="configResolved"
 * import { configResolved } from '@resnovas/runtime'
 *
 * const resolved = { config: { version: 2 as const, commits: {} }, sources: ['Resnovas/.github/smartcloud/house.yml', '.github/smartcloud.yml'], locked: new Set<string>(), warnings: [] }
 * configResolved(resolved, 'version: 2\n').properties.presets.join(',') // => 'house'
 * ```
 *
 * @param resolved - The resolved config.
 * @param text - The repository's own config file, to tell whether it was written for v1.
 * @param features - The features to report on; every feature by default.
 * @returns The event.
 */
export const configResolved = (
  resolved: ResolvedConfig,
  text: string,
  features: ReadonlyArray<Feature> = FEATURES,
): AnalyticsEvent<'config resolved'> => {
  const version = writtenVersion(text)
  const encoded = Schema.encodeSync(SmartcloudConfig)(resolved.config)
  const enabled = features.filter((feature) => feature.enabled?.(resolved.config) ?? true)
  const counts: Record<string, number> = {}
  for (const feature of enabled) {
    counts[feature.name] = (FEATURE_SECTIONS.get(feature.name) ?? []).reduce(
      (total, key) => total + entries(encoded[key]),
      0,
    )
  }
  // The repository's own file is the last source; every other is a preset.
  const presets = resolved.sources.slice(0, -1)
  return {
    event: 'config resolved',
    properties: {
      config_version: version,
      migrated_from_v1: version === 1,
      extends_count: presets.length,
      presets: presets.map(presetKind),
      features_enabled: enabled.map((feature) => feature.name),
      rule_counts: counts,
    },
  }
}

const SKIP_REASONS = [
  ['turned off by feature flag', 'flag'],
  ['not configured', 'not configured'],
] as const

const skipReason = (reason: string): 'flag' | 'not configured' | 'unsupported event' =>
  SKIP_REASONS.find(([prefix]) => reason.startsWith(prefix))?.[1] ?? 'unsupported event'

/**
 * The `feature run` events for a run: one for each feature that ran, failed
 * or was skipped.
 *
 * @example
 * ```ts import.meta.vitest name="featureRuns"
 * import { featureRuns } from '@resnovas/runtime'
 *
 * const result = {
 *   envelope: { kind: 'repository' as const, event: 'push' }, ran: ['labels'], skipped: [], failed: [], durations: { labels: 12 },
 *   findings: [{ feature: 'labels', rule: 'labels.prune', level: 'warning' as const, message: 'Would delete "wontfix".' }], changes: [], facts: [],
 * }
 * featureRuns(result, 'push')[0]?.properties.findings_warning // => 1
 * ```
 *
 * @param result - What the run did.
 * @param githubEvent - The GitHub event name.
 * @returns The events, in reporting order.
 */
export const featureRuns = (result: RunResult, githubEvent: string): ReadonlyArray<AnalyticsEvent<'feature run'>> => {
  const failed = new Set(result.failed.map((failure) => failure.feature))
  const considered = [
    ...[...result.ran, ...failed].map((feature) => ({ feature, skipped: undefined })),
    ...result.skipped.map((skip) => ({ feature: skip.feature, skipped: skipReason(skip.reason) })),
  ]
  return considered.map(({ feature, skipped }) => {
    const findings = result.findings.filter((finding) => finding.feature === feature)
    const level = (name: Finding['level']) => findings.filter((finding) => finding.level === name).length
    const rules = byRule(findings)
    return {
      event: 'feature run',
      properties: {
        feature,
        outcome: skipped !== undefined ? 'skipped' : failed.has(feature) ? 'failure' : 'success',
        ...(skipped === undefined ? {} : { skip_reason: skipped }),
        event_kind: result.envelope.kind,
        github_event: eventName(githubEvent),
        findings: findings.length,
        findings_error: level('error'),
        findings_warning: level('warning'),
        findings_notice: level('notice'),
        findings_by_rule: rules,
        rules: Object.keys(rules).sort(),
        changes: result.changes.filter((change) => change.feature === feature).length,
        duration_ms: result.durations[feature] ?? 0,
      },
    }
  })
}

/**
 * The events for what features measured during a run: `sync proposed` and
 * `settings applied`. A measurement that does not match its schema is
 * dropped rather than sent.
 *
 * @example
 * ```ts import.meta.vitest name="measuredEvents"
 * import { measuredEvents } from '@resnovas/runtime'
 *
 * const facts = [{ feature: 'sync', name: 'sync proposed', values: { created: 1, updated: 0, mode: 0, conflicts: 0, pull_request: 'created' } }]
 * measuredEvents(facts)[0]?.event // => 'sync proposed'
 * ```
 *
 * @param facts - The run's measurements.
 * @returns The events.
 */
export const measuredEvents = (
  facts: RunResult['facts'],
): ReadonlyArray<AnalyticsEvent<'sync proposed' | 'settings applied'>> =>
  facts.flatMap((fact): ReadonlyArray<AnalyticsEvent<'sync proposed' | 'settings applied'>> => {
    if (fact.name === 'sync proposed')
      return Option.match(Schema.decodeUnknownOption(SyncProposed)(fact.values), {
        onNone: () => [],
        onSome: (properties) => [{ event: 'sync proposed', properties }],
      })
    if (fact.name === 'settings applied')
      return Option.match(Schema.decodeUnknownOption(SettingsApplied)(fact.values), {
        onNone: () => [],
        onSome: (properties) => [{ event: 'settings applied', properties }],
      })
    return []
  })

// Properties are checked against the event's schema before they are sent.
const send = (event: AnalyticsEvent): Effect.Effect<void> =>
  Schema.is(Schema.asSchema(ANALYTICS_EVENTS[event.event]))(event.properties)
    ? emit(event.event, event.properties)
    : Effect.logDebug(`analytics: ${event.event} did not match its schema and was not sent`)

/**
 * Sends the analytics for a resolved config: `config resolved`, and the
 * organisation's `features_enabled` and `uses_house_preset`.
 *
 * @example
 * ```ts import.meta.vitest name="recordConfig"
 * import { Effect } from 'effect'
 * import { recordConfig } from '@resnovas/runtime'
 *
 * // Outside an invocation, with no telemetry, nothing is sent.
 * Effect.runSync(recordConfig({ config: { version: 2 }, sources: ['smartcloud.yml'], locked: new Set(), warnings: [] }, 'version: 2\n'))
 * ```
 *
 * @param resolved - The resolved config.
 * @param text - The repository's own config file.
 * @returns Nothing; sending never fails the caller.
 */
export const recordConfig = (resolved: ResolvedConfig, text: string): Effect.Effect<void> => {
  const event = configResolved(resolved, text)
  return Effect.zipRight(
    send(event),
    describeOrganization({
      features_enabled: event.properties.features_enabled,
      uses_house_preset: event.properties.presets.includes('house'),
    }),
  )
}

/**
 * Sends the analytics for a run: a `feature run` for each feature, and what
 * the features measured.
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { recordRun, runEvent } from '@resnovas/runtime'
 *
 * const recorded = Effect.tap(runEvent({ config: {}, event: { name: 'push', payload: {} } }), (outcome) => recordRun(outcome.result, 'push'))
 * ```
 *
 * @param result - What the run did.
 * @param githubEvent - The GitHub event name.
 * @returns Nothing; sending never fails the caller.
 */
export const recordRun = (result: RunResult, githubEvent: string): Effect.Effect<void> =>
  Effect.forEach([...featureRuns(result, githubEvent), ...measuredEvents(result.facts)], send, { discard: true })

/** What a surface says about one invocation. */
export interface CommandOptions {
  /** The command, tool or `run` for the action. */
  readonly command: string
  /** The names of the options or inputs given, never their values. */
  readonly options?: ReadonlyArray<string> | undefined
}

/**
 * Records one whole invocation of a surface: a span around it, a
 * `command run` event when it ends, and any failure or defect in error
 * tracking.
 *
 * @remarks
 * Every surface wraps each action run, CLI command and MCP tool call in
 * this, so a failure anywhere, even before a repository is read, is
 * reported. Without the `Telemetry` service the effect runs unchanged.
 *
 * @example
 * ```ts import.meta.vitest name="command"
 * import { Effect } from 'effect'
 * import { command } from '@resnovas/runtime'
 *
 * await Effect.runPromise(command(Effect.succeed(1), { command: 'validate' })) // => 1
 * ```
 *
 * @param effect - The invocation.
 * @param options - The command and the option names given.
 * @returns The invocation, recorded.
 */
export const command = <A, E, R>(effect: Effect.Effect<A, E, R>, options: CommandOptions): Effect.Effect<A, E, R> =>
  invocation(effect, {
    command: options.command,
    options: options.options,
    completed: (summary): TelemetryEvent => commandRun(summary),
  })

/**
 * The names of the options that were given, from a record of parsed
 * options: those that are neither `undefined` nor an empty `Option`.
 *
 * @example
 * ```ts import.meta.vitest name="optionNames"
 * import { Option } from 'effect'
 * import { optionNames } from '@resnovas/runtime'
 *
 * optionNames({ repo: 'Acme/x', config: Option.none(), pr: Option.some(7), issue: undefined }).join(',') // => 'pr,repo'
 * ```
 *
 * @param options - The parsed options.
 * @returns The names, sorted.
 */
export const optionNames = (options: Readonly<Record<string, unknown>>): ReadonlyArray<string> =>
  Object.entries(options)
    .filter(([, value]) => value !== undefined && !(Option.isOption(value) && Option.isNone(value)))
    .map(([name]) => name)
    .sort()
