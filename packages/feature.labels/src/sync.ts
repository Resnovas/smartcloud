/**
 * @file packages/feature.labels/src/sync.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { Report } from '@resnovas/engine'
import { GitHub, type GitHubError, type Label } from '@resnovas/integrations.github'
import { Effect } from 'effect'

const FEATURE = 'labels'

/** A label as the config defines it, keyed by its rule id. */
type ConfiguredLabel = NonNullable<SmartcloudConfig['labels']>[string]

/**
 * Normalises a label colour for comparison and for GitHub.
 *
 * @remarks
 * The config accepts `#0E8A16` and `0e8a16` alike; GitHub stores six hex
 * digits without `#` and compares them ignoring case.
 *
 * @example
 * ```ts
 * normaliseColor('#0E8A16') // '0e8a16'
 * ```
 *
 * @param color - A colour with or without a leading `#`.
 * @returns The colour in lower case, without `#`.
 */
export const normaliseColor = (color: string): string => color.replace(/^#/, '').toLowerCase()

/**
 * Compares two label names the way GitHub does: ignoring case.
 *
 * @example
 * ```ts
 * sameName('Bug', 'bug') // true
 * ```
 *
 * @param a - One name.
 * @param b - The other name.
 * @returns Whether GitHub treats them as the same label.
 */
export const sameName = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase()

/** One step a label sync takes, in the order it is taken. */
export type SyncStep =
  | { readonly action: 'create'; readonly label: Label }
  | { readonly action: 'update'; readonly current: string; readonly label: Label }
  | { readonly action: 'rename'; readonly current: string; readonly label: Label }
  | { readonly action: 'delete'; readonly name: string }

// A description the config omits is left as it is on GitHub, so a config
// that only cares about colours never blanks descriptions set by hand.
const target = (configured: ConfiguredLabel, existing: Label | undefined): Label => ({
  name: configured.name,
  color: normaliseColor(configured.color),
  description: configured.description ?? existing?.description ?? '',
})

const differs = (wanted: Label, existing: Label) =>
  wanted.name !== existing.name ||
  wanted.color !== normaliseColor(existing.color) ||
  wanted.description !== existing.description

/**
 * Works out what a label sync must do, without doing it.
 *
 * @remarks
 * Each configured label is matched to a repository label by name, ignoring
 * case. Failing that, a repository label whose name is one of its `aliases`
 * is renamed, so issues carrying the old name keep the label. Anything else
 * is created. When two entries name the same label, ignoring case, only the
 * first is planned: GitHub would reject the second. With `prune`,
 * repository labels that no configured label claimed are deleted; without
 * it they are left alone. A label named by an alias is claimed even when the
 * configured name already exists, so pruning never strips it from issues.
 *
 * @example
 * ```ts
 * planSync({ bug: { name: 'bug', color: 'd73a4a' } }, [], false)
 * // [{ action: 'create', label: { name: 'bug', color: 'd73a4a', description: '' } }]
 * ```
 *
 * @param configured - The config's `labels` section.
 * @param existing - The repository's labels.
 * @param prune - Whether to delete labels the config does not define.
 * @returns The steps, creates and updates first, deletions last.
 */
export const planSync = (
  configured: Readonly<Record<string, ConfiguredLabel>>,
  existing: ReadonlyArray<Label>,
  prune: boolean,
): ReadonlyArray<SyncStep> => {
  const claimed = new Set<Label>()
  const unclaimed = (predicate: (label: Label) => boolean) =>
    existing.find((label) => !claimed.has(label) && predicate(label))
  const steps: Array<SyncStep> = []

  // Exact names are claimed before aliases, so an alias can never steal a
  // label that another configured label names directly.
  const entries = Object.values(configured).filter(
    (label, index, all) => all.findIndex((other) => sameName(other.name, label.name)) === index,
  )
  const direct = new Map<ConfiguredLabel, Label | undefined>()
  for (const label of entries) {
    const found = unclaimed((candidate) => sameName(candidate.name, label.name))
    if (found !== undefined) claimed.add(found)
    direct.set(label, found)
  }

  for (const label of entries) {
    const byName = direct.get(label)
    const aliases = label.aliases ?? []
    if (byName !== undefined) {
      const wanted = target(label, byName)
      if (differs(wanted, byName)) steps.push({ action: 'update', current: byName.name, label: wanted })
      for (const alias of existing.filter((found) => !claimed.has(found) && aliases.some((name) => sameName(name, found.name)))) {
        claimed.add(alias)
      }
      continue
    }
    const byAlias = unclaimed((found) => aliases.some((alias) => sameName(alias, found.name)))
    if (byAlias !== undefined) {
      claimed.add(byAlias)
      steps.push({ action: 'rename', current: byAlias.name, label: target(label, byAlias) })
      continue
    }
    steps.push({ action: 'create', label: target(label, undefined) })
  }

  if (prune) for (const label of existing) if (!claimed.has(label)) steps.push({ action: 'delete', name: label.name })
  return steps
}

/** The longest label description GitHub accepts. */
const MAX_DESCRIPTION = 100

// A repeated name only loses its later entries, so it is a warning.
const reportRepeatedNames = (configured: Readonly<Record<string, ConfiguredLabel>>) =>
  Effect.gen(function* () {
    const report = yield* Report
    const firstKey = new Map<string, string>()
    for (const [key, label] of Object.entries(configured)) {
      const first = firstKey.get(label.name.toLowerCase())
      if (first === undefined) firstKey.set(label.name.toLowerCase(), key)
      else {
        yield* report.add({
          feature: FEATURE,
          rule: 'labels.sync',
          level: 'warning',
          message: `labels.${key} names "${label.name}", which labels.${first} already names; only the first is synced`,
        })
      }
    }
  })

// GitHub rejects a description over its limit, which would stop the sync part
// way through; such a label is left as it is, still claimed so pruning keeps it.
const overlong = (step: SyncStep): Label | undefined =>
  step.action === 'delete' || step.label.description.length <= MAX_DESCRIPTION ? undefined : step.label

const describe = (step: SyncStep): string => {
  switch (step.action) {
    case 'create':
      return `created label "${step.label.name}"`
    case 'update':
      return `updated label "${step.label.name}"`
    case 'rename':
      return `renamed label "${step.current}" to "${step.label.name}"`
    case 'delete':
      return `deleted label "${step.name}"`
  }
}

/**
 * Makes the repository's labels match the config's `labels` section.
 *
 * @remarks
 * Runs on repository events only: pull request events from forks carry a
 * read-only token, so label writes would fail there. A label whose
 * description is over GitHub's 100 characters is reported and left alone
 * rather than stopping the sync part way; a name repeated across entries is
 * a warning, and only its first entry is synced. Every step is recorded
 * as a change; in a dry run the DryRun layer records the writes instead of
 * making them. Deletion needs `labelSync.prune: true`, which fixes v1's
 * misread `skipDelete` input that deleted labels by default.
 *
 * @example
 * ```ts
 * yield* syncLabels(config) // with GitHub and Report provided
 * ```
 *
 * @param config - The whole config; only `labels` and `labelSync` are read.
 * @returns Nothing; the changes are in the report.
 */
export const syncLabels = (config: SmartcloudConfig): Effect.Effect<void, GitHubError, GitHub | Report> =>
  Effect.gen(function* () {
    if (config.labels === undefined) return
    const github = yield* GitHub
    const report = yield* Report
    yield* reportRepeatedNames(config.labels)
    const steps = planSync(config.labels, yield* github.listLabels, config.labelSync?.prune ?? false)
    const planned = {
      create: steps.filter((step) => step.action === 'create').length,
      update: steps.filter((step) => step.action === 'update').length,
      rename: steps.filter((step) => step.action === 'rename').length,
      delete: steps.filter((step) => step.action === 'delete').length,
    }
    yield* Effect.logInfo(
      `labels: ${planned.create} to create, ${planned.update} to update, ${planned.rename} to rename, ${planned.delete} to delete`,
    ).pipe(Effect.annotateLogs({ feature: FEATURE, rule: 'labels.sync', ...planned }))
    for (const step of steps) {
      const skipped = overlong(step)
      if (skipped !== undefined) {
        yield* report.add({
          feature: FEATURE,
          rule: 'labels.sync',
          level: 'error',
          message: `label "${skipped.name}" was not synced: its description is longer than GitHub's ${MAX_DESCRIPTION} characters`,
        })
        continue
      }
      switch (step.action) {
        case 'create':
          yield* github.createLabel(step.label)
          break
        case 'update':
        case 'rename':
          yield* github.updateLabel(step.current, step.label)
          break
        case 'delete':
          yield* github.deleteLabel(step.name)
          break
      }
      yield* report.change({ feature: FEATURE, description: describe(step) })
    }
  })
