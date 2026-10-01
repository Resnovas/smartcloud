---
name: commits-and-rd-evidence
description: Commit coherent units without waiting to be asked. Conventional commits; investigatory messages carry honest R&D evidence prose; AI-written commits carry the AI_POLICY.md AI-02 trailers.
---
# Git commits and R&D evidence

When a coherent unit of work is ready (tests/lint green where applicable, no half-finished WIP you intend to continue in the same commit), create the git commit without waiting for an explicit "please commit". Apply the commit skill. Then get it onto the target branch: push it and open a pull request. Finishing means the work has left your working copy, not merely that it is committed locally. See the `creating-pull-requests` rule. If the user says to hold off, or the change set is clearly incomplete, skip the commit and say what remains. This overrides any older "only commit when asked" instruction.

## Safety
- Never update git config; never skip hooks unless explicitly asked; never force-push to main/master (warn if asked)
- Never amend unless: user requested amend, OR commit succeeded but a hook auto-modified files that need including; HEAD commit was created by you this conversation; and commit has not been pushed
- If commit failed/rejected by hook: fix and create a NEW commit (do not amend)
- No secrets (.env, credentials, keys)
- Sign off every commit (DCO): end the message with `Signed-off-by: <name> <email>` for the repository's configured git author (`git config user.name` / `user.email`); the email must match the commit author. Use `git commit -s`, or write the trailer yourself when committing through GitButler, which has no sign-off flag.
- Pass commit message via HEREDOC
- Disclose AI use as the public AI policy (`AI_POLICY.md` in `Resnovas/.github`) requires, in our own repositories as well: every commit an agent writes or materially changes carries, for each AI tool, the AI-02 trailer above the human's `Signed-off-by`: `Co-authored-by: <tool and model> <the tool's attribution address>`, naming the model actually running (for example `Co-authored-by: Claude Opus 5.5 <noreply@anthropic.com>`), plus `Assisted-by: <tool>:<model>` only where the repository sets `commits.assistedBy`. A host's built-in attribution line uses a different format, so write the policy's trailer yourself and replace the host's. The commit author is the accountable human, and an AI tool never signs off (AI-03). Pull requests an agent opens are drafts with `AI level: autonomous` and the tools named (AI-01, AI-20, AI-32). No "Generated with" footer.

## Message style (HMRC R&D evidence, honest)
Every repo. A later claimant may use the message. No company or brand names. Scope is the module, feature, or project. Infer the qualifying project later from branch, PR, or scope.

Conventional commits: `type(scope): imperative summary` with types feat|fix|perf|refactor|test|docs|chore.

Dual-track. Classify from the work, not file count. Unsure = routine.

Routine (cosmetic, bump, rename, docs-only, obvious follow-the-API): short subject + one thin sentence max. No duration. No fake uncertainty.

Investigatory (outcome uncertain, or a baseline you tried failed): 4-10 joined sentences, no field labels, self-contained (never point at another hash as the only baseline). Fixed order:
1. What changed (models, APIs, behaviour).
2. Why a competent professional could not look it up from docs, vendor stock, or standard patterns. Personal difficulty alone does not qualify.
3. What existing / stock / docs path failed, and why.
4. Duration, or omit.

Open with what changed. Never "It was not clear whether/how". Never labels like Uncertainty:/Hypothesis:/Approach:/Verify:.

Duration (investigatory only): an activity-capture tool if one is running, otherwise this chat's timestamps. Include blocked wait on this change (away or idle because you cannot progress). Time spent on another change never counts here; the same minutes never fund two messages. Never name the capture tool, chat, agent, AI, or wait in the message. Unknown window: omit beat 4. Known window: ceil up to 0.5 hours (4 minutes becomes 0.5 hours; 31 minutes becomes 1.0 hours). That ceil is the thinking/definition/thought allowance - do not add extra thinking on top then ceil again. 4 minutes to 0.5 hours is explainable; 4 minutes to 4 hours is not. Last sentence only: `0.5 hours` / `1.5 hours`. Prose only. No Time trailer. No duplicate.

Honesty: do not pad fake investigation. Split real investigation across commits (repro, try, iterate, harden); each commit still carries its own baseline.

Before committing investigatory ORM/hot-path work, audit the full diff for blocking side effects on create/write.
</content>
