/**
 * @file packages/feature.sync/src/managed.ts
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

import { unquote } from './values.js'

// Managed blocks: how a synced config file stays extendable.
//
// A template containing a `house:managed:begin` ... `house:managed:end` pair
// is extendable. The sync only ever replaces the lines between the markers;
// everything a repository adds outside them is kept. A `house:local` line in
// the template marks where local additions belong, and is where a file's
// previous content is parked the first time it is adopted.
//
// A template without markers is fully managed: the whole file is synced.
//
// Everything here reads files from pull requests, which are attacker
// controlled, so lines are parsed with string operations and anchored
// patterns that cannot backtrack, keeping every check linear.

/**
 * Opens the managed block.
 *
 * @example
 * ```ts import.meta.vitest name="BEGIN"
 * import { BEGIN } from '@resnovas/feature.sync'
 *
 * BEGIN // => 'house:managed:begin'
 * ```
 */
export const BEGIN = 'house:managed:begin'
/**
 * Closes the managed block.
 *
 * @example
 * ```ts import.meta.vitest name="END"
 * import { END } from '@resnovas/feature.sync'
 *
 * END // => 'house:managed:end'
 * ```
 */
export const END = 'house:managed:end'
/**
 * Marks where a repository's own additions go.
 *
 * @example
 * ```ts import.meta.vitest name="LOCAL"
 * import { LOCAL } from '@resnovas/feature.sync'
 *
 * LOCAL // => 'house:local'
 * ```
 */
export const LOCAL = 'house:local'

const MARKER_FOLLOWER = /^[\w:-]$/

/**
 * Whether a line is a marker comment.
 *
 * @remarks
 * A marker only counts on a comment line: `# ...` in YAML and CODEOWNERS, or
 * `<!-- ...` in Markdown. A document that merely mentions a marker in its
 * prose, as GOVERNANCE does, stays a whole-file document. The marker must
 * not run on into a longer word, so `house:managed:beginning` is not one.
 *
 * @example
 * ```ts import.meta.vitest name="isMarker"
 * import { BEGIN, isMarker } from '@resnovas/feature.sync'
 *
 * isMarker('# house:managed:begin', BEGIN) // => true
 * isMarker('See house:managed:begin in GOVERNANCE.', BEGIN) // => false
 * ```
 *
 * @param line - The line.
 * @param marker - {@link BEGIN}, {@link END} or {@link LOCAL}.
 * @returns Whether the line is that marker.
 */
export const isMarker = (line: string, marker: string): boolean => {
  const text = line.trimStart()
  const opener = text.startsWith('#') ? 1 : text.startsWith('<!--') ? 4 : 0
  if (opener === 0) return false
  const body = text.slice(opener).trimStart()
  return body.startsWith(marker) && !MARKER_FOLLOWER.test(body.charAt(marker.length))
}

/** A file split around its managed block, as lines. */
export interface ManagedParts {
  readonly before: ReadonlyArray<string>
  /** The managed block, markers included. */
  readonly block: ReadonlyArray<string>
  readonly after: ReadonlyArray<string>
}

/**
 * Splits a file around its managed block.
 *
 * @example
 * ```ts import.meta.vitest name="splitManaged"
 * import { splitManaged } from '@resnovas/feature.sync'
 *
 * splitManaged('# house:managed:begin\na: 1\n# house:managed:end\n') === undefined // => false
 * splitManaged('no block here\n') // => undefined
 * ```
 *
 * @param text - The file.
 * @returns The parts, or undefined when the file has no well-formed block.
 */
export const splitManaged = (text: string): ManagedParts | undefined => {
  const lines = text.split('\n')
  const begin = lines.findIndex((line) => isMarker(line, BEGIN))
  const end = lines.findIndex((line) => isMarker(line, END))
  if (begin === -1 || end === -1 || end < begin) return undefined
  return { before: lines.slice(0, begin), block: lines.slice(begin, end + 1), after: lines.slice(end + 1) }
}

const isMarkdown = (path: string) => path.endsWith('.md')

const commentOut = (lines: ReadonlyArray<string>, path: string): ReadonlyArray<string> =>
  isMarkdown(path)
    ? ['<!--', ...lines.map((line) => line.replaceAll('-->', '-- >')), '-->']
    : lines.map((line) => (line === '' ? '#' : `# ${line}`))

const LEGACY =
  'Previous content of this file, kept when it was first synced. Re-add what is still needed as local rules, then delete this.'

const legacyNotice = (path: string) => (isMarkdown(path) ? `<!-- ${LEGACY} -->` : `# ${LEGACY}`)

const withoutTrailingNewlines = (text: string) => {
  let end = text.length
  while (end > 0 && text[end - 1] === '\n') end--
  return text.slice(0, end)
}

/**
 * Combines a freshly rendered template with the repository's current file.
 *
 * @remarks
 * A template without markers replaces the file whole. With markers, the
 * current file's managed block is replaced and everything around it kept.
 * The first time a file the repository already had is adopted, its content
 * is kept commented out at the `house:local` line (or at the end), so
 * nothing is lost silently.
 *
 * @example
 * ```ts import.meta.vitest name="mergeManaged"
 * import { mergeManaged } from '@resnovas/feature.sync'
 *
 * const template = '# house:managed:begin\nversion: 2\n# house:managed:end\n# house:local\n'
 * mergeManaged(template, null, '.github/dependabot.yml') // => template
 * ```
 *
 * @param rendered - The template after placeholder substitution.
 * @param existing - The file in the repository, or null if it does not exist.
 * @param path - The file's path, which decides the comment syntax.
 * @returns The merged file.
 */
export const mergeManaged = (rendered: string, existing: string | null, path: string): string => {
  const template = splitManaged(rendered)
  if (template === undefined || existing === null) return rendered
  const current = splitManaged(existing)
  if (current !== undefined) return [...current.before, ...template.block, ...current.after].join('\n')

  const lines = rendered.split('\n')
  const at = lines.findIndex((line) => isMarker(line, LOCAL))
  const legacy = [legacyNotice(path), ...commentOut(withoutTrailingNewlines(existing).split('\n'), path)]
  const insertAt = at === -1 ? lines.length : at + 1
  return [...lines.slice(0, insertAt), ...legacy, ...lines.slice(insertAt)].join('\n')
}

const isComment = (line: string) => {
  const text = line.trimStart()
  return text.startsWith('#') || text.startsWith('<!--') || text.startsWith('-->')
}

const meaningful = (lines: ReadonlyArray<string>) => lines.filter((line) => line.trim() !== '' && !isComment(line))

// A key, bare or in matching single or double quotes, then optional blanks
// and a colon: `"github":` and `github :` both name the key `github`. The
// quantifiers stop at characters they exclude, so matching stays linear.
const TOP_LEVEL_KEY = /^(["']?)([A-Za-z_][\w-]*)\1[ \t]*:/

const topLevelKeys = (lines: ReadonlyArray<string>): ReadonlySet<string> =>
  new Set(lines.flatMap((line) => TOP_LEVEL_KEY.exec(line)?.[2] ?? []))

const isIndented = (line: string) => line !== '' && line.charAt(0).trim() === ''

// The value of `key: value` on an indented line, or undefined when the line
// is another key or the value is empty.
const indentedValue = (line: string, keys: ReadonlyArray<string>): string | undefined => {
  if (!isIndented(line)) return undefined
  const text = line.trimStart()
  const key = keys.find((candidate) => text.startsWith(`${candidate}:`))
  if (key === undefined) return undefined
  const value = text.slice(key.length + 1).trim()
  return value === '' ? undefined : value
}

// A list item starting a Dependabot update: `- package-ecosystem: npm`.
const ecosystemOf = (line: string): string | undefined => {
  const text = line.trimStart()
  if (!text.startsWith('-') || !isIndented(text.slice(1))) return undefined
  const item = text.slice(1).trimStart()
  if (!item.startsWith('package-ecosystem:')) return undefined
  const value = item.slice('package-ecosystem:'.length).trim()
  return value === '' ? undefined : value
}

interface DependabotEntry {
  readonly ecosystem: string
  directories: Array<string>
  branch: string
  /** Whether the lines that follow are items of a `directories:` block list. */
  listing: boolean
}

// `[/a, "/b"]`, a flow list, or a single directory.
const directoryList = (value: string): Array<string> =>
  value.startsWith('[') && value.endsWith(']')
    ? value
        .slice(1, -1)
        .split(',')
        .map((item) => unquote(item.trim()))
        .filter((item) => item !== '')
    : [unquote(value)]

// A `- /path` item of a block list, or undefined for any other line.
const listItem = (line: string): string | undefined => {
  const text = line.trim()
  return text.startsWith('- ') ? unquote(text.slice(2).trim()) : undefined
}

// Dependabot identifies an update by ecosystem, directory and target branch;
// a duplicate is a configuration error. An update listing several
// `directories` covers each of them, so it is one entry per directory and
// overlaps any update covering one of the same.
const dependabotEntries = (lines: ReadonlyArray<string>): ReadonlyArray<string> => {
  const entries: Array<DependabotEntry> = []
  let current: DependabotEntry | undefined
  for (const line of lines) {
    const ecosystem = ecosystemOf(line)
    if (ecosystem !== undefined) {
      current = { ecosystem: unquote(ecosystem), directories: ['/'], branch: '', listing: false }
      entries.push(current)
      continue
    }
    if (current === undefined) continue
    const item = current.listing ? listItem(line) : undefined
    if (item !== undefined) {
      current.directories.push(item)
      continue
    }
    current.listing = false
    const directory = indentedValue(line, ['directory', 'directories'])
    if (directory !== undefined) current.directories = directoryList(directory)
    else if (isIndented(line) && line.trim() === 'directories:') {
      current.directories = []
      current.listing = true
    }
    const branch = indentedValue(line, ['target-branch'])
    if (branch !== undefined) current.branch = unquote(branch)
  }
  return entries.flatMap((entry) =>
    entry.directories.map((directory) => `${entry.ecosystem} in ${directory}${entry.branch === '' ? '' : ` on ${entry.branch}`}`),
  )
}

const firstWord = (value: string) => {
  let end = 0
  while (end < value.length && value.charAt(end).trim() !== '') end++
  return value.slice(0, end)
}

const ids = (lines: ReadonlyArray<string>) =>
  lines.flatMap((line) => {
    const value = indentedValue(line, ['id'])
    return value === undefined ? [] : [unquote(firstWord(value))]
  })

const JOBS = /^jobs:\s*$/
const JOB = /^ {2}([\w-]+):\s*$/

// Workflow job ids are the two-space keys under `jobs:`.
const jobIds = (lines: ReadonlyArray<string>) => {
  const start = lines.findIndex((line) => JOBS.test(line))
  if (start === -1) return []
  return lines.slice(start + 1).flatMap((line) => JOB.exec(line)?.[1] ?? [])
}

const isYaml = (path: string) => path.endsWith('.yml') || path.endsWith('.yaml')

// Issue and discussion forms give their fields ids; a workflow's step ids
// are its own business and may repeat the template's.
const isForm = (path: string) => isYaml(path) && (path.includes('ISSUE_TEMPLATE/') || path.includes('DISCUSSION_TEMPLATE/'))

const isDependabot = (path: string) => path.endsWith('dependabot.yml') || path.endsWith('dependabot.yaml')

/**
 * Local additions that would change or break the synced rules.
 *
 * @remarks
 * Checks that nothing follows a managed block that must come last (as in
 * CODEOWNERS, where the last matching rule wins); that local YAML does not
 * redefine a synced top-level key, issue form field id or workflow job; and
 * that a local Dependabot update does not duplicate a synced one.
 *
 * @example
 * ```ts import.meta.vitest name="managedConflicts"
 * import { managedConflicts } from '@resnovas/feature.sync'
 *
 * const synced = '# house:managed:begin\nversion: 2\n# house:managed:end\n# house:local\n'
 * managedConflicts('.github/dependabot.yml', synced, synced).length // => 0
 * ```
 *
 * @param path - The file's path.
 * @param rendered - The rendered template.
 * @param current - The file as it is, or would be after a sync.
 * @returns Human-readable problems, empty when there are none or either side has no managed block.
 */
export const managedConflicts = (path: string, rendered: string, current: string): ReadonlyArray<string> => {
  const template = splitManaged(rendered)
  const local = splitManaged(current)
  if (template === undefined || local === undefined) return []
  const problems: Array<string> = []
  const localLines = [...local.before, ...local.after]
  const templateLocalIsBefore = template.before.some((line) => isMarker(line, LOCAL))

  if (templateLocalIsBefore && meaningful(local.after).length > 0) {
    problems.push('local rules after the managed block would override it; move them above the block')
  }

  if (isYaml(path)) {
    const managed = topLevelKeys(template.block)
    for (const key of topLevelKeys(localLines)) {
      if (managed.has(key)) problems.push(`redefines the synced key "${key}"`)
    }
    if (isForm(path)) {
      const managedIds = new Set(ids(template.block))
      for (const id of ids(localLines)) {
        if (managedIds.has(id)) problems.push(`reuses the synced field id "${id}"`)
      }
    }
    // A workflow's managed block ends inside `jobs:`, so local jobs follow it.
    const managedJobs = new Set(jobIds(template.block))
    for (const job of jobIds(['jobs:', ...local.after])) {
      if (managedJobs.has(job)) problems.push(`redefines the synced job "${job}"`)
    }
  }

  if (isDependabot(path)) {
    const managed = new Set(dependabotEntries(template.block))
    for (const entry of dependabotEntries(localLines)) {
      if (managed.has(entry)) problems.push(`duplicates the synced Dependabot update for ${entry}`)
    }
  }
  return problems
}

/** A synced file as the pull request check sees it. */
export interface SyncedFile {
  readonly path: string
  /** The rendered template. */
  readonly rendered: string
  /** The file on the base branch, or null if absent. */
  readonly base: string | null
  /** The file in the pull request, or null if absent. */
  readonly head: string | null
}

/** A pull request's change to synced content that is not allowed. */
export interface SyncFinding {
  readonly path: string
  readonly message: string
  /** Set when a local rule conflicts with synced content: the fix is in this repository, not the source. */
  readonly local?: true
}

/**
 * Findings for a pull request that edits synced content.
 *
 * @remarks
 * A change is allowed when it leaves synced content as it was on the base
 * branch, or brings it in line with the latest templates (a sync). Local
 * rules outside a managed block may be added, unless they conflict with
 * the synced ones ({@link managedConflicts}).
 *
 * @example
 * ```ts import.meta.vitest name="syncFindings"
 * import { syncFindings } from '@resnovas/feature.sync'
 *
 * const findings = syncFindings([{ path: 'LICENSE', rendered: 'MIT\n', base: 'MIT\n', head: 'Apache\n' }])
 * findings.length // => 1
 * ```
 *
 * @param files - The synced files, with their base and head content.
 * @returns The findings, in file order.
 */
export const syncFindings = (files: ReadonlyArray<SyncedFile>): ReadonlyArray<SyncFinding> => {
  const findings: Array<SyncFinding> = []
  for (const { path, rendered, base, head } of files) {
    const template = splitManaged(rendered)
    if (head === null) {
      if (base !== null) findings.push({ path, message: 'deletes a synced file' })
      continue
    }
    if (template === undefined) {
      if (head !== base && head !== rendered) findings.push({ path, message: 'edits a synced file' })
      continue
    }
    const headParts = splitManaged(head)
    if (headParts === undefined) {
      if (head !== base) findings.push({ path, message: 'removes the house:managed markers' })
      continue
    }
    const baseBlock = base === null ? undefined : splitManaged(base)?.block.join('\n')
    const headBlock = headParts.block.join('\n')
    if (headBlock !== baseBlock && headBlock !== template.block.join('\n')) {
      findings.push({ path, message: 'edits the managed block; add local rules outside it' })
    }
    // Only conflicts the pull request introduces: one already on the base
    // branch is reported by the scheduled sync, and would otherwise fail the
    // sync's own pull request, which keeps local rules as they are.
    const existing = new Set(base === null ? [] : managedConflicts(path, rendered, base))
    for (const problem of managedConflicts(path, rendered, head)) {
      if (!existing.has(problem)) findings.push({ path, message: problem, local: true })
    }
  }
  return findings
}
