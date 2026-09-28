// Synced from Resnovas/.github templates/tools/release/preview.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Builds the release preview a pull request gets, for
// tools/release/release-preview.ts. The pull request is squash-merged, so the
// commit that lands on main is its title with "(#<number>)" added, over the
// messages of its commits; Nx reads that commit, with every other commit since
// the last stable v* tag, to pick the next version. This module names that
// commit, says what bump it calls for on its own, and renders what the
// workflow writes to the job summary and the pull request comment.

/** A semantic version bump, as nx.json's conventionalCommits types name them. */
export type Bump = 'major' | 'minor' | 'patch' | 'none'

/** The part of nx.json's `release.conventionalCommits.types` the bump reads. */
export type CommitTypes = Readonly<Record<string, { readonly semverBump?: string } | boolean | undefined>>

/** The hidden line that marks the comment, so each run updates one comment instead of adding another. */
export const MARKER = '<!-- house:release-preview -->'

const STABLE = /^v\d+\.\d+\.\d+$/
// Nx's own conventional commit title pattern and breaking change test.
const HEADER = /^([^\s():!]+)(?:\s*\((.+)\))?(!)?: (.+)$/u
const BREAKING = 'BREAKING CHANGE:'

/**
 * Whether the next release is the first stable one, so it has no stable v* tag to count from.
 *
 * @param tags - Every tag in the repository.
 * @returns True when no `v<major>.<minor>.<patch>` tag exists; nightly and v1 tags do not count.
 */
export const isFirstRelease = (tags: ReadonlyArray<string>): boolean => !tags.some((tag) => STABLE.test(tag))

/**
 * The message of the commit a squash merge would land.
 *
 * @param title - The pull request's title, which the repository uses as the squash commit's title.
 * @param number - The pull request's number, which GitHub adds to the title.
 * @param messages - The full message of each of the pull request's commits, oldest first.
 * @returns The title with ` (#<number>)` added, then each commit message as a `* ` list item, as GitHub writes it.
 */
export const squashMessage = (title: string, number: number, messages: ReadonlyArray<string>): string => {
  const body = messages
    .map((message) => message.trim())
    .filter((message) => message !== '')
    .map((message) => `* ${message}`)
    .join('\n\n')
  return body === '' ? `${title.trim()} (#${number})` : `${title.trim()} (#${number})\n\n${body}`
}

/**
 * The bump one commit calls for, by the rules Nx applies.
 *
 * @param message - The commit's full message.
 * @param types - nx.json's `release.conventionalCommits.types`.
 * @returns `major` for a `!` or a `BREAKING CHANGE:` anywhere in the body, else the type's `semverBump` (`none` for a type it does not list), or `undefined` when the title is not a conventional commit.
 */
export const bumpOf = (message: string, types: CommitTypes): Bump | undefined => {
  const [title = '', ...rest] = message.split('\n')
  const header = HEADER.exec(title)
  if (header === null) return undefined
  if (header[3] === '!' || rest.join('\n').includes(BREAKING)) return 'major'
  const type = types[String(header[1])]
  const bump = typeof type === 'object' ? type.semverBump : undefined
  return bump === 'major' || bump === 'minor' || bump === 'patch' ? bump : 'none'
}

/** What the release tooling worked out for a pull request. */
export interface Preview {
  /** The version the next release would take, or `undefined` when no commit calls for one. */
  readonly version: string | undefined
  /** The version of the last stable release, or `undefined` before the first one. */
  readonly current: string | undefined
  /** Whether the next release is the first stable one, whose version is set by hand. */
  readonly firstRelease: boolean
  /** The squash commit's title, or `undefined` when the preview ran outside a pull request. */
  readonly commit: string | undefined
  /** The bump that commit calls for on its own; `undefined` when it is not a conventional commit. */
  readonly bump: Bump | undefined
  /** The release notes Nx would write, as Markdown. */
  readonly notes: string
}

const BUMPS: Record<Exclude<Bump, 'none'>, string> = {
  major: 'a major release (a breaking change)',
  minor: 'a minor release (a new feature)',
  patch: 'a patch release (a fix)',
}

const FOOTER =
  '<sub>Nothing is released by this pull request. A maintainer cuts releases from the release workflow; this preview shows what that would do if this pull request were merged now. It updates on every push and whenever the title changes.</sub>'

// Cuts text to a limit at the last line break before it.
const truncate = (text: string, limit: number) => {
  if (text.length <= limit) return text
  const cut = text.lastIndexOf('\n', limit)
  return `${text.slice(0, cut > 0 ? cut : limit).trimEnd()}\n\n_The notes are cut short here; the job summary of the release preview run has them in full._`
}

const inline = (text: string) => `\`${text.replaceAll('`', "'")}\``

/**
 * The Markdown the workflow writes to the job summary and the pull request comment.
 *
 * @param preview - What the release tooling worked out.
 * @param limit - The most characters of release notes to include; longer notes are cut at a line break and say so. No limit when omitted.
 * @returns A report headed by {@link MARKER}: the next version, what this pull request's commit adds to it, and the release notes in a collapsed block.
 */
export const renderPreview = (preview: Preview, limit = Number.POSITIVE_INFINITY): string => {
  const lines = [MARKER, '## Release preview', '']
  if (preview.version === undefined) {
    lines.push(
      `No commit since ${preview.current === undefined ? 'the last release' : `v${preview.current}`} calls for a new version, so the next release would not change if this pull request were merged.`,
    )
  } else if (preview.firstRelease) {
    lines.push(
      `No stable release exists yet, so the next one is the first: **v${preview.version}**, a version set by hand when the release workflow runs. These notes would go in it.`,
    )
  } else {
    lines.push(
      `If this pull request were merged now, the next release would be **v${preview.version}**${preview.current === undefined ? '' : ` (the last one is v${preview.current})`}.`,
    )
  }
  if (preview.commit !== undefined) {
    lines.push('')
    lines.push(
      preview.bump === undefined
        ? `This pull request would land as ${inline(preview.commit)}, which is not a conventional commit, so it would not count towards the version. Rename the pull request as \`type(scope): summary\`.`
        : preview.bump === 'none'
          ? `This pull request would land as ${inline(preview.commit)}, whose type does not change the version.`
          : `This pull request would land as ${inline(preview.commit)}, which calls for ${BUMPS[preview.bump]} when it changes the released apps or a library bundled into them. Nx counts a commit only for the files it changes, so a change to the workflows, tools or docs alone releases nothing.`,
    )
  }
  const notes = truncate(preview.notes.trim(), limit)
  if (preview.version !== undefined && notes !== '') {
    lines.push('', '<details><summary>Release notes</summary>', '', notes, '', '</details>')
  }
  lines.push('', FOOTER, '')
  return lines.join('\n')
}

/**
 * The Markdown written when the preview could not be made. The pull request is never failed for it.
 *
 * @param reason - What went wrong, in one line.
 * @returns A short report headed by {@link MARKER}.
 */
export const renderFailure = (reason: string): string =>
  [
    MARKER,
    '## Release preview',
    '',
    `The release preview could not be made: ${reason.trim()}`,
    '',
    'This does not block the pull request. Run `pnpm release:dry-run` locally to see the full output.',
    '',
  ].join('\n')
