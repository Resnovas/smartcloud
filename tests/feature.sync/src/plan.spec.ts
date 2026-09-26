/**
 * @file tests/feature.sync/src/plan.spec.ts
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
import { Either } from 'effect'
import { planSync } from '@resnovas/feature.sync'

const managed = '# house:managed:begin\ngithub: [{{OWNER}}]\n# house:managed:end\n# house:local\n'

const templates = [
  { path: 'LICENSE', content: '(c) {{OWNER}}\n', executable: false },
  { path: '.github/FUNDING.yml', content: managed, executable: false },
  { path: 'tools/run', content: '#!/bin/sh\n', executable: true },
  { path: 'tools/lint', content: 'lint {{OWNER}}\n', executable: false },
  { path: 'KEEP.md', content: '{{NOT_SUPPLIED}}', executable: false },
]

describe('planSync', () => {
  it('returns only the files that change, and why', () => {
    const current = new Map([
      ['LICENSE', { content: '(c) someone else\n', executable: false }],
      ['.github/FUNDING.yml', { content: managed.replace('{{OWNER}}', 'Resnovas'), executable: false }],
      ['tools/run', { content: '#!/bin/sh\n', executable: false }],
      ['tools/lint', { content: 'old\n', executable: true }],
    ])
    const plan = planSync(templates, current, { OWNER: 'Resnovas' }, ['KEEP.md'])
    expect(plan).toStrictEqual(
      Either.right({
        files: [
          { path: 'LICENSE', content: '(c) Resnovas\n', executable: false, reason: 'update' },
          // A file that is already executable stays so.
          { path: 'tools/lint', content: 'lint Resnovas\n', executable: true, reason: 'update' },
          { path: 'tools/run', content: '#!/bin/sh\n', executable: true, reason: 'mode' },
        ],
        conflicts: [],
      }),
    )
  })

  it('creates missing files, keeps local rules and reports the ones that conflict', () => {
    const current = new Map([['.github/FUNDING.yml', { content: `${managed.replace('{{OWNER}}', 'old')}github: [someone]\n`, executable: false }]])
    const plan = planSync(templates, current, { OWNER: 'Resnovas' }, ['KEEP.md'])
    expect(Either.getOrThrow(plan).files.map(({ path, reason }) => [path, reason])).toStrictEqual([
      ['.github/FUNDING.yml', 'update'],
      ['LICENSE', 'create'],
      ['tools/lint', 'create'],
      ['tools/run', 'create'],
    ])
    expect(Either.getOrThrow(plan).files[0]?.content).toBe(
      '# house:managed:begin\ngithub: [Resnovas]\n# house:managed:end\n# house:local\ngithub: [someone]\n',
    )
    expect(Either.getOrThrow(plan).conflicts).toStrictEqual([{ path: '.github/FUNDING.yml', problem: 'redefines the synced key "github"' }])
  })

  it('fails on a missing value in a template that is not excluded', () => {
    const plan = planSync(templates, new Map(), { OWNER: 'Resnovas' }, [])
    expect(Either.isLeft(plan) && plan.left.message).toBe('KEEP.md: no value for {{NOT_SUPPLIED}}')
  })
})
