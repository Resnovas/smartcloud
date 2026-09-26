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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
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

const TRAILER = /^([A-Za-z][A-Za-z0-9-]*):[ \t]*(\S.*?)\s*$/gm

/**
 * Parses the `Key: value` trailers of a commit message.
 *
 * @remarks
 * As in git, trailers are read only from the final paragraph, and a message
 * with a single paragraph has none. Otherwise a conventional subject such as
 * `feat: add x` would be read as a trailer called `feat`.
 *
 * @example
 * ```ts
 * parseTrailers('fix: x\n\nSigned-off-by: Jane <jane@example.com>')
 * // [{ key: 'Signed-off-by', value: 'Jane <jane@example.com>' }]
 * ```
 *
 * @param message - The full commit message.
 * @returns The trailers in the order they appear.
 */
export const parseTrailers = (message: string): ReadonlyArray<Trailer> => {
  const paragraphs = message.trim().split(/\n[ \t]*\n/)
  if (paragraphs.length < 2) return []
  const last = paragraphs[paragraphs.length - 1] ?? ''
  return [...last.matchAll(TRAILER)].map(([, key = '', value = '']) => ({ key, value }))
}

const IDENTITY = /^(.*?)\s*<([^>]+)>$/

/**
 * Splits a trailer value such as `Jane Doe <jane@example.com>` into a name
 * and a lower-cased email.
 *
 * @param value - The trailer value.
 * @returns The identity, or undefined when the value has no `<email>`.
 */
export const parseIdentity = (value: string): { readonly name: string; readonly email: string } | undefined => {
  const match = IDENTITY.exec(value)
  return match ? { name: match[1] ?? '', email: (match[2] ?? '').toLowerCase() } : undefined
}

/**
 * Whether a trailer key matches, ignoring case as git does.
 *
 * @param trailer - The trailer to test.
 * @param key - The key to look for, for example `signed-off-by`.
 * @returns True when the keys match.
 */
export const hasKey = (trailer: Trailer, key: string): boolean => trailer.key.toLowerCase() === key.toLowerCase()
