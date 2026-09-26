/**
 * @file tests/config/src/load.spec.ts
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
import { Effect, Either, Exit, Layer, Schema } from 'effect'
import {
  ConfigNotFound,
  ConfigSource,
  empty,
  ExtendsCycle,
  formatExtendsRef,
  LockedRule,
  mergeLocked,
  parseConfig,
  parseExtendsRef,
  resolveConfig,
  SmartcloudConfig,
} from '@resnovas/config'

// Presets served from memory, keyed by owner/repo/path@ref.
const presets = (files: Readonly<Record<string, string>>) =>
  Layer.succeed(ConfigSource, {
    read: (ref) => {
      const key = formatExtendsRef(ref)
      const text = files[key]
      return text === undefined ? Effect.fail(new ConfigNotFound({ source: key })) : Effect.succeed(text)
    },
  })

const HOUSE = 'Resnovas/.github/smartcloud/house.yml@main'
const house = `
version: 2
labels:
  bug: { name: bug, color: d73a4a }
labelling:
  bug:
    label: bug
    when: { condition: [{ type: titleMatches, condition: '^fix' }] }
`

const local = (body: string) => `version: 2\nextends: ['${HOUSE}']\n${body}`

describe('parseConfig', () => {
  it.effect('decodes a v2 YAML config', () =>
    Effect.map(parseConfig('version: 2\nlabelSync: { prune: true }\n', 'x.yml'), ({ config, warnings }) => {
      expect(config).toStrictEqual({ version: 2, labelSync: { prune: true } })
      expect(warnings).toStrictEqual([])
    }),
  )

  it.effect('rejects unknown keys, so a typo in a section name fails at startup', () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(parseConfig('version: 2\nlables: {}\n', 'x.yml'))
      expect(Exit.isFailure(exit) && String(exit.cause)).toContain('lables')
    }),
  )

  it.effect('rejects an unknown project type, so settings never plan environments for a typo', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(parseConfig('version: 2\nsettings:\n  environments: { projectType: webapp }\n', 'x.yml'))
      expect(error._tag).toBe('ConfigDecodeError')
      expect(error.message).toContain('webapp')
    }),
  )

  it.effect('reports YAML syntax errors and non-mapping documents', () =>
    Effect.gen(function* () {
      const bad = yield* Effect.flip(parseConfig('version: [2\n', 'bad.yml'))
      expect(bad._tag).toBe('ConfigParseError')
      expect(bad.message).toContain('bad.yml is not valid YAML or JSON')
      const list = yield* Effect.flip(parseConfig('- 1\n', 'list.yml'))
      expect(list.message).toContain('expected a mapping at the top level')
    }),
  )

  it.effect('rejects invalid conditions with the schema path', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        parseConfig('version: 2\nlabelling:\n  x: { label: x, when: { condition: [{ type: titleMatches, condition: "(" }] } }\n', 'x.yml'),
      )
      expect(error._tag).toBe('ConfigDecodeError')
      expect(error.message).toContain('invalid pattern')
    }),
  )

  it.effect('rejects a rule key of __proto__ instead of dropping it silently', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(parseConfig('version: 2\nlabels:\n  __proto__: { name: x, color: "111111" }\n  ok: { name: y, color: "222222" }\n', 'x.yml'))
      expect(error.message).toContain('__proto__')
    }),
  )

  it('needs a preset or conditions for every convention', () => {
    expect(() => Schema.decodeUnknownSync(SmartcloudConfig)({ version: 2, conventions: { rules: { a: {} } } })).toThrow(
      'a convention needs a preset or when',
    )
  })

  it('round-trips: decoding the encoded config returns the original', () => {
    const config = Schema.decodeUnknownSync(SmartcloudConfig)({
      version: 2,
      labels: { bug: { name: 'bug', color: '#d73a4a', aliases: ['defect'] } },
      conventions: { comment: { header: 'h' }, rules: { title: { preset: 'conventionalCommits', level: 'error' } } },
    })
    expect(Schema.decodeUnknownSync(SmartcloudConfig)(Schema.encodeSync(SmartcloudConfig)(config))).toStrictEqual(config)
  })
})

describe('resolveConfig: extends and locked presets', () => {
  it.effect('merges a preset under the repository config, and records the lock', () =>
    Effect.gen(function* () {
      const resolved = yield* resolveConfig(local('labels:\n  docs: { name: docs, color: 0075ca }\n'), 'repo')
      expect(Object.keys(resolved.config.labels ?? {})).toStrictEqual(['bug', 'docs'])
      expect(resolved.sources).toStrictEqual([HOUSE, 'repo'])
      expect(resolved.locked.has('labels.bug.color')).toBe(true)
      expect(resolved.locked.has('labels.docs')).toBe(false)
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('lets a repository add to a preset section whose required keys the preset provides', () =>
    Effect.gen(function* () {
      const sync = 'version: 2\nsync:\n  source: Resnovas/.github/templates@main\n'
      const resolved = yield* resolveConfig(local('sync:\n  exclude: [LICENSE]\n'), 'repo').pipe(Effect.provide(presets({ [HOUSE]: sync })))
      expect(resolved.config.sync).toStrictEqual({ source: 'Resnovas/.github/templates@main', exclude: ['LICENSE'] })
      expect(resolved.locked.has('sync.source')).toBe(true)
      expect(resolved.locked.has('sync.exclude')).toBe(false)
    }),
  )

  it.effect('still rejects a merged config that is incomplete or wrong, naming the file and its presets', () =>
    Effect.gen(function* () {
      const incomplete = yield* Effect.flip(resolveConfig(local('sync:\n  exclude: [LICENSE]\n'), 'repo'))
      expect(incomplete).toMatchObject({ _tag: 'ConfigDecodeError', source: `repo with ${HOUSE}` })
      expect(incomplete.message).toContain('source')
      const alone = yield* Effect.flip(resolveConfig('version: 2\nsync:\n  exclude: [LICENSE]\n', 'repo'))
      expect(alone).toMatchObject({ _tag: 'ConfigDecodeError', source: 'repo' })
      const typo = yield* Effect.flip(resolveConfig(local('lables: {}\n'), 'repo'))
      expect(typo.message).toContain('lables')
      const badExtends = yield* Effect.flip(resolveConfig('version: 2\nextends: [nope]\n', 'repo'))
      expect(badExtends).toMatchObject({ _tag: 'ConfigDecodeError', source: 'repo' })
      const notMapping = yield* Effect.flip(resolveConfig(`version: 2\nextends: [${HOUSE}]\n`, 'repo').pipe(Effect.provide(presets({ [HOUSE]: '- 1\n' }))))
      expect(notMapping).toMatchObject({ _tag: 'ConfigDecodeError', source: HOUSE })
      const unparsable = yield* Effect.flip(resolveConfig(`version: 2\nextends: [${HOUSE}]\n`, 'repo').pipe(Effect.provide(presets({ [HOUSE]: 'version: [2\n' }))))
      expect(unparsable).toMatchObject({ _tag: 'ConfigParseError', source: HOUSE })
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('may add a field to an inherited rule, restating the values it keeps', () =>
    Effect.map(resolveConfig(local('labels:\n  bug: { name: bug, color: d73a4a, description: A defect }\n'), 'repo'), (resolved) => {
      expect(resolved.config.labels?.['bug']).toStrictEqual({ name: 'bug', color: 'd73a4a', description: 'A defect' })
      expect(resolved.locked.has('labels.bug.description')).toBe(false)
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('cannot change a value a preset set, and the error names the preset', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(resolveConfig(local("labels:\n  bug: { name: bug, color: '000000' }\n"), 'repo'))
      expect(error).toStrictEqual(new LockedRule({ path: 'labels.bug.color', preset: HOUSE, source: 'repo' }))
      expect(error.message).toBe(`repo cannot change "labels.bug.color": it is set by ${HOUSE}. Add a new rule instead.`)
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('cannot replace an inherited rule with a different shape', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(resolveConfig(local("labelling:\n  bug: { label: bug, when: { condition: [] } }\n"), 'repo'))
      // The label is restated unchanged; the conditions differ, and are locked.
      expect(error).toMatchObject({ _tag: 'LockedRule', path: 'labelling.bug.when.condition' })
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('resolves presets of presets, earliest first', () =>
    Effect.gen(function* () {
      const base = 'Resnovas/.github/smartcloud/base.yml'
      const resolved = yield* resolveConfig(local(''), 'repo').pipe(
        Effect.provide(
          presets({
            [base]: 'version: 2\nlabels:\n  base: { name: base, color: ffffff }\n',
            [HOUSE]: `version: 2\nextends: ['${base}']\nlabels:\n  bug: { name: bug, color: d73a4a }\n`,
          }),
        ),
      )
      expect(resolved.sources).toStrictEqual([base, HOUSE, 'repo'])
      expect(Object.keys(resolved.config.labels ?? {})).toStrictEqual(['base', 'bug'])
    }),
  )

  it.effect('detects presets that extend each other', () =>
    Effect.gen(function* () {
      const a = 'o/r/a.yml'
      const b = 'o/r/b.yml'
      const error = yield* Effect.flip(
        resolveConfig(`version: 2\nextends: ['${a}']\n`, 'repo').pipe(
          Effect.provide(presets({ [a]: `version: 2\nextends: ['${b}']\n`, [b]: `version: 2\nextends: ['${a}']\n` })),
        ),
      )
      expect(error).toStrictEqual(new ExtendsCycle({ chain: ['repo', a, b, a] }))
      expect(error.message).toBe(`presets extend each other in a loop: repo -> ${a} -> ${b} -> ${a}`)
    }),
  )

  it.effect('reports a preset that cannot be read, and a chain nested too deep', () =>
    Effect.gen(function* () {
      const missing = yield* Effect.flip(resolveConfig(local(''), 'repo').pipe(Effect.provide(presets({}))))
      expect(missing).toStrictEqual(new ConfigNotFound({ source: HOUSE }))
      expect(missing.message).toBe(`${HOUSE} could not be read`)
      const chain = Object.fromEntries(
        Array.from({ length: 8 }, (_, i) => [`o/r/${i}.yml`, `version: 2\nextends: ['o/r/${i + 1}.yml']\n`]),
      )
      const deep = yield* Effect.flip(resolveConfig(`version: 2\nextends: ['o/r/0.yml']\n`, 'repo').pipe(Effect.provide(presets(chain))))
      expect(deep.message).toContain('extends is nested more than 5 deep')
    }),
  )

  it.effect('a v1 preset is migrated too, and its warnings carry its name', () =>
    Effect.gen(function* () {
      const resolved = yield* resolveConfig(local(''), 'repo').pipe(
        Effect.provide(presets({ [HOUSE]: '{"labels": {"bug": {"name": "bug", "color": "d73a4a"}}, "runners": [{"root": "."}]}' })),
      )
      expect(resolved.config.labels?.['bug']?.name).toBe('bug')
      expect(resolved.warnings).toStrictEqual([`${HOUSE}: runners[0].root: dropped, v1 never read it`])
    }),
  )
})

describe('extends entries', () => {
  it('parse and format owner/repo/path@ref', () => {
    expect(parseExtendsRef('Resnovas/.github/smartcloud/house.yml@v2')).toStrictEqual({
      owner: 'Resnovas',
      repo: '.github',
      path: 'smartcloud/house.yml',
      ref: 'v2',
    })
    expect(formatExtendsRef({ owner: 'o', repo: 'r', path: 'p.yml' })).toBe('o/r/p.yml')
    expect(parseExtendsRef('not-a-ref')).toBeUndefined()
  })

  it('reject dot segments, so a preset cannot point outside its repository', () => {
    expect(parseExtendsRef('o/r/../other.yml')).toBeUndefined()
    expect(parseExtendsRef('o/r/a/./b.yml')).toBeUndefined()
    expect(parseExtendsRef('../../repos/x.yml')).toBeUndefined()
    expect(parseExtendsRef('o/./p.yml')).toBeUndefined()
    expect(parseExtendsRef('o/r/a//b.yml')).toBeUndefined()
    expect(parseExtendsRef('o/r/.github/..x.yml@v1')).toStrictEqual({ owner: 'o', repo: 'r', path: '.github/..x.yml', ref: 'v1' })
  })

  it('are validated when the config is decoded', () => {
    expect(() => Schema.decodeUnknownSync(SmartcloudConfig)({ version: 2, extends: ['nope'] })).toThrow(
      'expected owner/repo/path@ref, got "nope"',
    )
  })
})

describe('mergeLocked', () => {
  const house = { labels: { bug: { name: 'bug', color: 'd73a4a', aliases: ['defect', 'error'] } } }

  it('allows restating a list exactly, and locks a different one', () => {
    const base = Either.getOrThrow(mergeLocked(empty, house, 'house'))
    expect(Either.isRight(mergeLocked(base, house, 'repo'))).toBe(true)
    const changed = mergeLocked(base, { labels: { bug: { aliases: ['defect'] } } }, 'repo')
    expect(Either.isLeft(changed) && changed.left.path).toBe('labels.bug.aliases')
    const reordered = mergeLocked(base, { labels: { bug: { aliases: ['error', 'defect'] } } }, 'repo')
    expect(Either.isLeft(reordered)).toBe(true)
  })

  it('merges records of the same size with different keys field by field', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { labels: { bug: { name: 'bug', color: 'd73a4a' } } }, 'house'))
    const merged = Either.getOrThrow(mergeLocked(base, { labels: { bug: { name: 'bug', description: 'x' } } }, 'repo'))
    expect(merged.value).toStrictEqual({ labels: { bug: { name: 'bug', color: 'd73a4a', description: 'x' } } })
    expect(merged.origins.get('labels.bug.description')).toBe('repo')
    expect(merged.origins.get('labels.bug.color')).toBe('house')
  })

  it('treats keys named like Object.prototype members as ordinary keys', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { labels: { bug: { name: 'bug' } } }, 'house'))
    const merged = mergeLocked(base, { labels: { constructor: { name: 'c' }, toString: { name: 't' } } }, 'repo')
    // toStrictEqual compares constructors, which an own `constructor` key replaces, so compare the JSON.
    expect(JSON.stringify(Either.getOrThrow(merged).value)).toBe(
      JSON.stringify({ labels: { bug: { name: 'bug' }, constructor: { name: 'c' }, toString: { name: 't' } } }),
    )
    const restated = mergeLocked(Either.getOrThrow(merged), { labels: { constructor: { name: 'c', hasOwnProperty: 1 } } }, 'x')
    expect(Either.isRight(restated)).toBe(true)
  })

  it('keeps a __proto__ key as data rather than a prototype', () => {
    const next: unknown = JSON.parse('{"labels": {"__proto__": {"name": "p"}}}')
    const merged = Either.getOrThrow(mergeLocked(empty, { labels: {} }, 'house'))
    const result = Either.getOrThrow(
      mergeLocked(merged, typeof next === 'object' && next !== null && !Array.isArray(next) ? next : {}, 'repo'),
    )
    const labels = result.value['labels']
    expect(typeof labels === 'object' && labels !== null && Object.hasOwn(labels, '__proto__')).toBe(true)
  })

  it('does not confuse a rule whose key contains a dot with a field of another rule', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { rules: { x: { preset: 'a' } } }, 'house'))
    const merged = Either.getOrThrow(mergeLocked(base, { rules: { 'x.preset': { preset: 'b' } } }, 'repo'))
    expect(merged.origins.get('rules.x.preset')).toBe('house')
    expect(merged.origins.get('rules.x\\.preset')).toBe('repo')
    const error = mergeLocked(merged, { rules: { x: { preset: 'c' } } }, 'late')
    expect(Either.isLeft(error) && error.left).toStrictEqual(new LockedRule({ path: 'rules.x.preset', preset: 'house', source: 'late' }))
  })

  it('cannot add requires or other fields to an inherited condition group', () => {
    const base = Either.getOrThrow(
      mergeLocked(empty, { labelling: { bug: { label: 'bug', when: { condition: [{ type: 'isOpen', condition: true }] } } } }, 'house'),
    )
    const weakened = mergeLocked(
      base,
      { labelling: { bug: { label: 'bug', when: { requires: 0, condition: [{ type: 'isOpen', condition: true }] } } } },
      'repo',
    )
    expect(Either.isLeft(weakened) && weakened.left).toStrictEqual(
      new LockedRule({ path: 'labelling.bug.when.requires', preset: 'house', source: 'repo' }),
    )
  })

  it('locks a scalar against an object and an object against a scalar', () => {
    const base = Either.getOrThrow(mergeLocked(empty, { a: { b: 1 }, c: 1 }, 'house'))
    expect(Either.isLeft(mergeLocked(base, { a: 1 }, 'repo'))).toBe(true)
    expect(Either.isLeft(mergeLocked(base, { c: { d: 1 } }, 'repo'))).toBe(true)
  })
})

describe('feature sections', () => {
  const full = `
version: 2
roles: { maintainers: [TGTGamer], trustedBots: ['dependabot[bot]'] }
links: { policyBase: 'https://github.com/Resnovas/.github/blob/main' }
commits: { dco: true, aiAttribution: true, aiIdentities: { emails: ['@example-ai\\.dev$'] }, maintainerLevel: warning }
disclosure: { fields: { level: 'AI level' }, requireDraft: true, maintainerLevel: warning }
reviews:
  gate: { outside: 2, maintainer: 1 }
  requestApprovals:
    maintainers: { reviewers: [TGTGamer], when: { condition: [{ type: isDraft, condition: false }] } }
  automaticApprove:
    dependabot: { when: { condition: [{ type: creatorMatches, condition: '^dependabot' }] }, message: Approved }
stale:
  on: [issue]
  staleAfterDays: 60
  staleLabel: stale
  abandonedAfterDays: 30
  abandonedLabel: abandoned
  close: false
  exempt: { labels: [pinned], when: { condition: [{ type: isLocked, condition: true }] } }
settings:
  merging: { mergeCommit: false, squash: true, rebase: true, squashTitle: PR_TITLE, squashMessage: COMMIT_MESSAGES }
  features: { wiki: false, discussions: true, sponsorships: true }
  security: { immutableReleases: true, codeScanning: extended, secretScanning: true }
  ruleset: { name: 'house: default branch', linearHistory: true, copilotReview: true, requiredChecks: ['smartcloud / policy'], adminBypass: true }
  environments: { projectType: saas }
sync:
  source: Resnovas/.github/templates@main
  values: { ORG_NAME: Resnovas }
  exclude: [LICENSE]
  branch: smartcloud/sync
  check: true
`

  it.effect('decode and round-trip every section', () =>
    Effect.gen(function* () {
      const { config } = yield* parseConfig(full, 'full.yml')
      expect(config.reviews?.gate).toStrictEqual({ outside: 2, maintainer: 1 })
      expect(config.settings?.security?.codeScanning).toBe('extended')
      expect(config.sync?.values).toStrictEqual({ ORG_NAME: 'Resnovas' })
      expect(Schema.decodeUnknownSync(SmartcloudConfig)(Schema.encodeSync(SmartcloudConfig)(config))).toStrictEqual(config)
    }),
  )

  it.effect('reject sync values whose keys are not SCREAMING_SNAKE_CASE', () =>
    Effect.map(Effect.flip(parseConfig('version: 2\nsync: { source: o/r/t, values: { orgName: x } }\n', 'x.yml')), (error) =>
      expect(error._tag).toBe('ConfigDecodeError'),
    ),
  )
})
