/**
 * @file tools/release/sourcemaps.ts
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

// Hands the bundles' source maps to PostHog error tracking, and makes sure no
// published artefact ships one.
//
//   node tools/release/sourcemaps.ts <version> <bundle.js>...
//
// tools/release/bundle.ts writes each bundle with a linked map beside it
// (<bundle>.js.map). With POSTHOG_CLI_API_KEY set (a personal API key with the
// error tracking write and organization read scopes, from the organization
// secret of the same name), PostHog's CLI injects a chunk id into each bundle,
// uploads its map to the Smartcloud project (PROJECT_ID) for the release
// `smartcloud@<version>`, then deletes the map and strips the
// sourceMappingURL comment. Exceptions from that bundle carry the chunk id, so
// PostHog resolves their frames to the TypeScript sources.
//
// Without the key, as in a dry run or a fork, nothing is uploaded: the maps are
// deleted and the comments stripped all the same, so the output never differs
// in what it ships. Runs on Node's built-in TypeScript support.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'

// Pinned, so a release never picks up a CLI it was not checked with.
const POSTHOG_CLI = '@posthog/cli@0.18.7'
// smartcloud's PostHog project, Smartcloud, in PostHog's EU cloud.
const HOST = 'https://eu.posthog.com'
const PROJECT_ID = '285077'
const RELEASE_NAME = 'smartcloud'

const [version, ...bundles] = process.argv.slice(2)
if (version === undefined || bundles.length === 0) {
  console.error('Usage: node tools/release/sourcemaps.ts <version> <bundle.js>...')
  process.exit(1)
}

const COMMENT = /\n\/\/# sourceMappingURL=[^\n]*\n?$/

// Removes the map and the comment that points at it.
const strip = (bundle: string) => {
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
if (key === undefined || key.trim() === '') {
  for (const bundle of bundles) strip(bundle)
  console.log(`No POSTHOG_CLI_API_KEY: deleted the source maps of ${bundles.join(', ')} without uploading them.`)
  process.exit(0)
}

// The CLI works on a directory, so each bundle and its map are moved into one
// of their own, processed there, and moved back.
for (const bundle of bundles.map((path) => resolve(path))) {
  const work = mkdtempSync(join(tmpdir(), 'smartcloud-sourcemaps-'))
  const name = basename(bundle)
  renameSync(bundle, join(work, name))
  renameSync(`${bundle}.map`, join(work, `${name}.map`))
  const cli = (...args: Array<string>) =>
    execFileSync(
      'npx',
      [
        '--yes',
        POSTHOG_CLI,
        '--host',
        HOST,
        'sourcemap',
        ...args,
        '--directory',
        work,
        '--release-name',
        RELEASE_NAME,
        '--release-version',
        version,
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, POSTHOG_CLI_PROJECT_ID: PROJECT_ID },
      },
    )
  try {
    cli('inject')
    // --delete-after removes the map and the sourceMappingURL comment once they are uploaded.
    cli('upload', '--delete-after')
  } finally {
    renameSync(join(work, name), bundle)
    rmSync(work, { recursive: true, force: true })
  }
  // In case the CLI kept the comment, nothing may point at a map that is not shipped.
  strip(bundle)
  console.log(`Uploaded the source map of ${bundle} to PostHog for ${RELEASE_NAME}@${version}.`)
}
