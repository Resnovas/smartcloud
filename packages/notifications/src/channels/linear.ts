/**
 * @file packages/notifications/src/channels/linear.ts
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

import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import type { LinearChannel } from '@resnovas/config'
import { Effect, Redacted, Schema } from 'effect'
import { type Channel, ChannelError, channelFailure, type Notification } from '../channel.js'

const API = 'https://api.linear.app/graphql'

const CREATE_ISSUE = 'mutation SmartcloudNotify($input: IssueCreateInput!) { issueCreate(input: $input) { success } }'

// Linear answers a GraphQL error with HTTP 200 and an `errors` list, or with
// `issueCreate.success` false.
const Answer = Schema.Struct({
  data: Schema.optional(
    Schema.NullOr(Schema.Struct({ issueCreate: Schema.NullOr(Schema.Struct({ success: Schema.Boolean })) })),
  ),
  errors: Schema.optional(Schema.Array(Schema.Struct({ message: Schema.String }))),
})

/**
 * The Linear issue for a notification: its title, and a Markdown
 * description that links back to GitHub.
 *
 * @example
 * ```ts import.meta.vitest name="linearIssue"
 * import { linearIssue } from '@resnovas/notifications'
 *
 * const issue = linearIssue({ kind: 'stale', repository: 'o/r', title: '1 stale item', lines: ['closed #3'], url: 'https://github.com/o/r' }, { type: 'linear', team: 'T' })
 * issue.description // => '- closed #3\n\n[Open in GitHub](https://github.com/o/r)'
 * ```
 *
 * @param notification - The notification.
 * @param options - The channel's config: the team and any label ids.
 * @returns The `IssueCreateInput`.
 */
export const linearIssue = (notification: Notification, options: typeof LinearChannel.Type) => ({
  teamId: options.team,
  title: notification.title,
  description: `${notification.lines.map((line) => `- ${line}`).join('\n')}\n\n[Open in GitHub](${notification.url})`,
  ...(options.labels === undefined ? {} : { labelIds: options.labels }),
})

/**
 * Opens a Linear issue for each notification, in the configured team. The
 * secret is a Linear API key, `LINEAR_API_KEY` by default.
 *
 * @example
 * ```ts import.meta.vitest name="linear"
 * import { linear } from '@resnovas/notifications'
 *
 * linear.defaultSecret // => 'LINEAR_API_KEY'
 * ```
 */
export const linear: Channel<typeof LinearChannel.Type> = {
  type: 'linear',
  defaultSecret: 'LINEAR_API_KEY',
  send: (notification, options, secret) =>
    Effect.gen(function* () {
      const client = HttpClient.filterStatusOk(yield* HttpClient.HttpClient)
      const request = yield* HttpClientRequest.post(API).pipe(
        HttpClientRequest.setHeader('authorization', Redacted.value(secret)),
        HttpClientRequest.bodyJson({ query: CREATE_ISSUE, variables: { input: linearIssue(notification, options) } }),
      )
      const answer = yield* client.execute(request).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(Answer)))
      const failure = answer.errors?.[0]?.message
      if (failure !== undefined) return yield* new ChannelError({ channel: 'linear', reason: failure })
      if (answer.data?.issueCreate?.success !== true)
        return yield* new ChannelError({ channel: 'linear', reason: 'Linear did not create the issue' })
    }).pipe(
      Effect.mapError((error) =>
        error._tag === 'ChannelError'
          ? error
          : error._tag === 'ParseError'
            ? new ChannelError({ channel: 'linear', reason: 'unexpected response from Linear' })
            : channelFailure('linear')(error),
      ),
    ),
}
