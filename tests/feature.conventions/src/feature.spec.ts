/**
 * @file tests/feature.conventions/src/feature.spec.ts
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
import { readFileSync } from 'node:fs'
import { Effect } from 'effect'
import { gitmojis } from 'gitmojis'
import type { ConditionGroup } from '@resnovas/conditions'
import { parseConfig, type ConventionRule, type SmartcloudConfig } from '@resnovas/config'
import { makeReport, Report, runFeatures } from '@resnovas/engine'
import { conventions, describeEvaluation, presetDescription } from '@resnovas/feature.conventions'
import { GitHub, GitHubMemory, makeMemoryGitHub } from '@resnovas/integrations.github'

const pullRequest = (title: string, body: string | null = null) => ({
  action: 'opened',
  pull_request: {
    number: 7,
    title,
    body,
    user: { login: 'jane' },
    state: 'open',
    locked: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
    draft: false,
    head: { ref: 'feat/labels', sha: 'abc123' },
    additions: 3,
    deletions: 1,
  },
})

const issue = (title: string, body: string | null = null) => ({
  action: 'opened',
  issue: {
    number: 3,
    title,
    body,
    user: { login: 'sam' },
    state: 'open',
    locked: false,
    labels: [],
    updated_at: '2026-09-01T00:00:00Z',
  },
})

const configWith = (rules: Record<string, ConventionRule>): SmartcloudConfig => ({ version: 2, conventions: { rules } })

const run = (config: SmartcloudConfig, event: 'pull_request' | 'issues', payload: unknown) =>
  runFeatures({ config, event, payload, features: [conventions] }).pipe(Effect.provide(GitHubMemory()))

const titled = (pattern: string): ConditionGroup => ({ condition: [{ type: 'titleMatches', condition: pattern }] })

describe('conventions feature', () => {
  it('is enabled only when there are rules, and asks for the facets their conditions need', () => {
    expect(conventions.enabled?.({ version: 2 })).toBe(false)
    expect(conventions.enabled?.({ version: 2, conventions: {} })).toBe(false)
    expect(conventions.enabled?.(configWith({}))).toBe(false)
    const config = configWith({
      signed: { when: { condition: [{ type: 'commitsSignedOff', condition: true }] } },
      title: { preset: 'conventionalCommits' },
    })
    expect(conventions.enabled?.(config)).toBe(true)
    expect([...(conventions.facets?.(config) ?? [])]).toStrictEqual(['commits'])
    const issueOnly = configWith({
      signed: { on: ['issue'], when: { condition: [{ type: 'commitsSignedOff', condition: true }] } },
    })
    expect([...(conventions.facets?.(issueOnly) ?? [])]).toStrictEqual([])
    expect(conventions.handles).toStrictEqual(['pullRequest', 'issue'])
  })

  it.effect('records nothing when every rule passes', () =>
    Effect.gen(function* () {
      const result = yield* run(
        configWith({ title: { preset: 'conventionalCommits', when: titled('labels') } }),
        'pull_request',
        pullRequest('feat(labels): sync'),
      )
      expect(result.ran).toStrictEqual(['conventions'])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('a failing preset is an error explaining the preset, unless the rule sets a level and message', () =>
    Effect.gen(function* () {
      const config = configWith({
        plain: { preset: 'conventionalCommits', contexts: ['labels'] },
        custom: { preset: 'conventionalCommits', level: 'warning', message: 'Use a conventional title.' },
      })
      const result = yield* run(config, 'pull_request', pullRequest('Sync labels'))
      expect(result.findings).toStrictEqual([
        {
          feature: 'conventions',
          rule: 'conventions.plain',
          level: 'error',
          message: presetDescription('conventionalCommits', ['labels']),
        },
        { feature: 'conventions', rule: 'conventions.custom', level: 'warning', message: 'Use a conventional title.' },
      ])
    }),
  )

  it.effect('a rule passes only when both its preset and its when pass, and explains each failing part', () =>
    Effect.gen(function* () {
      const config = configWith({ both: { preset: 'conventionalCommits', when: titled('^feat') } })
      const presetOnly = yield* run(config, 'pull_request', pullRequest('fix: typo'))
      expect(presetOnly.findings.map((finding) => finding.message)).toStrictEqual([
        'Expected 1 of 1 condition(s) to pass, but 0 did: title does not match ^feat',
      ])
      const neither = yield* run(config, 'pull_request', pullRequest('typo'))
      expect(neither.findings[0]?.message).toBe(
        `${presetDescription('conventionalCommits')}\n\nExpected 1 of 1 condition(s) to pass, but 0 did: title does not match ^feat`,
      )
    }),
  )

  it.effect('applies a rule only to the subjects in its on, both when omitted', () =>
    Effect.gen(function* () {
      const config = configWith({
        prs: { on: ['pullRequest'], preset: 'conventionalCommits' },
        issues: { on: ['issue'], preset: 'conventionalCommits' },
        both: { preset: 'conventionalCommits' },
      })
      const onIssue = yield* run(config, 'issues', issue('Something broke'))
      expect(onIssue.findings.map((finding) => finding.rule)).toStrictEqual(['conventions.issues', 'conventions.both'])
      const onPullRequest = yield* run(config, 'pull_request', pullRequest('Something broke'))
      expect(onPullRequest.findings.map((finding) => finding.rule)).toStrictEqual([
        'conventions.prs',
        'conventions.both',
      ])
    }),
  )

  it.effect('does nothing without a subject', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      yield* conventions
        .run({
          config: configWith({ title: { preset: 'conventionalCommits' } }),
          envelope: { kind: 'repository', event: 'push', headSha: 'a' },
        })
        .pipe(Effect.provideService(Report, report), Effect.provideService(GitHub, makeMemoryGitHub().service))
      expect((yield* report.snapshot).findings).toStrictEqual([])
    }),
  )

  it('explains a failed $not by the conditions inside it that held', () => {
    expect(
      describeEvaluation({
        passed: false,
        matched: 0,
        required: 2,
        results: [
          {
            type: '$not',
            passed: false,
            detail: 'the group passed',
            groups: [
              {
                passed: true,
                matched: 1,
                required: 1,
                results: [
                  { type: 'titleMatches', passed: true, detail: 'title matches x' },
                  { type: 'descriptionMatches', passed: false, detail: 'description does not match x' },
                ],
              },
            ],
          },
          { type: '$not', passed: false, detail: 'the group passed' },
        ],
      }),
    ).toBe('Expected 2 of 2 condition(s) to pass, but 0 did: not expected: title matches x')
  })

  it('explains a failed $and or $or by the conditions inside it that failed, and keeps the count for $only', () => {
    const group = {
      passed: false,
      matched: 0,
      required: 1,
      results: [{ type: 'titleMatches', passed: false, detail: 'title does not match ^feat' }],
    }
    expect(
      describeEvaluation({
        passed: false,
        matched: 0,
        required: 3,
        results: [
          { type: '$and', passed: false, detail: '0 of 1 group(s) passed', groups: [group] },
          { type: '$or', passed: false, detail: '0 of 1 group(s) passed' },
          { type: '$only', passed: false, detail: '0 of 1 group(s) passed', groups: [group] },
        ],
      }),
    ).toBe(
      'Expected 3 of 3 condition(s) to pass, but 0 did: 0 of 1 group(s) passed (title does not match ^feat); 0 of 1 group(s) passed; 0 of 1 group(s) passed',
    )
  })
})

describe("smartcloud's own v1 config", () => {
  const fixture = readFileSync(new URL('../../config/src/fixtures/v1-smartcloud.json', import.meta.url), 'utf8')
  const bug = gitmojis.find((gitmoji) => gitmoji.name === 'bug')

  it.effect('migrates enforceConventions to shared.0, the semanticEmoji preset, and enforces it as v1 did', () =>
    Effect.gen(function* () {
      const { config } = yield* parseConfig(fixture, 'smartcloud/.github/config.json')
      expect(config.conventions?.rules?.['shared.0']).toStrictEqual({ preset: 'semanticEmoji' })

      const good = yield* run(
        config,
        'pull_request',
        pullRequest(`${bug?.emoji ?? ''} fix(labels): stop duplicate labels`),
      )
      expect(good.findings).toStrictEqual([])
      const shortcode = yield* run(config, 'issues', issue(`${bug?.code ?? ''} bug: labels duplicate`))
      expect(shortcode.findings).toStrictEqual([])

      const bad = yield* run(config, 'pull_request', pullRequest('fix(labels): stop duplicate labels'))
      expect(bad.findings).toStrictEqual([
        {
          feature: 'conventions',
          rule: 'conventions.shared.0',
          level: 'error',
          message: presetDescription('semanticEmoji'),
        },
      ])
    }),
  )
})

describe('house style through when and $not', () => {
  // The rules the house preset config expresses; the same YAML is in the
  // SMC-7 report. Each forbids a pattern with a $not.
  const house = configWith({
    'house.noEmoji': {
      message: 'Remove emoji from the title and description.',
      when: {
        condition: [
          {
            type: '$not',
            condition: {
              requires: 1,
              condition: [
                { type: 'titleMatches', condition: '/[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3]/u' },
                {
                  type: 'descriptionMatches',
                  condition: '/[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3]/u',
                },
              ],
            },
          },
        ],
      },
    },
    'house.noLongDashes': {
      message: 'Replace em and en dashes with ASCII hyphens.',
      when: {
        condition: [
          {
            type: '$not',
            condition: {
              requires: 1,
              condition: [
                { type: 'titleMatches', condition: '[\\u2013\\u2014]' },
                { type: 'descriptionMatches', condition: '[\\u2013\\u2014]' },
              ],
            },
          },
        ],
      },
    },
    'house.checklistDone': {
      on: ['pullRequest'],
      message: 'Tick or remove every checklist item before review.',
      when: {
        condition: [
          {
            type: '$not',
            condition: { condition: [{ type: 'descriptionMatches', condition: '/^[ \\t]*[-*+] \\[ \\]/m' }] },
          },
        ],
      },
    },
  })

  const failing = (title: string, body: string | null, event: 'pull_request' | 'issues' = 'pull_request') =>
    Effect.map(run(house, event, event === 'issues' ? issue(title, body) : pullRequest(title, body)), (result) =>
      result.findings.map((finding) => finding.rule),
    )

  it.effect('decodes as a v2 config', () =>
    Effect.gen(function* () {
      const { config } = yield* parseConfig(JSON.stringify(house), 'house.yml')
      expect(config).toStrictEqual(house)
    }),
  )

  it.effect('passes a clean title and description, including an empty one', () =>
    Effect.gen(function* () {
      expect(
        yield* failing(
          'feat(labels): sync labels - fast',
          '## Summary\n\n- [x] Tests added\n- plain item\n\nSee [docs](x).',
        ),
      ).toStrictEqual([])
      expect(yield* failing('fix: typo', null)).toStrictEqual([])
    }),
  )

  it.effect('flags emoji in the title or the description', () =>
    Effect.gen(function* () {
      expect(yield* failing(`feat: sync ${String.fromCodePoint(0x1f680)}`, null)).toStrictEqual([
        'conventions.house.noEmoji',
      ])
      expect(yield* failing('feat: sync', `Done ${String.fromCodePoint(0x2728)}`)).toStrictEqual([
        'conventions.house.noEmoji',
      ])
      // Flags are regional-indicator pairs and keycaps end in U+20E3; neither is Extended_Pictographic.
      expect(yield* failing(`feat: sync ${String.fromCodePoint(0x1f1ec, 0x1f1e7)}`, null)).toStrictEqual([
        'conventions.house.noEmoji',
      ])
      expect(yield* failing('feat: sync', 'Step 1\ufe0f\u20e3')).toStrictEqual(['conventions.house.noEmoji'])
    }),
  )

  it.effect('flags em and en dashes', () =>
    Effect.gen(function* () {
      expect(yield* failing('feat: sync \u2014 fast', null)).toStrictEqual(['conventions.house.noLongDashes'])
      expect(yield* failing('feat: sync', 'pages 1\u20132')).toStrictEqual(['conventions.house.noLongDashes'])
    }),
  )

  it.effect('flags unticked checklist items on pull requests, however they are bulleted or indented', () =>
    Effect.gen(function* () {
      for (const body of ['- [ ] Tests', 'Intro\n  * [ ] Docs', 'Intro\r\n\t+ [ ] Changelog\r\n- [x] Done']) {
        expect(yield* failing('feat: sync', body)).toStrictEqual(['conventions.house.checklistDone'])
      }
      expect(yield* failing('feat: sync', '- [ ] Tests', 'issues')).toStrictEqual([])
    }),
  )

  it.effect('reports each broken rule with its message', () =>
    Effect.gen(function* () {
      const result = yield* run(
        house,
        'pull_request',
        pullRequest(`feat: sync ${String.fromCodePoint(0x1f680)} \u2013 fast`, '- [ ] Tests'),
      )
      expect(result.findings).toStrictEqual([
        {
          feature: 'conventions',
          rule: 'conventions.house.noEmoji',
          level: 'error',
          message: 'Remove emoji from the title and description.',
        },
        {
          feature: 'conventions',
          rule: 'conventions.house.noLongDashes',
          level: 'error',
          message: 'Replace em and en dashes with ASCII hyphens.',
        },
        {
          feature: 'conventions',
          rule: 'conventions.house.checklistDone',
          level: 'error',
          message: 'Tick or remove every checklist item before review.',
        },
      ])
    }),
  )
})
