/**
 * @file tests/integrations.github/src/archive.spec.ts
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
import { Effect, Redacted, Schedule } from 'effect'
import { randomBytes } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { type ArchiveLocation, DEFAULT_ARCHIVE_LIMIT, makeLiveGitHub } from '@resnovas/integrations.github'
import { fakeFetch, type Reply } from './fake-fetch.js'
import { GIT_ARCHIVE, pax, tar, type TarEntry, tarball } from './tar.js'

// The archive reader is exercised through the live service: GitHub answers
// the tarball request with a redirect, and codeload serves the bytes.

const CODELOAD = '/Resnovas/.github/legacy.tar.gz/abc'
const SOURCE = { owner: 'Resnovas', repo: '.github', ref: 'abc' }

const serve = (reply: Reply) => {
  const fake = fakeFetch({
    [`GET /repos/Resnovas/.github/tarball/abc`]: {
      status: 302,
      headers: { location: `https://codeload.github.com${CODELOAD}` },
    },
    [`GET ${CODELOAD}`]: reply,
  })
  const service = makeLiveGitHub({
    token: Redacted.make('test-token'),
    coordinates: { owner: 'Resnovas', repo: 'example' },
    fetch: fake.fetch,
    retry: Schedule.recurs(0),
  })
  return {
    fake,
    read: (location: Partial<ArchiveLocation> = {}) =>
      Effect.flatMap(service, (github) => github.getArchive({ ...SOURCE, ...location })),
  }
}

const inTop = (path: string) => `Resnovas-.github-abc1234/${path}`
const long = (letter: string, count: number) => letter.repeat(count)

describe('archive reader: the tar stream', () => {
  it.effect('reads the files git archive writes: ustar names, split prefixes, pax paths, modes and nothing else', () =>
    Effect.gen(function* () {
      const { read } = serve({ bytes: new Uint8Array(GIT_ARCHIVE) })
      expect(yield* read()).toStrictEqual([
        { path: 'LICENSE', content: 'MIT\n', executable: false },
        { path: long('c', 120), content: 'pax path\n', executable: false },
        { path: 'empty.txt', content: '', executable: false },
        {
          path: `nested/${long('a', 90)}/${long('b', 90)}`,
          content: 'split into prefix and name\n',
          executable: false,
        },
        { path: 'nested/dir/file.txt', content: 'deep\n', executable: false },
        { path: 'tools/run', content: '#!/bin/sh\necho hi\n', executable: true },
      ])
    }),
  )

  it.effect('keeps only the files under a directory, relative to it, and only the paths asked for', () =>
    Effect.gen(function* () {
      const { read } = serve({ bytes: new Uint8Array(GIT_ARCHIVE) })
      expect(yield* read({ path: '/nested/' })).toStrictEqual([
        { path: `${long('a', 90)}/${long('b', 90)}`, content: 'split into prefix and name\n', executable: false },
        { path: 'dir/file.txt', content: 'deep\n', executable: false },
      ])
      expect(yield* read({ paths: ['tools/run', 'missing'] })).toStrictEqual([
        { path: 'tools/run', content: '#!/bin/sh\necho hi\n', executable: true },
      ])
      expect(yield* read({ path: 'nested/dir', paths: [] })).toStrictEqual([])
    }),
  )

  it.effect('assembles headers and content from chunks of any size', () =>
    Effect.gen(function* () {
      const body = 'x'.repeat(1_500)
      const { read } = serve({ bytes: tarball([{ path: inTop('big.txt'), content: body }]), chunk: 7 })
      expect(yield* read()).toStrictEqual([{ path: 'big.txt', content: body, executable: false }])
    }),
  )

  it.effect('takes a GNU long name, a pax size, a base-256 size and a contiguous file as regular files', () =>
    Effect.gen(function* () {
      const name = inTop(`gnu/${long('n', 120)}`)
      const exact = 'y'.repeat(512)
      const entries: ReadonlyArray<TarEntry> = [
        pax({ comment: 'sha' }, 'g'),
        { path: name, name: 'gnu-long-name', content: `${name}\0`, type: 'L' },
        { path: 'gnu-long-name', content: 'long\n' },
        pax({ size: '4' }),
        { path: inTop('pax-size'), content: 'abcd' },
        { path: inTop('binary'), content: 'bin\n', binarySize: true },
        { path: inTop('contiguous'), content: 'con\n', type: '7', mode: 0o755 },
        { path: inTop('exact'), content: exact },
        { path: inTop('link'), content: 'LICENSE', type: '2' },
        { path: inTop('dir/'), type: '5', mode: 0o755 },
        { path: 'no-top-directory', content: 'skipped' },
      ]
      const { read } = serve({ bytes: tarball(entries) })
      expect(yield* read()).toStrictEqual([
        { path: `gnu/${long('n', 120)}`, content: 'long\n', executable: false },
        { path: 'pax-size', content: 'abcd', executable: false },
        { path: 'binary', content: 'bin\n', executable: false },
        { path: 'contiguous', content: 'con\n', executable: true },
        { path: 'exact', content: exact, executable: false },
      ])
    }),
  )

  it.effect('reads an archive that ends without the closing zero blocks', () =>
    Effect.gen(function* () {
      const bytes = tar([{ path: inTop('a'), content: 'a\n' }], { padded: false })
      const { read } = serve({ bytes: new Uint8Array(gzipSync(bytes.subarray(0, bytes.byteLength - 1_024))) })
      expect(yield* read()).toStrictEqual([{ path: 'a', content: 'a\n', executable: false }])
    }),
  )

  it.effect('rejects an archive that is not gzip, not tar, cut short, or has a broken pax header', () =>
    Effect.gen(function* () {
      const rejected = (reply: Reply) => Effect.flip(serve(reply).read())
      expect(yield* rejected({ bytes: new TextEncoder().encode('not gzip') })).toMatchObject({
        _tag: 'ValidationFailed',
        detail: 'the archive is not gzip data',
      })
      expect(yield* rejected({ bytes: tarball([{ path: inTop('a'), content: 'a', corrupt: true }]) })).toMatchObject({
        _tag: 'ValidationFailed',
        detail: 'the archive is not a tar stream',
      })
      const whole = tar([{ path: inTop('a'), content: 'a'.repeat(600) }], { padded: false })
      const cut = (end: number) => ({ bytes: new Uint8Array(gzipSync(whole.subarray(0, end))) })
      // Inside a wanted file's content, and inside a skipped entry's.
      expect(yield* rejected(cut(700))).toMatchObject({ detail: 'the archive ends inside an entry' })
      expect(yield* Effect.flip(serve(cut(700)).read({ paths: [] }))).toMatchObject({
        detail: 'the archive ends inside an entry',
      })
      const cutPax = tar([pax({ path: inTop('p') }), { path: inTop('p'), content: 'p' }], { padded: false })
      expect(yield* rejected({ bytes: new Uint8Array(gzipSync(cutPax.subarray(0, 600))) })).toMatchObject({
        detail: 'the archive ends inside an entry',
      })
      const broken: TarEntry = { path: 'PaxHeader/x', content: '999 path=x\n', type: 'x' }
      expect(yield* rejected({ bytes: tarball([broken, { path: inTop('x'), content: 'x' }]) })).toMatchObject({
        detail: 'the archive is not a tar stream',
      })
      // A record without `=` is skipped; one whose length does not fit is not a record at all.
      const { read } = serve({
        bytes: tarball([
          pax({ comment: 'x' }),
          { path: 'PaxHeader/y', content: '12 nonsense\n', type: 'x' },
          { path: inTop('y'), content: 'y' },
        ]),
      })
      expect(yield* read()).toStrictEqual([{ path: 'y', content: 'y', executable: false }])
      const junk: TarEntry = { path: 'PaxHeader/x', content: 'nonsense', type: 'x' }
      expect(yield* rejected({ bytes: tarball([junk, { path: inTop('x'), content: 'x' }]) })).toMatchObject({
        detail: 'the archive is not a tar stream',
      })
    }),
  )

  it.effect('stops a download over the limit, and never retries it', () =>
    Effect.gen(function* () {
      // Random content, so the compressed archive is as large as the file.
      const bytes = tarball([{ path: inTop('a'), content: new Uint8Array(randomBytes(5_000)) }])
      const { fake, read } = serve({ bytes, chunk: 100 })
      const error = yield* Effect.flip(read({ maxBytes: 300 }))
      expect(error).toMatchObject({ _tag: 'ValidationFailed', detail: 'the archive is larger than 300 bytes' })
      expect(fake.requests).toHaveLength(2)
      expect(yield* read({ maxBytes: bytes.byteLength })).toHaveLength(1)
      expect(DEFAULT_ARCHIVE_LIMIT).toBe(64 * 1024 * 1024)
    }),
  )
})
