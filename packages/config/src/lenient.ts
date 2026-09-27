/**
 * @file packages/config/src/lenient.ts
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
// which a preset's rule of the same name may complete.
const completable = (issue: ParseResult.ArrayFormatterIssue, value: Readonly<Record<string, Json>>): boolean =>
  issue._tag === 'Missing' || (issue._tag !== 'Unexpected' && isRecord(valueAt(value, issue.path)))

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

/** A config with its invalid values taken out, and a warning for each. */
export interface Lenient {
  readonly value: Readonly<Record<string, Json>>
  readonly warnings: ReadonlyArray<string>
}

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
  let current = value
  for (;;) {
    const decoded = decodeV2({ ...current, version: 2 })
    if (Either.isRight(decoded)) return { value: current, warnings }
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
      if (keepIncomplete && issues.every((issue) => completable(issue, current))) continue
      if (!remove(next, unit)) continue
      changed = true
      warnings.push(`${source}: ignored ${key}, because ${describe(issues)}`)
    }
    // Nothing more can be taken out: a file left incomplete for its presets.
    if (!changed) return { value: current, warnings }
    current = next
  }
}
