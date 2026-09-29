/**
 * @file tests/config/src/schema.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { Either, ParseResult, Schema } from 'effect'
import { Color, Label, RuleId, SIZE_THRESHOLDS, SizeLabels, sizeThresholds, SmartcloudConfig } from '@resnovas/config'

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
    expect(Schema.decodeUnknownSync(SmartcloudConfig)(Schema.encodeSync(SmartcloudConfig)(config))).toStrictEqual(
      config,
    )
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

  it('reads an all-digit colour that arrived as a number back as six digits', () => {
    const decode = Schema.decodeUnknownEither(Color)
    // 000000, 000123 and 123456 are what YAML makes 0, 123 and 123456 from.
    expect(decode(0)).toStrictEqual(Either.right('000000'))
    expect(decode(123)).toStrictEqual(Either.right('000123'))
    expect(decode(123_456)).toStrictEqual(Either.right('123456'))
    expect(decode('000000')).toStrictEqual(Either.right('000000'))
    expect(Schema.encodeSync(Color)('000123')).toBe('000123')
  })

  it('rejects a number that is not six digits, asking for quotes', () => {
    const decode = Schema.decodeUnknownEither(Color)
    for (const value of [1_000_000, -1, 12.5, Number.POSITIVE_INFINITY]) {
      const result = decode(value)
      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(ParseResult.TreeFormatter.formatErrorSync(result.left)).toContain('write the colour in quotes')
      }
    }
    expect(Either.isLeft(decode('green'))).toBe(true)
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

describe('SizeLabels', () => {
  it('fills in the thresholds a section leaves out', () => {
    expect(sizeThresholds({})).toStrictEqual(SIZE_THRESHOLDS)
    expect(sizeThresholds({ thresholds: { s: 20, xl: 2000 } })).toStrictEqual({ s: 20, m: 100, l: 500, xl: 2000 })
  })

  it('accepts an empty section and thresholds that rise from s to xl', () => {
    expect(Schema.is(SizeLabels)({})).toBe(true)
    expect(Schema.is(SizeLabels)({ thresholds: { s: 5, m: 50, l: 200, xl: 400 } })).toBe(true)
  })

  it('rejects thresholds that do not rise, counting the defaults, and ones that are not positive whole numbers', () => {
    expect(() => Schema.decodeUnknownSync(SizeLabels)({ thresholds: { l: 100 } })).toThrow(
      'size thresholds must rise from s to xl, got s 10, m 100, l 100, xl 1000',
    )
    expect(Schema.is(SizeLabels)({ thresholds: { s: 0 } })).toBe(false)
    expect(Schema.is(SizeLabels)({ thresholds: { s: 1.5 } })).toBe(false)
    expect(Schema.is(SizeLabels)({ thresholds: { xxl: 5000 } })).toBe(true)
    expect(() =>
      Schema.decodeUnknownSync(SizeLabels)({ thresholds: { xxl: 5000 } }, { onExcessProperty: 'error' }),
    ).toThrow()
  })

  it('is a section of the config', () => {
    expect(Schema.is(SmartcloudConfig)({ version: 2, sizeLabels: { thresholds: { s: 20 } } })).toBe(true)
  })
})
