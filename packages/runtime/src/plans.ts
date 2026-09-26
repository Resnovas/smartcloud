/**
 * @file packages/runtime/src/plans.ts
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

import { formatExtendsRef, type SmartcloudConfig } from '@resnovas/config'
import { planSettings, type SettingsStep } from '@resnovas/feature.settings'
import { previewSync } from '@resnovas/feature.sync'
import { GitHub, type Repository } from '@resnovas/integrations.github'
import { Data, Effect } from 'effect'
import { loadConfig } from './config.js'
import { parseRepository, type Connect } from './github.js'
import { configLocationFor } from './run.js'

/** The config has no section for what was asked. */
export class NoSection extends Data.TaggedError('NoSection')<{ readonly section: string }> {
  override get message() {
    return `the config has no ${this.section} section`
  }
}

/** The settings a repository's config would apply, and the repository they are for. */
export interface SettingsPlan {
  readonly repository: Repository
  readonly steps: ReadonlyArray<SettingsStep>
}

/**
 * Plans the settings for the provided repository without applying them.
 *
 * @param config - The resolved config.
 * @returns The plan; no steps when the config has no `settings` section.
 */
export const planRepositorySettings = (config: SmartcloudConfig) =>
  Effect.map(
    Effect.flatMap(GitHub, (github) => github.getRepository),
    (repository): SettingsPlan => ({ repository, steps: config.settings === undefined ? [] : planSettings(config.settings, config.roles, repository) }),
  )

const stepTarget = (step: SettingsStep) => {
  switch (step.kind) {
    case 'rest':
      return `${step.request.method} /repos/{owner}/{repo}${step.request.path}${step.request.body === undefined ? '' : ` ${JSON.stringify(step.request.body)}`}`
    case 'graphql':
      return `GraphQL ${step.query}`
    case 'ruleset':
      return `create or update by name: ${JSON.stringify(step.ruleset)}`
  }
}

/**
 * A settings plan as text, one step per line.
 *
 * @param plan - The plan.
 * @returns Markdown.
 */
export const settingsPlanText = (plan: SettingsPlan): string =>
  plan.steps.length === 0
    ? `Nothing to apply to ${plan.repository.fullName}: the config sets no repository settings.`
    : [
        `Settings for ${plan.repository.fullName}, in order:`,
        ...plan.steps.map((step) => `- \`${step.id}\`: ${step.description}${step.optional ? ' (may fail; reported as a warning)' : ''}\n  ${stepTarget(step)}`),
      ].join('\n')

/**
 * Connects to a repository, loads its config, and plans its settings.
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, and a local config file to use instead of its own.
 * @returns The plan.
 */
export const planSettingsForRepository = (connect: Connect, request: { readonly repository: string; readonly config?: string | undefined }) =>
  Effect.gen(function* () {
    const coordinates = yield* parseRepository(request.repository)
    const location = yield* configLocationFor(request.config)
    const service = yield* connect(coordinates)
    return yield* Effect.flatMap(loadConfig(location), (resolved) => planRepositorySettings(resolved.config)).pipe(
      Effect.provideService(GitHub, service),
    )
  })

/** A synced file as it would be after the sync. */
export interface RenderedSyncFile {
  readonly path: string
  readonly content: string
  readonly executable: boolean
  readonly status: 'added' | 'updated' | 'made executable' | 'unchanged'
}

/** Every synced file of a repository, and the local rules that conflict with synced ones. */
export interface SyncRender {
  readonly source: string
  readonly files: ReadonlyArray<RenderedSyncFile>
  readonly conflicts: ReadonlyArray<{ readonly path: string; readonly problem: string }>
}

const STATUS = { create: 'added', update: 'updated', mode: 'made executable' } as const

/**
 * Renders every synced file for the provided repository as it would be
 * after the sync, without proposing anything.
 *
 * @param config - The resolved config.
 * @returns The files, sorted by path, and the conflicts.
 */
export const renderRepositorySync = (config: SmartcloudConfig) =>
  Effect.gen(function* () {
    if (config.sync === undefined) return yield* new NoSection({ section: 'sync' })
    const preview = yield* previewSync(config.sync)
    const planned = new Set(preview.plan.files.map((file) => file.path))
    const files: ReadonlyArray<RenderedSyncFile> = [
      ...preview.plan.files.map((file) => ({ path: file.path, content: file.content, executable: file.executable, status: STATUS[file.reason] })),
      // The current files are only those of synced templates, so any the plan leaves alone are unchanged.
      ...[...preview.current]
        .filter(([path]) => !planned.has(path))
        .map(([path, file]) => ({ path, content: file.content, executable: file.executable, status: 'unchanged' as const })),
    ]
    const render: SyncRender = {
      source: formatExtendsRef(preview.source),
      files: [...files].sort((a, b) => (a.path < b.path ? -1 : 1)),
      conflicts: preview.plan.conflicts,
    }
    return render
  })

/**
 * Connects to a repository, loads its config, and renders its synced files.
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, and a local config file to use instead of its own.
 * @returns The rendered files.
 */
export const renderSyncForRepository = (connect: Connect, request: { readonly repository: string; readonly config?: string | undefined }) =>
  Effect.gen(function* () {
    const coordinates = yield* parseRepository(request.repository)
    const location = yield* configLocationFor(request.config)
    const service = yield* connect(coordinates)
    return yield* Effect.flatMap(loadConfig(location), (resolved) => renderRepositorySync(resolved.config)).pipe(
      Effect.provideService(GitHub, service),
    )
  })
