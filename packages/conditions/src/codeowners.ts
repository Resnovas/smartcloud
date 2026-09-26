/**
 * @file packages/conditions/src/codeowners.ts
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

import picomatch from 'picomatch'

/**
 * One line of a CODEOWNERS file: a path pattern and the owners of the files
 * it matches.
 */
export interface CodeownersRule {
  /** The pattern as written. */
  readonly pattern: string
  /** `@user`, `@org/team` or email owners; none leaves matching files unowned. */
  readonly owners: ReadonlyArray<string>
  /** Tests a repository path against the pattern. */
  readonly matches: (path: string) => boolean
}

// Leading and trailing slashes dropped by index: a regular expression would
// backtrack on a long run of slashes.
const trimSlashes = (text: string): string => {
  let start = 0
  let end = text.length
  while (start < end && text[start] === '/') start += 1
  while (end > start && text[end - 1] === '/') end -= 1
  return text.slice(start, end)
}

// GitHub reads CODEOWNERS patterns as gitignore does, without negation or
// character ranges. A pattern with a slash before its end is anchored at the
// root; otherwise it matches at any depth. A trailing slash matches only a
// directory, and a pattern naming a directory also matches everything in it,
// except one ending in `/*`, which GitHub documents as matching direct
// children only.
const globsOf = (pattern: string): ReadonlyArray<string> => {
  const directory = pattern.endsWith('/')
  const body = trimSlashes(pattern)
  const base = pattern.slice(0, -1).includes('/') ? body : `**/${body}`
  if (directory) return [`${base}/**/*`]
  return body.endsWith('/*') ? [base] : [base, `${base}/**/*`]
}

// The owners end at the first token starting with `#`, an inline comment.
const ownersOf = (tokens: ReadonlyArray<string>): ReadonlyArray<string> => {
  const comment = tokens.findIndex((token) => token.startsWith('#'))
  return comment === -1 ? tokens : tokens.slice(0, comment)
}

// GitHub skips a line whose pattern uses syntax it does not support: `!`
// negation, `[ ]` ranges, or a `\#` escape for a leading `#`.
const UNSUPPORTED = /^(?:!|\\#)|[[\]]/

const parseLine = (line: string): CodeownersRule | undefined => {
  const trimmed = line.trim()
  if (trimmed === '' || trimmed.startsWith('#')) return undefined
  // A backslash escapes the next character, so `docs/My\ Files/` is one pattern.
  const [first = '', ...rest] = trimmed.match(/(?:\\.|[^\s\\])+\\?/g) ?? []
  if (UNSUPPORTED.test(first)) return undefined
  const pattern = first.replace(/\\ /g, ' ')
  const isMatch = picomatch([...globsOf(pattern)], { dot: true, nobrace: true, noextglob: true })
  return { pattern, owners: ownersOf(rest), matches: (path) => isMatch(path) }
}

/**
 * Parses a CODEOWNERS file into its rules, in file order.
 *
 * @remarks
 * Blank lines and `#` comments, whole-line or after the owners, are skipped.
 * Patterns follow GitHub's rules: gitignore syntax, anchored at the root when
 * they contain a slash before the end, and matching dotfiles. A backslash
 * escapes a space. As on GitHub, a line using `!` negation, `[ ]` ranges or a
 * `\#` escape is skipped.
 *
 * @example
 * ```ts import.meta.vitest name="parseCodeowners"
 * import { parseCodeowners } from '@resnovas/conditions'
 *
 * const [rule] = parseCodeowners('# owners\n/docs/ @org/docs @jane # docs team\n')
 * rule?.pattern // => '/docs/'
 * rule?.owners.join(' ') // => '@org/docs @jane'
 * rule?.matches('docs/intro.md') // => true
 * ```
 *
 * @param text - The contents of a CODEOWNERS file.
 * @returns One rule per pattern line.
 */
export const parseCodeowners = (text: string): ReadonlyArray<CodeownersRule> =>
  text.split(/\r?\n/).flatMap((line) => parseLine(line) ?? [])

/**
 * The owners of a file: those of the last rule whose pattern matches it, as
 * on GitHub.
 *
 * @example
 * ```ts import.meta.vitest name="codeownersOf"
 * import { codeownersOf, parseCodeowners } from '@resnovas/conditions'
 *
 * const rules = parseCodeowners('* @org/core\n*.md @org/docs\n')
 * codeownersOf(rules, 'README.md').join(' ') // => '@org/docs'
 * codeownersOf(rules, 'src/index.ts').join(' ') // => '@org/core'
 * ```
 *
 * @param rules - The rules from `parseCodeowners`.
 * @param path - A repository path, without a leading slash.
 * @returns The owners; none when no rule matches or the matching rule lists none.
 */
export const codeownersOf = (rules: ReadonlyArray<CodeownersRule>, path: string): ReadonlyArray<string> =>
  rules.findLast((rule) => rule.matches(path))?.owners ?? []
