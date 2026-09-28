/**
 * @file apps/action/src/run.ts
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

import { FULL_ACCESS, runEvent, type Access, type ConfigLocation, type RunOutcome } from '@resnovas/runtime'
import { Effect, Option } from 'effect'
import type { Inputs } from './inputs.js'

export {
  /** Every feature smartcloud can run, in the order their results are reported. */
  FEATURES,
  /** No config was found where smartcloud looked for one. */
  NoConfig,
  /** A preset named in `extends` exists but could not be read. */
  PresetUnreadable,
  /** A feature was asked for by a name that does not exist. */
  UnknownFeatures,
} from '@resnovas/runtime'

/** What a run did, for the entry point to write out. */
export interface Outcome extends RunOutcome {
  /** Deprecated inputs, config migration notes and reporting steps that could not complete. */
  readonly warnings: ReadonlyArray<string>
}

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
 * @example
 * ```ts
 * import { readInputs, runAction } from '@resnovas/action'
 * import { Effect } from 'effect'
 *
 * // Needs the GitHub service and a config source to run.
 * const run = Effect.flatMap(readInputs, (inputs) => runAction(inputs, { name: 'pull_request', payload: {} }))
 * ```
 *
 * @param inputs - The action's inputs.
 * @param event - The event name and its payload.
 * @param access - The run's access; full when omitted.
 * @returns What the run did.
 */
export const runAction = (
  inputs: Inputs,
  event: { readonly name: string; readonly payload: unknown },
  access: Access = FULL_ACCESS,
) =>
  Effect.gen(function* () {
    // Absent inputs are left out rather than set to undefined.
    const config: ConfigLocation = {
      ...Option.match(inputs.configJson, {
        onNone: () => ({}),
        onSome: (text) => ({ text: { text, source: 'the configJson input' } }),
      }),
      ...Option.match(inputs.config, { onNone: () => ({}), onSome: (path) => ({ path }) }),
      ...Option.match(inputs.configRef, { onNone: () => ({}), onSome: (ref) => ({ ref }) }),
    }
    const features = Option.match(inputs.features, { onNone: () => ({}), onSome: (names) => ({ features: names }) })
    const checkRunId = Option.getOrUndefined(inputs.checkRunId)
    const outcome = yield* runEvent({ config, event, access, ...features, checkRunId, checkRunRequired: true })
    const result: Outcome = { ...outcome, warnings: [...inputs.deprecations, ...outcome.warnings] }
    return result
  })
