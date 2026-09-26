/**
 * @file packages/feature.commits/src/attribution.ts
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

import { hasKey, parseIdentity, parseTrailers } from '@resnovas/conditions'
import type { Identity } from './identity.js'

/** The attribution trailers of one commit message. */
export interface Attribution {
  readonly coAuthors: ReadonlyArray<Identity>
  readonly signOffs: ReadonlyArray<Identity>
  /** `Assisted-by` values in the Linux kernel form, `TOOL:MODEL [TOOL...]`. */
  readonly assistedBy: ReadonlyArray<string>
}

/** A commit's attribution, classified against the AI identity list. */
export interface ClassifiedAttribution extends Attribution {
  /** Some `Co-authored-by` names an AI tool. */
  readonly aiCoAuthored: boolean
  /** The commit credits an AI tool at all: an AI co-author or any `Assisted-by`. */
  readonly aiAttributed: boolean
}

/**
 * Reads the `Co-authored-by`, `Signed-off-by` and `Assisted-by` trailers of a
 * commit message.
 *
 * @remarks
 * Keys match ignoring case, as git's do. Trailers come from the final
 * paragraph only, through the linear-time parser in `@resnovas/conditions`,
 * and an identity trailer without an `<email>` is ignored.
 *
 * @example
 * ```ts
 * readAttribution('fix: x\n\nAssisted-by: claude-code:claude-opus-5-5 ripgrep')
 * // { coAuthors: [], signOffs: [], assistedBy: ['claude-code:claude-opus-5-5 ripgrep'] }
 * ```
 *
 * @param message - The full commit message.
 * @returns The trailers, grouped by kind.
 */
export const readAttribution = (message: string): Attribution => {
  const trailers = parseTrailers(message)
  const identities = (key: string): ReadonlyArray<Identity> =>
    trailers.flatMap((trailer) => {
      const identity = hasKey(trailer, key) ? parseIdentity(trailer.value) : undefined
      return identity === undefined ? [] : [identity]
    })
  return {
    coAuthors: identities('co-authored-by'),
    signOffs: identities('signed-off-by'),
    assistedBy: trailers.filter((trailer) => hasKey(trailer, 'assisted-by')).map((trailer) => trailer.value),
  }
}

/**
 * Reads a commit's attribution and classifies it against the AI identity list.
 *
 * @param message - The full commit message.
 * @param isAi - The AI identity predicate, from `makeAiIdentityMatcher`.
 * @returns The trailers, and whether the commit credits an AI tool.
 */
export const classifyAttribution = (message: string, isAi: (identity: Identity) => boolean): ClassifiedAttribution => {
  const attribution = readAttribution(message)
  const aiCoAuthored = attribution.coAuthors.some(isAi)
  return { ...attribution, aiCoAuthored, aiAttributed: aiCoAuthored || attribution.assistedBy.length > 0 }
}
