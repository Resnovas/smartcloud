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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Args, Command, Options, ValidationError } from '@effect/cli'
import { Console, Effect, Option } from 'effect'
import { gitHubConfigSource, locateConfig, migrate, validate } from './commands.js'

const path = Args.text({ name: 'path' }).pipe(
  Args.withDescription('The config file. Defaults to the first of .github/smartcloud.yml, .github/smartcloud.yaml or .github/config.json.'),
  Args.optional,
)

const validateCommand = Command.make('validate', { path }, ({ path }) =>
  Option.match(path, { onNone: () => locateConfig('.'), onSome: Effect.succeed }).pipe(
    Effect.flatMap(validate),
    Effect.provide(gitHubConfigSource()),
  ),
).pipe(Command.withDescription('Check a config and everything it extends.'))

const input = Args.text({ name: 'input' }).pipe(Args.withDescription('The v1 JSON config.'), Args.withDefault('.github/config.json'))
const out = Options.text('out').pipe(Options.withAlias('o'), Options.withDescription('Write the YAML here instead of printing it.'), Options.optional)

const migrateCommand = Command.make('migrate', { input, out }, ({ input, out }) => migrate(input, Option.getOrUndefined(out))).pipe(
  Command.withDescription('Convert a v1 config to v2 YAML, warning about anything not carried over.'),
)

/** The `smartcloud` command and its subcommands. */
export const smartcloud = Command.make('smartcloud').pipe(
  Command.withDescription('Repository automation and policy for GitHub.'),
  Command.withSubcommands([validateCommand, migrateCommand]),
)

/**
 * Runs the CLI against an argument vector, as `process.argv` gives it.
 *
 * @param argv - The node binary, the script, then the arguments.
 * @returns The run.
 */
export const run = Command.run(smartcloud, { name: 'smartcloud', version: '2.0.0' })

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
 * lines, such as a schema error's tree, is joined onto the one line.
 *
 * @param argv - The node binary, the script, then the arguments.
 * @returns The run, which never fails.
 */
export const main = (argv: ReadonlyArray<string>) =>
  run(argv).pipe(
    Effect.catchAll((error) =>
      Effect.zipRight(
        ValidationError.isValidationError(error) ? Effect.void : Console.error(`smartcloud: ${oneLine(error.message)}`),
        Effect.sync(() => {
          process.exitCode = 1
        }),
      ),
    ),
  )
