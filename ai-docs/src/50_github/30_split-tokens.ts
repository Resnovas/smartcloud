/**
 * @file ai-docs/src/50_github/30_split-tokens.ts
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
 * @title Splitting the tokens: in-repository, privileged and house
 *
 * The action connects with up to three tokens through `connectTokens`. The
 * workflow token's service is provided as `GitHub` and does everything in
 * the repository. The app token's service is provided as `PrivilegedGitHub`
 * and is used only by features marked `privileged` (settings, sync,
 * codeowners, backport) and for presets in other repositories. Both read files in a
 * `.github` repository with the read-only house token first.
 */
import { GitHub, makeMemoryGitHub, PrivilegedGitHub } from '@resnovas/integrations.github'
import { connectTokens, FULL_ACCESS } from '@resnovas/runtime'
import { Effect, Layer, Option, Redacted } from 'effect'

// One in-memory GitHub per token, so the example can tell them apart.
const services = new Map([
  ['ghs_app', makeMemoryGitHub().service],
  ['ghs_workflow', makeMemoryGitHub().service],
  ['ghs_house', makeMemoryGitHub().service],
])

export const example = Effect.gen(function* () {
  const { service, privileged } = yield* connectTokens({
    token: Redacted.make('ghs_app'),
    workflowToken: Option.some(Redacted.make('ghs_workflow')),
    houseToken: Option.some(Redacted.make('ghs_house')),
    access: FULL_ACCESS,
    connect: (token) => Effect.succeed(services.get(Redacted.value(token)) ?? makeMemoryGitHub().service),
  })
  // Provide both: the engine hands `PrivilegedGitHub` to privileged features as their `GitHub`.
  const layer =
    privileged === undefined
      ? Layer.succeed(GitHub, service)
      : Layer.merge(Layer.succeed(GitHub, service), Layer.succeed(PrivilegedGitHub, privileged))
  return layer
})
