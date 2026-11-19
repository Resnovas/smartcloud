// Synced from Resnovas/.github templates/tools/release/sourcemaps.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Hands the bundles' source maps to PostHog error tracking, and makes sure no
// published artefact ships one.
//
//   node tools/release/sourcemaps.ts <version> <bundle.js>...
//
// tools/release/bundle.ts writes each bundle with a linked map beside it
// (<bundle>.js.map). With POSTHOG_CLI_API_KEY set (a personal API key with the
// error tracking write and organization read scopes) and a posthog section in
// release.config.json, PostHog's CLI injects a chunk id into each bundle,
// uploads its map to that project for the release `<name>@<version>`, then
// deletes the map and strips the sourceMappingURL comment. Exceptions from
// that bundle carry the chunk id, so PostHog resolves their frames to the
// TypeScript sources.
//
// Without the key or the section, as in a dry run or a fork, nothing is
// uploaded: the maps are deleted and the comments stripped all the same, so
// the output never differs in what it ships. Runs on Node's built-in
// TypeScript support.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadReleaseConfig } from './config.ts'

// Pinned, so a release never picks up a CLI it was not checked with.
const POSTHOG_CLI = '@posthog/cli@0.18.7'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const config = loadReleaseConfig(root)

const [version, ...bundles] = process.argv.slice(2)
if (version === undefined || bundles.length === 0) {
  console.error('Usage: node tools/release/sourcemaps.ts <version> <bundle.js>...')
  process.exit(1)
}

const COMMENT = /\n\/\/# sourceMappingURL=[^\n]*\n?$/

// Removes the map and the comment that points at it.
/** Delete a bundle's adjacent map and remove its trailing sourceMappingURL before the artifact ships. */
const strip = (bundle: string) => {
  // Removal and comment stripping are both necessary: shipped bundles must neither contain nor reference private maps.
  rmSync(`${bundle}.map`, { force: true })
  writeFileSync(bundle, readFileSync(bundle, 'utf8').replace(COMMENT, '\n'))
}

for (const bundle of bundles) {
  if (!existsSync(bundle) || !existsSync(`${bundle}.map`)) {
    console.error(`${bundle} or its map is missing: bundle it first.`)
    process.exit(1)
  }
}

const key = process.env['POSTHOG_CLI_API_KEY']
const posthog = config.posthog
if (key === undefined || key.trim() === '' || posthog === undefined) {
  for (const bundle of bundles) strip(bundle)
  console.log(
    `${posthog === undefined ? 'No posthog section in release.config.json' : 'No POSTHOG_CLI_API_KEY'}: deleted the source maps of ${bundles.join(', ')} without uploading them.`,
  )
  process.exit(0)
}

// The CLI works on a directory, so each bundle and its map are moved into one
// of their own, processed there, and moved back.
for (const bundle of bundles.map(
  /** Anchor paths before moving artifacts into the CLI's isolated work directory. */ (path) => resolve(path),
)) {
  const work = mkdtempSync(join(tmpdir(), `${config.name}-sourcemaps-`))
  const name = basename(bundle)
  renameSync(bundle, join(work, name))
  renameSync(`${bundle}.map`, join(work, `${name}.map`))
  const source = readFileSync(join(work, name), 'utf8')
  const shebang = source.match(/^#![^\n]*/)?.[0]
  /** Invoke the pinned CLI against only this bundle's work directory and configured project/release. */
  const cli = (...args: Array<string>) =>
    execFileSync(
      'npx',
      [
        '--yes',
        POSTHOG_CLI,
        '--host',
        posthog.host,
        'sourcemap',
        ...args,
        '--directory',
        work,
        '--release-name',
        config.name,
        '--release-version',
        version,
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, POSTHOG_CLI_PROJECT_ID: posthog.projectId },
      },
    )
  try {
    // The injector prepends JavaScript at byte zero, which would displace an
    // executable header. Leave its newline so existing body mappings stay valid.
    if (shebang !== undefined) writeFileSync(join(work, name), source.slice(shebang.length))
    cli('inject')
    if (shebang !== undefined) {
      const mapPath = join(work, `${name}.map`)
      const map = JSON.parse(readFileSync(mapPath, 'utf8')) as { mappings: string }
      // esbuild emits flat maps. Restore the header before upload and shift all
      // generated lines with it, retaining the vendor's chunk id and map fields.
      writeFileSync(join(work, name), `${shebang}\n${readFileSync(join(work, name), 'utf8')}`)
      map.mappings = `;${map.mappings}`
      writeFileSync(mapPath, JSON.stringify(map))
    }
    // Fail before upload/publication if instrumentation produced invalid JavaScript.
    execFileSync(process.execPath, ['--check', join(work, name)], { stdio: 'inherit' })
    // --delete-after removes the map and the sourceMappingURL comment once they are uploaded.
    cli('upload', '--delete-after')
  } finally {
    renameSync(join(work, name), bundle)
    rmSync(work, { recursive: true, force: true })
  }
  // In case the CLI kept the comment, nothing may point at a map that is not shipped.
  strip(bundle)
  console.log(`Uploaded the source map of ${bundle} to PostHog for ${config.name}@${version}.`)
}
