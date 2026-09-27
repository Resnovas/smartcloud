/**
 * @file tests/ci/src/smoke/replay.spec.ts
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

import { afterEach, beforeEach, describe, expect, it } from '@effect/vitest'
import { vi } from 'vitest'
import { fileURLToPath } from 'node:url'

// Load the preload as a file; it has no exports, only its effect on the environment.
const run = () => import(fileURLToPath(new URL('../../../../tools/ci/smoke/replay.ts', import.meta.url)))

const replayed = {
  SMOKE_EVENT_NAME: 'issues',
  SMOKE_EVENT_PATH: '/work/tools/ci/smoke/events/issues.json',
  SMOKE_SUMMARY: '/tmp/smoke-issues.md',
}

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('GITHUB_EVENT_NAME', 'pull_request')
  vi.stubEnv('GITHUB_EVENT_PATH', '/runner/_temp/_github_workflow/event.json')
  vi.stubEnv('GITHUB_STEP_SUMMARY', '/runner/_temp/_runner_file_commands/step_summary')
  for (const [name, value] of Object.entries(replayed)) vi.stubEnv(name, value)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('replaying a recorded event', () => {
  it('points the event and the job summary at the recorded ones', async () => {
    await run()
    expect(process.env['GITHUB_EVENT_NAME']).toBe('issues')
    expect(process.env['GITHUB_EVENT_PATH']).toBe('/work/tools/ci/smoke/events/issues.json')
    expect(process.env['GITHUB_STEP_SUMMARY']).toBe('/tmp/smoke-issues.md')
  })

  it.each(Object.keys(replayed))('stops the action when %s is missing or empty', async (name) => {
    vi.stubEnv(name, '')
    await expect(run()).rejects.toThrow(`${name} must be set to replay a recorded event.`)
    vi.resetModules()
    vi.stubEnv(name, undefined)
    await expect(run()).rejects.toThrow(`${name} must be set to replay a recorded event.`)
  })
})
