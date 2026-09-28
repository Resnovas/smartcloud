/**
 * @file ai-docs/src/20_config/30_cross-field-check.ts
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
 * @title A cross-field check that drops one key
 *
 * A filter on the struct that holds both keys, returning an issue whose path
 * names the key to drop. Strict decoding reports it at that path; a lenient
 * run drops only that key and warns.
 */
import { Settings } from '@resnovas/config'
import { Schema } from 'effect'

type Method = 'squash' | 'rebase' | 'merge'

// The shape `mergeQueueConflicts` in sections.ts follows.
export const queueConflicts = (ruleset: {
  readonly linearHistory?: boolean
  readonly mergeQueue?: { readonly method?: Method }
}): Array<Schema.FilterIssue> =>
  ruleset.mergeQueue?.method === 'merge' && ruleset.linearHistory === true
    ? [{ path: ['mergeQueue', 'method'], message: 'the merge queue cannot use merge while linearHistory is on' }]
    : []

export const Ruleset = Schema.Struct({
  linearHistory: Schema.optionalWith(Schema.Boolean, { exact: true }),
  mergeQueue: Schema.optionalWith(
    Schema.Struct({ method: Schema.optionalWith(Schema.Literal('squash', 'rebase', 'merge'), { exact: true }) }),
    { exact: true },
  ),
}).pipe(Schema.filter(queueConflicts, { jsonSchema: {} }))

const decode = Schema.decodeUnknownEither(Settings, { errors: 'all' })

export const example = {
  // Left: ["ruleset"]["mergeQueue"]["method"] with the message.
  conflict: decode({ ruleset: { linearHistory: true, mergeQueue: { method: 'merge' } } }),
  // Right: leave the method out and the planner picks one that fits.
  fits: decode({ ruleset: { linearHistory: true, mergeQueue: {} } }),
}
