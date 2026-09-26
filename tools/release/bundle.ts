/**
 * @file tools/release/bundle.ts
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

// Bundles an app's compiled entry point into a single file with esbuild.
//
//   node tools/release/bundle.ts <project root> <output file>
//
// The app's package.json version is stamped into the bundle as VERSION (see
// apps/cli/src/version.ts). On main it is 0.0.0; the release workflow runs Nx
// release first, which writes the version it is releasing, so the bundle
// carries the version of the tag it is built for. Runs on Node's built-in
// TypeScript support.

import { build } from 'esbuild'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const [projectRoot, outfile] = process.argv.slice(2)
if (projectRoot === undefined || outfile === undefined) {
  console.error('Usage: node tools/release/bundle.ts <project root> <output file>')
  process.exit(1)
}

const { version }: { version: string } = JSON.parse(readFileSync(join(root, projectRoot, 'package.json'), 'utf8'))

await build({
  absWorkingDir: root,
  entryPoints: [join(projectRoot, 'dist/main.js')],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  // Bundled CommonJS dependencies still call require, which ESM does not define.
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  legalComments: 'none',
  define: { 'globalThis.__SMARTCLOUD_VERSION__': JSON.stringify(version) },
  logLevel: 'warning',
})
console.log(`Bundled ${projectRoot} ${version} into ${outfile}.`)
