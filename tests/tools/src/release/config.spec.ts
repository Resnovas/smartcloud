/**
 * @file tests/tools/src/release/config.spec.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CONFIG_FILE, loadReleaseConfig, parseReleaseConfig, sbomFileName } from '../../../../tools/release/config.js'

describe('parseReleaseConfig', () => {
  it('fills every default from an empty object, naming the release after the package', () => {
    expect(parseReleaseConfig({}, '@resnovas/smartcloud')).toEqual({
      name: 'smartcloud',
      firstRelease: '1.0.0',
      majorTag: false,
      bundles: [],
      dropFromReleaseCommit: [],
      apps: [],
      versionGlobal: '__APP_VERSION__',
    })
  })

  it('keeps a full config and defaults the error tracking host', () => {
    const full = {
      name: 'smartcloud',
      firstRelease: '2.0.0',
      majorTag: true,
      bundles: [{ target: '@resnovas/action:bundle', output: 'dist/index.js', project: '@resnovas/action' }],
      dropFromReleaseCommit: ['externals'],
      apps: ['apps/action'],
      nightly: { major: 2 },
      posthog: { projectId: '285077' },
      npm: { prepare: 'node x.ts', directory: 'apps/cli/release', bundleTargets: ['a:bundle'], sbomProjects: ['a'] },
      versionGlobal: '__SMARTCLOUD_VERSION__',
    }
    expect(parseReleaseConfig(full, 'ignored')).toEqual({
      ...full,
      posthog: { host: 'https://eu.posthog.com', projectId: '285077' },
    })
  })

  it('keeps a bundle without a project and an npm section without prepare', () => {
    const config = parseReleaseConfig(
      {
        bundles: [{ target: 't', output: 'o' }],
        npm: { directory: 'd' },
        posthog: { host: 'https://us.posthog.com', projectId: '1' },
      },
      'x',
    )
    expect(config.bundles).toEqual([{ target: 't', output: 'o' }])
    expect(config.npm).toEqual({ directory: 'd', bundleTargets: [], sbomProjects: [] })
    expect(config.posthog).toEqual({ host: 'https://us.posthog.com', projectId: '1' })
  })

  it.each([
    [{ majorTag: 'yes' }, 'majorTag must be true or false'],
    [{ name: '' }, 'name must be a non-empty string'],
    [{ bundles: [{ target: 'x' }] }, 'bundles[0].output must be a non-empty string'],
    [{ bundles: ['x'] }, 'bundles[0] must be an object with target and output'],
    [{ bundles: {} }, 'bundles must be a list'],
    [{ nightly: { major: 'two' } }, 'nightly.major must be a whole number'],
    [{ nightly: { major: -1 } }, 'nightly.major must be a whole number'],
    [{ posthog: 'x' }, 'posthog must be an object with projectId'],
    [{ posthog: {} }, 'posthog.projectId must be a non-empty string'],
    [{ npm: 'x' }, 'npm must be an object with directory'],
    [{ npm: { prepare: 'x' } }, 'npm.directory must be a non-empty string'],
    [{ apps: 'apps/action' }, 'apps must be a list of strings'],
    [{ apps: [1] }, 'apps[0] must be a non-empty string'],
    [{ versionGlobal: 3 }, 'versionGlobal must be a non-empty string'],
  ])('names the wrong field: %j', (raw, message) => {
    expect(() => parseReleaseConfig(raw, 'x')).toThrow(`${CONFIG_FILE}: ${message}`)
  })

  it('refuses a file that is not an object', () => {
    expect(() => parseReleaseConfig([], 'x')).toThrow(`${CONFIG_FILE}: the file must be a JSON object`)
  })
})

describe('loadReleaseConfig', () => {
  it('reads package.json for the default name and release.config.json for the rest', () => {
    const root = mkdtempSync(join(tmpdir(), 'release-config-'))
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@example/thing' }))
    writeFileSync(join(root, CONFIG_FILE), JSON.stringify({ majorTag: true }))
    expect(loadReleaseConfig(root)).toMatchObject({ name: 'thing', majorTag: true })
  })

  it('falls back to "release" when package.json has no name', () => {
    const root = mkdtempSync(join(tmpdir(), 'release-config-'))
    writeFileSync(join(root, 'package.json'), '{}')
    writeFileSync(join(root, CONFIG_FILE), '{}')
    expect(loadReleaseConfig(root).name).toBe('release')
  })
})

describe('sbomFileName', () => {
  it('names the file as pnpm sbom does', () => {
    expect(sbomFileName('@resnovas/action', '2.0.0')).toBe('resnovas-action-2.0.0.spdx.json')
    expect(sbomFileName('plain', '1.2.3')).toBe('plain-1.2.3.spdx.json')
  })
})
