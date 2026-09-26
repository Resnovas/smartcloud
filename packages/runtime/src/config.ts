/**
 * @file packages/runtime/src/config.ts
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

import { FileSystem } from '@effect/platform'
import {
  ConfigSource,
  parseConfig,
  resolveConfig,
  SmartcloudConfig,
  type ResolvedConfig,
} from '@resnovas/config'
import type { EnvelopeKind, Feature } from '@resnovas/engine'
import { GitHub } from '@resnovas/integrations.github'
import { optOut } from '@resnovas/integrations.posthog'
import { Data, Effect, Layer, Option, Schema } from 'effect'
import { stringify } from 'yaml'
import { recordConfig } from './analytics.js'
import { FEATURE_SECTIONS, FEATURES } from './features.js'
import { presetError } from './github.js'

/**
 * Where smartcloud looks for a config when none is named, in order.
 *
 * @example
 * ```ts import.meta.vitest name="CONFIG_CANDIDATES"
 * import { CONFIG_CANDIDATES } from '@resnovas/runtime'
 *
 * CONFIG_CANDIDATES[0] // => '.github/smartcloud.yml'
 * ```
 */
export const CONFIG_CANDIDATES = ['.github/smartcloud.yml', '.github/smartcloud.yaml', '.github/config.json'] as const

/**
 * No config was found where smartcloud looked for one.
 *
 * @example
 * ```ts import.meta.vitest name="NoConfig"
 * import { NoConfig } from '@resnovas/runtime'
 *
 * new NoConfig({ where: 'Resnovas/example', paths: ['a.yml'] }).message // => 'no smartcloud config in Resnovas/example: looked for a.yml'
 * ```
 */
export class NoConfig extends Data.TaggedError('NoConfig')<{ readonly where: string; readonly paths: ReadonlyArray<string> }> {
  override get message() {
    return `no smartcloud config in ${this.where}: looked for ${this.paths.join(', ')}`
  }
}

/** Config text and the name it is reported under. */
export interface ConfigText {
  readonly text: string
  readonly source: string
}

/**
 * Where a run's config comes from.
 *
 * @remarks
 * Text given directly wins. Otherwise the config is read from the repository
 * through the GitHub API: `path`, or the first of {@link CONFIG_CANDIDATES},
 * at `ref`, or the default branch.
 */
export interface ConfigLocation {
  readonly text?: ConfigText
  readonly path?: string
  readonly ref?: string
}


/**
 * Reads presets named in `extends` through whichever GitHub service is provided.
 *
 * @example
 * ```ts
 * import { resolveConfig } from '@resnovas/config'
 * import { ConfigSourceFromGitHub } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const resolved = resolveConfig('version: 2\nextends: [Resnovas/.github/house.yml]\n', 'smartcloud.yml').pipe(
 *   Effect.provide(ConfigSourceFromGitHub),
 * )
 * ```
 */
export const ConfigSourceFromGitHub = Layer.effect(
  ConfigSource,
  Effect.map(GitHub, (github) => ({
    read: (ref) => github.getFile(ref).pipe(Effect.mapError(presetError(ref))),
  })),
)

/**
 * Reads the config text for a run.
 *
 * @example
 * ```ts
 * import { loadConfigText } from '@resnovas/runtime'
 *
 * // Needs the GitHub service; tries each of CONFIG_CANDIDATES on the default branch.
 * const text = loadConfigText({ path: '.github/smartcloud.yml', ref: 'main' })
 * ```
 *
 * @param location - Where the config is.
 * @returns The text and its name, or {@link NoConfig} when the repository has none.
 */
export const loadConfigText = (location: ConfigLocation) =>
  Effect.gen(function* () {
    if (location.text !== undefined) return location.text
    const github = yield* GitHub
    const { owner, repo } = github.coordinates
    const at = location.ref === undefined ? {} : { ref: location.ref }
    const paths = location.path === undefined ? CONFIG_CANDIDATES : [location.path]
    for (const path of paths) {
      const text = yield* github.getFile({ owner, repo, path, ...at }).pipe(
        Effect.map(Option.some),
        Effect.catchTag('NotFound', () => Effect.succeedNone),
      )
      if (Option.isSome(text)) return { text: text.value, source: path }
    }
    const where = `${owner}/${repo}${location.ref === undefined ? '' : `@${location.ref}`}`
    return yield* new NoConfig({ where, paths })
  })

/**
 * Reads a run's config and resolves everything it extends.
 *
 * @remarks
 * Presets are read with the same GitHub service, so a dry run reads them
 * through the dry-run layer like every other read. A config that says
 * `telemetry: false` turns telemetry off for the rest of the process as soon
 * as it is read. Traced as `smartcloud.config.resolve`, with counts only.
 *
 * @example
 * ```ts
 * import { loadConfig } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const sources = loadConfig({}).pipe(Effect.map((resolved) => resolved.sources))
 * ```
 *
 * @param location - Where the config is.
 * @returns The resolved config.
 */
export const loadConfig = (location: ConfigLocation) =>
  Effect.gen(function* () {
    const { text, source } = yield* loadConfigText(location)
    const resolved: ResolvedConfig = yield* resolveConfig(text, source).pipe(Effect.provide(ConfigSourceFromGitHub))
    // Only counts: sources name presets, their repositories and paths.
    const counts = { sources: resolved.sources.length, warnings: resolved.warnings.length, locked: resolved.locked.size }
    yield* Effect.annotateCurrentSpan(counts)
    yield* Effect.logDebug(`config: resolved from ${counts.sources} source(s) with ${counts.warnings} warning(s)`).pipe(
      Effect.annotateLogs(counts),
    )
    // Opting out comes first, so a config that turns telemetry off sends nothing about itself.
    if (resolved.config.telemetry === false) yield* optOut
    yield* recordConfig(resolved, text)
    return resolved
  }).pipe(Effect.withSpan('smartcloud.config.resolve', { captureStackTrace: false, attributes: { 'config.from': location.text === undefined ? 'repository' : 'text' } }))

/**
 * Reads a config from the local disk.
 *
 * @example
 * ```ts
 * import { readLocalConfig } from '@resnovas/runtime'
 *
 * const text = readLocalConfig('.github/smartcloud.yml')
 * ```
 *
 * @param path - The file.
 * @returns The text, named by its path.
 */
export const readLocalConfig = (path: string) =>
  Effect.map(
    Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readFileString(path)),
    (text): ConfigText => ({ text, source: path }),
  )

// The schema hint lets editors complete and check the file.
const SCHEMA_HINT = '# yaml-language-server: $schema=https://raw.githubusercontent.com/Resnovas/smartcloud/main/schema/smartcloud.schema.json'

/** A config converted to v2 YAML. */
export interface Migrated {
  readonly config: SmartcloudConfig
  readonly yaml: string
  /** Everything the migration did not carry over. */
  readonly warnings: ReadonlyArray<string>
}

/**
 * Converts a v1 JSON config to v2 YAML.
 *
 * @remarks
 * A v2 config comes back unchanged apart from formatting. The YAML starts
 * with a schema hint for editors.
 *
 * @example
 * ```ts import.meta.vitest name="migrateConfigText"
 * import { migrateConfigText } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * const migrated = Effect.runSync(migrateConfigText('{ "version": 2 }', 'config.json'))
 * migrated.yaml.endsWith('version: 2\n') // => true
 * ```
 *
 * @param text - The config, JSON or YAML.
 * @param source - Its name, for errors and warnings.
 * @returns The migrated config.
 */
export const migrateConfigText = (text: string, source: string) =>
  Effect.map(
    parseConfig(text, source),
    ({ config, warnings }): Migrated => ({
      config,
      yaml: `${SCHEMA_HINT}\n${stringify(Schema.encodeSync(SmartcloudConfig)(config))}`,
      warnings,
    }),
  )

/** One feature, as a resolved config sets it up. */
export interface FeatureExplanation {
  readonly name: string
  readonly enabled: boolean
  /** The kinds of event it acts on. */
  readonly handles: ReadonlyArray<EnvelopeKind>
  /** The config sections it reads, as written in the config. */
  readonly rules: Readonly<Record<string, unknown>>
}

/** A resolved config, explained. */
export interface ConfigExplanation {
  /** Every source that contributed, presets first. */
  readonly sources: ReadonlyArray<string>
  /** Values set by a preset, which the repository cannot change. */
  readonly locked: ReadonlyArray<string>
  readonly warnings: ReadonlyArray<string>
  readonly features: ReadonlyArray<FeatureExplanation>
}

/**
 * Explains a resolved config: which features it enables and the rules each
 * one reads.
 *
 * @example
 * ```ts import.meta.vitest name="explainConfig"
 * import { explainConfig } from '@resnovas/runtime'
 *
 * const explained = explainConfig({ config: { version: 2 }, sources: ['smartcloud.yml'], locked: new Set(), warnings: [] })
 * explained.features.length // => 8
 * ```
 *
 * @param resolved - The resolved config.
 * @param features - The features to explain; every feature by default.
 * @returns The explanation, in the order the features are given.
 */
export const explainConfig = (resolved: ResolvedConfig, features: ReadonlyArray<Feature> = FEATURES): ConfigExplanation => {
  const encoded = Schema.encodeSync(SmartcloudConfig)(resolved.config)
  return {
    sources: resolved.sources,
    locked: [...resolved.locked].sort(),
    warnings: resolved.warnings,
    features: features.map((feature) => {
      const rules: Record<string, unknown> = {}
      for (const key of FEATURE_SECTIONS.get(feature.name) ?? [])
        if (encoded[key] !== undefined) rules[key] = encoded[key]
      return {
        name: feature.name,
        enabled: feature.enabled?.(resolved.config) ?? true,
        handles: feature.handles,
        rules,
      }
    }),
  }
}
