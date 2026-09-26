/**
 * @file packages/feature.sync/src/values.ts
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

import { Data, Either } from 'effect'
import type { Values } from './render.js'

/**
 * A values file line that is not `KEY: value`.
 *
 * @example
 * ```ts import.meta.vitest name="InvalidValues"
 * import { InvalidValues } from '@resnovas/feature.sync'
 *
 * new InvalidValues({ source: 'house.yml', line: 1, text: 'nope' }).message // => 'house.yml:1: expected "KEY: value", got "nope"'
 * ```
 */
export class InvalidValues extends Data.TaggedError('InvalidValues')<{
  readonly source: string
  readonly line: number
  readonly text: string
}> {
  override get message() {
    return `${this.source}:${this.line}: expected "KEY: value", got "${this.text}"`
  }
}

const KEY = /^([A-Z][A-Z0-9_]*):/

const isSpace = (char: string) => char !== '' && char.trim() === ''

// A `#` starts a comment only after whitespace, so `https://x.io/#a` keeps
// its fragment. Scanning once keeps this linear on long lines.
const withoutComment = (line: string): string => {
  for (let index = 1; index < line.length; index++) {
    if (line[index] === '#' && isSpace(line.charAt(index - 1))) return line.slice(0, index)
  }
  return line
}

/**
 * Removes one pair of matching single or double quotes around a value.
 *
 * @example
 * ```ts import.meta.vitest name="unquote"
 * import { unquote } from '@resnovas/feature.sync'
 *
 * unquote('"a # b"') // => 'a # b'
 * unquote('"a\'') // => '"a\''
 * ```
 *
 * @param value - The value.
 * @returns The value without its quotes.
 */
export const unquote = (value: string): string => {
  const first = value.charAt(0)
  return value.length >= 2 && (first === '"' || first === "'") && value.endsWith(first) ? value.slice(1, -1) : value
}

/**
 * Parses a flat `KEY: value` file, such as a house.yml.
 *
 * @remarks
 * Deliberately not a YAML parser: one key per line, so the renderer cannot
 * be surprised by YAML features. Blank lines and `#` comments are ignored,
 * and one pair of quotes is stripped so a value may contain `#`.
 *
 * @example
 * ```ts import.meta.vitest name="parseValues"
 * import { parseValues } from '@resnovas/feature.sync'
 * import { Either } from 'effect'
 *
 * Either.getOrThrow(parseValues('ORG_NAME: Resnovas  # the owner\n')).ORG_NAME // => 'Resnovas'
 * Either.isLeft(parseValues('lower: nope')) // => true
 * ```
 *
 * @param text - The file.
 * @param source - Names the file in errors.
 * @returns The values, or the first malformed line.
 */
export const parseValues = (text: string, source = 'values'): Either.Either<Values, InvalidValues> => {
  const values: Record<string, string> = {}
  const lines = text.split('\n')
  for (const [index, raw] of lines.entries()) {
    const line = withoutComment(raw).trim()
    if (line === '' || line.startsWith('#')) continue
    const key = KEY.exec(line)?.[1]
    if (key === undefined) return Either.left(new InvalidValues({ source, line: index + 1, text: raw.trimEnd() }))
    values[key] = unquote(line.slice(key.length + 1).trim())
  }
  return Either.right(values)
}

/**
 * Splits a comma-separated value into trimmed, non-empty items.
 *
 * @example
 * ```ts import.meta.vitest name="list"
 * import { list } from '@resnovas/feature.sync'
 *
 * list(' a, b ,, c ').join('|') // => 'a|b|c'
 * ```
 *
 * @param value - The value, or undefined.
 * @returns The items.
 */
export const list = (value: string | undefined): ReadonlyArray<string> =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
