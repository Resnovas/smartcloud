/**
 * @file tests/runtime/src/verification-registry.spec.ts
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
import { FEATURES } from '@resnovas/runtime'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../../..', import.meta.url))

/** Read the canonical Markdown table; backticks are presentation, not registry identifiers. */
const rows = (section: string): ReadonlyArray<ReadonlyArray<string>> =>
  section
    .split('\n')
    .filter((line) => line.startsWith('| `'))
    .map((line) =>
      line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim().replaceAll('`', '')),
    )

describe('verification registry', () => {
  it('documents every runtime feature, its actual dispatch kinds and an executable contract suite', () => {
    const text = readFileSync(join(root, 'docs/verification.md'), 'utf8')
    const features = rows(text.split('## Runtime features\n')[1]?.split('## Workflows\n')[0] ?? '')
    expect(features.map((row) => row[0]).sort()).toEqual(FEATURES.map((feature) => feature.name).sort())
    for (const feature of FEATURES) {
      const row = features.find((entry) => entry[0] === feature.name)
      expect(row?.[1]?.split(', ').sort(), `${feature.name}: document Feature.handles`).toEqual(
        [...feature.handles].sort(),
      )
      expect(row?.[2]?.length, `${feature.name}: explain enabling configuration`).toBeGreaterThan(5)
      expect(row?.[3]).toBe(`pnpm nx test @resnovas/feature.${feature.name}-tests`)
      expect(existsSync(join(root, `tests/feature.${feature.name}/src/feature.spec.ts`))).toBe(true)
      expect(row?.[4]?.length, `${feature.name}: name observable results, not just an exit code`).toBeGreaterThan(25)
    }
  })

  it('documents every workflow trigger and separates local checks from live-only proof', () => {
    const text = readFileSync(join(root, 'docs/verification.md'), 'utf8')
    const workflows = rows(text.split('## Workflows\n')[1]?.split('## Evidence\n')[0] ?? '')
    const files = readdirSync(join(root, '.github/workflows')).filter((file) => /\.ya?ml$/.test(file))
    expect(workflows.map((row) => row[0]).sort()).toEqual(files.sort())
    for (const row of workflows) {
      const file = row[0] ?? ''
      const source = readFileSync(join(root, '.github/workflows', file), 'utf8')
      const on = source.split('\non:\n')[1]?.split('\npermissions:')[0] ?? ''
      const events = [...on.matchAll(/^ {2}([a-z_]+):/gm)].map((match) => match[1]).sort()
      expect(row[1]?.split(', ').sort(), `${file}: document actual on events`).toEqual(events)
      expect(row[2]?.length, `${file}: give the local verification command`).toBeGreaterThan(10)
      expect(row[3], `${file}: identify proof requiring GitHub`).toMatch(/^Live:/)
    }
  })
})
