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

import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runChild, terminationGraceMs } from '../test-process/process.mjs'

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

// Use the repository's declared Node entry point on every platform. A shell
// shim would add a second process whose termination cannot certify CLI close.
const vitestPackage = join(root, 'node_modules', 'vitest')
const manifest: { bin: { vitest: string } } = JSON.parse(readFileSync(join(vitestPackage, 'package.json'), 'utf8'))
const vitest = join(vitestPackage, manifest.bin.vitest)
// A complete project may run when no mirrored spec exists. This new command
// ceiling does not alter Vitest's per-test limits or its coverage policy.
const budgetMs = 600000
const result = await runChild(process.execPath, [vitest, 'run', '--coverage.enabled=false', ...filter], {
  cwd: project,
  budgetMs,
  signal: AbortSignal.timeout(budgetMs + terminationGraceMs + 1000),
  maxBuffer: 1024 * 1024,
  inheritOutput: true,
})
if (result.error) console.error(result.error.code === 'ENOENT'
  ? `Cannot run ${vitest}: install the dependencies first.`
  : 'The test child failed its declared process bound; inspect test.child.timing and correct the slow phase or output flood without relaxing test limits.')
process.exit(result.error ? 1 : result.status ?? 1)
