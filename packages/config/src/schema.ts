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

// Every rule is a keyed record, never a list, so presets and repositories
// merge by key and a locked rule can be named in an error.

/**
 * A key naming a label or rule: any non-empty text without leading or
 * trailing spaces. v1 configs use keys such as `claNot Required`.
 */
export const RuleId = Schema.NonEmptyTrimmedString.annotations({ identifier: 'RuleId', description: 'A label or rule key.' })

/** A label colour: six hexadecimal digits, with or without a leading `#`. */
export const Color = Schema.String.pipe(
  Schema.pattern(/^#?[0-9a-fA-F]{6}$/),
  Schema.annotations({ identifier: 'Color', description: 'Six hex digits, for example 0E8A16.' }),
)

/** Which kinds of subject a rule applies to. Omitted means both. */
export const Subjects = Schema.Array(Schema.Literal('pullRequest', 'issue')).annotations({
  identifier: 'Subjects',
  description: 'The subjects a rule applies to. Omitted means pull requests and issues.',
})

/** A repository label. */
export const Label = Schema.Struct({
  name: Schema.String,
  color: Color,
  description: Schema.optionalWith(Schema.String, { exact: true }),
  /** Earlier names, so a rename keeps the label on existing issues. */
  aliases: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
}).annotations({ identifier: 'Label' })
export type Label = typeof Label.Type

/** Applies a label while its conditions pass, and removes it when they stop. */
export const LabelRule = Schema.Struct({
  label: RuleId,
  on: Schema.optionalWith(Subjects, { exact: true }),
  when: ConditionGroup,
}).annotations({ identifier: 'LabelRule' })
export type LabelRule = typeof LabelRule.Type

/** A named convention preset, expanded into conditions by the conventions feature. */
export const ConventionPreset = Schema.Literal('conventionalCommits', 'semanticTitle', 'gitmojis', 'semanticEmoji')

/** A convention a subject must meet, from a preset, conditions, or both. */
export const ConventionRule = Schema.Struct({
  on: Schema.optionalWith(Subjects, { exact: true }),
  level: Schema.optionalWith(Schema.Literal('error', 'warning'), { exact: true }),
  message: Schema.optionalWith(Schema.String, { exact: true }),
  preset: Schema.optionalWith(ConventionPreset, { exact: true }),
  /** Scopes allowed by a title preset, such as `conventionalCommits`. */
  contexts: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  when: Schema.optionalWith(ConditionGroup, { exact: true }),
}).pipe(
  Schema.filter((rule) => rule.preset !== undefined || rule.when !== undefined || 'a convention needs a preset or when'),
  Schema.annotations({ identifier: 'ConventionRule' }),
)
export type ConventionRule = typeof ConventionRule.Type

/** Title and description conventions, and the comment that reports them. */
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
 * Feature sections are added by the feature that reads them. Unknown keys
 * are an error, so a typo in a section name fails at startup.
 */
export const SmartcloudConfig = Schema.Struct({
  $schema: Schema.optionalWith(Schema.String, { exact: true }),
  version: Schema.Literal(2),
  extends: Schema.optionalWith(Schema.Array(ExtendsEntry), { exact: true }),
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
}).annotations({
  identifier: 'SmartcloudConfig',
  title: 'smartcloud configuration',
  description: 'Declarative repository automation: labels, conventions and policy.',
})
export type SmartcloudConfig = typeof SmartcloudConfig.Type
