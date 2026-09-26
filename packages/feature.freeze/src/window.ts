/**
 * @file packages/feature.freeze/src/window.ts
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

import { type Freeze, type FreezeWindow, parseFreezeTime } from '@resnovas/config'
import { DateTime } from 'effect'

/** A merge freeze in effect, and what to tell people about it. */
export interface ActiveFreeze {
  /** The window's key, or `active` for the manual freeze. */
  readonly key: string
  readonly reason: string | undefined
  /** When it ends, as people read it; undefined for the manual freeze, which lasts until it is turned off. */
  readonly until: string | undefined
}

/**
 * The key an {@link ActiveFreeze} carries for the manual freeze, `freeze.active`.
 *
 * @example
 * ```ts import.meta.vitest name="MANUAL"
 * import { MANUAL } from '@resnovas/feature.freeze'
 *
 * MANUAL // => 'active'
 * ```
 */
export const MANUAL = 'active'

const DAY = 24 * 60

// Minutes into the day, or into the week from Sunday 00:00 when the time names a day. The schema only lets valid times through.
const minuteOf = (text: string) => {
  const time = parseFreezeTime(text)
  return (time?.day ?? 0) * DAY + (time?.minutes ?? 0)
}

/**
 * Whether a freeze window is in effect at a moment, and when it ends.
 *
 * @remarks
 * A dated window runs from `start` up to, not including, `end`. A recurring
 * window runs from `from` up to `to` in its time zone (UTC when left out),
 * every day when the times name no day and every week when they do; when
 * `to` comes before `from` it runs over midnight, or over the end of the
 * week. Recurring times are read on the local clock, so a daylight saving
 * change moves them with it.
 *
 * @example
 * ```ts import.meta.vitest name="windowEnd"
 * import { windowEnd } from '@resnovas/feature.freeze'
 *
 * const saturday = Date.parse('2026-09-26T12:00:00Z')
 * windowEnd({ from: 'Fri 16:00', to: 'Mon 08:00' }, saturday) // => 'Mon 08:00 (UTC)'
 * windowEnd({ from: '22:00', to: '06:00', timezone: 'Europe/London' }, saturday) // => undefined
 * windowEnd({ start: '2026-09-01T00:00:00Z', end: '2026-10-01T00:00:00Z' }, saturday) // => '2026-10-01T00:00:00Z'
 * ```
 *
 * @param window - The window, as the config gives it.
 * @param now - The moment, in epoch milliseconds.
 * @returns When the window ends, as people read it, while it is in effect; undefined otherwise.
 */
export const windowEnd = (window: FreezeWindow, now: number): string | undefined => {
  if ('start' in window) return now >= Date.parse(window.start) && now < Date.parse(window.end) ? window.end : undefined
  const zone = window.timezone ?? 'UTC'
  const parts = DateTime.toParts(DateTime.unsafeMakeZoned(now, { timeZone: zone }))
  const weekly = parseFreezeTime(window.from)?.day !== undefined
  const current = (weekly ? parts.weekDay * DAY : 0) + parts.hours * 60 + parts.minutes
  const from = minuteOf(window.from)
  const to = minuteOf(window.to)
  const inside = from < to ? current >= from && current < to : current >= from || current < to
  return inside ? `${window.to} (${zone})` : undefined
}

/**
 * The merge freeze in effect at a moment, if any: the manual one first, then
 * the windows in the order the config lists them.
 *
 * @example
 * ```ts import.meta.vitest name="activeFreeze"
 * import { activeFreeze } from '@resnovas/feature.freeze'
 *
 * const now = Date.parse('2026-12-25T12:00:00Z')
 * const freeze = { windows: { holidays: { start: '2026-12-24T00:00:00Z', end: '2027-01-02T00:00:00Z', reason: 'Holidays' } } }
 * activeFreeze(freeze, now)?.key // => 'holidays'
 * activeFreeze({ active: true, reason: 'Release' }, now)?.until // => undefined
 * activeFreeze({ active: false }, now) // => undefined
 * ```
 *
 * @param freeze - The config's `freeze` section.
 * @param now - The moment, in epoch milliseconds.
 * @returns The freeze in effect, or undefined when merges are open.
 */
export const activeFreeze = (freeze: Freeze, now: number): ActiveFreeze | undefined => {
  if (freeze.active === true) return { key: MANUAL, reason: freeze.reason, until: undefined }
  for (const [key, window] of Object.entries(freeze.windows ?? {})) {
    const until = windowEnd(window, now)
    if (until !== undefined) return { key, reason: window.reason, until }
  }
  return undefined
}

/**
 * Says which freeze is in effect, why, and until when, in one sentence.
 *
 * @example
 * ```ts import.meta.vitest name="describeFreeze"
 * import { describeFreeze } from '@resnovas/feature.freeze'
 *
 * describeFreeze({ key: 'weekend', reason: 'No weekend deploys', until: 'Mon 08:00 (UTC)' }) // => 'Merges are frozen by the weekend window (No weekend deploys) until Mon 08:00 (UTC).'
 * describeFreeze({ key: 'active', reason: undefined, until: undefined }) // => 'Merges are frozen by freeze.active until it is turned off.'
 * ```
 *
 * @param freeze - The freeze in effect.
 * @returns The sentence.
 */
export const describeFreeze = (freeze: ActiveFreeze): string => {
  const source = freeze.key === MANUAL ? 'freeze.active' : `the ${freeze.key} window`
  const reason = freeze.reason === undefined || freeze.reason === '' ? '' : ` (${freeze.reason})`
  const until = freeze.until === undefined ? 'until it is turned off' : `until ${freeze.until}`
  return `Merges are frozen by ${source}${reason} ${until}.`
}
