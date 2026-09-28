/**
 * @file ai-docs/src/20_config/20_define-a-section.ts
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
 * @title The shape of a config section
 *
 * Sections are Effect Schemas with an identifier and a description on every
 * field, because both flow into the generated JSON Schema and the
 * configuration reference. This is the pattern `sections.ts` follows; a real
 * section is then added to `SmartcloudConfig`.
 */
import { Schema } from 'effect'

// exactOptionalPropertyTypes is on, so optional keys are exact: absent is
// allowed, `undefined` written out is not.
const opt = <A, I, R>(schema: Schema.Schema<A, I, R>) => Schema.optionalWith(schema, { exact: true })

export const Archive = Schema.Struct({
  /** Days an item has been closed before it is archived. */
  afterDays: Schema.NonNegative.annotations({ description: 'Days an item has been closed before it is archived.' }),
  label: opt(Schema.String.annotations({ description: 'Added to the item when it is archived.' })),
  exempt: opt(Schema.Struct({ labels: opt(Schema.Array(Schema.String)) })),
}).annotations({ identifier: 'Archive', description: 'Scheduled archiving of long-closed items.' })

// The loader decodes with every error and rejects excess properties, then
// drops the offending keys itself; strict validation sees the same errors.
const decode = Schema.decodeUnknownEither(Archive, { onExcessProperty: 'error', errors: 'all' })

export const example = {
  valid: decode({ afterDays: 30, label: 'archived' }),
  missingKey: decode({ label: 'archived' }),
}
