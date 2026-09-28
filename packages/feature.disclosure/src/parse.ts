/**
 * @file packages/feature.disclosure/src/parse.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
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

import type { SmartcloudConfig } from '@resnovas/config'

/**
 * The autonomy levels AI_POLICY.md defines, from least to most autonomous.
 *
 * @example
 * ```ts import.meta.vitest name="LEVELS"
 * import { LEVELS } from '@resnovas/feature.disclosure'
 *
 * LEVELS.indexOf('agent') > LEVELS.indexOf('chat') // => true
 * ```
 */
export const LEVELS = ['unassisted', 'autocomplete', 'chat', 'agent', 'autonomous'] as const

/** An autonomy level from AI_POLICY.md. */
export type AiLevel = (typeof LEVELS)[number]

// The level was called `none` before GitHub issue forms rejected that word
// as an option, so an older description still parses.
const LEGACY_LEVELS: Readonly<Record<string, AiLevel>> = { none: 'unassisted' }

/** The labels of the disclosure fields, as they appear before the colon. */
export interface DisclosureLabels {
  readonly level: string
  readonly tools: string
  readonly accountable: string
  readonly review: string
}

/** The AI disclosure read from a pull request description. Absent fields are empty. */
export interface Disclosure {
  /** The level as written, lower-cased; it may not be a valid level. */
  readonly level?: string
  readonly tools?: string
  readonly accountable?: string
  readonly review?: string
}

/**
 * The labels the Resnovas pull request template uses.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_LABELS"
 * import { DEFAULT_LABELS } from '@resnovas/feature.disclosure'
 *
 * DEFAULT_LABELS.level // => 'AI level'
 * ```
 */
export const DEFAULT_LABELS: DisclosureLabels = {
  level: 'AI level',
  tools: 'AI tools',
  accountable: 'Accountable human',
  review: 'Human review',
}

/**
 * The disclosure labels, with any the config renames.
 *
 * @example
 * ```ts import.meta.vitest name="disclosureLabels"
 * import { disclosureLabels } from '@resnovas/feature.disclosure'
 *
 * disclosureLabels({ level: 'Autonomy' }).level // => 'Autonomy'
 * disclosureLabels(undefined).tools // => 'AI tools'
 * ```
 *
 * @param fields - The config's `disclosure.fields`.
 * @returns Every label, defaulted.
 */
export const disclosureLabels = (fields: NonNullable<SmartcloudConfig['disclosure']>['fields']): DisclosureLabels => ({
  level: fields?.level ?? DEFAULT_LABELS.level,
  tools: fields?.tools ?? DEFAULT_LABELS.tools,
  accountable: fields?.accountable ?? DEFAULT_LABELS.accountable,
  review: fields?.review ?? DEFAULT_LABELS.review,
})

/**
 * Removes HTML comments from a pull request description.
 *
 * @remarks
 * The description is contributor-controlled, so this scans with `indexOf`
 * rather than a lazy regular expression, which is linear whatever the input
 * (CodeQL js/polynomial-redos). An unclosed comment hides the rest of the
 * text, as it does when GitHub renders the description.
 *
 * @example
 * ```ts import.meta.vitest name="stripHtmlComments"
 * import { stripHtmlComments } from '@resnovas/feature.disclosure'
 *
 * stripHtmlComments('a<!-- hint -->b') // => 'ab'
 * stripHtmlComments('a<!-- unclosed b') // => 'a'
 * ```
 *
 * @param text - The description.
 * @returns The text outside comments.
 */
export const stripHtmlComments = (text: string): string => {
  let result = ''
  let from = 0
  let open = text.indexOf('<!--', from)
  while (open !== -1) {
    result += text.slice(from, open)
    const close = text.indexOf('-->', open + 4)
    if (close === -1) return result
    from = close + 3
    open = text.indexOf('<!--', from)
  }
  return result + text.slice(from)
}

// A label is compared as a literal prefix rather than built into a regular
// expression, so a label with regex metacharacters means what it says.
const readField = (lines: ReadonlyArray<string>, label: string): string | undefined => {
  const wanted = label.toLowerCase()
  for (const line of lines) {
    const trimmed = line.trimStart()
    if (trimmed.slice(0, label.length).toLowerCase() === wanted && trimmed.charAt(label.length) === ':') {
      // The first line with the label decides, filled in or not.
      const value = trimmed
        .slice(label.length + 1)
        .replaceAll('`', '')
        .trim()
      return value === '' ? undefined : value
    }
  }
  return undefined
}

/**
 * Reads the AI disclosure fields from a pull request description.
 *
 * @remarks
 * HTML comments are removed first, so the guidance inside the template is
 * never read as an answer. Each field is the first line starting with its
 * label and a colon, ignoring case and leading whitespace; backticks are
 * dropped from the value. The level's former name `none` reads as
 * `unassisted`.
 *
 * @example
 * ```ts import.meta.vitest name="parseDisclosure"
 * import { parseDisclosure } from '@resnovas/feature.disclosure'
 *
 * const disclosure = parseDisclosure('AI level: Agent\nAI tools: Claude Code')
 * disclosure.level // => 'agent'
 * disclosure.tools // => 'Claude Code'
 * parseDisclosure('AI level: none').level // => 'unassisted'
 * ```
 *
 * @param body - The pull request description.
 * @param labels - The field labels; the template's by default.
 * @returns The fields that are filled in.
 */
export const parseDisclosure = (body: string, labels: DisclosureLabels = DEFAULT_LABELS): Disclosure => {
  const lines = stripHtmlComments(body).split('\n')
  const written = readField(lines, labels.level)?.toLowerCase()
  const level = written === undefined ? undefined : (LEGACY_LEVELS[written] ?? written)
  const tools = readField(lines, labels.tools)
  const accountable = readField(lines, labels.accountable)
  const review = readField(lines, labels.review)
  return {
    ...(level === undefined ? {} : { level }),
    ...(tools === undefined ? {} : { tools }),
    ...(accountable === undefined ? {} : { accountable }),
    ...(review === undefined ? {} : { review }),
  }
}

/**
 * Whether a disclosed level is one AI_POLICY.md defines.
 *
 * @example
 * ```ts import.meta.vitest name="isLevel"
 * import { isLevel } from '@resnovas/feature.disclosure'
 *
 * isLevel('agent') // => true
 * isLevel('robot') // => false
 * ```
 *
 * @param level - The level as read.
 * @returns True for a valid level.
 */
export const isLevel = (level: string): level is AiLevel => LEVELS.some((known) => known === level)
