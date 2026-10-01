#!/usr/bin/env node
// Synced from Resnovas/.github templates/tools/ai-docs/docgen.mjs. Edit it
// there, not here: the next house sync overwrites local edits.
//
// Generates LLMS.md, the one file an AI agent reads to learn this repository,
// from the sources under ai-docs/src.
//
//   node tools/ai-docs/docgen.mjs           write LLMS.md
//   node tools/ai-docs/docgen.mjs --check   exit 1 if LLMS.md is out of date
//
// Why generate it rather than write it by hand: the guidance lives beside
// real examples, as ordinary .ts files the repository's type check compiles,
// so an example that stops compiling fails the build instead of quietly
// teaching an agent an API that no longer exists. One assembled file lets an
// agent read everything in a single pass, and the --check mode in CI stops it
// drifting from its sources. This follows the pattern Effect uses for its own
// LLMS.md; Effect's generator is unpublished, so this is a small
// reimplementation in plain Node, with no dependencies and no TypeScript
// needed to run it.
//
// Conventions:
//
// - A section is a directory under ai-docs/src with an index.md.
// - Numeric prefixes (05_, 10_) order the sections and the examples. 00 to 09
//   belong to the house sections synced from Resnovas/.github; a repository
//   numbers its own from 10.
// - Examples are .ts files beside a section's index.md.
// - An example's title comes from a leading JSDoc block with @title; the rest
//   of that block, other tags aside, becomes the text above the code. Without
//   one, the file name is the title. Block comments before it without a
//   @title, such as the licence header every example carries, are left out.
// - A fixtures directory holds supporting code for the examples and is never
//   rendered, whether it sits under ai-docs/src or inside a section.
// - The house:managed and house:local marker lines of a synced index.md are
//   left out of LLMS.md; the text around them is kept.
//
// The title of LLMS.md is the `name` in package.json, or the repository's
// directory name when there is no package.json.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const SRC = join(ROOT, 'ai-docs', 'src')
const OUT = join(ROOT, 'LLMS.md')

// Files are read with LF endings whatever the checkout used, so the output is
// the same on every platform.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
// Reads a file, or null when it does not exist: read first, no exists check to race.
const readIfExists = (path) => {
  try {
    return read(path)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

const fail = (message) => {
  console.error(`ai-docs: ${message}`)
  process.exit(1)
}

const unprefixed = (name) => name.replace(/^\d+_/, '')

const title = () => {
  const manifest = join(ROOT, 'package.json')
  const text = readIfExists(manifest)
  if (text !== null) {
    const name = JSON.parse(text).name
    if (typeof name === 'string' && name.trim() !== '') return name.trim()
  }
  return basename(ROOT)
}

const marker = /^\s*<!--\s*house:(?:managed:begin|managed:end|local)(?![\w:-]).*-->\s*$/
const withoutMarkers = (text) =>
  text
    .split('\n')
    .filter((line) => !marker.test(line))
    .join('\n')

// Splits an example into its title, the text above the code and the code. The
// JSDoc header is not repeated in the code block, because the reader has just
// seen it as the heading and the text above it.
const splitExample = (source, fallback) => {
  // Leading block comments without a @title are licence headers, whichever
  // opener they use (the house header starts with /** @file), so they go.
  let code = source
  for (let comment; (comment = /^\/\*[\s\S]*?\*\/\s*/.exec(code)) !== null && !comment[0].includes('@title'); ) {
    code = code.slice(comment[0].length)
  }
  const match = /^\/\*\*([\s\S]*?)\*\/\n/.exec(code)
  if (match === null) return { title: fallback, description: '', body: code.trim() }

  const lines = match[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())
  let heading = fallback
  const description = []
  for (const line of lines) {
    const tag = /^@title\s+(.*)$/.exec(line)
    if (tag !== null) heading = tag[1].trim()
    else if (!line.startsWith('@')) description.push(line)
  }
  return {
    title: heading,
    description: description.join('\n').trim(),
    body: code.slice(match[0].length).trim(),
  }
}

const isDirectory = (path) => statSync(path, { throwIfNoEntry: false })?.isDirectory() === true

// Orders by the numeric prefix (so 100_ follows 20_), then by name.
const prefix = (name) => {
  const match = /^(\d+)_/.exec(name)
  return match === null ? Number.POSITIVE_INFINITY : Number(match[1])
}
const byPrefix = (a, b) => prefix(a) - prefix(b) || (a < b ? -1 : a > b ? 1 : 0)

// Collapses runs of blank lines in prose only; example code is kept exactly.
const prose = (text) => text.replace(/\n{3,}/g, '\n\n').trim()

// A fence longer than any run of backticks in the code, so none closes it early.
const fence = (code) => '`'.repeat(Math.max(3, ...(code.match(/`+/g) ?? []).map((run) => run.length + 1)))

const generate = () => {
  if (!isDirectory(SRC)) fail('no ai-docs/src directory')

  const sections = readdirSync(SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'fixtures')
    .map((entry) => entry.name)
    .sort(byPrefix)
  if (sections.length === 0) fail('no sections under ai-docs/src')

  const parts = [
    '<!--',
    '  Generated from ai-docs/src by tools/ai-docs/docgen.mjs. Do not edit by hand:',
    '  edit the sources and run `node tools/ai-docs/docgen.mjs`.',
    '-->',
    '',
    `# ${title()} for agents`,
    '',
    'Guidance for an AI agent working on or with this repository, assembled into one',
    'file so it can be read in a single pass. Each example is a real file under',
    '`ai-docs/src`, kept compiling by the repository type check. The people-facing',
    'documentation covers the same ground in plain words; see the README.',
    '',
  ]
  let examples = 0

  for (const section of sections) {
    const dir = join(SRC, section)
    const index = join(dir, 'index.md')
    if (!existsSync(index)) fail(`ai-docs/src/${section} has no index.md`)
    parts.push('---', '', prose(withoutMarkers(read(index))), '')

    const files = readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
      .map((entry) => entry.name)
      .sort(byPrefix)
    for (const file of files) {
      const example = splitExample(read(join(dir, file)), unprefixed(file).replace(/\.ts$/, ''))
      examples += 1
      parts.push(`### ${example.title}`, '')
      if (example.description !== '') parts.push(prose(example.description), '')
      const marks = fence(example.body)
      parts.push(`${marks}ts`, example.body, marks, '')
    }
  }

  return {
    content: `${parts.join('\n').trim()}\n`,
    sections: sections.length,
    examples,
  }
}

const { content, sections, examples } = generate()
if (process.argv.includes('--check')) {
  const current = readIfExists(OUT)
  if (current !== content) {
    fail(`LLMS.md is ${current === null ? 'missing' : 'out of date'}: run node tools/ai-docs/docgen.mjs and commit the result`)
  }
  console.log('LLMS.md is up to date.')
} else {
  writeFileSync(OUT, content)
  console.log(`LLMS.md written from ${sections} section(s) and ${examples} example(s).`)
}
