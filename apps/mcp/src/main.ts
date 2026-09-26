#!/usr/bin/env node
/**
 * @file apps/mcp/src/main.ts
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

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { NodeContext } from '@effect/platform-node'
import { gitHubConfigSource, liveConnect, telemetry } from '@resnovas/runtime'
import { Layer, ManagedRuntime } from 'effect'
import { makeServer } from './server.js'
import { VERSION } from './version.js'

// stdout carries the protocol, so nothing here may print to it. The
// telemetry layer keeps diagnostic logs off the console, and PostHog's own
// client writes to stderr.
const runtime = ManagedRuntime.make(Layer.mergeAll(Layer.provideMerge(gitHubConfigSource(), NodeContext.layer), telemetry('mcp', VERSION)))
const server = makeServer({ connect: liveConnect(), run: (effect) => runtime.runPromise(effect) })
const transport = new StdioServerTransport()
// Disposing the runtime closes the telemetry layer, which flushes what is
// queued and stops its timers, so the process can exit once the client has gone.
let closing: Promise<void> | undefined
const shutdown = () => {
  closing ??= runtime.dispose()
  return closing
}
transport.onclose = () => void shutdown()
process.stdin.once('end', () => void shutdown())
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => void shutdown().finally(() => process.exit(0)))
await server.connect(transport)
