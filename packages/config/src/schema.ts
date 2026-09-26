/**
 * @file packages/config/src/schema.ts
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

import { ConditionGroup } from '@resnovas/conditions'
import { Schema } from 'effect'
import { ExtendsEntry } from './extends.js'
import { Commits, Disclosure, Links, Reviews, Roles, Settings, Stale, Sync } from './sections.js'

// Every rule is a keyed record, never a list, so presets and repositories
// merge by key and a locked rule can be named in an error.

/**
 * A key naming a label or rule: any non-empty text without leading or
 * trailing spaces. v1 configs use keys such as `claNot Required`.
 *
 * @example
 * ```ts import.meta.vitest name="RuleId"
 * import { RuleId } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(RuleId)('claNot Required') // => true
 * Schema.is(RuleId)('__proto__') // => false
 * ```
 */
export const RuleId = Schema.NonEmptyTrimmedString.pipe(
  // JavaScript treats an object key of __proto__ as the prototype, so a rule
  // with that key would vanish without a word. It is rejected instead.
  Schema.filter((key) => key !== '__proto__' || 'the key __proto__ is reserved; choose another name', {
    jsonSchema: { not: { const: '__proto__' } },
  }),
  Schema.annotations({ identifier: 'RuleId', description: 'A label or rule key.' }),
)

/**
 * A label colour: six hexadecimal digits, with or without a leading `#`.
 *
 * @example
 * ```ts import.meta.vitest name="Color"
 * import { Color } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Color)('#0E8A16') // => true
 * Schema.is(Color)('green') // => false
 * ```
 */
export const Color = Schema.String.pipe(
  Schema.pattern(/^#?[0-9a-fA-F]{6}$/),
  Schema.annotations({ identifier: 'Color', description: 'Six hex digits, for example 0E8A16.' }),
)

/**
 * Which kinds of subject a rule applies to. Omitted means both.
 *
 * @example
 * ```ts import.meta.vitest name="Subjects"
 * import { Subjects } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Subjects)(['pullRequest', 'issue']) // => true
 * Schema.is(Subjects)(['discussion']) // => false
 * ```
 */
export const Subjects = Schema.Array(Schema.Literal('pullRequest', 'issue')).annotations({
  identifier: 'Subjects',
  description: 'The subjects a rule applies to. Omitted means pull requests and issues.',
})

/**
 * A repository label.
 *
 * @example
 * ```ts import.meta.vitest name="Label"
 * import { Label } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Label)({ name: 'bug', color: 'd73a4a', aliases: ['defect'] }) // => true
 * Schema.is(Label)({ name: 'bug', color: 'red' }) // => false
 * ```
 */
export const Label = Schema.Struct({
  name: Schema.String,
  color: Color,
  description: Schema.optionalWith(Schema.String, { exact: true }),
  /** Earlier names, so a rename keeps the label on existing issues. */
  aliases: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
}).annotations({ identifier: 'Label' })
/** A decoded {@link Label}. */
export type Label = typeof Label.Type

/**
 * Applies a label while its conditions pass, and removes it when they stop.
 *
 * @example
 * ```ts import.meta.vitest name="LabelRule"
 * import { LabelRule } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(LabelRule)({ label: 'bug', when: { condition: [{ type: 'titleMatches', condition: '^fix' }] } }) // => true
 * Schema.is(LabelRule)({ label: 'bug' }) // => false
 * ```
 */
export const LabelRule = Schema.Struct({
  label: RuleId,
  on: Schema.optionalWith(Subjects, { exact: true }),
  when: ConditionGroup,
}).annotations({ identifier: 'LabelRule' })
/** A decoded {@link LabelRule}. */
export type LabelRule = typeof LabelRule.Type

/**
 * A named convention preset, expanded into conditions by the conventions feature.
 *
 * @example
 * ```ts import.meta.vitest name="ConventionPreset"
 * import { ConventionPreset } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(ConventionPreset)('conventionalCommits') // => true
 * Schema.is(ConventionPreset)('angular') // => false
 * ```
 */
export const ConventionPreset = Schema.Literal('conventionalCommits', 'semanticTitle', 'gitmojis', 'semanticEmoji')

/**
 * A convention a subject must meet, from a preset, conditions, or both.
 *
 * @example
 * ```ts import.meta.vitest name="ConventionRule"
 * import { ConventionRule } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(ConventionRule)({ preset: 'conventionalCommits', level: 'error' }) // => true
 * Schema.is(ConventionRule)({ level: 'error' }) // => false
 * ```
 */
export const ConventionRule = Schema.Struct({
  on: Schema.optionalWith(Subjects, { exact: true }),
  level: Schema.optionalWith(Schema.Literal('error', 'warning'), { exact: true }),
  message: Schema.optionalWith(Schema.String, { exact: true }),
  preset: Schema.optionalWith(ConventionPreset, { exact: true }),
  /** Scopes allowed by a title preset, such as `conventionalCommits`. */
  contexts: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  when: Schema.optionalWith(ConditionGroup, { exact: true }),
}).pipe(
  Schema.filter((rule) => rule.preset !== undefined || rule.when !== undefined || 'a convention needs a preset or when', {
    // Wrapped in allOf so Effect merges it with the struct's properties
    // rather than replacing them.
    jsonSchema: { allOf: [{ anyOf: [{ required: ['preset'] }, { required: ['when'] }] }] },
  }),
  Schema.annotations({ identifier: 'ConventionRule' }),
)
/** A decoded {@link ConventionRule}. */
export type ConventionRule = typeof ConventionRule.Type

/**
 * Title and description conventions, and the comment that reports them.
 *
 * @example
 * ```ts import.meta.vitest name="Conventions"
 * import { Conventions } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Conventions)({ comment: { header: 'Conventions' }, rules: { title: { preset: 'semanticTitle' } } }) // => true
 * Schema.is(Conventions)({ rules: [] }) // => false
 * ```
 */
export const Conventions = Schema.Struct({
  comment: Schema.optionalWith(
    Schema.Struct({
      header: Schema.optionalWith(Schema.String, { exact: true }),
      footer: Schema.optionalWith(Schema.String, { exact: true }),
    }),
    { exact: true },
  ),
  rules: Schema.optionalWith(Schema.Record({ key: RuleId, value: ConventionRule }), { exact: true }),
}).annotations({ identifier: 'Conventions' })

/**
 * A smartcloud v2 configuration, as written in `.github/smartcloud.yml`.
 *
 * @remarks
 * Every feature section is optional: a feature whose section is absent does
 * not run. Unknown keys are an error, so a typo in a section name fails at
 * startup.
 *
 * @example
 * ```ts import.meta.vitest name="SmartcloudConfig"
 * import { SmartcloudConfig } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(SmartcloudConfig)({ version: 2, labelSync: { prune: true } }) // => true
 * Schema.is(SmartcloudConfig)({ version: 1 }) // => false
 * ```
 */
export const SmartcloudConfig = Schema.Struct({
  $schema: Schema.optionalWith(Schema.String, { exact: true }),
  version: Schema.Literal(2),
  extends: Schema.optionalWith(Schema.Array(ExtendsEntry), { exact: true }),
  /**
   * Set to `false` to stop smartcloud sending anonymous telemetry (hashed
   * usage events, logs, traces, metrics and errors) to PostHog. On by default.
   */
  telemetry: Schema.optionalWith(
    Schema.Boolean.annotations({
      description:
        'Set to false to stop smartcloud sending anonymous telemetry (hashed usage events, logs, traces, metrics and errors) to PostHog. On by default; turning it off is discouraged, because telemetry is how problems are found and fixed. The telemetry page of the documentation lists what is and is not collected.',
    }),
    { exact: true },
  ),
  labels: Schema.optionalWith(Schema.Record({ key: RuleId, value: Label }), { exact: true }),
  labelSync: Schema.optionalWith(
    Schema.Struct({
      /** Delete repository labels the config does not define. Off by default. */
      prune: Schema.optionalWith(Schema.Boolean, { exact: true }),
    }),
    { exact: true },
  ),
  labelling: Schema.optionalWith(Schema.Record({ key: RuleId, value: LabelRule }), { exact: true }),
  conventions: Schema.optionalWith(Conventions, { exact: true }),
  roles: Schema.optionalWith(Roles, { exact: true }),
  links: Schema.optionalWith(Links, { exact: true }),
  commits: Schema.optionalWith(Commits, { exact: true }),
  disclosure: Schema.optionalWith(Disclosure, { exact: true }),
  reviews: Schema.optionalWith(Reviews, { exact: true }),
  stale: Schema.optionalWith(Stale, { exact: true }),
  settings: Schema.optionalWith(Settings, { exact: true }),
  sync: Schema.optionalWith(Sync, { exact: true }),
}).annotations({
  identifier: 'SmartcloudConfig',
  title: 'smartcloud configuration',
  description: 'Declarative repository automation: labels, conventions and policy.',
})
/** A decoded {@link SmartcloudConfig}. */
export type SmartcloudConfig = typeof SmartcloudConfig.Type
