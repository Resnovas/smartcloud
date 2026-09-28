#!/usr/bin/env node
// Synced from Resnovas/.github templates/tools/license/check-headers.mjs. Edit
// it there, not here: the next house sync overwrites local edits.
//
// Checks that every source file starts with the licence header in
// tools/license/header.txt, identical except for its @file line and the year,
// which is always the current year (house standard coding-preferences,
// references/licensing.md).
//
//   node tools/license/check-headers.mjs          report files without the header, or with an old year
//   node tools/license/check-headers.mjs --fix    add or correct the header
//
// Skipped: generated and vendored directories, .d.ts files, and files synced
// from the house (a "Synced from Resnovas/.github" line near the top), which
// carry no header because the sync would overwrite one. A repository lists
// further paths to skip in tools/license/ignore, one regular expression a line,
// matched against the path from the repository root.
//
// Runs on any Node and needs no dependencies and no build step.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = /\.(ts|mts|cts|js|mjs|cjs|tsx|jsx)$/
const GENERATED = /^(graphify-out|node_modules|dist|externals|coverage|test-output|out-tsc|release|tmp|\.nx)\/|\/(dist|node_modules|coverage|test-output|out-tsc)\/|\.d\.ts$/
const SYNCED = /Synced from Resnovas\/\.github/
// A header already present, possibly for another file name or year.
const EXISTING = /^\/\*\*\r?\n \* @file [^\n]*\n[\s\S]*?DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE\.\r?\n \*\/\r?\n?/
const IGNORED_DIRECTORIES = new Set(['.git', '.nx', 'node_modules', 'dist', 'release', 'coverage', 'out-tsc', 'test-output', 'tmp', 'externals', 'graphify-out'])

/**
 * The header a file must start with.
 *
 * @param {string} template - The contents of header.txt.
 * @param {string} file - The path from the repository root.
 * @param {string} year - The current year.
 */
export const headerFor = (template, file, year) => template.trimEnd().replace('__FILE__', file).replace('__YEAR__', year)

/**
 * Checks, and with fix rewrites, the source files under root.
 *
 * @param {string} root - The repository root.
 * @param {{ fix?: boolean, year?: string, files?: string[] }} options
 * @returns {{ checked: number, wrong: string[] }} The files without the current header.
 */
export const checkHeaders = (root, { fix = false, year = String(new Date().getFullYear()), files } = {}) => {
  const template = readFileSync(join(root, 'tools/license/header.txt'), 'utf8')
  const ignore = join(root, 'tools/license/ignore')
  const extra = existsSync(ignore)
    ? readFileSync(ignore, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '' && !line.startsWith('#'))
        .map((line) => new RegExp(line))
    : []
  const skip = (file) => GENERATED.test(file) || extra.some((pattern) => pattern.test(file))
  const candidates = (files ?? listFiles(root)).filter((file) => SOURCE.test(file) && !skip(file) && existsSync(join(root, file)))
  const wrong = []
  let checked = 0
  for (const file of candidates) {
    const text = readFileSync(join(root, file), 'utf8')
    const shebang = text.startsWith('#!') ? text.slice(0, text.indexOf('\n') + 1) : ''
    const body = text.slice(shebang.length)
    if (SYNCED.test(body.split('\n').slice(0, 6).join('\n'))) continue
    checked += 1
    const header = headerFor(template, file, year)
    if (body.replaceAll('\r\n', '\n').startsWith(`${header}\n`)) continue
    wrong.push(file)
    if (fix) {
      const rest = body.replace(EXISTING, '').replace(/^\n+/, '')
      writeFileSync(join(root, file), `${shebang}${header}\n\n${rest}`)
    }
  }
  return { checked, wrong }
}

// Walks the tree when there is no git checkout, skipping what git would ignore.
const walk = (root, directory) =>
  readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = directory === '' ? entry.name : `${directory}/${entry.name}`
    if (entry.isDirectory()) return IGNORED_DIRECTORIES.has(entry.name) ? [] : walk(root, path)
    return entry.isFile() ? [path] : []
  })

const listFiles = (root) => {
  try {
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).split('\n')
  } catch {
    return walk(root, '')
  }
}

const main = () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const fix = process.argv.includes('--fix')
  const { checked, wrong } = checkHeaders(root, { fix })
  if (fix) {
    console.log(`Headers written to ${wrong.length} file(s).`)
    return 0
  }
  if (wrong.length > 0) {
    console.error(`Missing or outdated licence header (run: node tools/license/check-headers.mjs --fix):\n  ${wrong.join('\n  ')}`)
    return 1
  }
  console.log(`All ${checked} source files carry the licence header for ${new Date().getFullYear()}.`)
  return 0
}

if (process.argv[1] !== undefined && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exit(main())
}
