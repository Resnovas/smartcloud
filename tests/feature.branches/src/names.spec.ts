/**
 * @file tests/feature.branches/src/names.spec.ts
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
import {
  branchAllowed,
  describeBranchName,
  describeBranches,
  issueKeys,
  matchesBranchName,
} from '@resnovas/feature.branches'

describe('issueKeys', () => {
  it('finds keys between separators, in upper case', () => {
    expect(issueKeys('claude/smc-75-branch-names')).toStrictEqual(['SMC'])
    expect(issueKeys('SMC-1_ops2-30')).toStrictEqual(['SMC', 'OPS2'])
    expect(issueKeys('feature/ABC-12')).toStrictEqual(['ABC'])
    expect(issueKeys('docs75-1x')).toStrictEqual([])
    expect(issueKeys('patch-1')).toStrictEqual(['PATCH'])
    expect(issueKeys('abcdefghijk-1')).toStrictEqual([])
    expect(issueKeys('2024-01')).toStrictEqual([])
  })
})

describe('matchesBranchName', () => {
  it('prefixed needs a prefix, a slash and a description, from the prefixes when given', () => {
    const any = { preset: 'prefixed' as const }
    expect(matchesBranchName(any, 'ann/fix-typo')).toBe(true)
    expect(matchesBranchName(any, 'ann/deep/path')).toBe(true)
    expect(matchesBranchName(any, 'fix-typo')).toBe(false)
    expect(matchesBranchName(any, '/fix-typo')).toBe(false)
    expect(matchesBranchName(any, 'ann/')).toBe(false)
    const listed = { preset: 'prefixed' as const, prefixes: ['feat', 'fix'] }
    expect(matchesBranchName(listed, 'fix/typo')).toBe(true)
    expect(matchesBranchName(listed, 'Fix/typo')).toBe(false)
  })

  it('issueKey needs a key, one of the keys in any case when given', () => {
    expect(matchesBranchName({ preset: 'issueKey' }, 'ops-4')).toBe(true)
    expect(matchesBranchName({ preset: 'issueKey' }, 'feat/labels')).toBe(false)
    expect(matchesBranchName({ preset: 'issueKey', keys: ['smc'] }, 'SMC-4-thing')).toBe(true)
    expect(matchesBranchName({ preset: 'issueKey', keys: ['SMC'] }, 'ops-4')).toBe(false)
  })

  it('needs every part it sets to hold', () => {
    const both = { preset: 'prefixed' as const, pattern: '^[a-z]+/[a-z-]+$' }
    expect(matchesBranchName(both, 'ann/fix-typo')).toBe(true)
    expect(matchesBranchName(both, 'ann/Fix_typo')).toBe(false)
    expect(matchesBranchName({ pattern: '/^release\\//i' }, 'Release/2.0')).toBe(true)
  })
})

describe('describeBranchName', () => {
  it('describes each part, joined by and', () => {
    expect(describeBranchName({ preset: 'prefixed' })).toBe('`<prefix>/<description>`')
    expect(describeBranchName({ preset: 'issueKey' })).toBe('an issue key such as `ABC-123`')
    expect(describeBranchName({ preset: 'issueKey', keys: ['smc', 'ops'] })).toBe(
      'an issue key such as `SMC-123`, with the key `SMC` or `OPS`',
    )
    expect(describeBranchName({ preset: 'prefixed', pattern: '^[a-z/-]+$' })).toBe(
      '`<prefix>/<description>` and matching `^[a-z/-]+$`',
    )
  })
})

describe('branchAllowed and describeBranches', () => {
  const policy = {
    names: { person: { preset: 'prefixed' as const }, issue: { preset: 'issueKey' as const, keys: ['SMC'] } },
  }

  it('allows a branch that meets any accepted name', () => {
    expect(branchAllowed(policy, 'ann/thing')).toBe(true)
    expect(branchAllowed(policy, 'smc-75')).toBe(true)
    expect(branchAllowed(policy, 'patch-1')).toBe(false)
    expect(branchAllowed({}, 'ann/thing')).toBe(false)
  })

  it('lists the accepted names by key, unless a message replaces them', () => {
    expect(describeBranches(policy)).toBe(
      'Name the branch one of these ways:\n- person: `<prefix>/<description>`\n- issue: an issue key such as `SMC-123`, with the key `SMC`',
    )
    expect(describeBranches({})).toBe('Name the branch one of these ways:')
    expect(describeBranches({ ...policy, message: 'Use <you>/<what>.' })).toBe('Use <you>/<what>.')
  })
})
