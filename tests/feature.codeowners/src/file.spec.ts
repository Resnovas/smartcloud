/**
 * @file tests/feature.codeowners/src/file.spec.ts
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
  CODEOWNERS_PATHS,
  GENERATED_BEGIN,
  GENERATED_END,
  generatedBlock,
  lintCodeOwners,
  mergeGenerated,
  parseCodeOwners,
  renderGenerated,
} from '@resnovas/feature.codeowners'

const block = (...lines: ReadonlyArray<string>) => [`# ${GENERATED_BEGIN}`, ...lines, `# ${GENERATED_END}`].join('\n')

describe('parseCodeOwners', () => {
  it('reads rules with their lines, skipping comments, blank lines and trailing comments', () => {
    const text = '# Owners\n\n*  @a @b  # both\n/docs/\\ guide/ @Resnovas/docs\n/vendor/\n'
    expect(parseCodeOwners(text)).toStrictEqual([
      { line: 3, pattern: '*', owners: ['@a', '@b'] },
      { line: 4, pattern: '/docs/\\ guide/', owners: ['@Resnovas/docs'] },
      { line: 5, pattern: '/vendor/', owners: [] },
    ])
  })

  it('knows where GitHub looks, in order', () => {
    expect(CODEOWNERS_PATHS).toStrictEqual(['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'])
  })
})

describe('lintCodeOwners', () => {
  it('flags unsupported patterns and malformed owners', () => {
    const text = '!vendor/ @a\n\\#notes @a\n*.[ch] @a\nsrc/ team octo@example.com @org/team\n'
    expect(lintCodeOwners(text)).toStrictEqual([
      { line: 1, kind: 'syntax', message: 'negation (!) is not supported in CODEOWNERS' },
      { line: 2, kind: 'syntax', message: 'a pattern starting with an escaped # is not supported in CODEOWNERS' },
      { line: 3, kind: 'syntax', message: 'character ranges ([ ]) are not supported in CODEOWNERS' },
      {
        line: 4,
        kind: 'syntax',
        message: '`team` is not a user (@login), a team (@org/team) or an email address',
      },
    ])
  })

  it('flags a rule a later rule with the same pattern replaces', () => {
    expect(lintCodeOwners('*.md @a\n* @b\n*.md @c\n')).toStrictEqual([
      {
        line: 1,
        kind: 'shadowed',
        message: 'the rule for `*.md` never applies: line 3 has the same pattern, and the last matching rule wins',
      },
    ])
    expect(lintCodeOwners('')).toStrictEqual([])
  })

  it('checks a large file in linear time', () => {
    const text = Array.from({ length: 50_000 }, (_, index) => `/p${index}/ @a`).join('\n')
    expect(lintCodeOwners(`${text}\n/p0/ @b\n`).map((problem) => problem.line)).toStrictEqual([1])
  })
})

describe('renderGenerated', () => {
  it('writes the rules in order, aligned, with comments and blank lines between them', () => {
    const text = renderGenerated({
      docs: { paths: ['/docs/', '*.md'], owners: ['@Resnovas/docs', '@a'], comment: 'Documentation.\nWriters own it.' },
      vendor: { paths: ['/vendor/'], owners: [] },
      tests: { paths: ['*.spec.ts'], owners: ['@qa'], comment: '' },
    })
    expect(text.split('\n')).toStrictEqual([
      `# ${GENERATED_BEGIN} - generated from codeowners.rules in the smartcloud config. Edits inside this block are overwritten.`,
      '# Documentation.',
      '# Writers own it.',
      '/docs/    @Resnovas/docs @a',
      '*.md      @Resnovas/docs @a',
      '',
      '/vendor/',
      '',
      '#',
      '*.spec.ts @qa',
      `# ${GENERATED_END}`,
    ])
  })

  it('writes only the markers when there are no rules', () => {
    expect(renderGenerated({}).split('\n')).toHaveLength(2)
  })
})

describe('generatedBlock', () => {
  it('reads a well-formed block, and nothing from a broken or missing one', () => {
    expect(generatedBlock(`* @a\n${block('/docs/ @b')}\n`)).toBe(block('/docs/ @b'))
    expect(generatedBlock(`# ${GENERATED_END}\n# ${GENERATED_BEGIN}\n`)).toBeUndefined()
    expect(generatedBlock(`# ${GENERATED_BEGIN}ning\n# ${GENERATED_END}\n`)).toBeUndefined()
    expect(generatedBlock(`${GENERATED_BEGIN}\n# ${GENERATED_END}\n`)).toBeUndefined()
  })
})

describe('mergeGenerated', () => {
  const generated = block('/docs/ @b')

  it('creates the file, or appends the block to one without it', () => {
    expect(mergeGenerated(null, generated)).toBe(`${generated}\n`)
    expect(mergeGenerated('', generated)).toBe(`${generated}\n`)
    expect(mergeGenerated('* @a\n\n\n', generated)).toBe(`* @a\n\n${generated}\n`)
  })

  it('replaces an existing block in place', () => {
    expect(mergeGenerated(`* @a\n${block('/old/ @c')}\n/x/ @d\n`, generated)).toBe(`* @a\n${generated}\n/x/ @d\n`)
  })

  it('goes above a synced block, which stays last', () => {
    const synced = '# house:managed:begin\n*.md @s\n# house:managed:end\n'
    expect(mergeGenerated(`* @a\n${synced}`, generated)).toBe(`* @a\n\n${generated}\n\n${synced}`)
    expect(mergeGenerated(`* @a\n\n${synced}`, generated)).toBe(`* @a\n\n${generated}\n\n${synced}`)
    expect(mergeGenerated(synced, generated)).toBe(`${generated}\n\n${synced}`)
  })

  it('moves a block found below the synced block above it', () => {
    const synced = '# house:managed:begin\n*.md @s\n# house:managed:end\n'
    expect(mergeGenerated(`* @a\n${synced}${block('/old/ @c')}\n`, generated)).toBe(`* @a\n\n${generated}\n\n${synced}`)
  })

  it('drops the stray markers of a broken block', () => {
    expect(mergeGenerated(`* @a\n# ${GENERATED_BEGIN}\n/old/ @c\n`, generated)).toBe(`* @a\n/old/ @c\n\n${generated}\n`)
  })
})
