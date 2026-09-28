/**
 * @file tools/release/changelogs.ts
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

// Finds the changelog files a release wrote, so tools/release/release.ts can
// format them before the workflow opens the pull request that brings them to
// main. Nx writes the workspace changelog (CHANGELOG.md) and one per app
// (apps/<name>/CHANGELOG.md); see nx.json's release.changelog.

/**
 * The changelog files in a list of changed paths.
 *
 * @param changed - The output of `git ls-files --modified --others --exclude-standard`: one workspace-relative path a line.
 * @returns The paths of the changed or new `CHANGELOG.md` files, in the order listed.
 */
export const changedChangelogs = (changed: string): ReadonlyArray<string> =>
  changed.split('\n').filter((path) => path === 'CHANGELOG.md' || path.endsWith('/CHANGELOG.md'))
