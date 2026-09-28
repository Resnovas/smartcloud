/**
 * @file tests/feature.commands/src/permission.spec.ts
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
import { DEFAULT_POLICIES, includes, policyFor, roleOf } from '@resnovas/feature.commands'
import { Forbidden, NotFound } from '@resnovas/integrations.github'
import { COMMAND_NAMES } from '@resnovas/config'
import { Effect } from 'effect'
import { fail, makeGitHub, ok, role } from './fixtures.js'
import { GitHub } from '@resnovas/integrations.github'

const read = (answer: ReturnType<typeof ok>) =>
  roleOf('maya').pipe(
    Effect.provideService(GitHub, makeGitHub({ 'GET /collaborators/maya/permission': answer }).service),
  )

describe('permissions', () => {
  it('ranks roles, each including the ones below it', () => {
    expect(includes('admin', 'maintain')).toBe(true)
    expect(includes('none', 'read')).toBe(false)
  })

  it('has a default policy for every command, and applies overrides field by field', () => {
    expect(Object.keys(DEFAULT_POLICIES).sort()).toStrictEqual([...COMMAND_NAMES].sort())
    expect(policyFor({ version: 2, commands: { overrides: { close: { enabled: false } } } }, 'close')).toStrictEqual({
      enabled: false,
      permission: 'triage',
      author: true,
    })
    expect(policyFor({ version: 2, commands: { overrides: { close: { author: false } } } }, 'close').author).toBe(false)
  })

  it.effect("reads a built-in role, and falls back to a custom role's base permission", () =>
    Effect.gen(function* () {
      expect(yield* read(ok(role('maintain', 'write')))).toBe('maintain')
      expect(yield* read(ok(role('release-manager', 'write')))).toBe('write')
      expect(yield* read(ok({ permission: 'read', role_name: null }))).toBe('read')
      expect(yield* read(ok({ permission: 'admin' }))).toBe('admin')
    }),
  )

  it.effect('fails closed: an unknown permission, someone who is not a collaborator, or an odd answer is no role', () =>
    Effect.gen(function* () {
      expect(yield* read(ok({ permission: 'constructor', role_name: 'nonsense' }))).toBe('none')
      expect(yield* read(fail(new NotFound({ operation: 'x', detail: 'y' })))).toBe('none')
      expect(yield* read(ok('not an object'))).toBe('none')
      expect((yield* Effect.flip(read(fail(new Forbidden({ operation: 'x', detail: 'y' })))))._tag).toBe('Forbidden')
    }),
  )
})
