/**
 * @file apps/action/src/inputs.ts
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

import { Config, Effect, Option, Redacted } from 'effect'

/** The action's inputs, read from the `INPUT_*` variables Actions sets. */
export interface Inputs {
  readonly token: Redacted.Redacted<string>
  /** The config file; when omitted, the first of {@link CONFIG_CANDIDATES} that exists. */
  readonly config: Option.Option<string>
  /** Config given inline, which wins over the file. */
  readonly configJson: Option.Option<string>
  /** Where to read the config from; the default branch when omitted. */
  readonly configRef: Option.Option<string>
  readonly dryRun: boolean
  /** Only these features run; all of them when omitted. */
  readonly features: Option.Option<ReadonlyArray<string>>
  /** Notices about v1 inputs that no longer do anything. */
  readonly deprecations: ReadonlyArray<string>
}

/** Where the action looks for a config when the `config` input is empty. */
export const CONFIG_CANDIDATES = ['.github/smartcloud.yml', '.github/smartcloud.yaml', '.github/config.json'] as const

// Actions sets every declared input, empty when not given, so empty means absent.
const input = (name: string) =>
  Config.string(`INPUT_${name.toUpperCase()}`).pipe(
    Config.withDefault(''),
    Config.map((value) => value.trim()),
    Config.map((value) => (value === '' ? Option.none() : Option.some(value))),
  )

/** The v1 inputs that v2 replaced, and what replaced them. */
const DEPRECATED: ReadonlyArray<readonly [string, string]> = [
  ['fillEmpty', 'the fillEmpty input is ignored: shared settings now come from `extends`.'],
  ['skipDelete', 'the skipDelete input is ignored: labels are only deleted when `labelSync.prune` is true.'],
]

/**
 * Reads the inputs.
 *
 * @remarks
 * Booleans are true only for `true`, ignoring case, so `"false"` means false.
 * v1 treated any non-empty string as true. The token falls back to the
 * `GITHUB_TOKEN` environment variable.
 *
 * @returns The inputs, or a `ConfigError` when there is no token.
 */
export const readInputs = Effect.gen(function* () {
  const token = yield* Config.redacted('INPUT_GITHUB_TOKEN').pipe(
    Config.validate({ message: 'empty', validation: (value) => Redacted.value(value).trim() !== '' }),
    Config.orElse(() => Config.redacted('GITHUB_TOKEN')),
  )
  const features = yield* input('features')
  const deprecations: Array<string> = []
  for (const [name, notice] of DEPRECATED) if (Option.isSome(yield* input(name))) deprecations.push(notice)
  const inputs: Inputs = {
    token,
    config: yield* input('config'),
    configJson: yield* input('configJson'),
    configRef: yield* input('configRef'),
    dryRun: Option.exists(yield* input('dryRun'), (value) => value.toLowerCase() === 'true'),
    // A list with no names, such as `,`, selects nothing, so it means the
    // same as leaving the input out: every feature runs.
    features: Option.filter(
      Option.map(features, (list) =>
        list
          .split(',')
          .map((name) => name.trim())
          .filter((name) => name !== ''),
      ),
      (names) => names.length > 0,
    ),
    deprecations,
  }
  return inputs
})
