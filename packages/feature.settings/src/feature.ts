/**
 * @file packages/feature.settings/src/feature.ts
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

import type { Feature } from '@resnovas/engine'
import { Report } from '@resnovas/engine'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { applySettings, FEATURE } from './apply.js'
import { planSettings } from './plan.js'

/** The repository events the settings feature applies settings on. */
export const SETTINGS_EVENTS: ReadonlySet<string> = new Set(['schedule', 'workflow_dispatch', 'push'])

/**
 * Repository settings as code: merging, features, security, the default
 * branch ruleset and deployment environments.
 *
 * @remarks
 * Runs on scheduled, manually dispatched and push events when the config has
 * a `settings` section, and ignores other repository events. Applying
 * settings needs a token with administration write access to the repository
 * (an admin token, not the default `GITHUB_TOKEN`); without one every step
 * fails and is reported. Settings GitHub offers no API for are recorded as
 * notices to set by hand.
 */
export const settingsFeature: Feature = {
  name: FEATURE,
  handles: ['repository'],
  enabled: (config) => config.settings !== undefined,
  run: ({ config, envelope }) =>
    Effect.gen(function* () {
      const settings = config.settings
      if (settings === undefined || !SETTINGS_EVENTS.has(envelope.event)) return
      const report = yield* Report
      const repository = yield* Effect.flatMap(GitHub, (github) => github.getRepository)
      yield* applySettings(planSettings(settings, config.roles, repository))
      if (settings.security?.secretScanning !== undefined && repository.private) {
        yield* report.add({
          feature: FEATURE,
          rule: 'settings.secret-scanning',
          level: 'notice',
          message: 'Secret scanning was not changed: on a private repository it needs a paid Advanced Security licence, so it is left to the organisation.',
        })
      }
      if (settings.security?.privateVulnerabilityReporting !== undefined && repository.private) {
        yield* report.add({
          feature: FEATURE,
          rule: 'settings.private-vulnerability-reporting',
          level: 'notice',
          message: 'Private vulnerability reporting was not changed: GitHub only offers it on public repositories.',
        })
      }
      yield* report.add({
        feature: FEATURE,
        rule: 'settings.push-limit',
        level: 'notice',
        message: 'The push limit has no API, so set it by hand: Settings > General > Pushes > limit branch and tag updates per push.',
      })
    }),
}
