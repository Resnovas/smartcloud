/**
 * @file packages/feature.sync/src/index.ts
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

export { DEFAULT_POLICY_BASE, DEFAULT_SYNC_BRANCH, parseSource, syncFeature, SyncSourceInvalid } from './feature.js'
export type { SyncConfig } from './feature.js'
export { BEGIN, END, isMarker, LOCAL, managedConflicts, mergeManaged, splitManaged, syncFindings } from './managed.js'
export type { ManagedParts, SyncedFile, SyncFinding } from './managed.js'
export { planSync } from './plan.js'
export type { CurrentFile, PlannedConflict, PlannedFile, SyncPlan } from './plan.js'
export { MissingValue, renderAll, renderText } from './render.js'
export type { RenderedFile, Template, Values } from './render.js'
export { InvalidValues, list, parseValues, unquote } from './values.js'
