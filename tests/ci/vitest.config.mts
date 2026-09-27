/**
 * @file tests/ci/vitest.config.mts
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

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { flakyTests } from '../../vitest.shared.js'

export default defineConfig({
  test: {
    name: 'ci',
    include: ['src/**/*.spec.ts'],
    ...flakyTests,
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: './test-output/coverage',
      allowExternal: true,
      include: [
        fileURLToPath(new URL('../../tools/ci/bundle-size.ts', import.meta.url)),
        fileURLToPath(new URL('../../tools/ci/smoke/*.ts', import.meta.url)),
        fileURLToPath(new URL('../../tools/ci/flaky-tests.ts', import.meta.url)),
      ],
      thresholds: { lines: 100, functions: 100, statements: 100, branches: 100 },
    },
  },
})
