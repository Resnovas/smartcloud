/**
 * @file tools/license/check-headers.ts
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

// Checks that every v2 source file starts with the canonical FCL-1.0-MIT
// header from header.txt, identical except for its @file line.
//
//   node tools/license/check-headers.ts          report files without the header
//   node tools/license/check-headers.ts --fix    add or correct the header
//
// Runs on Node's built-in TypeScript support, so it needs no build step.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const template = readFileSync(join(root, 'tools/license/header.txt'), 'utf8').trimEnd()
const fix = process.argv.includes('--fix')

const SOURCE = /\.(ts|mts|cts|js|mjs|cjs)$/
const EXCLUDED = /^(legacy|graphify-out|node_modules)\/|\/dist\/|\.d\.ts$/

const header = (file: string) => template.replace('{{FILE}}', file)

// A header already present, possibly for another file name after a move.
const EXISTING = /^\/\*\*\n \* @file [^\n]*\n[\s\S]*?DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE\.\n \*\/\n?/

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter((file) => SOURCE.test(file) && !EXCLUDED.test(file))

const wrong: string[] = []
for (const file of tracked) {
  const text = readFileSync(join(root, file), 'utf8')
  const shebang = text.startsWith('#!') ? text.slice(0, text.indexOf('\n') + 1) : ''
  const body = text.slice(shebang.length)
  if (body.startsWith(`${header(file)}\n`)) continue
  wrong.push(file)
  if (fix) {
    const rest = body.replace(EXISTING, '').replace(/^\n+/, '')
    writeFileSync(join(root, file), `${shebang}${header(file)}\n\n${rest}`)
  }
}

if (wrong.length > 0 && !fix) {
  console.error(`Missing or outdated licence header (run: pnpm headers:fix):\n  ${wrong.join('\n  ')}`)
  process.exit(1)
}
console.log(fix ? `Headers written to ${wrong.length} file(s).` : `All ${tracked.length} source files carry the licence header.`)
