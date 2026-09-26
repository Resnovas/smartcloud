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

/**
 * The shared Vitest settings every test project extends.
 *
 * @remarks
 * Tests live in their own Nx projects under `tests/<package>/src/**`, mirroring
 * `packages/<package>/src/**`, and measure coverage of the package they test.
 * Coverage below 100% of lines fails the run: the house standard for this
 * repository.
 *
 * The `@effect/doctest` plugin also collects every `@example` fence marked
 * `ts import.meta.vitest` in the covered sources and runs it as a test, so
 * documented examples, and their `// =>` assertions, stay true. `vitest.setup.ts`
 * loads the package's entry before those examples run, so the first one does
 * not spend its timeout importing the package.
 *
 * @param name - The test project's name, shown in the reporter.
 * @param covers - Source globs of the package under test, relative to the
 *   workspace root, for example `['packages/config/src/**']`.
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
      // Every cover lies in the package's `src`, whose `index.ts` is its entry.
      provide: { packageEntry: join(workspaceRoot, covers[0]?.replace(/\/src\/.*$/, '') ?? '', 'src/index.ts') },
      // Doctests are collected from the covered sources: a directory glob or a single file.
      includeSource: covers.map((glob) => join(workspaceRoot, glob.endsWith('.ts') ? glob : join(glob, '*.ts'))),
      reporters: ['default'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reportsDirectory: './test-output/coverage',
        // The package under test lives outside this project's root.
        allowExternal: true,
        include: covers.map((glob) => join(workspaceRoot, glob)),
        exclude: ['**/index.ts'],
        thresholds: { lines: 100, functions: 100, statements: 100, branches: 95 },
      },
    },
  })
