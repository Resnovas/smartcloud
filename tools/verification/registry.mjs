// Synced from Resnovas/.github templates/tools/verification/registry.mjs. Edit it there.
import { createHash } from 'node:crypto'

const nonempty = (value) => typeof value === 'string' && value.trim().length > 0
const strings = (value) => Array.isArray(value) && value.length > 0 && value.every(nonempty) && new Set(value).size === value.length
const demand = (condition, message) => { if (!condition) throw new Error(message) }
const fields = (value, allowed) => demand(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every((key) => allowed.includes(key)), 'Unknown evidence field or invalid object; publish only declared reviewed metadata.')

/** Digest the canonical Markdown bytes so stale evidence cannot certify edited instructions. */
export const digest = (value) => createHash('sha256').update(value).digest('hex')

/** Parse one JSON verification block per feature inside canonical Markdown; never execute its commands here. */
export function parseRegistry(markdown) {
  const blocks = [...markdown.matchAll(/^```verification\r?\n([\s\S]*?)^```\s*$/gm)]
  demand(blocks.length > 0, 'Add a verification block with a reachable interface and observable assertions; an empty registry is not proof.')
  const entries = blocks.map((match) => JSON.parse(match[1]))
  const ids = new Set()
  for (const entry of entries) {
    demand(entry && typeof entry === 'object' && !Array.isArray(entry), 'Each verification block must be a feature object.')
    demand(Object.keys(entry).every((key) => ['id', 'status', 'interfaces', 'command', 'selector', 'assertions', 'evidence', 'reason'].includes(key)), 'Unknown registry field; correct the spelling rather than silently ignoring a contract.')
    demand(/^[a-z][a-z0-9.-]*$/.test(entry.id ?? '') && !ids.has(entry.id), 'Use a unique stable feature id.')
    ids.add(entry.id)
    demand(['implemented', 'blocked', 'unimplemented'].includes(entry.status), `${entry.id}: declare implemented, blocked or unimplemented.`)
    demand(strings(entry.interfaces), `${entry.id}: list the public interfaces from the source inventory.`)
    if (entry.status !== 'implemented') {
      demand(nonempty(entry.reason), `${entry.id}: explain the blocker or missing implementation.`)
      continue
    }
    demand(Array.isArray(entry.command) && entry.command.length > 0 && entry.command.every(nonempty) && nonempty(entry.selector), `${entry.id}: supply exact command arguments and a nonempty test selector.`)
    demand(strings(entry.assertions), `${entry.id}: name observable assertions, not just a successful process exit.`)
    demand(strings(entry.evidence) && entry.evidence.every((kind) => ['log', 'screenshot', 'recording'].includes(kind)), `${entry.id}: choose log, screenshot or recording evidence.`)
  }
  return entries
}

/** Compare registry coverage with interfaces discovered by a repository-owned source adapter. */
export function checkCoverage(entries, inventory) {
  demand(strings(inventory), 'Source inventory is empty or duplicated; discover real entry points before claiming coverage.')
  const registered = entries.flatMap((entry) => entry.interfaces)
  const missing = inventory.filter((name) => !registered.includes(name))
  const stale = registered.filter((name) => !inventory.includes(name))
  demand(!missing.length && !stale.length, `Registry coverage differs from source. Add missing interfaces: ${missing.join(', ') || 'none'}; correct stale interfaces: ${stale.join(', ') || 'none'}.`)
}

/** Reject unknown, duplicate or empty affected selections; blocked features cannot become a passing run. */
export function selectFeatures(entries, ids) {
  demand(strings(ids), 'Select at least one unique affected feature; an empty run is not proof.')
  return ids.map((id) => {
    const entry = entries.find((candidate) => candidate.id === id)
    demand(entry, `Unknown affected feature ${id}; fix the selection or registry.`)
    return entry
  })
}

/** Check evidence claims against independently supplied revision, registry and affected selection. */
export function checkManifest(manifest, { markdown, commit, tree, affected }) {
  fields(manifest, ['version', 'commit', 'tree', 'registryDigest', 'synthetic', 'retentionDays', 'audience', 'affected', 'runs'])
  const selected = selectFeatures(parseRegistry(markdown), affected)
  demand(/^[a-f0-9]{40}$/.test(commit) && /^[a-f0-9]{40}$/.test(tree), 'Supply full source commit and Git tree identities.')
  demand(manifest?.version === 1 && manifest.commit === commit && manifest.tree === tree && manifest.registryDigest === digest(markdown), 'Evidence revision, tree or registry digest is stale; rerun the affected paths.')
  demand(manifest.synthetic === true && manifest.retentionDays === 7 && manifest.audience === 'existing-artifact-audience', 'Evidence must use synthetic data, seven-day retention and the existing artifact audience.')
  demand(strings(manifest.affected) && JSON.stringify([...manifest.affected].sort()) === JSON.stringify([...affected].sort()), 'Evidence affected selection differs from the independently computed change selection.')
  demand(Array.isArray(manifest.runs) && manifest.runs.length === selected.length, 'Record exactly one result per affected feature; empty or extra proof is invalid.')
  const seen = new Set()
  for (const run of manifest.runs) {
    fields(run, ['id', 'status', 'startedAt', 'finishedAt', 'reason', 'command', 'selector', 'tests', 'assertions', 'exitCode', 'files'])
    const entry = selected.find((candidate) => candidate.id === run.id)
    demand(entry && !seen.has(run.id), 'Evidence contains an unknown or duplicate feature.')
    seen.add(run.id)
    demand(['pass', 'fail', 'blocked', 'unimplemented'].includes(run.status), `${run.id}: record the real outcome.`)
    demand(nonempty(run.startedAt) && nonempty(run.finishedAt) && Number.isFinite(Date.parse(run.startedAt)) && Date.parse(run.finishedAt) >= Date.parse(run.startedAt), `${run.id}: record valid execution timestamps.`)
    if (run.status === 'blocked' || run.status === 'unimplemented') {
      demand(nonempty(run.reason), `${run.id}: name the blocker; unavailable proof is not a pass.`)
      demand(run.files === undefined || (Array.isArray(run.files) && run.files.length === 0), `${run.id}: do not attach unvalidated files to a non-executed path.`)
      continue
    }
    demand(entry.status === 'implemented', `${run.id}: blocked or unimplemented registry entries cannot pass or run.`)
    demand(JSON.stringify(run.command) === JSON.stringify(entry.command) && run.selector === entry.selector, `${run.id}: execute the documented command and selector.`)
    demand(Number.isInteger(run.tests) && run.tests > 0, `${run.id}: record a positive executed test count; exit zero alone is empty proof.`)
    demand(Array.isArray(run.assertions) && run.assertions.length === entry.assertions.length && entry.assertions.every((name) => run.assertions.filter((assertion) => assertion?.name === name && typeof assertion.passed === 'boolean').length === 1), `${run.id}: report every documented observable assertion exactly once.`)
    for (const assertion of run.assertions) fields(assertion, ['name', 'passed'])
    demand(Number.isInteger(run.exitCode) && run.exitCode >= 0 && run.exitCode <= 255, `${run.id}: record the process exit code.`)
    const passed = run.exitCode === 0 && run.assertions.every((assertion) => assertion.passed)
    demand((run.status === 'pass') === passed, `${run.id}: status contradicts exit code or assertions.`)
    demand(Array.isArray(run.files) && entry.evidence.every((kind) => run.files.some((file) => file.kind === kind)), `${run.id}: attach each required evidence kind.`)
    for (const file of run.files) {
      fields(file, ['kind', 'path', 'sha256', 'reviewed', 'seconds'])
      demand(entry.evidence.includes(file.kind) && /^[a-zA-Z0-9_./-]+$/.test(file.path) && !file.path.startsWith('/') && !file.path.split('/').some((part) => part === '..' || part === '.' || part === ''), `${run.id}: use relative allowlisted evidence paths and kinds.`)
      demand(/^[a-f0-9]{64}$/.test(file.sha256) && file.reviewed === true, `${run.id}: review/redact each file and record its SHA-256 digest before publication.`)
      if (file.kind === 'recording') demand(Number.isFinite(file.seconds) && file.seconds > 0 && file.seconds <= 60, `${run.id}: recordings must cover the affected interaction within 60 seconds.`)
    }
  }
  return manifest.runs.every((run) => run.status === 'pass')
}
