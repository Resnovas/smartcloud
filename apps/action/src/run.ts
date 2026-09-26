/**
 * @file apps/action/src/run.ts
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

import { ConfigNotFound, ConfigSource, formatExtendsRef, resolveConfig } from '@resnovas/config'
import { runFeatures, type Feature, type RunResult } from '@resnovas/engine'
import { commitsFeature } from '@resnovas/feature.commits'
import { conventions } from '@resnovas/feature.conventions'
import { disclosureFeature } from '@resnovas/feature.disclosure'
import { labels } from '@resnovas/feature.labels'
import { reviewsFeature } from '@resnovas/feature.reviews'
import { settingsFeature } from '@resnovas/feature.settings'
import { stale } from '@resnovas/feature.stale'
import { syncFeature } from '@resnovas/feature.sync'
import { GitHub } from '@resnovas/integrations.github'
import { publishReport, type Published } from '@resnovas/reporting'
import { Data, Effect, Layer, Option, Ref } from 'effect'
import { CONFIG_CANDIDATES, type Inputs } from './inputs.js'

/** Every feature the action can run, in the order their results are reported. */
export const FEATURES: ReadonlyArray<Feature> = [
  conventions,
  commitsFeature,
  disclosureFeature,
  reviewsFeature,
  labels,
  stale,
  settingsFeature,
  syncFeature,
]

/** No config was found in the repository. */
export class NoConfig extends Data.TaggedError('NoConfig')<{ readonly paths: ReadonlyArray<string> }> {
  override get message() {
    return `no smartcloud config found: looked for ${this.paths.join(', ')}`
  }
}

/** The `features` input names a feature that does not exist. */
export class UnknownFeatures extends Data.TaggedError('UnknownFeatures')<{ readonly names: ReadonlyArray<string> }> {
  override get message() {
    return `unknown feature(s) in the features input: ${this.names.join(', ')}; expected some of ${FEATURES.map((feature) => feature.name).join(', ')}`
  }
}

/** What a run did, for the entry point to write out. */
export interface Outcome {
  readonly result: RunResult
  readonly published: Published
  /** Deprecated inputs, config migration notes and reporting steps that could not complete. */
  readonly warnings: ReadonlyArray<string>
}

/** An `extends` preset exists, or may, but GitHub would not return it. */
export class PresetUnreadable extends Data.TaggedError('PresetUnreadable')<{ readonly source: string; readonly reason: string }> {
  override get message() {
    return `could not read the extends preset ${this.source}: ${this.reason}`
  }
}

// Presets named in `extends` are read with the same token as everything else.
// A config source can only answer "not found", so any other GitHub failure is
// noted against its preset for runAction to report with its cause.
const gitHubConfigSource = (unreadable: Ref.Ref<ReadonlyMap<string, string>>) =>
  Layer.effect(
    ConfigSource,
    Effect.map(GitHub, (github) => ({
      read: (ref) =>
        github.getFile(ref).pipe(
          Effect.catchAll((error) => {
            const source = formatExtendsRef(ref)
            const note = error._tag === 'NotFound' ? Effect.void : Ref.update(unreadable, (notes) => new Map([...notes, [source, error.message]]))
            return Effect.zipRight(note, Effect.fail(new ConfigNotFound({ source })))
          }),
        ),
    })),
  )

const loadConfigText = (inputs: Inputs) =>
  Effect.gen(function* () {
    if (Option.isSome(inputs.configJson)) return { text: inputs.configJson.value, source: 'the configJson input' }
    const github = yield* GitHub
    const { owner, repo } = github.coordinates
    const ref = Option.match(inputs.configRef, { onNone: () => ({}), onSome: (value) => ({ ref: value }) })
    const paths = Option.match(inputs.config, { onNone: () => CONFIG_CANDIDATES, onSome: (path) => [path] })
    for (const path of paths) {
      const text = yield* github.getFile({ owner, repo, path, ...ref }).pipe(
        Effect.map(Option.some),
        Effect.catchTag('NotFound', () => Effect.succeedNone),
      )
      if (Option.isSome(text)) return { text: text.value, source: path }
    }
    return yield* new NoConfig({ paths })
  })

const selectFeatures = (inputs: Inputs) =>
  Option.match(inputs.features, {
    onNone: () => Effect.succeed(FEATURES),
    onSome: (names) => {
      const unknown = names.filter((name) => !FEATURES.some((feature) => feature.name === name))
      return unknown.length > 0
        ? Effect.fail(new UnknownFeatures({ names: unknown }))
        : Effect.succeed(FEATURES.filter((feature) => names.includes(feature.name)))
    },
  })

/**
 * Runs the action for one event: loads and resolves the config, runs the
 * selected features, and publishes the report.
 *
 * @remarks
 * The config is read through the GitHub API, from the default branch unless
 * `configRef` says otherwise, so no checkout is needed. Reading it from the
 * default branch also means a pull request cannot loosen the rules it is
 * checked against.
 *
 * @param inputs - The action's inputs.
 * @param event - The event name and its payload.
 * @returns What the run did.
 */
export const runAction = (inputs: Inputs, event: { readonly name: string; readonly payload: unknown }) =>
  Effect.gen(function* () {
    const { text, source } = yield* loadConfigText(inputs)
    const unreadable = yield* Ref.make<ReadonlyMap<string, string>>(new Map())
    const resolved = yield* resolveConfig(text, source).pipe(
      Effect.provide(gitHubConfigSource(unreadable)),
      Effect.catchTag('ConfigNotFound', (error) =>
        Effect.flatMap(Ref.get(unreadable), (notes): Effect.Effect<never, ConfigNotFound | PresetUnreadable> => {
          const reason = notes.get(error.source)
          return reason === undefined ? Effect.fail(error) : Effect.fail(new PresetUnreadable({ source: error.source, reason }))
        }),
      ),
    )
    const features = yield* selectFeatures(inputs)
    const result = yield* runFeatures({ config: resolved.config, event: event.name, payload: event.payload, features })
    const published = yield* publishReport(result)
    const outcome: Outcome = { result, published, warnings: [...inputs.deprecations, ...resolved.warnings, ...published.warnings] }
    return outcome
  })
