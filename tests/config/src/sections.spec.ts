/**
 * @file tests/config/src/sections.spec.ts
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
import { Effect, Either, Schema } from 'effect'
import {
  BranchName,
  Branches,
  CodeOwner,
  CodeOwners,
  CodeOwnersPath,
  CodeOwnersRule,
  Freeze,
  FreezeWindow,
  Lock,
  LockReason,
  parseConfig,
  parseFreezeTime,
  RequestApproval,
  Required,
  REQUIRED_TIMEOUT,
  SmartcloudConfig,
} from '@resnovas/config'

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
lock:
  on: [issue, pullRequest]
  afterDays: 30
  reason: resolved
  comment: Locking this closed thread; open a new issue for follow-ups.
  label: locked
  exempt: { labels: [pinned] }
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
      expect(config.lock?.reason).toBe('resolved')
      expect(Schema.decodeUnknownSync(SmartcloudConfig)(Schema.encodeSync(SmartcloudConfig)(config))).toStrictEqual(
        config,
      )
    }),
  )

  it.effect('reject a pull request rule with no merge methods, which GitHub refuses', () =>
    Effect.map(
      Effect.flip(parseConfig('version: 2\nsettings: { ruleset: { pullRequest: { mergeMethods: [] } } }\n', 'x.yml')),
      (error) => expect(error._tag).toBe('ConfigDecodeError'),
    ),
  )

  it.effect('reject sync values whose keys are not SCREAMING_SNAKE_CASE', () =>
    Effect.map(
      Effect.flip(parseConfig('version: 2\nsync: { source: o/r/t, values: { orgName: x } }\n', 'x.yml')),
      (error) => expect(error._tag).toBe('ConfigDecodeError'),
    ),
  )

  it.effect('read the Actions, access, webhook, Pages and variables settings', () =>
    Effect.map(
      parseConfig(
        `version: 2
settings:
  actions: { allowedActions: selected, selectedActions: { githubOwned: true, patterns: ['Resnovas/*'] }, workflowPermissions: read, createPullRequests: true, accessLevel: organization }
  collaborators: { octocat: write, former: none }
  teams: { docs-team: triage }
  webhooks: { chat: { url: 'https://hooks.example.com/x', events: [release], contentType: json } }
  pages: { buildType: legacy, path: /docs, httpsEnforced: true }
  variables: { DEPLOY_URL: where the site deploys }
`,
        'x.yml',
      ),
      ({ config }) => {
        expect(config.settings?.actions?.accessLevel).toBe('organization')
        expect(config.settings?.collaborators).toStrictEqual({ octocat: 'write', former: 'none' })
        expect(config.settings?.teams).toStrictEqual({ 'docs-team': 'triage' })
        expect(config.settings?.webhooks?.chat?.events).toStrictEqual(['release'])
        expect(config.settings?.pages?.path).toBe('/docs')
        expect(config.settings?.variables).toStrictEqual({ DEPLOY_URL: 'where the site deploys' })
      },
    ),
  )

  const rejected = [
    ['a variable name GitHub reserves', 'variables: { github_sha: x }'],
    ['a variable name that is not an identifier', "variables: { 'DEPLOY-URL': x }"],
    ['a login that is not a GitHub login', "collaborators: { '-octocat': read }"],
    ['a team slug with capitals', 'teams: { Docs: read }'],
    ['a role GitHub does not have', 'collaborators: { octocat: owner }'],
    ['a webhook URL that is not http', "webhooks: { x: { url: 'ftp://example.com' } }"],
    ['a webhook URL that does not parse', "webhooks: { x: { url: 'http://[' } }"],
  ] as const
  for (const [what, yaml] of rejected) {
    it.effect(`reject ${what}`, () =>
      Effect.map(Effect.flip(parseConfig(`version: 2\nsettings:\n  ${yaml}\n`, 'x.yml')), (error) =>
        expect(error._tag).toBe('ConfigDecodeError'),
      ),
    )
  }

  it.effect('never repeats a rejected webhook URL, which can carry a token', () =>
    Effect.gen(function* () {
      for (const url of ['ftp://:secret@example.com', 'http://:secret@[']) {
        const error = yield* Effect.flip(
          parseConfig(`version: 2\nsettings:\n  webhooks: { x: { url: '${url}' } }\n`, 'x.yml'),
        )
        expect(error.message).toContain('expected an http or https URL')
        expect(error.message).not.toContain('secret')
      }
    }),
  )
})

describe('Required', () => {
  it('takes ignore patterns and a timeout of 1 to 360 whole minutes, 60 by default', () => {
    expect(REQUIRED_TIMEOUT).toBe(60)
    expect(Schema.is(Required)({})).toBe(true)
    expect(Schema.is(Required)({ ignore: ['^codecov/', '/preview/i'], timeout: 360 })).toBe(true)
    for (const timeout of [0, 361, 1.5]) expect(Schema.is(Required)({ timeout })).toBe(false)
    expect(Schema.is(Required)({ ignore: ['(unclosed'] })).toBe(false)
  })

  it('is a section of the config', () => {
    expect(Schema.is(SmartcloudConfig)({ version: 2, required: { timeout: 30 } })).toBe(true)
  })
})

describe('Lock', () => {
  it("needs afterDays, and takes one of GitHub's lock reasons", () => {
    expect(Schema.is(Lock)({ afterDays: 0 })).toBe(true)
    expect(Schema.is(Lock)({ afterDays: -1 })).toBe(false)
    for (const reason of ['resolved', 'off-topic', 'too heated', 'spam'])
      expect(Schema.is(LockReason)(reason)).toBe(true)
    expect(Schema.is(Lock)({ afterDays: 30, reason: 'stale' })).toBe(false)
  })
})

describe('Freeze', () => {
  it('reads daily and weekly times', () => {
    expect(parseFreezeTime('00:00')).toStrictEqual({ day: undefined, minutes: 0 })
    expect(parseFreezeTime('Sun 23:59')).toStrictEqual({ day: 0, minutes: 1439 })
    expect(parseFreezeTime('Sat 08:05')).toStrictEqual({ day: 6, minutes: 485 })
    for (const text of ['24:00', '9:00', 'fri 16:00', 'Friday 16:00', 'Fri16:00', ''])
      expect(parseFreezeTime(text)).toBeUndefined()
  })

  it('takes dated windows with offsets, ending after they start', () => {
    const is = Schema.is(FreezeWindow)
    expect(is({ start: '2026-12-24T00:00:00Z', end: '2026-12-24T00:00:01Z', reason: 'Holidays' })).toBe(true)
    expect(is({ start: '2026-12-24T00:00+01:00', end: '2026-12-24T00:00:00.5Z' })).toBe(true)
    expect(is({ start: '2026-12-24T00:00:00Z', end: '2026-12-24T00:00:00Z' })).toBe(false)
    expect(is({ start: '2026-12-24T00:00:00', end: '2026-12-25T00:00:00' })).toBe(false)
    expect(is({ start: '2026-13-45T00:00:00Z', end: '2026-12-25T00:00:00Z' })).toBe(false)
  })

  it('takes recurring windows whose times both name a day or neither does, in a known time zone', () => {
    const is = Schema.is(FreezeWindow)
    expect(is({ from: 'Fri 16:00', to: 'Mon 08:00', timezone: 'Europe/London' })).toBe(true)
    expect(is({ from: '22:00', to: '06:00' })).toBe(true)
    expect(is({ from: 'Fri 16:00', to: '08:00' })).toBe(false)
    expect(is({ from: '16:00', to: 'Mon 08:00' })).toBe(false)
    expect(is({ from: 'Fri 16:00', to: 'Fri 16:00' })).toBe(false)
    expect(is({ from: '16:00', to: '16:00' })).toBe(false)
    expect(is({ from: 'Fri 16:00', to: 'Sat 16:00' })).toBe(true)
    expect(is({ from: '22:00', to: '06:00', timezone: 'Mars/Olympus' })).toBe(false)
  })

  it('says what is wrong with a window', () => {
    const problem = (input: unknown) =>
      Either.match(Schema.decodeUnknownEither(FreezeWindow)(input), {
        onLeft: (error) => error.message,
        onRight: () => '',
      })
    expect(problem({ start: '2026-13-01T00:00:00Z', end: '2027-01-02T00:00:00Z' })).toContain(
      'not a valid date and time',
    )
    expect(problem({ start: '2027-01-02T00:00:00Z', end: '2026-12-24T00:00:00Z' })).toContain('end must be after start')
    expect(problem({ from: '22:00', to: '06:00', timezone: 'Mars/Olympus' })).toContain(
      'unknown time zone Mars/Olympus',
    )
    expect(problem({ from: 'Fri 16:00', to: '06:00' })).toContain('from and to must both name a day')
  })

  it('is a section of the config, with windows by key and exempt labels', () => {
    expect(Schema.is(Freeze)({})).toBe(true)
    const config = {
      version: 2,
      freeze: {
        active: false,
        reason: 'Release',
        windows: {
          weekend: { from: 'Fri 16:00', to: 'Mon 08:00' },
          holidays: { start: '2026-12-24T00:00:00Z', end: '2027-01-02T00:00:00Z' },
        },
        exempt: { labels: ['hotfix'] },
      },
    }
    expect(Schema.is(SmartcloudConfig)(config)).toBe(true)
    expect(Schema.is(SmartcloudConfig)({ version: 2, freeze: { windows: [{ from: '22:00', to: '06:00' }] } })).toBe(
      false,
    )
  })

  it.effect('rejects a window mixing dated and recurring keys', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        parseConfig(
          'version: 2\nfreeze:\n  windows:\n    x: { start: "2026-12-24T00:00:00Z", end: "2027-01-02T00:00:00Z", from: "22:00" }\n',
          'smartcloud.yml',
        ),
      )
      expect(error._tag).toBe('ConfigDecodeError')
    }),
  )
})

describe('Branches', () => {
  const problem = (name: unknown) =>
    Either.match(Schema.decodeUnknownEither(BranchName)(name), { onLeft: (error) => error.message, onRight: () => '' })

  it('needs a preset or a pattern, with prefixes and keys only on their presets', () => {
    const is = Schema.is(BranchName)
    expect(is({ preset: 'prefixed', pattern: '^[a-z]' })).toBe(true)
    expect(is({ preset: 'issueKey', keys: ['SMC', 'ops2'] })).toBe(true)
    expect(is({ preset: 'issueKey', keys: ['2SMC'] })).toBe(false)
    expect(is({ preset: 'prefixed', prefixes: [''] })).toBe(false)
    expect(is({ pattern: '(unclosed' })).toBe(false)
    expect(problem({})).toContain('a branch name needs a preset or a pattern')
    expect(problem({ preset: 'issueKey', prefixes: ['feat'] })).toContain('prefixes go with the prefixed preset')
    expect(problem({ preset: 'prefixed', keys: ['SMC'] })).toContain('keys with issueKey')
  })

  it('is a section of the config, with names by key and exemptions', () => {
    expect(Schema.is(Branches)({})).toBe(true)
    const config = {
      version: 2,
      branches: {
        names: { person: { preset: 'prefixed' }, issue: { preset: 'issueKey', keys: ['SMC'] } },
        level: 'warning',
        message: 'Name the branch <you>/<what>.',
        exempt: { branches: ['^dependabot/'], authors: ['renovate[bot]'] },
      },
    }
    expect(Schema.is(SmartcloudConfig)(config)).toBe(true)
    expect(Schema.is(SmartcloudConfig)({ version: 2, branches: { level: 'fatal' } })).toBe(false)
  })
})

describe('CodeOwners', () => {
  it('accepts users, teams and email addresses as owners', () => {
    const is = Schema.is(CodeOwner)
    expect(is('@TGTGamer')).toBe(true)
    expect(is('@Resnovas/docs-team')).toBe(true)
    expect(is('octo.cat@example.com')).toBe(true)
    expect(is('TGTGamer')).toBe(false)
    expect(is('@-bad')).toBe(false)
    expect(is('@Resnovas/')).toBe(false)
    expect(is('octo@example')).toBe(false)
  })

  it('accepts the path patterns GitHub supports', () => {
    const is = Schema.is(CodeOwnersPath)
    expect(is('*')).toBe(true)
    expect(is('apps/**/*.ts')).toBe(true)
    expect(is('/docs/')).toBe(true)
    expect(is('')).toBe(false)
    expect(is('!docs/')).toBe(false)
    expect(is('#comment')).toBe(false)
    expect(is('*.[ch]')).toBe(false)
    expect(is('docs guide.md')).toBe(false)
  })

  it('needs at least one path per rule, and allows a rule without owners', () => {
    const is = Schema.is(CodeOwnersRule)
    expect(is({ paths: ['/vendor/'], owners: [] })).toBe(true)
    expect(is({ paths: [], owners: ['@TGTGamer'] })).toBe(false)
  })

  it('is a section of the config, with rules by key', () => {
    expect(Schema.is(CodeOwners)({})).toBe(true)
    const config = {
      version: 2,
      codeowners: {
        path: 'CODEOWNERS',
        rules: { docs: { paths: ['/docs/'], owners: ['@Resnovas/docs'], comment: 'Documentation.' } },
        check: true,
        level: 'warning',
        branch: 'smartcloud/owners',
      },
    }
    expect(Schema.is(SmartcloudConfig)(config)).toBe(true)
    expect(Schema.is(SmartcloudConfig)({ version: 2, codeowners: { path: 'OWNERS' } })).toBe(false)
    expect(Schema.is(SmartcloudConfig)({ version: 2, codeowners: { branch: ' ' } })).toBe(false)
  })
})

describe('reviewer strategies', () => {
  it('accepts each opt-in strategy and rejects invalid strategies and counts', () => {
    const valid = Schema.is(RequestApproval)
    const base = { reviewers: [], when: { condition: [] } }
    for (const strategy of ['round-robin', 'load-balanced', 'codeowners'])
      expect(valid({ ...base, strategy, count: 2 })).toBe(true)
    for (const count of [0, -1, 1.5]) expect(valid({ ...base, count })).toBe(false)
    expect(valid({ ...base, strategy: 'random' })).toBe(false)
    expect(valid(base)).toBe(true)
  })
})
