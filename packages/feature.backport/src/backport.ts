/**
 * @file packages/feature.backport/src/backport.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { type PullRequestEnvelope, Report } from '@resnovas/engine'
import {
  GitHub,
  type GitCommit,
  type GitHubError,
  isTrustedComment,
  ValidationFailed,
} from '@resnovas/integrations.github'
import { Effect } from 'effect'

const FEATURE = 'backport'

/**
 * The label prefix used when `backport.prefix` is left out: `backport v1.x`
 * backports to `v1.x`.
 *
 * @example
 * ```ts import.meta.vitest name="BACKPORT_PREFIX"
 * import { BACKPORT_PREFIX } from '@resnovas/feature.backport'
 *
 * BACKPORT_PREFIX // => 'backport '
 * ```
 */
export const BACKPORT_PREFIX = 'backport '

/**
 * The branches a pull request's labels ask to backport to.
 *
 * @remarks
 * A label names a branch when it starts with `prefix`, ignoring case; the
 * rest of the label, trimmed, is the branch. A label that is only the prefix
 * names none, and each branch is named once.
 *
 * @example
 * ```ts import.meta.vitest name="backportTargets"
 * import { backportTargets } from '@resnovas/feature.backport'
 *
 * backportTargets('backport ', ['bug', 'Backport release/1.x', 'backport v2', 'backport v2']).join(', ') // => 'release/1.x, v2'
 * ```
 *
 * @param prefix - The config's `backport.prefix`, or {@link BACKPORT_PREFIX}.
 * @param labels - The pull request's labels.
 * @returns The branches, in label order.
 */
export const backportTargets = (prefix: string, labels: ReadonlyArray<string>): ReadonlyArray<string> => {
  const targets = labels
    .filter((label) => label.toLowerCase().startsWith(prefix.toLowerCase()))
    .map((label) => label.slice(prefix.length).trim())
    .filter((target) => target !== '')
  return [...new Set(targets)]
}

/**
 * The branch a backport of a pull request to a target branch is pushed to.
 *
 * @example
 * ```ts import.meta.vitest name="backportBranch"
 * import { backportBranch } from '@resnovas/feature.backport'
 *
 * backportBranch(42, 'release/1.x') // => 'backport/42-to-release/1.x'
 * ```
 *
 * @param pullRequest - The merged pull request's number.
 * @param target - The branch backported to.
 * @returns The branch name.
 */
export const backportBranch = (pullRequest: number, target: string): string => `backport/${pullRequest}-to-${target}`

/**
 * Marks the one comment smartcloud keeps on a pull request for each branch it
 * is backported to.
 *
 * @example
 * ```ts import.meta.vitest name="backportMarker"
 * import { backportMarker } from '@resnovas/feature.backport'
 *
 * backportMarker('v1') // => '<!-- smartcloud:backport:v1 -->'
 * ```
 *
 * @param target - The branch backported to.
 * @returns The hidden HTML marker.
 */
export const backportMarker = (target: string): string => `<!-- smartcloud:backport:${target} -->`

/** The changes a merged pull request made on its base branch, as a range of commits. */
export interface PickRange {
  /** The commit the changes are measured from. */
  readonly from: string
  /** The commit holding them. */
  readonly to: string
  /** Whether `to` is a merge commit, which `git cherry-pick` needs `-m 1` for. */
  readonly mergeCommit: boolean
}

const firstParent = (commit: GitCommit): Effect.Effect<string, ValidationFailed> => {
  const parent = commit.parents[0]
  return parent === undefined
    ? Effect.fail(
        new ValidationFailed({ operation: 'backport', detail: `${commit.sha} has no parent to backport from` }),
      )
    : Effect.succeed(parent)
}

/**
 * The range of commits a merged pull request put on its base branch.
 *
 * @remarks
 * A merge commit's changes are measured from its first parent, and a squash
 * commit's from its parent. A rebase merge copies each of the pull request's
 * commits onto the base, keeping their messages, so when the commits before
 * the merge commit carry the pull request's commit messages in order, the
 * range starts before the first of them. Anything else is taken as a squash.
 *
 * @example
 * ```ts
 * import { pickRange } from '@resnovas/feature.backport'
 *
 * // Needs the GitHub service, as the engine provides it.
 * const range = pickRange(42, 'abc123')
 * ```
 *
 * @param pullRequest - The merged pull request's number.
 * @param sha - Its merge commit, as the envelope's `merge.sha` gives it.
 * @returns The range to pick.
 */
export const pickRange = (pullRequest: number, sha: string): Effect.Effect<PickRange, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const merge = yield* github.getCommit(sha)
    const parent = yield* firstParent(merge)
    if (merge.parents.length > 1) return { from: parent, to: sha, mergeCommit: true }
    const commits = yield* github.listCommits(pullRequest)
    let current = merge
    for (let index = commits.length - 1; index > 0 && current.message === commits[index]?.message; index--) {
      current = yield* github.getCommit(yield* firstParent(current))
      if (index === 1 && current.message === commits[0]?.message) {
        return { from: yield* firstParent(current), to: sha, mergeCommit: false }
      }
    }
    return { from: parent, to: sha, mergeCommit: false }
  })

// A shell word: quoted unless it is plainly safe, so a branch name cannot run
// anything when the commands are copied.
const shell = (word: string) => (/^[\w./@-]+$/.test(word) ? word : `'${word.replaceAll("'", `'\\''`)}'`)

const cherryPick = (range: PickRange) =>
  range.mergeCommit
    ? `git cherry-pick -x -m 1 ${shell(range.to)}`
    : `git cherry-pick -x ${shell(`${range.from}..${range.to}`)}`

// One comment per target, edited on later runs rather than repeated.
const upsertComment = (pullRequest: number, target: string, text: string, trusted: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const marker = backportMarker(target)
    const body = `${marker}\n${text}`
    const existing = (yield* github.listComments(pullRequest)).find(
      (comment) => comment.body.includes(marker) && isTrustedComment(comment, trusted),
    )
    if (existing === undefined) yield* github.createComment(pullRequest, body)
    else if (existing.body !== body) yield* github.updateComment(existing.id, body)
  })

/**
 * Backports a merged pull request to one branch, and says how it went on the
 * pull request.
 *
 * @remarks
 * The pull request is picked as one signed-off commit on
 * `backport/<number>-to-<target>`, titled like the original, with a body
 * that names it and repeats its description. `backport.labels` are added to
 * the new pull request. One `<!-- smartcloud:backport:<target> -->` comment
 * on the original links it, or explains a conflict with the commands to
 * backport by hand, a missing branch, or that the branch already has the
 * changes. An open backport pull request from the branch is left alone.
 *
 * @example
 * ```ts
 * import { backportTo } from '@resnovas/feature.backport'
 *
 * declare const pullRequest: { readonly number: number; readonly title: string; readonly body: string }
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = backportTo({ version: 2, backport: {} }, pullRequest, { from: 'a', to: 'b', mergeCommit: false }, 'v1')
 * ```
 *
 * @param config - The whole config; `backport` and `roles.trustedBots` are read.
 * @param pullRequest - The merged pull request.
 * @param range - Its changes, from {@link pickRange}.
 * @param target - The branch to backport to.
 * @returns Nothing; the changes and findings are in the report.
 */
export const backportTo = (
  config: SmartcloudConfig,
  pullRequest: { readonly number: number; readonly title: string; readonly body: string },
  range: PickRange,
  target: string,
): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    const trusted = config.roles?.trustedBots ?? []
    const number = pullRequest.number
    const branch = backportBranch(number, target)
    const description = pullRequest.body.trim() === '' ? '' : `\n\n---\n\n${pullRequest.body}`
    const result = yield* github.backport({
      branch,
      base: target,
      from: range.from,
      to: range.to,
      message: `${pullRequest.title}\n\nBackport of #${number} (${range.to}) to ${target}.`,
      title: pullRequest.title,
      body: `Backport of #${number} to \`${target}\`, cherry-picked from ${range.to}.${description}`,
    })
    yield* Effect.logInfo(`backport: ${target} ${result.status}`).pipe(
      Effect.annotateLogs({ feature: FEATURE, rule: 'backport', target, status: result.status }),
    )
    if (result.status === 'conflict') {
      const commands = [
        'git fetch origin',
        `git switch -c ${shell(branch)} ${shell(`origin/${target}`)}`,
        cherryPick(range),
      ].join('\n')
      yield* upsertComment(
        number,
        target,
        `The backport to \`${target}\` did not apply cleanly, so no pull request was opened. To backport by hand:\n\n\`\`\`sh\n${commands}\n\`\`\``,
        trusted,
      )
      yield* report.add({
        feature: FEATURE,
        rule: 'backport',
        level: 'warning',
        message: `#${number} does not apply cleanly to ${target}; the pull request says how to backport it by hand.`,
      })
      return
    }
    if (result.status === 'empty') {
      yield* upsertComment(
        number,
        target,
        `\`${target}\` already has the changes from this pull request, so there is nothing to backport.`,
        trusted,
      )
      yield* report.add({
        feature: FEATURE,
        rule: 'backport',
        level: 'notice',
        message: `${target} already has the changes from #${number}.`,
      })
      return
    }
    // Added on every run, so a run that failed after opening the pull request is repaired by the next.
    const labels = config.backport?.labels ?? []
    if (labels.length > 0) yield* github.addLabels(result.number, labels)
    if (result.status === 'opened') {
      yield* report.change({
        feature: FEATURE,
        description: `opened #${result.number} to backport #${number} to ${target}`,
      })
    }
    yield* upsertComment(number, target, `Backported to \`${target}\` in #${result.number}.`, trusted)
  })

/**
 * Backports a merged pull request to every branch its backport labels name,
 * or, on a `labeled` event, to the branch the new label names.
 *
 * @remarks
 * It acts on `closed` and `labeled` pull request events of a merged pull
 * request and ignores the rest, so a label added before the merge waits for
 * it. Each branch is backported on its own: a branch that does not exist is
 * a warning and a comment, a write the token may not make (a pull request
 * event from a fork runs with a read-only token) a warning, and any other
 * failure an error naming the branch, and the others still run.
 *
 * @example
 * ```ts
 * import type { PullRequestEnvelope } from '@resnovas/engine'
 * import { runBackports } from '@resnovas/feature.backport'
 *
 * declare const envelope: PullRequestEnvelope
 * // Needs the GitHub service and a Report, as the engine provides them.
 * const program = runBackports({ version: 2, backport: { labels: ['backport'] } }, envelope)
 * ```
 *
 * @param config - The whole config; `backport` and `roles.trustedBots` are read.
 * @param envelope - The pull request event.
 * @returns Nothing; the changes and findings are in the report.
 */
export const runBackports = (
  config: SmartcloudConfig,
  envelope: PullRequestEnvelope,
): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    const merge = envelope.merge
    if (config.backport === undefined || merge === undefined) return
    const prefix = config.backport.prefix ?? BACKPORT_PREFIX
    const labels =
      envelope.action === 'closed'
        ? envelope.subject.labels
        : envelope.action === 'labeled' && envelope.label !== undefined
          ? [envelope.label]
          : []
    const targets = backportTargets(prefix, labels).filter((target) => target !== merge.base)
    if (targets.length === 0) return
    const report = yield* Report
    const subject = envelope.subject
    const range = yield* pickRange(subject.number, merge.sha)
    for (const target of targets) {
      yield* backportTo(config, subject, range, target).pipe(
        Effect.catchTags({
          // Only a missing target branch is explained as one; any other 404 is an error below.
          NotFound: (error) =>
            error.operation !== 'backport: read base'
              ? Effect.fail(error)
              : Effect.zipRight(
                  upsertComment(
                    subject.number,
                    target,
                    `There is no \`${target}\` branch to backport to.`,
                    config.roles?.trustedBots ?? [],
                  ),
                  report.add({
                    feature: FEATURE,
                    rule: 'backport',
                    level: 'warning',
                    message: `#${subject.number} was not backported: there is no ${target} branch.`,
                  }),
                ),
          Forbidden: () =>
            report.add({
              feature: FEATURE,
              rule: 'backport',
              level: 'warning',
              message: `#${subject.number} was not backported to ${target} on a read-only token, for example a pull request event from a fork.`,
            }),
        }),
        Effect.catchAll((error) =>
          report.add({
            feature: FEATURE,
            rule: 'backport',
            level: 'error',
            message: `#${subject.number} was not backported to ${target}: ${error.message}`,
          }),
        ),
      )
    }
  })
