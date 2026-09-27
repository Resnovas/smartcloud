/**
 * @file packages/integrations.github/src/service.ts
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

import type { Association, ChangedFile, Check, Commit, Mergeable, Review } from '@resnovas/conditions'
import { Context, type Effect } from 'effect'
import type { GitHubError } from './errors.js'

/** The repository a service instance acts on. */
export interface RepositoryCoordinates {
  readonly owner: string
  readonly repo: string
}

/** A repository, as the features need it. */
export interface Repository {
  readonly owner: string
  readonly name: string
  readonly fullName: string
  /** The GraphQL node id, for mutations such as `updateRepository`. */
  readonly nodeId: string
  readonly private: boolean
  readonly defaultBranch: string
  /**
   * The repository's current settings under GitHub's REST names, such as
   * `has_wiki` or `web_commit_signoff_required`, as far as the token can read
   * them. The settings feature leaves out any value that already matches, so
   * it never writes a setting GitHub refuses to change, such as sign-off an
   * organisation enforces.
   */
  readonly current?: Readonly<Record<string, boolean | string>>
}

/** A repository label. `color` is six hex digits without `#`. */
export interface Label {
  readonly name: string
  readonly color: string
  readonly description: string
}

/** A comment on an issue or pull request. */
export interface Comment {
  readonly id: number
  readonly body: string
  readonly author: string
  /** Whether the author is a bot account, such as a GitHub App. */
  readonly bot: boolean
}

/** An open issue or pull request, as listed for scheduled sweeps. */
export interface IssueSummary {
  readonly number: number
  readonly title: string
  readonly body: string
  readonly author: string
  /** How the author is associated with the repository, when GitHub reports a known association. */
  readonly association?: Association
  /** Whether the author is a bot account, such as a GitHub App. */
  readonly bot?: boolean
  readonly open: boolean
  readonly locked: boolean
  readonly labels: ReadonlyArray<string>
  /** The logins of the people assigned; none when omitted. */
  readonly assignees?: ReadonlyArray<string>
  /** The title of the milestone the item is in; omitted when it is in none. */
  readonly milestone?: string
  readonly updatedAt: Date
  readonly isPullRequest: boolean
}

/** A file in some repository, for presets and synced templates. */
export interface FileLocation {
  readonly owner: string
  readonly repo: string
  readonly path: string
  readonly ref?: string
}

/** One line-level note on a check run. */
export interface Annotation {
  readonly path: string
  readonly line: number
  readonly level: 'notice' | 'warning' | 'failure'
  readonly message: string
  readonly title?: string
}

/** What every check run carries, whatever its status. */
export interface CheckRunFields {
  readonly name: string
  readonly headSha: string
  readonly title: string
  readonly summary: string
  readonly annotations?: ReadonlyArray<Annotation>
}

/**
 * A check run to create or update.
 *
 * @remarks
 * GitHub requires a conclusion on a completed run and completes any run
 * given one, so a completed run must name its conclusion and a run in
 * progress cannot.
 */
export type CheckRun = CheckRunFields &
  (
    | { readonly status: 'in_progress'; readonly conclusion?: never }
    | { readonly status: 'completed'; readonly conclusion: 'success' | 'failure' | 'neutral' | 'skipped' }
  )

/**
 * A check on a commit, as the commit's checks list shows it: a check run, or
 * a commit status from a service that reports through the statuses API.
 */
export interface CommitCheck {
  /** The check run's name, or the status's context. */
  readonly name: string
  readonly source: 'checkRun' | 'status'
  /** The check run's id; statuses have none. A later run has a higher id. */
  readonly id?: number
  /** The slug of the app that published the check run, such as `github-actions`; statuses have none. */
  readonly app?: string
  /** The `external_id` its publisher gave the check run, when it gave one; smartcloud marks its own runs with one. */
  readonly externalId?: string
  /** Pending until it finishes; then whether it lets a pull request merge. */
  readonly state: 'pending' | 'success' | 'failure'
  /** GitHub's own word for it, such as `in_progress`, `skipped` or `timed_out`. */
  readonly detail: string
  /** Where to read more, when GitHub gives a link. */
  readonly url?: string
}

/** A pull request review to submit. */
export interface NewReview {
  readonly event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  readonly body: string
}

/** A file found by `listDirectory`, with its path relative to the listed directory. */
export interface DirectoryEntry {
  readonly path: string
  /** Whether git records the file as executable (mode `100755`). */
  readonly executable: boolean
}

/** A file to write in a proposed change. */
export interface FileChange {
  readonly path: string
  readonly content: string
  readonly executable: boolean
}

/** Changes to propose as a pull request from a branch. */
export interface ChangeProposal {
  /** The branch to create or update. It is reset to `base` plus the changes. */
  readonly branch: string
  /** The branch the pull request targets and the changes are built on. */
  readonly base: string
  /** The pull request title, also the commit subject. */
  readonly title: string
  readonly body: string
  readonly files: ReadonlyArray<FileChange>
  /** Paths to delete. */
  readonly deletions?: ReadonlyArray<string>
}

/** The pull request a proposal opened or updated. */
export interface ProposalResult {
  readonly number: number
  readonly url: string
  /** True when a new pull request was opened, false when an open one was updated. */
  readonly created: boolean
}

/** The name and email commits are made and signed off as. */
export interface CommitIdentity {
  readonly name: string
  readonly email: string
}

/** A repository-scoped REST call, for the settings feature's many endpoints. */
export interface RepositoryRequest {
  readonly method: 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE'
  /** Path under `/repos/{owner}/{repo}`, starting with `/`, or empty for the repository itself. */
  readonly path: string
  readonly body?: Readonly<Record<string, unknown>>
}

/**
 * Every GitHub operation smartcloud uses, bound to one repository.
 *
 * @remarks
 * Features depend on this interface, never on Octokit. Three layers provide
 * it: `GitHubLive` (the real API), `dryRun` (reads pass through, writes are
 * recorded), and `makeMemoryGitHub` (in memory, for tests).
 */
export interface GitHubService {
  readonly coordinates: RepositoryCoordinates
  readonly getRepository: Effect.Effect<Repository, GitHubError>

  readonly listLabels: Effect.Effect<ReadonlyArray<Label>, GitHubError>
  readonly createLabel: (label: Label) => Effect.Effect<void, GitHubError>
  /** Updates the label currently called `current`, renaming it when `label.name` differs. */
  readonly updateLabel: (current: string, label: Label) => Effect.Effect<void, GitHubError>
  readonly deleteLabel: (name: string) => Effect.Effect<void, GitHubError>

  readonly addLabels: (issue: number, labels: ReadonlyArray<string>) => Effect.Effect<void, GitHubError>
  readonly removeLabel: (issue: number, label: string) => Effect.Effect<void, GitHubError>
  readonly listComments: (issue: number) => Effect.Effect<ReadonlyArray<Comment>, GitHubError>
  readonly createComment: (issue: number, body: string) => Effect.Effect<Comment, GitHubError>
  readonly updateComment: (id: number, body: string) => Effect.Effect<void, GitHubError>
  readonly listOpenIssues: Effect.Effect<ReadonlyArray<IssueSummary>, GitHubError>
  readonly closeIssue: (issue: number) => Effect.Effect<void, GitHubError>

  readonly listCommits: (pullRequest: number) => Effect.Effect<ReadonlyArray<Commit>, GitHubError>
  readonly listFiles: (pullRequest: number) => Effect.Effect<ReadonlyArray<string>, GitHubError>
  /** The changed files with their status and whether GitHub reports them as binary. */
  readonly listChangedFiles: (pullRequest: number) => Effect.Effect<ReadonlyArray<ChangedFile>, GitHubError>
  readonly listReviews: (pullRequest: number) => Effect.Effect<ReadonlyArray<Review>, GitHubError>
  readonly countRequestedReviewers: (pullRequest: number) => Effect.Effect<number, GitHubError>
  /** The logins and team slugs asked to review the pull request that have not reviewed yet. */
  readonly listRequestedReviewers: (pullRequest: number) => Effect.Effect<ReadonlyArray<string>, GitHubError>
  /** Whether the pull request can merge into its base branch; `UNKNOWN` while GitHub is still computing it. */
  readonly getMergeable: (pullRequest: number) => Effect.Effect<Mergeable, GitHubError>
  /** The check runs and latest commit statuses on the pull request's head commit. */
  readonly listChecks: (pullRequest: number) => Effect.Effect<ReadonlyArray<Check>, GitHubError>
  readonly createReview: (pullRequest: number, review: NewReview) => Effect.Effect<void, GitHubError>
  readonly requestReviewers: (pullRequest: number, logins: ReadonlyArray<string>) => Effect.Effect<void, GitHubError>

  readonly createCheckRun: (run: CheckRun) => Effect.Effect<number, GitHubError>
  readonly updateCheckRun: (id: number, run: CheckRun) => Effect.Effect<void, GitHubError>
  /**
   * Lists the checks on a commit: every check run, including re-runs and
   * runs from retriggered workflows, so a caller picks the latest by app and
   * name itself, and the latest status of each context. Never cached, because
   * callers poll it.
   */
  readonly listCommitChecks: (sha: string) => Effect.Effect<ReadonlyArray<CommitCheck>, GitHubError>

  /** Reads a text file from any repository the token can see. */
  readonly getFile: (location: FileLocation) => Effect.Effect<string, GitHubError>
  /** Lists every file under a directory, recursively, in any repository the token can see. An empty path lists the root. */
  readonly listDirectory: (location: FileLocation) => Effect.Effect<ReadonlyArray<DirectoryEntry>, GitHubError>
  /**
   * Commits file changes to a branch built on `base`, with a DCO sign-off,
   * then opens a pull request from it, or updates the one already open.
   */
  readonly proposeChanges: (proposal: ChangeProposal) => Effect.Effect<ProposalResult, GitHubError>

  readonly repositoryRequest: (request: RepositoryRequest) => Effect.Effect<unknown, GitHubError>
  readonly graphql: (query: string, variables: Readonly<Record<string, unknown>>) => Effect.Effect<unknown, GitHubError>
}

/**
 * The GitHub service.
 *
 * @example
 * ```ts
 * import { Effect } from 'effect'
 * import { GitHub } from '@resnovas/integrations.github'
 *
 * const labelCount = Effect.flatMap(GitHub, (github) => github.listLabels).pipe(Effect.map((labels) => labels.length))
 * ```
 */
export class GitHub extends Context.Tag('@resnovas/integrations.github/GitHub')<GitHub, GitHubService>() {}
