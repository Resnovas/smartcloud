/**
 * @file tests/integrations.github/src/errors.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { fromGraphqlErrors, fromStatus } from '@resnovas/integrations.github'

describe('fromStatus', () => {
  it('maps every status family', () => {
    expect(fromStatus('op', 404, 'x')._tag).toBe('NotFound')
    expect(fromStatus('op', 429, 'x')._tag).toBe('RateLimited')
    expect(fromStatus('op', 401, 'API rate limit exceeded')._tag).toBe('RateLimited')
    expect(fromStatus('op', 401, 'Bad credentials')._tag).toBe('Forbidden')
    expect(fromStatus('op', 409, 'x')._tag).toBe('ValidationFailed')
    expect(fromStatus('op', 400, 'x')._tag).toBe('ValidationFailed')
    expect(fromStatus('op', 410, 'x')._tag).toBe('ValidationFailed')
    expect(fromStatus('op', 408, 'x')._tag).toBe('Unavailable')
    expect(fromStatus('op', 503, 'x')._tag).toBe('Unavailable')
    expect(fromStatus('op', undefined, 'x')._tag).toBe('Unavailable')
  })

  it('writes messages that name the operation', () => {
    expect(fromStatus('listLabels', 404, 'Not Found').message).toBe('listLabels: not found (Not Found)')
    expect(fromStatus('listLabels', 403, 'nope').message).toBe('listLabels: forbidden (nope)')
    expect(fromStatus('listLabels', 429, 'slow down').message).toBe('listLabels: rate limited (slow down)')
    expect(fromStatus('createLabel', 422, 'exists').message).toBe('createLabel: rejected (exists)')
    expect(fromStatus('listLabels', 503, 'down').message).toBe('listLabels: GitHub unavailable (down)')
  })

  it('maps GraphQL errors: rate limits are retried, anything else is the request itself', () => {
    expect(fromGraphqlErrors('graphql', 'API rate limit exceeded')._tag).toBe('RateLimited')
    expect(fromGraphqlErrors('graphql', 'Field x does not exist')._tag).toBe('ValidationFailed')
  })
})
