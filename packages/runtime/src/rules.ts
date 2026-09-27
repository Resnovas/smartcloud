/**
 * @file packages/runtime/src/rules.ts
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

import type { SmartcloudConfig } from '@resnovas/config'
import { BRANCH_RULE, describeBranches } from '@resnovas/feature.branches'
import { GENERATED_RULE, SHADOWED_RULE, SYNTAX_RULE } from '@resnovas/feature.codeowners'
import { policyBase } from '@resnovas/feature.commits'
import { presetDescription } from '@resnovas/feature.conventions'
import { Data, Effect } from 'effect'

/** What a rule asks for, and how to satisfy it. */
export interface RuleExplanation {
  readonly rule: string
  readonly summary: string
  readonly fix: string
  readonly link?: string
}

/**
 * No rule has this id.
 *
 * @example
 * ```ts import.meta.vitest name="UnknownRule"
 * import { UnknownRule } from '@resnovas/runtime'
 *
 * new UnknownRule({ rule: 'nope' }).message.startsWith('no smartcloud rule is called "nope"') // => true
 * ```
 */
export class UnknownRule extends Data.TaggedError('UnknownRule')<{ readonly rule: string }> {
  override get message() {
    return `no smartcloud rule is called "${this.rule}"; the ids are in the finding, for example AI-02, DCO or conventions.title`
  }
}

// The policy rules, with the document and anchor each links to under links.policyBase.
const POLICY: Readonly<Record<string, { readonly summary: string; readonly fix: string; readonly anchor: string }>> = {
  'AI-01': {
    summary: 'The pull request states its AI autonomy level and, unless it is none, every AI tool and model used.',
    fix: 'Fill in "AI level:" with none, autocomplete, chat, agent or autonomous, and list the tools in "AI tools:". A level of none lists no tools and no commit credits an AI tool.',
    anchor: 'AI_POLICY.md#ai-01',
  },
  'AI-02': {
    summary:
      'Every commit with a material change produced by an AI tool credits it with both a Co-authored-by and an Assisted-by: TOOL:MODEL trailer.',
    fix: 'Amend the commits to add both trailers for the tool, for example "Co-authored-by: Claude <noreply@anthropic.com>" and "Assisted-by: claude-code:claude-opus-5-5".',
    anchor: 'AI_POLICY.md#ai-02',
  },
  'AI-03': {
    summary: 'Only a human signs off. An AI tool is never named in a Signed-off-by trailer.',
    fix: 'Remove the AI Signed-off-by and sign off as the accountable human with "git commit -s".',
    anchor: 'AI_POLICY.md#ai-03',
  },
  'AI-20': {
    summary: 'An AI-assisted pull request is opened as a draft.',
    fix: 'Convert the pull request to a draft, and mark it ready once the accountable human has reviewed it.',
    anchor: 'AI_POLICY.md#ai-20',
  },
  'AI-21': {
    summary:
      'An AI-assisted pull request that is ready for review names its author as the accountable human and states the human review.',
    fix: 'Set "Accountable human:" to the pull request author and describe the review in "Human review:".',
    anchor: 'AI_POLICY.md#ai-21',
  },
  DCO: {
    summary: 'Every commit is signed off by its author under the Developer Certificate of Origin.',
    fix: 'Sign off each commit with "git commit -s", or "git rebase --signoff" for existing ones; the email must match the commit author.',
    anchor: 'CONTRIBUTING.md#dco',
  },
  SYNC: {
    summary: 'Synced files and managed blocks come from the template repository and are not edited locally.',
    fix: 'Revert the edit and change the template in the source repository, or add local rules outside the managed block.',
    anchor: 'GOVERNANCE.md#synced-files',
  },
  REVIEW: {
    summary: 'A pull request needs the configured number of maintainer approvals from someone other than its author.',
    fix: 'Ask a maintainer for a review; the gate re-checks on every review.',
    anchor: 'GOVERNANCE.md#review',
  },
}

// Features whose other findings are operational notices rather than policy rules.
const NOTICE_FEATURES: ReadonlyArray<string> = [
  'labels',
  'stale',
  'settings',
  'reviews',
  'sync',
  'required',
  'freeze',
  'codeowners',
  'lock',
  'engine',
]

// The codeowners feature's rules, which check the repository's own CODEOWNERS rather than a linked policy.
const CODEOWNERS: Readonly<Record<string, { readonly summary: string; readonly fix: string }>> = {
  [SYNTAX_RULE]: {
    summary: 'A CODEOWNERS line GitHub rejects or ignores, so the paths on it get no owners.',
    fix: 'Fix the line: owners are @login, @org/team or an email address with write access, and patterns cannot use !, [ ] or spaces.',
  },
  [SHADOWED_RULE]: {
    summary:
      'A CODEOWNERS rule that never applies, because a later rule has the same pattern and the last matching rule wins.',
    fix: 'Remove the earlier rule, or merge its owners into the later one.',
  },
  [GENERATED_RULE]: {
    summary: 'A pull request edits the CODEOWNERS block generated from codeowners.rules.',
    fix: 'Change codeowners.rules in the smartcloud config instead, and leave the block as generated.',
  },
}

/**
 * Explains a rule from its id, as a finding reports it.
 *
 * @remarks
 * Policy rules come from a fixed catalogue linked under `links.policyBase`.
 * A `conventions.<id>` rule is read from the config, so its explanation is
 * the rule's own message or its preset's description, and `branches.name`
 * from the `branches` section's accepted names. Any other id with a
 * feature prefix, such as `stale.sweep`, is an operational notice from that
 * feature.
 *
 * @example
 * ```ts import.meta.vitest name="explainRule"
 * import { explainRule } from '@resnovas/runtime'
 * import { Effect } from 'effect'
 *
 * Effect.runSync(explainRule('dco', { version: 2 })).rule // => 'DCO'
 * Effect.runSync(Effect.flip(explainRule('nope', { version: 2 })))._tag // => 'UnknownRule'
 * ```
 *
 * @param rule - The rule id.
 * @param config - The config the finding came from.
 * @returns The explanation, or `UnknownRule`.
 */
export const explainRule = (rule: string, config: SmartcloudConfig): Effect.Effect<RuleExplanation, UnknownRule> => {
  const explained = explain(rule, config)
  return explained === undefined ? Effect.fail(new UnknownRule({ rule })) : Effect.succeed(explained)
}

const explain = (rule: string, config: SmartcloudConfig): RuleExplanation | undefined => {
  const base = policyBase(config)
  const policy = POLICY[rule.toUpperCase()]
  if (policy !== undefined)
    return { rule: rule.toUpperCase(), summary: policy.summary, fix: policy.fix, link: `${base}/${policy.anchor}` }
  const [feature = '', ...rest] = rule.split('.')
  const id = rest.join('.')
  if (feature === 'conventions') {
    const convention = config.conventions?.rules?.[id]
    if (convention === undefined) return undefined
    const expected =
      convention.message ??
      (convention.preset === undefined ? undefined : presetDescription(convention.preset, convention.contexts ?? []))
    return {
      rule,
      summary: `The ${id} convention of this repository's config.`,
      fix: expected ?? 'Change the title or description so the conditions under its when section pass.',
    }
  }
  if (rule === BRANCH_RULE && config.branches !== undefined) {
    return {
      rule,
      summary:
        "The branch naming policy of this repository's config: a pull request's head branch matches one of the accepted names.",
      fix: describeBranches(config.branches),
    }
  }
  const codeowners = CODEOWNERS[rule]
  if (codeowners !== undefined) return { rule, ...codeowners }
  if (NOTICE_FEATURES.includes(feature) && id !== '') {
    return {
      rule,
      summary: `An operational notice from the ${feature} feature, not a policy rule.`,
      fix: `Read the finding's message; the ${feature} feature's documentation explains its settings.`,
    }
  }
  return undefined
}
