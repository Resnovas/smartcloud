/**
 * @file packages/config/src/merge.ts
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

/**
 * A config tried to change something a preset already set. Presets are
 * locked: a repository may add rules, never replace or remove inherited ones.
 */
export class LockedRule extends Data.TaggedError('LockedRule')<{
  /** Dotted path of the value, for example `labelling.bug.when`. */
  readonly path: string
  /** The preset that set it. */
  readonly preset: string
  /** The config that tried to change it. */
  readonly source: string
}> {
  override get message() {
    return `${this.source} cannot change "${this.path}": it is set by ${this.preset}. Add a new rule instead.`
  }
}

type Json = null | boolean | number | string | ReadonlyArray<Json> | { readonly [key: string]: Json }

const isRecord = (value: unknown): value is Readonly<Record<string, Json>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const same = (a: Json, b: Json): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => same(item, b[i] ?? null))
  if (isRecord(a) && isRecord(b)) {
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every((key) => key in b && same(a[key] ?? null, b[key] ?? null))
  }
  return a === b
}

/**
 * The result of merging configs: the merged value, and which source set each
 * path, so a later conflict can name the preset it collides with.
 */
export interface Merged {
  readonly value: Readonly<Record<string, Json>>
  readonly origins: ReadonlyMap<string, string>
}

/** An empty merge, the starting point for folding presets and local config. */
export const empty: Merged = { value: {}, origins: new Map() }

/**
 * Adds a config to a merge under the rule "add, never change".
 *
 * @remarks
 * Objects merge key by key, so a config can add a new label or rule, or a
 * new field to an inherited rule. Repeating a value exactly as it already is
 * changes nothing and is allowed. Any other value already present, whether a
 * scalar, a list, or an object meeting a non-object, belongs to whichever
 * source set it first, and setting it differently is a {@link LockedRule}.
 *
 * @param merged - Everything merged so far.
 * @param config - The encoded config to add.
 * @param source - The config's name, for errors.
 * @returns The new merge, or the first locked value it tried to change.
 */
export const mergeLocked = (
  merged: Merged,
  config: Readonly<Record<string, Json>>,
  source: string,
): Either.Either<Merged, LockedRule> => {
  const origins = new Map(merged.origins)
  // Every path under a newly added value belongs to this source, so a later
  // conflict can name the exact field and the preset that set it.
  const claim = (value: Json, path: ReadonlyArray<string>): void => {
    origins.set(path.join('.'), source)
    if (isRecord(value)) for (const [key, inner] of Object.entries(value)) claim(inner, [...path, key])
  }
  const visit = (
    base: Readonly<Record<string, Json>>,
    next: Readonly<Record<string, Json>>,
    path: ReadonlyArray<string>,
  ): Either.Either<Readonly<Record<string, Json>>, LockedRule> => {
    const out: Record<string, Json> = { ...base }
    for (const [key, value] of Object.entries(next)) {
      const here = [...path, key]
      const dotted = here.join('.')
      const existing = base[key]
      if (existing === undefined) {
        out[key] = value
        claim(value, here)
        continue
      }
      if (same(existing, value)) continue
      if (isRecord(existing) && isRecord(value)) {
        const inner = visit(existing, value, here)
        if (Either.isLeft(inner)) return inner
        out[key] = inner.right
        continue
      }
      return Either.left(new LockedRule({ path: dotted, preset: origins.get(dotted) ?? 'a preset', source }))
    }
    return Either.right(out)
  }
  return Either.map(visit(merged.value, config, []), (value) => ({ value, origins }))
}
