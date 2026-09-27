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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Context, Data, Effect, Either, Option, ParseResult, Schema, SchemaAST } from 'effect'
import { parse as parseYaml } from 'yaml'
import { ExtendsEntry, type ExtendsRef, formatExtendsRef, parseExtendsRef } from './extends.js'
import { dropInvalid } from './lenient.js'
import { empty, type Merged, mergeLocked } from './merge.js'
import { conventionNeedsPresetOrWhen, SmartcloudConfig } from './schema.js'
import { migrateV1 } from './v1.js'

/**
 * The config text could not be parsed as YAML or JSON.
 *
 * @example
 * ```ts import.meta.vitest name="ConfigParseError"
 * import { ConfigParseError } from '@resnovas/config'
 *
 * new ConfigParseError({ source: 'x.yml', reason: 'bad indent' }).message // => 'x.yml is not valid YAML or JSON: bad indent'
 * ```
 */
export class ConfigParseError extends Data.TaggedError('ConfigParseError')<{
  readonly source: string
  readonly reason: string
}> {
  override get message() {
    return `${this.source} is not valid YAML or JSON: ${this.reason}`
  }
}

/**
 * The config parsed but does not match the schema.
 *
 * @example
 * ```ts import.meta.vitest name="ConfigDecodeError"
 * import { ConfigDecodeError } from '@resnovas/config'
 *
 * new ConfigDecodeError({ source: 'x.yml', reason: 'version is missing' })._tag // => 'ConfigDecodeError'
 * ```
 */
export class ConfigDecodeError extends Data.TaggedError('ConfigDecodeError')<{
  readonly source: string
  readonly reason: string
}> {
  override get message() {
    return `${this.source} is not a valid smartcloud config:\n${this.reason}`
  }
}

/**
 * A preset could not be read.
 *
 * @example
 * ```ts import.meta.vitest name="ConfigNotFound"
 * import { ConfigNotFound } from '@resnovas/config'
 *
 * new ConfigNotFound({ source: 'o/r/p.yml' }).message // => 'o/r/p.yml could not be read'
 * ```
 */
export class ConfigNotFound extends Data.TaggedError('ConfigNotFound')<{ readonly source: string }> {
  override get message() {
    return `${this.source} could not be read`
  }
}

/**
 * Presets extend each other in a loop.
 *
 * @example
 * ```ts import.meta.vitest name="ExtendsCycle"
 * import { ExtendsCycle } from '@resnovas/config'
 *
 * new ExtendsCycle({ chain: ['a', 'b', 'a'] }).message // => 'presets extend each other in a loop: a -> b -> a'
 * ```
 */
export class ExtendsCycle extends Data.TaggedError('ExtendsCycle')<{ readonly chain: ReadonlyArray<string> }> {
  override get message() {
    return `presets extend each other in a loop: ${this.chain.join(' -> ')}`
  }
}

/**
 * Reads preset files named in `extends`. The GitHub integration provides the
 * real implementation; tests provide files from memory.
 *
 * @example
 * ```ts
 * import { ConfigNotFound, ConfigSource, formatExtendsRef } from '@resnovas/config'
 * import { Effect, Layer } from 'effect'
 *
 * // Presets served from memory, keyed by owner/repo/path@ref.
 * const files: Record<string, string> = { 'o/r/house.yml': 'version: 2\n' }
 * const presets = Layer.succeed(ConfigSource, {
 *   read: (ref) =>
 *     Effect.fromNullable(files[formatExtendsRef(ref)]).pipe(
 *       Effect.mapError(() => new ConfigNotFound({ source: formatExtendsRef(ref) })),
 *     ),
 * })
 * ```
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
  /**
   * What was left out because a preset could not be read and
   * {@link ResolveOptions.skipUnreadable} allowed it: each skipped preset,
   * then each top-level section that only made sense with it. Absent when
   * nothing was left out.
   */
  readonly skipped?: ReadonlyArray<string>
}

/** How {@link resolveConfig} treats presets it cannot read and config that does not match the schema. */
export interface ResolveOptions {
  /**
   * Decides whether a preset that could not be read is left out instead of
   * failing the whole config. Absent, every unreadable preset fails.
   */
  readonly skipUnreadable?: (ref: ExtendsRef, error: ConfigNotFound) => boolean
  /**
   * Fail on every unknown key and invalid value, as `smartcloud validate`
   * does for authors. Off by default: a run drops them with a warning.
   */
  readonly strict?: boolean
}

type ConfigError =
  ConfigParseError | ConfigDecodeError | ConfigNotFound | ExtendsCycle | import('./merge.js').LockedRule

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
 * @example
 * ```ts import.meta.vitest name="parseConfig"
 * import { parseConfig } from '@resnovas/config'
 * import { Effect } from 'effect'
 *
 * const { config } = Effect.runSync(parseConfig('version: 2\nlabelSync: { prune: true }\n', 'smartcloud.yml'))
 * config.labelSync?.prune // => true
 * ```
 *
 * @param text - The file's contents, YAML or JSON.
 * @param source - The file's name, for errors.
 * @returns The decoded config and any migration warnings.
 */
export const parseConfig = (
  text: string,
  source: string,
): Effect.Effect<
  { readonly config: SmartcloudConfig; readonly warnings: ReadonlyArray<string> },
  ConfigParseError | ConfigDecodeError
> =>
  Effect.gen(function* () {
    const raw = yield* Effect.try({
      try: (): unknown => parseYaml(text),
      catch: (error) =>
        new ConfigParseError({ source, reason: error instanceof Error ? error.message : String(error) }),
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
const parseLayer = (text: string, source: string, strict: boolean) =>
  Effect.gen(function* () {
    const raw = yield* Effect.try({
      try: (): unknown => parseYaml(text),
      catch: (error) =>
        new ConfigParseError({ source, reason: error instanceof Error ? error.message : String(error) }),
    })
    if (!isRecord(raw)) return yield* new ConfigDecodeError({ source, reason: 'expected a mapping at the top level' })
    const migrated = raw['version'] === 2 ? { config: raw, warnings: [] } : migrateV1(raw)
    const warnings = migrated.warnings.map((warning) => `${source}: ${warning}`)
    const entries = decodeExtends(migrated.config['extends'] ?? [])
    if (Either.isLeft(entries)) {
      return yield* new ConfigDecodeError({ source, reason: ParseResult.TreeFormatter.formatErrorSync(entries.left) })
    }
    // Unknown keys and invalid values are dropped, file by file, so each
    // warning names the file that has them. What a preset may still complete,
    // such as a missing key, is left for the merged config.
    const lenient = strict ? { value: migrated.config, warnings: [] } : dropInvalid(migrated.config, source, true)
    // A complete file is normalised through the schema; an incomplete one is
    // merged as written and checked once merged.
    const decoded = decodeV2(lenient.value)
    const json = Either.isRight(decoded) ? toJson(decoded.right) : lenient.value
    return { json, extends: entries.right, warnings: [...warnings, ...lenient.warnings] }
  })

// Whether a path runs only through fields the schema names, such as
// sync.source, and never into an entry the config names, such as labels.docs
// or an array item. A preset can supply a named field of a section the
// repository also sets, but an entry the repository names is its own.
const inNamedFields = (ast: SchemaAST.AST, path: ReadonlyArray<PropertyKey>): boolean => {
  const [head, ...rest] = path
  if (head === undefined) return true
  const field = SchemaAST.getPropertySignatures(ast).find((signature) => signature.name === head)
  return field !== undefined && inNamedFields(field.type, rest)
}

// A convention rule with neither preset nor when tweaks a rule a preset
// defined, so a skipped preset could have completed it too.
const completableIssue = (issue: ParseResult.ArrayFormatterIssue): boolean =>
  (issue._tag === 'Missing' && inNamedFields(SmartcloudConfig.ast, issue.path)) ||
  (issue._tag === 'Refinement' && issue.message === conventionNeedsPresetOrWhen)

// For a config whose presets were partly left out: keeps each top-level
// section that decodes on its own or has a problem of its own, and drops, by
// name, each section that fails only for what a skipped preset could have set.
// A kept section that fails is dropped with a warning like in any run, or
// fails a strict config. Kept sections are collected in a Map, so a key such
// as `__proto__` stays data.
const decodeSections = (value: Readonly<Record<string, Json>>) => {
  const kept = new Map<string, Json>()
  const dropped: Array<string> = []
  for (const [key, section] of Object.entries(value)) {
    const decoded = decodeV2({ version: 2, [key]: section })
    const completable =
      Either.isLeft(decoded) && ParseResult.ArrayFormatter.formatErrorSync(decoded.left).every(completableIssue)
    if (completable) dropped.push(key)
    else kept.set(key, section)
  }
  return { kept: Object.fromEntries(kept), dropped }
}

/**
 * Loads a config and every preset it extends, and merges them.
 *
 * @remarks
 * Presets are merged first, in the order listed, each one's own presets
 * before it, and the repository's config last. Everything a preset sets is
 * locked: see {@link mergeLocked}. Presets are read through
 * {@link ConfigSource}, so this function makes no network calls of its own.
 *
 * A preset that cannot be read fails the config, unless
 * `options.skipUnreadable` says to leave it out, as a run with a restricted
 * token does for a private preset. The rest of the config is then merged
 * without it, and a top-level section that fails only for missing keys a
 * preset could have set, such as `sync.source`, or a convention rule that only tweaks a
 * preset's rule, is dropped rather than
 * failing; both are listed in `skipped`. A missing key inside an entry the
 * config names, such as a label without a `color`, and every other problem
 * are not left out as skipped: the skipped preset cannot have completed an
 * entry the repository added. They are dropped with a warning as below.
 *
 * Unknown keys and invalid values, in the repository's config or any preset,
 * are dropped with a warning naming the key and the file, so a preset written
 * for a newer smartcloud still runs with everything this build knows. A value
 * inside a rule's `when` drops the whole `when`, never part of its
 * conditions, and a rule or section left incomplete once every file is
 * merged, such as `sync` without `source`, is dropped too. Only a config that
 * is unusable as a whole still fails: one that is not YAML or JSON, is not a
 * mapping, or has a malformed `extends`. `options.strict` fails on every
 * problem instead, for authors checking a config.
 *
 * @example
 * ```ts import.meta.vitest name="resolveConfig"
 * import { ConfigSource, resolveConfig } from '@resnovas/config'
 * import { Effect, Layer } from 'effect'
 *
 * const house = 'version: 2\nlabels: { bug: { name: bug, color: d73a4a } }\n'
 * const presets = Layer.succeed(ConfigSource, { read: () => Effect.succeed(house) })
 * const text = "version: 2\nextends: ['Resnovas/.github/house.yml@main']\n"
 * const resolved = Effect.runSync(resolveConfig(text, 'smartcloud.yml').pipe(Effect.provide(presets)))
 * resolved.config.labels?.['bug']?.color // => 'd73a4a'
 * resolved.locked.has('labels.bug.color') // => true
 * ```
 *
 * @param text - The repository's config file.
 * @param source - Its name, for errors.
 * @param options - Which unreadable presets may be left out, and whether to fail on unknown keys and invalid values.
 * @returns The merged config.
 */
export const resolveConfig = (
  text: string,
  source: string,
  options: ResolveOptions = {},
): Effect.Effect<ResolvedConfig, ConfigError, ConfigSource> =>
  Effect.gen(function* () {
    const configSource = yield* ConfigSource
    const sources: Array<string> = []
    const warnings: Array<string> = []
    const skipped: Array<string> = []
    const skipUnreadable = options.skipUnreadable ?? (() => false)
    const strict = options.strict ?? false

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
        const layer = yield* parseLayer(contents, name, strict)
        warnings.push(...layer.warnings)
        let next = merged
        for (const entry of layer.extends) {
          // Entries were validated by parseLayer, so this always parses.
          const ref = parseExtendsRef(entry) ?? { owner: '', repo: '', path: entry }
          const preset = formatExtendsRef(ref)
          const presetText = yield* configSource.read(ref).pipe(
            Effect.map(Option.some),
            Effect.catchAll((error) =>
              skipUnreadable(ref, error)
                ? Effect.as(
                    Effect.sync(() => void skipped.push(`the extends preset ${preset}: ${error.message}`)),
                    Option.none(),
                  )
                : Effect.fail(error),
            ),
          )
          if (Option.isSome(presetText)) next = yield* include(next, presetText.value, preset, [...chain, name])
        }
        // version, extends and $schema describe the file itself, not rules to merge.
        const { version: _version, extends: _extends, $schema: _schema, ...own } = layer.json
        sources.push(name)
        return yield* mergeLocked(next, own, name)
      })

    const merged = yield* include(empty, text, source, [])
    const localStart = sources.length - 1
    // Without a skipped preset, a section may lack keys only that preset set,
    // such as sync.source: such a section is dropped rather than failing, and
    // any other problem is left for the decode below to report.
    let value: Readonly<Record<string, Json>> = merged.value
    if (skipped.length > 0) {
      const { kept, dropped } = decodeSections(merged.value)
      value = kept
      skipped.push(...dropped.map((key) => `the ${key} section: incomplete without the skipped preset(s)`))
    }
    const presets = sources.slice(0, -1)
    const from = presets.length === 0 ? source : `${source} with ${presets.join(', ')}`
    // A file may rely on its presets for required keys, such as sync.source,
    // so the whole config is only checked once everything is merged; what is
    // still incomplete or invalid then is dropped, unless the config is strict.
    const lenient = strict ? { value, warnings: [] } : dropInvalid(value, from)
    warnings.push(...lenient.warnings)
    const decoded = decodeV2({ ...lenient.value, version: 2 })
    if (Either.isLeft(decoded)) {
      return yield* new ConfigDecodeError({
        source: from,
        reason: ParseResult.TreeFormatter.formatErrorSync(decoded.left),
      })
    }
    const config = decoded.right
    const locked = new Set(
      [...merged.origins].filter(([, origin]) => origin !== sources[localStart]).map(([path]) => path),
    )
    return skipped.length === 0 ? { config, sources, locked, warnings } : { config, sources, locked, warnings, skipped }
  })
