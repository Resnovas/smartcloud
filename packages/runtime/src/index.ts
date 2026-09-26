/**
 * @file packages/runtime/src/index.ts
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
 * What the action, the CLI and the MCP server share: the feature list,
 * config loading, dry runs, settings plans and sync previews.
 *
 * @packageDocumentation
 */

export {
  CONFIG_CANDIDATES,
  ConfigSourceFromGitHub,
  explainConfig,
  loadConfig,
  loadConfigText,
  migrateConfigText,
  NoConfig,
  readLocalConfig,
} from './config.js'
export type { ConfigExplanation, ConfigLocation, ConfigText, FeatureExplanation, Migrated } from './config.js'
export { FEATURES, parseFeatureList, selectFeatures, UnknownFeatures } from './features.js'
export { gitHubConfigSource, InvalidRepository, liveConnect, MissingToken, parseRepository, presetError, PresetUnreadable, resolveToken } from './github.js'
export type { Connect } from './github.js'
export {
  NoSection,
  planRepositorySettings,
  planSettingsForRepository,
  renderRepositorySync,
  renderSyncForRepository,
  settingsPlanText,
} from './plans.js'
export type { RenderedSyncFile, SettingsPlan, SyncRender } from './plans.js'
export {
  configLocationFor,
  describeWrite,
  dryRun,
  dryRunRepository,
  dryRunText,
  InvalidTrigger,
  REPOSITORY_EVENTS,
  runEvent,
  syntheticEvent,
  triggerOf,
  UnexpectedResponse,
} from './run.js'
export type { DryRunOutcome, DryRunRequest, GitHubEvent, RepositoryEvent, RunOutcome, Trigger } from './run.js'
export { explainRule, UnknownRule } from './rules.js'
export type { RuleExplanation } from './rules.js'
// Agents and git hooks check a message before committing, through the same code as the commits feature.
export { checkCommitMessage } from '@resnovas/feature.commits'
