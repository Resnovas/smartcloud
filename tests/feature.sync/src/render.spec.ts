/**
 * @file tests/feature.sync/src/render.spec.ts
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
import { renderAll, renderText } from '@resnovas/feature.sync'

describe('renderText', () => {
  it('replaces placeholders, and an unknown key is an error', () => {
    expect(renderText('(c) {{YEAR}} {{WHO}}', { YEAR: '2026', WHO: 'R' })).toStrictEqual(Either.right('(c) 2026 R'))
    const missing = renderText('{{MISSING}}', {}, 'LICENSE')
    expect(Either.isLeft(missing) && missing.left.message).toBe('LICENSE: no value for {{MISSING}}')
    expect(Either.isLeft(missing) && missing.left).toMatchObject({
      _tag: 'MissingValue',
      key: 'MISSING',
      source: 'LICENSE',
    })
  })

  it('names a template by default and does not read inherited keys', () => {
    const missing = renderText('{{TO_STRING}}', {})
    expect(Either.isLeft(missing) && missing.left.message).toBe('template: no value for {{TO_STRING}}')
  })

  it('leaves text that only looks like a placeholder', () => {
    expect(renderText('{{lower}} {{ SPACED }} {{A-B}}', {})).toStrictEqual(
      Either.right('{{lower}} {{ SPACED }} {{A-B}}'),
    )
  })
})

describe('renderAll', () => {
  it('renders nested templates, keeps their paths and execute bits, and sorts by path', () => {
    const rendered = renderAll(
      [
        { path: 'README.md', content: '= {{ORG_NAME}}\n', executable: false },
        { path: '.github/ISSUE_TEMPLATE/bug.yml', content: 'name: {{ORG_NAME}} bug\n', executable: false },
        { path: 'tools/run', content: '#!/bin/sh\n', executable: true },
        { path: 'README.md', content: 'duplicate', executable: false },
      ],
      { ORG_NAME: 'Resnovas' },
    )
    expect(rendered).toStrictEqual(
      Either.right([
        { path: '.github/ISSUE_TEMPLATE/bug.yml', content: 'name: Resnovas bug\n', executable: false },
        { path: 'README.md', content: '= Resnovas\n', executable: false },
        { path: 'README.md', content: 'duplicate', executable: false },
        { path: 'tools/run', content: '#!/bin/sh\n', executable: true },
      ]),
    )
  })

  it('fails on the first template with a missing value', () => {
    const rendered = renderAll([{ path: 'LICENSE', content: '{{HOLDER}}', executable: false }], {})
    expect(Either.isLeft(rendered) && rendered.left.message).toBe('LICENSE: no value for {{HOLDER}}')
  })
})
