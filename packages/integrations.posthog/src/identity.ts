/**
 * @file packages/integrations.posthog/src/identity.ts
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

import { createHash } from 'node:crypto'

/** Where smartcloud runs from. */
export type Surface = 'action' | 'cli' | 'mcp'

/**
 * Who telemetry is about: a repository and its organisation, both hashed.
 *
 * @remarks
 * The repository is the PostHog person and the organisation a PostHog group
 * of type `organization`. Only the hashes are sent; the names never are.
 */
export interface Identity {
  /** The SHA-256 of the lower-cased `owner/repo`. */
  readonly distinctId: string
  /** The SHA-256 of the lower-cased owner. */
  readonly organization: string
}

/**
 * The PostHog group type the organisation is recorded under.
 *
 * @example
 * ```ts import.meta.vitest name="ORGANIZATION_GROUP"
 * import { ORGANIZATION_GROUP } from '@resnovas/integrations.posthog'
 *
 * ORGANIZATION_GROUP // => 'organization'
 * ```
 */
export const ORGANIZATION_GROUP = 'organization'

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/**
 * The identity of a repository.
 *
 * @remarks
 * GitHub names ignore case, so they are lower-cased before hashing and the
 * same repository always has the same identity.
 *
 * @example
 * ```ts import.meta.vitest name="identify"
 * import { identify } from '@resnovas/integrations.posthog'
 *
 * identify({ owner: 'Resnovas', repo: 'smartcloud' }).distinctId.length // => 64
 * identify({ owner: 'resnovas', repo: 'SmartCloud' }).distinctId === identify({ owner: 'Resnovas', repo: 'smartcloud' }).distinctId // => true
 * ```
 *
 * @param repository - The owner and repository name.
 * @returns The hashed identity.
 */
export const identify = (repository: { readonly owner: string; readonly repo: string }): Identity => ({
  distinctId: sha256(`${repository.owner}/${repository.repo}`.toLowerCase()),
  organization: sha256(repository.owner.toLowerCase()),
})
