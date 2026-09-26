/**
 * @file packages/integrations.posthog/src/index.ts
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

/**
 * The PostHog integration: telemetry (events, error tracking, logs, traces
 * and metrics) and feature flags through OpenFeature, all redacted and all
 * behind one opt-out.
 *
 * @packageDocumentation
 */

export { DEFAULT_HOST, DEFAULT_PROJECT_KEY, telemetrySettings } from './config.js'
export type { TelemetrySettings } from './config.js'
export { anonymousIdentity, identify, ORGANIZATION_GROUP } from './identity.js'
export type { Identity, Surface } from './identity.js'
export {
  bindRepository,
  describeOrganization,
  emit,
  errorTag,
  invocation,
  noteOptions,
  protect,
  track,
} from './invocation.js'
export type { InvocationOptions, InvocationSummary, TelemetryEvent, TrackOptions } from './invocation.js'
export { redact, REDACTED } from './redact.js'
export { disabledTelemetry, evaluateFlag, optOut, reportError, Telemetry, telemetryLayer } from './telemetry.js'
export type { Properties, PropertyValue, RepositoryName, TelemetryOptions, TelemetryService } from './telemetry.js'
export { makeTransport } from './transport.js'
export type { Fetch, TransportOptions } from './transport.js'
