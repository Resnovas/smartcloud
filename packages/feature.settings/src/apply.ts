/**
 * @file packages/feature.settings/src/apply.ts
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

import { Report } from '@resnovas/engine'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Data, Effect, Either, Schema } from 'effect'
import type { RulesetBody, SettingsStep } from './plan.js'

/** The feature name findings and changes are recorded under. */
export const FEATURE = 'settings'

/** GitHub answered with something other than the documented shape. */
export class UnexpectedResponse extends Data.TaggedError('UnexpectedResponse')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: unexpected response (${this.detail})`
  }
}

// Only the fields the upsert needs; GitHub sends many more.
const RulesetList = Schema.Array(Schema.Struct({ id: Schema.Number, name: Schema.String }))

/**
 * Creates or updates a repository ruleset, matched by name.
 *
 * @remarks
 * Matching by name means re-running updates the ruleset in place instead of
 * stacking duplicates. Rulesets inherited from the organisation are left out
 * of the listing: they cannot be updated through the repository endpoint.
 *
 * @param ruleset - The ruleset body.
 * @returns Nothing; fails when GitHub rejects a call or lists rulesets in an unexpected shape.
 */
export const upsertRuleset = (ruleset: RulesetBody): Effect.Effect<void, GitHubError | UnexpectedResponse, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const operation = 'GET /rulesets'
    const response = yield* github.repositoryRequest({ method: 'GET', path: '/rulesets?per_page=100&includes_parents=false' })
    const listed = Schema.decodeUnknownEither(RulesetList)(response)
    if (Either.isLeft(listed)) return yield* new UnexpectedResponse({ operation, detail: 'expected a list of rulesets' })
    const existing = listed.right.find((entry) => entry.name === ruleset.name)
    yield* github.repositoryRequest(
      existing === undefined
        ? { method: 'POST', path: '/rulesets', body: ruleset }
        : { method: 'PUT', path: `/rulesets/${existing.id}`, body: ruleset },
    )
  })

const perform = (step: SettingsStep): Effect.Effect<void, GitHubError | UnexpectedResponse, GitHub> => {
  switch (step.kind) {
    case 'ruleset':
      return upsertRuleset(step.ruleset)
    case 'graphql':
      return Effect.flatMap(GitHub, (github) => github.graphql(step.query, step.variables))
    case 'rest':
      return Effect.flatMap(GitHub, (github) => github.repositoryRequest(step.request))
  }
}

/**
 * Performs planned steps in order, recording each outcome.
 *
 * @remarks
 * Every applied step is a change. A failed step is a finding and does not
 * stop the others: a warning when the step is optional, an error otherwise.
 * Under the dry-run layer writes are only recorded, so the changes read as
 * what would change.
 *
 * @param steps - The steps from `planSettings`.
 * @returns Nothing; outcomes go to the {@link Report}.
 */
export const applySettings = (steps: ReadonlyArray<SettingsStep>): Effect.Effect<void, never, GitHub | Report> =>
  Effect.gen(function* () {
    const report = yield* Report
    for (const step of steps) {
      yield* perform(step).pipe(
        Effect.matchEffect({
          onSuccess: () => report.change({ feature: FEATURE, description: step.description }),
          onFailure: (error) =>
            report.add({
              feature: FEATURE,
              rule: `settings.${step.id}`,
              level: step.optional ? 'warning' : 'error',
              message: `${step.description}: ${error.message}`,
            }),
        }),
      )
    }
  })
