/**
 * @file packages/feature.sync/src/feature.ts
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

import { type ExtendsRef, formatExtendsRef, parseExtendsRef, type SmartcloudConfig } from '@resnovas/config'
import { type Feature, type PullRequestEnvelope, Report } from '@resnovas/engine'
import { type DirectoryEntry, type FileLocation, GitHub, type GitHubService, type Repository } from '@resnovas/integrations.github'
import { Data, Effect } from 'effect'
import { syncFindings } from './managed.js'
import { type CurrentFile, planSync, type PlannedFile } from './plan.js'
import { renderAll, type Template, type Values } from './render.js'

/** The `sync` section of the config. */
export type SyncConfig = NonNullable<SmartcloudConfig['sync']>

/** `sync.source` is not a directory given as `owner/repo/path@ref`. */
export class SyncSourceInvalid extends Data.TaggedError('SyncSourceInvalid')<{ readonly source: string }> {
  override get message() {
    return `sync.source must be owner/repo/path@ref, got "${this.source}"`
  }
}

/** `sync.branch` names the default branch, which the sync would overwrite. */
export class SyncBranchIsBase extends Data.TaggedError('SyncBranchIsBase')<{ readonly branch: string }> {
  override get message() {
    return `sync.branch is "${this.branch}", the default branch; sync proposes its changes from a branch of its own`
  }
}

/** The branch sync pull requests come from when `sync.branch` is not set. */
export const DEFAULT_SYNC_BRANCH = 'smartcloud/sync'

/** Where findings link when `links.policyBase` is not set. */
export const DEFAULT_POLICY_BASE = 'https://github.com/Resnovas/.github/blob/main'

const FEATURE = 'sync'
const SYNC_EVENTS: ReadonlySet<string> = new Set(['schedule', 'workflow_dispatch', 'push'])
// Enough to overlap round trips without tripping GitHub's secondary rate limits.
const CONCURRENCY = 8

/**
 * Parses `sync.source`.
 *
 * @param source - The source as configured.
 * @returns The template directory.
 */
export const parseSource = (source: string): Effect.Effect<ExtendsRef, SyncSourceInvalid> => {
  const ref = parseExtendsRef(source)
  return ref === undefined ? Effect.fail(new SyncSourceInvalid({ source })) : Effect.succeed(ref)
}

const at = (ref: string | undefined): { readonly ref?: string } => (ref === undefined ? {} : { ref })

const joinPath = (directory: string, path: string) => {
  const parts = directory.split('/').filter((part) => part !== '')
  return [...parts, path].join('/')
}

const readTemplate = (github: GitHubService, source: ExtendsRef, entry: DirectoryEntry) =>
  Effect.map(
    github.getFile({ owner: source.owner, repo: source.repo, path: joinPath(source.path, entry.path), ...at(source.ref) }),
    (content): Template => ({ path: entry.path, content, executable: entry.executable }),
  )

const readTemplates = (github: GitHubService, source: ExtendsRef) =>
  Effect.flatMap(github.listDirectory(source), (entries) =>
    Effect.forEach(entries, (entry) => readTemplate(github, source, entry), { concurrency: CONCURRENCY }),
  )

// A file that is not there reads as null, which the sync rules treat as absent.
const readOptional = (github: GitHubService, location: FileLocation) =>
  github.getFile(location).pipe(Effect.catchTag('NotFound', () => Effect.succeed(null)))

const valuesFor = (sync: SyncConfig, repository: Repository): Values => ({ ...sync.values, REPOSITORY: repository.fullName })

const linkFor = (config: SmartcloudConfig) => `${config.links?.policyBase ?? DEFAULT_POLICY_BASE}/GOVERNANCE.md#synced-files`

const isSourceRepository = (repository: Repository, source: ExtendsRef) =>
  repository.fullName.toLowerCase() === `${source.owner}/${source.repo}`.toLowerCase()

// The files the repository has on its default branch, with their execute
// bits, for the templates that are synced.
const readCurrent = (github: GitHubService, repository: Repository, templates: ReadonlyArray<Template>) =>
  Effect.gen(function* () {
    const location = { owner: repository.owner, repo: repository.name }
    const listing = yield* github.listDirectory({ ...location, path: '' })
    const executable = new Map(listing.map((entry) => [entry.path, entry.executable]))
    const present = templates.filter((template) => executable.has(template.path))
    const read = yield* Effect.forEach(
      present,
      (template) => Effect.map(readOptional(github, { ...location, path: template.path }), (content) => ({ template, content })),
      { concurrency: CONCURRENCY },
    )
    const current = new Map<string, CurrentFile>()
    for (const { template, content } of read) {
      if (content !== null) current.set(template.path, { content, executable: executable.get(template.path) === true })
    }
    return current
  })

const REASONS: Readonly<Record<PlannedFile['reason'], string>> = {
  create: 'added',
  update: 'updated',
  mode: 'made executable',
}

const proposalBody = (source: ExtendsRef, files: ReadonlyArray<PlannedFile>) =>
  [
    `Syncs files from \`${formatExtendsRef(source)}\`.`,
    '',
    ...files.map((file) => `- \`${file.path}\` ${REASONS[file.reason]}`),
    '',
    'Files with a managed block keep everything outside the block. Change synced content in the source repository, not here.',
  ].join('\n')

const runSync = (config: SmartcloudConfig, sync: SyncConfig) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    const source = yield* parseSource(sync.source)
    const repository = yield* github.getRepository
    const exclude = sync.exclude ?? []
    const templates = yield* readTemplates(github, source)
    const current = yield* readCurrent(
      github,
      repository,
      templates.filter((template) => !exclude.includes(template.path)),
    )
    const plan = yield* planSync(templates, current, valuesFor(sync, repository), exclude)
    for (const { path, problem } of plan.conflicts) {
      yield* report.add({ feature: FEATURE, rule: 'SYNC', level: 'warning', message: `${path} ${problem}`, path, link: linkFor(config) })
    }
    if (plan.files.length === 0) return
    const branch = sync.branch ?? DEFAULT_SYNC_BRANCH
    // The proposal branch is force-updated, so it must never be the branch
    // the pull request merges into.
    if (branch === repository.defaultBranch) return yield* new SyncBranchIsBase({ branch })
    const result = yield* github.proposeChanges({
      branch,
      base: repository.defaultBranch,
      title: `chore(sync): sync files from ${source.owner}/${source.repo}`,
      body: proposalBody(source, plan.files),
      files: plan.files.map(({ path, content, executable }) => ({ path, content, executable })),
    })
    for (const file of plan.files) yield* report.change({ feature: FEATURE, description: `${file.path} ${REASONS[file.reason]}` })
    // A dry run proposes nothing, so it has no pull request number to name.
    const where = result.number === 0 ? '' : ` in ${result.created ? 'new ' : ''}pull request #${result.number}`
    yield* report.change({ feature: FEATURE, description: `Proposed ${plan.files.length} synced file(s) on ${branch}${where}` })
  })

const runCheck = (config: SmartcloudConfig, sync: SyncConfig, envelope: PullRequestEnvelope) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    const source = yield* parseSource(sync.source)
    const repository = yield* github.getRepository
    // The source repository renders its own files from the templates it is
    // changing, so its pull requests legitimately edit synced content.
    if (isSourceRepository(repository, source)) return
    const exclude = sync.exclude ?? []
    const templates = yield* readTemplates(github, source)
    const rendered = yield* renderAll(
      templates.filter((template) => !exclude.includes(template.path)),
      valuesFor(sync, repository),
    )
    const location = { owner: repository.owner, repo: repository.name }
    const files = yield* Effect.forEach(
      rendered,
      (file) =>
        Effect.all({
          path: Effect.succeed(file.path),
          rendered: Effect.succeed(file.content),
          base: readOptional(github, { ...location, path: file.path }),
          head: readOptional(github, { ...location, path: file.path, ref: envelope.headSha }),
        }),
      { concurrency: CONCURRENCY },
    )
    for (const { path, message, local } of syncFindings(files)) {
      yield* report.add({
        feature: FEATURE,
        rule: 'SYNC',
        level: 'error',
        message:
          local === true
            ? `${path} ${message}. Change the local rules in this repository.`
            : `${path} ${message}. Change it in ${source.owner}/${source.repo} instead.`,
        path,
        link: linkFor(config),
      })
    }
  })

/**
 * The sync feature.
 *
 * @remarks
 * On a schedule, a manual dispatch or a push, it renders the templates in
 * `sync.source` with `sync.values` and the repository's full name as
 * `REPOSITORY`, merges them into the default branch's files, and proposes
 * one pull request from `sync.branch` with whatever changed. Local rules
 * that conflict with synced ones are warnings.
 *
 * On a pull request, unless `sync.check` is false, it fails edits to synced
 * content: a changed document, a changed managed block, removed markers, a
 * deleted synced file, or a local rule that redefines a synced one. Bringing
 * content in line with the templates is always allowed.
 */
export const syncFeature: Feature = {
  name: FEATURE,
  handles: ['repository', 'pullRequest'],
  enabled: (config) => config.sync !== undefined,
  run: ({ config, envelope }) => {
    const sync = config.sync
    if (sync === undefined) return Effect.void
    if (envelope.kind === 'repository') return SYNC_EVENTS.has(envelope.event) ? runSync(config, sync) : Effect.void
    if (envelope.kind === 'pullRequest' && sync.check !== false) return runCheck(config, sync, envelope)
    return Effect.void
  },
}
