/**
 * @file packages/feature.sync/src/render.ts
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

/** `{{KEY}}` values for the templates, by key. */
export type Values = Readonly<Record<string, string>>

/** A template file read from the source directory. */
export interface Template {
  /** The path relative to the template directory, which is also the path it syncs to. */
  readonly path: string
  readonly content: string
  /** Whether the template is executable; the synced file is made executable too. */
  readonly executable: boolean
}

/** A template after its placeholders are replaced. */
export type RenderedFile = Template

/**
 * A template names a `{{KEY}}` that has no value.
 *
 * @example
 * ```ts import.meta.vitest name="MissingValue"
 * import { MissingValue } from '@resnovas/feature.sync'
 *
 * new MissingValue({ source: 'LICENSE', key: 'HOLDER' }).message // => 'LICENSE: no value for {{HOLDER}}'
 * ```
 */
export class MissingValue extends Data.TaggedError('MissingValue')<{ readonly source: string; readonly key: string }> {
  override get message() {
    return `${this.source}: no value for {{${this.key}}}`
  }
}

// Keys are upper snake case, as `sync.values` requires. The pattern has no
// nested or overlapping quantifiers, so it runs in linear time.
const PLACEHOLDER = /\{\{([A-Z][A-Z0-9_]*)\}\}/g

/**
 * Replaces every `{{KEY}}` in a template with its value.
 *
 * @remarks
 * An unknown key is an error rather than a blank, because a silently empty
 * copyright holder or contact address is worse than a failed render.
 *
 * @example
 * ```ts import.meta.vitest name="renderText"
 * import { renderText } from '@resnovas/feature.sync'
 * import { Either } from 'effect'
 *
 * Either.getOrThrow(renderText('(c) {{YEAR}}', { YEAR: '2026' })) // => '(c) 2026'
 * ```
 *
 * @param text - The template.
 * @param values - The values by key.
 * @param source - Names the template in the error.
 * @returns The rendered text, or the first key without a value.
 */
export const renderText = (text: string, values: Values, source = 'template'): Either.Either<string, MissingValue> => {
  // A Map ignores inherited keys, so a template cannot reach Object.prototype.
  const lookup = new Map(Object.entries(values))
  const missing: Array<string> = []
  const rendered = text.replace(PLACEHOLDER, (placeholder, key: string) => {
    const value = lookup.get(key)
    if (value === undefined) missing.push(key)
    return value ?? placeholder
  })
  const [key] = missing
  return key === undefined ? Either.right(rendered) : Either.left(new MissingValue({ source, key }))
}

/**
 * Renders every template, sorted by path.
 *
 * @example
 * ```ts import.meta.vitest name="renderAll"
 * import { renderAll } from '@resnovas/feature.sync'
 * import { Either } from 'effect'
 *
 * const templates = [{ path: 'b', content: '{{X}}', executable: false }, { path: 'a', content: 'x', executable: false }]
 * Either.getOrThrow(renderAll(templates, { X: 'y' })).map((file) => file.path).join(', ') // => 'a, b'
 * ```
 *
 * @param templates - The templates.
 * @param values - The values by key.
 * @returns The rendered files, or the first missing value.
 */
export const renderAll = (
  templates: ReadonlyArray<Template>,
  values: Values,
): Either.Either<ReadonlyArray<RenderedFile>, MissingValue> =>
  Either.all(
    [...templates]
      .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      .map((template) => Either.map(renderText(template.content, values, template.path), (content) => ({ ...template, content }))),
  )
