/**
 * @file packages/config/src/json-schema.ts
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

import { JSONSchema } from 'effect'
import { SmartcloudConfig } from './schema.js'

// Keywords that only annotate a schema. They stay beside the `allOf` that
// replaces a `$ref`, so editors still show them on hover.
const ANNOTATIONS = new Set(['title', 'description', 'default', 'examples', '$comment'])

// The keywords of a JSON Schema whose values are themselves schemas, keyed by
// name, so their keys are property names rather than keywords.
const SCHEMA_MAPS = new Set(['$defs', 'definitions', 'properties', 'patternProperties'])

// The keywords whose values are data, not schemas, and are copied untouched.
const DATA = new Set(['const', 'enum', 'default', 'examples'])

/**
 * Moves every keyword that sits beside a `$ref` into an `allOf`, recursively.
 *
 * @remarks
 * The schema declares draft-07, where a `$ref` makes every keyword beside it
 * ignored, so constraints Effect writes there (such as `exclusiveMinimum` on a
 * positive integer) would never reach an editor. `{ $ref, ...rest }` becomes
 * `{ ...annotations, allOf: [{ $ref }, constraints] }`, which draft-07 applies
 * in full. The root's `$ref` is wrapped the same way beside `$defs`.
 *
 * @param node - A schema, or an object inside one.
 * @param map - Whether `node` maps names to schemas (the value of `properties`).
 * @returns The same object with no `$ref` beside another keyword.
 */
const withoutRefSiblings = (node: object, map = false): Record<string, unknown> => {
  const fields: ReadonlyArray<readonly [string, unknown]> = Object.entries(node)
  const entries = fields.map(([key, value]) =>
    !map && DATA.has(key) ? ([key, value] as const) : ([key, rewrite(value, !map && SCHEMA_MAPS.has(key))] as const),
  )
  const ref: unknown = Reflect.get(node, '$ref')
  if (map || typeof ref !== 'string' || entries.length === 1) return Object.fromEntries(entries)
  const annotation = (key: string) => ANNOTATIONS.has(key) || key.startsWith('$')
  const constraints = entries.filter(([key]) => !annotation(key))
  return {
    ...Object.fromEntries(entries.filter(([key]) => key !== '$ref' && annotation(key))),
    allOf: [{ $ref: ref }, ...(constraints.length > 0 ? [Object.fromEntries(constraints)] : [])],
  }
}

const rewrite = (value: unknown, map: boolean): unknown => {
  if (Array.isArray(value)) return value.map((item) => rewrite(item, false))
  return typeof value === 'object' && value !== null ? withoutRefSiblings(value, map) : value
}

/**
 * The JSON Schema for `.github/smartcloud.yml`, generated from the Effect
 * Schema so the two can never disagree.
 *
 * @remarks
 * Committed at `schema/smartcloud.schema.json` for editors, and checked by a
 * test that fails when the committed copy is stale. No `$ref` carries sibling
 * keywords, because draft-07 ignores them (see `withoutRefSiblings`).
 *
 * @example
 * ```ts import.meta.vitest name="configJsonSchema"
 * import { configJsonSchema } from '@resnovas/config'
 *
 * JSON.stringify(configJsonSchema()).includes('SmartcloudConfig') // => true
 * ```
 *
 * @returns The JSON Schema document.
 */
export const configJsonSchema = (): Readonly<Record<string, unknown>> =>
  withoutRefSiblings(JSONSchema.make(SmartcloudConfig))
