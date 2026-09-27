/**
 * @file packages/feature.commands/src/feature.ts
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

import { COMMAND_NAMES, type CommandName, type SmartcloudConfig } from '@resnovas/config'
import { type CommentEnvelope, type Feature, type PullRequestEnvelope, Report } from '@resnovas/engine'
import { DryRunLog, GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Effect, Option } from 'effect'
import { backportNames, isBranchName } from './backport.js'
import { backportAll, type CommandContext, type CommandResult, COMMANDS, type Runner } from './commands.js'
import { COMMAND_LIMIT, Invocation, parseCommands } from './parse.js'
import { includes, policyFor, type Role, roleOf } from './permission.js'
import { getPull } from './pulls.js'

const FEATURE = 'commands'

/**
 * Marks smartcloud's replies to commands.
 *
 * @example
 * ```ts import.meta.vitest name="REPLY_MARKER"
 * import { REPLY_MARKER } from '@resnovas/feature.commands'
 *
 * REPLY_MARKER // => '<!-- smartcloud:commands -->'
 * ```
 */
export const REPLY_MARKER = '<!-- smartcloud:commands -->'

/** One command from a comment and how it went. */
export interface Outcome {
  readonly invocation: Invocation
  readonly status: CommandResult['status'] | 'denied'
  readonly message: string
  readonly detail?: string
}

const isCommandName = (name: string): name is CommandName => COMMAND_NAMES.some((known) => known === name)

const ICONS: Readonly<Record<Outcome['status'], string>> = { done: '✅', invalid: '⚠️', failed: '❌', denied: '🚫' }

// Backticks would end the code span the line is quoted in.
const quote = (line: string) => `\`${line.replaceAll('`', "'")}\``

/**
 * The reply to a comment's commands, or none when every command simply
 * worked.
 *
 * @example
 * ```ts import.meta.vitest name="replyBody"
 * import { Invocation, replyBody } from '@resnovas/feature.commands'
 *
 * const invocation = new Invocation({ name: 'approve', args: [], rest: '', line: '/approve' })
 * replyBody('sam', [{ invocation, status: 'denied', message: 'needs the write role' }])?.split('\n')[2] // => '- 🚫 `/approve`: needs the write role'
 * replyBody('sam', [{ invocation, status: 'done', message: 'approved #7' }]) // => undefined
 * ```
 *
 * @param commenter - Who wrote the commands.
 * @param outcomes - How each went.
 * @returns The reply's Markdown, or undefined when no reply is needed.
 */
export const replyBody = (commenter: string, outcomes: ReadonlyArray<Outcome>): string | undefined => {
  if (outcomes.every((outcome) => outcome.status === 'done' && outcome.detail === undefined)) return undefined
  const details = outcomes.flatMap((outcome) =>
    outcome.detail === undefined
      ? []
      : [`<details open><summary>${quote(outcome.invocation.line)}</summary>\n\n${outcome.detail}\n\n</details>`],
  )
  const lines = outcomes.map(
    (outcome) => `- ${ICONS[outcome.status]} ${quote(outcome.invocation.line)}: ${outcome.message}`,
  )
  return [`${REPLY_MARKER}\n@${commenter}\n${lines.join('\n')}`, ...details].join('\n\n')
}

const record = (outcome: Outcome) =>
  Effect.flatMap(Report, (report) =>
    outcome.status === 'done'
      ? report.change({ feature: FEATURE, description: `${outcome.invocation.line}: ${outcome.message}` })
      : report.add({
          feature: FEATURE,
          rule: `commands.${outcome.status}`,
          level: 'warning',
          message: `${outcome.invocation.line}: ${outcome.message}`,
        }),
  )

// Replying and reacting never fail the run: the commands have already run.
const noteFailure = (step: string) => (error: GitHubError) =>
  Effect.flatMap(Report, (report) =>
    report.add({ feature: FEATURE, rule: 'commands.reply', level: 'warning', message: `${step}: ${error.message}` }),
  )

const answer = (config: SmartcloudConfig, envelope: CommentEnvelope, runner: Runner | undefined) =>
  Effect.gen(function* () {
    // Edited and deleted comments are not run again.
    if ((envelope.action ?? 'created') !== 'created' || envelope.comment.bot) return
    const invocations = parseCommands(envelope.comment.body).filter((invocation) => isCommandName(invocation.name))
    if (invocations.length === 0) return
    const github = yield* GitHub
    const report = yield* Report
    const { subject } = envelope
    const commenter = envelope.comment.author
    const role: Role = yield* roleOf(commenter).pipe(
      Effect.catchAll((error) =>
        Effect.as(
          report.add({
            feature: FEATURE,
            rule: 'commands.role',
            level: 'warning',
            message: `could not read the role of @${commenter}, so none is assumed: ${error.message}`,
          }),
          'none' as const,
        ),
      ),
    )
    const isAuthor = subject.author.toLowerCase() === commenter.toLowerCase()
    const mayUse = (name: CommandName) => {
      const policy = policyFor(config, name)
      return policy.enabled && (includes(role, policy.permission) || (policy.author && isAuthor))
    }
    const context: CommandContext = {
      config,
      subject,
      commenter,
      role,
      dryRun: Option.isSome(yield* Effect.serviceOption(DryRunLog)),
      runner,
      mayUse,
    }

    const outcomes: Array<Outcome> = []
    for (const [index, invocation] of invocations.entries()) {
      const name = invocation.name as CommandName
      const policy = policyFor(config, name)
      const spec = COMMANDS[name]
      const result: Omit<Outcome, 'invocation'> =
        index >= COMMAND_LIMIT
          ? { status: 'invalid', message: `only the first ${COMMAND_LIMIT} commands in a comment are run` }
          : !policy.enabled
            ? { status: 'invalid', message: `/${name} is turned off in this repository` }
            : !mayUse(name)
              ? {
                  status: 'denied',
                  message: `needs the ${policy.permission} role${policy.author ? ', or to be the author' : ''}; @${commenter} has ${role === 'none' ? 'no role' : `the ${role} role`}`,
                }
              : spec.pullRequestOnly && subject.kind !== 'pullRequest'
                ? { status: 'invalid', message: `/${name} only works on pull requests` }
                : yield* spec
                    .run(context, invocation)
                    .pipe(
                      Effect.catchAll((error) =>
                        Effect.succeed<CommandResult>({ status: 'failed', message: error.message }),
                      ),
                    )
      const outcome: Outcome = { invocation, ...result }
      yield* record(outcome)
      outcomes.push(outcome)
    }

    if (config.commands?.reactions !== false) {
      const content = outcomes.every((outcome) => outcome.status === 'done') ? '+1' : 'confused'
      yield* github
        .repositoryRequest({
          method: 'POST',
          path: `/issues/comments/${envelope.comment.id}/reactions`,
          body: { content },
        })
        .pipe(Effect.catchAll(noteFailure('reaction')))
    }
    const reply = replyBody(commenter, outcomes)
    if (reply !== undefined)
      yield* github.createComment(subject.number, reply).pipe(Effect.catchAll(noteFailure('reply')))
  })

const backportOnMerge = (config: SmartcloudConfig, envelope: PullRequestEnvelope) =>
  Effect.gen(function* () {
    // With a backport section the backport feature opens these on merge; doing
    // it here too would open every backport twice.
    if (envelope.action !== 'closed' || !policyFor(config, 'backport').enabled || config.backport !== undefined) return
    const prefix = backportNames(config).labelPrefix.toLowerCase()
    const targets = envelope.subject.labels
      .filter((label) => label.toLowerCase().startsWith(prefix))
      .map((label) => label.slice(prefix.length).trim())
      .filter(isBranchName)
    if (targets.length === 0) return
    const pull = yield* getPull(envelope.subject.number)
    if (!pull.merged) return
    // A label naming the branch the pull request merged into asks for nothing.
    const wanted = targets.filter((target) => target !== pull.baseBranch)
    if (wanted.length === 0) return
    const dryRun = Option.isSome(yield* Effect.serviceOption(DryRunLog))
    const results = yield* backportAll(pull, wanted, config, dryRun)
    const { labelPrefix } = backportNames(config)
    const outcomes: ReadonlyArray<Outcome> = results.map((result, index) => {
      const target = wanted[index] ?? ''
      return {
        invocation: new Invocation({ name: 'backport', args: [target], rest: target, line: `${labelPrefix}${target}` }),
        ...result,
      }
    })
    for (const outcome of outcomes) yield* record(outcome)
    const lines = outcomes.map(
      (outcome) => `- ${ICONS[outcome.status]} \`${outcome.invocation.rest}\`: ${outcome.message}`,
    )
    const body = `${REPLY_MARKER}\nBackports of #${pull.number}, asked for by its labels:\n\n${lines.join('\n')}`
    yield* (yield* GitHub).createComment(pull.number, body).pipe(Effect.catchAll(noteFailure('reply')))
  })

/**
 * Builds the commands feature: slash commands in issue and pull request
 * comments, and backports asked for by label when a pull request merges.
 *
 * @remarks
 * Runs on `issue_comment` events for new comments, and on pull request
 * events when a pull request is closed. It is enabled by a `commands`
 * section. Each command is limited by the commenter's repository role, read
 * from GitHub; the item's author may use some commands on their own item.
 * Comments by bots are ignored, so smartcloud never answers itself.
 *
 * Every command is recorded: a change when it worked, and a warning when it
 * was refused, invalid or failed. The comment gets a 👍 or 😕 reaction, and
 * a reply when anything went wrong or a command has output, such as `/help`.
 *
 * `/run` needs a {@link Runner}, which the runtime supplies; without one it
 * says it is not available.
 *
 * @example
 * ```ts import.meta.vitest name="makeCommandsFeature"
 * import { makeCommandsFeature } from '@resnovas/feature.commands'
 *
 * const commands = makeCommandsFeature()
 * commands.handles.join(', ') // => 'comment, pullRequest'
 * commands.enabled?.({ version: 2, commands: {} }) // => true
 * ```
 *
 * @param options - `runner` runs other features for `/run`.
 * @returns The feature.
 */
export const makeCommandsFeature = (options: { readonly runner?: Runner } = {}): Feature => ({
  name: FEATURE,
  handles: ['comment', 'pullRequest'],
  enabled: (config) => config.commands !== undefined,
  run: ({ config, envelope }) => {
    if (envelope.kind === 'comment') return answer(config, envelope, options.runner)
    if (envelope.kind === 'pullRequest') return backportOnMerge(config, envelope)
    return Effect.void
  },
})
