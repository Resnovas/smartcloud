/**
 * @file packages/feature.commands/src/commands.ts
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

import type { Subject } from '@resnovas/conditions'
import { COMMAND_NAMES, type CommandName, type SmartcloudConfig } from '@resnovas/config'
import type { EnvelopeKind, RunResult } from '@resnovas/engine'
import { snoozeItem } from '@resnovas/feature.stale'
import {
  disableAutoMerge,
  enableAutoMerge,
  GitHub,
  type GitHubError,
  MERGE_METHODS,
  type MergeMethod,
} from '@resnovas/integrations.github'
import { Clock, Effect } from 'effect'
import { backport, type BackportResult, backportNames, isBranchName } from './backport.js'
import type { Invocation } from './parse.js'
import type { Role } from './permission.js'
import { getPull, type PullDetails, type UnexpectedAnswer } from './pulls.js'

/** Runs other features again, for `/run`. The runtime supplies it. */
export interface Runner {
  /** The features that can be run, by name, with the events each handles. */
  readonly features: ReadonlyArray<{ readonly name: string; readonly handles: ReadonlyArray<EnvelopeKind> }>
  /** Runs the named features on an event, and publishes the result as a run of its own would be. */
  readonly run: (request: {
    readonly config: SmartcloudConfig
    readonly event: { readonly name: string; readonly payload: unknown }
    readonly features: ReadonlyArray<string>
  }) => Effect.Effect<RunResult, unknown, GitHub>
}

/** What a command is given. */
export interface CommandContext {
  readonly config: SmartcloudConfig
  /** The issue or pull request the comment is on. */
  readonly subject: Subject
  readonly commenter: string
  readonly role: Role
  readonly dryRun: boolean
  readonly runner: Runner | undefined
  /** Whether the commenter may use a command, for `/help`. */
  readonly mayUse: (name: CommandName) => boolean
}

/** How a command went. `invalid` is a mistake in the command; `failed` is GitHub refusing it. */
export interface CommandResult {
  readonly status: 'done' | 'invalid' | 'failed'
  readonly message: string
  /** Longer Markdown output, shown in the reply. */
  readonly detail?: string
}

/** One slash command. */
export interface CommandSpec {
  /** How to write it, for `/help`. */
  readonly usage: string
  readonly summary: string
  readonly pullRequestOnly: boolean
  readonly run: (
    context: CommandContext,
    invocation: Invocation,
  ) => Effect.Effect<CommandResult, GitHubError | UnexpectedAnswer, GitHub>
}

const done = (message: string, detail?: string): Effect.Effect<CommandResult> =>
  Effect.succeed(detail === undefined ? { status: 'done', message } : { status: 'done', message, detail })
const invalid = (message: string): Effect.Effect<CommandResult> => Effect.succeed({ status: 'invalid', message })

const LOGIN = /^@?([A-Za-z0-9][A-Za-z0-9-]{0,38}(?:\[bot\])?)$/
const TEAM = /^@?([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([A-Za-z0-9._-]{1,100})$/

// Logins from the arguments, or the commenter when there are none; undefined
// when any argument is not a login.
const loginsOf = (args: ReadonlyArray<string>, commenter: string): ReadonlyArray<string> | undefined => {
  if (args.length === 0) return [commenter]
  const found = args.map((arg) => LOGIN.exec(arg)?.[1])
  return found.every((login) => login !== undefined) ? found : undefined
}

const list = (names: ReadonlyArray<string>) => names.map((name) => `@${name}`).join(', ')

const request = (method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', path: string, body?: Readonly<Record<string, unknown>>) =>
  Effect.flatMap(GitHub, (github) =>
    github.repositoryRequest(body === undefined ? { method, path } : { method, path, body }),
  )

const setState = (context: CommandContext, body: Readonly<Record<string, unknown>>) =>
  request('PATCH', `/issues/${context.subject.number}`, body)

const MUTATIONS = {
  draft: 'mutation($id: ID!) { convertPullRequestToDraft(input: { pullRequestId: $id }) { clientMutationId } }',
  ready: 'mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { clientMutationId } }',
  rebase:
    'mutation($id: ID!) { updatePullRequestBranch(input: { pullRequestId: $id, updateMethod: REBASE }) { clientMutationId } }',
} as const

const mutate = (context: CommandContext, mutation: string) =>
  Effect.gen(function* () {
    const pull = yield* getPull(context.subject.number)
    yield* (yield* GitHub).graphql(mutation, { id: pull.nodeId })
  })

const METHODS: ReadonlySet<string> = new Set(MERGE_METHODS)
type Method = MergeMethod
const isMethod = (value: string): value is Method => METHODS.has(value)

// The merge method named in the arguments, the config's, or squash.
const methodOf = (context: CommandContext, args: ReadonlyArray<string>): Method | undefined => {
  const [given, ...extra] = args
  if (extra.length > 0) return undefined
  if (given === undefined) return context.config.commands?.mergeMethod ?? 'squash'
  const lower = given.toLowerCase()
  return isMethod(lower) ? lower : undefined
}

const CLOSE_REASONS: ReadonlyMap<string, string> = new Map([
  ['completed', 'completed'],
  ['not-planned', 'not_planned'],
  ['duplicate', 'duplicate'],
])
const LOCK_REASONS: ReadonlySet<string> = new Set(['off-topic', 'too-heated', 'resolved', 'spam'])

const DAY = 86_400_000

const describeBackport = (pull: PullDetails, target: string, result: BackportResult): CommandResult => {
  switch (result.kind) {
    case 'opened':
      return { status: 'done', message: `opened #${result.number} to backport #${pull.number} to \`${target}\`` }
    case 'planned':
      return { status: 'done', message: `would backport #${pull.number} to \`${target}\` from \`${result.branch}\`` }
    case 'empty':
      return { status: 'done', message: `\`${target}\` already has the changes of #${pull.number}` }
    case 'conflict':
      return {
        status: 'failed',
        message: `the changes of #${pull.number} do not apply cleanly to \`${target}\`; backport them by hand`,
      }
    case 'no-target':
      return { status: 'invalid', message: `there is no branch called \`${target}\`` }
    case 'branch-exists':
      return {
        status: 'failed',
        message: `the branch \`${result.branch}\` already exists; a backport to \`${target}\` may already be open`,
      }
    case 'not-merged':
      return { status: 'invalid', message: `#${pull.number} was closed without being merged` }
    case 'too-large':
      return { status: 'invalid', message: `#${pull.number} has too many commits to backport` }
  }
}

/**
 * Backports a merged pull request to each target, reporting each one.
 *
 * @internal
 *
 * @param pull - The pull request.
 * @param targets - The branches.
 * @param config - The resolved config.
 * @param dryRun - Plan, without writing anything.
 * @returns One result per target.
 */
export const backportAll = (
  pull: PullDetails,
  targets: ReadonlyArray<string>,
  config: SmartcloudConfig,
  dryRun: boolean,
) =>
  Effect.forEach(targets, (target) =>
    backport(pull, target, backportNames(config), dryRun).pipe(
      Effect.map((result) => describeBackport(pull, target, result)),
      Effect.catchAll((error) =>
        Effect.succeed<CommandResult>({
          status: 'failed',
          message: `backporting to \`${target}\` failed: ${error.message}`,
        }),
      ),
    ),
  )

// Folds several results into one: the worst status, every message.
const combine = (results: ReadonlyArray<CommandResult>): CommandResult => ({
  status:
    results.find((result) => result.status === 'failed')?.status ??
    results.find((result) => result.status === 'invalid')?.status ??
    'done',
  message: results.map((result) => result.message).join('; '),
})

const counts = (result: RunResult) => {
  const errors = result.findings.filter((finding) => finding.level === 'error').length
  const warnings = result.findings.filter((finding) => finding.level === 'warning').length
  return `${errors} error(s), ${warnings} warning(s)${result.failed.length > 0 ? `, ${result.failed.length} failed to run` : ''}`
}

const findingLines = (result: RunResult) => [
  ...result.findings.map((finding) => `- **${finding.feature}** ${finding.level}: ${finding.message}`),
  ...result.failed.map((failure) => `- **${failure.feature}** failed to run`),
]

const reviewers = (context: CommandContext, invocation: Invocation, method: 'POST' | 'DELETE') =>
  Effect.gen(function* () {
    if (invocation.args.length === 0) return yield* invalid('name at least one person or team')
    const people: Array<string> = []
    const teams: Array<string> = []
    for (const arg of invocation.args) {
      const team = TEAM.exec(arg)?.[2]
      const login = LOGIN.exec(arg)?.[1]
      if (team !== undefined) teams.push(team)
      else if (login !== undefined) people.push(login)
      else return yield* invalid(`"${arg}" is not a login or a team, such as @octocat or @org/team`)
    }
    yield* request(method, `/pulls/${context.subject.number}/requested_reviewers`, {
      reviewers: people,
      team_reviewers: teams,
    })
    const who = [...people.map((name) => `@${name}`), ...teams.map((name) => `team ${name}`)].join(', ')
    return yield* done(
      method === 'POST'
        ? `requested reviews from ${who} on #${context.subject.number}`
        : `withdrew the review requests to ${who} on #${context.subject.number}`,
    )
  })

// Runs other features: those for the item on it, the rest as a manual dispatch.
const rerun = (context: CommandContext, invocation: Invocation) =>
  Effect.gen(function* () {
    const runner = context.runner
    if (runner === undefined) return yield* invalid('running features is not available here')
    const kind = context.subject.kind
    const known = runner.features.filter((feature) => feature.name !== 'commands')
    const named = invocation.args.map((arg) => arg.toLowerCase())
    const unknown = named.filter((name) => !known.some((feature) => feature.name === name))
    if (unknown.length > 0)
      return yield* invalid(
        `no feature called ${unknown.join(', ')}; there are ${known.map((feature) => feature.name).join(', ')}`,
      )
    const chosen =
      named.length === 0
        ? known.filter((feature) => feature.handles.includes(kind))
        : known.filter((feature) => named.includes(feature.name))
    const onItem = chosen.filter((feature) => feature.handles.includes(kind)).map((feature) => feature.name)
    const onRepository = chosen
      .filter((feature) => !feature.handles.includes(kind) && feature.handles.includes('repository'))
      .map((feature) => feature.name)
    const neither = chosen
      .filter((feature) => !onItem.includes(feature.name) && !onRepository.includes(feature.name))
      .map((feature) => feature.name)
    if (neither.length > 0)
      return yield* invalid(
        `${neither.join(', ')} cannot run on ${kind === 'pullRequest' ? 'a pull request' : 'an issue'}`,
      )
    if (onRepository.length > 0 && context.role !== 'maintain' && context.role !== 'admin') {
      return yield* invalid(
        `running ${onRepository.join(', ')} changes the whole repository, which needs the maintain role`,
      )
    }
    const github = yield* GitHub
    const runs: Array<{ readonly where: string; readonly result: RunResult }> = []
    const attempt = (
      where: string,
      event: Effect.Effect<{ readonly name: string; readonly payload: unknown }, GitHubError>,
      features: ReadonlyArray<string>,
    ) =>
      Effect.gen(function* () {
        const result = yield* runner.run({ config: context.config, event: yield* event, features })
        runs.push({ where, result })
      })
    const item =
      kind === 'pullRequest'
        ? Effect.map(
            github.repositoryRequest({ method: 'GET', path: `/pulls/${context.subject.number}` }),
            (pull_request) => ({
              name: 'pull_request',
              payload: { action: 'synchronize', pull_request },
            }),
          )
        : Effect.map(
            github.repositoryRequest({ method: 'GET', path: `/issues/${context.subject.number}` }),
            (issue) => ({
              name: 'issues',
              payload: { action: 'edited', issue },
            }),
          )
    const failure = yield* Effect.gen(function* () {
      if (onItem.length > 0) yield* attempt(`#${context.subject.number}`, item, onItem)
      if (onRepository.length > 0)
        yield* attempt('the repository', Effect.succeed({ name: 'workflow_dispatch', payload: {} }), onRepository)
    }).pipe(
      Effect.as(undefined),
      Effect.catchAll((error) => Effect.succeed(error instanceof Error ? error.message : String(error))),
    )
    const summary = runs.map(
      ({ where, result }) =>
        `ran ${result.ran.concat(result.failed.map((entry) => entry.feature)).join(', ') || 'nothing'} on ${where}: ${counts(result)}`,
    )
    const detail = runs.flatMap(({ result }) => findingLines(result)).join('\n')
    if (failure !== undefined)
      return {
        status: 'failed',
        message: [...summary, `running failed: ${failure}`].join('; '),
      } satisfies CommandResult
    return { status: 'done', message: summary.join('; '), ...(detail === '' ? {} : { detail }) } satisfies CommandResult
  })

/**
 * Every slash command, by name.
 *
 * @remarks
 * Each command's `run` is called only once the commenter is allowed to use
 * it and, for a pull-request-only command, the comment is on a pull request.
 *
 * @example
 * ```ts import.meta.vitest name="COMMANDS"
 * import { COMMANDS } from '@resnovas/feature.commands'
 *
 * COMMANDS.backport.usage // => '/backport <branch>...'
 * COMMANDS.rebase.pullRequestOnly // => true
 * ```
 */
export const COMMANDS: Readonly<Record<CommandName, CommandSpec>> = {
  help: {
    usage: '/help',
    summary: 'List the commands you can use here.',
    pullRequestOnly: false,
    run: (context) => {
      const usable = COMMAND_NAMES.filter(
        (name) => context.mayUse(name) && (context.subject.kind === 'pullRequest' || !COMMANDS[name].pullRequestOnly),
      )
      return done(
        `listed ${usable.length} command(s)`,
        usable.map((name) => `- \`${COMMANDS[name].usage}\`: ${COMMANDS[name].summary}`).join('\n'),
      )
    },
  },
  label: {
    usage: '/label <label>...',
    summary: 'Add labels. Quote a label with spaces.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        if (invocation.args.length === 0) return yield* invalid('name at least one label')
        const github = yield* GitHub
        const existing = yield* github.listLabels
        const names = invocation.args.map(
          (arg) => existing.find((label) => label.name.toLowerCase() === arg.toLowerCase())?.name,
        )
        const missing = invocation.args.filter((_, index) => names[index] === undefined)
        if (missing.length > 0)
          return yield* invalid(`there is no label called ${missing.map((name) => `"${name}"`).join(', ')}`)
        const found = names.filter((name) => name !== undefined)
        yield* github.addLabels(context.subject.number, found)
        return yield* done(`labelled #${context.subject.number} ${found.map((name) => `"${name}"`).join(', ')}`)
      }),
  },
  unlabel: {
    usage: '/unlabel <label>...',
    summary: 'Remove labels.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        if (invocation.args.length === 0) return yield* invalid('name at least one label')
        const github = yield* GitHub
        const removed: Array<string> = []
        for (const arg of invocation.args) {
          const name = context.subject.labels.find((label) => label.toLowerCase() === arg.toLowerCase())
          if (name === undefined) continue
          yield* github.removeLabel(context.subject.number, name).pipe(Effect.catchTag('NotFound', () => Effect.void))
          removed.push(name)
        }
        return yield* removed.length === 0
          ? invalid(`#${context.subject.number} has none of those labels`)
          : done(`removed ${removed.map((name) => `"${name}"`).join(', ')} from #${context.subject.number}`)
      }),
  },
  assign: {
    usage: '/assign [@user...]',
    summary: 'Assign people, or yourself when nobody is named.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const logins = loginsOf(invocation.args, context.commenter)
        if (logins === undefined) return yield* invalid('name people by their GitHub login, such as @octocat')
        yield* request('POST', `/issues/${context.subject.number}/assignees`, { assignees: logins })
        return yield* done(`assigned ${list(logins)} to #${context.subject.number}`)
      }),
  },
  unassign: {
    usage: '/unassign [@user...]',
    summary: 'Unassign people, or yourself when nobody is named.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const logins = loginsOf(invocation.args, context.commenter)
        if (logins === undefined) return yield* invalid('name people by their GitHub login, such as @octocat')
        yield* request('DELETE', `/issues/${context.subject.number}/assignees`, { assignees: logins })
        return yield* done(`unassigned ${list(logins)} from #${context.subject.number}`)
      }),
  },
  reviewer: {
    usage: '/reviewer @user|@org/team...',
    summary: 'Request reviews from people or teams.',
    pullRequestOnly: true,
    run: (context, invocation) => reviewers(context, invocation, 'POST'),
  },
  unreviewer: {
    usage: '/unreviewer @user|@org/team...',
    summary: 'Withdraw review requests.',
    pullRequestOnly: true,
    run: (context, invocation) => reviewers(context, invocation, 'DELETE'),
  },
  retitle: {
    usage: '/retitle <title>',
    summary: 'Change the title.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const title = invocation.rest
        if (title === '') return yield* invalid('give the new title')
        if (title.length > 256) return yield* invalid('titles are at most 256 characters')
        yield* setState(context, { title })
        return yield* done(`retitled #${context.subject.number} "${title}"`)
      }),
  },
  close: {
    usage: '/close [completed|not-planned|duplicate]',
    summary: 'Close it, with a reason for an issue.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const [given, ...extra] = invocation.args
        const reason = given === undefined ? undefined : CLOSE_REASONS.get(given.toLowerCase())
        if (
          extra.length > 0 ||
          (given !== undefined && (reason === undefined || context.subject.kind === 'pullRequest'))
        ) {
          return yield* invalid(
            context.subject.kind === 'pullRequest'
              ? 'a pull request is closed without a reason'
              : 'the reason is completed, not-planned or duplicate',
          )
        }
        yield* setState(context, reason === undefined ? { state: 'closed' } : { state: 'closed', state_reason: reason })
        return yield* done(`closed #${context.subject.number}`)
      }),
  },
  reopen: {
    usage: '/reopen',
    summary: 'Reopen it.',
    pullRequestOnly: false,
    run: (context) =>
      Effect.zipRight(setState(context, { state: 'open' }), done(`reopened #${context.subject.number}`)),
  },
  lock: {
    usage: '/lock [off-topic|too-heated|resolved|spam]',
    summary: 'Lock the conversation.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const [given, ...extra] = invocation.args
        const reason = given?.toLowerCase()
        if (extra.length > 0 || (reason !== undefined && !LOCK_REASONS.has(reason)))
          return yield* invalid('the reason is off-topic, too-heated, resolved or spam')
        yield* request(
          'PUT',
          `/issues/${context.subject.number}/lock`,
          // GitHub spells the reason "too heated"; the command takes it as one word.
          reason === undefined ? {} : { lock_reason: reason === 'too-heated' ? 'too heated' : reason },
        )
        return yield* done(`locked #${context.subject.number}`)
      }),
  },
  unlock: {
    usage: '/unlock',
    summary: 'Unlock the conversation.',
    pullRequestOnly: false,
    run: (context) =>
      Effect.zipRight(
        request('DELETE', `/issues/${context.subject.number}/lock`),
        done(`unlocked #${context.subject.number}`),
      ),
  },
  draft: {
    usage: '/draft',
    summary: 'Turn the pull request back into a draft.',
    pullRequestOnly: true,
    run: (context) =>
      Effect.zipRight(mutate(context, MUTATIONS.draft), done(`made #${context.subject.number} a draft`)),
  },
  ready: {
    usage: '/ready',
    summary: 'Mark the pull request ready for review.',
    pullRequestOnly: true,
    run: (context) =>
      Effect.zipRight(mutate(context, MUTATIONS.ready), done(`marked #${context.subject.number} ready for review`)),
  },
  update: {
    usage: '/update',
    summary: 'Merge the base branch into the pull request.',
    pullRequestOnly: true,
    run: (context) =>
      Effect.zipRight(
        request('PUT', `/pulls/${context.subject.number}/update-branch`, {}),
        done(`updated #${context.subject.number} from its base branch`),
      ),
  },
  rebase: {
    usage: '/rebase',
    summary: 'Rebase the pull request on its base branch.',
    pullRequestOnly: true,
    run: (context) =>
      Effect.zipRight(mutate(context, MUTATIONS.rebase), done(`rebased #${context.subject.number} on its base branch`)),
  },
  approve: {
    usage: '/approve',
    summary: 'Approve the pull request, on your behalf.',
    pullRequestOnly: true,
    run: (context) =>
      Effect.gen(function* () {
        if (context.subject.author.toLowerCase() === context.commenter.toLowerCase())
          return yield* invalid('you cannot approve your own pull request')
        yield* (yield* GitHub).createReview(context.subject.number, {
          event: 'APPROVE',
          body: `Approved on behalf of @${context.commenter}, who asked with \`/approve\`.`,
        })
        return yield* done(`approved #${context.subject.number} on behalf of @${context.commenter}`)
      }),
  },
  merge: {
    usage: '/merge [merge|squash|rebase]',
    summary: 'Merge the pull request now.',
    pullRequestOnly: true,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const method = methodOf(context, invocation.args)
        if (method === undefined) return yield* invalid('the method is merge, squash or rebase')
        yield* request('PUT', `/pulls/${context.subject.number}/merge`, { merge_method: method })
        return yield* done(`merged #${context.subject.number} (${method})`)
      }),
  },
  automerge: {
    usage: '/automerge [merge|squash|rebase|off]',
    summary: 'Merge the pull request once its checks and reviews pass, or stop that.',
    pullRequestOnly: true,
    run: (context, invocation) =>
      Effect.gen(function* () {
        if (invocation.args.length === 1 && invocation.args[0]?.toLowerCase() === 'off') {
          yield* disableAutoMerge((yield* getPull(context.subject.number)).nodeId)
          return yield* done(`turned off auto-merge for #${context.subject.number}`)
        }
        const method = methodOf(context, invocation.args)
        if (method === undefined) return yield* invalid('the method is merge, squash, rebase or off')
        yield* enableAutoMerge((yield* getPull(context.subject.number)).nodeId, method)
        return yield* done(`turned on auto-merge (${method}) for #${context.subject.number}`)
      }),
  },
  'stale-snooze': {
    usage: '/stale-snooze [days]',
    summary: 'Keep it from being marked stale for a while, and take off the stale label.',
    pullRequestOnly: false,
    run: (context, invocation) =>
      Effect.gen(function* () {
        const stale = context.config.stale
        if (stale === undefined) return yield* invalid('the stale feature is not configured')
        const [given, ...extra] = invocation.args
        const days = given === undefined ? (context.config.commands?.snoozeDays ?? 30) : Number(given)
        if (extra.length > 0 || !Number.isInteger(days) || days < 1 || days > 365)
          return yield* invalid('give a whole number of days from 1 to 365')
        const until = new Date((yield* Clock.currentTimeMillis) + days * DAY)
        const day = until.toISOString().slice(0, 10)
        const removed = yield* snoozeItem(
          stale,
          context.subject,
          until,
          `@${context.commenter} snoozed stale checks on this until ${day}.`,
          context.config.roles?.trustedBots ?? [],
        )
        return yield* done(
          `snoozed stale checks on #${context.subject.number} until ${day}${removed ? `, and removed "${stale.staleLabel}"` : ''}`,
        )
      }),
  },
  backport: {
    usage: '/backport <branch>...',
    summary: 'Backport the pull request to other branches: now when it is merged, or on merge.',
    pullRequestOnly: true,
    run: (context, invocation) =>
      Effect.gen(function* () {
        if (invocation.args.length === 0) return yield* invalid('name at least one branch')
        const bad = invocation.args.filter((arg) => !isBranchName(arg))
        if (bad.length > 0) return yield* invalid(`${bad.map((name) => `"${name}"`).join(', ')} is not a branch name`)
        const pull = yield* getPull(context.subject.number)
        if (pull.merged) return combine(yield* backportAll(pull, invocation.args, context.config, context.dryRun))
        if (!pull.open) return yield* invalid(`#${pull.number} was closed without being merged`)
        const labels = invocation.args.map((target) => `${backportNames(context.config).labelPrefix}${target}`)
        yield* (yield* GitHub).addLabels(context.subject.number, labels)
        return yield* done(
          `will backport #${pull.number} to ${invocation.args.map((target) => `\`${target}\``).join(', ')} when it is merged`,
        )
      }),
  },
  run: {
    usage: '/run [feature...]',
    summary: "Run smartcloud's features again: all of them for this item when none are named.",
    pullRequestOnly: false,
    run: rerun,
  },
}
