#!/usr/bin/env node
// Synced from Resnovas/.github templates/tools/dev/open.mjs. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Opens a file or URL in the system's default app, for the editor tasks that
// show generated output such as the code graph.
//
//   node tools/dev/open.mjs graphify-out/graph.html

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const target = process.argv[2]
if (target === undefined) {
  console.error('usage: node tools/dev/open.mjs <file or url>')
  process.exit(2)
}
const isUrl = /^[a-z]+:\/\//.test(target)
if (!isUrl && !existsSync(target)) {
  console.error(`${target} does not exist.`)
  process.exit(1)
}
const location = isUrl ? target : resolve(target)
const [opener, ...args] =
  process.platform === 'darwin'
    ? ['open', location]
    : process.platform === 'win32'
      ? ['explorer.exe', location]
      : ['xdg-open', location]
spawn(opener, args, { detached: true, stdio: 'ignore' }).unref()
console.log(`Opened ${location}`)
