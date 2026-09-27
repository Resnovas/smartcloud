Work through the review comments on the pull request for the current branch.

1. Find the pull request with `gh pr view --json number,url,headRefName` and read every review thread and bot comment (`gh api repos/{owner}/{repo}/pulls/<n>/comments` and `.../reviews`).
2. Triage each one as fix, reply or dismiss. Verify every claim against the code before acting on it; bots are often wrong. Only these block the merge (GOVERNANCE.md, Review bots): a Copilot security finding, a CodeRabbit comment marked major or critical, a failing Graphify gate, and Qodo reporting the change does not match its ticket. Everything else is advisory: fix it or reply with the reason.
3. Teach the bots on every finding you resolve. For Graphify, end the reply with `@graphify good <rule>` (right, fixed), `@graphify wrong <rule>` plus one sentence of why, or `@graphify suppress <rule> <path-glob>` for noise in one area. For Qodo, react +1 or -1 on the suggestion and give the reason in the reply.
4. Fix the real ones with the smallest change, keep tests with the behaviour they verify, and amend each fix into the commit it belongs to rather than adding fixup commits.
5. Run `node --run check`, then report what you fixed, what you replied and why, and anything that needs the maintainer's decision. Do not push unless asked.
