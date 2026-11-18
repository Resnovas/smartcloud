---
name: git-worktrees
description: Use dedicated Git worktrees for agent coding, branch isolation, commits and pull requests across T3, Orca, Codex, Claude Code, OpenCode and other hosts. Preserve the user's personal GitButler workspace.
---
# Agent version control

## Agent Git worktrees

Use a dedicated Git worktree and task branch for agent repository changes. Reuse an existing task worktree supplied by the host; do not create nested worktrees. Independent writers need separate worktrees and branches. Read-only reviews and non-repository tasks do not need a new checkout.

- Use the host's worktree mechanism when available: T3 worktree mode and worktree isolation for delegates; Orca worktree creation for Orca-managed work; Claude Code worktree isolation; native Git worktrees for Codex, OpenCode, Copilot, Cursor, Antigravity and other hosts without a managed mechanism.
- Inspect the repository root, current branch, status and worktree list before editing. Create new task branches from the intended base, never from the GitButler integration branch. Do not switch or reset the user's primary checkout.
- Use ordinary Git for status, diffs, staging, commits and pushes. Stage only task-owned changes, sign off commits, preserve repository signing requirements, and use explicit PR head and base branches. For dependent branches, explicitly select the parent branch as the PR base.
- GitButler is Jonathan's personal tool. Do not install, initialize or use `but` for routine agent work, alter GitButler metadata, or modify his applied branches. GitButler-specific skills are opt-in only when he explicitly requests GitButler assistance.
- Preserve existing dirty work and other agents' branches. Never force-remove a dirty worktree or rewrite shared history without authorization. Remove an owned worktree only after its work is committed and safely retained.

## Native Git fallback

Inspect `git status --short`, `git branch --show-current` and `git worktree list` first. If the host has already assigned a task worktree, work there. Otherwise choose a unique branch and a sibling checkout outside the primary working directory:

```sh
git worktree add -b agents/task-name ../repo-task-name <verified-base-ref>
cd ../repo-task-name
```

Replace the placeholders with the repository's actual base and task. Run its setup in the new checkout; never copy credentials or unrelated dirty files from the primary checkout. For T3 and Orca managed sessions, use their native worktree APIs so the session is bound to its checkout.
