/**
 * @file packages/feature.reviews/src/assignment.ts
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

import type { Subject, Review } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { Report } from '@resnovas/engine'
import { CODEOWNERS_PATHS, lintCodeOwners, parseCodeOwners } from '@resnovas/feature.codeowners'
import {
  GitHub,
  requestOwnerReviews,
  reviewAssignmentSnapshot,
  previouslyRequestedTeams,
} from '@resnovas/integrations.github'
import { Effect } from 'effect'
import picomatch from 'picomatch'
import { normaliseLogin } from './gate.js'

type Rule = NonNullable<NonNullable<SmartcloudConfig['reviews']>['requestApprovals']>[string]

const unique = (values: ReadonlyArray<string>) => [
  ...new Set(values.map((value) => normaliseLogin(value).toLowerCase())),
]

// CODEOWNERS follows gitignore matching, but has no negation, ranges,
// brace expansion or extglobs. A slash anchors a pattern at the root;
// a basename matches at any depth. Matching directories own descendants.
const matches = (pattern: string, path: string) => {
  const directory = pattern.endsWith('/')
  const stripped = pattern.replace(/^\//, '').replace(/\/$/, '')
  const rooted = pattern.startsWith('/') || stripped.includes('/')
  const glob = `${rooted ? '' : '**/'}${stripped.replace(/(?<!\\)[()|]/g, '\\$&')}`
  const match = picomatch(glob, {
    dot: true,
    regex: false,
    keepQuotes: true,
    nobrace: true,
    noext: true,
    nonegate: true,
    literalBrackets: true,
  })
  if (!directory && /[*?][^/]*$/.test(stripped)) return match(path)
  const parts = path.split('/')
  return parts.some(
    (_, index) => (!directory || index < parts.length - 1) && match(parts.slice(0, index + 1).join('/')),
  )
}

/**
 * Finds owners of changed files using the last valid matching CODEOWNERS line.
 *
 * @remarks
 * Empty owner lists clear ownership. Invalid lines are ignored. Email owners
 * are omitted because GitHub's review request API accepts logins and teams.
 *
 * @example
 * ```ts import.meta.vitest name="ownersForFiles"
 * import { ownersForFiles } from '@resnovas/feature.reviews'
 * ownersForFiles('* @ann\n/docs/ @Acme/docs', ['docs/guide.md']).join(',') // => 'acme/docs'
 * ```
 * @param text - CODEOWNERS from the base commit.
 * @param files - Changed repository-relative file paths.
 * @returns Unique user and team names without @ prefixes.
 */
export const ownersForFiles = (text: string, files: ReadonlyArray<string>): ReadonlyArray<string> => {
  const invalid = new Set(
    lintCodeOwners(text)
      .filter((problem) => problem.kind === 'syntax')
      .map((problem) => problem.line),
  )
  const entries = parseCodeOwners(text).filter((entry) => !invalid.has(entry.line))
  return unique(
    files
      .flatMap((file) => entries.findLast((entry) => matches(entry.pattern, file))?.owners ?? [])
      .filter((owner) => owner.startsWith('@')),
  )
}

const readOwners = (baseSha: string, number: number) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    for (const path of CODEOWNERS_PATHS) {
      const text = yield* github
        .getFile({ ...github.coordinates, path, ref: baseSha })
        .pipe(Effect.catchTag('NotFound', () => Effect.succeed(undefined)))
      if (text !== undefined) return ownersForFiles(text, yield* github.listFiles(number))
    }
    return []
  })

/**
 * Applies an opt-in reviewer selection strategy to one matching approval rule.
 * @internal
 * @param rule - The matching configuration rule.
 * @param subject - The pull request being evaluated.
 * @param reviews - Existing submitted reviews.
 * @returns Completion after selection and requesting any missing reviews.
 */
export const assignReviewers = (rule: Rule, subject: Subject, reviews: ReadonlyArray<Review>) =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const report = yield* Report
    if (!subject.open || subject.draft) return
    const current = yield* reviewAssignmentSnapshot(subject.number)
    const configured = unique(rule.reviewers)
    const owners = rule.strategy === 'codeowners' ? yield* readOwners(current.baseSha, subject.number) : configured
    const author = normaliseLogin(subject.author).toLowerCase()
    const pool = owners.filter(
      (owner) =>
        (!owner.includes('/') || owner.startsWith(`${github.coordinates.owner.toLowerCase()}/`)) &&
        (rule.strategy !== 'codeowners' || configured.length === 0 || configured.includes(owner)),
    )
    const candidates = pool.filter((owner) => owner !== author)
    const pastTeams = candidates.some((owner) => owner.includes('/'))
      ? yield* previouslyRequestedTeams(subject.number)
      : []
    const occupied = unique([
      ...pastTeams,
      ...current.pending,
      ...reviews.filter((review) => review.state !== 'PENDING').map((review) => review.author),
    ])
    const needed = (rule.count ?? 1) - candidates.filter((owner) => occupied.includes(owner)).length
    if (needed <= 0 || candidates.length === 0) return
    // Stable PR-number rotation needs no writeable cursor or privileged token. It turns the whole pool,
    // so an author in it does not shift everyone else's turn, and skips the author afterwards.
    const offset = (subject.number - 1) % pool.length
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)]
    const available = rotated.filter((owner) => owner !== author && !occupied.includes(owner))
    if (rule.strategy === 'load-balanced') {
      const loads = new Map<string, number>()
      for (const pull of yield* github.listOpenPullRequests) {
        if (pull.number === subject.number) continue
        const pending = yield* reviewAssignmentSnapshot(pull.number)
        for (const owner of unique(pending.pending)) loads.set(owner, (loads.get(owner) ?? 0) + 1)
      }
      available.sort((left, right) => (loads.get(left) ?? 0) - (loads.get(right) ?? 0))
    }
    const selected = available.slice(0, needed)
    if (selected.length === 0) return
    yield* requestOwnerReviews(subject.number, selected)
    yield* report.change({
      feature: 'reviews',
      description: `Requested review from ${selected.map((owner) => `@${owner}`).join(', ')} on #${subject.number} (${rule.strategy}).`,
    })
  }).pipe(
    Effect.catchTag('Forbidden', () =>
      Effect.flatMap(Report, (report) =>
        report.add({
          feature: 'reviews',
          rule: 'reviews.requestApprovals',
          level: 'warning',
          message: `Could not assign reviewers on #${subject.number}: the token lacks access.`,
        }),
      ),
    ),
  )
