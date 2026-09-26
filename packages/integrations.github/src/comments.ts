/**
 * @file packages/integrations.github/src/comments.ts
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

import type { Comment } from './service.js'

const withoutAt = (login: string) => (login.startsWith('@') ? login.slice(1) : login)

/**
 * Whether a comment may be treated as one smartcloud wrote.
 *
 * @remarks
 * Marker comments are found by a hidden HTML marker that anyone can type, so
 * a marker alone proves nothing. A comment counts only when its author is a
 * bot account or one of the trusted logins (normally `roles.trustedBots`).
 * Logins compare ignoring case, with a leading `@` optional.
 *
 * @example
 * ```ts import.meta.vitest name="isTrustedComment"
 * import { isTrustedComment } from '@resnovas/integrations.github'
 *
 * isTrustedComment({ id: 1, body: '', author: 'jane', bot: false }, ['@Jane']) // => true
 * isTrustedComment({ id: 2, body: '', author: 'mallory', bot: false }) // => false
 * ```
 *
 * @param comment - The comment.
 * @param trusted - Logins trusted as well as bot accounts.
 * @returns True when the comment's author is trusted.
 */
export const isTrustedComment = (comment: Comment, trusted: ReadonlyArray<string> = []): boolean =>
  comment.bot || trusted.some((login) => withoutAt(login).toLowerCase() === withoutAt(comment.author).toLowerCase())
