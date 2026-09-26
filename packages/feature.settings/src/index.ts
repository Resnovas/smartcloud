/**
 * @file packages/feature.settings/src/index.ts
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
 * Repository settings as code for smartcloud (SMC-12).
 *
 * @remarks
 * Applying settings needs a token with administration write access to the
 * repository: an admin token, not the default workflow `GITHUB_TOKEN`.
 *
 * @packageDocumentation
 */

export { applySettings, ensureDeploymentPolicies, FEATURE, UnexpectedResponse, upsertRuleset } from './apply.js'
export type { AppliedSettings } from './apply.js'
export { SETTINGS_EVENTS, settingsFeature } from './feature.js'
export {
  DEFAULT_RULESET_NAME,
  deploymentPoliciesFor,
  ENVIRONMENT_SETS,
  environmentBody,
  environmentsFor,
  isProtectedEnvironment,
  planSettings,
  RELEASE_TAG_PATTERN,
  rulesetBody,
} from './plan.js'
export type {
  BypassActor,
  DeploymentPoliciesStep,
  DeploymentPolicy,
  GraphqlStep,
  ProjectType,
  RestStep,
  RolesConfig,
  RulesetBody,
  RulesetRule,
  RulesetStep,
  SettingsConfig,
  SettingsStep,
} from './plan.js'
