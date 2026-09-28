/**
 * @file packages/integrations.github/src/archive.ts
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

// Reads the files out of the tarball GitHub serves for a repository at a
// commit, as one Effect stream: the compressed bytes, capped; gzip through
// Node's own decompressor; then the tar stream itself, which `git archive`
// writes in ustar format with pax extended headers for names that do not
// fit. Nothing is held beyond one header block and the files the caller
// asked for.

import { Chunk, Data, Effect, Option, Stream } from 'effect'
import type { ArchiveEntry } from './service.js'

/**
 * The most bytes `getArchive` downloads unless the location says otherwise:
 * 64 MiB of compressed archive.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_ARCHIVE_LIMIT"
 * import { DEFAULT_ARCHIVE_LIMIT } from '@resnovas/integrations.github'
 *
 * DEFAULT_ARCHIVE_LIMIT // => 67108864
 * ```
 */
export const DEFAULT_ARCHIVE_LIMIT = 64 * 1024 * 1024

/**
 * The archive itself is the problem: over the limit, not gzip, or not tar.
 * Carries the status of a client error, so the live service reports it as
 * `ValidationFailed` and never retries it.
 *
 * @internal
 */
export class ArchiveRejected extends Data.TaggedError('ArchiveRejected')<{ readonly detail: string }> {
  readonly status = 422
  override get message() {
    return this.detail
  }
}

/**
 * The download behind the archive failed: codeload answered with an error
 * status, or the connection broke. The live service maps the status as it
 * maps any other, so an outage is retried and a missing archive is not.
 *
 * @internal
 */
export class DownloadFailed extends Data.TaggedError('DownloadFailed')<{
  readonly status?: number
  readonly detail: string
}> {
  override get message() {
    return this.detail
  }
}

/** Every way reading an archive can fail. */
export type ArchiveError = ArchiveRejected | DownloadFailed

// A zlib failure carries a `Z_` code; anything else is the network's own.
const isZlibError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'string' &&
  error.code.startsWith('Z_')

// What a web stream hands back when it fails: one of these errors passing
// through the decompressor, a zlib failure, or the download's own.
const toArchiveError = (error: unknown): ArchiveError =>
  error instanceof ArchiveRejected || error instanceof DownloadFailed
    ? error
    : isZlibError(error)
      ? new ArchiveRejected({ detail: 'the archive is not gzip data' })
      : new DownloadFailed({ detail: error instanceof Error ? error.message : String(error) })

type Bytes = Uint8Array<ArrayBuffer>

/**
 * Passes the bytes through until more than `limit` have gone by, then fails
 * the stream, which stops the download behind it.
 *
 * @internal
 *
 * @param limit - The most bytes to let through.
 * @returns The limiting stage.
 */
export const limitBytes =
  (limit: number) =>
  <E, R>(self: Stream.Stream<Bytes, E, R>): Stream.Stream<Bytes, E | ArchiveRejected, R> =>
    Stream.mapAccumEffect(self, 0, (seen, chunk) => {
      const total = seen + chunk.byteLength
      return total > limit
        ? Effect.fail(new ArchiveRejected({ detail: `the archive is larger than ${limit} bytes` }))
        : Effect.succeed([total, chunk] as const)
    })

// Inflates gzip with Node's own decompressor, a web transform, so the stream
// goes out as a web stream and comes back as one. Cancelling the inflated
// stream cancels the compressed one behind it.
const gunzip = (self: Stream.Stream<Bytes, ArchiveError>): Stream.Stream<Bytes, ArchiveError> =>
  Stream.fromReadableStream({
    evaluate: () => Stream.toReadableStream(self).pipeThrough(new DecompressionStream('gzip')),
    onError: toArchiveError,
  })

const BLOCK = 512
const decoder = new TextDecoder()

// The fields of a ustar header block this reader uses, by offset and length.
const NAME = [0, 100] as const
const MODE = [100, 8] as const
const SIZE = [124, 12] as const
const CHECKSUM = [148, 8] as const
const TYPE = 156
const PREFIX = [345, 155] as const

// A text field ends at its first NUL.
const text = (block: Uint8Array, [offset, length]: readonly [number, number]): string => {
  const field = block.subarray(offset, offset + length)
  const end = field.indexOf(0)
  return decoder.decode(end === -1 ? field : field.subarray(0, end))
}

// A numeric field is octal text, or base-256 (first bit set) for values too
// large for it, which GNU tar writes and git never does.
const numeric = (block: Uint8Array, [offset, length]: readonly [number, number]): number => {
  const field = block.subarray(offset, offset + length)
  const first = field[0] ?? 0
  if ((first & 0x80) !== 0) {
    let value = 0
    for (const [index, byte] of field.entries()) value = value * 256 + (index === 0 ? byte & 0x7f : byte)
    return value
  }
  const digits = decoder.decode(field).replaceAll('\0', ' ').trim()
  return digits === '' ? 0 : Number.parseInt(digits, 8)
}

const isZero = (block: Uint8Array): boolean => block.every((byte) => byte === 0)

// The checksum is the sum of every header byte, with the checksum field
// itself counted as spaces.
const checksum = (block: Uint8Array): number => {
  let sum = 0
  for (const [index, byte] of block.entries())
    sum += index >= CHECKSUM[0] && index < CHECKSUM[0] + CHECKSUM[1] ? 0x20 : byte
  return sum
}

const notTar = () => new ArchiveRejected({ detail: 'the archive is not a tar stream' })
const cutShort = () => new ArchiveRejected({ detail: 'the archive ends inside an entry' })

// pax extended header records are `length keyword=value\n`, the length
// counting the whole record.
const parsePax = (data: Uint8Array): Effect.Effect<ReadonlyMap<string, string>, ArchiveRejected> =>
  Effect.suspend(() => {
    const records = new Map<string, string>()
    let offset = 0
    while (offset < data.byteLength) {
      const space = data.indexOf(0x20, offset)
      const length = space === -1 ? Number.NaN : Number.parseInt(decoder.decode(data.subarray(offset, space)), 10)
      if (Number.isNaN(length) || length <= 0 || offset + length > data.byteLength) return Effect.fail(notTar())
      const record = decoder.decode(data.subarray(space + 1, offset + length - 1))
      const equals = record.indexOf('=')
      if (equals !== -1) records.set(record.slice(0, equals), record.slice(equals + 1))
      offset += length
    }
    return Effect.succeed(records)
  })

const concat = (parts: ReadonlyArray<Uint8Array>): Uint8Array => {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.byteLength
  }
  return out
}

/** A regular file found in a tar stream, its content still bytes. */
export interface TarFile {
  readonly path: string
  readonly content: Uint8Array
  readonly executable: boolean
}

const padded = (size: number) => Math.ceil(size / BLOCK) * BLOCK
const REGULAR_TYPES: ReadonlySet<string> = new Set(['0', '\0', '7'])

// The entry whose bytes are being read: a pax or GNU header that names the
// next entry, a wanted file whose content is kept, or anything else, whose
// content is dropped.
interface Body {
  readonly kind: 'pax' | 'longName' | 'file' | 'skip'
  readonly path: string
  readonly size: number
  readonly executable: boolean
  readonly parts: Array<Uint8Array>
  /** The bytes of the padded entry still to read. */
  left: number
}

// Where the reader is between chunks: waiting for a header block, inside an
// entry, or past the first zero block, after which only padding follows.
interface Parser {
  buffer: Uint8Array
  body: Body | undefined
  ended: boolean
  /** A pax extended header's records, for the entry after it. */
  extended: ReadonlyMap<string, string> | undefined
  /** A GNU long name, for the entry after it. */
  longName: string | undefined
}

const parser = (): Parser => ({
  buffer: new Uint8Array(0),
  body: undefined,
  ended: false,
  extended: undefined,
  longName: undefined,
})

// Starts the entry a header block opens.
const openEntry = (
  state: Parser,
  header: Uint8Array,
  wanted: (path: string) => boolean,
): Effect.Effect<void, ArchiveRejected> =>
  Effect.suspend(() => {
    if (numeric(header, CHECKSUM) !== checksum(header)) return Effect.fail(notTar())
    const type = String.fromCharCode(header[TYPE] ?? 0)
    const paxSize = state.extended?.get('size')
    const size = paxSize === undefined ? numeric(header, SIZE) : Number(paxSize)
    const prefix = text(header, PREFIX)
    const name = text(header, NAME)
    const path = state.longName ?? state.extended?.get('path') ?? (prefix === '' ? name : `${prefix}/${name}`)
    state.extended = undefined
    state.longName = undefined
    const kind =
      type === 'x' ? 'pax' : type === 'L' ? 'longName' : REGULAR_TYPES.has(type) && wanted(path) ? 'file' : 'skip'
    state.body = { kind, path, size, executable: (numeric(header, MODE) & 0o111) !== 0, parts: [], left: padded(size) }
    return Effect.void
  })

// Ends the entry whose bytes are all read: a header names the next entry, a
// wanted file comes out.
const closeEntry = (state: Parser, body: Body): Effect.Effect<Option.Option<TarFile>, ArchiveRejected> =>
  Effect.gen(function* () {
    state.body = undefined
    if (body.kind === 'skip') return Option.none()
    const content = concat(body.parts).subarray(0, body.size)
    if (body.kind === 'pax') {
      state.extended = yield* parsePax(content)
      return Option.none()
    }
    if (body.kind === 'longName') {
      state.longName = text(content, [0, body.size] as const)
      return Option.none()
    }
    return Option.some({ path: body.path, content, executable: body.executable })
  })

// Feeds one chunk through the reader, giving back the files it completed.
const feed = (
  state: Parser,
  chunk: Uint8Array,
  wanted: (path: string) => boolean,
): Effect.Effect<Chunk.Chunk<TarFile>, ArchiveRejected> =>
  Effect.gen(function* () {
    let data = state.buffer.byteLength === 0 ? chunk : concat([state.buffer, chunk])
    const files: Array<TarFile> = []
    while (data.byteLength > 0 && !state.ended) {
      const { body } = state
      if (body === undefined) {
        if (data.byteLength < BLOCK) break
        const header = data.subarray(0, BLOCK)
        data = data.subarray(BLOCK)
        if (isZero(header)) state.ended = true
        else yield* openEntry(state, header, wanted)
        continue
      }
      const take = Math.min(body.left, data.byteLength)
      if (body.kind !== 'skip') body.parts.push(data.subarray(0, take))
      body.left -= take
      data = data.subarray(take)
      if (body.left === 0) {
        const file = yield* closeEntry(state, body)
        if (Option.isSome(file)) files.push(file.value)
      }
    }
    // Past the end, whatever follows is padding.
    state.buffer = state.ended ? new Uint8Array(0) : data
    return Chunk.unsafeFromArray(files)
  })

// The stream ended: nothing may be left half read.
const finish = (state: Parser): Effect.Effect<Chunk.Chunk<TarFile>, ArchiveRejected> =>
  state.body !== undefined || state.buffer.byteLength > 0 ? Effect.fail(cutShort()) : Effect.succeed(Chunk.empty())

/**
 * Reads the regular files out of a tar stream, ustar and pax.
 *
 * @remarks
 * A pax extended header (`x`) or a GNU long name (`L`) names the entry
 * after it; a pax global header (`g`), which `git archive` starts with,
 * is skipped. Directories, links and anything else are skipped too, and
 * the content of a file `wanted` refuses is dropped without being kept.
 * The first zero block ends the archive; the padding after it is read and
 * dropped. A stream that ends inside an entry, or inside a header block,
 * fails as cut short.
 *
 * @internal
 *
 * @param wanted - Which files to yield, by their path in the archive.
 * @returns The stage turning tar bytes, in chunks of any size, into the wanted regular files, in archive order.
 */
export const readTar =
  (wanted: (path: string) => boolean = () => true) =>
  <E, R>(self: Stream.Stream<Uint8Array, E, R>): Stream.Stream<TarFile, E | ArchiveRejected, R> =>
    Stream.concat(Stream.map(self, Option.some), Stream.succeed(Option.none<Uint8Array>())).pipe(
      Stream.mapAccumEffect(parser(), (state, chunk) =>
        Effect.map(
          Option.match(chunk, { onNone: () => finish(state), onSome: (bytes) => feed(state, bytes, wanted) }),
          (files) => [state, files] as const,
        ),
      ),
      Stream.flattenChunks,
    )

/** Where the files of an archive come from and which of them to keep. */
export interface ArchiveSelection {
  /** The directory whose files are wanted, with `/` between segments and none at either end; empty for the whole tree. */
  readonly directory: string
  /** The wanted paths relative to `directory`, or undefined for every file. */
  readonly paths: ReadonlySet<string> | undefined
}

// Every entry sits under the directory GitHub names the archive after, such
// as `owner-repo-1234567/`, which is dropped.
const relativeTo = (directory: string, archivePath: string): string | undefined => {
  const slash = archivePath.indexOf('/')
  if (slash === -1) return undefined
  const path = archivePath.slice(slash + 1)
  if (directory === '') return path
  return path.startsWith(`${directory}/`) ? path.slice(directory.length + 1) : undefined
}

/**
 * Reads the selected files out of a gzipped tar archive, as `getArchive`
 * returns them: paths relative to the selected directory, content decoded
 * as UTF-8, and the execute bit from the tar mode.
 *
 * @internal
 *
 * @param compressed - The archive's bytes; cancelled when the read fails.
 * @param limit - The most compressed bytes to read before failing.
 * @param selection - Which files to keep.
 * @returns The files, in archive order.
 */
export const readArchive = (
  compressed: ReadableStream<Bytes>,
  limit: number,
  selection: ArchiveSelection,
): Effect.Effect<ReadonlyArray<ArchiveEntry>, ArchiveError> => {
  const wanted = (archivePath: string) => {
    const path = relativeTo(selection.directory, archivePath)
    return path !== undefined && (selection.paths === undefined || selection.paths.has(path))
  }
  return Stream.fromReadableStream({ evaluate: () => compressed, onError: toArchiveError }).pipe(
    limitBytes(limit),
    gunzip,
    readTar(wanted),
    Stream.map((file): ArchiveEntry => ({
      // `wanted` accepted the path, so it is under the directory.
      path: relativeTo(selection.directory, file.path) ?? file.path,
      content: decoder.decode(file.content),
      executable: file.executable,
    })),
    Stream.runCollect,
    Effect.map(Chunk.toReadonlyArray),
  )
}
