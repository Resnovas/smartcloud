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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import type { Feature } from '@resnovas/engine'
import { Report } from '@resnovas/engine'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { applySettings, FEATURE } from './apply.js'
import { planSettings } from './plan.js'

/**
 * The repository events the settings feature applies settings on.
 *
 * @example
 * ```ts import.meta.vitest name="SETTINGS_EVENTS"
 * import { SETTINGS_EVENTS } from '@resnovas/feature.settings'
 *
 * SETTINGS_EVENTS.has('schedule') // => true
 * SETTINGS_EVENTS.has('issues') // => false
 * ```
 */
export const SETTINGS_EVENTS: ReadonlySet<string> = new Set(['schedule', 'workflow_dispatch', 'push'])

/**
 * Repository settings as code: merging, features, security, the default
 * branch ruleset, deployment environments, Actions permissions,
 * collaborators and teams, webhooks, Pages and required Actions variables.
 *
 * @remarks
 * Runs on scheduled, manually dispatched and push events when the config has
 * a `settings` section, and ignores other repository events. Applying
 * settings needs a token with administration write access to the repository
 * (an admin token, not the default `GITHUB_TOKEN`); without one every step
 * fails and is reported. Settings GitHub offers no API for are recorded as
 * notices to set by hand.
 *
 * @example
 * ```ts import.meta.vitest name="settingsFeature"
 * import { settingsFeature } from '@resnovas/feature.settings'
 *
 * settingsFeature.enabled?.({ version: 2, settings: {} }) // => true
 * settingsFeature.enabled?.({ version: 2 }) // => false
 * ```
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
      const { applied, failed } = yield* applySettings(planSettings(settings, config.roles, repository))
      // Settings GitHub does not offer on a private repository are left alone, and counted as skipped.
      const skipped =
        [settings.security?.secretScanning, settings.security?.privateVulnerabilityReporting].filter(
          (value) => value !== undefined && repository.private,
        ).length + (settings.actions?.accessLevel !== undefined && !repository.private ? 1 : 0)
      yield* report.measure({
        feature: FEATURE,
        name: 'settings applied',
        values: { applied, failed, skipped, project_type: settings.environments?.projectType ?? 'none' },
      })
      if (settings.security?.secretScanning !== undefined && repository.private) {
        yield* report.add({
          feature: FEATURE,
          rule: 'settings.secret-scanning',
          level: 'notice',
          message:
            'Secret scanning was not changed: on a private repository it needs a paid Advanced Security licence, so it is left to the organisation.',
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
      if (settings.actions?.accessLevel !== undefined && !repository.private) {
        yield* report.add({
          feature: FEATURE,
          rule: 'settings.actions-access',
          level: 'notice',
          message:
            'The Actions access level was not changed: GitHub only has one for private and internal repositories, and every repository can use the actions and reusable workflows of a public one.',
        })
      }
      yield* report.add({
        feature: FEATURE,
        rule: 'settings.push-limit',
        level: 'notice',
        message:
          'The push limit has no API, so set it by hand: Settings > General > Pushes > limit branch and tag updates per push.',
      })
    }),
}
