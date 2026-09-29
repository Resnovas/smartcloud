/**
 * @file packages/conditions/src/dependency.ts
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

import { Schema } from 'effect'

/**
 * How big a version change is, by the first part of the version that
 * changed: `major` (1.x to 2.x), `minor` (1.2 to 1.3) or `patch` (anything
 * after that).
 *
 * @example
 * ```ts import.meta.vitest name="UpdateType"
 * import { UpdateType } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(UpdateType)('minor') // => true
 * Schema.is(UpdateType)('digest') // => false
 * ```
 */
export const UpdateType = Schema.Literal('patch', 'minor', 'major').annotations({
  identifier: 'UpdateType',
  description: 'A version update: patch, minor or major.',
})
/** A decoded {@link UpdateType}. */
export type UpdateType = typeof UpdateType.Type

/** The largest version change a dependency update makes. */
export interface DependencyUpdate {
  readonly type: UpdateType
  /** The version before, as written. */
  readonly from: string
  /** The version after, as written. */
  readonly to: string
}

const RANK: Record<UpdateType, number> = { patch: 0, minor: 1, major: 2 }

// A version as the bots write it: an optional range or `v` prefix, a PEP 440
// epoch (`1!`), numeric parts and an optional suffix: a pre-release or build
// (`-rc.1`, `+build`), or a dotted one such as `.post1` or Maven's `.Final`.
const VERSION = String.raw`(?<![\w.])\`?[\^~=v]*((?:\d+!)?\d+(?:\.\d+)*(?:[-+.][0-9A-Za-z.-]*[0-9A-Za-z])?)\`?`
// Dependabot: "Bump x from 1.2.3 to 1.2.4" and "Updates `x` from 1.2.3 to 1.2.4".
// Renovate: a table row "| x | [`1.2.3` -> `1.2.4`](…) |", with -> or →.
const CHANGE = new RegExp(String.raw`\bfrom\s+${VERSION}\s+to\s+${VERSION}|${VERSION}\s*(?:->|→)\s*${VERSION}`, 'g')
const DETAILS = /<details\b[^>]*>(?:(?!<details\b)[\s\S])*?<\/details>/gi

// HTML comments dropped, found by index rather than a regular expression,
// which would backtrack on many unclosed `<!--`. An unclosed one hides the
// rest, as it does when rendered.
const withoutComments = (body: string): string => {
  let text = ''
  let index = 0
  for (let start = body.indexOf('<!--'); start !== -1; start = body.indexOf('<!--', index)) {
    text += body.slice(index, start)
    const end = body.indexOf('-->', start + 4)
    if (end === -1) return text
    index = end + 3
  }
  return text + body.slice(index)
}

// Release notes, changelogs and commit lists quote other projects' text, which
// can mention any version change, so only the bot's own summary is read:
// collapsed <details> sections, HTML comments and quoted lines are dropped.
const summaryOf = (body: string): string => {
  let text = withoutComments(body)
  for (let previous = ''; previous !== text;) {
    previous = text
    text = text.replace(DETAILS, '')
  }
  return text
    .split(/\r?\n/)
    .filter((line) => !/^\s*>/.test(line))
    .join('\n')
}

// The PEP 440 epoch, 0 when there is none, and the numeric parts after it.
const parts = (version: string): readonly [number, ReadonlyArray<number>] => {
  // Two steps, so no two parts of one pattern can match the same characters
  // and a long run of range operators cannot make it backtrack.
  const bare = version.replace(/^[\^~=v]+/, '')
  const [, epoch = '0', rest = bare] = /^(\d+)!(.*)$/s.exec(bare) ?? []
  return [Number(epoch), (/^\d+(?:\.\d+)*/.exec(rest)?.[0] ?? '').split('.').map(Number)]
}

/**
 * The type of a change from one version to another: the first numeric part
 * that differs decides it.
 *
 * @remarks
 * A missing part counts as zero, so `4` to `4.1` is minor. A change in the
 * fourth part or later, or only in the suffix, is a patch. A change of PEP 440
 * epoch (`1!2.0`) is major. A downgrade is typed the same way as an upgrade.
 *
 * @example
 * ```ts import.meta.vitest name="updateTypeOf"
 * import { updateTypeOf } from '@resnovas/conditions'
 *
 * updateTypeOf('1.2.3', '2.0.0') // => 'major'
 * updateTypeOf('v1.2.3', 'v1.3.0') // => 'minor'
 * updateTypeOf('1.2.3', '1.2.4-rc.1') // => 'patch'
 * ```
 *
 * @param from - The version before.
 * @param to - The version after.
 * @returns `major`, `minor` or `patch`.
 */
export const updateTypeOf = (from: string, to: string): UpdateType => {
  const [fromEpoch, before] = parts(from)
  const [toEpoch, after] = parts(to)
  if (fromEpoch !== toEpoch) return 'major'
  const length = Math.max(before.length, after.length)
  const index = Array.from({ length }, (_, part) => part).find((part) => (before[part] ?? 0) !== (after[part] ?? 0))
  return index === 0 ? 'major' : index === 1 ? 'minor' : 'patch'
}

/**
 * The largest version change a Dependabot or Renovate pull request makes,
 * read from its title and description.
 *
 * @remarks
 * Dependabot writes `from 1.2.3 to 1.2.4` in its title and description, once
 * per dependency in a grouped update. Renovate writes a table with a
 * `1.2.3 -> 1.2.4` change per dependency. Every change found counts, and the
 * largest wins, so a group with one major update is major. Release notes,
 * changelogs and commit lists (collapsed `<details>` sections and quoted
 * lines) are skipped, since they quote other projects' text. An update with no
 * numeric version change, such as a digest bump or lockfile maintenance, has
 * none.
 *
 * @example
 * ```ts import.meta.vitest name="dependencyUpdate"
 * import { dependencyUpdate } from '@resnovas/conditions'
 *
 * dependencyUpdate('Bump lodash from 4.17.20 to 4.17.21', '')?.type // => 'patch'
 * const renovate = '| Package | Change |\n|---|---|\n| react | [`18.2.0` -> `19.0.0`](https://renovatebot.com/diffs/npm/react/18.2.0/19.0.0) |'
 * dependencyUpdate('Update dependency react to v19', renovate)?.type // => 'major'
 * dependencyUpdate('Lock file maintenance', '') // => undefined
 * ```
 *
 * @param title - The pull request's title.
 * @param body - The pull request's description.
 * @returns The largest change, the first found among equals; `undefined` when there is none.
 */
export const dependencyUpdate = (title: string, body: string): DependencyUpdate | undefined => {
  let largest: DependencyUpdate | undefined
  for (const match of `${title}\n${summaryOf(body)}`.matchAll(CHANGE)) {
    const from = match[1] ?? match[3] ?? ''
    const to = match[2] ?? match[4] ?? ''
    const type = updateTypeOf(from, to)
    if (largest === undefined || RANK[type] > RANK[largest.type]) largest = { type, from, to }
  }
  return largest
}
