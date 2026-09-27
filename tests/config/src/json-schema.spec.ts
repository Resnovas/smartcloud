/**
 * @file tests/config/src/json-schema.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { configJsonSchema, parseExtendsRef } from '@resnovas/config'

// The committed JSON Schema must match the Effect Schema. Regenerate it with:
//   SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests
const committed = new URL('../../../schema/smartcloud.schema.json', import.meta.url)

describe('JSON Schema', () => {
  it('the committed schema/smartcloud.schema.json is up to date', () => {
    const generated = `${JSON.stringify(configJsonSchema(), null, 2)}\n`
    if (process.env['SMARTCLOUD_UPDATE_SCHEMA'] === '1') writeFileSync(committed, generated)
    expect(existsSync(committed) ? readFileSync(committed, 'utf8') : '').toBe(generated)
  })

  it('describes the top-level sections', () => {
    const schema = configJsonSchema()
    expect(JSON.stringify(schema)).toContain('"version"')
    expect(JSON.stringify(schema)).toContain('ConditionGroup')
  })

  it('carries the runtime checks that editors can express', () => {
    const schema: unknown = JSON.parse(JSON.stringify(configJsonSchema()))
    const at = (...keys: ReadonlyArray<string>): unknown =>
      keys.reduce<unknown>(
        (value, key) => (typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined),
        schema,
      )
    const pattern = at('$defs', 'ExtendsEntry', 'pattern')
    expect(typeof pattern).toBe('string')
    const matches = new RegExp(typeof pattern === 'string' ? pattern : '$^', 'u')
    for (const entry of [
      'o/r/p.yml',
      'Resnovas/.github/smartcloud/house.yml@main',
      'nope',
      'o/r/../p.yml',
      'o/r/p@a@b',
      'o/r/a//b',
    ]) {
      expect([entry, matches.test(entry)]).toStrictEqual([entry, parseExtendsRef(entry) !== undefined])
    }
    expect(at('$defs', 'ConventionRule', 'allOf')).toStrictEqual([
      { anyOf: [{ required: ['preset'] }, { required: ['when'] }] },
    ])
    expect(at('$defs', 'ConventionRule', 'additionalProperties')).toBe(false)
    expect(at('$defs', 'RuleId', 'not')).toStrictEqual({ const: '__proto__' })
  })
})
