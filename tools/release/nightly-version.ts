// Synced from Resnovas/.github templates/tools/release/nightly-version.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Names a nightly pre-release and decides whether it takes the major tag, for
// tools/release/nightly.ts. A nightly counts on from the newest stable release
// of the major (the next patch), or from <major>.0.0 before the first one, so
// it sorts before the release it previews. Until that first stable release the
// v<major> tag that workflows pin follows the nightlies; afterwards it moves
// only with stable releases.

const STABLE = /^v(\d+)\.(\d+)\.(\d+)$/

/** The stable `v<major>.<minor>.<patch>` tags of one major, newest first. */
const stableTags = (tags: ReadonlyArray<string>, major: number): ReadonlyArray<[number, number, number]> =>
  tags
    .map((tag) => STABLE.exec(tag))
    .filter((match) => match !== null && Number(match[1]) === major)
    .map((match) => [Number(match![1]), Number(match![2]), Number(match![3])] as [number, number, number])
    .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])

/**
 * The version of a nightly pre-release cut on a date.
 *
 * @param tags - Every tag in the repository.
 * @param major - The major version the nightlies preview.
 * @param date - When the nightly is cut; its UTC day names it.
 * @returns `<version>-nightly.<yyyymmdd>`, with `.<n>` added when that day already has a nightly.
 */
export const nightlyVersion = (tags: ReadonlyArray<string>, major: number, date: Date): string => {
  const newest = stableTags(tags, major)[0]
  const next = newest === undefined ? `${major}.0.0` : `${newest[0]}.${newest[1]}.${newest[2] + 1}`
  const day = date.toISOString().slice(0, 10).replaceAll('-', '')
  const base = `${next}-nightly.${day}`
  const taken = new Set(tags)
  if (!taken.has(`v${base}`)) return base
  let n = 1
  while (taken.has(`v${base}.${n}`)) n += 1
  return `${base}.${n}`
}

/**
 * Whether a nightly moves the `v<major>` tag.
 *
 * @param tags - Every tag in the repository.
 * @param major - The major version the nightlies preview.
 * @returns True until a stable release of that major exists.
 */
export const nightlyTakesMajor = (tags: ReadonlyArray<string>, major: number): boolean =>
  stableTags(tags, major).length === 0
