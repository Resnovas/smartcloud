/**
 * @file tests/feature.commands/src/parse.spec.ts
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
import { parseCommands } from '@resnovas/feature.commands'

describe('parseCommands', () => {
  it('reads each command line with its arguments, in order', () => {
    const found = parseCommands(
      'Looks good.\r\n/label bug "good first issue" \'needs review\'\n  /ASSIGN @sam\n/retitle  A new   title ',
    )
    expect(found.map((invocation) => [invocation.name, invocation.args, invocation.rest])).toStrictEqual([
      ['label', ['bug', 'good first issue', 'needs review'], 'bug "good first issue" \'needs review\''],
      ['assign', ['@sam'], '@sam'],
      ['retitle', ['A', 'new', 'title'], 'A new   title'],
    ])
    expect(found[1]?.line).toBe('/ASSIGN @sam')
  })

  it('reads a command with no arguments, and an empty quoted argument', () => {
    expect(parseCommands('/help').map((invocation) => invocation.args)).toStrictEqual([[]])
    expect(parseCommands('/label ""').map((invocation) => invocation.args)).toStrictEqual([['']])
  })

  it('skips fenced code, quotes, paths and text that only mentions a command', () => {
    const body = [
      '```sh',
      '/label bug',
      '~~~',
      '/close',
      '```',
      '~~~~',
      '/lock',
      '~~~~',
      '> /approve',
      '/usr/bin/env',
      'please /merge this',
      '/merge',
    ].join('\n')
    expect(parseCommands(body).map((invocation) => invocation.name)).toStrictEqual(['merge'])
  })

  it('ignores lines too long to be a command', () => {
    expect(parseCommands(`/label ${'x'.repeat(1200)}`)).toStrictEqual([])
  })
})
