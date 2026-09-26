/**
 * @file packages/conditions/src/trailers.ts
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

/**
 * A `Key: value` trailer from the end of a commit message.
 */
export interface Trailer {
  /** The key as written, for example `Signed-off-by`. */
  readonly key: string
  readonly value: string
}

// Commit messages come from contributors, so trailers are parsed with plain
// string operations, never a backtracking regular expression over the text:
// a crafted message must not be able to stall the check (CodeQL
// js/polynomial-redos). The key test below only ever sees one short key.
const KEY = /^[A-Za-z][A-Za-z0-9-]*$/

const parseLine = (line: string): Trailer | undefined => {
  const colon = line.indexOf(':')
  if (colon < 1) return undefined
  const key = line.slice(0, colon)
  const value = line.slice(colon + 1).trim()
  return KEY.test(key) && value !== '' ? { key, value } : undefined
}

/**
 * Parses the `Key: value` trailers of a commit message.
 *
 * @remarks
 * As in git, trailers are read only from the final paragraph, and a message
 * with a single paragraph has none. Otherwise a conventional subject such as
 * `feat: add x` would be read as a trailer called `feat`.
 *
 * @example
 * ```ts import.meta.vitest name="parseTrailers"
 * import { parseTrailers } from '@resnovas/conditions'
 *
 * const trailers = parseTrailers('fix: x\n\nSigned-off-by: Jane <jane@example.com>')
 * trailers[0]?.key // => 'Signed-off-by'
 * trailers[0]?.value // => 'Jane <jane@example.com>'
 * ```
 *
 * @param message - The full commit message.
 * @returns The trailers in the order they appear.
 */
export const parseTrailers = (message: string): ReadonlyArray<Trailer> => {
  const lines = message.trim().split('\n')
  // The final paragraph starts after the last blank line; a message with no
  // blank line is a subject alone and has no trailers.
  let start = -1
  for (let index = lines.length - 1; index >= 0; index--) {
    if ((lines[index] ?? '').trim() === '') {
      start = index + 1
      break
    }
  }
  if (start === -1) return []
  return lines.slice(start).flatMap((line) => {
    const trailer = parseLine(line)
    return trailer === undefined ? [] : [trailer]
  })
}

/**
 * Splits a trailer value such as `Jane Doe <jane@example.com>` into a name
 * and a lower-cased email.
 *
 * @example
 * ```ts import.meta.vitest name="parseIdentity"
 * import { parseIdentity } from '@resnovas/conditions'
 *
 * parseIdentity('Jane Doe <Jane@Example.com>')?.email // => 'jane@example.com'
 * parseIdentity('no email here') // => undefined
 * ```
 *
 * @param value - The trailer value.
 * @returns The identity, or undefined when the value has no `<email>`.
 */
export const parseIdentity = (value: string): { readonly name: string; readonly email: string } | undefined => {
  const trimmed = value.trim()
  const open = trimmed.lastIndexOf('<')
  if (open === -1 || !trimmed.endsWith('>')) return undefined
  const email = trimmed.slice(open + 1, -1)
  return email === '' || email.includes('>') ? undefined : { name: trimmed.slice(0, open).trim(), email: email.toLowerCase() }
}

/**
 * Whether a trailer key matches, ignoring case as git does.
 *
 * @example
 * ```ts import.meta.vitest name="hasKey"
 * import { hasKey } from '@resnovas/conditions'
 *
 * hasKey({ key: 'Signed-off-by', value: 'Jane <jane@example.com>' }, 'SIGNED-OFF-BY') // => true
 * ```
 *
 * @param trailer - The trailer to test.
 * @param key - The key to look for, for example `signed-off-by`.
 * @returns True when the keys match.
 */
export const hasKey = (trailer: Trailer, key: string): boolean => trailer.key.toLowerCase() === key.toLowerCase()
