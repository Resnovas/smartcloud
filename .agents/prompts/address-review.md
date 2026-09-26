---
label: Address PR review
description: Triage and fix the review comments on this branch's pull request
---

Work through the review comments on the pull request for the current branch.

1. Find the pull request with `gh pr view --json number,url,headRefName` and read every review thread and bot comment (`gh api repos/{owner}/{repo}/pulls/<n>/comments` and `.../reviews`).
2. Triage each one as fix, reply or dismiss. Verify every claim against the code before acting on it; bots are often wrong.
3. Fix the real ones with the smallest change, keep tests with the behaviour they verify, and amend each fix into the commit it belongs to rather than adding fixup commits.
4. Run `node --run check`, then report what you fixed, what you replied and why, and anything that needs the maintainer's decision. Do not push unless asked.
