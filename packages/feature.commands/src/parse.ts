/**
 * @file packages/feature.commands/src/parse.ts
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

import { Data } from 'effect'

/**
 * The most commands one comment may hold. Any after it are reported, not run.
 *
 * @example
 * ```ts import.meta.vitest name="COMMAND_LIMIT"
 * import { COMMAND_LIMIT } from '@resnovas/feature.commands'
 *
 * COMMAND_LIMIT // => 10
 * ```
 */
export const COMMAND_LIMIT = 10

/**
 * One slash command as written in a comment.
 *
 * @example
 * ```ts import.meta.vitest name="Invocation"
 * import { Invocation } from '@resnovas/feature.commands'
 *
 * new Invocation({ name: 'label', args: ['bug'], rest: 'bug', line: '/label bug' }).name // => 'label'
 * ```
 */
export class Invocation extends Data.Class<{
  /** The command's name, lower case, without the slash. */
  readonly name: string
  /** The arguments, split on spaces; quotes keep spaces in one argument. */
  readonly args: ReadonlyArray<string>
  /** Everything after the name, trimmed, as written. */
  readonly rest: string
  /** The whole line, trimmed, for quoting back. */
  readonly line: string
}> {}

// A command is a slash and a lower-case name at the start of a line, then
// nothing or a space and arguments. The name and line are bounded, so reading
// a comment anyone can write stays linear.
const COMMAND = /^\/([a-z][a-z-]{0,31})(?:[ \t]+(.{0,1000}))?$/
const FENCE = /^(`{3,}|~{3,})/

// Splits on whitespace, keeping "double" or 'single' quoted text together.
const splitArgs = (rest: string): ReadonlyArray<string> => {
  const args: Array<string> = []
  let current = ''
  let quote: string | undefined
  let started = false
  for (const char of rest) {
    if (quote !== undefined) {
      if (char === quote) quote = undefined
      else current += char
    } else if (char === '"' || char === "'") {
      quote = char
      started = true
    } else if (char === ' ' || char === '\t') {
      if (started) args.push(current)
      current = ''
      started = false
    } else {
      current += char
      started = true
    }
  }
  if (started) args.push(current)
  return args
}

/**
 * Reads the slash commands in a comment, in order.
 *
 * @remarks
 * A command is a line that starts with `/` and a name, such as
 * `/label bug "good first issue"`. Lines inside fenced code blocks and quoted
 * lines (starting with `>`) are skipped, so quoting someone's command or
 * showing one in an example does not run it. Names are matched in lower case;
 * whether a name is a known command is left to the caller.
 *
 * @example
 * ```ts import.meta.vitest name="parseCommands"
 * import { parseCommands } from '@resnovas/feature.commands'
 *
 * const found = parseCommands('Thanks!\n/label bug "good first issue"\n> /close\n/Assign')
 * found.map((invocation) => invocation.name).join(',') // => 'label,assign'
 * found[0]?.args[1] // => 'good first issue'
 * ```
 *
 * @param body - The comment's Markdown.
 * @returns The commands found.
 */
export const parseCommands = (body: string): ReadonlyArray<Invocation> => {
  const found: Array<Invocation> = []
  let fence: string | undefined
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim()
    const opening = FENCE.exec(line)?.[1]
    if (fence !== undefined) {
      if (opening !== undefined && opening[0] === fence[0] && opening.length >= fence.length) fence = undefined
      continue
    }
    if (opening !== undefined) {
      fence = opening
      continue
    }
    const match = COMMAND.exec(line.length > 1100 ? '' : line.replace(/^\/[A-Za-z-]+/, (name) => name.toLowerCase()))
    if (match === null) continue
    const rest = (match[2] ?? '').trim()
    found.push(new Invocation({ name: match[1] ?? '', args: splitArgs(rest), rest, line }))
  }
  return found
}
