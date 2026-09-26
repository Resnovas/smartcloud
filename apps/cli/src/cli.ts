/**
 * @file apps/cli/src/cli.ts
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

import { Args, Command, Options, ValidationError } from '@effect/cli'
import { command, gitHubConfigSource, liveConnect, optionNames, parseFeatureList, REPOSITORY_EVENTS, type Connect } from '@resnovas/runtime'
import { Console, Effect, Option } from 'effect'
import { checkCommitCommand, dryRunCommand, locateConfig, migrate, planSettingsCommand, syncCommand, validate } from './commands.js'
import { VERSION } from './version.js'

const path = Args.text({ name: 'path' }).pipe(
  Args.withDescription('The config file. Defaults to the first of .github/smartcloud.yml, .github/smartcloud.yaml or .github/config.json.'),
  Args.optional,
)

const validateCommand = Command.make('validate', { path }, ({ path }) =>
  command(Option.match(path, { onNone: () => locateConfig('.'), onSome: Effect.succeed }).pipe(Effect.flatMap(validate), Effect.provide(gitHubConfigSource())), {
    command: 'validate',
    options: optionNames({ path }),
  }),
).pipe(Command.withDescription('Check a config and everything it extends.'))

const input = Args.text({ name: 'input' }).pipe(Args.withDescription('The v1 JSON config.'), Args.withDefault('.github/config.json'))
const out = Options.text('out').pipe(Options.withAlias('o'), Options.withDescription('Write the YAML here instead of printing it.'), Options.optional)

const migrateCommand = Command.make('migrate', { input, out }, ({ input, out }) =>
  command(migrate(input, Option.getOrUndefined(out)), { command: 'migrate', options: optionNames({ input, out }) }),
).pipe(Command.withDescription('Convert a v1 config to v2 YAML, warning about anything not carried over.'))

const checkCommit = Command.make(
  'check-commit',
  {
    file: Args.text({ name: 'file' }).pipe(Args.withDescription('The file holding the message, such as .git/COMMIT_EDITMSG.')),
    authorName: Options.text('author-name').pipe(Options.withDescription("The author's name; git's own by default."), Options.optional),
    authorEmail: Options.text('author-email').pipe(Options.withDescription("The author's email; git's own by default."), Options.optional),
    config: Options.text('config').pipe(Options.withDescription("A config file; the repository's own, or the defaults, when omitted."), Options.optional),
  },
  (options) =>
    command(
      checkCommitCommand(options.file, {
        authorName: Option.getOrUndefined(options.authorName),
        authorEmail: Option.getOrUndefined(options.authorEmail),
        config: Option.getOrUndefined(options.config),
      }).pipe(Effect.provide(gitHubConfigSource())),
      { command: 'check-commit', options: optionNames(options) },
    ),
).pipe(Command.withDescription('Check a commit message for DCO sign-off and AI attribution before committing; usable as a commit-msg hook.'))

const repo = Options.text('repo').pipe(Options.withDescription('The repository, as owner/name.'))
const config = Options.text('config').pipe(
  Options.withDescription("A local config file to use instead of the repository's own config on its default branch."),
  Options.optional,
)

/**
 * The `smartcloud` command and its subcommands.
 *
 * @example
 * ```ts
 * import { liveConnect } from '@resnovas/runtime'
 * import { makeSmartcloud } from '@resnovas/smartcloud'
 *
 * const command = makeSmartcloud(liveConnect())
 * ```
 *
 * @param connect - Opens the GitHub service for commands that read a repository.
 * @returns The command.
 */
export const makeSmartcloud = (connect: Connect) => {
  const dryRun = Command.make(
    'dry-run',
    {
      repo,
      config,
      pr: Options.integer('pr').pipe(Options.withDescription('Simulate this pull request.'), Options.optional),
      issue: Options.integer('issue').pipe(Options.withDescription('Simulate this issue.'), Options.optional),
      event: Options.choice('event', REPOSITORY_EVENTS).pipe(Options.withDescription('Simulate this repository event.'), Options.optional),
      features: Options.text('features').pipe(Options.withDescription('Only these features, comma-separated; every feature when empty.'), Options.optional),
    },
    (options) =>
      command(
        dryRunCommand(connect, {
          repository: options.repo,
          config: Option.getOrUndefined(options.config),
          pr: Option.getOrUndefined(options.pr),
          issue: Option.getOrUndefined(options.issue),
          event: Option.getOrUndefined(options.event),
          // An empty list, such as `--features ,`, means every feature, as the action reads it.
          features: Option.getOrUndefined(Option.filter(Option.map(options.features, parseFeatureList), (names) => names.length > 0)),
        }),
        { command: 'dry-run', options: optionNames(options) },
      ),
  ).pipe(Command.withDescription('Run every feature against a pull request, an issue or an event, recording writes instead of making them.'))

  const planSettings = Command.make('settings', { repo, config }, (options) =>
    command(planSettingsCommand(connect, { repository: options.repo, config: Option.getOrUndefined(options.config) }), {
      command: 'plan settings',
      options: optionNames(options),
    }),
  ).pipe(Command.withDescription('Print the repository settings the config would apply, without applying them.'))

  const plan = Command.make('plan').pipe(
    Command.withDescription('Show what smartcloud would change, without changing it.'),
    Command.withSubcommands([planSettings]),
  )

  const sync = Command.make(
    'sync',
    { repo, config, out: Options.text('out').pipe(Options.withAlias('o'), Options.withDescription('The directory to render the files into.')) },
    (options) =>
      command(syncCommand(connect, { repository: options.repo, out: options.out, config: Option.getOrUndefined(options.config) }), {
        command: 'sync',
        options: optionNames(options),
      }),
  ).pipe(Command.withDescription('Render the synced files for a repository into a local directory, and list conflicting local rules.'))

  return Command.make('smartcloud').pipe(
    Command.withDescription('Repository automation and policy for GitHub.'),
    Command.withSubcommands([validateCommand, migrateCommand, checkCommit, dryRun, plan, sync]),
  )
}

/**
 * Runs the CLI against an argument vector, as `process.argv` gives it.
 *
 * @example
 * ```ts
 * import { liveConnect } from '@resnovas/runtime'
 * import { runWith } from '@resnovas/smartcloud'
 *
 * const validate = runWith(liveConnect())(['node', 'smartcloud', 'validate'])
 * ```
 *
 * @param connect - Opens the GitHub service; the real API by default.
 * @returns A function taking the node binary, the script, then the arguments.
 */
export const runWith = (connect: Connect = liveConnect()) => Command.run(makeSmartcloud(connect), { name: 'smartcloud', version: VERSION })

/**
 * Runs the CLI against the real GitHub API.
 *
 * @example
 * ```ts
 * import { run } from '@resnovas/smartcloud'
 *
 * // Needs the platform's services, such as NodeContext.layer, to run.
 * const program = run(process.argv)
 * ```
 *
 * @param args - The node binary, the script, then the arguments.
 * @returns The run.
 */
export const run = runWith()

// Splitting and trimming is linear, unlike a whitespace-collapsing pattern.
const oneLine = (message: string) =>
  message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join(' ')

/**
 * Runs the CLI and turns a failure into one line on stderr and exit code 1.
 *
 * @remarks
 * Usage errors are already printed with the help text by the time they
 * arrive here, so only the exit code is set for them. A message that spans
 * lines, such as a schema error's tree, is joined onto the one line. A
 * defect is printed as one `unexpected failure` line; each command has
 * already reported its failure or defect to error tracking.
 *
 * @example
 * ```ts
 * import { main } from '@resnovas/smartcloud'
 *
 * // The entry point provides NodeContext.layer and runs this with NodeRuntime.runMain.
 * const program = main(process.argv)
 * ```
 *
 * @param argv - The node binary, the script, then the arguments.
 * @param connect - Opens the GitHub service; the real API by default.
 * @returns The run, which never fails.
 */
export const main = (argv: ReadonlyArray<string>, connect?: Connect) =>
  runWith(connect)(argv).pipe(
    Effect.catchAll((error) =>
      Effect.zipRight(
        ValidationError.isValidationError(error) ? Effect.void : Console.error(`smartcloud: ${oneLine(error.message)}`),
        Effect.sync(() => {
          process.exitCode = 1
        }),
      ),
    ),
    // A defect is reported to error tracking by the command; the user gets one line, not a trace.
    Effect.catchAllDefect((defect) =>
      Effect.zipRight(
        Console.error(`smartcloud: unexpected failure: ${oneLine(defect instanceof Error ? defect.message : String(defect))}`),
        Effect.sync(() => {
          process.exitCode = 1
        }),
      ),
    ),
  )
