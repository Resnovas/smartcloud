// Synced from Resnovas/.github templates/tools/test/file.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Runs the tests for one file, for the editor's "debug the current test"
// configurations. The file can be a spec under tests/<name>/src or a source
// file under packages/<name>/src or apps/<name>/src, whose mirrored spec runs
// when it exists and the whole test project otherwise.
//
//   node tools/test/file.ts tests/config/src/load.spec.ts
//   node tools/test/file.ts packages/config/src/load.ts
//
// Coverage is off: its 100% threshold only holds for the whole project, which
// `pnpm nx test <project>` still checks. Runs on Node's built-in TypeScript
// support, so it needs no build step.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const argument = process.argv[2]
if (argument === undefined) {
  console.error('usage: node tools/test/file.ts <file>')
  process.exit(2)
}

const file = relative(root, isAbsolute(argument) ? argument : join(process.cwd(), argument))
  .split(sep)
  .join('/')
const match = /^(tests|packages|apps)\/([^/]+)\/src\/(.+?)(\.spec)?\.[cm]?ts$/.exec(file)
if (match === null) {
  console.error(`${file} is not under tests/, packages/ or apps/<name>/src.`)
  process.exit(2)
}
const [, area, name = '', rest = ''] = match
const project = join(root, 'tests', name)
if (!existsSync(join(project, 'vitest.config.mts'))) {
  console.error(`No test project at tests/${name} for ${file}.`)
  process.exit(2)
}

// Vitest filters by a path fragment relative to the project root.
const spec = `src/${rest}.spec.ts`
const filter = area === 'tests' || existsSync(join(project, spec)) ? [spec] : []

const result = spawnSync('vitest', ['run', '--coverage.enabled=false', ...filter], {
  cwd: project,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)
