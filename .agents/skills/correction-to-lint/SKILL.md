---
name: correction-to-lint
description: "Turns a correction into a narrow lint rule with an actionable error and removes existing violations. Use after a correction when asked to prevent recurrence, turn it into a lint rule, or promote guidance into enforcement; not for ordinary lint cleanup."
---

# Correction to lint

Turn this correction into a lint rule, write the error so it says what to do instead, and remove the existing copies.

Use the Resnovas self-improvement funnel: **codebase → static analysis → verification → AGENTS.md → human**. Make the codebase a clean example, enforce what can be enforced, and reserve prose and human judgment for what checks cannot decide. If it cannot be linted, make it a test or other verification. Leave it in AGENTS.md only as a last resort.

## Promote the correction

1. **Find the underlying bad pattern.** Read the correction just made, its diff, callers, and relevant repository guidance. State the invariant the correction restores, not just the syntax or symptom that exposed it. Distinguish a real recurrence from superficially similar valid code. If the correction is not available or its intent is ambiguous, ask for that missing context rather than inventing a rule.

2. **Pick the narrowest enforceable check.** Inspect existing lint configuration and verification commands first; extend their source of truth. Use ESLint `no-restricted-syntax` for a precise AST pattern, `no-restricted-globals` for a forbidden global with a supported replacement, or `no-restricted-imports` for an import boundary. Use a custom rule only when built-in restrictions cannot express the necessary context. Use a typecheck when types express the invariant more faithfully. If the bad pattern depends on behavior that static analysis cannot establish, add a regression test or executable verification instead of a broad syntax ban. Scope the check to the files and contexts where its diagnosis holds; do not ban a valid API across the repository because one use was wrong.

3. **Write the error as the fix.** Name the underlying problem and the concrete replacement, rather than saying only “forbidden” or prescribing another workaround. For example, when `setTimeout(..., 0)` masks duplicated menu state: “Don't add a timer here. The menu's open state is kept in two places. Move it into one.” Use that diagnosis only where it is true; do not attach it to every timer. A test failure or verification diagnostic should likewise identify the violated contract and what must change.

4. **Put enforcement in its owning configuration.** Add the rule to the repository's lint config, or wire the typecheck/test/verification into the existing required checks so normal development and CI execute it. When the invariant applies across repositories, propose promotion to the shared `Resnovas/.github` house with the scope, rule, diagnostic, and adoption impact. A shared-house proposal is not installed enforcement: retain the working local check until shared adoption replaces it, and do not publish cross-repository changes without authorization.

5. **Remove every existing occurrence.** Search the whole repository for the underlying pattern and its alternate spellings; run the check across all applicable files, not just the changed files. Fix each violation at its cause so the codebase teaches the correct pattern. Do not obtain a clean result by adding suppressions, a grandfathered baseline, or exclusions for existing violations. Respect repository exclusions for vendored, generated, or immutable historical files; fix a generator rather than its generated output. Report any genuine blocked occurrence instead of claiming completion.

6. **Retire redundant prose.** Once the check covers the instruction, remove that instruction from the relevant AGENTS.md files. Preserve any judgment or constraint the check does not enforce. If neither static analysis nor executable verification can enforce the correction, explain why and keep only the smallest actionable instruction in the narrowest applicable AGENTS.md. Escalate unresolved policy or product choices to a human rather than encoding an assumption as a rule.

7. **Prove the promotion.** Show the check rejecting the original bad case and accepting the corrected case plus a nearby legitimate case that a broader rule would wrongly reject. For a behavioral regression, show the test failing before the fix and passing after it. Run the repository's lint, typecheck, and tests, and regenerate affected configuration or documentation evidence required by repository policy. Record unavailable checks and unrelated failures explicitly; do not describe them as passing.

8. **Record the promotion in the commit message.** Include the correction and underlying invariant, the chosen rule/typecheck/test and its scope, the existing occurrences removed, the AGENTS.md prose retired or retained with its reason, and verification results. Distinguish a proposed shared-house rule from one actually adopted. Follow the repository's authorized delivery workflow; report what is enforced, any remaining limitation, and the actual delivery state.
