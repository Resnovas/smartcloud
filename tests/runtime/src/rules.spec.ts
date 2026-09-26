/**
 * @file tests/runtime/src/rules.spec.ts
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
import type { SmartcloudConfig } from '@resnovas/config'
import { explainRule, UnknownRule } from '@resnovas/runtime'
import { Effect } from 'effect'

const config: SmartcloudConfig = {
  version: 2,
  links: { policyBase: 'https://example.com/policy/' },
  conventions: {
    rules: {
      title: { preset: 'conventionalCommits', contexts: ['cli'] },
      custom: { message: 'Say what changed.', when: { condition: [{ type: 'titleMatches', condition: 'x' }] } },
      bare: { when: { condition: [{ type: 'titleMatches', condition: 'x' }] } },
    },
  },
}

describe('explainRule', () => {
  it.effect('explains policy rules from the catalogue, linked under links.policyBase, ignoring case', () =>
    Effect.gen(function* () {
      const ai02 = yield* explainRule('ai-02', config)
      expect(ai02.rule).toBe('AI-02')
      expect(ai02.link).toBe('https://example.com/policy/AI_POLICY.md#ai-02')
      expect(ai02.fix).toContain('Assisted-by')
      for (const rule of ['AI-01', 'AI-03', 'AI-20', 'AI-21', 'DCO', 'SYNC', 'REVIEW']) {
        expect((yield* explainRule(rule, config)).link).toMatch(/^https:\/\/example\.com\/policy\/[A-Z_]+\.md#/)
      }
      expect((yield* explainRule('DCO', { version: 2 })).link).toContain('Resnovas')
    }),
  )

  it.effect('explains a convention from its message, its preset, or its conditions', () =>
    Effect.gen(function* () {
      expect((yield* explainRule('conventions.title', config)).fix).toContain('Scopes, when given: cli.')
      expect((yield* explainRule('conventions.custom', config)).fix).toBe('Say what changed.')
      expect((yield* explainRule('conventions.bare', config)).fix).toContain('conditions')
      expect(yield* Effect.flip(explainRule('conventions.missing', config))).toBeInstanceOf(UnknownRule)
      expect(yield* Effect.flip(explainRule('conventions.title', { version: 2 }))).toBeInstanceOf(UnknownRule)
    }),
  )

  it.effect('calls feature notices notices, and rejects anything else by name', () =>
    Effect.gen(function* () {
      const notice = yield* explainRule('stale.sweep', config)
      expect(notice.summary).toBe('An operational notice from the stale feature, not a policy rule.')
      expect(notice.link).toBeUndefined()
      for (const rule of ['stale', 'nope.x', 'AI-99']) {
        const error = yield* Effect.flip(explainRule(rule, config))
        expect(error.message).toContain(`"${rule}"`)
      }
    }),
  )
})
