/**
 * @file tests/integrations.github/src/tar.ts
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

// Writes tar archives the way `git archive` does, so the archive reader is
// tested against ustar headers, pax extended headers and GNU long names
// without a binary fixture for each case, plus one real archive git wrote.

import { gzipSync } from 'node:zlib'

const BLOCK = 512
const encoder = new TextEncoder()

/** One entry to write. */
export interface TarEntry {
  readonly path: string
  readonly content?: string | Uint8Array
  /** The tar type flag: `0` a file, `5` a directory, `2` a symbolic link, `x` and `g` pax headers, `L` a GNU long name. */
  readonly type?: string
  readonly mode?: number
  /** The `name` field as written, when it should differ from `path`, such as a name cut to 100 bytes. */
  readonly name?: string
  /** The ustar `prefix` field. */
  readonly prefix?: string
  /** Writes the size in base-256 rather than octal. */
  readonly binarySize?: boolean
  /** Writes a wrong checksum. */
  readonly corrupt?: boolean
}

const octal = (value: number, length: number) => `${value.toString(8).padStart(length - 1, '0')}\0`

const write = (block: Uint8Array, offset: number, text: string) => block.set(encoder.encode(text), offset)

const header = (entry: TarEntry, size: number): Uint8Array => {
  const block = new Uint8Array(BLOCK)
  write(block, 0, entry.name ?? entry.path)
  write(block, 100, octal(entry.mode ?? 0o644, 8))
  write(block, 108, octal(0, 8))
  write(block, 116, octal(0, 8))
  if (entry.binarySize === true) {
    block[124] = 0x80
    let left = size
    for (let index = 135; index > 124; index -= 1) {
      block[index] = left % 256
      left = Math.floor(left / 256)
    }
  } else write(block, 124, octal(size, 12))
  write(block, 136, octal(0, 12))
  write(block, 148, '        ')
  write(block, 156, entry.type ?? '0')
  write(block, 257, 'ustar\0')
  write(block, 263, '00')
  if (entry.prefix !== undefined) write(block, 345, entry.prefix)
  const sum = block.reduce((total, byte) => total + byte, 0)
  write(block, 148, `${octal(entry.corrupt === true ? sum + 1 : sum, 7)} `)
  return block
}

/**
 * Writes entries as a tar stream, ending with two zero blocks, padded to a
 * record of ten kilobytes as tar does.
 */
export const tar = (entries: ReadonlyArray<TarEntry>, options: { readonly padded?: boolean } = {}): Uint8Array => {
  const parts: Array<Uint8Array> = []
  for (const entry of entries) {
    const content =
      typeof entry.content === 'string' ? encoder.encode(entry.content) : (entry.content ?? new Uint8Array())
    parts.push(header(entry, content.byteLength))
    const padded = new Uint8Array(Math.ceil(content.byteLength / BLOCK) * BLOCK)
    padded.set(content)
    parts.push(padded)
  }
  const written = parts.reduce((total, part) => total + part.byteLength, 0)
  const trailer = options.padded === false ? 2 * BLOCK : Math.max(2 * BLOCK, 20 * BLOCK - (written % (20 * BLOCK)))
  parts.push(new Uint8Array(trailer))
  const out = new Uint8Array(written + trailer)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.byteLength
  }
  return out
}

/** A pax extended header entry naming the next entry's path (and size when given). */
export const pax = (records: Readonly<Record<string, string>>, type: 'x' | 'g' = 'x'): TarEntry => {
  const body = Object.entries(records)
    .map(([key, value]) => {
      const rest = ` ${key}=${value}\n`
      let length = rest.length + 1
      while (`${length}${rest}`.length !== length) length += 1
      return `${length}${rest}`
    })
    .join('')
  return { path: type === 'g' ? 'pax_global_header' : 'PaxHeader/entry', content: body, type, mode: 0o666 }
}

/** Gzips a tar stream, as GitHub serves it. */
export const tarball = (entries: ReadonlyArray<TarEntry>): Uint8Array => new Uint8Array(gzipSync(tar(entries)))

/**
 * A real `git archive --format=tar.gz --prefix=Resnovas-example-abc1234/`
 * of a commit holding `LICENSE`, an executable `tools/run`,
 * `nested/dir/file.txt`, a path git splits into ustar prefix and name
 * (`nested/a...(90)/b...(90)`), a 120-character name it puts in a pax
 * header (`c...(120)`), an empty file, and a symbolic link `link`.
 */
export const GIT_ARCHIVE = Buffer.from(
  'H4sIAAAAAAAAA+3ay26bQBQGYNZ5CqquEzN3e5FVlUWktou2+2gGhhgVAwJS0bcvjheRTPD4MnZq8X8bLGNpGJ85Zy52pbun57w0On9aWp3YOvAv6kkpX6+97Wt/kwdEUCGFjGhE+vcJF4QHz2d4loGXptV132Rdlu2uz7nub3fuSggaxuVqZYv2PqJWJtwuJIttHJs0TW3E5NzGSRoxRSXXSs8lMTcf/czgzw/bFOUf3dzaTq+q3N5qExPK+MxjG+t8UEqM53//eiv/BeMyEB6fYdTE8380/l8fvzx8//ngo41N/ec74j+o/5Lxfrz4aNxl4vH/9vgL9XzCDKWpEHaeWKMlM/1sb0S8oETEchEzrU1CU2W0uqt0d+wC0bX+o4xt5T8lRERB57+7QxPPfyJEWOl2eT86EcQfBGXpEvbO/0S3+sg2nPM/Idv5v7nvtacjJp7/fVl/zX9k2zSNln27qtq/d223c9Dvx73+H+z/1HpNgPw/v9H451nx21Mb6+9DKXVY/KkMqMc96CjE//34F7ZpbeLlGGgT/4POf6RkEc5/LkCfzdvQOTz+TElJrzv+jsTy24njmbN5a8M5/w/2/5JEnF/3/O8qrOdLvIO631R51oZZ0ZZhVds060JdJGGhVxY7gilwDdMkq09eAxwx/yse4fefS9gn/mmW21N2gs76H4nB+W8/BVx3/b8SibUVKv10jeZ/W5Z54+dfAEfUfylQ/y/CEf/6pTi9DWf8KX3n/I+i/l/A508zkxWzZnlj42UZLjNMBgAAAAAAAAAAAAAAAAAAAAAAAAD/vX/I4voMAFAAAA==',
  'base64',
)
