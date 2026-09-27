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
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { describe, expect, it } from '@effect/vitest'
import { Effect, Exit, Layer } from 'effect'
import {
  ConfigNotFound,
  ConfigSource,
  ExtendsCycle,
  formatExtendsRef,
  LockedRule,
  parseConfig,
  resolveConfig,
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
      const error = yield* Effect.flip(
        parseConfig('version: 2\nsettings:\n  environments: { projectType: webapp }\n', 'x.yml'),
      )
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
        parseConfig(
          'version: 2\nlabelling:\n  x: { label: x, when: { condition: [{ type: titleMatches, condition: "(" }] } }\n',
          'x.yml',
        ),
      )
      expect(error._tag).toBe('ConfigDecodeError')
      expect(error.message).toContain('invalid pattern')
    }),
  )

  it.effect('rejects a rule key of __proto__ instead of dropping it silently', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        parseConfig(
          'version: 2\nlabels:\n  __proto__: { name: x, color: "111111" }\n  ok: { name: y, color: "222222" }\n',
          'x.yml',
        ),
      )
      expect(error.message).toContain('__proto__')
    }),
  )
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
      const resolved = yield* resolveConfig(local('sync:\n  exclude: [LICENSE]\n'), 'repo').pipe(
        Effect.provide(presets({ [HOUSE]: sync })),
      )
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
      const notMapping = yield* Effect.flip(
        resolveConfig(`version: 2\nextends: [${HOUSE}]\n`, 'repo').pipe(Effect.provide(presets({ [HOUSE]: '- 1\n' }))),
      )
      expect(notMapping).toMatchObject({ _tag: 'ConfigDecodeError', source: HOUSE })
      const unparsable = yield* Effect.flip(
        resolveConfig(`version: 2\nextends: [${HOUSE}]\n`, 'repo').pipe(
          Effect.provide(presets({ [HOUSE]: 'version: [2\n' })),
        ),
      )
      expect(unparsable).toMatchObject({ _tag: 'ConfigParseError', source: HOUSE })
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('may add a field to an inherited rule, restating the values it keeps', () =>
    Effect.map(
      resolveConfig(local('labels:\n  bug: { name: bug, color: d73a4a, description: A defect }\n'), 'repo'),
      (resolved) => {
        expect(resolved.config.labels?.['bug']).toStrictEqual({ name: 'bug', color: 'd73a4a', description: 'A defect' })
        expect(resolved.locked.has('labels.bug.description')).toBe(false)
      },
    ).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('cannot change a value a preset set, and the error names the preset', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(resolveConfig(local("labels:\n  bug: { name: bug, color: '000000' }\n"), 'repo'))
      expect(error).toStrictEqual(new LockedRule({ path: 'labels.bug.color', preset: HOUSE, source: 'repo' }))
      expect(error.message).toBe(
        `repo cannot change "labels.bug.color": it is set by ${HOUSE}. Add a new rule instead.`,
      )
    }).pipe(Effect.provide(presets({ [HOUSE]: house }))),
  )

  it.effect('cannot replace an inherited rule with a different shape', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        resolveConfig(local('labelling:\n  bug: { label: bug, when: { condition: [] } }\n'), 'repo'),
      )
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
      const deep = yield* Effect.flip(
        resolveConfig(`version: 2\nextends: ['o/r/0.yml']\n`, 'repo').pipe(Effect.provide(presets(chain))),
      )
      expect(deep.message).toContain('extends is nested more than 5 deep')
    }),
  )

  it.effect('leaves out a preset the caller allows to be skipped, and drops sections incomplete without it', () =>
    Effect.gen(function* () {
      const skipAll = { skipUnreadable: () => true }
      const resolved = yield* resolveConfig(
        local(
          'labels:\n  docs: { name: docs, color: 0075ca }\nsync:\n  exclude: [LICENSE]\nconventions:\n  rules:\n    title: { level: warning }\n',
        ),
        'repo',
        skipAll,
      ).pipe(Effect.provide(presets({})))
      expect(resolved.config).toStrictEqual({ version: 2, labels: { docs: { name: 'docs', color: '0075ca' } } })
      expect(resolved.sources).toStrictEqual(['repo'])
      expect(resolved.locked.size).toBe(0)
      expect(resolved.skipped).toStrictEqual([
        `the extends preset ${HOUSE}: ${HOUSE} could not be read`,
        'the sync section: incomplete without the skipped preset(s)',
        'the conventions section: incomplete without the skipped preset(s)',
      ])
    }),
  )

  it.effect('still fails on unknown keys and malformed sections when a preset is skipped', () =>
    Effect.gen(function* () {
      const skipAll = { skipUnreadable: () => true }
      const typo = yield* Effect.flip(
        resolveConfig(local('lables: {}\n'), 'repo', skipAll).pipe(Effect.provide(presets({}))),
      )
      expect(typo._tag).toBe('ConfigDecodeError')
      const malformed = yield* Effect.flip(
        resolveConfig(local('labels:\n  docs: { name: 7 }\n'), 'repo', skipAll).pipe(Effect.provide(presets({}))),
      )
      expect(malformed._tag).toBe('ConfigDecodeError')
      const convention = yield* Effect.flip(
        resolveConfig(local('conventions:\n  rules:\n    title: { level: loud }\n'), 'repo', skipAll).pipe(
          Effect.provide(presets({})),
        ),
      )
      expect(convention._tag).toBe('ConfigDecodeError')
      const proto = yield* Effect.flip(
        resolveConfig(local('__proto__:\n  labels: {}\n'), 'repo', skipAll).pipe(Effect.provide(presets({}))),
      )
      expect(proto._tag).toBe('ConfigDecodeError')
    }),
  )

  it.effect('with a preset skipped, still fails a section the preset could not have completed', () =>
    Effect.gen(function* () {
      const skipAll = { skipUnreadable: () => true }
      const resolve = (body: string) => Effect.flip(resolveConfig(local(body), 'repo', skipAll).pipe(Effect.provide(presets({}))))
      // The repository named this label, so the missing colour is its own mistake.
      const label = yield* resolve('labels:\n  docs: { name: docs }\n')
      expect(label).toMatchObject({ _tag: 'ConfigDecodeError', source: 'repo' })
      expect(label.message).toContain('color')
      // A wrong value is never the skipped preset's to fix, even beside a key it could set.
      const wrong = yield* resolve('sync:\n  exclude: LICENSE\n')
      expect(wrong).toMatchObject({ _tag: 'ConfigDecodeError', source: 'repo' })
      expect(wrong.message).toContain('exclude')
    }),
  )

  it.effect('still fails on an unreadable preset the caller does not allow to be skipped', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        resolveConfig(local(''), 'repo', { skipUnreadable: (ref) => ref.repo !== '.github' }).pipe(
          Effect.provide(presets({})),
        ),
      )
      expect(error).toStrictEqual(new ConfigNotFound({ source: HOUSE }))
      const resolved = yield* resolveConfig(local(''), 'repo').pipe(Effect.provide(presets({ [HOUSE]: house })))
      expect(resolved.skipped).toBeUndefined()
    }),
  )

  it.effect('a v1 preset is migrated too, and its warnings carry its name', () =>
    Effect.gen(function* () {
      const resolved = yield* resolveConfig(local(''), 'repo').pipe(
        Effect.provide(
          presets({ [HOUSE]: '{"labels": {"bug": {"name": "bug", "color": "d73a4a"}}, "runners": [{"root": "."}]}' }),
        ),
      )
      expect(resolved.config.labels?.['bug']?.name).toBe('bug')
      expect(resolved.warnings).toStrictEqual([`${HOUSE}: runners[0].root: dropped, v1 never read it`])
    }),
  )
})
