/**
 * @file tools/typecheck/tests.ts
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

// Type-checks every test project.
//
//   node tools/typecheck/tests.ts
//
// Nx turns off the inferred typecheck target for the test projects, because
// they set noEmit, so without this their type errors would only show up at
// run time, if at all. Runs on Node's built-in TypeScript support.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const tsc = join(root, 'node_modules', '.bin', 'tsc')

const projects = readdirSync(join(root, 'tests'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(root, 'tests', entry.name, 'tsconfig.json')))
  .map((entry) => `tests/${entry.name}`)

// The test projects reference the packages' declaration output, so build
// everything first; Nx serves unchanged projects from its cache.
const build = spawnSync(join(root, 'node_modules', '.bin', 'nx'), ['run-many', '-t', 'build', '--output-style=static'], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'inherit'],
})
if (build.status !== 0) {
  console.error('The build failed, so the tests cannot be type-checked.')
  process.exit(1)
}

const failed: string[] = []
for (const project of projects) {
  // The base config's declaration output does not apply to a project that emits nothing.
  const result = spawnSync(tsc, ['-p', `${project}/tsconfig.json`, '--noEmit', '--declaration', 'false', '--declarationMap', 'false'], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.status !== 0) failed.push(project)
}

if (failed.length > 0) {
  console.error(`Type errors in: ${failed.join(', ')}`)
  process.exit(1)
}
console.log(`All ${projects.length} test projects type-check.`)
