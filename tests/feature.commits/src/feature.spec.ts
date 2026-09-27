/**
 * @file tests/feature.commits/src/feature.spec.ts
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
import { checkCommitMessage, commitsFeature, CommitsNotLoaded } from '@resnovas/feature.commits'
import { GitHubMemory } from '@resnovas/integrations.github'
import { Effect, Exit } from 'effect'
import { coAuthor, commit, roles, rules, runOn, signed } from './fixtures.js'

const config: SmartcloudConfig = { version: 2, commits: {}, roles }
const sha = 'a'.repeat(40)

describe('commitsFeature', () => {
  it('is enabled by a commits section, handles pull requests and loads commits', () => {
    expect(commitsFeature.enabled?.({ version: 2 })).toBe(false)
    expect(commitsFeature.enabled?.(config)).toBe(true)
    expect(commitsFeature.handles).toStrictEqual(['pullRequest'])
    expect([...(commitsFeature.facets?.(config) ?? [])]).toStrictEqual(['commits'])
  })

  it.effect('a compliant AI-assisted pull request passes', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, { config, commits: [commit(`fix: x\n\n${coAuthor}\n${signed}`)] })
      expect(result.ran).toStrictEqual(['commits'])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('a compliant pull request with no AI passes', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, { config, commits: [commit(`fix: x\n\n${signed}`)] })
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('every non-merge commit needs a sign-off matching its author', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        commits: [
          commit(`x\n\n${coAuthor}\nSigned-off-by: Someone Else <else@example.com>`),
          commit('Merge main', { sha: 'm', parents: 2 }),
        ],
      })
      expect(result.findings).toStrictEqual([
        {
          feature: 'commits',
          rule: 'DCO',
          level: 'error',
          message: 'No Signed-off-by matching the author <contrib@example.com>. Commit with "git commit -s".',
          link: 'https://github.com/Resnovas/.github/blob/main/CONTRIBUTING.md#dco',
          commit: sha,
        },
      ])
    }),
  )

  it.effect('reports one DCO finding per failing commit, and matches the email ignoring case', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        commits: [
          commit('x', { sha: 'one' }),
          commit('y', { sha: 'two' }),
          commit(`z\n\nSigned-off-by: A Contributor <Contrib@Example.com>`, {
            sha: 'three',
            authorEmail: 'CONTRIB@example.com',
          }),
        ],
      })
      expect(result.findings.map((finding) => [finding.rule, finding.commit])).toStrictEqual([
        ['DCO', 'one'],
        ['DCO', 'two'],
      ])
    }),
  )

  it.effect('an AI tool can never sign off, even for a maintainer', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        author: 'owner-one',
        commits: [commit(`x\n\n${coAuthor}\nSigned-off-by: Claude <noreply@anthropic.com>\n${signed}`)],
      })
      expect(rules(result.findings, 'error')).toStrictEqual(['AI-03'])
      expect(result.findings[0]).toMatchObject({
        message: 'Signed-off-by "Claude <noreply@anthropic.com>" is an AI tool. Only a human can sign off.',
        link: 'https://github.com/Resnovas/.github/blob/main/AI_POLICY.md#ai-03',
        commit: sha,
      })
    }),
  )

  it.effect('an AI sign-off does not certify the DCO, even when it matches the author', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        commits: [
          commit(`x\n\nSigned-off-by: Claude <noreply@anthropic.com>`, { authorEmail: 'noreply@anthropic.com' }),
        ],
      })
      expect(rules(result.findings)).toStrictEqual(['AI-03', 'DCO'])
    }),
  )

  it.effect('Co-authored-by and Assisted-by must appear together on each AI commit', () =>
    Effect.gen(function* () {
      const coOnly = yield* runOn(commitsFeature, {
        config,
        commits: [commit(`x\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>\n${signed}`)],
      })
      expect(rules(coOnly.findings, 'error')).toStrictEqual(['AI-02'])
      expect(coOnly.findings[0]).toMatchObject({
        message: 'This commit credits an AI co-author but has no "Assisted-by: TOOL:MODEL" trailer.',
        link: 'https://github.com/Resnovas/.github/blob/main/AI_POLICY.md#ai-02',
        commit: sha,
      })
      for (const value of ['unknown', 'aider:', ':gpt-5', 'aider gpt-5:x']) {
        const malformed = yield* runOn(commitsFeature, {
          config,
          commits: [
            commit(`x\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>\nAssisted-by: ${value}\n${signed}`),
          ],
        })
        expect(rules(malformed.findings, 'error')).toStrictEqual(['AI-02'])
      }
      const withTools = yield* runOn(commitsFeature, {
        config,
        commits: [
          commit(
            `x\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>\nAssisted-by: claude-code:claude-opus-5-5 ripgrep\n${signed}`,
          ),
        ],
      })
      expect(withTools.findings).toStrictEqual([])
      const assistedOnly = yield* runOn(commitsFeature, {
        config,
        commits: [commit(`x\n\nAssisted-by: aider:gpt-5\n${signed}`)],
      })
      expect(rules(assistedOnly.findings, 'error')).toStrictEqual(['AI-02'])
      expect(assistedOnly.findings[0]?.message).toBe(
        'This commit has Assisted-by but no Co-authored-by trailer for the AI tool.',
      )
    }),
  )

  it.effect('a human co-author needs no Assisted-by', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        commits: [commit(`x\n\nCo-authored-by: Jane Doe <jane@example.com>\n${signed}`)],
      })
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('merge commits are exempt from sign-off rules but not from attribution', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        commits: [
          commit(`Merge\n\nAssisted-by: aider:gpt-5\nSigned-off-by: Claude <noreply@anthropic.com>`, { parents: 2 }),
        ],
      })
      expect(rules(result.findings)).toStrictEqual(['AI-02'])
    }),
  )

  it.effect('maintainer pull requests report errors as warnings, or at the configured level', () =>
    Effect.gen(function* () {
      const commits = [
        commit('x', { authorEmail: 'owner@example.com' }),
        commit(`y\n\nAssisted-by: aider:gpt-5\n${signed}`),
      ]
      const warned = yield* runOn(commitsFeature, { config, author: 'Owner-One', commits })
      expect(warned.findings.length).toBeGreaterThan(0)
      expect(rules(warned.findings, 'error')).toStrictEqual([])
      expect(rules(warned.findings, 'warning')).toStrictEqual(['DCO', 'AI-02'])
      const strict = yield* runOn(commitsFeature, {
        config: { ...config, commits: { maintainerLevel: 'error' } },
        author: 'owner-one',
        commits,
      })
      expect(rules(strict.findings, 'error')).toStrictEqual(['DCO', 'AI-02'])
    }),
  )

  it.effect('the repository owner is a maintainer even when not listed', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config: { version: 2, commits: {} },
        author: 'jane',
        owner: 'Jane',
        commits: [commit('x')],
      })
      expect(rules(result.findings, 'warning')).toStrictEqual(['DCO'])
    }),
  )

  it.effect('trusted automation accounts are skipped', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, { config, author: 'Dependabot[bot]', commits: [commit('x')] })
      expect(result.ran).toStrictEqual(['commits'])
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('dco: false and aiAttribution: false turn each check off', () =>
    Effect.gen(function* () {
      const commits = [commit(`x\n\nAssisted-by: aider:gpt-5\nSigned-off-by: Claude <noreply@anthropic.com>`)]
      const noDco = yield* runOn(commitsFeature, { config: { ...config, commits: { dco: false } }, commits })
      expect(rules(noDco.findings)).toStrictEqual(['AI-02', 'AI-03'])
      const noAi = yield* runOn(commitsFeature, { config: { ...config, commits: { aiAttribution: false } }, commits })
      expect(rules(noAi.findings)).toStrictEqual(['DCO'])
    }),
  )

  it.effect('trailers are parsed case-insensitively', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config,
        commits: [
          commit(
            'x\n\nco-authored-by: Bot <A@Anthropic.com>\nASSISTED-BY: claude-code:claude-opus-5-5\nSIGNED-OFF-BY: Me <contrib@example.com>',
          ),
        ],
      })
      expect(result.findings).toStrictEqual([])
    }),
  )

  it.effect('config AI identities are recognised, and links follow links.policyBase', () =>
    Effect.gen(function* () {
      const result = yield* runOn(commitsFeature, {
        config: {
          ...config,
          commits: { aiIdentities: { emails: ['@robots\\.example$'] } },
          links: { policyBase: 'https://example.com/policy/' },
        },
        commits: [commit(`x\n\nSigned-off-by: Robo <robo@robots.example>\n${signed}`)],
      })
      expect(result.findings).toMatchObject([{ rule: 'AI-03', link: 'https://example.com/policy/AI_POLICY.md#ai-03' }])
    }),
  )

  it.effect('fails with a typed error when the commits were not loaded', () =>
    Effect.gen(function* () {
      const report = yield* makeReport
      const exit = yield* Effect.exit(
        commitsFeature
          .run({
            // Run directly, without the section the engine would require.
            config: { version: 2 },
            envelope: { kind: 'repository', event: 'schedule' },
          })
          .pipe(Effect.provideService(Report, report)),
      )
      expect(exit).toStrictEqual(Exit.fail(new CommitsNotLoaded({ feature: 'commits' })))
      expect(new CommitsNotLoaded({ feature: 'commits' }).message).toBe(
        "the commits feature needs the pull request's commits, but they were not loaded",
      )
    }).pipe(Effect.provide(GitHubMemory())),
  )
})

describe('checkCommitMessage', () => {
  const author = { authorName: 'Jane Doe', authorEmail: 'jane@example.com' }
  const config: SmartcloudConfig = { version: 2, links: { policyBase: 'https://x/' } }

  it('passes a signed-off message and flags a missing sign-off as an error, without a commit id', () => {
    expect(
      checkCommitMessage({ ...author, message: 'fix: x\n\nSigned-off-by: Jane Doe <jane@example.com>' }, config),
    ).toStrictEqual([])
    expect(checkCommitMessage({ ...author, message: 'fix: x' }, config)).toStrictEqual([
      {
        feature: 'commits',
        level: 'error',
        rule: 'DCO',
        message: 'No Signed-off-by matching the author <jane@example.com>. Commit with "git commit -s".',
        link: 'https://x/CONTRIBUTING.md#dco',
      },
    ])
  })

  it('checks AI attribution with the config, and the defaults without a commits section', () => {
    const message =
      'fix: x\n\nCo-authored-by: Claude <noreply@anthropic.com>\nSigned-off-by: Jane Doe <jane@example.com>'
    expect(checkCommitMessage({ ...author, message }, config).map((finding) => finding.rule)).toStrictEqual(['AI-02'])
    expect(checkCommitMessage({ ...author, message }, { ...config, commits: { aiAttribution: false } })).toStrictEqual(
      [],
    )
  })
})
