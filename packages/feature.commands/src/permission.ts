/**
 * @file packages/feature.commands/src/permission.ts
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

import type { CommandName, Permission, SmartcloudConfig } from '@resnovas/config'
import { GitHub, type GitHubError } from '@resnovas/integrations.github'
import { Effect, Either, Schema } from 'effect'

/**
 * A commenter's role in the repository: a {@link Permission}, or `none` for
 * someone with no access at all.
 */
export type Role = Permission | 'none'

const RANK: Readonly<Record<Role, number>> = { none: 0, read: 1, triage: 2, write: 3, maintain: 4, admin: 5 }

/**
 * Whether a role includes another: `maintain` includes `write`, and so on.
 *
 * @example
 * ```ts import.meta.vitest name="includes"
 * import { includes } from '@resnovas/feature.commands'
 *
 * includes('maintain', 'write') // => true
 * includes('triage', 'write') // => false
 * ```
 *
 * @param role - The role someone has.
 * @param needed - The role asked for.
 * @returns True when `role` is `needed` or higher.
 */
export const includes = (role: Role, needed: Role): boolean => RANK[role] >= RANK[needed]

/** Who may use a command, once the config's overrides are applied. */
export interface ResolvedPolicy {
  readonly enabled: boolean
  readonly permission: Permission
  /** Whether the item's author may use it on their own item whatever their role. */
  readonly author: boolean
}

/**
 * Who may use each command when the config says nothing. Changing an item's
 * code or merging needs `write`, as on GitHub; tidying needs `triage`; an
 * author may manage their own item's title, state, branch and reviewers.
 *
 * @example
 * ```ts import.meta.vitest name="DEFAULT_POLICIES"
 * import { DEFAULT_POLICIES } from '@resnovas/feature.commands'
 *
 * DEFAULT_POLICIES.approve.permission // => 'write'
 * DEFAULT_POLICIES.close.author // => true
 * ```
 */
export const DEFAULT_POLICIES: Readonly<Record<CommandName, ResolvedPolicy>> = {
  help: { enabled: true, permission: 'read', author: false },
  label: { enabled: true, permission: 'triage', author: false },
  unlabel: { enabled: true, permission: 'triage', author: false },
  assign: { enabled: true, permission: 'triage', author: false },
  unassign: { enabled: true, permission: 'triage', author: false },
  reviewer: { enabled: true, permission: 'triage', author: true },
  unreviewer: { enabled: true, permission: 'triage', author: true },
  retitle: { enabled: true, permission: 'triage', author: true },
  close: { enabled: true, permission: 'triage', author: true },
  reopen: { enabled: true, permission: 'triage', author: true },
  lock: { enabled: true, permission: 'triage', author: false },
  unlock: { enabled: true, permission: 'triage', author: false },
  draft: { enabled: true, permission: 'write', author: true },
  ready: { enabled: true, permission: 'write', author: true },
  update: { enabled: true, permission: 'write', author: true },
  rebase: { enabled: true, permission: 'write', author: true },
  approve: { enabled: true, permission: 'write', author: false },
  merge: { enabled: true, permission: 'write', author: false },
  automerge: { enabled: true, permission: 'write', author: false },
  'stale-snooze': { enabled: true, permission: 'triage', author: false },
  backport: { enabled: true, permission: 'write', author: false },
  run: { enabled: true, permission: 'write', author: true },
}

/**
 * Who may use a command: its default policy with the config's override for
 * it applied.
 *
 * @example
 * ```ts import.meta.vitest name="policyFor"
 * import { policyFor } from '@resnovas/feature.commands'
 *
 * policyFor({ version: 2, commands: { overrides: { approve: { permission: 'maintain' } } } }, 'approve').permission // => 'maintain'
 * policyFor({ version: 2 }, 'approve').permission // => 'write'
 * ```
 *
 * @param config - The resolved config.
 * @param name - The command.
 * @returns The command's policy.
 */
export const policyFor = (config: SmartcloudConfig, name: CommandName): ResolvedPolicy => {
  const override = config.commands?.overrides?.[name]
  const base = DEFAULT_POLICIES[name]
  return {
    enabled: override?.enabled ?? base.enabled,
    permission: override?.permission ?? base.permission,
    author: override?.author ?? base.author,
  }
}

const PermissionResponse = Schema.Struct({
  permission: Schema.String,
  role_name: Schema.optional(Schema.NullOr(Schema.String)),
})

const ROLES: ReadonlySet<string> = new Set(['read', 'triage', 'write', 'maintain', 'admin'])
const isRole = (value: string): value is Permission => ROLES.has(value)
// The legacy `permission` field folds maintain into write and triage into read.
const LEGACY: ReadonlyMap<string, Role> = new Map([
  ['admin', 'admin'],
  ['write', 'write'],
  ['read', 'read'],
])

/**
 * Reads a login's role in the repository from GitHub.
 *
 * @remarks
 * The role name is used when it is one of GitHub's built-in roles; a custom
 * role falls back to the permission it is based on. Someone GitHub does not
 * know as a collaborator has no role (`none`), and so does anyone when the
 * answer cannot be read: commands fail closed.
 *
 * @example
 * ```ts
 * import { roleOf } from '@resnovas/feature.commands'
 *
 * // Needs the GitHub service.
 * const role = roleOf('octocat')
 * ```
 *
 * @param login - The GitHub login.
 * @returns The role, or a GitHub error other than the login not being found.
 */
export const roleOf = (login: string): Effect.Effect<Role, GitHubError, GitHub> =>
  Effect.gen(function* () {
    const github = yield* GitHub
    const response = yield* github
      .repositoryRequest({ method: 'GET', path: `/collaborators/${encodeURIComponent(login)}/permission` })
      .pipe(Effect.catchTag('NotFound', () => Effect.succeed(undefined)))
    return Either.match(Schema.decodeUnknownEither(PermissionResponse)(response), {
      onLeft: (): Role => 'none',
      onRight: ({ permission, role_name }): Role =>
        role_name !== undefined && role_name !== null && isRole(role_name)
          ? role_name
          : (LEGACY.get(permission) ?? 'none'),
    })
  })
