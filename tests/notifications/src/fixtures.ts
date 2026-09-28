/**
 * @file tests/notifications/src/fixtures.ts
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

import { HttpClient, HttpClientError, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import type { RunResult } from '@resnovas/engine'
import type { Notification } from '@resnovas/notifications'
import { Effect, Layer } from 'effect'

/** A request the fake client received, with its JSON body parsed. */
export interface Sent {
  readonly method: string
  readonly url: string
  readonly headers: Readonly<Record<string, string>>
  readonly body: unknown
}

const bodyOf = (request: HttpClientRequest.HttpClientRequest): unknown =>
  request.body._tag === 'Uint8Array' ? JSON.parse(new TextDecoder().decode(request.body.body)) : undefined

/**
 * An HTTP client that records every request and answers with `answer`,
 * or fails the request when `answer` returns `'transport'`.
 */
export const fakeHttp = (
  answer: (request: HttpClientRequest.HttpClientRequest) => Response | 'transport' = () => new Response('ok'),
) => {
  const sent: Array<Sent> = []
  const client = HttpClient.make((request) =>
    Effect.suspend(() => {
      sent.push({ method: request.method, url: request.url, headers: request.headers, body: bodyOf(request) })
      const response = answer(request)
      return response === 'transport'
        ? Effect.fail(new HttpClientError.RequestError({ request, reason: 'Transport' }))
        : Effect.succeed(HttpClientResponse.fromWeb(request, response))
    }),
  )
  return { sent, layer: Layer.succeed(HttpClient.HttpClient, client) }
}

export const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })

export const notification: Notification = {
  kind: 'failures',
  repository: 'Resnovas/smartcloud',
  title: '1 policy failure on pull request #7 in Resnovas/smartcloud',
  lines: ['error AI-02: <!channel> sign-off missing'],
  url: 'https://github.com/Resnovas/smartcloud/pull/7',
}

export const run = (overrides: Partial<RunResult> = {}): RunResult => ({
  envelope: { kind: 'repository', event: 'schedule' },
  ran: [],
  skipped: [],
  failed: [],
  durations: {},
  findings: [],
  changes: [],
  facts: [],
  ...overrides,
})

export const subject = (kind: 'pullRequest' | 'issue', number: number) => ({
  kind,
  number,
  title: 'A change',
  body: '',
  author: 'ann',
  open: true,
  locked: false,
  labels: [],
  updatedAt: new Date(0),
})
