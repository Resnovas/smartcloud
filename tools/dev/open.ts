/**
 * @file tools/dev/open.ts
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

// Opens a file or URL in the system's default app, for the editor tasks that
// show generated output such as the code graph.
//
//   node tools/dev/open.ts graphify-out/graph.html

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const target = process.argv[2]
if (target === undefined) {
  console.error('usage: node tools/dev/open.ts <file or url>')
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
spawn(opener ?? 'xdg-open', args, { detached: true, stdio: 'ignore' }).unref()
console.log(`Opened ${location}`)
