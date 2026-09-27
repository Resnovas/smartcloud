/**
 * @file tools/docs/config-reference.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
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

// Renders the configuration reference page from the committed JSON Schema,
// so the docs list exactly the keys the config accepts.
//
//   node tools/docs/config-reference.ts          write docs/reference/configuration.mdx
//   node tools/docs/config-reference.ts --check  exit 1 when the page is stale
//
// Runs on Node's built-in TypeScript support, so it needs no build step.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

interface JsonSchema {
  readonly $ref?: string
  readonly type?: string | ReadonlyArray<string>
  readonly title?: string
  readonly description?: string
  readonly enum?: ReadonlyArray<unknown>
  readonly default?: unknown
  readonly pattern?: string
  readonly minimum?: number
  readonly minLength?: number
  readonly minItems?: number
  readonly required?: ReadonlyArray<string>
  readonly properties?: Readonly<Record<string, JsonSchema>>
  readonly patternProperties?: Readonly<Record<string, JsonSchema>>
  readonly additionalProperties?: boolean | JsonSchema
  readonly propertyNames?: JsonSchema
  readonly items?: JsonSchema | ReadonlyArray<JsonSchema>
  readonly anyOf?: ReadonlyArray<JsonSchema>
  readonly $defs?: Readonly<Record<string, JsonSchema>>
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SCHEMA = 'schema/smartcloud.schema.json'
const PAGE = 'docs/reference/configuration.mdx'
const ROOT_DEF = 'SmartcloudConfig'

const schema = JSON.parse(readFileSync(join(root, SCHEMA), 'utf8')) as JsonSchema
const defs = schema.$defs ?? {}

// Effect adds generic titles and descriptions to its refinements ("int",
// "an integer"); they say nothing a reader needs, so they are left out.
const GENERIC_TITLES = new Set(['int', 'nonNegative', 'nonEmptyString'])
const GENERIC_DESCRIPTIONS = new Set(['an integer', 'a non-negative number'])

// The same slugs Mintlify gives headings: lower case, punctuation dropped,
// spaces as hyphens.
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, '')
    .replaceAll(' ', '-')

const refName = (ref: string) => ref.replace('#/$defs/', '')

// Text outside code must not open JSX or an MDX expression.
const prose = (text: string) => text.replaceAll('{', '\\{').replaceAll('}', '\\}').replaceAll('<', '&lt;')

// Pipes end a table cell, even inside code.
const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll('\n', ' ')

const code = (value: unknown) => `\`${typeof value === 'string' ? value : JSON.stringify(value)}\``

const link = (ref: string) => {
  const name = refName(ref)
  return `[${name}](#${slug(name)})`
}

// Effect nests unions of unions; a reader wants one flat list.
const flatten = (options: ReadonlyArray<JsonSchema>): ReadonlyArray<JsonSchema> =>
  options.flatMap((option) => (option.anyOf === undefined ? [option] : flatten(option.anyOf)))

/**
 * Describes a schema's type in a few words, linking named definitions.
 *
 * @param node - The schema.
 * @returns Markdown for a table cell.
 */
const typeOf = (node: JsonSchema): string => {
  if (node.$ref !== undefined) return link(node.$ref)
  if (node.enum !== undefined)
    return node.enum.length === 1 ? code(node.enum[0]) : `one of ${node.enum.map(code).join(', ')}`
  if (node.anyOf !== undefined) return `any of ${flatten(node.anyOf).map(typeOf).join(', ')}`
  if (node.type === 'array') {
    if (Array.isArray(node.items)) return `a one-item list of ${node.items.map(typeOf).join(', ')}`
    return node.items === undefined ? 'list' : `list of ${typeOf(node.items as JsonSchema)}`
  }
  if (node.type === 'object') {
    const values =
      Object.values(node.patternProperties ?? {})[0] ??
      (typeof node.additionalProperties === 'object' ? node.additionalProperties : undefined)
    if (values !== undefined && Object.keys(node.properties ?? {}).length === 0) {
      const keys = node.propertyNames === undefined ? 'string' : typeOf(node.propertyNames)
      return `map of ${keys} to ${typeOf(values)}`
    }
    return 'object'
  }
  if (node.type === 'integer') return 'integer'
  return Array.isArray(node.type) ? node.type.join(' or ') : (node.type ?? 'any')
}

/**
 * The notes for a schema: its description and its constraints.
 *
 * @param node - The schema.
 * @returns Plain sentences, possibly empty.
 */
const notesOf = (node: JsonSchema): string => {
  const notes: Array<string> = []
  if (node.description !== undefined && !GENERIC_DESCRIPTIONS.has(node.description)) notes.push(prose(node.description))
  if (node.pattern !== undefined) notes.push(`Pattern: ${code(node.pattern)}.`)
  if (node.minimum !== undefined) notes.push(`Minimum: ${node.minimum}.`)
  if (node.minLength !== undefined && node.minLength > 0) notes.push(`At least ${node.minLength} character(s).`)
  if (node.minItems !== undefined && node.minItems > 0) notes.push(`At least ${node.minItems} item(s).`)
  if (node.default !== undefined) notes.push(`Default: ${code(node.default)}.`)
  if (node.propertyNames?.pattern !== undefined) notes.push(`Keys match ${code(node.propertyNames.pattern)}.`)
  return notes.join(' ')
}

interface Row {
  readonly key: string
  readonly type: string
  readonly required: boolean
  readonly notes: string
}

// Inline objects are flattened into dotted keys, so every key appears in the
// table of the section that owns it.
const rowsOf = (node: JsonSchema, prefix = ''): ReadonlyArray<Row> =>
  Object.entries(node.properties ?? {}).flatMap(([key, property]) => {
    const path = `${prefix}${key}`
    const row: Row = {
      key: path,
      type: typeOf(property),
      required: (node.required ?? []).includes(key),
      notes: notesOf(property),
    }
    const nested =
      property.$ref === undefined && property.type === 'object' && Object.keys(property.properties ?? {}).length > 0
    return nested ? [row, ...rowsOf(property, `${path}.`)] : [row]
  })

const table = (rows: ReadonlyArray<Row>) =>
  [
    '| Key | Type | Required | Notes |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (row) => `| ${cell(code(row.key))} | ${cell(row.type)} | ${row.required ? 'yes' : 'no'} | ${cell(row.notes)} |`,
    ),
  ].join('\n')

/**
 * Renders one named definition as a section.
 *
 * @param name - The definition's name.
 * @param node - Its schema.
 * @returns MDX for the section.
 */
const section = (name: string, node: JsonSchema): string => {
  const lines = [`### ${name}`, '']
  if (node.title !== undefined && !GENERIC_TITLES.has(node.title)) lines.push(`**${prose(node.title)}**`, '')
  const notes = notesOf(node)
  if (notes !== '') lines.push(notes, '')
  const rows = rowsOf(node)
  if (rows.length > 0) {
    lines.push(table(rows), '')
    if (node.additionalProperties === false) lines.push('Other keys are an error.', '')
  } else {
    lines.push(`Type: ${typeOf(node)}.`, '')
  }
  return lines.join('\n')
}

const CONDITION = /^(\$(and|or|not|only)|[a-z][A-Za-z]*)$/

/**
 * Renders the whole page.
 *
 * @returns The page's MDX.
 */
export const render = (): string => {
  const top = defs[ROOT_DEF] ?? {}
  const names = Object.keys(defs).filter((name) => name !== ROOT_DEF)
  const conditions = names.filter((name) => CONDITION.test(name))
  const types = names.filter((name) => !CONDITION.test(name))
  return [
    '---',
    'title: "Configuration reference"',
    'description: "Every key smartcloud accepts in .github/smartcloud.yml, generated from the JSON Schema."',
    '---',
    '',
    `{/* Generated by tools/docs/config-reference.ts from ${SCHEMA}. Do not edit by hand: run pnpm docs:reference. */}`,
    '',
    `This page is generated from [\`${SCHEMA}\`](https://github.com/Resnovas/smartcloud/blob/main/${SCHEMA}), which is generated from the Effect Schema in \`packages/config\`. The guides explain what each section does; this page lists every key.`,
    '',
    '## Top level',
    '',
    top.description === undefined ? '' : `${prose(top.description)}\n`,
    table(rowsOf(top)),
    '',
    'Other keys are an error.',
    '',
    '## Types',
    '',
    ...types.map((name) => section(name, defs[name] ?? {})),
    '## Conditions',
    '',
    'Each condition is an object with a `type` naming it. See [Conditions](/conditions) for how groups and combinators evaluate.',
    '',
    ...conditions.map((name) => section(name, defs[name] ?? {})),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
    .concat('\n')
}

const page = render()
const target = join(root, PAGE)

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(target, 'utf8')
  } catch {
    // A missing page is as stale as an outdated one.
  }
  if (current !== page) {
    console.error(`${PAGE} is out of date with ${SCHEMA} (run: pnpm docs:reference).`)
    process.exit(1)
  }
  console.log(`${PAGE} is up to date.`)
} else {
  writeFileSync(target, page)
  console.log(`Wrote ${PAGE}.`)
}
