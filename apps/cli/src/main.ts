#!/usr/bin/env node
/**
 * @file apps/cli/src/main.ts
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

import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { telemetry } from '@resnovas/runtime'
import { Effect, Layer } from 'effect'
import { main } from './cli.js'
import { VERSION } from './version.js'

// Closing the telemetry layer flushes it, so a short command still delivers its data.
main(process.argv).pipe(Effect.provide(Layer.merge(NodeContext.layer, telemetry('cli', VERSION))), NodeRuntime.runMain)
