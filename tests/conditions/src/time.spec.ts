/**
 * @file tests/conditions/src/time.spec.ts
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
import { Either, Schema } from 'effect'
import { inWindow, localTime, minutesOf, TimeOfDay, TimeZone, Weekday } from '@resnovas/conditions'

describe('time schemas', () => {
  it('accept weekdays, HH:MM times and IANA zones', () => {
    expect(Schema.is(Weekday)('sun')).toBe(true)
    expect(Schema.is(TimeOfDay)('00:00')).toBe(true)
    expect(Schema.is(TimeOfDay)('23:59')).toBe(true)
    expect(Schema.is(TimeOfDay)('9:00')).toBe(false)
    expect(Schema.is(TimeZone)('UTC')).toBe(true)
    expect(Schema.is(TimeZone)('America/New_York')).toBe(true)
  })

  it('rejects an unknown time zone with its name', () => {
    const result = Schema.decodeUnknownEither(TimeZone)('Mars/Olympus')
    expect(Either.isLeft(result)).toBe(true)
    expect(String(Either.isLeft(result) && result.left)).toContain('unknown time zone "Mars/Olympus"')
  })
})

describe('localTime', () => {
  it('follows the zone, daylight saving time included', () => {
    expect(localTime(new Date('2026-01-05T12:00:00Z'), 'Europe/London')).toStrictEqual({ weekday: 'mon', minutes: 720 })
    expect(localTime(new Date('2026-07-06T12:00:00Z'), 'Europe/London')).toStrictEqual({ weekday: 'mon', minutes: 780 })
    expect(localTime(new Date('2026-07-06T02:00:00Z'), 'America/Los_Angeles')).toStrictEqual({
      weekday: 'sun',
      minutes: 19 * 60,
    })
    expect(localTime(new Date('2026-07-06T00:00:00Z'), 'UTC')).toStrictEqual({ weekday: 'mon', minutes: 0 })
  })
})

describe('minutesOf', () => {
  it('counts minutes since midnight', () => {
    expect(minutesOf('00:00')).toBe(0)
    expect(minutesOf('23:59')).toBe(1439)
  })
})

describe('inWindow', () => {
  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'] as const

  it('includes from and excludes to', () => {
    const window = { from: '09:00', to: '17:00' }
    expect(inWindow(window, { weekday: 'mon', minutes: 540 })).toBe(true)
    expect(inWindow(window, { weekday: 'mon', minutes: 539 })).toBe(false)
    expect(inWindow(window, { weekday: 'mon', minutes: 1020 })).toBe(false)
  })

  it('checks the day, and every day counts without days', () => {
    expect(inWindow({ days: [...weekdays] }, { weekday: 'sat', minutes: 600 })).toBe(false)
    expect(inWindow({ days: [...weekdays] }, { weekday: 'fri', minutes: 1439 })).toBe(true)
    expect(inWindow({}, { weekday: 'sat', minutes: 0 })).toBe(true)
  })

  it('runs past midnight, counting the early hours on the day the window opened', () => {
    const night = { days: ['fri'] as const, from: '22:00', to: '06:00' }
    expect(inWindow(night, { weekday: 'fri', minutes: 23 * 60 })).toBe(true)
    expect(inWindow(night, { weekday: 'sat', minutes: 2 * 60 })).toBe(true)
    expect(inWindow(night, { weekday: 'fri', minutes: 2 * 60 })).toBe(false)
    expect(inWindow(night, { weekday: 'sat', minutes: 6 * 60 })).toBe(false)
    expect(inWindow({ days: ['sat'], from: '22:00', to: '06:00' }, { weekday: 'sun', minutes: 60 })).toBe(true)
    expect(inWindow({ days: ['sun'], from: '22:00', to: '06:00' }, { weekday: 'mon', minutes: 60 })).toBe(true)
  })

  it('treats a to at from as a full day starting at from', () => {
    const window = { days: ['mon'] as const, from: '12:00', to: '12:00' }
    expect(inWindow(window, { weekday: 'tue', minutes: 11 * 60 })).toBe(true)
    expect(inWindow(window, { weekday: 'tue', minutes: 12 * 60 })).toBe(false)
  })
})
