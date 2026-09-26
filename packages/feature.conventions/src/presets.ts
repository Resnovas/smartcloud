/**
 * @file packages/feature.conventions/src/presets.ts
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

import type { ConventionPreset } from '@resnovas/config'
import { gitmojis } from 'gitmojis'

/**
 * A convention preset's name, as written in a rule's `preset`.
 *
 * @remarks
 * The config schema's `ConventionPreset`, as a type.
 *
 * @example
 * ```ts
 * import type { Preset } from '@resnovas/feature.conventions'
 *
 * const preset: Preset = 'conventionalCommits'
 * ```
 */
export type Preset = typeof ConventionPreset.Type

/**
 * The types the `conventionalCommits` preset accepts.
 *
 * @remarks
 * The Conventional Commits types used by commitlint's conventional config.
 *
 * @example
 * ```ts import.meta.vitest name="CONVENTIONAL_TYPES"
 * import { CONVENTIONAL_TYPES } from '@resnovas/feature.conventions'
 *
 * CONVENTIONAL_TYPES.includes('feat') // => true
 * ```
 */
export const CONVENTIONAL_TYPES: ReadonlyArray<string> = [
  'feat',
  'fix',
  'perf',
  'refactor',
  'test',
  'docs',
  'chore',
  'build',
  'ci',
  'style',
  'revert',
]

/**
 * The types v1's `semanticTitle` and `semanticEmoji` presets accept, in v1's
 * order.
 *
 * @remarks
 * Copied from v1's `semantic` list, so v1 titles keep passing.
 *
 * @example
 * ```ts import.meta.vitest name="SEMANTIC_TYPES"
 * import { SEMANTIC_TYPES } from '@resnovas/feature.conventions'
 *
 * SEMANTIC_TYPES.includes('bug') // => true
 * ```
 */
export const SEMANTIC_TYPES: ReadonlyArray<string> = [
  'bug',
  'chore',
  'opt',
  'optimisation',
  'style',
  'maint',
  'maintenance',
  'ref',
  'refactor',
  'revert',
  'dep',
  'deprecated',
  'removal',
  'docs',
  'documentation',
  'feat',
  'enhance',
  'feature',
  'enhancement',
  'fix',
]

// v1 compiled each preset into a list of `/.../i` title patterns and passed
// when enough of them matched. Several of those patterns (`.*x.*\):`) can
// backtrack polynomially on hostile titles, so each one is reproduced here as
// a linear scan with the same accepted set. The only regular expressions left
// are escaped literals, which cannot backtrack.

const LINE_BREAK = /[\n\r\u2028\u2029]/

// v1's patterns had no `m` flag and used `.`, which stops at a line
// terminator, so anything anchored with `^` is confined to the first line.
const firstLine = (text: string): string => {
  const found = LINE_BREAK.exec(text)
  return found === null ? text : text.slice(0, found.index)
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

interface Literal {
  /** Whether the literal occurs exactly at `index`. */
  readonly at: (text: string, index: number) => boolean
  /** The first index at or after `index` where the literal occurs, or -1. */
  readonly from: (text: string, index: number) => number
}

// Case-insensitive without the `u` flag, the same case folding v1's `/.../i`
// patterns used, which never changes a match's length.
const literal = (word: string): Literal => {
  const sticky = new RegExp(escape(word), 'iy')
  const global = new RegExp(escape(word), 'ig')
  return {
    at: (text, index) => {
      sticky.lastIndex = index
      return sticky.test(text)
    },
    from: (text, index) => {
      global.lastIndex = index
      return global.exec(text)?.index ?? -1
    },
  }
}

type Check = (title: string) => boolean

// The tail `(\(.*\))?:` once a word has matched on a line: a colon straight
// away, or an opening parenthesis with `):` somewhere after it.
const scopeThenColon = (line: string, end: number) =>
  line[end] === ':' || (line[end] === '(' && line.indexOf('):', end + 1) !== -1)

// v1's `/^word(\(.*\))?:/i`.
const startsWithType = (word: string): Check => {
  const found = literal(word)
  return (title) => {
    const line = firstLine(title)
    return found.at(line, 0) && scopeThenColon(line, word.length)
  }
}

// v1's `/^word.*(\(.*\))?:/i`. The `.*` makes the optional group redundant:
// any colon after the word on the first line matches.
const startsWithThenColon = (word: string): Check => {
  const found = literal(word)
  return (title) => {
    const line = firstLine(title)
    return found.at(line, 0) && line.indexOf(':', word.length) !== -1
  }
}

// v1's `/^.*word(\(.*\))?:/i`: the word anywhere on the first line, followed
// by a colon, or by a parenthesis with `):` later on the line.
const containsType = (word: string): Check => {
  const found = literal(word)
  return (title) => {
    const line = firstLine(title)
    const closing = line.lastIndexOf('):')
    for (let index = found.from(line, 0); index !== -1; index = found.from(line, index + 1)) {
      const end = index + word.length
      if (line[end] === ':' || (line[end] === '(' && closing > end)) return true
    }
    return false
  }
}

// v1's `/\(.*context.*\):/i`: on any one line, a parenthesis, then the
// context, then `):`. Taking the earliest of each finds a match whenever one
// exists, because every later choice only leaves less room for the next.
const inParentheses = (context: string): Check => {
  const found = literal(context)
  return (title) =>
    title.split(LINE_BREAK).some((line) => {
      const open = line.indexOf('(')
      if (open === -1) return false
      const at = found.from(line, open + 1)
      return at !== -1 && line.indexOf('):', at + context.length) !== -1
    })
}

interface Spec {
  readonly checks: ReadonlyArray<Check>
  readonly requires: number
}

const passes = (spec: Spec, title: string) => {
  let matched = 0
  for (const check of spec.checks) {
    if (check(title)) matched += 1
    if (matched >= spec.requires) return true
  }
  return false
}

const gitmojiForms = gitmojis.flatMap((gitmoji): ReadonlyArray<string> => [gitmoji.emoji, gitmoji.code, gitmoji.entity])

// v1 added one check per context and raised `requires` by one, so any two
// (or, for semanticEmoji, three) checks passing was enough.
const spec = (preset: Exclude<Preset, 'conventionalCommits'>, contexts: ReadonlyArray<string>): Spec => {
  const extra = contexts.length > 0 ? 1 : 0
  const scoped = contexts.map(inParentheses)
  switch (preset) {
    case 'semanticTitle':
      return { checks: [...SEMANTIC_TYPES.map(startsWithType), ...scoped], requires: 1 + extra }
    case 'gitmojis':
      return { checks: [...gitmojiForms.map(startsWithType), ...scoped], requires: 1 + extra }
    case 'semanticEmoji':
      return {
        checks: [...gitmojiForms.map(startsWithThenColon), ...SEMANTIC_TYPES.map(containsType), ...scoped],
        requires: 2 + extra,
      }
  }
}

// Anchored, with a single quantifier bounded by a character it excludes, so
// matching is linear in the title's length.
const CONVENTIONAL = new RegExp(`^(?:${CONVENTIONAL_TYPES.join('|')})(?:\\(([^()\\r\\n]+)\\))?!?: \\S`)

const conventional = (title: string, contexts: ReadonlyArray<string>) => {
  const found = CONVENTIONAL.exec(title)
  if (found === null) return false
  const scope = found[1]
  return scope === undefined || contexts.length === 0 || contexts.includes(scope)
}

/**
 * Whether a title meets a convention preset.
 *
 * @remarks
 * `conventionalCommits` accepts `type(scope)!: description`, with the scope
 * and `!` optional and the type one of {@link CONVENTIONAL_TYPES}; non-empty
 * `contexts` restrict the scope, when there is one, to those names.
 *
 * `semanticTitle`, `gitmojis` and `semanticEmoji` accept exactly the titles
 * v1 accepted, including v1's counting: v1 turned each type, gitmoji and
 * context into a title pattern and passed when at least one (semanticEmoji:
 * two) matched, or one more than that when `contexts` were given. A context
 * matches when it appears between a `(` and a later `):` on one line.
 *
 * @example
 * ```ts import.meta.vitest name="matchesPreset"
 * import { matchesPreset } from '@resnovas/feature.conventions'
 *
 * matchesPreset('conventionalCommits', 'feat(labels): sync labels', ['labels']) // => true
 * matchesPreset('semanticTitle', 'fix: typo') // => true
 * ```
 *
 * @param preset - The preset.
 * @param title - The pull request or issue title.
 * @param contexts - The rule's `contexts`, if any.
 * @returns Whether the title meets the preset.
 */
export const matchesPreset = (preset: Preset, title: string, contexts: ReadonlyArray<string> = []): boolean =>
  preset === 'conventionalCommits' ? conventional(title, contexts) : passes(spec(preset, contexts), title)

const list = (items: ReadonlyArray<string>) => items.join(', ')

const contextsLine = (contexts: ReadonlyArray<string>, text: string) =>
  contexts.length > 0 ? [`${text}: ${list(contexts)}.`] : []

const CONVENTIONAL_LINK = 'For more information, see https://www.conventionalcommits.org/en/v1.0.0/'
// The full gitmoji list is too long for an annotation or comment, so messages link to it.
const GITMOJI_LINK = 'The gitmojis are listed at https://gitmoji.dev/'

/**
 * Explains what a convention preset expects of a title.
 *
 * @remarks
 * The conventions feature uses this as a failing rule's message when the
 * rule sets none; the docs and the CLI use it to describe presets.
 *
 * @example
 * ```ts import.meta.vitest name="presetDescription"
 * import { presetDescription } from '@resnovas/feature.conventions'
 *
 * presetDescription('conventionalCommits', ['labels']).startsWith('Title it as a conventional commit') // => true
 * ```
 *
 * @param preset - The preset.
 * @param contexts - The rule's `contexts`, if any.
 * @returns A plain-text explanation, lines separated by `\n`.
 */
export const presetDescription = (preset: Preset, contexts: ReadonlyArray<string> = []): string => {
  switch (preset) {
    case 'conventionalCommits':
      return [
        'Title it as a conventional commit, `type(scope)!: description`, where the scope and `!` are optional.',
        `Types: ${list(CONVENTIONAL_TYPES)}.`,
        ...contextsLine(contexts, 'Scopes, when given'),
        CONVENTIONAL_LINK,
      ].join('\n')
    case 'semanticTitle':
      return [
        'Start the title with a semantic type, optionally followed by a scope in parentheses, then a colon, for example `feat(scope): description`.',
        `Types: ${list(SEMANTIC_TYPES)}.`,
        ...contextsLine(contexts, 'Name one of these contexts in parentheses'),
        CONVENTIONAL_LINK,
      ].join('\n')
    case 'gitmojis':
      return [
        'Start the title with a gitmoji (the emoji, its code or its HTML entity), optionally followed by a scope in parentheses, then a colon, for example `:bug:(scope): description`.',
        ...contextsLine(contexts, 'Name one of these contexts in parentheses'),
        GITMOJI_LINK,
      ].join('\n')
    case 'semanticEmoji':
      return [
        'Start the title with a gitmoji, then a semantic type, optionally followed by a scope in parentheses, then a colon, for example `:bug: fix(scope): description`.',
        `Types: ${list(SEMANTIC_TYPES)}.`,
        ...contextsLine(contexts, 'Name one of these contexts in parentheses'),
        CONVENTIONAL_LINK,
        GITMOJI_LINK,
      ].join('\n')
  }
}
