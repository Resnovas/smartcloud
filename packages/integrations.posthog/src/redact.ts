/**
 * @file packages/integrations.posthog/src/redact.ts
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

/** What every redacted value is replaced with. */
export const REDACTED = '[redacted]'

// Each pattern starts at a literal prefix or the start of a run of the
// characters it matches, and has no nested quantifiers, so a scan does not
// retry every position of a long run: matching stays linear.
const PATTERNS: ReadonlyArray<RegExp> = [
  // GitHub tokens: personal, OAuth, user-to-server, server-to-server and refresh.
  /\bgh[pousr]_[A-Za-z0-9]{20,255}/g,
  // Fine-grained personal access tokens.
  /\bgithub_pat_[A-Za-z0-9_]{20,255}/g,
  // Bearer credentials, as an Authorization header value.
  /\bBearer\s+[\w.~+/-]+=*/gi,
  // Email addresses.
  /(?<![\w.%+-])[\w.%+-]+@[\w-]+\.[\w.-]+/g,
]

// A literal secret as a pattern, with every special character escaped, so it
// is matched as text and without backtracking.
const literal = (secret: string) => new RegExp(secret.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'gi')

/**
 * Removes credentials and personal data from text before it leaves the
 * process.
 *
 * @remarks
 * Removes GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` and
 * `github_pat_`), bearer credentials, email addresses, and every given
 * secret, ignoring case, both as written and URL-encoded. Pure: the same
 * input always gives the same output.
 *
 * @example
 * ```ts
 * redact('token ghp_0123456789abcdefghij0123 for jane@example.com', [])
 * // 'token [redacted] for [redacted]'
 * ```
 *
 * @param text - The text to clean.
 * @param secrets - Values to remove wherever they appear, such as a token read with `Config.redacted` or a repository name.
 * @returns The text with every match replaced by {@link REDACTED}.
 */
export const redact = (text: string, secrets: ReadonlyArray<string> = []): string => {
  const values = secrets.flatMap((secret) => (secret.length < 3 ? [] : [secret, encodeURIComponent(secret)]))
  // Longest first, so a secret that contains another is removed whole.
  const ordered = [...new Set(values)].sort((a, b) => b.length - a.length)
  const withoutSecrets = ordered.reduce((current, secret) => current.replace(literal(secret), REDACTED), text)
  return PATTERNS.reduce((current, pattern) => current.replace(pattern, REDACTED), withoutSecrets)
}
