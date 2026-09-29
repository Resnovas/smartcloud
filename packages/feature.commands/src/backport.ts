/**
 * @file packages/feature.commands/src/backport.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Effect, Schema } from 'effect'
import { type PullDetails, request, type UnexpectedAnswer } from './pulls.js'

/** Where backports are asked for and made. */
export interface BackportNames {
  /** A label asking for a backport on merge is this and the target branch. */
  readonly labelPrefix: string
  /** Backport branches start with this. */
  readonly branchPrefix: string
}

/**
 * The backport label and branch prefixes, with the config's `commands.backport` applied.
 *
 * @example
 * ```ts import.meta.vitest name="backportNames"
 * import { backportNames } from '@resnovas/feature.commands'
 *
 * backportNames({ version: 2 }).labelPrefix // => 'backport '
 * backportNames({ version: 2, commands: { backport: { branchPrefix: 'bp/' } } }).branchPrefix // => 'bp/'
 * ```
 *
 * @param config - The resolved config.
 * @returns The prefixes.
 */
export const backportNames = (config: SmartcloudConfig): BackportNames => ({
  // The backport feature's prefix when it is configured, so /backport labels
  // are the ones that feature reads.
  labelPrefix: config.commands?.backport?.labelPrefix ?? config.backport?.prefix ?? 'backport ',
  branchPrefix: config.commands?.backport?.branchPrefix ?? 'backport/',
})

// Git's own rules, kept to what branches are normally called: no spaces,
// control characters, `..`, `@{`, or a leading or trailing `/` or `.`.
const BRANCH = /^(?!\/|\.)(?!.*(?:\.\.|\/\/|@\{|\.lock$|\/$|\.$))[A-Za-z0-9._/-]{1,200}$/

/**
 * Whether a string is a branch name smartcloud will backport to.
 *
 * @example
 * ```ts import.meta.vitest name="isBranchName"
 * import { isBranchName } from '@resnovas/feature.commands'
 *
 * isBranchName('release/1.x') // => true
 * isBranchName('../main') // => false
 * ```
 *
 * @param name - The name.
 * @returns True when it is a plain branch name.
 */
export const isBranchName = (name: string): boolean => BRANCH.test(name)

/**
 * The most commits a pull request may have for smartcloud to backport it.
 *
 * @example
 * ```ts import.meta.vitest name="BACKPORT_COMMIT_LIMIT"
 * import { BACKPORT_COMMIT_LIMIT } from '@resnovas/feature.commands'
 *
 * BACKPORT_COMMIT_LIMIT // => 100
 * ```
 */
export const BACKPORT_COMMIT_LIMIT = 100

/** What a backport came to. */
export type BackportResult =
  | { readonly kind: 'opened'; readonly branch: string; readonly number: number; readonly url: string }
  /** A dry run: what would have been opened. */
  | { readonly kind: 'planned'; readonly branch: string }
  /** The target already has every change. */
  | { readonly kind: 'empty' }
  | { readonly kind: 'conflict' }
  | { readonly kind: 'no-target' }
  | { readonly kind: 'branch-exists'; readonly branch: string }
  | { readonly kind: 'not-merged' }
  | { readonly kind: 'too-large' }

const Ref = Schema.Struct({ object: Schema.Struct({ sha: Schema.String }) })
const GitCommit = Schema.Struct({ sha: Schema.String, tree: Schema.Struct({ sha: Schema.String }) })
const Author = Schema.Struct({ name: Schema.String, email: Schema.String, date: Schema.String })
const CommitDetails = Schema.Struct({
  sha: Schema.String,
  parents: Schema.Array(Schema.Struct({ sha: Schema.String })),
  commit: Schema.Struct({ message: Schema.String, author: Schema.NullishOr(Author) }),
})
const PullsOfCommit = Schema.Array(Schema.Struct({ number: Schema.Number }))
const Merged = Schema.NullishOr(
  Schema.Struct({ commit: Schema.Struct({ tree: Schema.Struct({ sha: Schema.String }) }) }),
)
const Created = Schema.Struct({ number: Schema.Number, html_url: Schema.String })

type Details = typeof CommitDetails.Type

// The commit the pull request's changes start from, and every commit that
// makes them up, newest first. A merge commit's changes are against its first
// parent. A squash makes one commit; a rebase merge lays the pull request's
// commits on the base, and each of them still belongs to the pull request.
const changesOf = (pull: PullDetails, head: string) =>
  Effect.gen(function* () {
    const get = (sha: string) => request({ method: 'GET', path: `/commits/${sha}` }, CommitDetails)
    let current = yield* get(head)
    const commits: Array<Details> = [current]
    for (;;) {
      const [parent, ...others] = current.parents
      if (parent === undefined) return undefined
      if (others.length > 0 || commits.length >= pull.commits) return { base: parent.sha, commits }
      const owners = yield* request({ method: 'GET', path: `/commits/${parent.sha}/pulls` }, PullsOfCommit)
      if (!owners.some((owner) => owner.number === pull.number)) return { base: parent.sha, commits }
      current = yield* get(parent.sha)
      commits.push(current)
    }
  })

const SIGN_OFF = /^Signed-off-by: .{1,200}$/gm

const messageOf = (pull: PullDetails, target: string, commits: ReadonlyArray<Details>) => {
  const suffix = `(#${pull.number})`
  const title = pull.title.endsWith(suffix) ? pull.title : `${pull.title} ${suffix}`
  const signOffs = [...new Set(commits.flatMap((commit) => commit.commit.message.match(SIGN_OFF) ?? []))]
  return [
    title,
    `Backport of #${pull.number} to ${target}.`,
    `(cherry picked from commit ${commits[0]?.sha ?? ''})`,
    ...(signOffs.length > 0 ? [signOffs.join('\n')] : []),
  ].join('\n\n')
}

/**
 * Backports a merged pull request to another branch: applies its changes to
 * a new branch made from the target and opens a pull request from it.
 *
 * @remarks
 * GitHub has no cherry-pick API, so the changes are applied with its merge
 * API: a temporary commit with the target's files and the source's parent as
 * its parent is merged with the source, which leaves the target's files plus
 * exactly the pull request's changes. The result is committed on the target
 * as one commit, authored as the merged commit was and carrying its
 * sign-offs. Squash, rebase and merge-commit merges all work; a rebase merge
 * is found by walking back over the commits that belong to the pull request.
 *
 * When the changes do not apply cleanly, or anything fails part way, the new
 * branch is deleted. In a dry run nothing is written.
 *
 * @example
 * ```ts
 * import { backport, getPull } from '@resnovas/feature.commands'
 * import { Effect } from 'effect'
 *
 * // Needs the GitHub service.
 * const result = Effect.flatMap(getPull(7), (pull) => backport(pull, 'release/1.x', { labelPrefix: 'backport ', branchPrefix: 'backport/' }, false))
 * ```
 *
 * @param pull - The pull request.
 * @param target - The branch to backport to.
 * @param names - The branch prefix to use.
 * @param dryRun - Plan, without writing anything.
 * @returns What happened.
 */
export const backport = (
  pull: PullDetails,
  target: string,
  names: BackportNames,
  dryRun: boolean,
): Effect.Effect<BackportResult, GitHubError | UnexpectedAnswer, GitHub> =>
  Effect.gen(function* () {
    if (!pull.merged || pull.mergeCommitSha === undefined) return { kind: 'not-merged' } as const
    if (pull.commits > BACKPORT_COMMIT_LIMIT) return { kind: 'too-large' } as const
    const head = yield* request({ method: 'GET', path: `/git/ref/heads/${target}` }, Ref).pipe(
      Effect.map((ref) => ref.object.sha),
      Effect.catchTag('NotFound', () => Effect.succeed(undefined)),
    )
    if (head === undefined) return { kind: 'no-target' } as const
    const changes = yield* changesOf(pull, pull.mergeCommitSha)
    if (changes === undefined) return { kind: 'empty' } as const
    // A slash in the target becomes two hyphens, so release/1.x and release-1.x
    // get branches of their own.
    const branch = `${names.branchPrefix}${pull.number}-${target.replaceAll('/', '--')}`
    if (dryRun) return { kind: 'planned', branch } as const

    const github = yield* GitHub
    const tree = (yield* request({ method: 'GET', path: `/git/commits/${head}` }, GitCommit)).tree.sha
    const created = yield* github
      .repositoryRequest({ method: 'POST', path: '/git/refs', body: { ref: `refs/heads/${branch}`, sha: head } })
      .pipe(
        Effect.as(true),
        // GitHub refuses a branch that exists and a name that is not a valid ref
        // alike; only the first is left alone, the second is a real failure.
        Effect.catchTag('ValidationFailed', (error) =>
          request({ method: 'GET', path: `/git/ref/heads/${branch}` }, Ref).pipe(
            Effect.as(false),
            Effect.catchTag('NotFound', () => Effect.fail(error)),
          ),
        ),
      )
    if (!created) return { kind: 'branch-exists', branch } as const
    const move = (sha: string) =>
      github.repositoryRequest({ method: 'PATCH', path: `/git/refs/heads/${branch}`, body: { sha, force: true } })

    const apply = Effect.gen(function* () {
      const temporary = yield* request(
        {
          method: 'POST',
          path: '/git/commits',
          body: { message: 'smartcloud backport (temporary)', tree, parents: [changes.base] },
        },
        GitCommit,
      )
      yield* move(temporary.sha)
      const merged = yield* request(
        {
          method: 'POST',
          path: '/merges',
          body: { base: branch, head: pull.mergeCommitSha, commit_message: 'smartcloud backport (temporary)' },
        },
        Merged,
      ).pipe(Effect.catchTag('ValidationFailed', () => Effect.succeed('conflict' as const)))
      if (merged === 'conflict') return { kind: 'conflict' } as const
      if (merged === null || merged === undefined) return { kind: 'empty' } as const
      const author = changes.commits[0]?.commit.author
      const final = yield* request(
        {
          method: 'POST',
          path: '/git/commits',
          body: {
            message: messageOf(pull, target, changes.commits),
            tree: merged.commit.tree.sha,
            parents: [head],
            ...(author === undefined || author === null ? {} : { author }),
          },
        },
        GitCommit,
      )
      yield* move(final.sha)
      const opened = yield* request(
        {
          method: 'POST',
          path: '/pulls',
          body: {
            title: `[${target}] ${pull.title}`,
            head: branch,
            base: target,
            body: `Backport of #${pull.number} to \`${target}\`, opened by smartcloud.`,
          },
        },
        Created,
      )
      return { kind: 'opened', branch, number: opened.number, url: opened.html_url } as const
    })
    // Anything short of an opened pull request leaves no branch behind.
    const cleanUp = github
      .repositoryRequest({ method: 'DELETE', path: `/git/refs/heads/${branch}` })
      .pipe(Effect.ignore)
    return yield* apply.pipe(
      Effect.tap((result) => (result.kind === 'opened' ? Effect.void : cleanUp)),
      Effect.tapError(() => cleanUp),
    )
  })
