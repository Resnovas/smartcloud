/**
 * @file packages/feature.labels/src/size.ts
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

import { type Label, type LabelRule, type SmartcloudConfig, sizeThresholds } from '@resnovas/config'
import { sameName } from './sync.js'

// Green for the smallest change through to red for the largest.
const SIZES = [
  { id: 'xs', name: 'XS', color: '3CBF00' },
  { id: 's', name: 'S', color: '5D9801' },
  { id: 'm', name: 'M', color: '7F7203' },
  { id: 'l', name: 'L', color: 'A14C05' },
  { id: 'xl', name: 'XL', color: 'C32607' },
] as const

const lines = (count: number) => `${count} line${count === 1 ? '' : 's'}`

const describe = (min: number, max: number | undefined) => {
  if (max === undefined) return `Changes ${lines(min)} or more`
  return max - 1 === min ? `Changes ${lines(min)}` : `Changes ${min} to ${lines(max - 1)}`
}

/**
 * The labels and labelling rules the built-in size labels add, keyed
 * `size-xs` to `size-xl`.
 *
 * @remarks
 * Each size has a label named `Size: XS` to `Size: XL` and a rule that
 * applies it to pull requests whose added plus deleted lines fall in its
 * band. A pull request is in exactly one band, so it carries one size label,
 * and the label moves as the pull request grows or shrinks.
 *
 * @example
 * ```ts import.meta.vitest name="sizePreset"
 * import { sizePreset } from '@resnovas/feature.labels'
 *
 * const { labels, labelling } = sizePreset({ thresholds: { s: 20 } })
 * labels['size-s']?.name // => 'Size: S'
 * labelling['size-xs']?.when.condition[0]?.type // => 'changesSize'
 * ```
 *
 * @param section - The config's `sizeLabels` section.
 * @returns The labels and rules, keyed by size.
 */
export const sizePreset = (
  section: NonNullable<SmartcloudConfig['sizeLabels']>,
): { readonly labels: Record<string, Label>; readonly labelling: Record<string, LabelRule> } => {
  const { s, m, l, xl } = sizeThresholds(section)
  const bounds = [0, s, m, l, xl]
  const labels: Record<string, Label> = {}
  const labelling: Record<string, LabelRule> = {}
  SIZES.forEach((size, index) => {
    const key = `size-${size.id}`
    const min = bounds[index] ?? 0
    const max = bounds[index + 1]
    labels[key] = {
      name: `Size: ${size.name}`,
      color: size.color,
      description: describe(min, max),
    }
    labelling[key] = {
      label: key,
      on: ['pullRequest'],
      when: { condition: [max === undefined ? { type: 'changesSize', min } : { type: 'changesSize', min, max }] },
    }
  })
  return { labels, labelling }
}

/**
 * The config with the built-in size labels merged in, when it has a
 * `sizeLabels` section.
 *
 * @remarks
 * The config's own `labels` and `labelling` entries win over the preset's
 * by key, so a repository can rename or recolour `size-m`, or replace its
 * rule, by defining that key itself. A label renamed this way keeps the
 * preset's name among its `aliases`, so label sync renames the repository
 * label rather than leaving the old one on pull requests.
 *
 * @example
 * ```ts import.meta.vitest name="withSizeLabels"
 * import { withSizeLabels } from '@resnovas/feature.labels'
 *
 * const config = withSizeLabels({ version: 2, sizeLabels: {}, labels: { 'size-xl': { name: 'huge', color: 'ff0000' } } })
 * config.labels?.['size-xl']?.aliases?.[0] // => 'Size: XL'
 * config.labels?.['size-l']?.name // => 'Size: L'
 * withSizeLabels({ version: 2 }).labels // => undefined
 * ```
 *
 * @param config - The whole config.
 * @returns The config, with size labels and rules added when asked for.
 */
export const withSizeLabels = (config: SmartcloudConfig): SmartcloudConfig => {
  if (config.sizeLabels === undefined) return config
  const preset = sizePreset(config.sizeLabels)
  const labels: Record<string, Label> = { ...preset.labels, ...config.labels }
  for (const [key, label] of Object.entries(preset.labels)) {
    const own = config.labels?.[key]
    // A renamed size keeps its preset name as an alias, so label sync renames
    // the repository label and pull requests carrying it keep one size label.
    if (
      own !== undefined &&
      !sameName(own.name, label.name) &&
      !(own.aliases ?? []).some((alias) => sameName(alias, label.name))
    ) {
      labels[key] = { ...own, aliases: [...(own.aliases ?? []), label.name] }
    }
  }
  return { ...config, labels, labelling: { ...preset.labelling, ...config.labelling } }
}
