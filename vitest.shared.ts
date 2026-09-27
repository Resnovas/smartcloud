/**
 * @file vitest.shared.ts
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

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as Doctest from '@effect/doctest/Plugin'
import { defineConfig } from 'vitest/config'

// Coverage records sources by absolute path, so globs are anchored here.
const workspaceRoot = dirname(fileURLToPath(import.meta.url))

// A package's entry is the `index.ts` in the `src` its covers lie in. Workspace
// tooling has no package, so its first covered file stands in.
const packageEntry = (cover: string): string =>
  cover.includes('/src/')
    ? join(workspaceRoot, cover.replace(/\/src\/.*$/, ''), 'src/index.ts')
    : join(workspaceRoot, cover)

// GitHub Actions sets CI. Retries stay off locally, so a flaky test fails where
// it can be debugged.
const onCI = process.env['CI'] === 'true'

/**
 * Flaky-test handling for every test project: on CI (`CI=true`) a failed test
 * is retried twice, and `tools/ci/flaky-tests.ts` reports every test that
 * passed only on a retry as a warning annotation and in the job summary, so a
 * flaky test does not fail an unrelated change but is never hidden either.
 * Locally tests run once. On CI Vitest also records where each test is
 * defined, so the annotation points at its line.
 */
export const flakyTests = {
  retry: onCI ? 2 : 0,
  includeTaskLocation: onCI,
  reporters: onCI ? ['default', join(workspaceRoot, 'tools/ci/flaky-tests.ts')] : ['default'],
}

/**
 * The shared Vitest settings every test project extends.
 *
 * @remarks
 * Tests live in their own Nx projects under `tests/<package>/src/**`, mirroring
 * `packages/<package>/src/**`, and measure coverage of the package they test.
 * Coverage below 90% fails the run, the enforced minimum. 100% is the goal:
 * below it the run passes, and `tools/ci/coverage-goal.ts` warns how far short
 * it fell. (The GitHub ruleset blocks a pull request only below 80%.)
 *
 * The `@effect/doctest` plugin also collects every `@example` fence marked
 * `ts import.meta.vitest` in the covered sources and runs it as a test, so
 * documented examples, and their `// =>` assertions, stay true. `vitest.setup.ts`
 * loads the package's entry before those examples run, so the first one does
 * not spend its timeout importing the package.
 *
 * Failed tests are retried and reported on CI; see {@link flakyTests}.
 *
 * @param name - The test project's name, shown in the reporter.
 * @param covers - Source globs of the package under test, relative to the
 *   workspace root, for example `['packages/config/src/**']`, or the files of
 *   the workspace tooling under test, such as `['tools/release/changelogs.ts']`.
 * @returns A Vitest config for the test project.
 */
export const testProject = (name: string, covers: ReadonlyArray<string>) =>
  defineConfig({
    plugins: [Doctest.plugin()],
    // Resolve workspace packages to their TypeScript sources, as tsconfig's
    // customConditions does, so coverage measures src rather than dist.
    resolve: { conditions: ['@resnovas/source'] },
    ssr: { resolve: { conditions: ['@resnovas/source'] } },
    test: {
      name,
      watch: false,
      environment: 'node',
      include: ['src/**/*.spec.ts'],
      setupFiles: [join(workspaceRoot, 'vitest.setup.ts')],
      provide: { packageEntry: packageEntry(covers[0] ?? '') },
      // Doctests are collected from the covered sources: a directory glob or a single file.
      includeSource: covers.map((glob) => join(workspaceRoot, glob.endsWith('.ts') ? glob : join(glob, '*.ts'))),
      ...flakyTests,
      reporters: [...flakyTests.reporters, [join(workspaceRoot, 'tools/ci/coverage-goal.ts'), { project: name }]],
      coverage: {
        enabled: true,
        provider: 'v8',
        reportsDirectory: './test-output/coverage',
        // The package under test lives outside this project's root.
        allowExternal: true,
        include: covers.map((glob) => join(workspaceRoot, glob)),
        exclude: ['**/index.ts'],
        // 90% is enforced; below the 100% goal the coverage-goal reporter warns.
        thresholds: { lines: 90, functions: 90, statements: 90, branches: 90 },
      },
    },
  })
