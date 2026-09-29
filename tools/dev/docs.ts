// Synced from Resnovas/.github templates/tools/dev/docs.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
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
