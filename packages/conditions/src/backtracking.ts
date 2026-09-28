/**
 * @file packages/conditions/src/backtracking.ts
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

// A backtracking engine takes exponential time on some input exactly when the
// pattern's automaton is exponentially ambiguous: some state can loop back to
// itself along two different paths that read the same text. This file parses
// the pattern into a small tree, builds its position automaton (keeping
// parallel edges, which is where `(a+)+` hides its two loops) and looks for
// such a pair of paths in the automaton's product with itself.

// A bounded repeat allowing more copies than this, such as `x{1,100}`, is
// checked as if unbounded rather than copied out.
const COPY_LIMIT = 16
// Work limits: a pattern too large to check within them is refused.
const MAX_POSITIONS = 2_000
const MAX_STEPS = 2_000_000

interface Mode {
  readonly ignoreCase: boolean
  readonly dotAll: boolean
}

type Node =
  // One character read: a literal, an escape, a class or `.`.
  | { readonly _tag: 'Char'; readonly source: string; readonly flags: string; readonly at: number }
  // Reads nothing: an anchor, a word boundary, a backreference or a lookaround.
  | { readonly _tag: 'Empty' }
  | { readonly _tag: 'Seq'; readonly items: ReadonlyArray<Node> }
  | { readonly _tag: 'Alt'; readonly options: ReadonlyArray<Node> }
  | { readonly _tag: 'Repeat'; readonly body: Node; readonly min: number; readonly max: number }

const EMPTY: Node = { _tag: 'Empty' }
const QUANTIFIER = /\{(\d+)(,(\d*))?\}/y
const HEX = /^[\da-f]+$/i

class TooComplex extends Error {}

// Reads an index the construction guarantees is there.
const at = <A>(list: ArrayLike<A>, index: number): A => list[index] as A
const read = <K>(map: ReadonlyMap<K, number>, key: K): number => map.get(key) as number

// Parses a pattern that `new RegExp` has already accepted, so it is well
// formed. Lookaround bodies are returned separately: they read no text where
// they sit, but each runs as a search of its own.
const parse = (source: string, flags: string) => {
  const unicode = flags.includes('u') || flags.includes('v')
  const sets = flags.includes('v')
  const lookarounds: Array<Node> = []
  let index = 0

  const hexAt = (from: number, count: number) =>
    from + count <= source.length && HEX.test(source.slice(from, from + count))

  const char = (mode: Mode, end: number): Node => {
    const node: Node = {
      _tag: 'Char',
      source: source.slice(index, end),
      flags: `${mode.ignoreCase ? 'i' : ''}${mode.dotAll ? 's' : ''}${sets ? 'v' : unicode ? 'u' : ''}`,
      at: index,
    }
    index = end
    return node
  }

  const classEnd = (): number => {
    let end = index + 1
    let depth = 1
    for (;;) {
      const next = source.charAt(end)
      if (next === '\\') end += 2
      else {
        end += 1
        if (next === '[' && sets) depth += 1
        else if (next === ']' && --depth === 0) return end
      }
    }
  }

  const escape = (mode: Mode): Node => {
    const next = source.charAt(index + 1)
    if (next === 'b' || next === 'B') {
      index += 2
      return EMPTY
    }
    if (/[1-9]/.test(next)) {
      index += 2
      while (/\d/.test(source.charAt(index))) index += 1
      return EMPTY
    }
    if (next === 'k' && source[index + 2] === '<') {
      index = source.indexOf('>', index) + 1
      return EMPTY
    }
    if ((next === 'p' || next === 'P' || next === 'u') && unicode && source[index + 2] === '{')
      return char(mode, source.indexOf('}', index) + 1)
    if (next === 'u' && hexAt(index + 2, 4)) return char(mode, index + 6)
    if (next === 'x' && hexAt(index + 2, 2)) return char(mode, index + 4)
    if (next === 'c' && /[a-z]/i.test(source.charAt(index + 2))) return char(mode, index + 3)
    return char(mode, index + 2)
  }

  const enclose = (mode: Mode): Node => {
    const body = alternation(mode)
    index += 1
    return body
  }

  const group = (mode: Mode): Node => {
    index += 1
    if (source[index] !== '?') return enclose(mode)
    const next = source[index + 1]
    const after = source[index + 2]
    if (next === ':') {
      index += 2
      return enclose(mode)
    }
    if (next === '=' || next === '!' || (next === '<' && (after === '=' || after === '!'))) {
      index += next === '<' ? 3 : 2
      lookarounds.push(enclose(mode))
      return EMPTY
    }
    if (next === '<') {
      index = source.indexOf('>', index) + 1
      return enclose(mode)
    }
    // Inline modifiers, (?ims-ims:...), read one character at a time: a
    // regular expression here would itself backtrack on a long run of flags.
    const letters = (): string => {
      let read = ''
      while (index < source.length && 'ims'.includes(source.charAt(index))) read += source.charAt(index++)
      return read
    }
    index += 1
    const on = letters()
    if (source[index] === '-') index += 1
    const off = letters()
    index += 1
    const flag = (letter: string, current: boolean) => on.includes(letter) || (current && !off.includes(letter))
    return enclose({ ignoreCase: flag('i', mode.ignoreCase), dotAll: flag('s', mode.dotAll) })
  }

  const atom = (mode: Mode): Node => {
    const next = source[index]
    if (next === '(') return group(mode)
    if (next === '^' || next === '$') {
      index += 1
      return EMPTY
    }
    if (next === '[') return char(mode, classEnd())
    if (next === '\\') return escape(mode)
    const code = unicode ? (source.codePointAt(index) as number) : 0
    return char(mode, index + (code > 0xffff ? 2 : 1))
  }

  const quantified = (node: Node): Node => {
    const next = source[index]
    let min = 0
    let max = Infinity
    if (next === '+') min = 1
    else if (next === '?') max = 1
    else if (next === '{') {
      QUANTIFIER.lastIndex = index
      const match = QUANTIFIER.exec(source)
      if (match === null) return node
      min = Number(match[1])
      max = match[2] === undefined ? min : match[3] === '' ? Infinity : Number(match[3])
      index = QUANTIFIER.lastIndex - 1
    } else if (next !== '*') return node
    index += source[index + 1] === '?' ? 2 : 1
    return { _tag: 'Repeat', body: node, min, max }
  }

  const sequence = (mode: Mode): Node => {
    const items: Array<Node> = []
    while (index < source.length && source[index] !== '|' && source[index] !== ')') items.push(quantified(atom(mode)))
    return { _tag: 'Seq', items }
  }

  const alternation = (mode: Mode): Node => {
    const options = [sequence(mode)]
    while (source[index] === '|') {
      index += 1
      options.push(sequence(mode))
    }
    return { _tag: 'Alt', options }
  }

  const root = alternation({ ignoreCase: flags.includes('i'), dotAll: flags.includes('s') })
  return { root, lookarounds }
}

const loops = (node: Node): boolean => {
  switch (node._tag) {
    case 'Char':
    case 'Empty':
      return false
    case 'Seq':
      return node.items.some(loops)
    case 'Alt':
      return node.options.some(loops)
    case 'Repeat':
      return unbounded(node) || loops(node.body)
  }
}

// A repeat is checked as a loop when it allows too many copies to write out,
// or a varying number of copies of a part that already loops, as in
// `(a+){2,10}`, which is as slow as `(a+)+` in practice. An exact count, such
// as `(a+){3}`, is written out.
const unbounded = (repeat: Extract<Node, { _tag: 'Repeat' }>): boolean =>
  repeat.max > COPY_LIMIT || (repeat.max > repeat.min && repeat.max > 1 && loops(repeat.body))

const canFail = (node: Node): boolean => {
  switch (node._tag) {
    case 'Char':
    case 'Empty':
      return true
    case 'Seq':
      return node.items.some(canFail)
    case 'Alt':
      return node.options.every(canFail)
    case 'Repeat':
      return node.min > 0 && canFail(node.body)
  }
}

// Backtracking into a repeat only happens when what follows it fails. When
// nothing after a repeat can fail, as in an unanchored `^feat: (\w+\s?)+`,
// the copies past its minimum are taken once and never revisited, so it is
// checked as its minimum; a single failed try at one more copy is still a
// search of its own, so that body is returned to be checked by itself.
const settle = (node: Node, tail: boolean, searches: Array<Node>): Node => {
  switch (node._tag) {
    case 'Char':
    case 'Empty':
      return node
    case 'Seq': {
      let failing = tail
      const items = node.items
        .toReversed()
        .map((item) => {
          const settled = settle(item, failing, searches)
          failing ||= canFail(item)
          return settled
        })
        .toReversed()
      return { _tag: 'Seq', items }
    }
    case 'Alt':
      return { _tag: 'Alt', options: node.options.map((option) => settle(option, tail, searches)) }
    case 'Repeat': {
      if (!tail && node.max > node.min) searches.push(settle(node.body, true, searches))
      const max = tail ? node.max : node.min
      return { _tag: 'Repeat', body: settle(node.body, tail || max > 1, searches), min: node.min, max }
    }
  }
}

interface Built {
  readonly first: ReadonlyArray<number>
  readonly last: ReadonlyArray<number>
  readonly nullable: boolean
}

const NOTHING: Built = { first: [], last: [], nullable: true }

// The position automaton: one state per character read, and `follow[p]` the
// states that can read next after `p`. An edge added twice is two edges.
const automaton = (root: Node) => {
  const positions: Array<Extract<Node, { _tag: 'Char' }>> = []
  const follow: Array<Array<number>> = []

  const link = (from: ReadonlyArray<number>, to: ReadonlyArray<number>) => {
    for (const state of from) at(follow, state).push(...to)
  }

  const concat = (left: Built, right: Built): Built => {
    link(left.last, right.first)
    return {
      first: left.nullable ? [...left.first, ...right.first] : left.first,
      last: right.nullable ? [...left.last, ...right.last] : right.last,
      nullable: left.nullable && right.nullable,
    }
  }

  const build = (node: Node): Built => {
    switch (node._tag) {
      case 'Empty':
        return NOTHING
      case 'Char': {
        if (positions.length >= MAX_POSITIONS) throw new TooComplex()
        positions.push(node)
        follow.push([])
        return { first: [positions.length - 1], last: [positions.length - 1], nullable: false }
      }
      case 'Seq':
        return node.items.reduce((built, item) => concat(built, build(item)), NOTHING)
      case 'Alt': {
        const options = node.options.map(build)
        return {
          first: options.flatMap((option) => option.first),
          last: options.flatMap((option) => option.last),
          nullable: options.some((option) => option.nullable),
        }
      }
      case 'Repeat': {
        if (unbounded(node)) {
          const body = build(node.body)
          link(body.last, body.first)
          return { ...body, nullable: body.nullable || node.min === 0 }
        }
        // x{min,max} is written out as min copies of x, then (x(x(x)?)?)?
        // with max - min optional copies.
        let built = NOTHING
        for (let copy = node.min; copy < node.max; copy += 1)
          built = { ...concat(build(node.body), built), nullable: true }
        for (let copy = 0; copy < node.min; copy += 1) built = concat(build(node.body), built)
        return built
      }
    }
  }

  build(root)
  return { positions, follow }
}

// The characters worth trying against each position: ASCII, a few characters
// that classes and case folding treat specially, and every character the
// pattern itself names.
const SAMPLE = [
  ...Array.from({ length: 128 }, (_, code) => String.fromCharCode(code)),
  ...[
    0xa0, 0xdf, 0xe9, 0x17f, 0x1c5, 0x130, 0x131, 0x3a3, 0x3c2, 0x3c3, 0x416, 0x436, 0x663, 0x2028, 0x212a, 0x3000,
    0x4e2d, 0xfeff, 0x1f600,
  ].map((code) => String.fromCodePoint(code)),
]
const ESCAPED = /\\u\{[\da-f]+\}|\\u[\da-f]{4}|\\x[\da-f]{2}/gi

const alphabetOf = (positions: ReadonlyArray<Extract<Node, { _tag: 'Char' }>>): ReadonlyArray<string> => {
  const alphabet = new Set(SAMPLE)
  for (const { source } of positions) {
    const escaped = [...source.matchAll(ESCAPED)].map(([match]) =>
      String.fromCodePoint(parseInt(match.replace(/[\\ux{}]/gi, ''), 16)),
    )
    for (const character of [...source, ...escaped]) {
      alphabet.add(character)
      alphabet.add(character.toLowerCase())
      alphabet.add(character.toUpperCase())
    }
  }
  return [...alphabet].filter((character) => [...character].length === 1)
}

const charsets = (positions: ReadonlyArray<Extract<Node, { _tag: 'Char' }>>): ReadonlyArray<Uint32Array> => {
  const alphabet = alphabetOf(positions)
  const cache = new Map<string, Uint32Array>()
  return positions.map(({ source, flags }) => {
    const key = `${flags}/${source}`
    const cached = cache.get(key)
    if (cached !== undefined) return cached
    const matcher = new RegExp(`^(?:${source})$`, flags)
    const bits = new Uint32Array(Math.ceil(alphabet.length / 32))
    alphabet.forEach((character, index) => {
      if (matcher.test(character)) bits[index >>> 5] = at(bits, index >>> 5) | (1 << (index & 31))
    })
    cache.set(key, bits)
    return bits
  })
}

// Looks for a state q with two different loops q -> q reading the same text:
// a strongly connected component of the product automaton that holds a pair
// (q, q) and either a pair of different states or a pair of different edges.
const ambiguousAt = (root: Node): number | undefined => {
  const { positions, follow } = automaton(root)
  const sets = charsets(positions)
  const count = positions.length
  const overlap = (left: number, right: number) => {
    const other = at(sets, right)
    return at(sets, left).some((word, index) => (word & at(other, index)) !== 0)
  }

  let steps = 0
  const edges = new Map<number, ReadonlyArray<readonly [to: number, diverging: boolean]>>()
  const successors = (node: number) => {
    const known = edges.get(node)
    if (known !== undefined) return known
    const left = Math.floor(node / count)
    const right = node % count
    const out: Array<readonly [number, boolean]> = []
    at(follow, left).forEach((to, a) =>
      at(follow, right).forEach((other, b) => {
        steps += 1
        if (steps > MAX_STEPS) throw new TooComplex()
        if (overlap(to, other)) out.push([to * count + other, left === right && a !== b])
      }),
    )
    edges.set(node, out)
    return out
  }

  // Tarjan's strongly connected components, iteratively, from every (q, q).
  const order = new Map<number, number>()
  const low = new Map<number, number>()
  const component = new Map<number, number>()
  const stack: Array<number> = []
  let components = 0
  for (let state = 0; state < count; state += 1) {
    const start = state * count + state
    if (order.has(start)) continue
    const frames: Array<{ node: number; next: number }> = [{ node: start, next: 0 }]
    order.set(start, order.size)
    low.set(start, order.size - 1)
    stack.push(start)
    while (frames.length > 0) {
      const frame = at(frames, frames.length - 1)
      const out = successors(frame.node)
      const edge = out[frame.next]
      if (edge !== undefined) {
        frame.next += 1
        const [to] = edge
        if (!order.has(to)) {
          order.set(to, order.size)
          low.set(to, order.size - 1)
          stack.push(to)
          frames.push({ node: to, next: 0 })
        } else if (!component.has(to)) low.set(frame.node, Math.min(read(low, frame.node), read(order, to)))
        continue
      }
      frames.pop()
      const parent = frames[frames.length - 1]
      if (parent !== undefined) low.set(parent.node, Math.min(read(low, parent.node), read(low, frame.node)))
      if (read(low, frame.node) === read(order, frame.node)) {
        let member: number
        do {
          member = stack.pop() as number
          component.set(member, components)
        } while (member !== frame.node)
        components += 1
      }
    }
  }

  const diagonal = new Map<number, number>()
  const tangled = new Set<number>()
  for (const [node, id] of component) {
    const left = Math.floor(node / count)
    if (left === node % count) diagonal.set(id, left)
    else tangled.add(id)
    for (const [to, diverging] of edges.get(node) as ReadonlyArray<readonly [number, boolean]>)
      if (diverging && component.get(to) === id) tangled.add(id)
  }
  for (const [id, state] of diagonal) if (tangled.has(id)) return at(positions, state).at
  return undefined
}

/**
 * Checks whether a regular expression can take exponential time on some
 * input, the failure known as catastrophic backtracking.
 *
 * @remarks
 * A pattern such as `^(a+)+$` can match a run of `a`s in exponentially many
 * ways, so a near miss like `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!` keeps the engine
 * busy for minutes. The check finds every pattern where some repeated part can
 * read the same text along two different paths: nested repeats (`(a+)+`,
 * `(a*)*`, `(\w+\s?)+`) and repeated choices that overlap (`(a|aa)+`,
 * `(\w|\d)+`). It works on the pattern alone, never runs it, and treats
 * anchors, lookarounds and backreferences as reading nothing, so it can refuse
 * a pattern they would have made safe; it does not flag patterns that are only
 * polynomially slow, such as `.*a.*b`. Lookaround bodies are checked on their
 * own.
 *
 * @example
 * ```ts import.meta.vitest name="backtrackingRisk"
 * import { backtrackingRisk } from '@resnovas/conditions'
 *
 * backtrackingRisk('^(?:feat|fix)(\\(.+\\))?!?: ') // => undefined
 * backtrackingRisk('^(\\w+-)*\\w+$') // => undefined
 * backtrackingRisk('^(a+)+$') !== undefined // => true
 * ```
 *
 * @param source - The regular expression source, as `RegExp.prototype.source`.
 * @param flags - Its flags, as `RegExp.prototype.flags`.
 * @returns Why the pattern is refused, or `undefined` when it is safe.
 */
export const backtrackingRisk = (source: string, flags = ''): string | undefined => {
  try {
    // Throws for a malformed pattern, which the parser below assumes it is not.
    new RegExp(source, flags)
    const { root, lookarounds } = parse(source, flags)
    const searches: Array<Node> = []
    const settled = [settle(root, false, searches), ...lookarounds.map((body) => settle(body, true, searches))]
    for (const node of [...settled, ...searches]) {
      const at = ambiguousAt(node)
      if (at !== undefined)
        return (
          `the repeated part around character ${at + 1} can match the same text in more than one way, ` +
          'so some inputs make it run for minutes (catastrophic backtracking); rewrite it so each character can be matched only one way'
        )
    }
    return undefined
  } catch (error) {
    if (error instanceof TooComplex)
      return 'it is too large to check for catastrophic backtracking; split it into smaller patterns'
    throw error
  }
}
