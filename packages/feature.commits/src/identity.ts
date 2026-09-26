/**
 * @file packages/feature.commits/src/identity.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { compilePattern } from '@resnovas/conditions'

/** A person or tool named in a commit trailer, with a lower-cased email. */
export interface Identity {
  readonly name: string
  readonly email: string
}

/** Extra patterns identifying AI tools, as `commits.aiIdentities` holds them. */
export interface AiIdentityPatterns {
  readonly emails?: ReadonlyArray<string>
  readonly names?: ReadonlyArray<string>
}

// The built-in list, ported from Resnovas/.github policy.mjs. `.invalid` is the
// reserved domain AI_POLICY.md tells contributors to use for a tool that
// publishes no attribution address of its own. Both expressions run over
// contributor-controlled text, so each is a bounded alternation with no
// nested or adjacent unbounded quantifiers: matching stays linear.
const AI_EMAIL = /(?:@anthropic\.com|@openai\.com|@cursor\.(?:com|sh)|copilot|\.invalid)$/i
const AI_NAME = /\b(?:claude|codex|chatgpt|gpt-?\d|copilot|cursor|gemini|devin|aider|windsurf|jules|codeium|tabnine)\b/i

type Test = (value: string) => boolean

// Config patterns are written by the repository's maintainers, so they are
// trusted to be safe to run. The config schema holds them as plain strings,
// so one that does not compile is matched as a literal, ignoring case,
// rather than failing the whole run.
const compile = (pattern: string): Test => {
  try {
    const compiled = compilePattern(pattern)
    // A global or sticky flag would make `test` stateful between calls.
    const stateless = new RegExp(compiled.source, compiled.flags.replace('g', '').replace('y', ''))
    return (value) => stateless.test(value)
  } catch {
    const needle = pattern.toLowerCase()
    return (value) => value.toLowerCase().includes(needle)
  }
}

/**
 * Builds a predicate recognising AI tool identities, compiling the config
 * patterns once rather than on every trailer.
 *
 * @example
 * ```ts import.meta.vitest name="makeAiIdentityMatcher"
 * import { makeAiIdentityMatcher } from '@resnovas/feature.commits'
 *
 * const isAi = makeAiIdentityMatcher({ names: ['^Robo$'] })
 * isAi({ name: 'Robo', email: 'robo@example.com' }) // => true
 * isAi({ name: 'Jane', email: 'jane@example.com' }) // => false
 * ```
 *
 * @param extra - Patterns from `commits.aiIdentities`, added to the built-in list.
 * @returns A predicate that is true for an identity belonging to an AI tool.
 */
export const makeAiIdentityMatcher = (extra: AiIdentityPatterns = {}): ((identity: Identity) => boolean) => {
  const emails: ReadonlyArray<Test> = [(value) => AI_EMAIL.test(value), ...(extra.emails ?? []).map(compile)]
  const names: ReadonlyArray<Test> = [(value) => AI_NAME.test(value), ...(extra.names ?? []).map(compile)]
  return (identity) => emails.some((test) => test(identity.email)) || names.some((test) => test(identity.name))
}

/**
 * Whether an identity belongs to an AI tool rather than a person.
 *
 * @remarks
 * An identity is an AI tool when its email ends in a known tool domain or
 * `.invalid`, or its name contains a known tool name, or either matches a
 * pattern from `commits.aiIdentities`. Config patterns are regular
 * expressions, bare or as `/source/flags`; emails are compared lower-cased.
 *
 * @example
 * ```ts import.meta.vitest name="isAiIdentity"
 * import { isAiIdentity } from '@resnovas/feature.commits'
 *
 * isAiIdentity({ name: 'Claude', email: 'noreply@anthropic.com' }) // => true
 * isAiIdentity({ name: 'Robo', email: 'robo@example.com' }, { names: ['^Robo$'] }) // => true
 * ```
 *
 * @param identity - The name and email from a trailer.
 * @param extra - Extra patterns from `commits.aiIdentities`.
 * @returns True when the identity is an AI tool.
 */
export const isAiIdentity = (identity: Identity, extra?: AiIdentityPatterns): boolean => makeAiIdentityMatcher(extra)(identity)
