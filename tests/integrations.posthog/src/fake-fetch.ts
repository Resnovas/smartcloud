/**
 * @file tests/integrations.posthog/src/fake-fetch.ts
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

// A stand-in for fetch that records every telemetry request and answers it
// locally, so the integration is tested without touching the network.

/** A request that reached the network. */
export interface Sent {
  readonly url: string
  readonly path: string
  readonly body: string
}

/** How the fake answers a path: a status and JSON, a thrown network error, or never. */
export type Reply = { readonly status?: number; readonly body?: unknown } | { readonly networkError: string } | { readonly hang: true }

export const fakeFetch = (routes: Readonly<Record<string, Reply>> = {}) => {
  const sent: Array<Sent> = []
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const path = new URL(url).pathname
    const body = typeof init?.body === 'string' ? init.body : ''
    sent.push({ url, path, body })
    const reply = routes[path] ?? {}
    if ('networkError' in reply) throw new TypeError(reply.networkError)
    if ('hang' in reply) return new Promise<Response>(() => undefined)
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status ?? 200, headers: { 'content-type': 'application/json' } })
  }
  return { fetch, sent, text: () => sent.map((request) => request.body).join('\n') }
}
