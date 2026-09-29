/**
 * @file packages/conditions/src/time.ts
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

import { Schema } from 'effect'

/**
 * A day of the week, by its three-letter English name.
 *
 * @example
 * ```ts import.meta.vitest name="Weekday"
 * import { Weekday } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(Weekday)('mon') // => true
 * Schema.is(Weekday)('monday') // => false
 * ```
 */
export const Weekday = Schema.Literal('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun').annotations({
  identifier: 'Weekday',
  description: 'A day of the week: mon, tue, wed, thu, fri, sat or sun.',
})
/** A decoded {@link Weekday}. */
export type Weekday = typeof Weekday.Type

/**
 * A time of day on the 24-hour clock, written `HH:MM`.
 *
 * @example
 * ```ts import.meta.vitest name="TimeOfDay"
 * import { TimeOfDay } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(TimeOfDay)('09:30') // => true
 * Schema.is(TimeOfDay)('24:00') // => false
 * ```
 */
export const TimeOfDay = Schema.String.pipe(Schema.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/)).annotations({
  identifier: 'TimeOfDay',
  description: 'A time of day on the 24-hour clock, as HH:MM.',
})

const isTimeZone = (zone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

/**
 * An IANA time zone name, such as `Europe/London`, or `UTC`, validated when
 * the config is decoded.
 *
 * @example
 * ```ts import.meta.vitest name="TimeZone"
 * import { TimeZone } from '@resnovas/conditions'
 * import { Schema } from 'effect'
 *
 * Schema.is(TimeZone)('Europe/London') // => true
 * Schema.is(TimeZone)('Mars/Olympus') // => false
 * ```
 */
export const TimeZone = Schema.String.pipe(
  Schema.filter((zone) => isTimeZone(zone) || `unknown time zone ${JSON.stringify(zone)}`, {
    identifier: 'TimeZone',
    description: 'An IANA time zone name, such as Europe/London, or UTC.',
    jsonSchema: {},
  }),
)

/** A weekday and the minutes since midnight, in some time zone. */
export interface LocalTime {
  readonly weekday: Weekday
  readonly minutes: number
}

/**
 * The weekday and time of day an instant falls on in a time zone.
 *
 * @example
 * ```ts import.meta.vitest name="localTime"
 * import { localTime } from '@resnovas/conditions'
 *
 * // Thursday 1 January 1970, 01:00 in London (British Standard Time).
 * localTime(new Date(0), 'Europe/London').weekday // => 'thu'
 * localTime(new Date(0), 'Europe/London').minutes // => 60
 * ```
 *
 * @param instant - The moment to look at.
 * @param timeZone - An IANA time zone name; must pass {@link TimeZone}.
 * @returns The local weekday and minutes since midnight.
 */
export const localTime = (instant: Date, timeZone: string): LocalTime => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((each) => each.type === type)?.value ?? ''
  return {
    weekday: part('weekday').toLowerCase() as Weekday,
    minutes: Number(part('hour')) * 60 + Number(part('minute')),
  }
}

/**
 * Minutes since midnight for a {@link TimeOfDay}.
 *
 * @example
 * ```ts import.meta.vitest name="minutesOf"
 * import { minutesOf } from '@resnovas/conditions'
 *
 * minutesOf('09:30') // => 570
 * ```
 *
 * @param time - A time written `HH:MM`.
 * @returns The minutes since midnight.
 */
export const minutesOf = (time: string): number => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

/** The days and hours a time window covers; every part is optional. */
export interface Window {
  readonly days?: ReadonlyArray<Weekday>
  readonly from?: string
  readonly to?: string
}

const WEEK: ReadonlyArray<Weekday> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const previous = (day: Weekday): Weekday => WEEK[(WEEK.indexOf(day) + 6) % 7] as Weekday

/**
 * Whether a local time falls inside a window.
 *
 * @remarks
 * `from` is inclusive and `to` exclusive; without `from` the window opens at
 * midnight, and without `to` it runs to midnight. When `to` is earlier than
 * `from` the window runs past midnight, and the hours after midnight belong
 * to the day the window opened on: `days: [fri]` from `22:00` to `06:00`
 * covers Saturday 02:00 but not Friday 02:00. Without `days`, every day
 * counts.
 *
 * @example
 * ```ts import.meta.vitest name="inWindow"
 * import { inWindow } from '@resnovas/conditions'
 *
 * inWindow({ days: ['mon', 'tue', 'wed', 'thu', 'fri'], from: '09:00', to: '17:00' }, { weekday: 'tue', minutes: 600 }) // => true
 * inWindow({ days: ['fri'], from: '22:00', to: '06:00' }, { weekday: 'sat', minutes: 120 }) // => true
 * ```
 *
 * @param window - The days and hours to test.
 * @param time - The local weekday and minutes since midnight.
 * @returns True when the time is inside the window.
 */
export const inWindow = (window: Window, time: LocalTime): boolean => {
  const from = window.from === undefined ? 0 : minutesOf(window.from)
  const to = window.to === undefined ? 24 * 60 : minutesOf(window.to)
  const overnight = to <= from
  const tail = overnight && time.minutes < to
  const inHours = overnight ? time.minutes >= from || tail : time.minutes >= from && time.minutes < to
  const day = tail ? previous(time.weekday) : time.weekday
  return inHours && (window.days === undefined || window.days.includes(day))
}
