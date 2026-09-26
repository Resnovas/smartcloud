/**
 * @file packages/feature.sync/src/plan.ts
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

import { Either } from 'effect'
import { managedConflicts, mergeManaged } from './managed.js'
import { type MissingValue, renderAll, type Template, type Values } from './render.js'

/** A file as it is in the repository being synced. */
export interface CurrentFile {
  readonly content: string
  readonly executable: boolean
}

/** A file the sync writes, and why. */
export interface PlannedFile {
  readonly path: string
  readonly content: string
  readonly executable: boolean
  /** `create` for a new file, `update` for new content, `mode` when only the execute bit changes. */
  readonly reason: 'create' | 'update' | 'mode'
}

/** A local rule that conflicts with a synced one, found while merging. */
export interface PlannedConflict {
  readonly path: string
  readonly problem: string
}

/** What a sync would change. */
export interface SyncPlan {
  /** Only the files that change, sorted by path. */
  readonly files: ReadonlyArray<PlannedFile>
  readonly conflicts: ReadonlyArray<PlannedConflict>
}

/**
 * Works out which files a sync changes.
 *
 * @remarks
 * Excluded templates are neither rendered nor synced, so a repository that
 * keeps its own copy of a file need not supply that template's values.
 * Every other template is rendered and merged with the current file
 * ({@link mergeManaged}). An executable template makes its file executable,
 * and a file that already is executable stays so.
 *
 * @example
 * ```ts import.meta.vitest name="planSync"
 * import { planSync } from '@resnovas/feature.sync'
 * import { Either } from 'effect'
 *
 * const templates = [{ path: 'LICENSE', content: '(c) {{HOLDER}}\n', executable: false }]
 * const plan = planSync(templates, new Map(), { HOLDER: 'Resnovas' }, [])
 * Either.isRight(plan) && plan.right.files[0]?.reason // => 'create'
 * ```
 *
 * @param templates - The templates, with paths relative to the template directory.
 * @param current - The repository's files by path; a missing path is a file that does not exist.
 * @param values - The `{{KEY}}` values.
 * @param exclude - Template paths the repository keeps its own copy of.
 * @returns The plan, or the first missing value.
 */
export const planSync = (
  templates: ReadonlyArray<Template>,
  current: ReadonlyMap<string, CurrentFile>,
  values: Values,
  exclude: ReadonlyArray<string>,
): Either.Either<SyncPlan, MissingValue> =>
  Either.map(
    renderAll(
      templates.filter((template) => !exclude.includes(template.path)),
      values,
    ),
    (rendered) => {
      const files: Array<PlannedFile> = []
      const conflicts: Array<PlannedConflict> = []
      for (const template of rendered) {
        const existing = current.get(template.path)
        const content = mergeManaged(template.content, existing?.content ?? null, template.path)
        for (const problem of managedConflicts(template.path, template.content, content)) {
          conflicts.push({ path: template.path, problem })
        }
        const executable = template.executable || existing?.executable === true
        const reason =
          existing === undefined
            ? 'create'
            : existing.content !== content
              ? 'update'
              : existing.executable !== executable
                ? 'mode'
                : undefined
        if (reason !== undefined) files.push({ path: template.path, content, executable, reason })
      }
      return { files, conflicts }
    },
  )
