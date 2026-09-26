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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { NodeContext } from '@effect/platform-node'
import { gitHubConfigSource, liveConnect } from '@resnovas/runtime'
import { Layer, ManagedRuntime } from 'effect'
import { makeServer } from './server.js'

// stdout carries the protocol, so nothing here may print to it.
const runtime = ManagedRuntime.make(Layer.provideMerge(gitHubConfigSource(), NodeContext.layer))
const server = makeServer({ connect: liveConnect(), run: (effect) => runtime.runPromise(effect) })
await server.connect(new StdioServerTransport())
