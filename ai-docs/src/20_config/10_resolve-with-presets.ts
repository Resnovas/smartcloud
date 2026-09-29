/**
 * @file ai-docs/src/20_config/10_resolve-with-presets.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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

/**
 * @title Resolving a config with presets
 *
 * `resolveConfig` reads presets only through `ConfigSource`, so it makes no
 * network calls of its own. A run provides `ConfigSourceFromGitHub`; this
 * provides presets from memory, as the config tests do.
 */
import { ConfigNotFound, ConfigSource, formatExtendsRef, resolveConfig } from '@resnovas/config'
import { Effect, Layer } from 'effect'

// Presets keyed by owner/repo/path@ref, as formatExtendsRef writes them.
const presets: Readonly<Record<string, string>> = {
  'acme/.github/smartcloud/base.yml@main': 'version: 2\nlabels: { bug: { name: bug, color: d73a4a } }\n',
}

const FromMemory = Layer.succeed(ConfigSource, {
  read: (ref) =>
    Effect.fromNullable(presets[formatExtendsRef(ref)]).pipe(
      Effect.mapError(() => new ConfigNotFound({ source: formatExtendsRef(ref) })),
    ),
})

// `futureOption` is a key this build does not know: a run drops it with a
// warning instead of failing, so a preset written for a newer smartcloud
// still runs here.
const repositoryConfig = `version: 2
extends: ['acme/.github/smartcloud/base.yml@main']
labels: { docs: { name: docs, color: 0075ca } }
futureOption: true
`

export const example = resolveConfig(repositoryConfig, '.github/smartcloud.yml').pipe(
  Effect.map((resolved) => ({
    // Presets first, the repository's own file last.
    sources: resolved.sources,
    // The repository added `docs`; it could not have changed `bug`, which the
    // preset set and so locked.
    labels: Object.keys(resolved.config.labels ?? {}),
    bugColorLocked: resolved.locked.has('labels.bug.color'),
    // One line per dropped key, naming the file and the key.
    ignored: resolved.ignored ?? [],
  })),
  // A repository changing an inherited value fails with LockedRule, which
  // names the path and the preset; there is nothing to recover, so report it.
  Effect.catchTag('LockedRule', (error) => Effect.fail(error.message)),
  Effect.provide(FromMemory),
)
