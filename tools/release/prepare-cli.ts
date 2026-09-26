/**
 * @file tools/release/prepare-cli.ts
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

// Turns the bundled CLI in apps/cli/release into a package npm can publish.
//
//   node tools/release/prepare-cli.ts
//
// The workspace packages the CLI depends on are private, so the release
// publishes the single esbuild bundle with no dependencies, rather than the
// workspace package itself. Runs on Node's built-in TypeScript support.

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const release = join(root, 'apps/cli/release')
const bundles = ['smartcloud.js', 'smartcloud-mcp.js']

for (const bundle of bundles) {
  if (!existsSync(join(release, bundle))) {
    console.error(`apps/cli/release/${bundle} is missing: run \`pnpm nx run-many -t bundle -p @resnovas/smartcloud @resnovas/smartcloud-mcp\` first.`)
    process.exit(1)
  }
}

const workspace: { version: string; description: string } = JSON.parse(readFileSync(join(root, 'apps/cli/package.json'), 'utf8'))

const manifest = {
  name: '@resnovas/smartcloud',
  version: workspace.version,
  description: workspace.description,
  license: 'SEE LICENSE IN LICENSE',
  type: 'module',
  bin: { smartcloud: './smartcloud.js', 'smartcloud-mcp': './smartcloud-mcp.js' },
  files: [...bundles, 'LICENSE', 'README.md'],
  engines: { node: '>=24' },
  repository: { type: 'git', url: 'git+https://github.com/Resnovas/smartcloud.git', directory: 'apps/cli' },
  homepage: 'https://github.com/Resnovas/smartcloud',
  bugs: 'https://github.com/Resnovas/smartcloud/issues',
  publishConfig: { access: 'public', provenance: true },
}

writeFileSync(join(release, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
copyFileSync(join(root, 'LICENSE'), join(release, 'LICENSE'))
writeFileSync(
  join(release, 'README.md'),
  [
    '# @resnovas/smartcloud',
    '',
    'The smartcloud command line and MCP server: validate and migrate configs, dry-run features, and plan settings locally.',
    '',
    '```sh',
    'npx @resnovas/smartcloud validate',
    'npx @resnovas/smartcloud migrate .github/config.json --out .github/smartcloud.yml',
    '```',
    '',
    'See https://github.com/Resnovas/smartcloud for the documentation.',
    '',
  ].join('\n'),
)
console.log(`Prepared @resnovas/smartcloud ${manifest.version} in apps/cli/release.`)
