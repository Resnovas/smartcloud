/**
 * @file packages/config/src/schema.ts
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

import { ConditionGroup } from '@resnovas/conditions'
import { Schema } from 'effect'
import { ExtendsEntry } from './extends.js'
import {
  AutoMerge,
  Backport,
  Branches,
  CodeOwners,
  Commands,
  Commits,
  Disclosure,
  Freeze,
  Links,
  Lock,
  Notifications,
  Required,
  Reviews,
  Roles,
  Settings,
  Stale,
  Sync,
} from './sections.js'

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

const HexColor = Schema.String.pipe(
  Schema.pattern(/^#?[0-9a-fA-F]{6}$/),
  Schema.annotations({ description: 'Six hex digits, for example 0E8A16.' }),
)

// YAML and JSON read an unquoted all-digit colour such as 000123 as the number
// 123, losing the leading zeros. A whole number below 1000000 is padded back
// to six digits; any other number cannot be told apart from a typo.
const NumericColor = Schema.transform(
  Schema.Number.pipe(
    Schema.filter(
      (value) =>
        (Number.isInteger(value) && value >= 0 && value < 1_000_000) ||
        `the number ${String(value)} is not a colour: write the colour in quotes, for example color: '0e8a16'`,
      { jsonSchema: { type: 'integer', minimum: 0, maximum: 999_999 } },
    ),
  ),
  HexColor,
  {
    strict: true,
    decode: (value) => String(value).padStart(6, '0'),
    // Never reached: HexColor, first in the union, encodes every colour.
    encode: Number,
  },
)

/**
 * A label colour: six hexadecimal digits, with or without a leading `#`. A
 * whole number from 0 to 999999, which is what YAML makes of an unquoted
 * all-digit colour, is read back as its six digits, zero padded.
 *
 * @example
 * ```ts import.meta.vitest name="Color"
 * import { Color } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Color)('#0E8A16') // => true
 * Schema.is(Color)('green') // => false
 * Schema.decodeUnknownSync(Color)(123) // => '000123'
 * ```
 */
export const Color = Schema.Union(HexColor, NumericColor).annotations({
  identifier: 'Color',
  description:
    'Six hex digits, for example 0E8A16, with or without a leading #. An unquoted all-digit colour such as 000123 is read as a number and padded back to six digits.',
})

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
 * The line counts at which a pull request stops being one size and becomes
 * the next, used when `sizeLabels.thresholds` leaves a size out.
 *
 * @remarks
 * A pull request of fewer than `s` changed lines is XS, fewer than `m` is S,
 * and so on; `xl` lines or more is XL. Changed lines are additions plus
 * deletions.
 *
 * @example
 * ```ts import.meta.vitest name="SIZE_THRESHOLDS"
 * import { SIZE_THRESHOLDS } from '@resnovas/config'
 *
 * SIZE_THRESHOLDS.m // => 100
 * ```
 */
export const SIZE_THRESHOLDS = { s: 10, m: 100, l: 500, xl: 1000 } as const

/** The size thresholds, every one filled in. */
export interface SizeThresholds {
  readonly s: number
  readonly m: number
  readonly l: number
  readonly xl: number
}

/**
 * The thresholds a `sizeLabels` section asks for, with the defaults filled in.
 *
 * @example
 * ```ts import.meta.vitest name="sizeThresholds"
 * import { sizeThresholds } from '@resnovas/config'
 *
 * sizeThresholds({ thresholds: { xl: 2000 } }).xl // => 2000
 * sizeThresholds({}).s // => 10
 * ```
 *
 * @param section - The `sizeLabels` section.
 * @returns Every threshold.
 */
export const sizeThresholds = (section: { readonly thresholds?: Partial<SizeThresholds> }): SizeThresholds => ({
  ...SIZE_THRESHOLDS,
  ...section.thresholds,
})

const threshold = (size: keyof SizeThresholds) =>
  Schema.optionalWith(
    Schema.Int.pipe(
      Schema.positive(),
      Schema.annotations({
        description: `The fewest lines added plus deleted that make a pull request Size: ${size.toUpperCase()}. Defaults to ${SIZE_THRESHOLDS[size]}.`,
      }),
    ),
    { exact: true },
  )

/**
 * The built-in XS to XL size labels, applied to pull requests by how many
 * lines they change.
 *
 * @remarks
 * Each threshold is the first changed-line count of that size, so XS runs
 * from 0 to `s - 1` lines and XL from `xl` up. Sizes left out keep
 * {@link SIZE_THRESHOLDS}, and the thresholds must rise from `s` to `xl`.
 *
 * @example
 * ```ts import.meta.vitest name="SizeLabels"
 * import { SizeLabels } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(SizeLabels)({ thresholds: { s: 20 } }) // => true
 * Schema.is(SizeLabels)({ thresholds: { m: 5 } }) // => false
 * ```
 */
export const SizeLabels = Schema.Struct({
  /** The first changed-line count of each size above XS. */
  thresholds: Schema.optionalWith(
    Schema.Struct({ s: threshold('s'), m: threshold('m'), l: threshold('l'), xl: threshold('xl') }).annotations({
      description:
        'The first line count of each size above XS. Sizes left out keep their defaults; the thresholds must rise from s to xl.',
    }),
    { exact: true },
  ),
}).pipe(
  Schema.filter(
    (section) => {
      const { s, m, l, xl } = sizeThresholds(section)
      return (
        (s < m && m < l && l < xl) || `size thresholds must rise from s to xl, got s ${s}, m ${m}, l ${l}, xl ${xl}`
      )
    },
    // JSON Schema cannot compare values, so editors only check the shape.
    { jsonSchema: {} },
  ),
  Schema.annotations({
    identifier: 'SizeLabels',
    description:
      'Built-in Size: XS to Size: XL labels, applied to pull requests by lines added plus deleted. Thresholds are the first line count of each size.',
  }),
)
/** A decoded {@link SizeLabels}. */
export type SizeLabels = typeof SizeLabels.Type

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
 * The failure a {@link ConventionRule} reports when it has neither a preset
 * nor conditions.
 *
 * @internal
 * @remarks
 * A local tweak of a preset's rule, such as a new `level`, has neither when the
 * preset is left out, so resolveConfig treats this failure as incomplete.
 */
export const conventionNeedsPresetOrWhen = 'a convention needs a preset or when'

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
  Schema.filter((rule) => rule.preset !== undefined || rule.when !== undefined || conventionNeedsPresetOrWhen, {
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
 * not run. Unknown keys are an error here and in the JSON Schema, so an
 * editor or `smartcloud validate` flags a typo in a section name; a run drops
 * them with a warning instead (see resolveConfig).
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
  sizeLabels: Schema.optionalWith(SizeLabels, { exact: true }),
  conventions: Schema.optionalWith(Conventions, { exact: true }),
  roles: Schema.optionalWith(Roles, { exact: true }),
  links: Schema.optionalWith(Links, { exact: true }),
  commits: Schema.optionalWith(Commits, { exact: true }),
  disclosure: Schema.optionalWith(Disclosure, { exact: true }),
  reviews: Schema.optionalWith(Reviews, { exact: true }),
  required: Schema.optionalWith(Required, { exact: true }),
  freeze: Schema.optionalWith(Freeze, { exact: true }),
  branches: Schema.optionalWith(Branches, { exact: true }),
  codeowners: Schema.optionalWith(CodeOwners, { exact: true }),
  stale: Schema.optionalWith(Stale, { exact: true }),
  lock: Schema.optionalWith(Lock, { exact: true }),
  backport: Schema.optionalWith(Backport, { exact: true }),
  autoMerge: Schema.optionalWith(AutoMerge, { exact: true }),
  settings: Schema.optionalWith(Settings, { exact: true }),
  sync: Schema.optionalWith(Sync, { exact: true }),
  notifications: Schema.optionalWith(Notifications, { exact: true }),
  commands: Schema.optionalWith(Commands, { exact: true }),
}).annotations({
  identifier: 'SmartcloudConfig',
  title: 'smartcloud configuration',
  description: 'Declarative repository automation: labels, conventions and policy.',
})
/** A decoded {@link SmartcloudConfig}. */
export type SmartcloudConfig = typeof SmartcloudConfig.Type
