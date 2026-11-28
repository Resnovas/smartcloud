// Synced from Resnovas/.github templates/tools/typecheck/tests.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Type-checks every test project.
//
//   node tools/typecheck/tests.ts
//
// Nx turns off the inferred typecheck target for the test projects, because
// they set noEmit, so without this their type errors would only show up at
// run time, if at all. Runs on Node's built-in TypeScript support.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runChild, terminationGraceMs } from '../test-process/process.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
// Node executes the installed packages' declared entry points directly, without
// POSIX shebangs, Windows command shims or an intermediate shell to own.
const nxPackage = join(root, 'node_modules', 'nx')
const nxManifest: { bin: { nx: string } } = JSON.parse(readFileSync(join(nxPackage, 'package.json'), 'utf8'))
const typescriptPackage = join(root, 'node_modules', 'typescript')
const typescriptManifest: { bin: { tsc: string } } = JSON.parse(readFileSync(join(typescriptPackage, 'package.json'), 'utf8'))
const tsc = join(typescriptPackage, typescriptManifest.bin.tsc)

const projects = readdirSync(join(root, 'tests'), { withFileTypes: true })
  .filter(
    /** Select immediate test directories with an explicit TypeScript project configuration. */ (entry) =>
      entry.isDirectory() && existsSync(join(root, 'tests', entry.name, 'tsconfig.json')),
  )
  .map(/** Keep compiler project paths workspace-relative for portable diagnostics. */ (entry) => `tests/${entry.name}`)

// The test projects reference the packages' declaration output, so build
// everything first; Nx serves unchanged projects from its cache. This serial
// plan is the only source of child and complete-command lifetime allowances.
const plan = [
  { project: null, command: process.execPath,
    args: [join(nxPackage, nxManifest.bin.nx), 'run-many', '-t', 'build', '--output-style=static'], budgetMs: 120000 },
  ...projects.map(/** Give every discovered compiler the same bounded opportunity to report errors. */ (project) => ({
    project, command: process.execPath,
    args: [tsc, '-p', `${project}/tsconfig.json`, '--noEmit', '--declaration', 'false', '--declarationMap', 'false'],
    budgetMs: 60000,
  })),
]
// These new failure ceilings do not replace an existing test limit. The command
// previously had no deadlines; cancellation now covers the full admitted vector.
const totalMs = plan.reduce(/** Reserve termination grace and one second for command-level reporting. */ (sum, task) => sum + task.budgetMs + terminationGraceMs, 1000)
const signal = AbortSignal.timeout(totalMs)
const failed: string[] = []
for (const [index, task] of plan.entries()) {
  // The base config's declaration output does not apply to a project that emits nothing.
  const result = await runChild(task.command, task.args, {
    cwd: root, budgetMs: task.budgetMs, ordinal: index + 1, signal,
    maxBuffer: 1024 * 1024, inheritOutput: task.project !== null,
  })
  if (task.project === null) {
    if (result.stderr) process.stderr.write(result.stderr)
    if (result.error || result.status !== 0) {
      console.error('The build failed, so the tests cannot be type-checked.')
      process.exit(1)
    }
  } else if (result.error || result.status !== 0) {
    failed.push(task.project)
  }
}

if (failed.length > 0) {
  console.error(`Type errors in: ${failed.join(', ')}`)
  process.exit(1)
}
console.log(`All ${projects.length} test projects type-check.`)
