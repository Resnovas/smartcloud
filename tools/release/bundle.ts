// Synced from Resnovas/.github templates/tools/release/bundle.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Bundles an app's compiled entry point into a single file with esbuild.
//
//   node tools/release/bundle.ts <project root> <output file>
//
// The app's package.json version is stamped into the bundle as the global
// release.config.json names in versionGlobal (the app reads it at start-up).
// On the default branch it is 0.0.0; the release workflow runs Nx release
// first, which writes the version it is releasing, so the bundle carries the
// version of the tag it is built for. Runs on Node's built-in TypeScript
// support.

import { build } from 'esbuild'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadReleaseConfig } from './config.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const [projectRoot, outfile] = process.argv.slice(2)
if (projectRoot === undefined || outfile === undefined) {
  console.error('Usage: node tools/release/bundle.ts <project root> <output file>')
  process.exit(1)
}

const { versionGlobal } = loadReleaseConfig(root)
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
  define: { [`globalThis.${versionGlobal}`]: JSON.stringify(version) },
  // A linked source map beside the bundle, for error tracking. Its sources are
  // relative to the bundle, so it names no local path; the release uploads it
  // and deletes it, so no published artefact ships it.
  sourcemap: 'linked',
  sourcesContent: true,
  logLevel: 'warning',
})
console.log(`Bundled ${projectRoot} ${version} into ${outfile}.`)
