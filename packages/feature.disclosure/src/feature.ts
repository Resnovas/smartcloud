/**
 * @file packages/feature.disclosure/src/feature.ts
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

import type { Facet, Subject } from '@resnovas/conditions'
import { type Feature, type Finding, Report } from '@resnovas/engine'
import { authorRole, classifyAttribution, levelFor, makeAiIdentityMatcher, policyBase, pullRequestCommits, sameLogin } from '@resnovas/feature.commits'
import { GitHub } from '@resnovas/integrations.github'
import { Effect } from 'effect'
import { type Disclosure, type DisclosureLabels, disclosureLabels, isLevel, LEVELS, parseDisclosure } from './parse.js'

const NAME = 'disclosure'

/** A finding before its level is set by the author's role. */
type Draft = Omit<Finding, 'feature' | 'level'>

/** What the disclosure is checked against. */
interface Evidence {
  readonly subject: Subject
  readonly disclosure: Disclosure
  /** The field labels, so messages name the fields as the template does. */
  readonly labels: DisclosureLabels
  /** SHAs of commits that credit an AI tool, by co-author or `Assisted-by`. */
  readonly aiAttributed: ReadonlyArray<string>
  /** Whether any commit has an AI `Co-authored-by`. */
  readonly aiCoAuthored: boolean
  readonly action: string | undefined
  readonly requireDraft: boolean
  readonly base: string
}

const listsNoTools = (tools: string | undefined) => tools === undefined || tools.toLowerCase() === 'none'

/**
 * Checks the disclosure against AI-01, AI-20 and AI-21.
 *
 * @param evidence - The pull request, its disclosure and its commits' attribution.
 * @returns The broken rules.
 */
const checkDisclosure = (evidence: Evidence): ReadonlyArray<Draft> => {
  const { disclosure, labels, subject, base } = evidence
  const ai01 = `${base}/AI_POLICY.md#ai-01`
  const levels = LEVELS.join(', ')
  if (disclosure.level === undefined) {
    return [{ rule: 'AI-01', message: `The AI disclosure is missing. Fill in "${labels.level}:" with one of: ${levels}.`, link: ai01 }]
  }
  if (!isLevel(disclosure.level)) {
    return [{ rule: 'AI-01', message: `"${labels.level}: ${disclosure.level}" is not a level. Use one of: ${levels}.`, link: ai01 }]
  }
  if (disclosure.level === 'none') {
    return [
      ...(listsNoTools(disclosure.tools) ? [] : [{ rule: 'AI-01', message: `${labels.level} is none but ${labels.tools} lists "${disclosure.tools}".`, link: ai01 }]),
      ...evidence.aiAttributed.map((sha) => ({ rule: 'AI-01', message: `${labels.level} is none but this commit credits an AI tool.`, link: ai01, commit: sha })),
    ]
  }

  const found: Array<Draft> = []
  if (listsNoTools(disclosure.tools)) {
    found.push({ rule: 'AI-01', message: `${labels.level} is ${disclosure.level}; name every tool and model in "${labels.tools}:".`, link: ai01 })
  }
  if (!evidence.aiCoAuthored) {
    found.push({ rule: 'AI-01', message: `${labels.level} is ${disclosure.level} but no commit has a Co-authored-by trailer for the AI tool.`, link: ai01 })
  }
  // AI-assisted pull requests start as drafts and leave draft only once the
  // accountable human has reviewed them.
  if (subject.draft !== true) {
    if (evidence.requireDraft && evidence.action === 'opened') {
      found.push({ rule: 'AI-20', message: 'AI-assisted pull requests must be opened as drafts. Convert this one to a draft.', link: `${base}/AI_POLICY.md#ai-20` })
    }
    const ai21 = `${base}/AI_POLICY.md#ai-21`
    if (disclosure.accountable === undefined || !sameLogin(disclosure.accountable, subject.author)) {
      found.push({ rule: 'AI-21', message: `"${labels.accountable}:" must be the pull request author, @${subject.author}.`, link: ai21 })
    }
    if (disclosure.review === undefined) {
      found.push({
        rule: 'AI-21',
        message: `"${labels.review}:" is empty. State what you personally reviewed and ran before marking this ready.`,
        link: ai21,
      })
    }
  }
  return found
}

/**
 * The disclosure feature (SMC-9): a pull request states how AI was used, and
 * AI-assisted work is reviewed by an accountable human before it is ready.
 *
 * @remarks
 * Enabled by a `disclosure` section. It reads the `AI level`, `AI tools`,
 * `Accountable human` and `Human review` fields from the description (the
 * labels are configurable through `disclosure.fields`), ignoring HTML
 * comments, and checks them against the pull request's commits:
 *
 * - AI-01: the level is valid; `none` lists no tools and no commit credits
 *   an AI tool; any other level names its tools and some commit has an AI
 *   `Co-authored-by`.
 * - AI-20: an AI-assisted pull request is opened as a draft, unless
 *   `disclosure.requireDraft` is false.
 * - AI-21: a non-draft AI-assisted pull request names its author as the
 *   accountable human and states the human review.
 *
 * AI identities are those of `@resnovas/feature.commits`, including
 * `commits.aiIdentities`. Trusted bots are skipped, and maintainers' errors
 * are reported at `disclosure.maintainerLevel` (`warning` by default).
 */
export const disclosureFeature: Feature = {
  name: NAME,
  handles: ['pullRequest'],
  enabled: (config) => config.disclosure !== undefined,
  facets: () => new Set<Facet>(['commits']),
  run: (context) =>
    Effect.gen(function* () {
      const section = context.config.disclosure ?? {}
      const { subject, commits } = yield* pullRequestCommits(context, NAME)
      const github = yield* GitHub
      const role = authorRole(subject.author, context.config.roles, github.coordinates.owner)
      if (role === 'bot') return

      const isAi = makeAiIdentityMatcher(context.config.commits?.aiIdentities)
      const attributions = commits.map((commit) => ({ sha: commit.sha, ...classifyAttribution(commit.message, isAi) }))
      const labels = disclosureLabels(section.fields)
      const found = checkDisclosure({
        subject,
        disclosure: parseDisclosure(subject.body, labels),
        labels,
        aiAttributed: attributions.filter((attribution) => attribution.aiAttributed).map((attribution) => attribution.sha),
        aiCoAuthored: attributions.some((attribution) => attribution.aiCoAuthored),
        action: context.envelope.action,
        requireDraft: section.requireDraft !== false,
        base: policyBase(context.config),
      })
      const report = yield* Report
      for (const draft of found) {
        yield* report.add({ feature: NAME, level: levelFor(role, draft.rule, section.maintainerLevel), ...draft })
      }
    }),
}
