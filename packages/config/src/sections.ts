/**
 * @file packages/config/src/sections.ts
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

import { ConditionGroup } from '@resnovas/conditions'
import { Schema } from 'effect'

// The configuration sections of the policy, review, stale, settings and sync
// features. Each is optional: a feature whose section is absent does not run.
// Every rule is a keyed record, so presets and repositories merge by key.

const opt = <A, I, R>(schema: Schema.Schema<A, I, R>) => Schema.optionalWith(schema, { exact: true })

const Level = Schema.Literal('error', 'warning').annotations({ identifier: 'Level' })
const Logins = Schema.Array(Schema.String)
const Subjects = Schema.Array(Schema.Literal('pullRequest', 'issue'))

/**
 * Who is who. Maintainers get warnings where contributors get errors, and
 * count towards the review gate; trusted bots skip the contributor checks.
 */
export const Roles = Schema.Struct({
  maintainers: opt(Logins),
  trustedBots: opt(Logins),
}).annotations({ identifier: 'Roles' })

/** Where findings link to, so every broken rule points at its text. */
export const Links = Schema.Struct({
  /** Base URL of the governance documents, for example `https://github.com/Resnovas/.github/blob/main`. */
  policyBase: opt(Schema.String),
}).annotations({ identifier: 'Links' })

/** DCO sign-off and AI attribution rules for commits. */
export const Commits = Schema.Struct({
  /** Every non-merge commit is signed off by its author. */
  dco: opt(Schema.Boolean),
  /** AI co-authors carry `Co-authored-by` and `Assisted-by` together, and never sign off. */
  aiAttribution: opt(Schema.Boolean),
  /** Extra patterns identifying AI tools by email or name, on top of the built-in list. */
  aiIdentities: opt(Schema.Struct({ emails: opt(Schema.Array(Schema.String)), names: opt(Schema.Array(Schema.String)) })),
  /** Level for maintainers' own pull requests. An AI sign-off is always an error. */
  maintainerLevel: opt(Level),
}).annotations({ identifier: 'Commits' })

/** The AI disclosure a pull request description must carry. */
export const Disclosure = Schema.Struct({
  /** The labels of the disclosure fields, if a repository renames them. */
  fields: opt(
    Schema.Struct({
      level: opt(Schema.String),
      tools: opt(Schema.String),
      accountable: opt(Schema.String),
      review: opt(Schema.String),
    }),
  ),
  /** AI-assisted pull requests must be opened as drafts. On by default. */
  requireDraft: opt(Schema.Boolean),
  maintainerLevel: opt(Level),
}).annotations({ identifier: 'Disclosure' })

/** Reviewers to request when conditions pass. */
export const RequestApproval = Schema.Struct({
  reviewers: Logins,
  when: ConditionGroup,
}).annotations({ identifier: 'RequestApproval' })

/** An automatic approval when conditions pass, for example for dependabot. */
export const AutomaticApprove = Schema.Struct({
  when: ConditionGroup,
  message: opt(Schema.String),
}).annotations({ identifier: 'AutomaticApprove' })

/** The maintainer review gate and approval automation. */
export const Reviews = Schema.Struct({
  /**
   * Maintainer approvals needed before merge, counted from each maintainer's
   * latest decisive review, excluding the author. The gate is open while
   * fewer than two maintainers are configured.
   */
  gate: opt(
    Schema.Struct({
      outside: opt(Schema.NonNegativeInt),
      maintainer: opt(Schema.NonNegativeInt),
    }),
  ),
  requestApprovals: opt(Schema.Record({ key: Schema.String, value: RequestApproval })),
  automaticApprove: opt(Schema.Record({ key: Schema.String, value: AutomaticApprove })),
}).annotations({ identifier: 'Reviews' })

/** Scheduled marking of inactive issues and pull requests. */
export const Stale = Schema.Struct({
  on: opt(Subjects),
  staleAfterDays: Schema.NonNegative,
  staleLabel: Schema.String,
  staleComment: opt(Schema.String),
  abandonedAfterDays: opt(Schema.NonNegative),
  abandonedLabel: opt(Schema.String),
  abandonedComment: opt(Schema.String),
  /** Close abandoned items. Off by default. */
  close: opt(Schema.Boolean),
  exempt: opt(Schema.Struct({ labels: opt(Schema.Array(Schema.String)), when: opt(ConditionGroup) })),
}).annotations({ identifier: 'Stale' })

/** The repository settings baseline. Anything omitted is left as it is. */
export const Settings = Schema.Struct({
  merging: opt(
    Schema.Struct({
      mergeCommit: opt(Schema.Boolean),
      squash: opt(Schema.Boolean),
      rebase: opt(Schema.Boolean),
      autoMerge: opt(Schema.Boolean),
      updateBranch: opt(Schema.Boolean),
      deleteBranchOnMerge: opt(Schema.Boolean),
      webCommitSignoff: opt(Schema.Boolean),
      squashTitle: opt(Schema.Literal('PR_TITLE', 'COMMIT_OR_PR_TITLE')),
      squashMessage: opt(Schema.Literal('COMMIT_MESSAGES', 'PR_BODY', 'BLANK')),
    }),
  ),
  features: opt(
    Schema.Struct({
      wiki: opt(Schema.Boolean),
      discussions: opt(Schema.Boolean),
      sponsorships: opt(Schema.Boolean),
    }),
  ),
  security: opt(
    Schema.Struct({
      immutableReleases: opt(Schema.Boolean),
      privateVulnerabilityReporting: opt(Schema.Boolean),
      dependabotAlerts: opt(Schema.Boolean),
      dependabotSecurityUpdates: opt(Schema.Boolean),
      codeScanning: opt(Schema.Literal('default', 'extended', 'off')),
      secretScanning: opt(Schema.Boolean),
    }),
  ),
  ruleset: opt(
    Schema.Struct({
      name: opt(Schema.String),
      linearHistory: opt(Schema.Boolean),
      blockDeletion: opt(Schema.Boolean),
      blockForcePush: opt(Schema.Boolean),
      copilotReview: opt(Schema.Boolean),
      codeScanningGate: opt(Schema.Boolean),
      /** Status checks required once two or more maintainers are configured. */
      requiredChecks: opt(Schema.Array(Schema.String)),
      /** Repository admins may bypass the ruleset. On by default. */
      adminBypass: opt(Schema.Boolean),
    }),
  ),
  environments: opt(
    Schema.Struct({
      projectType: opt(Schema.Literal('saas', 'desktop', 'library', 'none')),
      names: opt(Schema.Array(Schema.String)),
    }),
  ),
}).annotations({ identifier: 'Settings' })

/** Files synced from a template directory in another repository. */
export const Sync = Schema.Struct({
  /** The template directory, as `owner/repo/path@ref`. */
  source: Schema.String,
  /** `{{KEY}}` values for the templates. */
  values: opt(Schema.Record({ key: Schema.String.pipe(Schema.pattern(/^[A-Z][A-Z0-9_]*$/)), value: Schema.String })),
  /** Template paths this repository keeps its own copy of. */
  exclude: opt(Schema.Array(Schema.String)),
  /** The branch sync pull requests are opened from. */
  branch: opt(Schema.String),
  /** Fail pull requests that edit synced content. On by default. */
  check: opt(Schema.Boolean),
  /** Level for maintainers' own pull requests that edit synced content; a warning by default. */
  maintainerLevel: opt(Level),
}).annotations({ identifier: 'Sync' })
