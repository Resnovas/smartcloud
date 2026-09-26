/**
 * @file tools/dev/docs.ts
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

// Serves the Mintlify docs under docs/ locally, for review before a change
// ships. Extra arguments go to `mint dev` (for example `--port 3333`).
//
//   node tools/dev/docs.ts
//
// The Mintlify CLI is fetched once into pnpm's dlx cache rather than added to
// the workspace, so CI never installs it. pnpm refuses dlx installs whose build
// scripts are not approved, so the three the CLI needs are approved here; Scarf
// is install telemetry, switched off with SCARF_ANALYTICS.

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MINT_VERSION = '4.2.939'
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const builds = ['sharp', 'keytar', '@scarf/scarf'].flatMap((name) => ['--allow-build', name])

const result = spawnSync('pnpm', ['dlx', ...builds, `mint@${MINT_VERSION}`, 'dev', ...process.argv.slice(2)], {
  cwd: join(root, 'docs'),
  stdio: 'inherit',
  env: { ...process.env, SCARF_ANALYTICS: 'false' },
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)
