---
name: commit
description: Create a git commit using conventional commits, with honest R&D evidence prose when the work was investigatory rather than routine, then get it onto the target branch as a pull request. Use when wrapping up a finished unit of work, after tests and lint pass, or when asked to commit. A local commit alone is not finished work.
---
# Commit

Finish a coherent unit of work: create a commit using conventional commits,
with honest R&D evidence prose when the work was investigatory, and then get
it onto the target branch. A local commit alone is not finished work.

**Posture: write surface.** This skill stages, commits, pushes and opens
pull requests. It follows the safety rules in
`references/publishing.md` without exception.

This body is a thin index. The publishing rules, the message shape and the
duration method live in the bundled files below; do not grow this file.

## The three rules that bite hardest

1. **Stopping at a local commit leaves the work invisible.** A change is
   finished when it is reviewable. Open a pull request. Deciding the work is "done"
   at the commit is the single commonest failure of this workflow.
2. **A commit message is public and permanent.** Write it for a reader who
   was never part of the conversation: describe the code and the reasoning,
   never the exchange that produced it, and never address the requester in
   the second person. Do not name companies or brands, because a later
   claimant may use the message to build a claim.
3. **Do not claim technological uncertainty for routine work.** The
   investigatory message shape exists for work whose outcome was genuinely
   uncertain. Padding a version bump with fake investigation corrupts the
   evidence for the commits where it was real.

## Steps

1. In parallel: `git status`, `git diff` staged and unstaged, and
   `git log -5 --oneline`.
2. Classify the unit from the work, not the file count. If unsure, routine.
3. Stage only the relevant files. No secrets, no unrelated work in progress.
4. Commit with a HEREDOC message, shaped per
   `references/message-shape.md`, ending with a DCO
   `Signed-off-by: <name> <email>` for the configured git author (`git commit -s`,
   or write the trailer yourself under GitButler). Above the sign-off, add the
   AI policy's trailer for every AI tool that wrote or materially changed
   the commit (`AI_POLICY.md` AI-02 in `Resnovas/.github`):
   `Co-authored-by: <tool and model> <the tool's attribution address>`,
   naming the model actually running, plus `Assisted-by: <tool>:<model>`
   only where the repository sets `commits.assistedBy`. Write them
   yourself and replace a host's own attribution line, which uses another
   format. The commit author and the sign-off are the accountable human; an
   AI tool never signs off. Human co-authors stay. No "Generated with"
   footer, robot emoji or session line.
5. `git status` afterwards to confirm.
6. If a hook fails, fix it and create a **new** commit. Do not amend a
   rejected one.
7. Get it onto the target branch, per `references/publishing.md`.

Before committing investigatory ORM or hot-path work, audit the full diff
for blocking side effects on create and write; see `odoo-enterprise`.

## Files

| File | Read it when |
|---|---|
| `references/publishing.md` | Getting the work onto the target branch. Pull requests, stacked branches, drafts, the safety rules, and when not to commit at all. |
| `references/message-shape.md` | Writing the message. Conventional types and scope, the fixed four-beat investigatory shape, worked investigatory and routine examples, and the honesty constraints. |
| `references/duration.md` | The work was investigatory and needs a duration sentence. How to measure the window, what counts, and the rounding rule. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/commit/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `code-review` - reviewing the change against the repo's standards and
  against what the originating issue asked for, before it is committed.
- `odoo-enterprise` - the hot-path audit referenced above, for Odoo diffs.
- `typescript-reviewer`, `python-reviewer`, `react-reviewer` - the language
  review lanes, for confirming the change is worth committing.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`, then only the reference file the task needs. Branch and
publishing rules go in `references/publishing.md`; message conventions in
`references/message-shape.md`; timing method in `references/duration.md`.
This body only gains a pointer. Add a one-line `CHANGELOG.md` entry on every
meaningful change and trim past the window as you write. Overwrite your
`HANDOVER.md` section at the end of a session and delete it when the work
lands. Prefer the smallest edit primitive (`edits` / `file_edits`) over a
full replace, and chain `base_version`.
