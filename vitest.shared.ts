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
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
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
 * @param name - The test project's name, shown in the reporter.
 * @param covers - Source globs of the package under test, relative to the
 *   workspace root, for example `['packages/config/src/**']`.
 * @returns A Vitest config for the test project.
 */
export const testProject = (name: string, covers: ReadonlyArray<string>) =>
  defineConfig({
    // Resolve workspace packages to their TypeScript sources, as tsconfig's
    // customConditions does, so coverage measures src rather than dist.
    resolve: { conditions: ['@resnovas/source'] },
    ssr: { resolve: { conditions: ['@resnovas/source'] } },
    test: {
      name,
      watch: false,
      environment: 'node',
      include: ['src/**/*.spec.ts'],
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
