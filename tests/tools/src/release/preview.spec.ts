/**
 * @file tests/tools/src/release/preview.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import {
  bumpOf,
  isFirstRelease,
  MARKER,
  type Preview,
  renderFailure,
  renderPreview,
  squashMessage,
} from '../../../../tools/release/preview.js'

// As in nx.json's release.conventionalCommits.types.
const TYPES = {
  feat: { semverBump: 'minor' },
  fix: { semverBump: 'patch' },
  perf: { semverBump: 'patch' },
  docs: { semverBump: 'none' },
  chore: { semverBump: 'none' },
  odd: { semverBump: 'sideways' },
  flag: true,
}

const PREVIEW: Preview = {
  version: '2.1.0',
  current: '2.0.3',
  firstRelease: false,
  commit: 'feat(labels): colour aliases (#12)',
  bump: 'minor',
  notes: '## 2.1.0\n\n### Features\n\n- **labels:** colour aliases',
}

describe('isFirstRelease', () => {
  it('is true until a stable v* tag exists', () => {
    expect(isFirstRelease([])).toBe(true)
    expect(isFirstRelease(['1.0.0-beta.8', 'v2.0.0-nightly.20260927', 'v2', ''])).toBe(true)
    expect(isFirstRelease(['1.0.0-beta.8', 'v2.0.0'])).toBe(false)
  })
})

describe('squashMessage', () => {
  it('adds the number to the title and lists each commit message', () => {
    expect(squashMessage(' feat: one ', 7, ['feat: a\n\nbody\n', '', 'fix: b'])).toBe(
      'feat: one (#7)\n\n* feat: a\n\nbody\n\n* fix: b',
    )
  })

  it('is the title alone when the commits carry no message', () => {
    expect(squashMessage('fix: one', 7, ['', '  '])).toBe('fix: one (#7)')
  })
})

describe('bumpOf', () => {
  it('follows the type', () => {
    expect(bumpOf('feat(labels): x (#1)', TYPES)).toBe('minor')
    expect(bumpOf('fix: x', TYPES)).toBe('patch')
    expect(bumpOf('docs: x', TYPES)).toBe('none')
  })

  it('is none for a type nx.json does not list or gives no known bump', () => {
    expect(bumpOf('style: x', TYPES)).toBe('none')
    expect(bumpOf('odd: x', TYPES)).toBe('none')
    expect(bumpOf('flag: x', TYPES)).toBe('none')
  })

  it('is major for a ! or a breaking change footer', () => {
    expect(bumpOf('feat(api)!: x', TYPES)).toBe('major')
    expect(bumpOf('feat (api): x', TYPES)).toBe('minor')
    expect(bumpOf('chore: x\n\n* fix: y\n\nBREAKING CHANGE: z', TYPES)).toBe('major')
    expect(bumpOf('chore: x\n\n* fix: y\n\nBREAKING-CHANGE: z', TYPES)).toBe('none')
  })

  it('is undefined for a title that is not a conventional commit', () => {
    expect(bumpOf('Update the labels', TYPES)).toBeUndefined()
    expect(bumpOf('feat:missing space', TYPES)).toBeUndefined()
    expect(bumpOf('', TYPES)).toBeUndefined()
  })
})

describe('renderPreview', () => {
  it('names the next version, what the commit calls for and the notes', () => {
    const report = renderPreview(PREVIEW)
    expect(report.startsWith(`${MARKER}\n## Release preview\n`)).toBe(true)
    expect(report).toContain('the next release would be **v2.1.0** (the last one is v2.0.3)')
    expect(report).toContain('would land as `feat(labels): colour aliases (#12)`, which calls for a minor release')
    expect(report).toContain('<details><summary>Release notes</summary>\n\n## 2.1.0')
  })

  it('omits the last version when there is none', () => {
    expect(renderPreview({ ...PREVIEW, current: undefined })).toContain('would be **v2.1.0**.')
  })

  it('says when the next release is the first', () => {
    expect(renderPreview({ ...PREVIEW, version: '2.0.0', current: undefined, firstRelease: true })).toContain(
      'the next one is the first: **v2.0.0**',
    )
  })

  it('says when nothing calls for a release, without notes', () => {
    const report = renderPreview({ ...PREVIEW, version: undefined, bump: 'none', commit: 'docs: x (#3)' })
    expect(report).toContain('No commit since v2.0.3 calls for a new version')
    expect(report).toContain('whose type does not change the version')
    expect(report).not.toContain('<details>')
    expect(renderPreview({ ...PREVIEW, version: undefined, current: undefined })).toContain(
      'No commit since the last release',
    )
  })

  it('asks for a conventional title when the commit is not one', () => {
    expect(renderPreview({ ...PREVIEW, commit: 'Update `labels` (#4)', bump: undefined })).toContain(
      "`Update 'labels' (#4)`, which is not a conventional commit",
    )
  })

  it('leaves out the commit outside a pull request, and empty notes', () => {
    const report = renderPreview({ ...PREVIEW, commit: undefined, bump: undefined, notes: '  ' })
    expect(report).not.toContain('would land as')
    expect(report).not.toContain('<details>')
  })

  it('cuts long notes at a line break', () => {
    const report = renderPreview({ ...PREVIEW, notes: 'aaaa\nbbbb\ncccc' }, 11)
    expect(report).toContain('aaaa\nbbbb\n\n_The notes are cut short here')
    expect(report).not.toContain('cccc')
    expect(renderPreview({ ...PREVIEW, notes: 'aaaaaaaa' }, 4)).toContain('aaaa\n\n_The notes are cut short')
  })
})

describe('renderFailure', () => {
  it('reports the reason without blocking', () => {
    const report = renderFailure(' no tags \n')
    expect(report.startsWith(MARKER)).toBe(true)
    expect(report).toContain('could not be made: no tags\n')
    expect(report).toContain('does not block the pull request')
  })
})
