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


const CONTEXTS: ReadonlyMap<string, 'shared' | 'pr' | 'issue' | 'schedule' | 'project'> = new Map([
  ['sharedConfig', 'shared'],
  ['pr', 'pr'],
  ['issue', 'issue'],
  ['schedule', 'schedule'],
  ['project', 'project'],
])

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9_.:-]+/g, '-')

// Labels are collected in a Map and turned into an object with
// Object.fromEntries, so a key such as `__proto__` stays data and the schema
// can report it, rather than vanishing into the object's prototype.
const migrateLabels = (labels: Json | undefined, warnings: Array<string>): JsonRecord => {
  const out = new Map<string, JsonRecord>()
  const add = (id: string, label: Json) => {
    if (!isRecord(label) || typeof label['name'] !== 'string' || typeof label['color'] !== 'string') return
    const { name, color, description } = label
    out.set(id, typeof description === 'string' ? { name, color, description } : { name, color })
  }
  if (Array.isArray(labels)) {
    labels.forEach((label, index) => {
      if (!isRecord(label) || typeof label['name'] !== 'string') return
      const name = label['name']
      const id = slug(name)
      // Distinct names such as `A B` and `A-B` slug alike; keep both.
      let unique = id
      for (let suffix = 2; out.has(unique); suffix++) unique = `${id}-${suffix}`
      if (unique !== id) warnings.push(`labels[${index}]: "${name}" has the same key as an earlier label, migrated as "${unique}"`)
      add(unique, label)
    })
  } else if (isRecord(labels)) Object.entries(labels).forEach(([id, label]) => add(id, label))
  return Object.fromEntries(out)
}

const PRESETS = new Set(['semanticTitle', 'gitmojis', 'semanticEmoji'])

// v1 stale keys that v2 does not carry, and why. v1 declared close and lock
// on abandoned items but never acted on them, so they are not turned into
// v2's close, which would start closing items v1 left open.
const STALE_DROPPED: Readonly<Record<string, string>> = {
  resolve: 'v2 posts no comment when an item stops being stale',
  condition: 'v2 stale has no extra conditions; use exempt',
  requires: 'v2 stale has no extra conditions; use exempt',
  commentHeader: 'v2 stale comments have no header or footer',
  commentFooter: 'v2 stale comments have no header or footer',
  close: 'v1 never implemented it',
  lock: 'v1 never implemented it',
}

const warnUncarried = (warnings: Array<string>, where: string, record: JsonRecord, carried: ReadonlyArray<string>) => {
  for (const key of Object.keys(record)) {
    if (carried.includes(key)) continue
    const reason = STALE_DROPPED[key]
    warnings.push(`${where}.${key}: ${reason === undefined ? 'unknown v1 key, ignored' : `dropped, ${reason}`}`)
  }
}

// v1 stale: { staleLabel, condition, stale: { days, comment, ... }, abandoned: { days, label, comment, ... } }.
const migrateStale = (
  setting: JsonRecord,
  on: ReadonlyArray<string> | undefined,
  where: string,
  warnings: Array<string>,
): JsonRecord => {
  const out: Record<string, Json> = on === undefined ? {} : { on: [...on] }
  const inner = isRecord(setting['stale']) ? setting['stale'] : {}
  const abandoned = isRecord(setting['abandoned']) ? setting['abandoned'] : {}
  warnUncarried(warnings, where, setting, ['staleLabel', 'stale', 'abandoned'])
  warnUncarried(warnings, `${where}.stale`, inner, ['days', 'comment'])
  warnUncarried(warnings, `${where}.abandoned`, abandoned, ['days', 'label', 'comment'])
  out['staleAfterDays'] = typeof inner['days'] === 'number' ? inner['days'] : 60
  out['staleLabel'] = typeof setting['staleLabel'] === 'string' ? setting['staleLabel'] : 'stale'
  if (typeof inner['comment'] === 'string') out['staleComment'] = inner['comment']
  if (typeof abandoned['days'] === 'number') out['abandonedAfterDays'] = abandoned['days']
  if (typeof abandoned['label'] === 'string') out['abandonedLabel'] = abandoned['label']
  if (typeof abandoned['comment'] === 'string') out['abandonedComment'] = abandoned['comment']
  return out
}

/**
 * Converts a v1 configuration into the v2 shape.
 *
 * @remarks
 * v1 labels become `labels`, per-context label conditions become
 * `labelling` rules scoped to that context, and `enforceConventions` becomes
 * `conventions`. With several runners, rule keys are prefixed with the runner
 * index so none collide.
 *
 * @example
 * ```ts import.meta.vitest name="migrateV1"
 * import { migrateV1 } from '@resnovas/config'
 *
 * const { config, warnings } = migrateV1({ labels: [{ name: 'bug', color: 'd73a4a' }] })
 * JSON.stringify(config) // => '{"version":2,"labels":{"bug":{"name":"bug","color":"d73a4a"}}}'
 * warnings.length // => 0
 * ```
 *
 * @param input - The parsed v1 JSON.
 * @returns The v2 config and a warning for everything not carried over.
 */
export const migrateV1 = (input: JsonRecord): Migration => {
  const warnings: Array<string> = []
  const labelling: Record<string, JsonRecord> = {}
  const rules: Record<string, JsonRecord> = {}
  const comment: Record<string, string> = {}
  // Where each comment part came from, so a replaced one can be reported.
  const commentFrom: Record<string, string> = {}
  const takeComment = (setting: JsonRecord, where: string, part: 'header' | 'footer', field: string) => {
    const text = setting[field]
    if (typeof text !== 'string') return
    const earlier = commentFrom[part]
    if (earlier !== undefined && comment[part] !== text) {
      warnings.push(`${earlier}: dropped, v2 has one conventions.comment and ${where}.${field} replaced it`)
    }
    comment[part] = text
    commentFrom[part] = `${where}.${field}`
  }
  const automaticApprove: Record<string, JsonRecord> = {}
  const requestApprovals: Record<string, JsonRecord> = {}
  let stale: JsonRecord | undefined

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
          if (context === 'schedule') {
            warnings.push(`${where}: now evaluated when an issue or pull request event arrives, v2 has no scheduled labelling`)
          }
          for (const [label, when] of Object.entries(setting)) {
            labelling[`${prefix}${context}.${label}`] = on === undefined ? { label, when } : { label, on, when }
          }
        } else if (feature === 'enforceConventions' && isRecord(setting)) {
          takeComment(setting, where, 'header', 'commentHeader')
          takeComment(setting, where, 'footer', 'commentFooter')
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
        } else if (feature === 'stale' && isRecord(setting)) {
          if (stale !== undefined) {
            warnings.push(`${where}: dropped, v2 has one stale section and an earlier context already set it`)
            continue
          }
          stale = migrateStale(setting, on, where, warnings)
        } else if (feature === 'automaticApprove' && isRecord(setting)) {
          const groups = Array.isArray(setting['condition']) ? setting['condition'] : []
          groups.forEach((when, position) => {
            if (isRecord(when)) automaticApprove[`${prefix}${context}.${position}`] = { when }
          })
        } else if (feature === 'requestApprovals' && isRecord(setting)) {
          for (const [name, request] of Object.entries(setting)) {
            if (!isRecord(request) || !Array.isArray(request['reviewers'])) continue
            const { reviewers, requires, condition } = request
            const when: Json = typeof requires === 'number' ? { requires, condition: condition ?? [] } : { condition: condition ?? [] }
            requestApprovals[`${prefix}${context}.${name}`] = { reviewers, when }
          }
        } else {
          warnings.push(`${where}: ${DROPPED[feature] === undefined ? 'unknown v1 key, ignored' : `dropped, ${DROPPED[feature]}`}`)
        }
      }
    }
  })

  const config: Record<string, Json> = { version: 2 }
  const labels = migrateLabels(input['labels'], warnings)
  if (Object.keys(labels).length > 0) config['labels'] = labels
  if (Object.keys(labelling).length > 0) config['labelling'] = labelling
  if (Object.keys(rules).length > 0 || Object.keys(comment).length > 0) {
    config['conventions'] = Object.keys(comment).length > 0 ? { comment, rules } : { rules }
  }
  if (Object.keys(automaticApprove).length > 0 || Object.keys(requestApprovals).length > 0) {
    const reviews: Record<string, Json> = {}
    if (Object.keys(requestApprovals).length > 0) reviews['requestApprovals'] = requestApprovals
    if (Object.keys(automaticApprove).length > 0) reviews['automaticApprove'] = automaticApprove
    config['reviews'] = reviews
  }
  if (stale !== undefined) config['stale'] = stale
  for (const key of Object.keys(input)) {
    if (key !== 'labels' && key !== 'runners' && key !== '$schema') warnings.push(`${key}: unknown v1 key, ignored`)
  }
  return { config, warnings }
}
