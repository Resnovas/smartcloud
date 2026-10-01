---
name: gitbutler-instead-worktrees
description: Use GitButler instead of Git worktrees for version control. Apply when setting up git workflows, creating branches, managing multiple feature branches, or working with multiple agents simultaneously. GitButler keeps all source info in the repo without conflicts.
---
# GitButler instead of Worktrees

**Preference:** Use GitButler when possible instead of worktrees.

**Rationale:** Keeps all source information in the repo without conflicting. Multiple agents can work simultaneously without branch switching overhead.

## Implementation

### Install GitButler

```bash
# Install GitButler CLI
npm install -g gitbutler
# or use the desktop app at https://gitbutler.com
```

### Basic workflow

```bash
# View status
but status

# View detailed status with file/hunk IDs
but status -fv

# Stage changes
but diff

# Commit selected hunks
but commit -b <branch> -m "<message>" <hunk-id> <hunk-id>
```

## GitButler vs Worktrees comparison

| Feature | GitButler | Worktrees |
|---------|-----------|-----------|
| Multiple branches simultaneously | Yes | Requires separate dirs |
| Shared source code | Yes | No |
| Conflict prevention | Yes | Manual |
| Agent-friendly | Yes | Limited |
| GitButler integration | Native | Breaks GitButler |

## When to use this skill

- Setting up new projects
- Working with multiple feature branches
- Multi-agent workflows
- When you need to maintain multiple branches in parallel
- GitButler is already configured in the repo

## When NOT to use this skill

- GitButler is not installed or configured
- You need a completely separate copy of the repo
- Working with CI that doesn't support GitButler