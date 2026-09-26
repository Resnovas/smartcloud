/**
 * @file packages/engine/src/events.ts
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

import type { Subject } from '@resnovas/conditions'
import { Data, Effect, Either, ParseResult, Schema } from 'effect'

// Only the fields smartcloud reads are decoded; GitHub's payloads carry far
// more, and excess properties are ignored.

const Login = Schema.Struct({ login: Schema.String })
const LabelRef = Schema.Struct({ name: Schema.String })

const IssueFields = {
  number: Schema.Number,
  title: Schema.String,
  body: Schema.NullishOr(Schema.String),
  user: Schema.NullishOr(Login),
  state: Schema.Literal('open', 'closed'),
  locked: Schema.Boolean,
  labels: Schema.Array(LabelRef),
  // An ISO 8601 timestamp, decoded to a valid Date: a malformed one is a decode error, not NaN ages later.
  updated_at: Schema.Date,
}

const PullRequestPayload = Schema.Struct({
  action: Schema.optional(Schema.String),
  pull_request: Schema.Struct({
    ...IssueFields,
    draft: Schema.optional(Schema.Boolean),
    head: Schema.Struct({ ref: Schema.String, sha: Schema.String }),
    additions: Schema.optional(Schema.Number),
    deletions: Schema.optional(Schema.Number),
  }),
})

const IssuePayload = Schema.Struct({
  action: Schema.optional(Schema.String),
  issue: Schema.Struct({ ...IssueFields, pull_request: Schema.optional(Schema.Unknown) }),
})

const MergeGroupPayload = Schema.Struct({
  action: Schema.optional(Schema.String),
  merge_group: Schema.Struct({ head_sha: Schema.String, head_ref: Schema.String }),
})

const PushPayload = Schema.Struct({ ref: Schema.String, after: Schema.String })

// `action` is the caller's `event_type`, which says what the dispatch is for.
const RepositoryDispatchPayload = Schema.Struct({ action: Schema.optional(Schema.String) })

/** A pull request event, with the pull request as a subject. */
export interface PullRequestEnvelope {
  readonly kind: 'pullRequest'
  readonly event: string
  readonly action?: string
  readonly subject: Subject
  readonly headSha: string
}

/** An issue event, with the issue as a subject. */
export interface IssueEnvelope {
  readonly kind: 'issue'
  readonly event: string
  readonly action?: string
  readonly subject: Subject
}

/**
 * An event about the repository as a whole: a push, a schedule, a manual
 * dispatch, or a merge queue entry.
 */
export interface RepositoryEnvelope {
  readonly kind: 'repository'
  readonly event: string
  readonly action?: string
  /** The commit the event is about, when there is one. */
  readonly headSha?: string
}

/** An event smartcloud does not act on, and why. */
export interface UnsupportedEnvelope {
  readonly kind: 'unsupported'
  readonly event: string
  readonly reason: string
}

/** A GitHub event, normalised. */
export type Envelope = PullRequestEnvelope | IssueEnvelope | RepositoryEnvelope | UnsupportedEnvelope

/** The event payload did not have the shape GitHub documents for its name. */
export class EventDecodeError extends Data.TaggedError('EventDecodeError')<{ readonly event: string; readonly reason: string }> {
  override get message() {
    return `the ${this.event} payload could not be read: ${this.reason}`
  }
}

type IssueLike = Schema.Schema.Type<typeof IssuePayload>['issue']

const subjectOf = (kind: Subject['kind'], item: IssueLike): Subject => ({
  kind,
  number: item.number,
  title: item.title,
  body: item.body ?? '',
  author: item.user?.login ?? '',
  open: item.state === 'open',
  locked: item.locked,
  labels: item.labels.map((label) => label.name),
  updatedAt: item.updated_at,
})

const decode = <A, I>(schema: Schema.Schema<A, I>, event: string, payload: unknown) =>
  Either.match(Schema.decodeUnknownEither(schema)(payload), {
    onLeft: (error) => Effect.fail(new EventDecodeError({ event, reason: ParseResult.TreeFormatter.formatErrorSync(error) })),
    onRight: Effect.succeed,
  })

const withAction = <T extends object>(envelope: T, action: string | undefined): T & { readonly action?: string } =>
  action === undefined ? envelope : { ...envelope, action }

const PULL_REQUEST_EVENTS = new Set(['pull_request', 'pull_request_target', 'pull_request_review', 'pull_request_review_comment'])
const REPOSITORY_EVENTS = new Set(['schedule', 'workflow_dispatch'])

/**
 * Normalises a GitHub event into an {@link Envelope}.
 *
 * @remarks
 * Pull request and review events become a pull request subject; issue
 * events an issue subject; pushes, schedules, dispatches and merge queue
 * entries a repository event. Anything else is unsupported, which is a
 * notice, not a failure: v1 crashed with "There is no context to parse".
 *
 * @param event - The event name, as in `GITHUB_EVENT_NAME`.
 * @param payload - The event payload, as in the file at `GITHUB_EVENT_PATH`.
 * @returns The envelope, or an error when the payload is malformed.
 */
export const decodeEvent = (event: string, payload: unknown): Effect.Effect<Envelope, EventDecodeError> => {
  if (PULL_REQUEST_EVENTS.has(event)) {
    return Effect.map(decode(PullRequestPayload, event, payload), ({ action, pull_request: pr }) =>
      withAction(
        {
          kind: 'pullRequest' as const,
          event,
          headSha: pr.head.sha,
          subject: {
            ...subjectOf('pullRequest', pr),
            draft: pr.draft ?? false,
            headBranch: pr.head.ref,
            changes: (pr.additions ?? 0) + (pr.deletions ?? 0),
          },
        },
        action,
      ),
    )
  }
  if (event === 'issues' || event === 'issue_comment') {
    return Effect.map(decode(IssuePayload, event, payload), ({ action, issue }): Envelope =>
      issue.pull_request === undefined
        ? withAction({ kind: 'issue' as const, event, subject: subjectOf('issue', issue) }, action)
        : {
            kind: 'unsupported',
            event,
            reason: 'comments on pull requests carry no pull request data; smartcloud acts on the pull request events',
          },
    )
  }
  if (event === 'merge_group') {
    return Effect.map(decode(MergeGroupPayload, event, payload), ({ action, merge_group }) =>
      withAction({ kind: 'repository' as const, event, headSha: merge_group.head_sha }, action),
    )
  }
  if (event === 'push') {
    return Effect.map(decode(PushPayload, event, payload), ({ after }) => ({ kind: 'repository' as const, event, headSha: after }))
  }
  if (event === 'repository_dispatch') {
    return Effect.map(decode(RepositoryDispatchPayload, event, payload), ({ action }) =>
      withAction({ kind: 'repository' as const, event }, action),
    )
  }
  if (REPOSITORY_EVENTS.has(event)) return Effect.succeed({ kind: 'repository', event })
  return Effect.succeed({ kind: 'unsupported', event, reason: `smartcloud does not act on ${event} events` })
}
