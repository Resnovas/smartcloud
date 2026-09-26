/**
 * @file packages/integrations.posthog/src/config.ts
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

import { Config, Redacted } from 'effect'

/**
 * The public ingestion key of smartcloud's own PostHog project, Smartcloud
 * (285077), which keeps its data apart from every other product.
 *
 * @remarks
 * A project key only lets its holder send data to the project, never read
 * it, so it is safe to ship in client code. It is still read as a redacted
 * value, so an override never reaches a log.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_PROJECT_KEY"
 * import { DEFAULT_PROJECT_KEY } from '@resnovas/integrations.posthog'
 *
 * DEFAULT_PROJECT_KEY.startsWith('phc_') // => true
 * ```
 */
export const DEFAULT_PROJECT_KEY = 'phc_vSGWgiQzJkTzEJwSRQ2Gd839ZjEwdk5M9pM4oQGRCpJP'

/**
 * The ingestion host of smartcloud's PostHog project, which is hosted in
 * PostHog's EU cloud. The US host accepts events for an EU key and then
 * drops them, and rejects its flag requests.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_HOST"
 * import { DEFAULT_HOST } from '@resnovas/integrations.posthog'
 *
 * DEFAULT_HOST // => 'https://eu.i.posthog.com'
 * ```
 */
export const DEFAULT_HOST = 'https://eu.i.posthog.com'

/** Where telemetry goes, whether it is sent at all, and which values must never be sent. */
export interface TelemetrySettings {
  readonly key: Redacted.Redacted<string>
  readonly host: string
  readonly enabled: boolean
  /** Credentials from the environment, removed from anything sent. */
  readonly secrets: ReadonlyArray<Redacted.Redacted<string>>
}

const OFF = new Set(['false', '0', 'off', 'no'])
const ON = new Set(['true', '1', 'yes'])

// An environment variable as trimmed lower-case text, empty when unset.
const flag = (name: string) =>
  Config.string(name).pipe(
    Config.withDefault(''),
    Config.map((value) => value.trim().toLowerCase()),
  )

// Trailing slashes dropped by a loop rather than a pattern, which would backtrack.
const trimHost = (host: string) => {
  let trimmed = host.trim()
  while (trimmed.endsWith('/')) trimmed = trimmed.slice(0, -1)
  return trimmed
}

const optionalSecret = (name: string) => Config.option(Config.redacted(name))

/**
 * Reads the telemetry settings from the environment.
 *
 * @remarks
 * Telemetry is on unless one of these turns it off:
 * - `SMARTCLOUD_TELEMETRY` set to `false`, `0`, `off` or `no`;
 * - `DO_NOT_TRACK` set to `1`, `true` or `yes`, the cross-tool convention;
 * - the action input `telemetry` set to `false`, which Actions passes as
 *   `INPUT_TELEMETRY`.
 *
 * A config's `telemetry: false` is read later, with the config, and turns
 * telemetry off through the `Telemetry` service. `SMARTCLOUD_POSTHOG_KEY`
 * and `SMARTCLOUD_POSTHOG_HOST` point telemetry at another project.
 *
 * @example
 * ```ts import.meta.vitest name="telemetrySettings"
 * import { ConfigProvider, Effect } from 'effect'
 * import { telemetrySettings } from '@resnovas/integrations.posthog'
 *
 * const read = Effect.gen(function* () {
 *   return yield* telemetrySettings
 * })
 * const provider = ConfigProvider.fromMap(new Map([['DO_NOT_TRACK', '1']]))
 * Effect.runSync(Effect.withConfigProvider(read, provider)).enabled // => false
 * ```
 *
 * @returns The settings.
 */
export const telemetrySettings: Config.Config<TelemetrySettings> = Config.all({
  key: Config.redacted('SMARTCLOUD_POSTHOG_KEY').pipe(
    Config.validate({ message: 'empty', validation: (value) => Redacted.value(value).trim() !== '' }),
    Config.orElse(() => Config.succeed(Redacted.make(DEFAULT_PROJECT_KEY))),
  ),
  host: Config.string('SMARTCLOUD_POSTHOG_HOST').pipe(
    Config.map(trimHost),
    Config.validate({ message: 'empty', validation: (host) => host !== '' }),
    Config.orElse(() => Config.succeed(DEFAULT_HOST)),
  ),
  telemetry: flag('SMARTCLOUD_TELEMETRY'),
  doNotTrack: flag('DO_NOT_TRACK'),
  input: flag('INPUT_TELEMETRY'),
  githubToken: optionalSecret('GITHUB_TOKEN'),
  inputToken: optionalSecret('INPUT_GITHUB_TOKEN'),
}).pipe(
  Config.map(({ key, host, telemetry, doNotTrack, input, githubToken, inputToken }): TelemetrySettings => ({
    key,
    host,
    enabled: !OFF.has(telemetry) && !ON.has(doNotTrack) && input !== 'false',
    secrets: [githubToken, inputToken].flatMap((secret) => (secret._tag === 'Some' ? [secret.value] : [])),
  })),
)
