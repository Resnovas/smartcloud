/**
 * @file packages/config/src/extends.ts
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

import { Schema } from 'effect'

/**
 * Where a preset lives: a file in a GitHub repository, optionally at a ref.
 */
export interface ExtendsRef {
  readonly owner: string
  readonly repo: string
  readonly path: string
  /** Branch, tag or commit. Omitted means the repository's default branch. */
  readonly ref?: string
}

// owner/repo/path@ref. No segment may be empty, `.` or `..`, so an entry can
// only name a file inside the repository it names. Segments cannot contain
// `/` or `@`, so each lookahead checks a fixed width and matching stays linear.
// The JSON Schema carries the same expression, so editors agree with startup.
const REF =
  /^(?!\.\.?\/)([A-Za-z0-9_.-]+)\/(?!\.\.?\/)([A-Za-z0-9_.-]+)\/((?!\.\.?(?:\/|@|$))[^/@]+(?:\/(?!\.\.?(?:\/|@|$))[^/@]+)*)(?:@([^@\s]+))?$/

/**
 * Parses an `extends` entry of the form `owner/repo/path@ref`.
 *
 * @example
 * ```ts
 * parseExtendsRef('Resnovas/.github/smartcloud/house.yml@main')
 * // { owner: 'Resnovas', repo: '.github', path: 'smartcloud/house.yml', ref: 'main' }
 * ```
 *
 * @param entry - The entry as written in the config.
 * @returns The reference, or undefined when the entry is malformed.
 */
export const parseExtendsRef = (entry: string): ExtendsRef | undefined => {
  const match = REF.exec(entry)
  if (!match) return undefined
  const [, owner = '', repo = '', path = '', ref] = match
  return ref === undefined ? { owner, repo, path } : { owner, repo, path, ref }
}

/**
 * Formats a reference back to its `owner/repo/path@ref` form, used as the
 * preset's name in errors and warnings.
 *
 * @param ref - The reference.
 * @returns The formatted entry.
 */
export const formatExtendsRef = (ref: ExtendsRef): string =>
  `${ref.owner}/${ref.repo}/${ref.path}${ref.ref === undefined ? '' : `@${ref.ref}`}`

/** An `extends` entry, validated as `owner/repo/path@ref`. */
export const ExtendsEntry = Schema.String.pipe(
  Schema.filter((entry) => parseExtendsRef(entry) !== undefined || `expected owner/repo/path@ref, got "${entry}"`, {
    identifier: 'ExtendsEntry',
    description: 'A preset to extend, as owner/repo/path@ref. The ref is optional.',
    jsonSchema: { pattern: REF.source },
  }),
)
