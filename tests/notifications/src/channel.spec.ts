/**
 * @file tests/notifications/src/channel.spec.ts
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

import { HttpClientError, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { describe, expect, it } from '@effect/vitest'
import { ChannelError, channelFailure } from '@resnovas/notifications'

describe('channelFailure', () => {
  const request = HttpClientRequest.post('https://hooks.example.com/services/SECRET')

  it('names the status of a response error, never the URL', () => {
    const response = HttpClientResponse.fromWeb(request, new Response('no', { status: 404 }))
    const error = channelFailure('slack')(
      new HttpClientError.ResponseError({ request, response, reason: 'StatusCode' }),
    )
    expect(error).toBeInstanceOf(ChannelError)
    expect(error.message).toBe('slack: HTTP 404')
  })

  it('names the reason of a request error', () => {
    expect(channelFailure('slack')(new HttpClientError.RequestError({ request, reason: 'Transport' })).message).toBe(
      'slack: the request failed (Transport)',
    )
  })

  it('says only that the request failed for anything else', () => {
    expect(channelFailure('slack')(new Error('https://hooks.example.com/services/SECRET')).message).toBe(
      'slack: the request failed',
    )
  })
})
