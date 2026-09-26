/**
 * @file packages/config/src/v1.ts
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

// Migrates a v1 `.github/config.json` to the v2 shape.
//
// v1 had no validation, so real configs carry keys the code never read. The
// migration maps everything v2 supports, and reports every key it does not
// carry over as a warning saying why, rather than dropping it silently.

type Json = null | boolean | number | string | ReadonlyArray<Json> | { readonly [key: string]: Json }
type JsonRecord = Readonly<Record<string, Json>>

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** A migrated config and everything the migration could not carry over. */
export interface Migration {
  /** The v2 config, in its encoded form: decode it with `SmartcloudConfig`. */
  readonly config: JsonRecord
  readonly warnings: ReadonlyArray<string>
}

// Keys v1 accepted that v2 does not carry, and why.
const DROPPED: Readonly<Record<string, string>> = {
  versioning: 'version bumping is release-please territory, as the v1 README advised',
  prereleaseName: 'version bumping is release-please territory, as the v1 README advised',
  manageRelease: 'releases are release-please territory, as the v1 README advised',
  duplicateHotfix: 'v1 never implemented it',
  createMilestone: 'v1 never implemented it',
  assignMilestone: 'v1 never implemented it',
  createBranch: 'v1 never implemented it',
  openBranch: 'v1 never implemented it',
  assignProject: 'it used classic Projects, which GitHub has retired',
  syncRemote: 'it used classic Projects or was never implemented',
  root: 'v1 never read it',
  branch: 'v2 runs on the event it receives',
  retryLimit: 'v2 retries GitHub API calls itself',
  $schema: 'v2 uses its own schema',
}

// Keys whose feature has not been rebuilt in v2 yet.
const LATER: Readonly<Record<string, string>> = {
  stale: 'stale handling (SMC-11)',
  automaticApprove: 'the reviews feature (SMC-10)',
  requestApprovals: 'the reviews feature (SMC-10)',
}

const CONTEXTS: ReadonlyMap<string, 'shared' | 'pr' | 'issue' | 'schedule' | 'project'> = new Map([
  ['sharedConfig', 'shared'],
  ['pr', 'pr'],
  ['issue', 'issue'],
  ['schedule', 'schedule'],
  ['project', 'project'],
])

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9_.:-]+/g, '-')

const migrateLabels = (labels: Json | undefined): Record<string, JsonRecord> => {
  const out: Record<string, JsonRecord> = {}
  const add = (id: string, label: Json) => {
    if (!isRecord(label) || typeof label['name'] !== 'string' || typeof label['color'] !== 'string') return
    const { name, color, description } = label
    out[id] = typeof description === 'string' ? { name, color, description } : { name, color }
  }
  if (Array.isArray(labels)) labels.forEach((label) => isRecord(label) && typeof label['name'] === 'string' && add(slug(label['name']), label))
  else if (isRecord(labels)) Object.entries(labels).forEach(([id, label]) => add(id, label))
  return out
}

const PRESETS = new Set(['semanticTitle', 'gitmojis', 'semanticEmoji'])

/**
 * Converts a v1 configuration into the v2 shape.
 *
 * @remarks
 * v1 labels become `labels`, per-context label conditions become
 * `labelling` rules scoped to that context, and `enforceConventions` becomes
 * `conventions`. With several runners, rule keys are prefixed with the runner
 * index so none collide.
 *
 * @param input - The parsed v1 JSON.
 * @returns The v2 config and a warning for everything not carried over.
 */
export const migrateV1 = (input: JsonRecord): Migration => {
  const warnings: Array<string> = []
  const labelling: Record<string, JsonRecord> = {}
  const rules: Record<string, JsonRecord> = {}
  const comment: Record<string, string> = {}

  const runners = Array.isArray(input['runners']) ? input['runners'] : []
  runners.forEach((runner, index) => {
    if (!isRecord(runner)) return
    const prefix = runners.length > 1 ? `r${index}.` : ''
    for (const [key, value] of Object.entries(runner)) {
      const context = CONTEXTS.get(key)
      if (context === undefined) {
        warnings.push(`runners[${index}].${key}: ${DROPPED[key] === undefined ? 'unknown v1 key, ignored' : `dropped, ${DROPPED[key]}`}`)
        continue
      }
      if (!isRecord(value)) continue
      if (context === 'project') {
        warnings.push(`runners[${index}].project: dropped, ${DROPPED['assignProject']}`)
        continue
      }
      const on = context === 'pr' ? ['pullRequest'] : context === 'issue' ? ['issue'] : undefined
      for (const [feature, setting] of Object.entries(value)) {
        const where = `runners[${index}].${key}.${feature}`
        if (feature === 'labels' && isRecord(setting)) {
          for (const [label, when] of Object.entries(setting)) {
            labelling[`${prefix}${context}.${label}`] = on === undefined ? { label, when } : { label, on, when }
          }
        } else if (feature === 'enforceConventions' && isRecord(setting)) {
          if (typeof setting['commentHeader'] === 'string') comment['header'] = setting['commentHeader']
          if (typeof setting['commentFooter'] === 'string') comment['footer'] = setting['commentFooter']
          if (setting['onColumn'] !== undefined || setting['moveToColumn'] !== undefined) {
            warnings.push(`${where}: onColumn and moveToColumn dropped, ${DROPPED['assignProject']}`)
          }
          const conditions = Array.isArray(setting['condition']) ? setting['condition'] : []
          conditions.forEach((convention, position) => {
            if (!isRecord(convention)) return
            const { condition, requires, failedComment, contexts } = convention
            const rule: Record<string, Json> = on === undefined ? {} : { on }
            if (typeof failedComment === 'string') rule['message'] = failedComment
            if (Array.isArray(contexts)) rule['contexts'] = contexts
            if (typeof condition === 'string' && PRESETS.has(condition)) rule['preset'] = condition
            else rule['when'] = typeof requires === 'number' ? { requires, condition: condition ?? [] } : { condition: condition ?? [] }
            rules[`${prefix}${context}.${position}`] = rule
          })
        } else if (LATER[feature] !== undefined) {
          warnings.push(`${where}: not migrated yet, it arrives with ${LATER[feature]}`)
        } else {
          warnings.push(`${where}: ${DROPPED[feature] === undefined ? 'unknown v1 key, ignored' : `dropped, ${DROPPED[feature]}`}`)
        }
      }
    }
  })

  const config: Record<string, Json> = { version: 2 }
  const labels = migrateLabels(input['labels'])
  if (Object.keys(labels).length > 0) config['labels'] = labels
  if (Object.keys(labelling).length > 0) config['labelling'] = labelling
  if (Object.keys(rules).length > 0 || Object.keys(comment).length > 0) {
    config['conventions'] = Object.keys(comment).length > 0 ? { comment, rules } : { rules }
  }
  for (const key of Object.keys(input)) {
    if (key !== 'labels' && key !== 'runners' && key !== '$schema') warnings.push(`${key}: unknown v1 key, ignored`)
  }
  return { config, warnings }
}
