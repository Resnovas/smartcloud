/**
 * @file packages/integrations.posthog/src/transport.ts
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

import { redact } from './redact.js'

/** The `fetch` every telemetry request goes through. Tests pass a fake one. */
export type Fetch = typeof globalThis.fetch

/** How the transport decides what may leave the process. */
export interface TransportOptions {
  /** Sends a request; the global `fetch` in production. */
  readonly fetch: Fetch
  /** Read on every request, so turning telemetry off stops what is already queued. */
  readonly isEnabled: () => boolean
  /** Read on every request, so values protected later are removed too. */
  readonly secrets: () => ReadonlyArray<string>
  /** How long one request may take before it is abandoned. */
  readonly timeoutMs: number
}

const decoder = new TextDecoder()

// The body as text; undefined when there is none, and null for a body, such
// as a stream, that cannot be read without consuming it, which is never sent.
const bodyText = async (body: RequestInit['body']): Promise<string | undefined | null> => {
  if (body === undefined || body === null) return undefined
  if (typeof body === 'string') return body
  if (body instanceof Uint8Array || body instanceof ArrayBuffer) return decoder.decode(body)
  if (body instanceof Blob) return body.text()
  return null
}

// What a request gets when it is not sent.
const unsent = () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })

/**
 * The single gate every telemetry request passes: nothing is sent while
 * telemetry is off, and everything sent is redacted first.
 *
 * @remarks
 * PostHog's client and the OTLP exporters both send JSON, so redacting the
 * body text removes tokens, emails and protected values wherever they are,
 * in messages, attributes or stack traces. While telemetry is off, a request
 * is answered locally with an empty success and never reaches the network.
 * A body that is not text or bytes cannot be checked, so it is never sent.
 * Every request is abandoned after `timeoutMs`, so telemetry cannot hold a
 * run open.
 *
 * @example
 * ```ts import.meta.vitest name="makeTransport"
 * import { makeTransport } from '@resnovas/integrations.posthog'
 *
 * // A fetch that echoes the body back shows what would have been sent.
 * const echo = async (_url: string | URL | Request, init?: RequestInit) => new Response(init?.body)
 * const send = makeTransport({ fetch: echo, isEnabled: () => true, secrets: () => ['Resnovas/smartcloud'], timeoutMs: 5000 })
 * const response = await send('https://eu.i.posthog.com/i/v0/e/', { method: 'POST', body: 'ran on Resnovas/smartcloud' })
 * await response.text() // => 'ran on [redacted]'
 * ```
 *
 * @param options - The underlying `fetch`, the switch, the secrets and the timeout.
 * @returns A `fetch` that gates and redacts.
 */
export const makeTransport =
  (options: TransportOptions): Fetch =>
  async (input, init) => {
    if (!options.isEnabled()) return unsent()
    const text = await bodyText(init?.body)
    if (text === null) return unsent()
    const body = text === undefined ? {} : { body: redact(text, options.secrets()) }
    const headers = new Headers(init?.headers)
    // The body may have changed length.
    headers.delete('content-length')
    const timeout = AbortSignal.timeout(options.timeoutMs)
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout
    return options.fetch(input, { ...init, ...body, headers, signal })
  }
