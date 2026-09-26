/**
 * @file tests/integrations.posthog/src/transport.spec.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { makeTransport, REDACTED } from '@resnovas/integrations.posthog'
import { fakeFetch } from './fake-fetch.js'

const TOKEN = 'ghp_abcdefghijklmnopqrstuvwxyz0123'

describe('makeTransport', () => {
  it('sends nothing while telemetry is off', async () => {
    const fake = fakeFetch()
    const send = makeTransport({ fetch: fake.fetch, isEnabled: () => false, secrets: () => [], timeoutMs: 1000 })
    const response = await send('https://example.test/batch/', { method: 'POST', body: '{}' })
    expect(response.status).toBe(200)
    expect(fake.sent).toStrictEqual([])
  })

  it('redacts text, bytes and blobs, and drops the content length', async () => {
    const bodies: Array<unknown> = []
    const lengths: Array<string | null> = []
    const send = makeTransport({
      fetch: async (_input, init) => {
        bodies.push(init?.body)
        lengths.push(new Headers(init?.headers).get('content-length'))
        return new Response('{}')
      },
      isEnabled: () => true,
      secrets: () => ['owner/repo'],
      timeoutMs: 1000,
    })
    const text = `{"message":"${TOKEN} in owner/repo"}`
    await send('https://example.test/a', { method: 'POST', body: text, headers: { 'content-length': '99' } })
    await send('https://example.test/b', { method: 'POST', body: new TextEncoder().encode(text) })
    await send('https://example.test/c', { method: 'POST', body: new TextEncoder().encode(text).buffer })
    await send('https://example.test/d', { method: 'POST', body: new Blob([text]) })
    const expected = `{"message":"${REDACTED} in ${REDACTED}"}`
    expect(bodies).toStrictEqual([expected, expected, expected, expected])
    expect(lengths).toStrictEqual([null, null, null, null])
  })

  it('sends a request without a body as it is, and never sends a body it cannot read', async () => {
    const fake = fakeFetch()
    const send = makeTransport({ fetch: fake.fetch, isEnabled: () => true, secrets: () => [], timeoutMs: 1000 })
    await send('https://example.test/get')
    await send('https://example.test/stream', { method: 'POST', body: new ReadableStream() })
    expect(fake.sent.map((request) => request.path)).toStrictEqual(['/get'])
  })

  it('abandons a request after the timeout, or when the caller aborts', async () => {
    const hanging: typeof globalThis.fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        if (init?.signal?.aborted === true) reject(new Error('aborted'))
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
      })
    const send = makeTransport({ fetch: hanging, isEnabled: () => true, secrets: () => [], timeoutMs: 10 })
    await expect(send('https://example.test/slow')).rejects.toThrow('aborted')
    const controller = new AbortController()
    const slow = makeTransport({ fetch: hanging, isEnabled: () => true, secrets: () => [], timeoutMs: 60_000 })
    const pending = slow('https://example.test/slow', { signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toThrow('aborted')
  })
})
