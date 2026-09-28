// Synced from Resnovas/.github templates/tools/release/changelogs.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
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
