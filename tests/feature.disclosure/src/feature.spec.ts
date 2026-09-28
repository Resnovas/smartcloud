/**
 * @file tests/feature.disclosure/src/feature.spec.ts
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
import type { SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report } from '@resnovas/engine'
import { disclosureFeature } from '@resnovas/feature.disclosure'
import { GitHubMemory } from '@resnovas/integrations.github'
import { Effect, Exit } from 'effect'
import { body, coAuthor, commit, roles, rules, runOn, signed } from './fixtures.js'

const config: SmartcloudConfig = { version: 2, disclosure: {}, roles }
const base = 'https://github.com/Resnovas/.github/blob/main/AI_POLICY.md'
const aiCommit = commit(`x\n\n${coAuthor}\n${signed}`)

describe('disclosureFeature', () => {
  it('is enabled by a disclosure section, handles pull requests and loads commits', () => {
    expect(disclosureFeature.enabled?.({ version: 2 })).toBe(false)
    expect(disclosureFeature.enabled?.(config)).toBe(true)
    expect(disclosureFeature.handles).toStrictEqual(['pullRequest'])
    expect([...(disclosureFeature.facets?.(config) ?? [])]).toStrictEqual(['commits'])
  })

  it.effect('a compliant AI-assisted pull request passes', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body(),
        commits: [aiCommit],
        action: 'ready_for_review',
      })
      expect(result.ran).toStrictEqual(['disclosure'])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('a compliant pull request with no AI passes', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ level: 'unassisted', tools: 'none', review: '' }),
        commits: [commit(`fix: x\n\n${signed}`)],
        action: 'opened',
      })
      expect(result.findings).toStrictEqual([])
      const legacy = yield* runOn(disclosureFeature, {
        config,
        body: body({ level: 'none', tools: 'none', review: '' }),
        commits: [commit(`fix: x\n\n${signed}`)],
        action: 'opened',
      })
      expect(legacy.findings).toStrictEqual([])
    }),
  )

  it.effect('a missing or invalid disclosure fails AI-01', () =>
    Effect.gen(function* () {
      const missing = yield* runOn(disclosureFeature, {
        config,
        body: 'no disclosure',
        commits: [commit(`x\n\n${signed}`)],
      })
      expect(missing.findings).toStrictEqual([
        {
          feature: 'disclosure',
          rule: 'AI-01',
          level: 'error',
          message:
            'The AI disclosure is missing. Fill in "AI level:" with one of: unassisted, autocomplete, chat, agent, autonomous.',
          link: `${base}#ai-01`,
        },
      ])
      const invalid = yield* runOn(disclosureFeature, { config, body: body({ level: 'some' }), commits: [aiCommit] })
      expect(rules(invalid.findings, 'error')).toStrictEqual(['AI-01'])
      expect(invalid.findings[0]?.message).toBe(
        '"AI level: some" is not a level. Use one of: unassisted, autocomplete, chat, agent, autonomous.',
      )
    }),
  )

  it.effect('template guidance inside HTML comments is not read as an answer', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: '<!--\nAI level: agent\n-->\nAI level:\n',
        commits: [],
      })
      expect(result.findings[0]?.message).toContain('The AI disclosure is missing.')
    }),
  )

  it.effect('an AI level other than unassisted must name tools and credit a co-author', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ tools: 'none' }),
        commits: [commit(`x\n\n${signed}`)],
      })
      expect(result.findings.map((finding) => [finding.rule, finding.message])).toStrictEqual([
        ['AI-01', 'AI level is agent; name every tool and model in "AI tools:".'],
        ['AI-02', 'AI level is agent but no commit has a Co-authored-by trailer for the AI tool.'],
      ])
    }),
  )

  it.effect('an Assisted-by alone does not count as crediting a co-author', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body(),
        commits: [commit(`x\n\nAssisted-by: aider:gpt-5\n${signed}`)],
      })
      expect(rules(result.findings, 'error')).toStrictEqual(['AI-02'])
    }),
  )

  it.effect('claiming no AI while crediting an AI co-author is inconsistent', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ level: 'unassisted', tools: 'none' }),
        commits: [aiCommit, commit(`y\n\n${signed}`, { sha: 'human' })],
      })
      expect(result.findings).toStrictEqual([
        {
          feature: 'disclosure',
          rule: 'AI-01',
          level: 'error',
          message: 'AI level is unassisted but this commit credits an AI tool.',
          link: `${base}#ai-01`,
          commit: 'a'.repeat(40),
        },
      ])
    }),
  )

  it.effect('claiming no AI while carrying only Assisted-by is inconsistent', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ level: 'unassisted', tools: 'none' }),
        commits: [commit(`x\n\nAssisted-by: aider:gpt-5\n${signed}`)],
      })
      expect(rules(result.findings, 'error')).toStrictEqual(['AI-01'])
    }),
  )

  it.effect('claiming no AI while listing AI tools is inconsistent', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ level: 'unassisted', tools: 'Copilot' }),
        commits: [commit(`x\n\n${signed}`)],
      })
      expect(result.findings.map((finding) => finding.message)).toStrictEqual([
        'AI level is unassisted but AI tools lists "Copilot".',
      ])
    }),
  )

  it.effect('AI-assisted pull requests must be opened as drafts', () =>
    Effect.gen(function* () {
      const opened = yield* runOn(disclosureFeature, { config, body: body(), commits: [aiCommit], action: 'opened' })
      expect(opened.findings).toStrictEqual([
        {
          feature: 'disclosure',
          rule: 'AI-20',
          level: 'error',
          message: 'AI-assisted pull requests must be opened as drafts. Convert this one to a draft.',
          link: `${base}#ai-20`,
        },
      ])
      const asDraft = yield* runOn(disclosureFeature, {
        config,
        body: body({ accountable: '', review: '' }),
        commits: [aiCommit],
        draft: true,
        action: 'opened',
      })
      expect(asDraft.findings).toStrictEqual([])
    }),
  )

  it.effect('requireDraft: false allows opening an AI-assisted pull request ready for review', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config: { ...config, disclosure: { requireDraft: false } },
        body: body(),
        commits: [aiCommit],
        action: 'opened',
      })
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('leaving draft requires the author as accountable human and a review statement', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ accountable: '@someone-else', review: '' }),
        commits: [aiCommit],
        action: 'ready_for_review',
      })
      expect(result.findings.map((finding) => [finding.rule, finding.message, finding.link])).toStrictEqual([
        ['AI-21', '"Accountable human:" must be the pull request author, @contrib.', `${base}#ai-21`],
        [
          'AI-21',
          '"Human review:" is empty. State what you personally reviewed and ran before marking this ready.',
          `${base}#ai-21`,
        ],
      ])
      const missing = yield* runOn(disclosureFeature, { config, body: body({ accountable: '' }), commits: [aiCommit] })
      expect(rules(missing.findings)).toStrictEqual(['AI-21'])
    }),
  )

  it.effect('the accountable human matches the author ignoring case, with or without @', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        body: body({ accountable: 'CONTRIB' }),
        commits: [aiCommit],
      })
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('maintainer pull requests report policy errors as warnings, or at the configured level', () =>
    Effect.gen(function* () {
      const warned = yield* runOn(disclosureFeature, {
        config,
        author: 'owner-one',
        body: 'nothing',
        commits: [commit('x')],
        action: 'opened',
      })
      expect(warned.findings.length).toBeGreaterThan(0)
      expect(rules(warned.findings, 'error')).toStrictEqual([])
      const strict = yield* runOn(disclosureFeature, {
        config: { ...config, disclosure: { maintainerLevel: 'error' } },
        author: 'owner-one',
        body: 'nothing',
        commits: [],
      })
      expect(rules(strict.findings, 'error')).toStrictEqual(['AI-01'])
    }),
  )

  it.effect('trusted automation accounts are skipped', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config,
        author: 'dependabot[bot]',
        body: '',
        commits: [commit('x')],
        action: 'opened',
      })
      expect(result.ran).toStrictEqual(['disclosure'])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('renamed labels, config AI identities and links.policyBase are honoured', () =>
    Effect.gen(function* () {
      const result = yield* runOn(disclosureFeature, {
        config: {
          ...config,
          disclosure: { fields: { level: 'Autonomy', tools: 'Tools used' } },
          commits: { aiIdentities: { names: ['^Robo$'] } },
          links: { policyBase: 'https://example.com/policy' },
        },
        body: 'Autonomy: none\nTools used: none',
        commits: [commit(`x\n\nCo-authored-by: Robo <robo@example.com>\n${signed}`)],
      })
      expect(result.findings).toMatchObject([
        {
          rule: 'AI-01',
          message: 'Autonomy is unassisted but this commit credits an AI tool.',
          link: 'https://example.com/policy/AI_POLICY.md#ai-01',
        },
      ])
    }),
  )

  it.effect('fails with a typed error when the commits were not loaded', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      const exit = yield* Effect.exit(
        disclosureFeature
          .run({ config: { version: 2 }, envelope: { kind: 'repository', event: 'schedule' } })
          .pipe(Effect.provideService(Report, report)),
      )
      expect(Exit.isFailure(exit)).toBe(true)
      expect(JSON.stringify(exit)).toContain('CommitsNotLoaded')
    }).pipe(Effect.provide(GitHubMemory())),
  )
})
