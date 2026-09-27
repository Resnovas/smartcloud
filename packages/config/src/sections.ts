/**
 * @file packages/config/src/sections.ts
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

import { ConditionGroup, Pattern } from '@resnovas/conditions'
import { DateTime, Option, Schema } from 'effect'

// The configuration sections of the policy, review, stale, lock, settings and sync
// features. Each is optional: a feature whose section is absent does not run.
// Every rule is a keyed record, so presets and repositories merge by key.

const opt = <A, I, R>(schema: Schema.Schema<A, I, R>) => Schema.optionalWith(schema, { exact: true })

const Level = Schema.Literal('error', 'warning').annotations({ identifier: 'Level' })
const Logins = Schema.Array(Schema.String)
const Subjects = Schema.Array(Schema.Literal('pullRequest', 'issue'))

/**
 * Who is who. Maintainers get warnings where contributors get errors, and
 * count towards the review gate; trusted bots skip the contributor checks.
 *
 * @example
 * ```ts import.meta.vitest name="Roles"
 * import { Roles } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Roles)({ maintainers: ['TGTGamer'], trustedBots: ['dependabot[bot]'] }) // => true
 * Schema.is(Roles)({ maintainers: 'TGTGamer' }) // => false
 * ```
 */
export const Roles = Schema.Struct({
  maintainers: opt(Logins),
  trustedBots: opt(Logins),
}).annotations({ identifier: 'Roles' })

/**
 * Where findings link to, so every broken rule points at its text.
 *
 * @example
 * ```ts import.meta.vitest name="Links"
 * import { Links } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Links)({ policyBase: 'https://github.com/Resnovas/.github/blob/main' }) // => true
 * Schema.is(Links)({ policyBase: 1 }) // => false
 * ```
 */
export const Links = Schema.Struct({
  /** Base URL of the governance documents, for example `https://github.com/Resnovas/.github/blob/main`. */
  policyBase: opt(Schema.String),
}).annotations({ identifier: 'Links' })

/**
 * DCO sign-off and AI attribution rules for commits.
 *
 * @example
 * ```ts import.meta.vitest name="Commits"
 * import { Commits } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Commits)({ dco: true, aiAttribution: true, maintainerLevel: 'warning' }) // => true
 * Schema.is(Commits)({ maintainerLevel: 'fatal' }) // => false
 * ```
 */
export const Commits = Schema.Struct({
  /** Every non-merge commit is signed off by its author. */
  dco: opt(Schema.Boolean),
  /** AI co-authors carry `Co-authored-by` and `Assisted-by` together, and never sign off. */
  aiAttribution: opt(Schema.Boolean),
  /** Extra patterns identifying AI tools by email or name, on top of the built-in list. */
  aiIdentities: opt(
    Schema.Struct({ emails: opt(Schema.Array(Schema.String)), names: opt(Schema.Array(Schema.String)) }),
  ),
  /** Level for maintainers' own pull requests. An AI sign-off is always an error. */
  maintainerLevel: opt(Level),
}).annotations({ identifier: 'Commits' })

/**
 * The AI disclosure a pull request description must carry.
 *
 * @example
 * ```ts import.meta.vitest name="Disclosure"
 * import { Disclosure } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Disclosure)({ fields: { level: 'AI level' }, requireDraft: true }) // => true
 * Schema.is(Disclosure)({ requireDraft: 'yes' }) // => false
 * ```
 */
export const Disclosure = Schema.Struct({
  /** The labels of the disclosure fields, if a repository renames them. */
  fields: opt(
    Schema.Struct({
      level: opt(Schema.String),
      tools: opt(Schema.String),
      accountable: opt(Schema.String),
      review: opt(Schema.String),
    }),
  ),
  /** AI-assisted pull requests must be opened as drafts. On by default. */
  requireDraft: opt(Schema.Boolean),
  maintainerLevel: opt(Level),
}).annotations({ identifier: 'Disclosure' })

/**
 * Reviewers to request when conditions pass.
 *
 * @example
 * ```ts import.meta.vitest name="RequestApproval"
 * import { RequestApproval } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(RequestApproval)({ reviewers: ['TGTGamer'], when: { condition: [{ type: 'isDraft', condition: false }] } }) // => true
 * Schema.is(RequestApproval)({ reviewers: ['TGTGamer'] }) // => false
 * ```
 */
export const RequestApproval = Schema.Struct({
  reviewers: Logins,
  /** Omit to request everyone; strategies choose at most count reviewers. */
  strategy: opt(Schema.Literal('round-robin', 'load-balanced', 'codeowners')),
  /** Total desired reviewers from this rule, including pending or completed reviews. Defaults to one with a strategy. */
  count: opt(Schema.Int.pipe(Schema.positive())),
  when: ConditionGroup,
}).annotations({ identifier: 'RequestApproval' })

/**
 * An automatic approval when conditions pass, for example for dependabot.
 *
 * @example
 * ```ts import.meta.vitest name="AutomaticApprove"
 * import { AutomaticApprove } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(AutomaticApprove)({ when: { condition: [{ type: 'creatorMatches', condition: '^dependabot' }] }, message: 'Approved' }) // => true
 * Schema.is(AutomaticApprove)({ message: 'Approved' }) // => false
 * ```
 */
export const AutomaticApprove = Schema.Struct({
  when: ConditionGroup,
  message: opt(Schema.String),
}).annotations({ identifier: 'AutomaticApprove' })

/**
 * The maintainer review gate and approval automation.
 *
 * @example
 * ```ts import.meta.vitest name="Reviews"
 * import { Reviews } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Reviews)({ gate: { outside: 2, maintainer: 1 } }) // => true
 * Schema.is(Reviews)({ gate: { outside: -1 } }) // => false
 * ```
 */
export const Reviews = Schema.Struct({
  /**
   * Maintainer approvals needed before merge, counted from each maintainer's
   * latest decisive review, excluding the author. The gate is open while
   * fewer than two maintainers are configured.
   */
  gate: opt(
    Schema.Struct({
      outside: opt(Schema.NonNegativeInt),
      maintainer: opt(Schema.NonNegativeInt),
    }),
  ),
  requestApprovals: opt(Schema.Record({ key: Schema.String, value: RequestApproval })),
  automaticApprove: opt(Schema.Record({ key: Schema.String, value: AutomaticApprove })),
}).annotations({ identifier: 'Reviews' })

/**
 * Scheduled marking of inactive issues and pull requests.
 *
 * @example
 * ```ts import.meta.vitest name="Stale"
 * import { Stale } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Stale)({ staleAfterDays: 60, staleLabel: 'stale' }) // => true
 * Schema.is(Stale)({ staleLabel: 'stale' }) // => false
 * ```
 */
export const Stale = Schema.Struct({
  on: opt(Subjects),
  staleAfterDays: Schema.NonNegative,
  staleLabel: Schema.String,
  staleComment: opt(Schema.String),
  abandonedAfterDays: opt(Schema.NonNegative),
  abandonedLabel: opt(Schema.String),
  abandonedComment: opt(Schema.String),
  /** Close abandoned items. Off by default. */
  close: opt(Schema.Boolean),
  exempt: opt(Schema.Struct({ labels: opt(Schema.Array(Schema.String)), when: opt(ConditionGroup) })),
}).annotations({ identifier: 'Stale' })

// A GitHub login, an organisation team slug, and an Actions variable name
// (GitHub reserves the GITHUB_ prefix).
const Login = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/
const Slug = /^[a-z0-9][a-z0-9_-]*$/

// The pattern documents the shape; the filter rejects what only looks like a
// URL, such as `http://[`, before GitHub does. A webhook URL can carry a
// token, so neither error repeats it.
const WEBHOOK_URL_MESSAGE = 'expected an http or https URL'
const WebhookUrl = Schema.String.pipe(
  Schema.pattern(/^https?:\/\/\S+$/, { message: () => WEBHOOK_URL_MESSAGE }),
  Schema.filter((url) => URL.canParse(url) || WEBHOOK_URL_MESSAGE, { jsonSchema: {} }),
)
const VariableName = /^(?![Gg][Ii][Tt][Hh][Uu][Bb]_)[A-Za-z_][A-Za-z0-9_]*$/
const REPOSITORY_ROLES = ['read', 'triage', 'write', 'maintain', 'admin'] as const

/**
 * Why a locked conversation is locked, as GitHub shows it on the item.
 *
 * @example
 * ```ts import.meta.vitest name="LockReason"
 * import { LockReason } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(LockReason)('resolved') // => true
 * Schema.is(LockReason)('done') // => false
 * ```
 */
export const LockReason = Schema.Literal('resolved', 'off-topic', 'too heated', 'spam').annotations({
  identifier: 'LockReason',
})

/**
 * Scheduled locking of issues and pull requests that have been closed for a while.
 *
 * @example
 * ```ts import.meta.vitest name="Lock"
 * import { Lock } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Lock)({ afterDays: 30, reason: 'resolved' }) // => true
 * Schema.is(Lock)({ reason: 'resolved' }) // => false
 * ```
 */
export const Lock = Schema.Struct({
  on: opt(Subjects),
  /** Days an item has been closed before its conversation is locked. */
  afterDays: Schema.NonNegative,
  reason: opt(LockReason),
  /** Posted on the item just before it is locked. */
  comment: opt(Schema.String),
  /** Added to the item just before it is locked. */
  label: opt(Schema.String),
  exempt: opt(Schema.Struct({ labels: opt(Schema.Array(Schema.String)) })),
}).annotations({ identifier: 'Lock' })

/**
 * How long the aggregate check waits for the others, in minutes, when
 * `required.timeout` is left out.
 *
 * @example
 * ```ts import.meta.vitest name="REQUIRED_TIMEOUT"
 * import { REQUIRED_TIMEOUT } from '@resnovas/config'
 *
 * REQUIRED_TIMEOUT // => 60
 * ```
 */
export const REQUIRED_TIMEOUT = 60

/**
 * One aggregate check that passes only when every other check on the pull
 * request's head commit has passed, so a ruleset requires that check alone
 * instead of a list of names.
 *
 * @example
 * ```ts import.meta.vitest name="Required"
 * import { Required } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Required)({ ignore: ['^codecov/'], timeout: 30 }) // => true
 * Schema.is(Required)({ timeout: 0 }) // => false
 * ```
 */
export const Required = Schema.Struct({
  /** Checks that do not count, matched by name, as patterns. */
  ignore: opt(
    Schema.Array(Pattern).annotations({
      description:
        'Checks that do not count towards the aggregate, as patterns matched against each check run name or status context, for example ^codecov/.',
    }),
  ),
  /** Checks that must appear and pass, matched by name, as patterns. */
  expect: opt(
    Schema.Array(Pattern).annotations({
      description:
        'Checks that must appear on the head commit and pass, as patterns matched against each check run name or status context, for example ^check$. One that has not appeared by the timeout fails the aggregate, so a deleted or renamed CI job cannot pass unnoticed.',
    }),
  ),
  /** Minutes to wait for the other checks to finish before failing. */
  timeout: opt(
    Schema.Int.pipe(
      Schema.between(1, 360),
      Schema.annotations({
        description: `Minutes to wait for the other checks to finish before failing, from 1 to 360 (the longest an Actions job may run). Defaults to ${REQUIRED_TIMEOUT}.`,
      }),
    ),
  ),
}).annotations({
  identifier: 'Required',
  description:
    'One aggregate check that passes only when every other check on the pull request has passed, so a ruleset requires that one check instead of a list of names.',
})

const FREEZE_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const FREEZE_TIME = /^(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat) )?([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Reads a recurring freeze window's `from` or `to`: `HH:MM` for a time every
 * day, or `Ddd HH:MM` for a time every week.
 *
 * @example
 * ```ts import.meta.vitest name="parseFreezeTime"
 * import { parseFreezeTime } from '@resnovas/config'
 *
 * parseFreezeTime('Fri 16:30')?.day // => 5
 * parseFreezeTime('Fri 16:30')?.minutes // => 990
 * parseFreezeTime('08:00')?.day // => undefined
 * parseFreezeTime('24:00') // => undefined
 * ```
 *
 * @param text - For example `Fri 16:00` or `22:30`.
 * @returns The day of the week (0 for Sunday), when the time names one, and the minutes into the day; undefined when the text is not a time.
 */
export const parseFreezeTime = (
  text: string,
): { readonly day: number | undefined; readonly minutes: number } | undefined => {
  const match = FREEZE_TIME.exec(text)
  if (match === null) return undefined
  const [, day, hours = '', minutes = ''] = match
  return {
    day: day === undefined ? undefined : FREEZE_DAYS.indexOf(day as (typeof FREEZE_DAYS)[number]),
    minutes: Number(hours) * 60 + Number(minutes),
  }
}

const FreezeTime = Schema.String.pipe(
  Schema.pattern(FREEZE_TIME),
  Schema.annotations({
    description:
      'HH:MM for a time every day, or a three-letter day and HH:MM, such as Fri 16:00, for a time every week.',
  }),
)

// Date.parse rolls an impossible day over, 2026-02-30 to March 2, so the day
// must also survive a round trip through the calendar.
const isCalendarDate = (text: string) => {
  const month = Number(text.slice(5, 7)) - 1
  const day = Number(text.slice(8, 10))
  const date = new Date(Date.UTC(Number(text.slice(0, 4)), month, day))
  return date.getUTCMonth() === month && date.getUTCDate() === day
}

const Instant = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/),
  Schema.filter((text) => !Number.isNaN(Date.parse(text)) && isCalendarDate(text), {
    message: () => 'not a valid date and time',
  }),
  Schema.annotations({ description: 'An ISO 8601 date and time with its offset, such as 2026-12-24T00:00:00Z.' }),
)

const TimeZone = Schema.String.pipe(
  Schema.filter((zone) => Option.isSome(DateTime.zoneMakeNamed(zone)), {
    message: (issue) => `unknown time zone ${String(issue.actual)}`,
  }),
  Schema.annotations({ description: 'An IANA time zone, such as Europe/London. Defaults to UTC.' }),
)

const reason = opt(
  Schema.String.annotations({ description: 'Why merges are frozen, shown on the check and in the report.' }),
)

const DatedWindow = Schema.Struct({
  start: Instant,
  end: Instant,
  reason,
}).pipe(
  Schema.filter((window) => Date.parse(window.end) > Date.parse(window.start), {
    message: () => 'end must be after start',
  }),
  Schema.annotations({ identifier: 'FreezeDates', description: 'A freeze from one date and time to another.' }),
)

const RecurringWindow = Schema.Struct({
  from: FreezeTime,
  to: FreezeTime,
  timezone: opt(TimeZone),
  reason,
}).pipe(
  Schema.filter(
    (window) => {
      const from = parseFreezeTime(window.from)
      const to = parseFreezeTime(window.to)
      // Both name a day, or neither does; a window that starts where it ends is empty.
      return (
        (from?.day === undefined) === (to?.day === undefined) &&
        (from?.day !== to?.day || from?.minutes !== to?.minutes)
      )
    },
    { message: () => 'from and to must both name a day or both leave it out, and must differ' },
  ),
  Schema.annotations({
    identifier: 'FreezeRecurring',
    description:
      'A freeze every day or every week, from one time to the next; a window whose to comes before its from runs over midnight or the weekend.',
  }),
)

/**
 * A merge freeze window: dated, from `start` to `end`, or recurring, from
 * `from` to `to` every day or every week in `timezone`.
 *
 * @example
 * ```ts import.meta.vitest name="FreezeWindow"
 * import { FreezeWindow } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(FreezeWindow)({ from: 'Fri 16:00', to: 'Mon 08:00', timezone: 'Europe/London' }) // => true
 * Schema.is(FreezeWindow)({ start: '2026-12-24T00:00:00Z', end: '2027-01-02T00:00:00Z' }) // => true
 * Schema.is(FreezeWindow)({ from: 'Fri 16:00', to: '08:00' }) // => false
 * ```
 */
export const FreezeWindow = Schema.Union(DatedWindow, RecurringWindow).annotations({ identifier: 'FreezeWindow' })
/** A decoded {@link FreezeWindow}. */
export type FreezeWindow = typeof FreezeWindow.Type

/**
 * A merge freeze: while one is in effect, the freeze check fails on every
 * open pull request and merge queue entries fail.
 *
 * @example
 * ```ts import.meta.vitest name="Freeze"
 * import { Freeze } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Freeze)({ active: true, reason: 'Release 2.0', exempt: { labels: ['hotfix'] } }) // => true
 * Schema.is(Freeze)({ windows: { weekend: { from: 'Fri 16:00', to: 'Mon 08:00' } } }) // => true
 * Schema.is(Freeze)({ active: 'yes' }) // => false
 * ```
 */
export const Freeze = Schema.Struct({
  /** Freeze merges now, until this is set back to false. */
  active: opt(
    Schema.Boolean.annotations({ description: 'Freeze merges now, until this is set back to false. Off by default.' }),
  ),
  /** Why the manual freeze is on. */
  reason: opt(Schema.String.annotations({ description: 'Why merges are frozen while active is true.' })),
  /** Scheduled freezes, by key, so presets and repositories merge them. */
  windows: opt(
    Schema.Record({ key: Schema.String, value: FreezeWindow }).annotations({
      description:
        'Scheduled freezes, by key: dated (start and end) or recurring (from and to, every day or every week).',
    }),
  ),
  /** Pull requests that may merge during a freeze. */
  exempt: opt(
    Schema.Struct({
      labels: opt(
        Schema.Array(Schema.String).annotations({
          description: 'Pull requests with any of these labels may merge during a freeze.',
        }),
      ),
    }),
  ),
}).annotations({
  identifier: 'Freeze',
  description:
    'A merge freeze, manual or scheduled: while one is in effect the freeze check fails on open pull requests and merge queue entries fail.',
})
/** A decoded {@link Freeze}. */
export type Freeze = typeof Freeze.Type

const BranchKey = Schema.String.pipe(
  Schema.pattern(/^[A-Za-z][A-Za-z0-9]{0,9}$/),
  Schema.annotations({ description: 'An issue tracker key, such as SMC. Matched in any case, so smc-12 counts.' }),
)

/**
 * One accepted form of branch name: a preset, a pattern, or both, when the
 * name must meet both.
 *
 * @example
 * ```ts import.meta.vitest name="BranchName"
 * import { BranchName } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(BranchName)({ preset: 'prefixed', prefixes: ['feat', 'fix'] }) // => true
 * Schema.is(BranchName)({ preset: 'issueKey', keys: ['SMC'] }) // => true
 * Schema.is(BranchName)({ pattern: '^release/' }) // => true
 * Schema.is(BranchName)({ keys: ['SMC'] }) // => false
 * ```
 */
export const BranchName = Schema.Struct({
  /** A built-in form. */
  preset: opt(
    Schema.Literal('prefixed', 'issueKey').annotations({
      description:
        'prefixed: <prefix>/<description>, such as ann/fix-typo or feat/labels. issueKey: an issue key such as SMC-12 anywhere in the name, between separators.',
    }),
  ),
  /** The prefixes the `prefixed` preset accepts. */
  prefixes: opt(
    Schema.Array(Schema.NonEmptyTrimmedString).annotations({
      description:
        'The prefixes the prefixed preset accepts, such as feat and fix, or the names of people. Any prefix when left out.',
    }),
  ),
  /** The issue keys the `issueKey` preset accepts. */
  keys: opt(
    Schema.Array(BranchKey).annotations({
      description: 'The issue tracker keys the issueKey preset accepts, such as SMC. Any key when left out.',
    }),
  ),
  /** A regular expression the name must match. */
  pattern: opt(Pattern),
}).pipe(
  Schema.filter(
    (name) =>
      (name.preset !== undefined || name.pattern !== undefined) &&
      (name.prefixes === undefined || name.preset === 'prefixed') &&
      (name.keys === undefined || name.preset === 'issueKey'),
    {
      message: () =>
        'a branch name needs a preset or a pattern; prefixes go with the prefixed preset, keys with issueKey',
      // Wrapped in allOf so Effect merges it with the struct's properties
      // rather than replacing them.
      jsonSchema: {
        allOf: [
          { anyOf: [{ required: ['preset'] }, { required: ['pattern'] }] },
          {
            if: { required: ['prefixes'] },
            then: { required: ['preset'], properties: { preset: { const: 'prefixed' } } },
          },
          { if: { required: ['keys'] }, then: { required: ['preset'], properties: { preset: { const: 'issueKey' } } } },
        ],
      },
    },
  ),
  Schema.annotations({
    identifier: 'BranchName',
    description: 'One accepted form of branch name: a preset, a pattern, or both, when the name must meet both.',
  }),
)
/** A decoded {@link BranchName}. */
export type BranchName = typeof BranchName.Type

/**
 * The branch naming policy for pull requests: a head branch must match one
 * of the accepted names.
 *
 * @example
 * ```ts import.meta.vitest name="Branches"
 * import { Branches } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Branches)({ names: { person: { preset: 'prefixed' }, issue: { preset: 'issueKey' } }, exempt: { authors: ['dependabot[bot]'] } }) // => true
 * Schema.is(Branches)({ names: [] }) // => false
 * ```
 */
export const Branches = Schema.Struct({
  /** The accepted forms, by key; a branch passes when it matches any. */
  names: opt(
    Schema.Record({ key: Schema.String, value: BranchName }).annotations({
      description:
        'The accepted forms of branch name, by key, so presets and repositories merge them. A head branch passes when it matches any of them.',
    }),
  ),
  /** The finding's level. */
  level: opt(
    Schema.Literal('error', 'warning').annotations({
      description: 'error fails the check; warning only reports. Defaults to error.',
    }),
  ),
  /** Replaces the explanation of the accepted names. */
  message: opt(Schema.String.annotations({ description: 'Shown instead of the list of accepted names.' })),
  /** Pull requests the policy does not check. */
  exempt: opt(
    Schema.Struct({
      branches: opt(
        Schema.Array(Pattern).annotations({
          description: 'Head branches matching any of these patterns are not checked, such as ^dependabot/.',
        }),
      ),
      authors: opt(
        Schema.Array(Schema.String).annotations({
          description: 'Pull requests opened by these logins are not checked, such as renovate[bot].',
        }),
      ),
    }),
  ),
}).annotations({
  identifier: 'Branches',
  description: 'A branch naming policy: the head branch of every pull request must match one of the accepted names.',
})
/** A decoded {@link Branches}. */
export type Branches = typeof Branches.Type

/**
 * A CODEOWNERS owner: a user as `@login`, a team as `@org/team`, or an email address.
 *
 * @example
 * ```ts import.meta.vitest name="CodeOwner"
 * import { CodeOwner } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(CodeOwner)('@Resnovas/docs') // => true
 * Schema.is(CodeOwner)('docs-team') // => false
 * ```
 */
export const CodeOwner = Schema.String.pipe(
  Schema.pattern(
    /^(@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)?|[^@\s]+@[^@\s]+\.[^@\s]+)$/,
  ),
  Schema.annotations({
    identifier: 'CodeOwner',
    description: 'A user as @login, a team as @org/team, or an email address.',
  }),
)

/**
 * A CODEOWNERS path pattern, in the gitignore-like syntax GitHub accepts.
 *
 * @example
 * ```ts import.meta.vitest name="CodeOwnersPath"
 * import { CodeOwnersPath } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(CodeOwnersPath)('/docs/') // => true
 * Schema.is(CodeOwnersPath)('!docs/') // => false
 * Schema.is(CodeOwnersPath)('docs/My\\ Files/') // => true
 * ```
 */
export const CodeOwnersPath = Schema.String.pipe(
  // GitHub ignores negation, character ranges and a leading escaped #; an
  // unescaped space would split the pattern from its owners.
  Schema.pattern(/^(?:\\ |\\[^\s[\]#]|[^!#\s[\]\\])(?:\\ |\\[^\s[\]]|[^\s[\]\\])*$/),
  Schema.annotations({
    identifier: 'CodeOwnersPath',
    description:
      'A path pattern such as *.md, /docs/ or apps/**/*.ts. GitHub does not support ! or [ ] in CODEOWNERS patterns; write a space as \\ followed by a space, as in docs/My\\ Files/.',
  }),
)

/**
 * One generated block of CODEOWNERS rules: the paths and who owns them.
 *
 * @example
 * ```ts import.meta.vitest name="CodeOwnersRule"
 * import { CodeOwnersRule } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(CodeOwnersRule)({ paths: ['/docs/', '*.md'], owners: ['@Resnovas/docs'], comment: 'Documentation.' }) // => true
 * Schema.is(CodeOwnersRule)({ paths: [], owners: ['@Resnovas/docs'] }) // => false
 * ```
 */
export const CodeOwnersRule = Schema.Struct({
  /** The path patterns, each written as a line. */
  paths: Schema.NonEmptyArray(CodeOwnersPath).annotations({
    description: 'The path patterns these owners own, each written as its own CODEOWNERS line.',
  }),
  /** Who owns them; empty leaves the paths without an owner. */
  owners: Schema.Array(CodeOwner).annotations({
    description: 'The owners of the paths. An empty list leaves them without an owner, overriding an earlier rule.',
  }),
  /** A comment written above the lines. */
  comment: opt(Schema.String.annotations({ description: 'A comment written above the lines, such as Documentation.' })),
}).annotations({
  identifier: 'CodeOwnersRule',
  description: 'Paths and their owners, written to the generated block of CODEOWNERS.',
})
/** A decoded {@link CodeOwnersRule}. */
export type CodeOwnersRule = typeof CodeOwnersRule.Type

/**
 * CODEOWNERS: validate the file on pull requests, and generate a block of it
 * from the config.
 *
 * @example
 * ```ts import.meta.vitest name="CodeOwners"
 * import { CodeOwners } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(CodeOwners)({ rules: { docs: { paths: ['/docs/'], owners: ['@Resnovas/docs'] } } }) // => true
 * Schema.is(CodeOwners)({ path: 'OWNERS' }) // => false
 * ```
 */
export const CodeOwners = Schema.Struct({
  /** Where the file lives. */
  path: opt(
    Schema.Literal('.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS').annotations({
      description:
        'Where the file lives, one of the locations GitHub reads. By default, the first that exists, or .github/CODEOWNERS.',
    }),
  ),
  /** The generated rules, by key, in the order they are written. */
  rules: opt(
    // An integer key, such as "2", would be enumerated before the others and
    // reorder the rules, so keys must not be one.
    Schema.Record({ key: Schema.String, value: CodeOwnersRule })
      .pipe(
        Schema.filter((rules) => Object.keys(rules).every((key) => !/^(?:0|[1-9]\d*)$/.test(key)), {
          message: () => 'a codeowners.rules key must not be a whole number, which would be written first',
          jsonSchema: { propertyNames: { not: { pattern: '^(?:0|[1-9]\\d*)$' } } },
        }),
      )
      .annotations({
        description:
          'Rules to generate, by key, so presets and repositories merge them. They are written in order, and the last matching rule wins. A key must not be a whole number such as 2, which would be moved first.',
      }),
  ),
  /** Fail pull requests that break CODEOWNERS. On by default. */
  check: opt(Schema.Boolean.annotations({ description: 'Check pull requests that change CODEOWNERS. On by default.' })),
  /** The finding's level on pull requests. */
  level: opt(Level.annotations({ description: 'error fails the check; warning only reports. Defaults to error.' })),
  /** The branch generated changes are proposed from. */
  branch: opt(
    Schema.NonEmptyTrimmedString.annotations({
      description: 'The branch generated changes are proposed from. Defaults to smartcloud/codeowners.',
    }),
  ),
}).annotations({
  identifier: 'CodeOwners',
  description:
    'CODEOWNERS: check the file on pull requests that change it, and generate a block of it from rules in the config.',
})
/** A decoded {@link CodeOwners}. */
export type CodeOwners = typeof CodeOwners.Type

/**
 * The repository settings baseline. Anything omitted is left as it is.
 *
 * @example
 * ```ts import.meta.vitest name="Settings"
 * import { Settings } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Settings)({ merging: { squash: true }, security: { codeScanning: 'extended' } }) // => true
 * Schema.is(Settings)({ ruleset: { mergeQueue: { grouping: 'allGreen' }, statusChecks: { checks: { check: true } } } }) // => true
 * Schema.is(Settings)({ security: { codeScanning: 'maximum' } }) // => false
 * Schema.is(Settings)({ actions: { workflowPermissions: 'read' }, collaborators: { octocat: 'write' } }) // => true
 * Schema.is(Settings)({ collaborators: { octocat: 'owner' } }) // => false
 * ```
 */
export const Settings = Schema.Struct({
  merging: opt(
    Schema.Struct({
      mergeCommit: opt(Schema.Boolean),
      squash: opt(Schema.Boolean),
      rebase: opt(Schema.Boolean),
      autoMerge: opt(Schema.Boolean),
      updateBranch: opt(Schema.Boolean),
      deleteBranchOnMerge: opt(Schema.Boolean),
      webCommitSignoff: opt(Schema.Boolean),
      squashTitle: opt(Schema.Literal('PR_TITLE', 'COMMIT_OR_PR_TITLE')),
      squashMessage: opt(Schema.Literal('COMMIT_MESSAGES', 'PR_BODY', 'BLANK')),
    }),
  ),
  features: opt(
    Schema.Struct({
      wiki: opt(Schema.Boolean),
      discussions: opt(Schema.Boolean),
      sponsorships: opt(Schema.Boolean),
    }),
  ),
  security: opt(
    Schema.Struct({
      immutableReleases: opt(Schema.Boolean),
      privateVulnerabilityReporting: opt(Schema.Boolean),
      dependabotAlerts: opt(Schema.Boolean),
      dependabotSecurityUpdates: opt(Schema.Boolean),
      codeScanning: opt(Schema.Literal('default', 'extended', 'off')),
      secretScanning: opt(Schema.Boolean),
    }),
  ),
  ruleset: opt(
    Schema.Struct({
      name: opt(Schema.String),
      linearHistory: opt(Schema.Boolean),
      blockDeletion: opt(Schema.Boolean),
      blockForcePush: opt(Schema.Boolean),
      /** Pull requests merge through a merge queue. Omitted fields take GitHub's defaults, except the method, which squashes. */
      mergeQueue: opt(
        Schema.Struct({
          method: opt(Schema.Literal('squash', 'rebase', 'merge')),
          /** `allGreen`: every queued entry must pass the required checks; `headGreen`: only the group's head. */
          grouping: opt(Schema.Literal('allGreen', 'headGreen')),
          checkTimeoutMinutes: opt(Schema.Int.pipe(Schema.between(1, 360))),
          maxEntriesToBuild: opt(Schema.Int.pipe(Schema.between(0, 100))),
          minEntriesToMerge: opt(Schema.Int.pipe(Schema.between(0, 100))),
          maxEntriesToMerge: opt(Schema.Int.pipe(Schema.between(0, 100))),
          minEntriesToMergeWaitMinutes: opt(Schema.Int.pipe(Schema.between(0, 360))),
        }),
      ),
      /** Environments a branch must deploy to successfully before it merges. */
      requiredDeployments: opt(Schema.Array(Schema.String)),
      /** Every commit pushed to the branch is signed and verified. */
      signedCommits: opt(Schema.Boolean),
      /** Changes reach the branch only through a pull request. */
      pullRequest: opt(
        Schema.Struct({
          /** Approvals required once two or more maintainers are configured; none before that. */
          requiredApprovals: opt(Schema.NonNegativeInt.pipe(Schema.lessThanOrEqualTo(10))),
          dismissStaleReviews: opt(Schema.Boolean),
          codeOwnerReview: opt(Schema.Boolean),
          lastPushApproval: opt(Schema.Boolean),
          conversationResolution: opt(Schema.Boolean),
          /** One more approval when Copilot opens a pull request on no one's behalf. */
          extraApprovalForUnattributedCopilot: opt(Schema.Boolean),
          mergeMethods: opt(Schema.NonEmptyArray(Schema.Literal('squash', 'rebase', 'merge'))),
        }),
      ),
      /** Required status checks, keyed by check context so presets and repositories merge them. */
      statusChecks: opt(
        Schema.Struct({
          checks: opt(Schema.Record({ key: Schema.String, value: Schema.Boolean })),
          /** Branches must be up to date with the base before merging. */
          strict: opt(Schema.Boolean),
          /** New branches may be created even if a check would block them. */
          skipOnCreation: opt(Schema.Boolean),
        }),
      ),
      /** Status checks required once two or more maintainers are configured. Prefer `statusChecks`. */
      requiredChecks: opt(Schema.Array(Schema.String)),
      /** CodeQL blocks merging at high or higher security alerts and at errors. Prefer `codeScanning`. */
      codeScanningGate: opt(Schema.Boolean),
      /** Code scanning tools whose results gate merging, keyed by tool name. */
      codeScanning: opt(
        Schema.Record({
          key: Schema.String,
          value: Schema.Struct({
            securityAlerts: Schema.Literal('none', 'critical', 'high_or_higher', 'medium_or_higher', 'all'),
            alerts: Schema.Literal('none', 'errors', 'errors_and_warnings', 'all'),
          }),
        }),
      ),
      /** The lowest code quality severity that blocks merging. */
      codeQuality: opt(Schema.Literal('errors', 'warnings', 'notes', 'all')),
      /** Line coverage limits. Enforced only when `enabled`, because they need coverage uploaded to GitHub. */
      codeCoverage: opt(
        Schema.Struct({
          enabled: opt(Schema.Boolean),
          /** Minimum line coverage, in percent. */
          minimum: opt(Schema.Number.pipe(Schema.between(0, 100))),
          /** Maximum drop in line coverage from the default branch, in percentage points. */
          maxDrop: opt(Schema.Number.pipe(Schema.between(0, 100))),
        }),
      ),
      /** Secret types whose open alerts block merging, for example `provider_patterns`. */
      secretScanningAlerts: opt(Schema.NonEmptyArray(Schema.String)),
      copilotReview: opt(Schema.Boolean),
      /** Repository admins may bypass the ruleset. On by default. */
      adminBypass: opt(Schema.Boolean),
    }),
  ),
  environments: opt(
    Schema.Struct({
      projectType: opt(Schema.Literal('saas', 'desktop', 'library', 'none')),
      names: opt(Schema.Array(Schema.String)),
    }),
  ),
  actions: opt(
    Schema.Struct({
      /** GitHub Actions runs in the repository. */
      enabled: opt(Schema.Boolean),
      /** Which actions and reusable workflows may run. */
      allowedActions: opt(Schema.Literal('all', 'local_only', 'selected')),
      /** Actions must be pinned to a full commit SHA. */
      shaPinningRequired: opt(Schema.Boolean),
      /** The actions allowed when `allowedActions` is `selected`. */
      selectedActions: opt(
        Schema.Struct({
          githubOwned: opt(Schema.Boolean),
          verifiedCreators: opt(Schema.Boolean),
          patterns: opt(Schema.Array(Schema.String)),
        }),
      ),
      /** The default permissions of the workflow token. */
      workflowPermissions: opt(Schema.Literal('read', 'write')),
      /** The workflow token may create and approve pull requests. */
      createPullRequests: opt(Schema.Boolean),
      /** Who outside the repository may use its actions and reusable workflows. Private and internal repositories only. */
      accessLevel: opt(Schema.Literal('none', 'user', 'organization', 'enterprise')),
    }),
  ),
  /** Collaborators by login, with their role; `none` removes one. */
  collaborators: opt(
    Schema.Record({
      key: Schema.String.pipe(Schema.pattern(Login)),
      value: Schema.Literal(...REPOSITORY_ROLES, 'none'),
    }),
  ),
  /** Organisation teams by slug, with their role on the repository. */
  teams: opt(
    Schema.Record({ key: Schema.String.pipe(Schema.pattern(Slug)), value: Schema.Literal(...REPOSITORY_ROLES) }),
  ),
  /** Webhooks, keyed by a name of your choosing and matched on GitHub by URL. */
  webhooks: opt(
    Schema.Record({
      key: Schema.String,
      value: Schema.Struct({
        url: WebhookUrl,
        /** The events that trigger it; `push` when a new webhook leaves it out. */
        events: opt(Schema.Array(Schema.String)),
        contentType: opt(Schema.Literal('json', 'form')),
        active: opt(Schema.Boolean),
        insecureSsl: opt(Schema.Boolean),
      }),
    }),
  ),
  /** The GitHub Pages site. */
  pages: opt(
    Schema.Struct({
      /** Publish a site. On by default; `false` unpublishes it. */
      enabled: opt(Schema.Boolean),
      /** Build with a workflow, or from a branch (`legacy`). */
      buildType: opt(Schema.Literal('workflow', 'legacy')),
      /** The branch a `legacy` site builds from; the default branch when left out. */
      branch: opt(Schema.String),
      path: opt(Schema.Literal('/', '/docs')),
      cname: opt(Schema.String),
      httpsEnforced: opt(Schema.Boolean),
    }),
  ),
  /**
   * Actions variables the repository must have, by name, each with what it is
   * for. Values stay on GitHub: they are never read or written.
   */
  variables: opt(Schema.Record({ key: Schema.String.pipe(Schema.pattern(VariableName)), value: Schema.String })),
}).annotations({ identifier: 'Settings' })

/**
 * Files synced from a template directory in another repository.
 *
 * @example
 * ```ts import.meta.vitest name="Sync"
 * import { Sync } from '@resnovas/config'
 * import { Schema } from 'effect'
 *
 * Schema.is(Sync)({ source: 'Resnovas/.github/templates@main', values: { ORG_NAME: 'Resnovas' } }) // => true
 * Schema.is(Sync)({ values: { ORG_NAME: 'Resnovas' } }) // => false
 * ```
 */
export const Sync = Schema.Struct({
  /** The template directory, as `owner/repo/path@ref`. */
  source: Schema.String,
  /** `{{KEY}}` values for the templates. */
  values: opt(Schema.Record({ key: Schema.String.pipe(Schema.pattern(/^[A-Z][A-Z0-9_]*$/)), value: Schema.String })),
  /** Template paths this repository keeps its own copy of. */
  exclude: opt(Schema.Array(Schema.String)),
  /** The branch sync pull requests are opened from. */
  branch: opt(Schema.String),
  /** Fail pull requests that edit synced content. On by default. */
  check: opt(Schema.Boolean),
  /** Level for maintainers' own pull requests that edit synced content; a warning by default. */
  maintainerLevel: opt(Level),
}).annotations({ identifier: 'Sync' })
