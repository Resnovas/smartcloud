/**
 * @file tools/posthog/feature-flags.ts
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

// Creates smartcloud's feature flags in PostHog, or checks that they exist,
// so that turning a feature off there works from the day it ships. The code
// evaluates each flag with a fallback (FEATURE_FLAGS in
// packages/runtime/src/flags.ts), so a flag nobody created is invisible: the
// feature runs, and nothing in PostHog can switch it off.
//
//   node tools/posthog/feature-flags.ts            create every flag PostHog lacks
//   node tools/posthog/feature-flags.ts --check    exit 1 when a flag is missing, creating nothing
//
// Needs POSTHOG_API_KEY: a PostHog personal API key with the feature_flag:read
// scope (and feature_flag:write to create), for the project release.config.json
// names (posthog.projectId, on posthog.host). Reads the flags from the built
// runtime, so run `pnpm run build` first. Runs on Node's built-in TypeScript
// support.

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadReleaseConfig } from '../release/config.ts'
import { type FlagDefaults, flagDefinition, planFlags, type RemoteFlag, renderPlan } from './flags.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const check = process.argv.includes('--check')

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const key = process.env['POSTHOG_API_KEY']
if (key === undefined || key === '') {
  fail(
    'POSTHOG_API_KEY is not set: a PostHog personal API key with the feature_flag:read scope, and feature_flag:write to create flags.',
  )
}

const { host, projectId } =
  loadReleaseConfig(root).posthog ?? fail('release.config.json names no PostHog project (posthog.projectId).')
const endpoint = `${host}/api/projects/${projectId}/feature_flags/`
const headers = { authorization: `Bearer ${key}`, 'content-type': 'application/json' }

// The built runtime, so the keys and defaults are the ones the code uses.
const runtimeFlags = new URL('../../packages/runtime/dist/flags.js', import.meta.url)
const flags = await import(runtimeFlags.href)
  .then((module: { readonly FEATURE_FLAGS: FlagDefaults }) => module.FEATURE_FLAGS)
  .catch(() => fail('The runtime is not built, so the flags cannot be read: run `pnpm run build` first.'))

// PostHog pages the list; every page is read so a flag on a later one is not
// created twice.
const listFlags = async (): Promise<ReadonlyArray<RemoteFlag>> => {
  const found: RemoteFlag[] = []
  let next: string | null = `${endpoint}?limit=100`
  while (next !== null) {
    const response = await fetch(next, { headers })
    if (!response.ok) fail(`PostHog refused to list the flags: ${response.status} ${await response.text()}`)
    const page = (await response.json()) as {
      readonly results: ReadonlyArray<RemoteFlag>
      readonly next: string | null
    }
    found.push(...page.results.map(({ key, active, deleted }) => ({ key, active, deleted })))
    next = page.next
  }
  return found
}

const createFlag = async (flagKey: string): Promise<void> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(flagDefinition(flagKey, flags[flagKey] ?? true)),
  })
  if (!response.ok) fail(`PostHog refused to create ${flagKey}: ${response.status} ${await response.text()}`)
  console.log(`  created ${flagKey}`)
}

const plan = planFlags(flags, await listFlags())
console.log(renderPlan(plan, { check }))
if (check) {
  process.exitCode = plan.missing.length + plan.deleted.length > 0 ? 1 : 0
} else {
  for (const flagKey of plan.missing) await createFlag(flagKey)
  if (plan.deleted.length > 0) process.exitCode = 1
}
