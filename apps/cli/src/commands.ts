/**
 * @file apps/cli/src/commands.ts
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

import { Command as Process, FileSystem, Path } from '@effect/platform'
import { resolveConfig, type ResolvedConfig, type SmartcloudConfig } from '@resnovas/config'
import {
  checkCommitMessage,
  CONFIG_CANDIDATES,
  dryRunRepository,
  dryRunText,
  migrateConfigText,
  NoConfig,
  planSettingsForRepository,
  renderSyncForRepository,
  settingsPlanText,
  type Connect,
  type DryRunRequest,
} from '@resnovas/runtime'
import { Console, Data, Effect, Option } from 'effect'

/**
 * Finds the config in a repository checkout.
 *
 * @param directory - The repository root.
 * @returns The path of the first config that exists.
 */
export const locateConfig = (directory: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    for (const candidate of CONFIG_CANDIDATES) {
      const full = path.join(directory, candidate)
      if (yield* fs.exists(full)) return full
    }
    return yield* new NoConfig({ where: directory, paths: CONFIG_CANDIDATES })
  })

/**
 * Validates a config and its whole `extends` chain, printing where it came
 * from and every migration warning.
 *
 * @param file - The config file.
 * @returns The resolved config.
 */
export const validate = (file: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const resolved: ResolvedConfig = yield* resolveConfig(yield* fs.readFileString(file), file)
    yield* Console.log(`${file} is a valid smartcloud config.`)
    if (resolved.sources.length > 1) yield* Console.log(`Built from: ${resolved.sources.join(', ')}`)
    for (const warning of resolved.warnings) yield* Console.log(`warning: ${warning}`)
    return resolved
  })

/**
 * Converts a v1 `.github/config.json` to v2 YAML, printing a warning for
 * everything the migration does not carry over.
 *
 * @remarks
 * Warnings go to stderr, so stdout holds only the YAML and can be
 * redirected straight into a config file.
 *
 * @param input - The v1 JSON file. A v2 file is rewritten unchanged.
 * @param output - Where to write the YAML; printed to stdout when omitted.
 * @returns The migrated config.
 */
export const migrate = (input: string, output: string | undefined) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const { config, yaml, warnings } = yield* migrateConfigText(yield* fs.readFileString(input), input)
    if (output === undefined) yield* Console.log(yaml)
    else {
      yield* fs.writeFileString(output, yaml)
      yield* Console.log(`Wrote ${output}.`)
    }
    for (const warning of warnings) yield* Console.error(`warning: ${warning}`)
    return config
  })

/**
 * Dry-runs every feature against a repository and prints the job summary
 * and every write that would have been made. Nothing is written.
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, what to simulate, the config and the features.
 * @returns The dry run.
 */
export const dryRunCommand = (connect: Connect, request: DryRunRequest) =>
  Effect.tap(dryRunRepository(connect, request), (outcome) => Console.log(dryRunText(outcome)))

/**
 * Prints the settings a repository's config would apply, without applying them.
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, and a local config file to use instead of its own.
 * @returns The plan.
 */
export const planSettingsCommand = (connect: Connect, request: { readonly repository: string; readonly config?: string | undefined }) =>
  Effect.tap(planSettingsForRepository(connect, request), (plan) => Console.log(settingsPlanText(plan)))

/** A synced file would be written outside the output directory, or through a symlink. */
export class UnsafePath extends Data.TaggedError('UnsafePath')<{ readonly path: string; readonly reason?: string | undefined }> {
  override get message() {
    return `refusing to write ${this.path}: ${this.reason ?? 'it is outside the output directory'}`
  }
}

/**
 * Whether a path lies inside a directory, or is the directory itself.
 *
 * @remarks
 * Compared through `path.relative`, so a root of `/` contains everything and
 * a sibling such as `/out-other` is not inside `/out`.
 *
 * @param path - The platform's path service.
 * @param root - The directory, resolved.
 * @param target - The path, resolved.
 * @returns Whether `target` is `root` or below it.
 */
export const isWithin = (path: Path.Path, root: string, target: string): boolean => {
  const relative = path.relative(root, target)
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
}

// Checks where a synced file would really land. Each step from the output
// root down to the file is checked while it exists: its real path must stay
// inside the output's, and it must not be a symlink (dangling or not), so no
// link placed inside the output can redirect the write.
const checkTarget = (root: string, realRoot: string, file: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const target = path.resolve(root, file)
    if (target === root || !isWithin(path, root, target)) return yield* new UnsafePath({ path: file })
    let current = root
    for (const step of path.relative(root, target).split(path.sep)) {
      current = path.join(current, step)
      const exists = yield* fs.exists(current)
      if (exists && !isWithin(path, realRoot, yield* fs.realPath(current)))
        return yield* new UnsafePath({ path: file, reason: `${current} resolves outside the output directory` })
      // readLink succeeds only on a symlink.
      if (yield* Effect.isSuccess(fs.readLink(current)))
        return yield* new UnsafePath({ path: file, reason: `${current} is a symlink, and smartcloud does not write through symlinks` })
      if (!exists) break
    }
    return target
  })

/**
 * Renders a repository's synced files into a local directory, as they would
 * be after the sync, and lists local rules that conflict with synced ones.
 * Nothing is written to GitHub.
 *
 * @param connect - Opens the GitHub service.
 * @param request - The repository, the output directory, and a local config file to use instead of its own.
 * @returns The rendered files.
 */
export const syncCommand = (
  connect: Connect,
  request: { readonly repository: string; readonly out: string; readonly config?: string | undefined },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const render = yield* renderSyncForRepository(connect, request)
    const root = path.resolve(request.out)
    yield* fs.makeDirectory(root, { recursive: true })
    const realRoot = yield* fs.realPath(root)
    // Every target is checked before anything is written, so a refusal leaves the output untouched.
    const targets = yield* Effect.forEach(render.files, (file) => Effect.map(checkTarget(root, realRoot, file.path), (target) => ({ file, target })))
    for (const { file, target } of targets) {
      yield* fs.makeDirectory(path.dirname(target), { recursive: true })
      yield* fs.writeFileString(target, file.content)
      yield* fs.chmod(target, file.executable ? 0o755 : 0o644)
    }
    yield* Console.log(`Rendered ${render.files.length} file(s) from ${render.source} into ${root}:`)
    for (const file of render.files) yield* Console.log(`- ${file.path} (${file.status})`)
    for (const conflict of render.conflicts) yield* Console.log(`conflict: ${conflict.path} ${conflict.problem}`)
    return render
  })

/** The commit message breaks at least one rule. */
export class CommitCheckFailed extends Data.TaggedError('CommitCheckFailed')<{ readonly count: number }> {
  override get message() {
    return `the commit message breaks ${this.count} rule(s); see above`
  }
}

/** The author could not be worked out from git. */
export class UnknownAuthor extends Data.TaggedError('UnknownAuthor')<{ readonly ident: string }> {
  override get message() {
    return `could not read the commit author from git ("${this.ident}"); pass --author-name and --author-email`
  }
}

// `git var GIT_AUTHOR_IDENT` prints "Name <email> timestamp zone". Split on the
// angle brackets with indexOf, which is linear on any input.
const parseIdent = (ident: string) => {
  const open = ident.indexOf('<')
  const close = ident.indexOf('>', open)
  return open < 1 || close < 0
    ? Effect.fail(new UnknownAuthor({ ident: ident.trim() }))
    : Effect.succeed({ authorName: ident.slice(0, open).trim(), authorEmail: ident.slice(open + 1, close).trim() })
}

// git drops comment lines from the message it commits, so they are not checked.
const withoutComments = (message: string) =>
  message
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n')

/**
 * Checks a commit message for DCO and AI attribution, before committing.
 *
 * @remarks
 * Usable as a git `commit-msg` hook: `smartcloud check-commit "$1"`. The
 * author defaults to git's own (`git var GIT_AUTHOR_IDENT`), and the config
 * to the repository's in the working directory, or smartcloud's defaults
 * when there is none. Fails when any rule is broken, so the hook stops the
 * commit.
 *
 * @param file - The file holding the message, such as `.git/COMMIT_EDITMSG`.
 * @param options - The author, when not git's, and a config file to use.
 * @returns The findings, or `CommitCheckFailed`.
 */
export const checkCommitCommand = (
  file: string,
  options: { readonly authorName?: string | undefined; readonly authorEmail?: string | undefined; readonly config?: string | undefined },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const message = withoutComments(yield* fs.readFileString(file))
    const author =
      options.authorName !== undefined && options.authorEmail !== undefined
        ? { authorName: options.authorName, authorEmail: options.authorEmail }
        : yield* Effect.flatMap(Process.string(Process.make('git', 'var', 'GIT_AUTHOR_IDENT')), parseIdent)
    const configFile = options.config ?? Option.getOrUndefined(yield* Effect.option(locateConfig('.')))
    const config: SmartcloudConfig =
      configFile === undefined ? { version: 2 } : (yield* resolveConfig(yield* fs.readFileString(configFile), configFile)).config
    const findings = checkCommitMessage({ message, ...author }, config)
    for (const finding of findings) yield* Console.error(`${finding.rule}: ${finding.message}${finding.link === undefined ? '' : ` See ${finding.link}`}`)
    if (findings.length > 0) return yield* new CommitCheckFailed({ count: findings.length })
    yield* Console.log('The commit message passes.')
    return findings
  })
