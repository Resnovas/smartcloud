/**
 * @file tests/config/src/schema.spec.ts
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
import { Schema } from 'effect'
import { Color, Label, RuleId, SmartcloudConfig } from '@resnovas/config'

describe('SmartcloudConfig', () => {
  it('needs a preset or conditions for every convention', () => {
    expect(() => Schema.decodeUnknownSync(SmartcloudConfig)({ version: 2, conventions: { rules: { a: {} } } })).toThrow(
      'a convention needs a preset or when',
    )
  })

  it('round-trips: decoding the encoded config returns the original', () => {
    const config = Schema.decodeUnknownSync(SmartcloudConfig)({
      version: 2,
      labels: { bug: { name: 'bug', color: '#d73a4a', aliases: ['defect'] } },
      conventions: { comment: { header: 'h' }, rules: { title: { preset: 'conventionalCommits', level: 'error' } } },
    })
    expect(Schema.decodeUnknownSync(SmartcloudConfig)(Schema.encodeSync(SmartcloudConfig)(config))).toStrictEqual(config)
  })
})

describe('SmartcloudConfig building blocks', () => {
  it('rejects a rule key of __proto__ and keys with surrounding spaces', () => {
    expect(Schema.is(RuleId)('claNot Required')).toBe(true)
    expect(Schema.is(RuleId)('__proto__')).toBe(false)
    expect(Schema.is(RuleId)(' padded ')).toBe(false)
  })

  it('accepts a colour with or without #, and only six hex digits', () => {
    expect(Schema.is(Color)('#0E8A16')).toBe(true)
    expect(Schema.is(Color)('0e8a16')).toBe(true)
    expect(Schema.is(Color)('#fff')).toBe(false)
  })

  it('needs a label name and colour, and takes aliases', () => {
    expect(Schema.is(Label)({ name: 'bug', color: 'd73a4a', aliases: ['defect'] })).toBe(true)
    expect(Schema.is(Label)({ name: 'bug' })).toBe(false)
  })

  it('accepts only version 2', () => {
    expect(Schema.is(SmartcloudConfig)({ version: 2 })).toBe(true)
    expect(Schema.is(SmartcloudConfig)({ version: 1 })).toBe(false)
  })
})
