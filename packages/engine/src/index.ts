/**
 * @file packages/engine/src/index.ts
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

export { decodeEvent, EventDecodeError } from './events.js'
export type { Envelope, IssueEnvelope, PullRequestEnvelope, RepositoryEnvelope, UnsupportedEnvelope } from './events.js'
export { findingsCounter, makeReport, Report } from './report.js'
export type { Change, Fact, Finding, ReportSnapshot } from './report.js'
export { featureDuration, loadFacets, runFeatures } from './runner.js'
export type { EnvelopeKind, Feature, FeatureContext, RunResult, SupportedEnvelope } from './runner.js'
