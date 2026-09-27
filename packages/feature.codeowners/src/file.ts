/**
 * @file packages/feature.codeowners/src/file.ts
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

import { CodeOwner, type CodeOwnersRule } from '@resnovas/config'
import { Schema } from 'effect'

/**
 * Where GitHub looks for CODEOWNERS, in the order it looks: it uses the
 * first that exists.
 *
 * @example
 * ```ts import.meta.vitest name="CODEOWNERS_PATHS"
 * import { CODEOWNERS_PATHS } from '@resnovas/feature.codeowners'
 *
 * CODEOWNERS_PATHS[0] // => '.github/CODEOWNERS'
 * ```
 */
export const CODEOWNERS_PATHS = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'] as const

/**
 * The marker that opens the block generated from `codeowners.rules`.
 *
 * @example
 * ```ts import.meta.vitest name="GENERATED_BEGIN"
 * import { GENERATED_BEGIN } from '@resnovas/feature.codeowners'
 *
 * GENERATED_BEGIN // => 'smartcloud:codeowners:begin'
 * ```
 */
export const GENERATED_BEGIN = 'smartcloud:codeowners:begin'

/**
 * The marker that closes the generated block.
 *
 * @example
 * ```ts import.meta.vitest name="GENERATED_END"
 * import { GENERATED_END } from '@resnovas/feature.codeowners'
 *
 * GENERATED_END // => 'smartcloud:codeowners:end'
 * ```
 */
export const GENERATED_END = 'smartcloud:codeowners:end'

// The sync feature's managed block, which must stay last in CODEOWNERS.
const SYNCED_BEGIN = 'house:managed:begin'

const MARKER_FOLLOWER = /^[\w:-]$/

// Whether a line is a comment holding the marker, not a longer word that starts with it.
const isMarker = (line: string, marker: string) => {
  const text = line.trimStart()
  if (!text.startsWith('#')) return false
  const body = text.slice(1).trimStart()
  return body.startsWith(marker) && !MARKER_FOLLOWER.test(body.charAt(marker.length))
}

/** One rule of a CODEOWNERS file. */
export interface CodeOwnersEntry {
  /** The line it is on, from 1. */
  readonly line: number
  readonly pattern: string
  readonly owners: ReadonlyArray<string>
}

/** Something wrong with a CODEOWNERS line. */
export interface CodeOwnersProblem {
  /** The line it is on, from 1. */
  readonly line: number
  /** `syntax` for a line GitHub rejects or ignores; `shadowed` for a rule a later one replaces. */
  readonly kind: 'syntax' | 'shadowed'
  readonly message: string
}

// Tokens are split on whitespace that is not escaped; a token starting with
// # begins a trailing comment.
const tokens = (line: string) => {
  const all = line.trim().split(/(?<!\\)\s+/)
  const comment = all.findIndex((token, index) => index > 0 && token.startsWith('#'))
  return comment === -1 ? all : all.slice(0, comment)
}

/**
 * Reads the rules of a CODEOWNERS file, skipping blank and comment lines.
 *
 * @example
 * ```ts import.meta.vitest name="parseCodeOwners"
 * import { parseCodeOwners } from '@resnovas/feature.codeowners'
 *
 * const entries = parseCodeOwners('# Docs\n/docs/ @Resnovas/docs @TGTGamer # writers\n')
 * entries[0]?.owners.length // => 2
 * entries[0]?.line // => 2
 * ```
 *
 * @param text - The file.
 * @returns Its rules, in file order.
 */
export const parseCodeOwners = (text: string): ReadonlyArray<CodeOwnersEntry> =>
  text.split('\n').flatMap((raw, index) => {
    const line = raw.trim()
    if (line === '' || line.startsWith('#')) return []
    const [pattern = '', ...owners] = tokens(line)
    return [{ line: index + 1, pattern, owners }]
  })

const isOwner = Schema.is(CodeOwner)

const patternProblem = (pattern: string) =>
  pattern.startsWith('!')
    ? 'negation (!) is not supported in CODEOWNERS'
    : pattern.startsWith('\\#')
      ? 'a pattern starting with an escaped # is not supported in CODEOWNERS'
      : /[[\]]/.test(pattern)
        ? 'character ranges ([ ]) are not supported in CODEOWNERS'
        : undefined

/**
 * Finds problems GitHub does not reject but ignores or resolves surprisingly.
 *
 * @remarks
 * A pattern GitHub does not support, and an owner that is not written as a
 * user, a team or an email address, are `syntax` problems: GitHub skips the
 * line. A rule followed by another with the same pattern is `shadowed`,
 * since the last matching rule wins. Whether owners exist and can write is
 * left to GitHub's own CODEOWNERS errors.
 *
 * @example
 * ```ts import.meta.vitest name="lintCodeOwners"
 * import { lintCodeOwners } from '@resnovas/feature.codeowners'
 *
 * const problems = lintCodeOwners('*.md docs\n!vendor/ @TGTGamer\n*.md @TGTGamer\n')
 * problems.map((problem) => `${problem.line}:${problem.kind}`).join(' ') // => '1:syntax 1:shadowed 2:syntax'
 * ```
 *
 * @param text - The file.
 * @returns The problems, by line.
 */
export const lintCodeOwners = (text: string): ReadonlyArray<CodeOwnersProblem> => {
  const entries = parseCodeOwners(text)
  // The line of each pattern's last rule, found in one pass.
  const last = new Map(entries.map((entry) => [entry.pattern, entry.line]))
  return entries.flatMap((entry): ReadonlyArray<CodeOwnersProblem> => {
    const pattern = patternProblem(entry.pattern)
    const owners = entry.owners
      .filter((owner) => !isOwner(owner))
      .map((owner) => `\`${owner}\` is not a user (@login), a team (@org/team) or an email address`)
    const later = last.get(entry.pattern)
    return [
      ...(pattern === undefined ? [] : [pattern]).map((message) => ({
        line: entry.line,
        kind: 'syntax' as const,
        message,
      })),
      ...owners.map((message) => ({ line: entry.line, kind: 'syntax' as const, message })),
      ...(later === undefined || later === entry.line
        ? []
        : [
            {
              line: entry.line,
              kind: 'shadowed' as const,
              message: `the rule for \`${entry.pattern}\` never applies: line ${later} has the same pattern, and the last matching rule wins`,
            },
          ]),
    ]
  })
}

/**
 * Writes the generated block for `codeowners.rules`, markers included.
 *
 * @remarks
 * Rules are written in config order, a blank line between them, with owners
 * lined up after the longest pattern. The last matching rule wins, so later
 * rules override earlier ones.
 *
 * @example
 * ```ts import.meta.vitest name="renderGenerated"
 * import { renderGenerated } from '@resnovas/feature.codeowners'
 *
 * const block = renderGenerated({ docs: { paths: ['/docs/', '*.md'], owners: ['@Resnovas/docs'], comment: 'Documentation.' } })
 * block.split('\n')[2] // => '/docs/ @Resnovas/docs'
 * block.split('\n').at(-1) // => '# smartcloud:codeowners:end'
 * ```
 *
 * @param rules - The `codeowners.rules` section.
 * @returns The block, without a trailing newline.
 */
export const renderGenerated = (rules: Readonly<Record<string, CodeOwnersRule>>): string => {
  const all = Object.values(rules)
  const width = Math.max(0, ...all.flatMap((rule) => rule.paths.map((path) => path.length)))
  const sections = all.map((rule) => [
    ...(rule.comment === undefined ? [] : rule.comment.split('\n').map((line) => `# ${line}`.trimEnd())),
    ...rule.paths.map((path) => (rule.owners.length === 0 ? path : `${path.padEnd(width)} ${rule.owners.join(' ')}`)),
  ])
  return [
    `# ${GENERATED_BEGIN} - generated from codeowners.rules in the smartcloud config. Edits inside this block are overwritten.`,
    ...sections.flatMap((lines, index) => (index === 0 ? lines : ['', ...lines])),
    `# ${GENERATED_END}`,
  ].join('\n')
}

// The generated block's first and last line, when the file has a well-formed one.
const blockRange = (lines: ReadonlyArray<string>) => {
  const begin = lines.findIndex((line) => isMarker(line, GENERATED_BEGIN))
  const end = lines.findIndex((line) => isMarker(line, GENERATED_END))
  return begin === -1 || end < begin ? undefined : { begin, end }
}

/**
 * Reads the generated block out of a CODEOWNERS file.
 *
 * @example
 * ```ts import.meta.vitest name="generatedBlock"
 * import { generatedBlock } from '@resnovas/feature.codeowners'
 *
 * generatedBlock('* @a\n# smartcloud:codeowners:begin\n/docs/ @b\n# smartcloud:codeowners:end\n') // => '# smartcloud:codeowners:begin\n/docs/ @b\n# smartcloud:codeowners:end'
 * generatedBlock('* @a\n') // => undefined
 * ```
 *
 * @param text - The file.
 * @returns The block, markers included, or undefined when the file has no well-formed block.
 */
export const generatedBlock = (text: string): string | undefined => {
  const lines = text.split('\n')
  const range = blockRange(lines)
  return range === undefined ? undefined : lines.slice(range.begin, range.end + 1).join('\n')
}

/**
 * Puts the generated block into a CODEOWNERS file, keeping everything else.
 *
 * @remarks
 * An existing block is replaced where it is, unless it sits below a block
 * synced by the sync feature. Otherwise the block goes just above the synced
 * block, which must stay last so synced owners always apply, or at the end of
 * the file. Stray markers of a broken
 * block are dropped first.
 *
 * @example
 * ```ts import.meta.vitest name="mergeGenerated"
 * import { mergeGenerated } from '@resnovas/feature.codeowners'
 *
 * const block = '# smartcloud:codeowners:begin\n/docs/ @b\n# smartcloud:codeowners:end'
 * mergeGenerated('* @a\n', block) // => '* @a\n\n# smartcloud:codeowners:begin\n/docs/ @b\n# smartcloud:codeowners:end\n'
 * mergeGenerated(null, block).startsWith('# smartcloud') // => true
 * ```
 *
 * @param current - The file as it is, or null when there is none.
 * @param block - The block from {@link renderGenerated}.
 * @returns The file with the block in place.
 */
export const mergeGenerated = (current: string | null, block: string): string => {
  const lines = (current ?? '').split('\n')
  const range = blockRange(lines)
  const syncedAt = lines.findIndex((line) => isMarker(line, SYNCED_BEGIN))
  // A block below the synced one would override synced owners, so it moves above it.
  if (range !== undefined && (syncedAt === -1 || range.end < syncedAt))
    return [...lines.slice(0, range.begin), block, ...lines.slice(range.end + 1)].join('\n')
  const outside = range === undefined ? lines : [...lines.slice(0, range.begin), ...lines.slice(range.end + 1)]
  const kept = outside.filter((line) => !isMarker(line, GENERATED_BEGIN) && !isMarker(line, GENERATED_END))
  const synced = kept.findIndex((line) => isMarker(line, SYNCED_BEGIN))
  if (synced !== -1) {
    const before = kept.slice(0, synced)
    const gap = before.length > 0 && before.at(-1)?.trim() !== '' ? [''] : []
    return [...before, ...gap, block, '', ...kept.slice(synced)].join('\n')
  }
  const text = kept.join('\n').trimEnd()
  return text === '' ? `${block}\n` : `${text}\n\n${block}\n`
}
