/**
 * @file tests/integrations.github/src/fake-fetch.ts
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

// A stand-in for fetch that serves canned GitHub responses and records every
// request, so the live service is tested without touching the network.

/** A request the live service made. */
export interface Recorded {
  readonly method: string
  readonly path: string
  readonly query: string
  readonly body: unknown
}

/** A canned response: JSON with a status, or a thrown network error. */
export type Reply = { readonly status?: number; readonly body?: unknown } | { readonly networkError: string }

/** Routes keyed by `METHOD /path`; a list of replies is served in order, the last repeating. */
export type Routes = Readonly<Record<string, Reply | ReadonlyArray<Reply>>>

export const fakeFetch = (routes: Routes) => {
  const requests: Array<Recorded> = []
  const served = new Map<string, number>()
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    const method = init?.method ?? 'GET'
    const text = typeof init?.body === 'string' ? init.body : undefined
    // Octokit encodes the slashes in nested content paths; GitHub accepts both forms.
    const path = decodeURIComponent(url.pathname)
    requests.push({ method, path, query: url.search, body: text === undefined ? undefined : JSON.parse(text) })
    const key = `${method} ${path}`
    const route = routes[key]
    if (route === undefined) throw new Error(`no fake route for ${key}`)
    const replies = Array.isArray(route) ? route : [route]
    const index = served.get(key) ?? 0
    served.set(key, index + 1)
    const reply = replies[Math.min(index, replies.length - 1)]
    if (reply === undefined) throw new Error(`no reply for ${key}`)
    if ('networkError' in reply) throw new TypeError(reply.networkError)
    const status = reply.status ?? 200
    return status === 204
      ? new Response(null, { status })
      : new Response(JSON.stringify(reply.body ?? {}), { status, headers: { 'content-type': 'application/json' } })
  }
  return { fetch, requests }
}
