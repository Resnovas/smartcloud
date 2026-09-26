/**
 * @file packages/config/src/load.ts
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

import { Context, Data, Effect, Either, ParseResult, Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import { ExtendsEntry, type ExtendsRef, formatExtendsRef, parseExtendsRef } from './extends.js'
import { empty, type Merged, mergeLocked } from './merge.js'
import { SmartcloudConfig } from './schema.js'
import { migrateV1 } from './v1.js'

/** The config text could not be parsed as YAML or JSON. */
export class ConfigParseError extends Data.TaggedError('ConfigParseError')<{
  readonly source: string
  readonly reason: string
}> {
  override get message() {
    return `${this.source} is not valid YAML or JSON: ${this.reason}`
  }
}

/** The config parsed but does not match the schema. */
export class ConfigDecodeError extends Data.TaggedError('ConfigDecodeError')<{
  readonly source: string
  readonly reason: string
}> {
  override get message() {
    return `${this.source} is not a valid smartcloud config:\n${this.reason}`
  }
}

/** A preset could not be read. */
export class ConfigNotFound extends Data.TaggedError('ConfigNotFound')<{ readonly source: string }> {
  override get message() {
    return `${this.source} could not be read`
  }
}

/** Presets extend each other in a loop. */
export class ExtendsCycle extends Data.TaggedError('ExtendsCycle')<{ readonly chain: ReadonlyArray<string> }> {
  override get message() {
    return `presets extend each other in a loop: ${this.chain.join(' -> ')}`
  }
}

/**
 * Reads preset files named in `extends`. The GitHub integration provides the
 * real implementation; tests provide files from memory.
 */
export class ConfigSource extends Context.Tag('@resnovas/config/ConfigSource')<
  ConfigSource,
  { readonly read: (ref: ExtendsRef) => Effect.Effect<string, ConfigNotFound> }
>() {}

/** A config with its presets merged in. */
export interface ResolvedConfig {
  readonly config: SmartcloudConfig
  /** Every source that contributed, presets first, the repository's own config last. */
  readonly sources: ReadonlyArray<string>
  /** Values a preset set, which the repository config cannot change, as dotted paths. */
  readonly locked: ReadonlySet<string>
  readonly warnings: ReadonlyArray<string>
}

type ConfigError = ConfigParseError | ConfigDecodeError | ConfigNotFound | ExtendsCycle | import('./merge.js').LockedRule

// Presets may extend presets, but a chain this deep is a mistake, not a design.
const MAX_DEPTH = 5

const decodeV2 = Schema.decodeUnknownEither(SmartcloudConfig, { onExcessProperty: 'error', errors: 'all' })
const encodeV2 = Schema.encodeSync(SmartcloudConfig)

type Json = null | boolean | number | string | ReadonlyArray<Json> | { readonly [key: string]: Json }
const isRecord = (value: unknown): value is Readonly<Record<string, Json>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// An encoded config is plain JSON; this makes that explicit for the merge.
const toJson = (config: SmartcloudConfig): Readonly<Record<string, Json>> => {
  const json: unknown = JSON.parse(JSON.stringify(encodeV2(config)))
  return isRecord(json) ? json : {}
}

/**
 * Parses and decodes one config file, migrating it first when it is v1.
 *
 * @remarks
 * A config with `version: 2` is v2; anything else is treated as v1 and
 * migrated, with a warning for every v1 key that is not carried over.
 *
 * @param text - The file's contents, YAML or JSON.
 * @param source - The file's name, for errors.
 * @returns The decoded config and any migration warnings.
 */
export const parseConfig = (
  text: string,
  source: string,
): Effect.Effect<{ readonly config: SmartcloudConfig; readonly warnings: ReadonlyArray<string> }, ConfigParseError | ConfigDecodeError> =>
  Effect.gen(function* () {
    const raw = yield* Effect.try({
      try: (): unknown => parseYaml(text),
      catch: (error) => new ConfigParseError({ source, reason: error instanceof Error ? error.message : String(error) }),
    })
    if (!isRecord(raw)) return yield* new ConfigDecodeError({ source, reason: 'expected a mapping at the top level' })
    const migrated = raw['version'] === 2 ? { config: raw, warnings: [] } : migrateV1(raw)
    const decoded = decodeV2(migrated.config)
    if (Either.isLeft(decoded)) {
      return yield* new ConfigDecodeError({ source, reason: ParseResult.TreeFormatter.formatErrorSync(decoded.left) })
    }
    return { config: decoded.right, warnings: migrated.warnings.map((warning) => `${source}: ${warning}`) }
  })

const decodeExtends = Schema.decodeUnknownEither(Schema.Array(ExtendsEntry))

/**
 * Reads one file of an extends chain: parsed, migrated when it is v1, and
 * normalised when it is a complete config on its own.
 *
 * @remarks
 * A file that extends presets may leave out keys a preset provides, so it is
 * not rejected for being incomplete here; resolveConfig checks the merged
 * result. Its extends entries are always checked.
 */
const parseLayer = (text: string, source: string) =>
  Effect.gen(function* () {
    const raw = yield* Effect.try({
      try: (): unknown => parseYaml(text),
      catch: (error) => new ConfigParseError({ source, reason: error instanceof Error ? error.message : String(error) }),
    })
    if (!isRecord(raw)) return yield* new ConfigDecodeError({ source, reason: 'expected a mapping at the top level' })
    const migrated = raw['version'] === 2 ? { config: raw, warnings: [] } : migrateV1(raw)
    const warnings = migrated.warnings.map((warning) => `${source}: ${warning}`)
    const entries = decodeExtends(migrated.config['extends'] ?? [])
    if (Either.isLeft(entries)) {
      return yield* new ConfigDecodeError({ source, reason: ParseResult.TreeFormatter.formatErrorSync(entries.left) })
    }
    // A complete file is normalised through the schema; an incomplete one is
    // merged as written and checked once merged.
    const decoded = decodeV2(migrated.config)
    const json = Either.isRight(decoded) ? toJson(decoded.right) : migrated.config
    return { json, extends: entries.right, warnings }
  })

/**
 * Loads a config and every preset it extends, and merges them.
 *
 * @remarks
 * Presets are merged first, in the order listed, each one's own presets
 * before it, and the repository's config last. Everything a preset sets is
 * locked: see {@link mergeLocked}. Presets are read through
 * {@link ConfigSource}, so this function makes no network calls of its own.
 *
 * @example
 * ```ts
 * const resolved = yield* resolveConfig(text, '.github/smartcloud.yml')
 * resolved.config.labels
 * ```
 *
 * @param text - The repository's config file.
 * @param source - Its name, for errors.
 * @returns The merged config.
 */
export const resolveConfig = (text: string, source: string): Effect.Effect<ResolvedConfig, ConfigError, ConfigSource> =>
  Effect.gen(function* () {
    const configSource = yield* ConfigSource
    const sources: Array<string> = []
    const warnings: Array<string> = []

    const include = (
      merged: Merged,
      contents: string,
      name: string,
      chain: ReadonlyArray<string>,
    ): Effect.Effect<Merged, ConfigError> =>
      Effect.gen(function* () {
        if (chain.includes(name)) return yield* new ExtendsCycle({ chain: [...chain, name] })
        if (chain.length > MAX_DEPTH) {
          return yield* new ConfigDecodeError({ source: name, reason: `extends is nested more than ${MAX_DEPTH} deep` })
        }
        const layer = yield* parseLayer(contents, name)
        warnings.push(...layer.warnings)
        let next = merged
        for (const entry of layer.extends) {
          // Entries were validated by parseLayer, so this always parses.
          const ref = parseExtendsRef(entry) ?? { owner: '', repo: '', path: entry }
          const preset = formatExtendsRef(ref)
          const presetText = yield* configSource.read(ref)
          next = yield* include(next, presetText, preset, [...chain, name])
        }
        // version, extends and $schema describe the file itself, not rules to merge.
        const { version: _version, extends: _extends, $schema: _schema, ...own } = layer.json
        sources.push(name)
        return yield* mergeLocked(next, own, name)
      })

    const merged = yield* include(empty, text, source, [])
    const localStart = sources.length - 1
    // A file may rely on its presets for required keys, such as sync.source,
    // so the whole config is only checked once everything is merged.
    const decoded = decodeV2({ ...merged.value, version: 2 })
    if (Either.isLeft(decoded)) {
      const presets = sources.slice(0, -1)
      const from = presets.length === 0 ? source : `${source} with ${presets.join(', ')}`
      return yield* new ConfigDecodeError({ source: from, reason: ParseResult.TreeFormatter.formatErrorSync(decoded.left) })
    }
    const config = decoded.right
    const locked = new Set([...merged.origins].filter(([, origin]) => origin !== sources[localStart]).map(([path]) => path))
    return { config, sources, locked, warnings }
  })
