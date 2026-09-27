/**
 * @file packages/config/src/index.ts
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

export { ExtendsEntry, formatExtendsRef, parseExtendsRef } from './extends.js'
export type { ExtendsRef } from './extends.js'
export { empty, LockedRule, mergeLocked } from './merge.js'
export type { Merged } from './merge.js'
export {
  Color,
  ConventionPreset,
  ConventionRule,
  Conventions,
  Label,
  LabelRule,
  RuleId,
  SIZE_THRESHOLDS,
  SizeLabels,
  sizeThresholds,
  SmartcloudConfig,
  Subjects,
} from './schema.js'
export type { SizeThresholds } from './schema.js'
export {
  ConfigDecodeError,
  ConfigNotFound,
  ConfigParseError,
  ConfigSource,
  ExtendsCycle,
  parseConfig,
  resolveConfig,
} from './load.js'
export type { ResolveOptions, ResolvedConfig } from './load.js'
export {
  AutomaticApprove,
  BranchName,
  Branches,
  Commits,
  Disclosure,
  Freeze,
  FreezeWindow,
  Links,
  parseFreezeTime,
  RequestApproval,
  Required,
  REQUIRED_TIMEOUT,
  Reviews,
  Roles,
  Settings,
  Stale,
  Sync,
} from './sections.js'
export { migrateV1 } from './v1.js'
export type { Migration } from './v1.js'
export { configJsonSchema } from './json-schema.js'
