/**
 * @file tests/feature.disclosure/src/parse.spec.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
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
import { DEFAULT_LABELS, disclosureLabels, isLevel, LEVELS, parseDisclosure, stripHtmlComments } from '@resnovas/feature.disclosure'
import { body } from './fixtures.js'

describe('stripHtmlComments', () => {
  it('removes every comment and keeps the text around them', () => {
    expect(stripHtmlComments('a<!-- one -->b<!--\ntwo\n-->c')).toBe('abc')
    expect(stripHtmlComments('no comments')).toBe('no comments')
  })

  it('treats an unclosed comment as hiding the rest, as GitHub renders it', () => {
    expect(stripHtmlComments('a<!-- open\nAI level: agent')).toBe('a')
  })

  it('does not close a comment on its own opening dashes', () => {
    expect(stripHtmlComments('a<!-->b-->c')).toBe('ac')
  })

  it('stays linear on a hostile description', () => {
    const hostile = `${'<!--'.repeat(100_000)}${'-'.repeat(100_000)}`
    const started = performance.now()
    expect(stripHtmlComments(hostile)).toBe('')
    expect(stripHtmlComments(`x${'<!-- -->'.repeat(100_000)}y`)).toBe('xy')
    expect(performance.now() - started).toBeLessThan(1000)
  })
})

describe('parseDisclosure', () => {
  it('reads every field, lower-casing the level', () => {
    expect(parseDisclosure(body({ level: 'Agent' }))).toStrictEqual({
      level: 'agent',
      tools: 'Claude Code (claude-opus-5-5)',
      accountable: '@contrib',
      review: 'Read every line; ran pnpm nx test auth, log attached.',
    })
  })

  it('does not read template guidance inside HTML comments as an answer', () => {
    expect(parseDisclosure('<!--\nAI level: agent\n-->\nAI level:\n').level).toBeUndefined()
  })

  it('ignores case, leading whitespace, backticks and carriage returns', () => {
    expect(parseDisclosure('  ai LEVEL: `chat`\r\nAI Tools:\t`Copilot` \r\n')).toStrictEqual({ level: 'chat', tools: 'Copilot' })
  })

  it('takes the first line with a label, even when it is empty', () => {
    expect(parseDisclosure('AI level:\nAI level: agent').level).toBeUndefined()
    expect(parseDisclosure('AI levels: agent\nAI level: chat').level).toBe('chat')
  })

  it('reads renamed labels literally, metacharacters and all', () => {
    const labels = disclosureLabels({ level: 'Autonomy (level)', review: 'Reviewed?' })
    expect(labels).toStrictEqual({ ...DEFAULT_LABELS, level: 'Autonomy (level)', review: 'Reviewed?' })
    expect(parseDisclosure('Autonomy (level): none\nReviewed?: yes\nAutonomy level: chat', labels)).toStrictEqual({ level: 'none', review: 'yes' })
    expect(disclosureLabels(undefined)).toStrictEqual(DEFAULT_LABELS)
  })

  it('knows the AI_POLICY.md levels', () => {
    expect(LEVELS).toStrictEqual(['none', 'autocomplete', 'chat', 'agent', 'autonomous'])
    expect(LEVELS.every(isLevel)).toBe(true)
    expect(isLevel('some')).toBe(false)
  })
})
