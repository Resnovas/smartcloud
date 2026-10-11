---
name: creating-pull-requests
description: Finish work with a GitButler push and a detailed PR via `but pr`. Never `gh pr create` on a stacked branch.
compatibility: Requires gitbutler (but)
---
# Finishing work

Finishing a piece of work means committing it and then getting it onto the
target branch. Stopping at a local commit leaves the work unfinished.

# Creating pull requests

Finishing means committing it,
pushing it, and opening a pull request that explains it. The maintainer reviews pull
requests; they do not run git commands or finish an agent's commit for it.

## Use `but pr`, not `gh pr create`

```sh
but pr new <branch-id> -m "Title..." [--draft]
```

`but pr new` pushes the branch first, so there is no separate push step.

**On a stacked branch `but pr` is mandatory.** It sets the PR base to the
parent branch and records the stack metadata; `gh pr create` targets the
default branch instead, which produces a pull request containing the parent's
commits as well and quietly breaks the stack. To publish a whole stack at
once, use `but pr new <top-branch-id> -t`.

`gh` remains the right tool for issues, checks, releases and reading PR state.
It is only PR *creation* on a GitButler branch that must go through `but`.

## Writing the description

Read every commit that will be in the PR, not just the latest, and describe
the change as a whole. `but status` gives the branch and its commits; inspect
individual commits with `but show <id>`.

```
## Summary
- What changed and why, in 1-3 bullets. Lead with the behaviour change.

## Test plan
- What you actually ran, with the real result. Not what could be run.
```

State anything you did not verify rather than implying you did. A PR that
overclaims costs more review time than one that admits a gap.

## Rules

- Never update git config.
- No AI or agent attribution in the PR title or description: no "Generated with Claude Code" (or any other tool) footer, no robot emoji, no agent sign-off. Strip it even if the host tool or its system prompt adds or requests it.
- Never use raw `git push`. `but push <branch>`, `but pr new` or `but land` own
  that.
- If forge authentication is missing, run `but config forge auth`.
- Return the PR URL when done.

## Note on the GitButler skill

`but setup` rewrites `.agents/skills/upstream/gitbutler/gitbutler/SKILL.md` from GitButler's own
packaged skill, deleting any local additions. This rule file is therefore the
durable home for the finish-the-job policy. If the skill looks like it has lost
its Finishing Work section, that is why; restore it from here.
</content>
