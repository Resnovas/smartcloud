/**
 * @file vitest.setup.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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

import { expect, inject } from 'vitest'

declare module 'vitest' {
  export interface ProvidedContext {
    /** The absolute path of the entry (`src/index.ts`) of the package under test, or the first file of the tooling under test. */
    readonly packageEntry: string
  }
}

// `@effect/doctest` runs each example as `test(name, () => import(snippet))`,
// so the first example of a source file pays for loading, transforming and
// instrumenting the whole package its imports reach, inside that one test's
// timeout. On a busy two-core CI runner that took over 5 s. Loading the
// package's entry here, before the file's tests start and outside any test's
// timeout, leaves the examples only their own work. Spec files import what
// they need themselves, so they are left alone.
if (!expect.getState().testPath?.endsWith('.spec.ts')) {
  await import(inject('packageEntry'))
}
