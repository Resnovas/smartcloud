/**
 * @file packages/integrations.github/src/graphql.ts
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

// Keywords that start an operation able to change something. `subscription`
// is counted too, so anything that is not plainly a read is treated as a write.
const WRITES: ReadonlySet<string> = new Set(['mutation', 'subscription'])

const isNameStart = (char: string) => char === '_' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
const isNamePart = (char: string) => isNameStart(char) || (char >= '0' && char <= '9')

// The index just past the string starting at `start`, or -1 when it never closes.
const endOfString = (document: string, start: number): number => {
  if (document.startsWith('"""', start)) {
    let from = start + 3
    for (;;) {
      const close = document.indexOf('"""', from)
      if (close === -1) return -1
      // `\"""` is an escaped quote inside a block string, not its end.
      if (document[close - 1] !== '\\') return close + 3
      from = close + 1
    }
  }
  for (let index = start + 1; index < document.length; index++) {
    const char = document[index]
    if (char === '\\') index++
    else if (char === '"') return index + 1
    else if (char === '\n') return -1
  }
  return -1
}

/**
 * Whether a GraphQL document may write: it defines a mutation or a
 * subscription anywhere, not only as its first token.
 *
 * @remarks
 * Comments, strings, fragments and variable definitions are skipped with a
 * single forward scan, so the check runs in linear time whatever the
 * document holds. A document whose structure cannot be read, such as an
 * unclosed string or brace, counts as a write, so the dry run records it
 * rather than letting it through.
 *
 * @internal
 *
 * @param document - The GraphQL document.
 * @returns True when the document may write.
 */
export const isGraphqlWrite = (document: string): boolean => {
  let depth = 0
  let index = 0
  while (index < document.length) {
    const char = document.charAt(index)
    if (char === '#') {
      const end = document.indexOf('\n', index)
      index = end === -1 ? document.length : end + 1
    } else if (char === '"') {
      const end = endOfString(document, index)
      if (end === -1) return true
      index = end
    } else if (char === '{' || char === '(' || char === '[') {
      depth++
      index++
    } else if (char === '}' || char === ')' || char === ']') {
      depth--
      if (depth < 0) return true
      index++
    } else if (isNameStart(char)) {
      const start = index
      while (index < document.length && isNamePart(document.charAt(index))) index++
      // Only a keyword outside every selection and argument list starts an operation.
      if (depth === 0 && WRITES.has(document.slice(start, index))) return true
    } else index++
  }
  return depth !== 0
}
