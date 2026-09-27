/**
 * @file tests/config/src/lenient.spec.ts
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
import { ConfigNotFound, ConfigSource, formatExtendsRef, resolveConfig } from '@resnovas/config'
import { Effect, Layer } from 'effect'

// dropInvalid is internal; resolveConfig is where a run relies on it.

const HOUSE = 'Resnovas/.github/smartcloud/house.yml@main'
const presets = (files: Readonly<Record<string, string>>) =>
  Layer.succeed(ConfigSource, {
    read: (ref) => {
      const text = files[formatExtendsRef(ref)]
      return text === undefined
        ? Effect.fail(new ConfigNotFound({ source: formatExtendsRef(ref) }))
        : Effect.succeed(text)
    },
  })
const resolve = (text: string, files: Readonly<Record<string, string>> = {}) =>
  resolveConfig(text, 'smartcloud.yml').pipe(Effect.provide(presets(files)))

describe('dropping invalid config', () => {
  it.effect('drops an unknown key or a wrongly typed value on its own, keeping the rest of the section', () =>
    Effect.map(
      resolve(
        'version: 2\nsettings:\n  merging: { squash: yes, rebase: true, fastForward: true }\n  security: { codeScanning: maximum, secretScanning: true }\n',
      ),
      ({ config, warnings }) => {
        expect(config.settings).toStrictEqual({ merging: { rebase: true }, security: { secretScanning: true } })
        expect(warnings).toStrictEqual([
          expect.stringMatching(
            /^smartcloud\.yml: ignored settings\.merging\.fastForward, because settings\.merging\.fastForward is unexpected/,
          ),
          'smartcloud.yml: ignored settings.merging.squash, because settings.merging.squash: Expected boolean, actual "yes"',
          'smartcloud.yml: ignored settings.security.codeScanning, because settings.security.codeScanning: Expected "default" | "extended" | "off", actual "maximum"',
        ])
      },
    ),
  )

  it.effect('drops a whole when if anything in it is wrong, never part of it, and then a rule that needs it', () =>
    Effect.map(
      resolve(`version: 2
labelling:
  keep: { label: keep, when: { condition: [{ type: isDraft, condition: true }] } }
  extra: { label: extra, when: { condition: [{ type: isDraft, condition: true }, { type: isDraft, condition: false, negate: true }] } }
  newer: { label: newer, when: { condition: [{ type: isDraft, condition: true }, { type: isRenovate, condition: true }] } }
`),
      ({ config, warnings }) => {
        expect(Object.keys(config.labelling ?? {})).toStrictEqual(['keep'])
        expect(warnings).toHaveLength(4)
        expect(warnings[0]).toMatch(
          /^smartcloud\.yml: ignored labelling\.extra\.when, because labelling\.extra\.when\.condition\.1\.negate is unexpected/,
        )
        expect(warnings[1]).toMatch(
          /^smartcloud\.yml: ignored labelling\.newer\.when, because labelling\.newer\.when\.condition\.1\.type: /,
        )
        expect(warnings.slice(2)).toStrictEqual([
          'smartcloud.yml: ignored labelling.extra, because labelling.extra.when is missing',
          'smartcloud.yml: ignored labelling.newer, because labelling.newer.when is missing',
        ])
      },
    ),
  )

  it.effect('says why a pattern was refused, dropping the when that holds it', () =>
    Effect.map(
      resolve(`version: 2
labelling:
  fix: { label: fix, when: { condition: [{ type: titleMatches, condition: '^fix: (\\w+\\s?)+$' }] } }
`),
      ({ config, warnings }) => {
        expect(config.labelling).toStrictEqual({})
        expect(warnings[0]).toMatch(
          /^smartcloud\.yml: ignored labelling\.fix\.when, because labelling\.fix\.when\.condition\.0\.condition: invalid pattern /,
        )
        expect(warnings[0]).toContain('(catastrophic backtracking)')
      },
    ),
  )

  it.effect('treats a rule named when as a rule, not as its conditions', () =>
    Effect.map(
      resolve(`version: 2
labels:
  when: { name: when, color: red }
  ok: { name: ok, color: 0E8A16 }
conventions:
  rules:
    when: { preset: semanticTitle, when: { condition: [{ type: isDraft }] } }
    title: { preset: conventionalCommits }
stale: { staleAfterDays: 30, staleLabel: stale, exempt: { labels: [pinned], when: { condition: true } } }
`),
      ({ config, warnings }) => {
        // Only the label named when goes, for its colour; the other labels stay.
        expect(Object.keys(config.labels ?? {})).toStrictEqual(['ok'])
        // The convention named when keeps its preset without its broken when.
        expect(config.conventions?.rules?.['when']).toStrictEqual({ preset: 'semanticTitle' })
        expect(config.conventions?.rules?.['title']).toStrictEqual({ preset: 'conventionalCommits' })
        expect(config.stale).toStrictEqual({ staleAfterDays: 30, staleLabel: 'stale', exempt: { labels: ['pinned'] } })
        expect(warnings).toStrictEqual([
          'smartcloud.yml: ignored labels.when.color, because labels.when.color: Expected Six hex digits, for example 0E8A16., actual "red"',
          'smartcloud.yml: ignored conventions.rules.when.when, because conventions.rules.when.when.condition.0.condition is missing',
          'smartcloud.yml: ignored stale.exempt.when, because stale.exempt.when.condition: Expected ReadonlyArray<Condition>, actual true',
          'smartcloud.yml: ignored labels.when, because labels.when.color is missing',
        ])
      },
    ),
  )

  it.effect('drops a whole list rather than one of its items, and an object missing a key it needs', () =>
    Effect.map(
      resolve(
        'version: 2\nroles: { maintainers: [a, 1], trustedBots: [bot] }\nlabels:\n  ok: { name: ok, color: 0E8A16 }\n  bug: { name: bug }\nconventions:\n  rules: { title: { level: error } }\n',
      ),
      ({ config, warnings }) => {
        expect(config.roles).toStrictEqual({ trustedBots: ['bot'] })
        expect(Object.keys(config.labels ?? {})).toStrictEqual(['ok'])
        expect(config.conventions).toStrictEqual({ rules: {} })
        expect(warnings).toStrictEqual([
          'smartcloud.yml: ignored roles.maintainers, because roles.maintainers.1: Expected string, actual 1',
          'smartcloud.yml: ignored labels.bug, because labels.bug.color is missing',
          'smartcloud.yml: ignored conventions.rules.title, because conventions.rules.title: a convention needs a preset or when',
        ])
      },
    ),
  )

  it.effect('names each file for its own problems, and escapes dots in key names', () =>
    Effect.map(
      resolve(`version: 2\nextends: ['${HOUSE}']\nlabels:\n  v1.0: { name: v1.0, color: 0E8A16, emoji: x }\n`, {
        [HOUSE]: 'version: 2\nlabelSync: { prune: true, archive: true }\nlabels:\n  bug: { name: bug, color: red }\n',
      }),
      ({ config, warnings }) => {
        expect(config.labelSync).toStrictEqual({ prune: true })
        expect(Object.keys(config.labels ?? {})).toStrictEqual(['v1.0'])
        expect(warnings).toStrictEqual([
          'smartcloud.yml: ignored labels.v1\\.0.emoji, because labels.v1\\.0.emoji is unexpected, expected: "name" | "color" | "description" | "aliases"',
          `${HOUSE}: ignored labels.bug.color, because labels.bug.color: Expected Six hex digits, for example 0E8A16., actual "red"`,
          `${HOUSE}: ignored labelSync.archive, because labelSync.archive is unexpected, expected: "prune"`,
          `${HOUSE}: ignored labels.bug, because labels.bug.color is missing`,
        ])
      },
    ),
  )

  it.effect('warns once for an object dropped for a missing key, not again for its other problems', () =>
    Effect.map(resolve('version: 2\nstale:\n  exempt: { when: {} }\n'), ({ config, warnings }) => {
      expect(config.stale).toBeUndefined()
      expect(warnings).toStrictEqual(['smartcloud.yml: ignored stale, because stale.staleAfterDays is missing'])
    }),
  )

  it.effect('lets a repository complete or extend an inherited rule, and keeps it when the addition is broken', () =>
    Effect.map(
      resolve(
        `version: 2
extends: ['${HOUSE}']
conventions:
  rules:
    title: { level: warning }
    body: { when: { condition: [{ type: isDraft }] } }
    footer: { when: {} }
`,
        {
          [HOUSE]:
            'version: 2\nconventions:\n  rules:\n    title: { preset: conventionalCommits }\n    body: { preset: semanticTitle }\n    footer: { preset: gitmojis }\n',
        },
      ),
      ({ config, warnings }) => {
        // A convention with only a level is completed by the preset's rule.
        expect(config.conventions?.rules?.['title']).toStrictEqual({ preset: 'conventionalCommits', level: 'warning' })
        // A broken when the repository adds goes; the preset's rule stays.
        expect(config.conventions?.rules?.['body']).toStrictEqual({ preset: 'semanticTitle' })
        expect(config.conventions?.rules?.['footer']).toStrictEqual({ preset: 'gitmojis' })
        expect(warnings).toStrictEqual([
          'smartcloud.yml: ignored conventions.rules.body.when, because conventions.rules.body.when.condition.0.condition is missing',
          `smartcloud.yml with ${HOUSE}: ignored conventions.rules.footer.when, because conventions.rules.footer.when.condition is missing`,
        ])
      },
    ),
  )

  it.effect('keeps a preset value it cannot read locked, so a repository cannot set a weaker one', () =>
    Effect.map(
      resolve(
        `version: 2\nextends: ['${HOUSE}']\nsettings:\n  security: { codeScanning: 'off', secretScanning: true }\n`,
        { [HOUSE]: 'version: 2\nsettings:\n  security: { codeScanning: maximum }\n' },
      ),
      ({ config, warnings, locked, loosened }) => {
        expect(config.settings?.security).toStrictEqual({ secretScanning: true })
        // Only the preset's own invalid value loosened policy; the repository's is held by the lock.
        expect(loosened).toStrictEqual([warnings[0]])
        expect(locked.has('settings.security.secretScanning')).toBe(false)
        expect(warnings).toStrictEqual([
          `${HOUSE}: ignored settings.security.codeScanning, because settings.security.codeScanning: Expected "default" | "extended" | "off", actual "maximum"`,
          `smartcloud.yml: ignored settings.security.codeScanning, because ${HOUSE} sets it in a form this version of smartcloud cannot use, and what a preset sets cannot be changed`,
        ])
      },
    ),
  )

  it.effect(
    'lists an invalid value dropped from a setting that only tightens policy as loosened, but not an unknown key',
    () =>
      Effect.map(
        resolve(
          'version: 2\nroles: { maintainers: [a, 1], admins: [b] }\nsettings:\n  ruleset: { requiredChecks: [ci, 2] }\n  merging: { squash: yes }\n',
        ),
        ({ ignored, loosened }) => {
          expect(ignored).toHaveLength(4)
          expect(loosened).toStrictEqual([
            'smartcloud.yml: ignored roles.maintainers, because roles.maintainers.1: Expected string, actual 1',
            'smartcloud.yml: ignored settings.ruleset.requiredChecks, because settings.ruleset.requiredChecks.1: Expected string, actual 2',
          ])
        },
      ),
  )

  it.effect('treats Actions hardening, collaborator and team access as settings that only tighten policy', () =>
    Effect.map(
      resolve(
        'version: 2\nsettings:\n  actions: { enabled: true, allowedActions: localonly }\n  collaborators: { octocat: nobody }\n  teams: { core: owner }\n',
      ),
      ({ config, loosened }) => {
        expect(config.settings?.actions).toStrictEqual({ enabled: true })
        expect(loosened).toHaveLength(3)
      },
    ),
  )

  it.effect('leaves loosened out when nothing that tightens policy was dropped', () =>
    Effect.map(resolve('version: 2\nroles: { admins: [b] }\n'), ({ ignored, loosened }) => {
      expect(ignored).toHaveLength(1)
      expect(loosened).toBeUndefined()
    }),
  )

  it.effect('reports a union failure by its first message when the members disagree', () =>
    Effect.map(resolve('version: 2\nstale: { staleAfterDays: -1, staleLabel: stale }\n'), ({ config, warnings }) => {
      expect(config.stale).toBeUndefined()
      expect(warnings).toStrictEqual([
        'smartcloud.yml: ignored stale.staleAfterDays, because stale.staleAfterDays: Expected a non-negative number, actual -1',
        'smartcloud.yml: ignored stale, because stale.staleAfterDays is missing',
      ])
    }),
  )
})
