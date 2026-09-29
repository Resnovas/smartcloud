/**
 * @file tests/feature.freeze/src/window.spec.ts
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
import { activeFreeze, describeFreeze, MANUAL, windowEnd } from '@resnovas/feature.freeze'

// 2026-09-25 is a Friday.
const at = (iso: string) => Date.parse(iso)

describe('windowEnd', () => {
  it('opens a dated window at its start and closes it at its end', () => {
    const window = { start: '2026-12-24T00:00:00Z', end: '2027-01-02T00:00:00+01:00' }
    expect(windowEnd(window, at('2026-12-23T23:59:59Z'))).toBeUndefined()
    expect(windowEnd(window, at('2026-12-24T00:00:00Z'))).toBe('2027-01-02T00:00:00+01:00')
    expect(windowEnd(window, at('2027-01-01T22:59:59Z'))).toBe('2027-01-02T00:00:00+01:00')
    expect(windowEnd(window, at('2027-01-01T23:00:00Z'))).toBeUndefined()
  })

  it('runs a daily window within the day, or over midnight when to comes first', () => {
    const office = { from: '09:00', to: '17:00' }
    expect(windowEnd(office, at('2026-09-25T08:59:00Z'))).toBeUndefined()
    expect(windowEnd(office, at('2026-09-25T09:00:00Z'))).toBe('17:00 (UTC)')
    expect(windowEnd(office, at('2026-09-25T17:00:00Z'))).toBeUndefined()
    const night = { from: '22:00', to: '06:00' }
    expect(windowEnd(night, at('2026-09-25T23:30:00Z'))).toBe('06:00 (UTC)')
    expect(windowEnd(night, at('2026-09-26T05:59:00Z'))).toBe('06:00 (UTC)')
    expect(windowEnd(night, at('2026-09-26T12:00:00Z'))).toBeUndefined()
  })

  it('runs a weekly window over the weekend when to comes before from in the week', () => {
    const weekend = { from: 'Fri 16:00', to: 'Mon 08:00' }
    expect(windowEnd(weekend, at('2026-09-25T15:59:00Z'))).toBeUndefined()
    expect(windowEnd(weekend, at('2026-09-25T16:00:00Z'))).toBe('Mon 08:00 (UTC)')
    expect(windowEnd(weekend, at('2026-09-27T12:00:00Z'))).toBe('Mon 08:00 (UTC)')
    expect(windowEnd(weekend, at('2026-09-28T07:59:00Z'))).toBe('Mon 08:00 (UTC)')
    expect(windowEnd(weekend, at('2026-09-28T08:00:00Z'))).toBeUndefined()
    expect(windowEnd(weekend, at('2026-09-30T12:00:00Z'))).toBeUndefined()
    const release = { from: 'Tue 09:00', to: 'Tue 12:00' }
    expect(windowEnd(release, at('2026-09-29T10:00:00Z'))).toBe('Tue 12:00 (UTC)')
    expect(windowEnd(release, at('2026-09-30T10:00:00Z'))).toBeUndefined()
  })

  it('reads a time the schema would reject as midnight', () => {
    expect(windowEnd({ from: 'later', to: '06:00' }, at('2026-09-25T05:00:00Z'))).toBe('06:00 (UTC)')
  })

  it('reads recurring times on the clock of the window time zone', () => {
    const window = { from: 'Fri 16:00', to: 'Mon 08:00', timezone: 'Europe/London' }
    // 15:30 UTC is 16:30 in London during British Summer Time.
    expect(windowEnd(window, at('2026-09-25T15:30:00Z'))).toBe('Mon 08:00 (Europe/London)')
    expect(windowEnd(window, at('2026-09-25T14:30:00Z'))).toBeUndefined()
    // 18:00 UTC on Sunday is already Monday 03:00 in Tokyo.
    expect(windowEnd({ from: 'Mon 00:00', to: 'Mon 08:00', timezone: 'Asia/Tokyo' }, at('2026-09-27T18:00:00Z'))).toBe(
      'Mon 08:00 (Asia/Tokyo)',
    )
  })
})

describe('activeFreeze', () => {
  const now = at('2026-09-26T12:00:00Z')

  it('puts the manual freeze first, with its reason and no end', () => {
    expect(
      activeFreeze(
        { active: true, reason: 'Release 2.0', windows: { weekend: { from: 'Fri 16:00', to: 'Mon 08:00' } } },
        now,
      ),
    ).toStrictEqual({
      key: MANUAL,
      reason: 'Release 2.0',
      until: undefined,
    })
  })

  it('takes the first open window in the order the config lists them', () => {
    const freeze = {
      active: false,
      windows: {
        night: { from: '22:00', to: '06:00' },
        weekend: { from: 'Fri 16:00', to: 'Mon 08:00', reason: 'No weekend deploys' },
        holidays: { start: '2026-09-01T00:00:00Z', end: '2026-10-01T00:00:00Z' },
      },
    }
    expect(activeFreeze(freeze, now)).toStrictEqual({
      key: 'weekend',
      reason: 'No weekend deploys',
      until: 'Mon 08:00 (UTC)',
    })
  })

  it('finds nothing when no freeze is on', () => {
    expect(activeFreeze({}, now)).toBeUndefined()
    expect(activeFreeze({ windows: { night: { from: '22:00', to: '06:00' } } }, now)).toBeUndefined()
  })
})

describe('describeFreeze', () => {
  it('names the source, the reason when there is one, and the end', () => {
    expect(describeFreeze({ key: 'holidays', reason: '', until: '2027-01-02T00:00:00Z' })).toBe(
      'Merges are frozen by the holidays window until 2027-01-02T00:00:00Z.',
    )
    expect(describeFreeze({ key: MANUAL, reason: 'Release 2.0', until: undefined })).toBe(
      'Merges are frozen by freeze.active (Release 2.0) until it is turned off.',
    )
  })
})
