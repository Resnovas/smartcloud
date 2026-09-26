/**
 * @file packages/feature.commits/src/feature.ts
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

import type { Commit, Facet } from '@resnovas/conditions'
import type { SmartcloudConfig } from '@resnovas/config'
import { type Feature, type Finding, Report } from '@resnovas/engine'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { classifyAttribution } from './attribution.js'
import { type Identity, makeAiIdentityMatcher } from './identity.js'
import { authorRole, levelFor, policyBase, pullRequestCommits } from './policy.js'

const NAME = 'commits'

type CommitsSection = NonNullable<SmartcloudConfig['commits']>

/** A finding before its level is set by the author's role. */
type Draft = Omit<Finding, 'feature' | 'level'>

const formatIdentity = (identity: Identity) => `${identity.name} <${identity.email}>`

// `Assisted-by` names the tool and model as `TOOL:MODEL`, optionally followed
// by further tools: the first word needs text on both sides of a colon.
// Anchored, with one quantifier bounded by the colon it excludes: linear.
const TOOL_AND_MODEL = /^[^\s:]+:\S/
const namesToolAndModel = (value: string): boolean => TOOL_AND_MODEL.test(value.trim())

/**
 * Checks one commit against the DCO and AI attribution rules.
 *
 * @param commit - The commit.
 * @param section - The config's `commits` section.
 * @param base - The policy base URL for links.
 * @param isAi - The AI identity predicate.
 * @returns The broken rules, in the order AI-02, AI-03, DCO.
 */
const checkCommit = (commit: Commit, section: CommitsSection, base: string, isAi: (identity: Identity) => boolean): ReadonlyArray<Draft> => {
  const found: Array<Draft> = []
  const attribution = classifyAttribution(commit.message, isAi)
  // GitHub writes merge commits itself, so they carry no sign-off to check.
  const merge = commit.parents > 1

  if (section.aiAttribution !== false) {
    const link = `${base}/AI_POLICY.md#ai-02`
    // Both trailers travel together: Co-authored-by shows on GitHub,
    // Assisted-by records the exact tool and model.
    if (attribution.aiAttributed && !attribution.aiCoAuthored) {
      found.push({ rule: 'AI-02', message: 'This commit has Assisted-by but no Co-authored-by trailer for the AI tool.', link, commit: commit.sha })
    } else if (attribution.aiCoAuthored && !attribution.assistedBy.some(namesToolAndModel)) {
      found.push({
        rule: 'AI-02',
        message: 'This commit credits an AI co-author but has no "Assisted-by: TOOL:MODEL" trailer.',
        link,
        commit: commit.sha,
      })
    }
    if (!merge) {
      for (const signer of attribution.signOffs.filter(isAi)) {
        found.push({
          rule: 'AI-03',
          message: `Signed-off-by "${formatIdentity(signer)}" is an AI tool. Only a human can sign off.`,
          link: `${base}/AI_POLICY.md#ai-03`,
          commit: commit.sha,
        })
      }
    }
  }

  if (section.dco !== false && !merge) {
    // An AI sign-off never certifies the DCO, even when its email matches.
    const author = commit.authorEmail.toLowerCase()
    const certified = attribution.signOffs.some((signer) => !isAi(signer) && signer.email === author)
    if (!certified) {
      found.push({
        rule: 'DCO',
        message: `No Signed-off-by matching the author <${commit.authorEmail}>. Commit with "git commit -s".`,
        link: `${base}/CONTRIBUTING.md#dco`,
        commit: commit.sha,
      })
    }
  }
  return found
}

/**
 * The commits feature (SMC-8): every commit on a pull request is signed off
 * by its author, and AI tools are credited but never sign off.
 *
 * @remarks
 * Enabled by a `commits` section. `commits.dco` checks that each non-merge
 * commit has a `Signed-off-by` whose email is the author's (DCO).
 * `commits.aiAttribution` checks that an AI-attributed commit carries both
 * `Co-authored-by` and `Assisted-by` (AI-02), and that no `Signed-off-by`
 * names an AI tool (AI-03). Both are on by default.
 *
 * Trusted bots are skipped. On a maintainer's own pull request, or the
 * repository owner's, errors are reported at `commits.maintainerLevel`
 * (`warning` by default), except AI-03.
 */
export const commitsFeature: Feature = {
  name: NAME,
  handles: ['pullRequest'],
  enabled: (config) => config.commits !== undefined,
  facets: () => new Set<Facet>(['commits']),
  run: (context) =>
    Effect.gen(function* () {
      const section = context.config.commits ?? {}
      const { subject, commits } = yield* pullRequestCommits(context, NAME)
      const github = yield* GitHub
      const role = authorRole(subject.author, context.config.roles, github.coordinates.owner)
      if (role === 'bot') return

      const report = yield* Report
      const base = policyBase(context.config)
      const isAi = makeAiIdentityMatcher(section.aiIdentities)
      for (const commit of commits) {
        for (const draft of checkCommit(commit, section, base, isAi)) {
          yield* report.add({ feature: NAME, level: levelFor(role, draft.rule, section.maintainerLevel), ...draft })
        }
      }
    }),
}
