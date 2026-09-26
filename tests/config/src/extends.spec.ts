/**
 * @file tests/config/src/extends.spec.ts
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
import { formatExtendsRef, parseExtendsRef, SmartcloudConfig } from '@resnovas/config'

describe('extends entries', () => {
  it('parse and format owner/repo/path@ref', () => {
    expect(parseExtendsRef('Resnovas/.github/smartcloud/house.yml@v2')).toStrictEqual({
      owner: 'Resnovas',
      repo: '.github',
      path: 'smartcloud/house.yml',
      ref: 'v2',
    })
    expect(formatExtendsRef({ owner: 'o', repo: 'r', path: 'p.yml' })).toBe('o/r/p.yml')
    expect(parseExtendsRef('not-a-ref')).toBeUndefined()
  })

  it('reject dot segments, so a preset cannot point outside its repository', () => {
    expect(parseExtendsRef('o/r/../other.yml')).toBeUndefined()
    expect(parseExtendsRef('o/r/a/./b.yml')).toBeUndefined()
    expect(parseExtendsRef('../../repos/x.yml')).toBeUndefined()
    expect(parseExtendsRef('o/./p.yml')).toBeUndefined()
    expect(parseExtendsRef('o/r/a//b.yml')).toBeUndefined()
    expect(parseExtendsRef('o/r/.github/..x.yml@v1')).toStrictEqual({ owner: 'o', repo: 'r', path: '.github/..x.yml', ref: 'v1' })
  })

  it('are validated when the config is decoded', () => {
    expect(() => Schema.decodeUnknownSync(SmartcloudConfig)({ version: 2, extends: ['nope'] })).toThrow(
      'expected owner/repo/path@ref, got "nope"',
    )
  })
})
