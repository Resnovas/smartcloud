/**
 * @file tests/conditions/src/codeowners.spec.ts
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
import { codeownersOf, parseCodeowners } from '@resnovas/conditions'

const owner = (text: string, path: string) => codeownersOf(parseCodeowners(text), path).join(' ')

describe('parseCodeowners', () => {
  it('skips blank lines and comments, whole-line or after the owners', () => {
    const rules = parseCodeowners('# header\n\n  *.js   @js-owner #inline comment\r\n')
    expect(rules.map((rule) => [rule.pattern, rule.owners])).toStrictEqual([['*.js', ['@js-owner']]])
  })

  it('reads a backslash-escaped space as part of the pattern', () => {
    const [rule] = parseCodeowners('docs/My\\ Files/*.md @docs\n')
    expect([rule?.pattern, rule?.owners]).toStrictEqual(['docs/My Files/*.md', ['@docs']])
    expect(rule?.matches('docs/My Files/a.md')).toBe(true)
  })

  it('skips lines GitHub rejects: negation, ranges and an escaped #', () => {
    const text = '* @all\n!docs/** @none\n[ab].md @none\nsrc/file[0-9].ts @none\n\\#notes @none\n'
    expect(parseCodeowners(text).map((rule) => rule.pattern)).toStrictEqual(['*'])
    expect(owner(text, 'docs/a.md')).toBe('@all')
    expect(owner(text, 'src/file5.ts')).toBe('@all')
  })

  it('reads braces and extglob characters literally', () => {
    expect(owner('*.{js,ts} @braces', 'a.js')).toBe('')
    expect(owner('+(a).md @ext', 'a.md')).toBe('')
  })
})

describe('codeownersOf', () => {
  it('lets the last matching rule win and owns nothing unmatched', () => {
    const text = '*.js @js\n/src/ @src\n'
    expect(owner(text, 'src/a.js')).toBe('@src')
    expect(owner(text, 'lib/a.js')).toBe('@js')
    expect(owner(text, 'README.md')).toBe('')
  })

  it('matches everything, dotfiles included, with *', () => {
    expect(owner('* @all', '.github/workflows/ci.yml')).toBe('@all')
  })

  it('matches a pattern without a slash at any depth', () => {
    expect(owner('*.go @go', 'cmd/tool/main.go')).toBe('@go')
    expect(owner('apps/ @apps', 'packages/apps/x.ts')).toBe('@apps')
    expect(owner('logs @logs', 'deep/logs/today.txt')).toBe('@logs')
  })

  it('anchors a pattern with a slash at the root', () => {
    expect(owner('/docs/ @docs', 'docs/a/b.md')).toBe('@docs')
    expect(owner('/docs/ @docs', 'site/docs/a.md')).toBe('')
    expect(owner('/build/logs/ @logs', 'build/logs/x.log')).toBe('@logs')
    expect(owner('docs/github @gh', 'docs/github/a.md')).toBe('@gh')
    expect(owner('docs/github @gh', 'docs/github')).toBe('@gh')
    expect(owner('**/logs @logs', 'a/b/logs/x.log')).toBe('@logs')
  })

  it('reads a pattern of slashes alone as the root, quickly', () => {
    expect(owner(`${'/'.repeat(50_000)}a/ @a`, 'a/b.md')).toBe('@a')
    expect(owner('/// @root', 'a.md')).toBe('')
  })

  it('keeps a trailing /* to direct children, as GitHub documents', () => {
    expect(owner('docs/* @docs', 'docs/intro.md')).toBe('@docs')
    expect(owner('docs/* @docs', 'docs/build/app.md')).toBe('')
  })

  it('matches a directory-only pattern against paths inside it, not a file of that name', () => {
    expect(owner('apps/ @apps', 'apps')).toBe('')
  })
})
