# Getting the work onto the target branch

## Open a pull request

A change is finished when it is reviewable. The reviewer does not run git
commands or finish an agent's commit for it.

In a GitButler repository, `but pr new <branch-id> -m "Title..."` pushes and
opens the pull request in one step.

If the work depends on another branch already in flight, stack it rather than
mixing the changes. **Never use `gh pr create` on a stacked branch**: it
targets the default branch, so the pull request swallows the parent's commits
and the stack metadata is lost.

Use `--draft` when the work is real but not ready for review, rather than
withholding the pull request entirely. A pull request an agent opens is
always a draft (`AI_POLICY.md` AI-20, AI-31), and its description fills in
the AI disclosure: `AI level: autonomous` and `AI tools:` naming each tool
and model (AI-01, AI-32), leaving `Accountable human` and `Human review` for
the person who marks it ready.

## Safety

- Never update git config.
- Never skip hooks (`--no-verify`) unless the user explicitly asks.
- Never force-push to main or master; warn if asked to.
- Never amend unless the usual conditions hold: the user asked, or a hook
  auto-modified files on a commit you just created that has not been pushed.
- Do not commit secrets: `.env`, credentials, private keys.
- If a commit fails on a hook, fix it and create a **new** commit. Do not
  amend a rejected commit.

## When not to commit

- The user said to hold off.
- Only unrelated dirty files remain, for example personal settings.
- The work is clearly incomplete mid-task with no shippable slice.