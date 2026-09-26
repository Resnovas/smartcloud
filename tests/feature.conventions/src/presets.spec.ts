/**
 * @file tests/feature.conventions/src/presets.spec.ts
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

import { describe, expect, it } from '@effect/vitest'
import { gitmojis } from 'gitmojis'
import { CONVENTIONAL_TYPES, matchesPreset, type Preset, presetDescription, SEMANTIC_TYPES } from '@resnovas/feature.conventions'

// v1's presets, rebuilt from legacy/src/contexts/methods/conventions.ts: the
// same patterns and the same `requires`. Used only as an oracle on the fixed
// titles below, never on user input.
const v1 = (preset: Exclude<Preset, 'conventionalCommits'>, contexts: ReadonlyArray<string> | undefined) => {
  const patterns: Array<string> = []
  let requires = preset === 'semanticEmoji' ? 2 : 1
  for (const gitmoji of preset === 'semanticTitle' ? [] : gitmojis) {
    const middle = preset === 'semanticEmoji' ? '.*' : ''
    for (const form of [gitmoji.emoji, gitmoji.code, gitmoji.entity]) patterns.push(`^${form}${middle}(\\(.*\\))?:`)
  }
  for (const type of preset === 'gitmojis' ? [] : SEMANTIC_TYPES) {
    patterns.push(preset === 'semanticEmoji' ? `^.*${type}(\\(.*\\))?:` : `^${type}(\\(.*\\))?:`)
  }
  if (contexts) {
    requires += 1
    for (const context of contexts) patterns.push(`\\(.*${context}.*\\):`)
  }
  return (title: string) => patterns.filter((pattern) => new RegExp(pattern, 'i').test(title)).length >= requires
}

const byName = (name: string) => {
  const found = gitmojis.find((gitmoji) => gitmoji.name === name)
  if (found === undefined) throw new Error(`no gitmoji ${name}`)
  return found
}
const bug = byName('bug')
const zap = byName('zap')

const TITLES = [
  '',
  'random words',
  'fix: typo',
  'Fix: typo',
  'FIX(Labels): typo',
  'fix(labels): typo',
  'fix(labels) typo',
  'fix (labels): typo',
  'fixes: typo',
  'feature: new thing',
  'feat!: breaking',
  'bug(a)(b): x',
  'chore(x\n): y',
  'fix\n: x',
  'x\nfix: y',
  'x\n(labels): y',
  'fix: thing (labels): more',
  '(labels): nothing else',
  '(smartcloud): two contexts, no type',
  'fix(smartcloud): x',
  'fix(a): x (b): y',
  'fix: bug: x',
  'refactor(labels\u2028): x',
  'opt: x',
  'optimisation(labels): x',
  `${bug.emoji}: x`,
  `${bug.emoji}(labels): x`,
  `${bug.emoji} fix: x`,
  `${bug.emoji} fix(labels): x`,
  `${bug.emoji} fix labels`,
  `${bug.code}: x`,
  `${bug.code}: fix: x`,
  `${bug.code}:: x`,
  `${bug.code}(labels): x`,
  `${bug.code} x`,
  `${bug.entity}: x`,
  `${bug.entity} feat(labels): x`,
  `${zap.emoji}: x`,
  `${zap.emoji.slice(0, 1)}: x`,
  `${zap.code} perf(labels): x`,
  `x ${bug.emoji} fix: y`,
]

const CONTEXTS: ReadonlyArray<ReadonlyArray<string> | undefined> = [undefined, ['labels'], ['smart', 'cloud'], ['LABELS', 'x'], ['']]

describe('matchesPreset', () => {
  describe.each(['semanticTitle', 'gitmojis', 'semanticEmoji'] as const)('%s accepts exactly what v1 accepted', (preset) => {
    it.each(CONTEXTS.map((contexts) => [JSON.stringify(contexts), contexts] as const))('with contexts %s', (_, contexts) => {
      const oracle = v1(preset, contexts)
      const mismatches = TITLES.filter((title) => matchesPreset(preset, title, contexts) !== oracle(title))
      expect(mismatches).toStrictEqual([])
    })
  })

  it('the v1 presets accept their documented forms', () => {
    expect(matchesPreset('semanticTitle', 'feat(labels): sync')).toBe(true)
    expect(matchesPreset('semanticTitle', 'feat(labels): sync', ['labels'])).toBe(true)
    expect(matchesPreset('semanticTitle', 'feat(config): sync', ['labels'])).toBe(false)
    expect(matchesPreset('gitmojis', `${bug.emoji}(labels): fix`)).toBe(true)
    expect(matchesPreset('semanticEmoji', `${bug.code} fix(labels): fix`, ['labels'])).toBe(true)
    expect(matchesPreset('semanticEmoji', 'fix(labels): fix')).toBe(false)
  })

  it('conventionalCommits accepts type(scope)!: description for every listed type', () => {
    for (const type of CONVENTIONAL_TYPES) {
      expect(matchesPreset('conventionalCommits', `${type}: do it`)).toBe(true)
      expect(matchesPreset('conventionalCommits', `${type}(labels)!: do it`)).toBe(true)
    }
    expect(matchesPreset('conventionalCommits', 'feat!: breaking')).toBe(true)
  })

  it('conventionalCommits rejects other types, casing, spacing and empty descriptions', () => {
    for (const title of ['bug: x', 'Feat: x', 'feat:x', 'feat: ', 'feat(): x', 'feat(a(b)): x', 'feat (a): x', 'feat(a):  ', 'feat', '']) {
      expect(matchesPreset('conventionalCommits', title)).toBe(false)
    }
  })

  it('conventionalCommits with contexts restricts the scope, when there is one', () => {
    expect(matchesPreset('conventionalCommits', 'fix(labels): x', ['labels', 'config'])).toBe(true)
    expect(matchesPreset('conventionalCommits', 'fix(engine): x', ['labels', 'config'])).toBe(false)
    expect(matchesPreset('conventionalCommits', 'fix: x', ['labels'])).toBe(true)
    expect(matchesPreset('conventionalCommits', 'fix(engine): x', [])).toBe(true)
  })

  it('runs in linear time on hostile titles', () => {
    const hostile = [`(${'a'.repeat(100_000)}`, `fix(${'x'.repeat(100_000)}`, `${bug.emoji}${'fix('.repeat(25_000)}`, `feat(${'a'.repeat(100_000)}`]
    const started = performance.now()
    for (const title of hostile) {
      for (const preset of ['conventionalCommits', 'semanticTitle', 'gitmojis', 'semanticEmoji'] as const) {
        expect(matchesPreset(preset, title, ['a', 'b'])).toBe(false)
      }
    }
    expect(performance.now() - started).toBeLessThan(2_000)
  })
})

describe('presetDescription', () => {
  it('describes each preset, listing its types and any contexts', () => {
    expect(presetDescription('conventionalCommits')).toContain('Types: feat, fix, perf')
    expect(presetDescription('conventionalCommits')).not.toContain('Scopes')
    expect(presetDescription('conventionalCommits', ['labels', 'config'])).toContain('Scopes, when given: labels, config.')
    expect(presetDescription('semanticTitle', ['labels'])).toContain('Types: bug, chore, opt')
    expect(presetDescription('semanticTitle', ['labels'])).toContain('contexts in parentheses: labels.')
    expect(presetDescription('gitmojis')).toContain(`- ${bug.emoji} or ${bug.code}: ${bug.description}`)
    expect(presetDescription('gitmojis')).toContain('https://gitmoji.dev/')
    const emoji = presetDescription('semanticEmoji', ['labels'])
    expect(emoji).toContain(`- ${zap.emoji} or ${zap.code}: ${zap.description}`)
    expect(emoji).toContain('Types: bug, chore')
    expect(emoji).toContain('https://www.conventionalcommits.org/en/v1.0.0/')
    expect(emoji).toContain('contexts in parentheses: labels.')
  })

  it('lists only the gitmojis that carry a semver bump, as v1 did', () => {
    const art = byName('art')
    expect(art.semver).toBeNull()
    expect(presetDescription('gitmojis')).not.toContain(art.code)
  })
})
