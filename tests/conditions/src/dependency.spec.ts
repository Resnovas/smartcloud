/**
 * @file tests/conditions/src/dependency.spec.ts
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
import { dependencyUpdate, updateTypeOf } from '@resnovas/conditions'

describe('updateTypeOf', () => {
  it('is decided by the first numeric part that differs', () => {
    expect(updateTypeOf('1.2.3', '2.0.0')).toBe('major')
    expect(updateTypeOf('0.1.0', '0.2.0')).toBe('minor')
    expect(updateTypeOf('1.2.3', '1.2.4')).toBe('patch')
    expect(updateTypeOf('1.2.3.4', '1.2.3.5')).toBe('patch')
  })

  it('counts missing parts as zero and ignores prefixes and suffixes', () => {
    expect(updateTypeOf('4', '4.1')).toBe('minor')
    expect(updateTypeOf('4', '4.0.0')).toBe('patch')
    expect(updateTypeOf('^1.2.0', '~2.0.0')).toBe('major')
    expect(updateTypeOf('v1.0.0-rc.1', 'v1.0.0')).toBe('patch')
  })

  it('types a downgrade like an upgrade', () => {
    expect(updateTypeOf('2.0.0', '1.9.0')).toBe('major')
  })

  it('reads a PEP 440 epoch, and types a change of epoch as major', () => {
    expect(updateTypeOf('1!1.0', '1!1.1')).toBe('minor')
    expect(updateTypeOf('1.0', '1!1.0')).toBe('major')
  })
})

describe('dependencyUpdate', () => {
  it("reads a Dependabot title and description's first line", () => {
    expect(dependencyUpdate('Bump lodash from 4.17.20 to 4.17.21', '')).toStrictEqual({
      type: 'patch',
      from: '4.17.20',
      to: '4.17.21',
    })
    expect(
      dependencyUpdate(
        'chore(deps): bump the npm group',
        'Bumps [express](https://github.com/expressjs/express) from 4.18.2 to 4.19.0.',
      )?.type,
    ).toBe('minor')
    expect(dependencyUpdate('Bump actions/checkout from v3 to v4 in /.github/workflows', '')?.type).toBe('major')
  })

  it('takes the largest change in a grouped Dependabot update', () => {
    const body = [
      'Bumps the npm group with 3 updates: a, b and c.',
      '',
      'Updates `a` from 1.0.0 to 1.0.1',
      '<details><summary>Release notes</summary>',
      '<blockquote><p>Bump d from 1.0.0 to 9.0.0</p></blockquote>',
      '</details>',
      'Updates `b` from 2.1.0 to 3.0.0',
      'Updates `c` from 5.0.0 to 5.1.0',
    ].join('\n')
    expect(dependencyUpdate('Bump the npm group with 3 updates', body)).toStrictEqual({
      type: 'major',
      from: '2.1.0',
      to: '3.0.0',
    })
  })

  it('reads the change column of a Renovate table, with -> or →', () => {
    const table = (change: string) =>
      [
        'This PR contains the following updates:',
        '',
        '| Package | Type | Update | Change |',
        '|---|---|---|---|',
        `| [react](https://react.dev) | dependencies | minor | ${change} |`,
      ].join('\n')
    expect(dependencyUpdate('Update dependency react', table('[`18.2.0` -> `18.3.1`](https://x)'))?.type).toBe('minor')
    expect(dependencyUpdate('Update dependency react', table('`^18.2.0` → `^19.0.0`'))?.type).toBe('major')
  })

  it('skips release notes, quotes and comments, which quote other projects', () => {
    const body = [
      '| Package | Change |',
      '|---|---|',
      '| x | `1.0.0` -> `1.0.1` |',
      '<!-- was 0.9.0 -> 3.0.0 -->',
      '> upgraded y from 1.0.0 to 2.0.0',
      '### Release Notes',
      '<details><summary>x</summary>',
      '<details><summary>v1.0.1</summary>moved z from 1.0.0 to 5.0.0</details>',
      'and `1.0.0` -> `4.0.0`',
      '</details>',
    ].join('\n')
    expect(dependencyUpdate('Update x', body)?.type).toBe('patch')
  })

  it('reads PEP 440 epochs and post-releases, and Maven qualifiers', () => {
    expect(dependencyUpdate('Bump x from 1!1.0 to 1!2.0', '')).toStrictEqual({
      type: 'major',
      from: '1!1.0',
      to: '1!2.0',
    })
    expect(dependencyUpdate('Bump x from 1.2.3 to 1.2.3.post1', '')?.to).toBe('1.2.3.post1')
    expect(dependencyUpdate('Bump netty from 4.1.126.Final to 4.1.127.Final', '')?.type).toBe('patch')
    expect(dependencyUpdate('Bump netty from 4.1.126.Final to 4.2.0.Final', '')?.type).toBe('minor')
    expect(dependencyUpdate('Bump netty from 4.1.126.Final to 5.0.0.Final', '')?.type).toBe('major')
  })

  it('drops an unclosed HTML comment and everything after it', () => {
    expect(dependencyUpdate('Update x', '`1.0.0` -> `1.0.1`\n<!-- `1.0.0` -> `9.0.0`')?.type).toBe('patch')
    expect(dependencyUpdate('Update x', '<!-- a --><!-- `1.0.0` -> `9.0.0`')).toBeUndefined()
  })

  it('finds nothing without a numeric version change', () => {
    expect(dependencyUpdate('Lock file maintenance', '')).toBeUndefined()
    expect(dependencyUpdate('Update actions/checkout digest to abc1234', '`def5678` -> `abc1234`')).toBeUndefined()
    expect(dependencyUpdate('Rename from x to y', 'build2.0 -> 3.0')).toBeUndefined()
  })
})
