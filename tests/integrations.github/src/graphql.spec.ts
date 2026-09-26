/**
 * @file tests/integrations.github/src/graphql.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { Effect, Layer } from 'effect'
import { DryRun, DryRunLog, GitHub, makeMemoryGitHub } from '@resnovas/integrations.github'

// isGraphqlWrite is internal; the dry run is where it decides what is a write.
describe('dry run', () => {
  it.effect('records a GraphQL mutation wherever it sits in the document, and passes plain queries through', () => {
    const { service, state } = makeMemoryGitHub()
    const writes = [
      '# create the label\nmutation { createLabel(input: {}) { clientMutationId } }',
      'fragment Id on Repository { id }\nmutation Update { updateRepository(input: {}) { repository { ...Id } } }',
      'query Read { viewer { login } }\nmutation Write { x }',
      'subscription { x }',
      'query($a: String = "unclosed) { x }',
      'query { x(a: """unclosed) }',
      'query { x(a: "line\nbreak") }',
      'query { x',
      'query { x } }',
    ]
    const reads = [
      'query { viewer { login } }',
      '{ repository(name: "mutation") { id } }',
      '# mutation in a comment only\nquery { x }',
      'query($a: String = "say \\"mutation\\"") { x(b: """block \\""" mutation""") { y } }',
      'query Read($ids: [ID!]!) { nodes(ids: $ids) { id } } fragment F on Mutation { x }',
      'query { x } # trailing comment with no newline',
    ]
    return Effect.gen(function* () {
      const github = yield* GitHub
      const log = yield* DryRunLog
      for (const query of [...writes, ...reads]) yield* github.graphql(query, {})
      expect((yield* log.writes).map((write) => write.details['query'])).toStrictEqual(writes)
      expect(state.graphql.map((call) => call.query)).toStrictEqual(reads)
    }).pipe(Effect.provide(Layer.provideMerge(DryRun, Layer.succeed(GitHub, service))))
  })
})
