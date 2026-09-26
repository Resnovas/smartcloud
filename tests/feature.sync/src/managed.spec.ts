/**
 * @file tests/feature.sync/src/managed.spec.ts
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
import { BEGIN, END, isMarker, LOCAL, managedConflicts, mergeManaged, splitManaged, syncFindings } from '@resnovas/feature.sync'

// Ported case for case from Resnovas/.github test/managed.test.mjs.

const dependabot = [
  '# house:managed:begin - synced',
  'version: 2',
  'updates:',
  '  - package-ecosystem: npm',
  '    directory: /',
  '# house:managed:end',
  '# house:local - add further updates below.',
  '',
].join('\n')

const withLocal = (template: string, local: string) =>
  template.replace('# house:local - add further updates below.\n', `# house:local - add further updates below.\n${local}\n`)

describe('mergeManaged', () => {
  it('a file without markers is fully managed', () => {
    expect(splitManaged('plain\ntext')).toBeUndefined()
    expect(mergeManaged('new', 'old', 'SECURITY.md')).toBe('new')
  })

  it('a new file gets the whole template', () => {
    expect(mergeManaged(dependabot, null, '.github/dependabot.yml')).toBe(dependabot)
  })

  it('the managed block is replaced and local additions are kept', () => {
    const current = withLocal(dependabot.replace('npm', 'yarn-was-edited'), '  - package-ecosystem: pip\n    directory: /api')
    const merged = mergeManaged(dependabot, current, '.github/dependabot.yml')
    expect(merged).toMatch(/package-ecosystem: npm/)
    expect(merged).not.toMatch(/yarn-was-edited/)
    expect(merged).toMatch(/package-ecosystem: pip\n {4}directory: \/api/)
  })

  it('first adoption keeps the previous file, commented out at the local marker', () => {
    const merged = mergeManaged(dependabot, 'version: 2\nupdates: []\n', '.github/dependabot.yml')
    const parts = splitManaged(merged)
    expect(parts?.after.slice(1, 4)).toStrictEqual([
      '# Previous content of this file, kept when it was first synced. Re-add what is still needed as local rules, then delete this.',
      '# version: 2',
      '# updates: []',
    ])
  })

  it('first adoption comments out blank lines too, and drops trailing ones', () => {
    const parts = splitManaged(mergeManaged(dependabot, 'version: 2\n\nupdates: []\n\n\n', '.github/dependabot.yml'))
    expect(parts?.after.slice(2, 6)).toStrictEqual(['# version: 2', '#', '# updates: []', ''])
  })

  it('first adoption of a Markdown file wraps the previous content in a comment', () => {
    const template = '<!-- house:managed:begin -->\n## Summary\n<!-- house:managed:end -->\n<!-- house:local -->\n'
    const merged = mergeManaged(template, 'Old --> text', '.github/PULL_REQUEST_TEMPLATE.md')
    expect(merged).toMatch(/<!-- house:local -->\n<!-- Previous content[^\n]*-->\n<!--\nOld -- > text\n-->/)
  })

  it('first adoption without a local marker appends the previous content', () => {
    const template = '# house:managed:begin\na: 1\n# house:managed:end'
    expect(mergeManaged(template, 'b: 2', 'x.yml')).toMatch(/# house:managed:end\n# Previous content[^\n]*\n# b: 2$/)
  })

  it('an end marker before the begin marker is not a block', () => {
    expect(splitManaged('# house:managed:end\n# house:managed:begin')).toBeUndefined()
    expect(splitManaged('# house:managed:begin\nno end')).toBeUndefined()
  })
})

describe('managedConflicts', () => {
  it('a local Dependabot update may not duplicate a synced one', () => {
    const clash = withLocal(dependabot, '  - package-ecosystem: npm\n    directory: "/"')
    expect(managedConflicts('.github/dependabot.yml', dependabot, clash)).toStrictEqual(['duplicates the synced Dependabot update for npm in /'])
    const other = withLocal(dependabot, '  - package-ecosystem: npm\n    directory: /web\n    target-branch: next')
    expect(managedConflicts('.github/dependabot.yml', dependabot, other)).toStrictEqual([])
  })

  it('reads Dependabot updates by ecosystem, directories and target branch, ignoring lines that are not one', () => {
    const template = [
      '# house:managed:begin',
      'updates:',
      "  - package-ecosystem: 'pip'",
      '    directories: /api',
      '    target-branch: next',
      '# house:managed:end',
      '# house:local',
      '',
    ].join('\n')
    const local = [
      '    directory: /ignored-before-any-update',
      '  -package-ecosystem: not-an-item',
      '  - package-ecosystem:',
      '  - other: x',
      '  - package-ecosystem: pip',
      '    directories: /api',
      '    directory:',
      'target-branch: not-indented',
      '    target-branch: "next"',
    ].join('\n')
    expect(managedConflicts('.github/dependabot.yml', template, `${template}${local}\n`)).toStrictEqual([
      'duplicates the synced Dependabot update for pip in /api on next',
    ])
  })

  it('local YAML may not redefine a synced top-level key', () => {
    const funding = '# house:managed:begin\ngithub: [TGTGamer]\n# house:managed:end\n# house:local\n'
    expect(managedConflicts('.github/FUNDING.yml', funding, `${funding}github: [someone]\n`)).toStrictEqual(['redefines the synced key "github"'])
    expect(managedConflicts('.github/FUNDING.yml', funding, `${funding}custom: ['https://x.io']\n`)).toStrictEqual([])
    expect(managedConflicts('.github/FUNDING.yaml', funding, `${funding}github: [someone]\n`)).toStrictEqual(['redefines the synced key "github"'])
  })

  it('local issue form fields may not reuse a synced id', () => {
    const form = '# house:managed:begin\nbody:\n  - type: input\n    id: version\n# house:managed:end\n# house:local\n'
    expect(managedConflicts('.github/ISSUE_TEMPLATE/bug.yml', form, `${form}  - type: input\n    id: version # the same\n`)).toStrictEqual([
      'reuses the synced field id "version"',
    ])
    expect(managedConflicts('.github/ISSUE_TEMPLATE/bug.yml', form, `${form}  - type: input\n    id:\n    id: other\n`)).toStrictEqual([])
  })

  it('local workflow jobs may not redefine a synced job', () => {
    const workflow = '# house:managed:begin\njobs:\n  house-policy:\n    uses: x\n# house:managed:end\n# house:local\n'
    expect(managedConflicts('.github/workflows/house-policy.yml', workflow, `${workflow}  house-policy:\n    uses: y\n`)).toStrictEqual([
      'redefines the synced job "house-policy"',
    ])
    expect(managedConflicts('.github/workflows/house-policy.yml', workflow, `${workflow}  lint:\n    runs-on: x\n`)).toStrictEqual([])
  })

  it('nothing may follow a managed block that must come last', () => {
    const owners = '# house:local\n* @me\n# house:managed:begin\n/LICENSE @admin\n# house:managed:end\n'
    expect(managedConflicts('.github/CODEOWNERS', owners, `${owners}/LICENSE @someone\n`)).toStrictEqual([
      'local rules after the managed block would override it; move them above the block',
    ])
    expect(managedConflicts('.github/CODEOWNERS', owners, owners.replace('* @me', '* @me\n/api/ @api-team'))).toStrictEqual([])
    expect(managedConflicts('.github/CODEOWNERS', owners, `${owners}\n# a comment\n<!-- x\n-->\n`)).toStrictEqual([])
  })

  it('conflict checks ignore files without markers on either side', () => {
    expect(managedConflicts('x.yml', 'a: 1', 'a: 2')).toStrictEqual([])
    expect(managedConflicts('x.yml', dependabot, 'a: 2')).toStrictEqual([])
  })

  it('stay linear on adversarial lines', () => {
    const spaces = ' '.repeat(200_000)
    const hostile = `${dependabot}  - package-ecosystem:${spaces}\r\n    directory:${spaces}\r\n    id:${spaces}x\n  ${'a'.repeat(200_000)}${spaces}\n`
    const started = performance.now()
    managedConflicts('.github/dependabot.yml', dependabot, hostile)
    syncFindings([{ path: '.github/dependabot.yml', rendered: dependabot, base: dependabot, head: hostile }])
    expect(performance.now() - started).toBeLessThan(1_000)
  })
})

describe('syncFindings', () => {
  it('documents may not be edited, only synced', () => {
    const doc = { path: 'SECURITY.md', rendered: 'new', base: 'old' }
    expect(syncFindings([{ ...doc, head: 'old' }])).toStrictEqual([])
    expect(syncFindings([{ ...doc, head: 'new' }])).toStrictEqual([])
    expect(syncFindings([{ ...doc, head: 'mine' }])).toStrictEqual([{ path: 'SECURITY.md', message: 'edits a synced file' }])
    expect(syncFindings([{ ...doc, head: null }])).toStrictEqual([{ path: 'SECURITY.md', message: 'deletes a synced file' }])
    expect(syncFindings([{ ...doc, base: null, head: null }])).toStrictEqual([])
  })

  it('managed blocks may not be edited, local rules may be added', () => {
    const base = { path: '.github/dependabot.yml', rendered: dependabot, base: dependabot }
    expect(syncFindings([{ ...base, head: withLocal(dependabot, '  - package-ecosystem: pip\n    directory: /api') }])).toStrictEqual([])
    expect(syncFindings([{ ...base, head: dependabot.replace('npm', 'bun') }])).toStrictEqual([
      { path: '.github/dependabot.yml', message: 'edits the managed block; add local rules outside it' },
    ])
    expect(syncFindings([{ ...base, head: 'version: 2\n' }])).toStrictEqual([
      { path: '.github/dependabot.yml', message: 'removes the house:managed markers' },
    ])
    expect(syncFindings([{ ...base, base: 'version: 2\n', head: 'version: 2\n' }])).toStrictEqual([])
  })

  it('a sync that brings the block up to date is allowed', () => {
    const stale = dependabot.replace('npm', 'yarn')
    expect(syncFindings([{ path: '.github/dependabot.yml', rendered: dependabot, base: stale, head: dependabot }])).toStrictEqual([])
    expect(syncFindings([{ path: '.github/dependabot.yml', rendered: dependabot, base: null, head: dependabot }])).toStrictEqual([])
  })

  it('a local rule that conflicts with a synced one is a finding', () => {
    const clash = withLocal(dependabot, '  - package-ecosystem: npm\n    directory: /')
    expect(syncFindings([{ path: '.github/dependabot.yml', rendered: dependabot, base: dependabot, head: clash }])).toStrictEqual([
      { path: '.github/dependabot.yml', message: 'duplicates the synced Dependabot update for npm in /' },
    ])
  })
})

describe('markers', () => {
  it('only count on comment lines, so a document quoting them is synced whole', () => {
    const doc = [
      '= Governance',
      '',
      '* Configuration contains a block between `house:managed:begin` and `house:managed:end`.',
      'A repository adds its own rules at the `house:local` line.',
      '',
    ].join('\n')
    expect(splitManaged(doc)).toBeUndefined()
    expect(mergeManaged(doc, 'the previous document\n', 'GOVERNANCE.md')).toBe(doc)
  })

  it('isMarker accepts YAML and Markdown comment markers and rejects look-alikes', () => {
    expect(isMarker('# house:managed:begin - synced', BEGIN)).toBe(true)
    expect(isMarker('  <!-- house:managed:end -->', END)).toBe(true)
    expect(isMarker('# house:local - add rules below', LOCAL)).toBe(true)
    expect(isMarker('#house:local', LOCAL)).toBe(true)
    expect(isMarker('Mentions `house:managed:begin` in prose', BEGIN)).toBe(false)
    expect(isMarker('#house:managed:beginning', BEGIN)).toBe(false)
    expect(isMarker('# house:managed:begin:x', BEGIN)).toBe(false)
    expect(isMarker('# house:managed:begin-x', BEGIN)).toBe(false)
    expect(isMarker('// house:managed:begin', BEGIN)).toBe(false)
  })
})
