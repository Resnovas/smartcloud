/**
 * @file tests/notifications/src/channels/linear.spec.ts
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
import { linear, linearIssue } from '@resnovas/notifications'
import { Effect, Redacted } from 'effect'
import { fakeHttp, json, notification } from '../fixtures.js'

const key = Redacted.make('lin_api_SECRET')
const options = { type: 'linear', team: 'TEAM' } as const

describe('linearIssue', () => {
  it('adds label ids only when some are configured', () => {
    expect('labelIds' in linearIssue(notification, options)).toBe(false)
    expect(linearIssue(notification, { ...options, labels: ['L1'] }).labelIds).toStrictEqual(['L1'])
  })
})

describe('linear channel', () => {
  it.effect('creates an issue in the team with the API key', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({ data: { issueCreate: { success: true } } }))
      yield* linear.send(notification, options, key).pipe(Effect.provide(http.layer))
      expect(http.sent[0]?.url).toBe('https://api.linear.app/graphql')
      expect(http.sent[0]?.headers['authorization']).toBe('lin_api_SECRET')
      expect(http.sent[0]?.body).toMatchObject({ variables: { input: linearIssue(notification, options) } })
    }),
  )

  it.effect('fails with the first GraphQL error', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({ data: null, errors: [{ message: 'Entity not found: Team' }] }))
      const error = yield* Effect.flip(linear.send(notification, options, key).pipe(Effect.provide(http.layer)))
      expect(error.message).toBe('linear: Entity not found: Team')
    }),
  )

  it.effect('fails when Linear does not report success', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({ data: { issueCreate: { success: false } } }))
      const error = yield* Effect.flip(linear.send(notification, options, key).pipe(Effect.provide(http.layer)))
      expect(error.message).toBe('linear: Linear did not create the issue')
    }),
  )

  it.effect('fails on an answer that is not Linear GraphQL', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({ errors: 'nope' }))
      const error = yield* Effect.flip(linear.send(notification, options, key).pipe(Effect.provide(http.layer)))
      expect(error.message).toBe('linear: unexpected response from Linear')
    }),
  )

  it.effect('fails with the status when Linear refuses the key', () =>
    Effect.gen(function* () {
      const http = fakeHttp(() => json({}, 401))
      const error = yield* Effect.flip(linear.send(notification, options, key).pipe(Effect.provide(http.layer)))
      expect(error.message).toBe('linear: HTTP 401')
    }),
  )
})
