/**
 * @file packages/config/src/lenient.ts
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
import { Either, ParseResult, Schema, SchemaAST } from 'effect'
import { SmartcloudConfig } from './schema.js'

type Json = null | boolean | number | string | ReadonlyArray<Json> | { readonly [key: string]: Json }
type Path = ReadonlyArray<PropertyKey>

const isRecord = (value: unknown): value is Readonly<Record<string, Json>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const decodeV2 = Schema.decodeUnknownEither(SmartcloudConfig, { onExcessProperty: 'error', errors: 'all' })

// Dotted, as merge.ts writes locked paths: a dot or backslash inside a key is
// escaped, so the single key `a.b` reads `a\.b`.
const dotted = (path: Path): string => path.map((key) => String(key).replace(/[\\.]/g, '\\$&')).join('.')

// The schema of a key's value: a named field, else a record's entries.
const child = (ast: SchemaAST.AST, key: PropertyKey): SchemaAST.AST | undefined => {
  if (SchemaAST.isRefinement(ast)) return child(ast.from, key)
  if (!SchemaAST.isTypeLiteral(ast)) return undefined
  return ast.propertySignatures.find((field) => field.name === key)?.type ?? ast.indexSignatures[0]?.type
}

// Where a path enters a condition group, such as a rule's `when`, found
// through the schema so that a label or rule named `when` is not one.
const groupAt = (path: Path): number => {
  let ast = SmartcloudConfig.ast
  for (const [index, key] of path.entries()) {
    const next = child(ast, key)
    if (next === undefined) return -1
    if (next === ConditionGroup.ast) return index
    ast = next
  }
  return -1
}

// What goes when a value is invalid. A condition group is never left with
// part of its conditions, so a problem anywhere in one drops the whole group;
// a rule that needs it then goes for lacking it. A problem inside a list
// drops the whole list, never one item; a missing key drops the object that
// needs it; anything else drops the key.
const unitOf = (issue: ParseResult.ArrayFormatterIssue): Path => {
  const group = groupAt(issue.path)
  const owner = group === -1 ? issue.path : issue.path.slice(0, group + 1)
  const item = owner.findIndex((key) => typeof key === 'number')
  if (item !== -1) return owner.slice(0, item)
  return issue._tag === 'Missing' && owner.length === issue.path.length ? owner.slice(0, -1) : owner
}

// A union reports one issue per member, such as `Expected "default", actual
// "max"` for each literal; they read better as one. An unknown or missing key
// says more than a member that did not match, such as a condition's `$and`.
const describe = (
  issues: readonly [ParseResult.ArrayFormatterIssue, ...Array<ParseResult.ArrayFormatterIssue>],
): string => {
  const first = issues.find((issue) => issue._tag === 'Unexpected' || issue._tag === 'Missing') ?? issues[0]
  const at = dotted(first.path)
  if (first._tag === 'Missing' || first._tag === 'Unexpected') return `${at} ${first.message}`
  const alike = issues.filter((issue) => issue._tag === first._tag && dotted(issue.path) === at)
  const matches = alike.map((issue) => /^Expected (.*), actual (.*)$/s.exec(issue.message))
  const actual = matches[0]?.[2]
  if (alike.length === 1 || !matches.every((match) => match !== null && match[2] === actual))
    return `${at}: ${first.message}`
  return `${at}: Expected ${[...new Set(matches.map((match) => match?.[1]))].join(' | ')}, actual ${actual}`
}

const valueAt = (value: Json | undefined, path: Path): Json | undefined => {
  const [head, ...rest] = path
  if (head === undefined || value === undefined) return value
  return isRecord(value) && typeof head === 'string' && Object.hasOwn(value, head)
    ? valueAt(value[head], rest)
    : undefined
}

// Whether merging could still fix a problem: a missing key, or an object
// that fails as a whole, such as a convention with neither preset nor when,
// which a preset's rule of the same name may complete. A key this file had
// but that was dropped as invalid is not one: the file's own entry is broken,
// and waiting would leave a restricted run to drop the whole section for it.
const completable = (
  issue: ParseResult.ArrayFormatterIssue,
  value: Readonly<Record<string, Json>>,
  dropped: ReadonlyMap<string, Dropped>,
): boolean =>
  issue._tag === 'Missing'
    ? !dropped.has(dotted(issue.path))
    : issue._tag !== 'Unexpected' && isRecord(valueAt(value, issue.path))

// Removes the value at a path from a copy the caller owns, saying whether
// it was there. Keys come from config files, so they are read as own data,
// never through the prototype.
const remove = (value: Record<string, Json>, path: Path): boolean => {
  const [head, ...rest] = path
  // Absent when a problem further up the same object already dropped it.
  if (typeof head !== 'string' || !Object.hasOwn(value, head)) return false
  const child = value[head]
  if (rest.length === 0) return delete value[head]
  return isRecord(child) && remove(child, rest)
}

/**
 * A config with its invalid values taken out, and a warning for each.
 *
 * @internal
 */
export interface Lenient {
  readonly value: Readonly<Record<string, Json>>
  readonly warnings: ReadonlyArray<string>
  /** Each value taken out, in the order of `warnings`. */
  readonly dropped: ReadonlyArray<Dropped>
}

/**
 * One value taken out of a config.
 *
 * @internal
 */
export interface Dropped {
  readonly path: Path
  readonly warning: string
  /** The value was there but invalid, rather than a key this build does not know. */
  readonly invalid: boolean
}

// Paths whose values only tighten policy: dropping one, as a missing list of
// maintainers or required checks, would loosen it.
const RESTRICTIONS: ReadonlyArray<Path> = [
  ['roles', 'maintainers'],
  ['reviews', 'gate'],
  ['commits'],
  ['disclosure', 'requireDraft'],
  ['settings', 'security'],
  ['settings', 'ruleset'],
  // Actions hardening, such as the allow-list, SHA pinning and token permissions.
  ['settings', 'actions'],
  // A role of none revokes access, and a lower role reduces it, so dropping
  // either would leave more access in place.
  ['settings', 'collaborators'],
  ['settings', 'teams'],
  ['sync', 'check'],
]

const within = (inner: Path, outer: Path): boolean => outer.every((key, index) => inner[index] === key)

/**
 * Whether dropping the value at a path could loosen policy: the path is, is
 * inside, or holds one of the settings that only tighten it, such as
 * `roles.maintainers` or `settings.ruleset`.
 *
 * @internal
 *
 * @param path - The path of a dropped value.
 * @returns True when the path touches a restriction.
 */
export const isRestriction = (path: Path): boolean =>
  RESTRICTIONS.some((restriction) => within(path, restriction) || within(restriction, path))

/**
 * Takes out of a config every unknown key and every invalid value, so a
 * config written for a newer or older smartcloud still runs with the rest.
 *
 * @remarks
 * An unknown key or a value of the wrong type is dropped on its own. A
 * problem anywhere in a rule's `when` drops the whole `when`, and a problem
 * inside a list drops the whole list, so a rule never runs with part of its
 * conditions gone; a rule that needs its `when` then goes for lacking it. A
 * missing key drops the object that needs it, such as the `sync` section
 * without its `source`, and so does an object that fails as a whole, such as
 * a convention with neither `preset` nor `when`. With `keepIncomplete`, for a
 * file whose presets may still complete it, those two are left in place.
 *
 * @internal
 *
 * @param value - The config, as parsed.
 * @param source - The file it came from, which each warning names.
 * @param keepIncomplete - Leave what merging with presets may still complete.
 * @returns The config without its invalid values, and a warning for each one dropped.
 */
export const dropInvalid = (value: Readonly<Record<string, Json>>, source: string, keepIncomplete = false): Lenient => {
  const warnings: Array<string> = []
  const dropped = new Map<string, Dropped>()
  let current = value
  for (;;) {
    const decoded = decodeV2({ ...current, version: 2 })
    if (Either.isRight(decoded)) return { value: current, warnings, dropped: [...dropped.values()] }
    const units = new Map<
      string,
      { unit: Path; issues: [ParseResult.ArrayFormatterIssue, ...Array<ParseResult.ArrayFormatterIssue>] }
    >()
    for (const issue of ParseResult.ArrayFormatter.formatErrorSync(decoded.left)) {
      const unit = unitOf(issue)
      const key = dotted(unit)
      const entry = units.get(key)
      if (entry === undefined) units.set(key, { unit, issues: [issue] })
      else entry.issues.push(issue)
    }
    const next: Record<string, Json> = structuredClone(current)
    let changed = false
    for (const [key, { unit, issues }] of units) {
      // What a preset may still complete is left for the merged config; it
      // still explains a unit dropped for another problem.
      if (keepIncomplete && issues.every((issue) => completable(issue, current, dropped))) continue
      if (!remove(next, unit)) continue
      changed = true
      const warning = `${source}: ignored ${key}, because ${describe(issues)}`
      dropped.set(key, { path: unit, warning, invalid: !issues.every((issue) => issue._tag === 'Unexpected') })
      warnings.push(warning)
    }
    // Nothing more can be taken out: a file left incomplete for its presets.
    if (!changed) return { value: current, warnings, dropped: [...dropped.values()] }
    current = next
  }
}

/** A value a preset set but that was dropped as invalid, so no later file may set it. */
export interface Reserved {
  readonly path: Path
  readonly preset: string
}

/**
 * Takes out of a file what a preset tried to set but could not, because this
 * build dropped the preset's value as invalid.
 *
 * @remarks
 * A preset's values are locked, so a repository can only add to them. A
 * value this build cannot read is dropped from the preset, which would leave
 * its path unlocked, free for a repository to set to something weaker, such
 * as turning off a stricter setting a newer preset asks for. The path stays
 * reserved instead, and a later file's value there is dropped with a warning.
 *
 * @internal
 *
 * @param value - A later file's config, as parsed.
 * @param reserved - What earlier presets tried to set, by dotted path.
 * @param source - The later file, which each warning names.
 * @returns The file without values at reserved paths, and a warning for each.
 */
export const withoutReserved = (
  value: Readonly<Record<string, Json>>,
  reserved: ReadonlyMap<string, Reserved>,
  source: string,
): Lenient => {
  const next: Record<string, Json> = structuredClone(value)
  const warnings: Array<string> = []
  const dropped: Array<Dropped> = []
  for (const [key, { path, preset }] of reserved) {
    if (!remove(next, path)) continue
    const warning = `${source}: ignored ${key}, because ${preset} sets it in a form this version of smartcloud cannot use, and what a preset sets cannot be changed`
    // The preset's own invalid value is what is reported as invalid.
    dropped.push({ path, warning, invalid: false })
    warnings.push(warning)
  }
  return { value: next, warnings, dropped }
}

/**
 * A path in the dotted form warnings use: a dot or backslash inside a key is
 * escaped, so the single key `a.b` reads `a\.b`.
 *
 * @internal
 *
 * @param path - The path.
 * @returns The dotted path.
 */
export const dottedPath = (path: Path): string => dotted(path)
