---
name: creating-pull-requests
description: Commit and push task-owned work with Git from an isolated worktree, then open a pull request with an explicit head and base branch.
compatibility: Requires Git and authenticated GitHub access
---
# Finishing work

Use the `git-worktrees` skill. Finish authorized repository changes by committing, pushing the task branch and opening a reviewable pull request. Preserve the user's personal GitButler checkout.

## Create the pull request

Read the full diff and commits against the intended base using `git diff <base>...HEAD` and `git log <base>..HEAD`. Stage only task-owned changes and sign off commits with `git commit -s`. Push with `git push -u origin <task-branch>`.

Use the repository's PR template. With GitHub CLI, write the description to a file and run `gh pr create --draft --head <task-branch> --base <base-branch> --title "Title" --body-file <description-file>`. For dependent branches, explicitly use the parent as the base. Follow the house one-PR-per-batch policy when collecting related issues.

Explain the change, why it matters, actual validation and any gaps. Follow applicable disclosure and signing requirements. Use the host's PR-linking tool when provided and return the PR URL.

## Safety

Do not change Git configuration, skip hooks, overwrite other work, force-push shared history or merge without authorization. Resolve missing authentication through the configured secret tooling. GitButler commands are not required for agent commits, pushes or PRs.
