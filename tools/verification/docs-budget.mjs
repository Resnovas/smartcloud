// Synced from Resnovas/.github templates/tools/verification/docs-budget.mjs. Edit it there.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Remove only balanced generator-owned regions outside Markdown code fences. Malformed boundaries retain every byte. */
function authoredText(text) {
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? []
  const authored = []
  let region
  let fence
  for (const line of lines) {
    const value = line.replace(/\r?\n$/, '')
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(value)
    if (delimiter) {
      if (!fence) fence = delimiter[1]
      else if (delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = undefined
      if (!region) authored.push(line)
      continue
    }
    const marker = !fence && /^<!-- (linear|planning):generated:(start|end) -->$/.exec(value)
    if (marker) {
      if (marker[2] === 'start' && !region) region = marker[1]
      else if (marker[2] === 'end' && region === marker[1]) region = undefined
      else return text
    } else if (!region) authored.push(line)
  }
  return region ? text : authored.join('')
}

/** Bound editable Markdown, not generated mirrors, vendor documentation or legal text. */
export function checkDocs(root) {
  // Scope before buffering, and do not impose a fixed output cap on large documentation inventories.
  const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', 'AGENTS.md', 'CONTRIBUTING.md', 'README.md', ':(glob)docs/**/*.md', ':(glob)ai-docs/src/**/*.md'], { cwd: root, encoding: 'utf8', maxBuffer: Infinity }).split('\0')
  const findings = []
  for (const path of new Set(files)) {
    if (!/^(?:AGENTS\.md|CONTRIBUTING\.md|README\.md|docs\/.*\.md|ai-docs\/src\/.*\.md)$/.test(path)) continue
    // Archives are immutable provenance, not current instructions. No caller-supplied exclusions.
    if (/^docs\/archive\//.test(path)) continue
    if (!existsSync(resolve(root, path))) continue
    const text = readFileSync(resolve(root, path), 'utf8')
    const managed = path === 'AGENTS.md' ? text.split('<!-- house:managed:end -->')[0] : text
    const authored = path.startsWith('docs/') ? authoredText(managed) : managed
    const lines = authored.trimEnd().split('\n').length
    const bytes = Buffer.byteLength(authored)
    const maxLines = path === 'AGENTS.md' ? 120 : 400
    const maxBytes = path === 'AGENTS.md' ? 16000 : 32000
    if (lines > maxLines || bytes > maxBytes) findings.push(`${path}: ${lines}/${maxLines} lines, ${bytes}/${maxBytes} bytes. Condense, split by task, or archive obsolete content and update links; do not raise the budget.`)
  }
  return findings
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const findings = checkDocs(process.cwd())
  for (const finding of findings) console.error(finding)
  process.exitCode = findings.length ? 1 : 0
  if (!findings.length) console.log('Editable Markdown is within the house budgets.')
}
