/**
 * @file tools/posthog/flags.ts
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

// The pure logic of tools/posthog/feature-flags.ts, which creates and
// verifies smartcloud's feature flags in PostHog, and of the test that keeps
// the flag table in docs/telemetry.mdx in step with FEATURE_FLAGS. Nothing
// here reads a file or talks to PostHog, so it is tested in tests/tools.

/** The flag keys smartcloud evaluates, each with its in-code default, as `FEATURE_FLAGS` lists them. */
export type FlagDefaults = Readonly<Record<string, boolean>>

/** A feature flag as PostHog's feature flag API lists it. */
export interface RemoteFlag {
  readonly key: string
  readonly active: boolean
  readonly deleted?: boolean | undefined
}

/** What PostHog is sent to create a flag. */
export interface FlagDefinition {
  readonly key: string
  readonly name: string
  readonly active: boolean
  readonly filters: {
    readonly groups: ReadonlyArray<{ readonly properties: ReadonlyArray<never>; readonly rollout_percentage: number }>
  }
}

/** Where every smartcloud flag stands in a PostHog project. */
export interface FlagPlan {
  /** Flags PostHog has, live. */
  readonly present: ReadonlyArray<string>
  /** Flags PostHog does not have, which the script creates. */
  readonly missing: ReadonlyArray<string>
  /** Flags deleted in PostHog: their key is taken, so they are restored there, not created. */
  readonly deleted: ReadonlyArray<string>
  /** Present flags whose state in PostHog differs from the in-code default; someone turned them, so they are only reported. */
  readonly differing: ReadonlyArray<string>
}

/** The prefix every smartcloud flag key carries, as `flagFor` builds it. */
export const FLAG_PREFIX = 'smartcloud-'

/**
 * What PostHog is sent to create a flag: released to every repository, and
 * on or off as the in-code default is, so PostHog answers exactly what the
 * code would have assumed until someone changes the flag.
 */
export const flagDefinition = (key: string, fallback: boolean): FlagDefinition => ({
  key,
  name: `smartcloud: the ${key.startsWith(FLAG_PREFIX) ? key.slice(FLAG_PREFIX.length) : key} feature`,
  active: fallback,
  filters: { groups: [{ properties: [], rollout_percentage: 100 }] },
})

/** Sorts the flags in code against the flags PostHog lists. */
export const planFlags = (flags: FlagDefaults, remote: ReadonlyArray<RemoteFlag>): FlagPlan => {
  const byKey = new Map(remote.map((flag) => [flag.key, flag] as const))
  const keys = Object.keys(flags).sort()
  const found = keys.filter((key) => byKey.get(key)?.deleted !== true && byKey.has(key))
  return {
    present: found,
    missing: keys.filter((key) => !byKey.has(key)),
    deleted: keys.filter((key) => byKey.get(key)?.deleted === true),
    differing: found.filter((key) => byKey.get(key)?.active !== flags[key]),
  }
}

/** The flag keys a Markdown page's flag table lists, in order: each row whose first cell is a `smartcloud-` key in code. */
export const flagsInTable = (markdown: string): ReadonlyArray<string> =>
  [...markdown.matchAll(/^\|\s*`(smartcloud-[a-z0-9-]+)`\s*\|/gmu)].map((match) => String(match[1]))

/** The plan as the script prints it. */
export const renderPlan = (plan: FlagPlan, options: { readonly check: boolean }): string => {
  const list = (keys: ReadonlyArray<string>) => keys.map((key) => `  ${key}`).join('\n')
  const lines = [`${plan.present.length} flag(s) present in PostHog.`]
  if (plan.differing.length > 0) {
    lines.push(`${plan.differing.length} flag(s) set differently from the in-code default in PostHog (left as set):`)
    lines.push(list(plan.differing))
  }
  if (plan.deleted.length > 0) {
    lines.push(
      `${plan.deleted.length} flag(s) deleted in PostHog; restore them there, their keys cannot be created again:`,
    )
    lines.push(list(plan.deleted))
  }
  if (plan.missing.length > 0) {
    lines.push(
      options.check
        ? `${plan.missing.length} flag(s) missing from PostHog (run: node tools/posthog/feature-flags.ts):`
        : `${plan.missing.length} flag(s) missing from PostHog, creating them:`,
    )
    lines.push(list(plan.missing))
  }
  return lines.join('\n')
}
