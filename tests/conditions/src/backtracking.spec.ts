/**
 * @file tests/conditions/src/backtracking.spec.ts
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

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from '@effect/vitest'
import { backtrackingRisk, compilePattern } from '@resnovas/conditions'

const refused = (source: string, flags = '') => backtrackingRisk(source, flags) !== undefined

describe('backtrackingRisk', () => {
  it.each([
    // Nested repeats.
    ['^(a+)+$'],
    ['(a*)*b'],
    ['^(a+)*$'],
    ['(\\w+\\s?)+$'],
    ['(x+x+)+y'],
    ['^(\\w+\\.?)+@'],
    ['(a*b*)*$'],
    ['^([\\w-]+-)*$'],
    ['^(a+){2,10}$'],
    ['^(?:a{1,20})+$'],
    ['^(?:(a+)?){2,3}$'],
    // Repeated choices that overlap.
    ['(a|aa)+$'],
    ['(a|a)*$'],
    ['(?:a|b|ab)+$'],
    ['(\\d|\\w)+$'],
    ['^(?:[a-z]|\\w)*$'],
    // Named groups, lookarounds and classes are looked through.
    ['^(?<word>a+)+$'],
    ['(?=(a+)+b)'],
    ['(?<!(a+)+)b'],
    ['^([^,]+,?)+$'],
    // A try at one more copy is a search of its own, even at the end.
    ['(?:(a+)+b)*'],
    ['^x(?:(a|aa)+c)?'],
  ])('refuses %s', (source) => {
    expect(refused(source)).toBe(true)
  })

  it.each([
    ['^feat'],
    ['^(?:feat|fix)(\\(.+\\))?!?: '],
    ['^(\\w+-)*\\w+$'],
    ['(\\s*,\\s*\\w+)*'],
    ['^(\\d{1,3}\\.){3}\\d{1,3}$'],
    ['^.*(foo|bar).*$'],
    ['x*x*'],
    ['^[a-z]+(-[a-z]+)*$'],
    ['^(feat|fix)+$'],
    ['(a?)*b'],
    ['^[A-Z]+-\\d+'],
    ['\\b(?:WIP|wip)\\b'],
    ['^v\\d+\\.\\d+\\.\\d+(-[\\w.]+)?$'],
    ['^(?:(?!\\bWIP\\b).)*$'],
    ['(\\w)\\1+'],
    ['(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)\\12+'],
    ['^(?<word>\\w+)-\\k<word>$'],
    ['a{'],
    ['a{2}b{2,}c{1,3}?'],
    ['^\\x41\\u0042\\cJ\\0\\/$'],
    ['[\\]a]+[^\\]]+'],
    ['\\u12'],
    // Nothing after the repeat can fail, so it is never backtracked into.
    ['^feat: (\\w+\\s?)+'],
    ['(a|aa)+'],
    ['^- \\[x\\] Confirmed by (@.*& .*){4,}'],
  ])('accepts %s', (source) => {
    expect(refused(source)).toBe(false)
  })

  it('checks with the flags the pattern runs with', () => {
    expect(refused('(A|a)+$')).toBe(false)
    expect(refused('(A|a)+$', 'i')).toBe(true)
    expect(refused('(?i:A|a)+$')).toBe(true)
    expect(refused('(?-i:A|a)+$', 'i')).toBe(false)
    expect(refused('(\\n|.)+$')).toBe(false)
    expect(refused('(\\n|.)+$', 's')).toBe(true)
    expect(refused('(?s:\\n|.)+$')).toBe(true)
  })

  it('reads unicode escapes, properties and set notation', () => {
    expect(refused('(\\p{L}|\\u{61})+$', 'u')).toBe(true)
    expect(refused('(\\p{Lu}|\\u{61})+$', 'u')).toBe(false)
    expect(refused('(\u{1f600}|\u{1f600})+$', 'u')).toBe(true)
    expect(refused('(\u{1f600}|\u{1f601})+$', 'u')).toBe(false)
    expect(refused('([[a-z]--[aeiou]]|b)+$', 'v')).toBe(true)
    expect(refused('([[a-z]--[aeiou]]|a)+$', 'v')).toBe(false)
    expect(refused('(\\u3042|[\\u3040-\\u309f])+$')).toBe(true)
    expect(refused('(\\x41|[B-Z])+$')).toBe(false)
  })

  it('names where the problem is and how to fix it', () => {
    expect(backtrackingRisk('^(a+)+$')).toBe(
      'the repeated part around character 3 can match the same text in more than one way, ' +
        'so some inputs make it run for minutes (catastrophic backtracking); rewrite it so each character can be matched only one way',
    )
  })

  it('refuses a pattern too large to check', () => {
    expect(backtrackingRisk('a'.repeat(2_001))).toBe(
      'it is too large to check for catastrophic backtracking; split it into smaller patterns',
    )
    expect(backtrackingRisk(`(?:${'.*'.repeat(60)})+`)).toContain('too large to check')
  })

  it('passes other errors on', () => {
    expect(() => backtrackingRisk('(unclosed')).toThrow(SyntaxError)
    expect(() => backtrackingRisk('a', 'q')).toThrow(SyntaxError)
  })

  it('refuses them quickly, before they can run', () => {
    const started = performance.now()
    expect(refused('^(a+)+$')).toBe(true)
    expect(performance.now() - started).toBeLessThan(1_000)
  })

  // Every pattern the docs' YAML examples and smartcloud's own configs, v1
  // included, show must keep working. (Refused patterns the docs discuss are
  // written inline, never as a YAML example.)
  it('accepts every pattern in the docs and the shipped configs', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')
    const docs = (readdirSync(join(root, 'docs'), { recursive: true }) as Array<string>)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => join(root, 'docs', file))
    const configs = [
      join(root, '.github/smartcloud.yml'),
      join(root, '.github/config.json'),
      join(root, 'tests/config/src/fixtures/v1-smartcloud.json'),
    ]
    const values = (value: unknown): Array<string> =>
      typeof value === 'string'
        ? [value]
        : typeof value === 'object' && value !== null
          ? Object.values(value).flatMap(values)
          : []
    // Each YAML scalar, list item or key value on its own line, unquoted.
    const scalars = (yaml: string): Array<string> =>
      yaml.split('\n').flatMap((line) => {
        const value = /^\s*(?:- )?(?:[\w$.-]+:\s+)?(.+?)\s*$/.exec(line)?.[1] ?? ''
        if (/^'.*'$/.test(value)) return [value.slice(1, -1).replaceAll("''", "'")]
        if (/^".*"$/.test(value)) return [JSON.parse(value) as string]
        return [value.replace(/\s+#.*$/, '')]
      })
    const patterns = [...docs, ...configs].flatMap((file) => {
      const text = readFileSync(file, 'utf8')
      if (file.endsWith('.json')) return values(JSON.parse(text))
      if (!file.endsWith('.mdx')) return scalars(text)
      return [...text.matchAll(/```ya?ml[^\n]*\n([\s\S]*?)```/g)].flatMap((block) => scalars(block[1] ?? ''))
    })
    const compiled = patterns.flatMap((pattern) => {
      try {
        return [new RegExp(pattern)]
      } catch {
        return []
      }
    })
    expect(compiled.length).toBeGreaterThan(100)
    expect(
      patterns.filter((pattern) => {
        try {
          compilePattern(pattern)
          return false
        } catch (error) {
          return String(error).includes('backtracking')
        }
      }),
    ).toStrictEqual([])
  })
})
