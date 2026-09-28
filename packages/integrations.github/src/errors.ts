/**
 * @file packages/integrations.github/src/errors.ts
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

import { Data } from 'effect'

/**
 * The thing asked for does not exist, or the token cannot see it.
 *
 * @example
 * ```ts import.meta.vitest name="NotFound"
 * import { NotFound } from '@resnovas/integrations.github'
 *
 * new NotFound({ operation: 'getFile', detail: 'Not Found' }).message // => 'getFile: not found (Not Found)'
 * ```
 */
export class NotFound extends Data.TaggedError('NotFound')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: not found (${this.detail})`
  }
}

/**
 * The token is not allowed to do this.
 *
 * @example
 * ```ts import.meta.vitest name="Forbidden"
 * import { Forbidden } from '@resnovas/integrations.github'
 *
 * new Forbidden({ operation: 'createLabel', detail: 'Resource not accessible by integration' }).message // => 'createLabel: forbidden (Resource not accessible by integration)'
 * ```
 */
export class Forbidden extends Data.TaggedError('Forbidden')<{ readonly operation: string; readonly detail: string }> {
  override get message() {
    return `${this.operation}: forbidden (${this.detail})`
  }
}

/**
 * GitHub rate-limited the request. Retried with backoff before surfacing.
 *
 * @example
 * ```ts import.meta.vitest name="RateLimited"
 * import { RateLimited } from '@resnovas/integrations.github'
 *
 * new RateLimited({ operation: 'listLabels', detail: 'API rate limit exceeded' }).message // => 'listLabels: rate limited (API rate limit exceeded)'
 * ```
 */
export class RateLimited extends Data.TaggedError('RateLimited')<{
  readonly operation: string
  readonly detail: string
}> {
  override get message() {
    return `${this.operation}: rate limited (${this.detail})`
  }
}

/**
 * GitHub rejected the request as invalid, for example a duplicate label.
 *
 * @example
 * ```ts import.meta.vitest name="ValidationFailed"
 * import { ValidationFailed } from '@resnovas/integrations.github'
 *
 * new ValidationFailed({ operation: 'createLabel', detail: 'already_exists' }).message // => 'createLabel: rejected (already_exists)'
 * ```
 */
export class ValidationFailed extends Data.TaggedError('ValidationFailed')<{
  readonly operation: string
  readonly detail: string
}> {
  override get message() {
    return `${this.operation}: rejected (${this.detail})`
  }
}

/**
 * GitHub or the network failed. Retried with backoff before surfacing, except by calls that create something.
 *
 * @example
 * ```ts import.meta.vitest name="Unavailable"
 * import { Unavailable } from '@resnovas/integrations.github'
 *
 * new Unavailable({ operation: 'listLabels', detail: 'Bad Gateway' }).message // => 'listLabels: GitHub unavailable (Bad Gateway)'
 * ```
 */
export class Unavailable extends Data.TaggedError('Unavailable')<{
  readonly operation: string
  readonly detail: string
}> {
  override get message() {
    return `${this.operation}: GitHub unavailable (${this.detail})`
  }
}

/** Every way a GitHub call can fail. */
export type GitHubError = NotFound | Forbidden | RateLimited | ValidationFailed | Unavailable

/**
 * Maps an HTTP status and message from GitHub to a typed error.
 *
 * @remarks
 * GitHub reports primary rate limits as 403 or 429 with a "rate limit"
 * message, so those are distinguished from a plain 403. Any other client
 * error (400 to 499, except a 408 timeout) is the request's own fault and
 * would fail the same way again, so it is `ValidationFailed` and never
 * retried; only timeouts, server errors and network failures are
 * `Unavailable`.
 *
 * @example
 * ```ts import.meta.vitest name="fromStatus"
 * import { fromStatus } from '@resnovas/integrations.github'
 *
 * fromStatus('listLabels', 404, 'Not Found')._tag // => 'NotFound'
 * fromStatus('listLabels', 403, 'API rate limit exceeded')._tag // => 'RateLimited'
 * fromStatus('createLabel', 422, 'already_exists')._tag // => 'ValidationFailed'
 * ```
 *
 * @param operation - The operation that failed, for the error message.
 * @param status - The HTTP status, or undefined for a network failure.
 * @param detail - GitHub's message.
 * @returns The typed error.
 */
export const fromStatus = (operation: string, status: number | undefined, detail: string): GitHubError => {
  if (status === 404) return new NotFound({ operation, detail })
  if (status === 429 || ((status === 403 || status === 401) && /rate limit/i.test(detail))) {
    return new RateLimited({ operation, detail })
  }
  if (status === 401 || status === 403) return new Forbidden({ operation, detail })
  if (status !== undefined && status >= 400 && status < 500 && status !== 408)
    return new ValidationFailed({ operation, detail })
  return new Unavailable({ operation, detail })
}

/**
 * Maps a GraphQL response that carried errors to a typed error.
 *
 * @remarks
 * GitHub answers such a request with status 200 and an `errors` list, so
 * there is no status to map. A rate limit is retried like any other; every
 * other GraphQL error is a problem with the request itself.
 *
 * @example
 * ```ts import.meta.vitest name="fromGraphqlErrors"
 * import { fromGraphqlErrors } from '@resnovas/integrations.github'
 *
 * fromGraphqlErrors('graphql', 'API rate limit exceeded')._tag // => 'RateLimited'
 * fromGraphqlErrors('graphql', "Field 'x' doesn't exist")._tag // => 'ValidationFailed'
 * ```
 *
 * @param operation - The operation that failed, for the error message.
 * @param detail - GitHub's message.
 * @returns The typed error.
 */
export const fromGraphqlErrors = (operation: string, detail: string): GitHubError =>
  /rate limit/i.test(detail) ? new RateLimited({ operation, detail }) : new ValidationFailed({ operation, detail })
