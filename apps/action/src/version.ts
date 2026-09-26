/**
 * @file apps/action/src/version.ts
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

declare global {
  // Replaced by esbuild with the version in the app's package.json when
  // tools/release/bundle.ts bundles it; the release workflow sets that version
  // with Nx release before bundling. Unset in an unbundled build.
  var __SMARTCLOUD_VERSION__: string | undefined
}

/** The version a bundle was stamped with, or 0.0.0 for an unreleased build. */
export const stampedVersion = (stamped: string | undefined): string => stamped ?? '0.0.0'

/** The smartcloud version. */
export const VERSION: string = stampedVersion(globalThis.__SMARTCLOUD_VERSION__)
