/**
 * @file packages/config/src/json-schema.ts
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

import { JSONSchema } from 'effect'
import { SmartcloudConfig } from './schema.js'

/**
 * The JSON Schema for `.github/smartcloud.yml`, generated from the Effect
 * Schema so the two can never disagree.
 *
 * @remarks
 * Committed at `schema/smartcloud.schema.json` for editors, and checked by a
 * test that fails when the committed copy is stale.
 *
 * @returns The JSON Schema document.
 */
export const configJsonSchema = () => JSONSchema.make(SmartcloudConfig)
