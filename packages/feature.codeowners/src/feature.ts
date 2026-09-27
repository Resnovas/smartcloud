/**
 * @file packages/feature.codeowners/src/feature.ts
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

import type { CodeOwners } from '@resnovas/config'
import { type Feature, type PullRequestEnvelope, Report } from '@resnovas/engine'
import { GitHub, type GitHubService, type Repository } from '@resnovas/integrations.github'
import { Data, Effect, Schema } from 'effect'
import {
  CODEOWNERS_PATHS,
  type CodeOwnersProblem,
  generatedBlock,
  lintCodeOwners,
  mergeGenerated,
  renderGenerated,
} from './file.js'

/**
 * The codeowners feature's name, as recorded on its findings.
 *
 * @example
 * ```ts import.meta.vitest name="FEATURE"
 * import { codeownersFeature, FEATURE } from '@resnovas/feature.codeowners'
 *
 * codeownersFeature.name === FEATURE // => true
 * ```
 */
export const FEATURE = 'codeowners'

/**
 * The rule id of a CODEOWNERS line GitHub rejects or ignores.
 *
 * @example
 * ```ts import.meta.vitest name="SYNTAX_RULE"
 * import { SYNTAX_RULE } from '@resnovas/feature.codeowners'
 *
 * SYNTAX_RULE // => 'codeowners.syntax'
 * ```
 */
export const SYNTAX_RULE = `${FEATURE}.syntax`

/**
 * The rule id of a CODEOWNERS rule a later rule with the same pattern replaces.
 *
 * @example
 * ```ts import.meta.vitest name="SHADOWED_RULE"
 * import { SHADOWED_RULE } from '@resnovas/feature.codeowners'
 *
 * SHADOWED_RULE // => 'codeowners.shadowed'
 * ```
 */
export const SHADOWED_RULE = `${FEATURE}.shadowed`

/**
 * The rule id of a hand edit to the block generated from `codeowners.rules`.
 *
 * @example
 * ```ts import.meta.vitest name="GENERATED_RULE"
 * import { GENERATED_RULE } from '@resnovas/feature.codeowners'
 *
 * GENERATED_RULE // => 'codeowners.generated'
 * ```
 */
export const GENERATED_RULE = `${FEATURE}.generated`

/**
 * The branch generated changes are proposed from when `codeowners.branch` is not set.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_CODEOWNERS_BRANCH"
 * import { DEFAULT_CODEOWNERS_BRANCH } from '@resnovas/feature.codeowners'
 *
 * DEFAULT_CODEOWNERS_BRANCH // => 'smartcloud/codeowners'
 * ```
 */
export const DEFAULT_CODEOWNERS_BRANCH = 'smartcloud/codeowners'

/**
 * `codeowners.branch` names the default branch, which the proposal would overwrite.
 *
 * @example
 * ```ts import.meta.vitest name="CodeOwnersBranchIsBase"
 * import { CodeOwnersBranchIsBase } from '@resnovas/feature.codeowners'
 *
 * new CodeOwnersBranchIsBase({ branch: 'main' }).branch // => 'main'
 * ```
 */
export class CodeOwnersBranchIsBase extends Data.TaggedError('CodeOwnersBranchIsBase')<{ readonly branch: string }> {
  override get message() {
    return `codeowners.branch is "${this.branch}", the default branch; generated CODEOWNERS changes are proposed from a branch of their own`
  }
}

const REPOSITORY_EVENTS: ReadonlySet<string> = new Set(['schedule', 'workflow_dispatch', 'push'])

/** A CODEOWNERS problem in a given file. */
export interface LocatedProblem extends CodeOwnersProblem {
  readonly path: string
}

const GitHubErrors = Schema.Struct({
  errors: Schema.Array(Schema.Struct({ line: Schema.Number, message: Schema.String, path: Schema.String })),
})

/**
 * Reads GitHub's own errors for the CODEOWNERS file at a ref.
 *
 * @remarks
 * GitHub reports what it cannot use: bad syntax, and owners that do not
 * exist or cannot write to the repository. The endpoint needs only read
 * access. When it cannot be read, for example on a token without access or
 * over a rate limit, the result is undefined and the caller falls back to
 * its own checks.
 *
 * @example
 * ```ts
 * import { codeownersErrors } from '@resnovas/feature.codeowners'
 *
 * // Needs the GitHub service, for example from the live or dry-run layer.
 * const program = codeownersErrors('main')
 * ```
 *
 * @param ref - The branch, tag or commit to read.
 * @returns The errors, each with its path and the first line of GitHub's message, or undefined when GitHub did not answer.
 */
export const codeownersErrors = (
  ref: string,
): Effect.Effect<ReadonlyArray<LocatedProblem> | undefined, never, GitHub> =>
  Effect.flatMap(GitHub, (github) =>
    github.repositoryRequest({ method: 'GET', path: `/codeowners/errors?ref=${encodeURIComponent(ref)}` }),
  ).pipe(
    Effect.flatMap(Schema.decodeUnknown(GitHubErrors)),
    Effect.map(({ errors }) =>
      errors.map(({ line, message, path }): LocatedProblem => ({
        line,
        path,
        kind: 'syntax',
        message: message.split('\n')[0] ?? message,
      })),
    ),
    Effect.catchAll((error) =>
      Effect.as(
        Effect.logWarning(
          `codeowners: could not read GitHub's CODEOWNERS errors, so only smartcloud's own checks ran: ${error.message}`,
        ).pipe(Effect.annotateLogs({ feature: FEATURE })),
        undefined,
      ),
    ),
  )

/**
 * Combines GitHub's errors with smartcloud's own checks of a CODEOWNERS file.
 *
 * @remarks
 * Where GitHub answered, its errors stand for the lines it flagged, and the
 * local syntax check only adds lines it did not flag. Shadowed rules are
 * always added, since GitHub accepts them.
 *
 * @example
 * ```ts import.meta.vitest name="combineProblems"
 * import { combineProblems } from '@resnovas/feature.codeowners'
 *
 * const github = [{ path: 'CODEOWNERS', line: 1, kind: 'syntax' as const, message: 'Unknown owner on line 1' }]
 * combineProblems('CODEOWNERS', '* docs\n* @TGTGamer\n', github).length // => 2
 * combineProblems('CODEOWNERS', '* docs\n', undefined)[0]?.kind // => 'syntax'
 * ```
 *
 * @param path - Where the file is.
 * @param text - The file.
 * @param github - GitHub's errors, or undefined when it did not answer.
 * @returns Every problem, GitHub's first.
 */
export const combineProblems = (
  path: string,
  text: string,
  github: ReadonlyArray<LocatedProblem> | undefined,
): ReadonlyArray<LocatedProblem> => {
  const flagged = new Set((github ?? []).filter((problem) => problem.path === path).map((problem) => problem.line))
  const local = lintCodeOwners(text)
    .filter((problem) => problem.kind === 'shadowed' || !flagged.has(problem.line))
    .map((problem) => ({ ...problem, path }))
  return [...(github ?? []), ...local]
}

interface Located {
  readonly path: string
  readonly text: string
}

const at = (ref: string | undefined): { readonly ref?: string } => (ref === undefined ? {} : { ref })

const readOptional = (github: GitHubService, repository: Repository, path: string, ref?: string) =>
  github
    .getFile({ owner: repository.owner, repo: repository.name, path, ...at(ref) })
    .pipe(Effect.catchTag('NotFound', () => Effect.succeed(null)))

const candidates = (codeowners: CodeOwners): ReadonlyArray<string> =>
  codeowners.path === undefined ? CODEOWNERS_PATHS : [codeowners.path]

// The file GitHub uses at a ref: the first location that exists.
const locate = (
  github: GitHubService,
  repository: Repository,
  codeowners: CodeOwners,
  ref?: string,
  paths: ReadonlyArray<string> = candidates(codeowners),
) =>
  Effect.reduce(paths, undefined as Located | undefined, (found, path) =>
    found !== undefined
      ? Effect.succeed(found)
      : Effect.map(readOptional(github, repository, path, ref), (text) => (text === null ? undefined : { path, text })),
  )

// With codeowners.path set, a location GitHub reads before it that exists:
// the configured file would then be ignored.
const shadowing = (github: GitHubService, repository: Repository, codeowners: CodeOwners) =>
  Effect.gen(function* () {
    if (codeowners.path === undefined) return undefined
    const earlier = CODEOWNERS_PATHS.slice(0, CODEOWNERS_PATHS.indexOf(codeowners.path))
    const found = yield* locate(github, repository, codeowners, undefined, earlier)
    return found?.path
  })

const reportProblems = (problems: ReadonlyArray<LocatedProblem>, level: 'error' | 'warning') =>
  Effect.flatMap(Report, (report) =>
    Effect.forEach(
      problems,
      (problem) =>
        report.add({
          feature: FEATURE,
          rule: problem.kind === 'shadowed' ? SHADOWED_RULE : SYNTAX_RULE,
          level: problem.kind === 'shadowed' ? 'warning' : level,
          message: `${problem.path} line ${problem.line}: ${problem.message}`,
          path: problem.path,
          line: problem.line,
        }),
      { discard: true },
    ),
  )

const validate = (found: Located, ref: string, level: 'error' | 'warning') =>
  Effect.gen(function* () {
    const problems = combineProblems(found.path, found.text, yield* codeownersErrors(ref))
    yield* reportProblems(problems, level)
    yield* Effect.logInfo(`codeowners: ${found.path} checked at ${ref}, ${problems.length} problem(s)`).pipe(
      Effect.annotateLogs({ feature: FEATURE, problems: problems.length }),
    )
  })

/**
 * Whether a pull request edits the generated block by hand.
 *
 * @remarks
 * The block may change only to what `codeowners.rules` generates. A block
 * that is already out of date on the base branch is left to the next
 * generation, so it does not fail unrelated pull requests.
 *
 * @example
 * ```ts import.meta.vitest name="editsGenerated"
 * import { editsGenerated, renderGenerated } from '@resnovas/feature.codeowners'
 *
 * const expected = renderGenerated({ docs: { paths: ['/docs/'], owners: ['@a'] } })
 * editsGenerated(expected, `${expected}\n`, expected.replace('@a', '@b')) // => 'edits'
 * editsGenerated(expected, expected, expected) // => undefined
 * editsGenerated(expected, expected, '* @a\n') // => 'removes'
 * ```
 *
 * @param expected - The block `codeowners.rules` generates.
 * @param base - The file on the base branch, or null when there is none.
 * @param head - The file on the pull request's head.
 * @returns `edits` or `removes` when the pull request changes the block by hand; undefined otherwise.
 */
export const editsGenerated = (
  expected: string,
  base: string | null,
  head: string,
): 'edits' | 'removes' | undefined => {
  const before = base === null ? undefined : generatedBlock(base)
  const after = generatedBlock(head)
  if (after === before || after === expected) return undefined
  return after === undefined ? 'removes' : 'edits'
}

const checkGenerated = (
  github: GitHubService,
  repository: Repository,
  codeowners: CodeOwners,
  found: Located,
  level: 'error' | 'warning',
  baseRef: string | undefined,
) =>
  Effect.gen(function* () {
    const rules = codeowners.rules ?? {}
    if (Object.keys(rules).length === 0) return
    // The block is compared with the branch the pull request merges into.
    const base = yield* readOptional(github, repository, found.path, baseRef)
    const edit = editsGenerated(renderGenerated(rules), base, found.text)
    if (edit === undefined) return
    const report = yield* Report
    yield* report.add({
      feature: FEATURE,
      rule: GENERATED_RULE,
      level,
      message: `${found.path} ${edit === 'edits' ? 'edits' : 'removes'} the block generated from codeowners.rules. Change codeowners.rules in the smartcloud config instead; smartcloud regenerates the block.`,
      path: found.path,
    })
  })

const runCheck = (codeowners: CodeOwners, envelope: PullRequestEnvelope) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const files = yield* github.listFiles(envelope.subject.number)
    // Only a pull request that changes CODEOWNERS is checked, so a problem
    // already on the base branch does not fail unrelated pull requests.
    if (!candidates(codeowners).some((path) => files.includes(path))) {
      return yield* Effect.logDebug('codeowners: the pull request does not change CODEOWNERS')
    }
    const repository = yield* github.getRepository
    const found = yield* locate(github, repository, codeowners, envelope.headSha)
    const level = codeowners.level ?? 'error'
    const baseRef = envelope.subject.baseBranch
    if (found === undefined) {
      // Removing the file removes the generated block with it.
      const base = yield* locate(github, repository, codeowners, baseRef)
      if (base !== undefined)
        yield* checkGenerated(github, repository, codeowners, { ...base, text: '' }, level, baseRef)
      return yield* Effect.logInfo('codeowners: the pull request removes CODEOWNERS')
    }
    yield* validate(found, envelope.headSha, level)
    yield* checkGenerated(github, repository, codeowners, found, level, baseRef)
  })

const proposalBody = (path: string) =>
  [
    `Updates the block of \`${path}\` generated from \`codeowners.rules\` in the smartcloud config.`,
    '',
    'Everything outside the block is kept. Change the owners in the config, not in the block.',
  ].join('\n')

const generate = (github: GitHubService, repository: Repository, codeowners: CodeOwners, found: Located | undefined) =>
  Effect.gen(function* () {
    const rules = codeowners.rules ?? {}
    if (Object.keys(rules).length === 0) return
    const report = yield* Report
    const path = found?.path ?? candidates(codeowners)[0] ?? CODEOWNERS_PATHS[0]
    const current = found?.text ?? null
    const content = mergeGenerated(current, renderGenerated(rules))
    if (content === current) return yield* Effect.logInfo(`codeowners: ${path} is up to date`)
    const branch = codeowners.branch ?? DEFAULT_CODEOWNERS_BRANCH
    // The proposal branch is force-updated, so it must never be the branch
    // the pull request merges into.
    if (branch === repository.defaultBranch) return yield* new CodeOwnersBranchIsBase({ branch })
    const result = yield* github
      .proposeChanges({
        branch,
        base: repository.defaultBranch,
        title: 'chore(codeowners): generate CODEOWNERS from the smartcloud config',
        body: proposalBody(path),
        files: [{ path, content, executable: false }],
      })
      .pipe(
        // A token that cannot push, such as a read-only one, skips the
        // proposal with a warning rather than failing the run.
        Effect.catchTag('Forbidden', () =>
          Effect.as(
            report.add({
              feature: FEATURE,
              rule: `${FEATURE}.generate`,
              level: 'warning',
              message: `Could not propose the generated ${path}: the token cannot push to ${branch} or open pull requests.`,
              path,
            }),
            undefined,
          ),
        ),
      )
    if (result === undefined) return
    // A dry run proposes nothing, so it has no pull request number to name.
    const where = result.number === 0 ? '' : ` in ${result.created ? 'new ' : ''}pull request #${result.number}`
    yield* report.change({ feature: FEATURE, description: `Proposed the generated ${path} on ${branch}${where}` })
  })

const runRepository = (codeowners: CodeOwners) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const repository = yield* github.getRepository
    const found = yield* locate(github, repository, codeowners)
    // Problems on the default branch are warnings: no pull request caused them.
    if (found !== undefined) yield* validate(found, repository.defaultBranch, 'warning')
    const shadow = yield* shadowing(github, repository, codeowners)
    if (shadow === undefined) return yield* generate(github, repository, codeowners, found)
    const report = yield* Report
    yield* report.add({
      feature: FEATURE,
      rule: `${FEATURE}.generate`,
      level: 'error',
      message: `codeowners.path is ${codeowners.path}, but GitHub reads ${shadow} first and ignores ${codeowners.path}. Remove ${shadow} or set codeowners.path to it; nothing was generated.`,
      path: shadow,
    })
  })

/**
 * The codeowners feature: validates CODEOWNERS and generates it from config.
 *
 * @remarks
 * On a pull request that changes CODEOWNERS, unless `codeowners.check` is
 * false, it reports GitHub's own CODEOWNERS errors at the head commit, lines
 * GitHub ignores (unsupported patterns, owners not written as a user, team
 * or email) as {@link SYNTAX_RULE}, rules that a later rule with the same
 * pattern replaces as {@link SHADOWED_RULE} warnings, and hand edits to the
 * generated block as {@link GENERATED_RULE}.
 *
 * On a schedule, a manual dispatch or a push, it checks the default
 * branch's file, reporting problems as warnings, and when `codeowners.rules`
 * has an entry, proposes the generated block from `codeowners.branch`.
 *
 * @example
 * ```ts import.meta.vitest name="codeownersFeature"
 * import { codeownersFeature } from '@resnovas/feature.codeowners'
 *
 * codeownersFeature.enabled?.({ version: 2, codeowners: {} }) // => true
 * codeownersFeature.enabled?.({ version: 2 }) // => false
 * codeownersFeature.privileged // => true
 * ```
 */
export const codeownersFeature: Feature = {
  name: FEATURE,
  // Needs the app or access token: the workflow token cannot do this, or the pull requests it opens would start no workflows.
  privileged: true,
  handles: ['repository', 'pullRequest'],
  enabled: (config) => config.codeowners !== undefined,
  run: ({ config, envelope }) => {
    const codeowners = config.codeowners
    if (codeowners === undefined) return Effect.void
    if (envelope.kind === 'repository')
      return REPOSITORY_EVENTS.has(envelope.event) ? runRepository(codeowners) : Effect.void
    if (envelope.kind === 'pullRequest' && codeowners.check !== false) return runCheck(codeowners, envelope)
    return Effect.void
  },
}
