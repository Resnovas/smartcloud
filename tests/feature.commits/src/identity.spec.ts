/**
 * @file tests/feature.commits/src/identity.spec.ts
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
import { isAiIdentity, makeAiIdentityMatcher } from '@resnovas/feature.commits'

describe('isAiIdentity', () => {
  it('recognises AI identities by address or tool name', () => {
    expect(isAiIdentity({ name: 'Claude', email: 'noreply@anthropic.com' })).toBe(true)
    expect(isAiIdentity({ name: 'Aider (gpt-5)', email: 'aider@ai.invalid' })).toBe(true)
    expect(isAiIdentity({ name: 'GitHub Copilot', email: 'x@users.noreply.github.com' })).toBe(true)
    expect(isAiIdentity({ name: 'Cursor Agent', email: 'agent@cursor.sh' })).toBe(true)
    expect(isAiIdentity({ name: 'Codex', email: 'codex@openai.com' })).toBe(true)
    expect(isAiIdentity({ name: 'Jane Doe', email: 'jane@example.com' })).toBe(false)
  })

  it('adds config patterns, bare or delimited, to the built-in list', () => {
    const extra = { emails: ['@robots\\.example$'], names: ['/^robo$/i'] }
    expect(isAiIdentity({ name: 'Someone', email: 'x@robots.example' }, extra)).toBe(true)
    expect(isAiIdentity({ name: 'ROBO', email: 'robo@example.com' }, extra)).toBe(true)
    expect(isAiIdentity({ name: 'Robot Jane', email: 'jane@example.com' }, extra)).toBe(false)
    expect(isAiIdentity({ name: 'Claude', email: 'noreply@anthropic.com' }, extra)).toBe(true)
  })

  it('matches a pattern with the global flag the same way every time', () => {
    const isAi = makeAiIdentityMatcher({ names: ['/robo/gy'] })
    const robo = { name: 'robo', email: 'robo@example.com' }
    expect([isAi(robo), isAi(robo), isAi(robo)]).toStrictEqual([true, true, true])
  })

  it('matches a pattern that does not compile as a literal, ignoring case', () => {
    const isAi = makeAiIdentityMatcher({ names: ['Robo(t'] })
    expect(isAi({ name: 'my robo(t) helper', email: 'x@example.com' })).toBe(true)
    expect(isAi({ name: 'Robot', email: 'x@example.com' })).toBe(false)
  })

  it('stays linear on a long hostile identity', () => {
    const hostile = { name: `${'a'.repeat(200_000)}!`, email: `${'@'.repeat(200_000)}x` }
    const started = performance.now()
    expect(isAiIdentity(hostile)).toBe(false)
    expect(performance.now() - started).toBeLessThan(1000)
  })
})
