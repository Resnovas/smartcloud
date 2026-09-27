---
applyTo: '.github/workflows/**,.github/actions/**,action.yml,action.yaml'
---

<!-- Synced from Resnovas/.github templates/.github/instructions/house-workflows.instructions.md. Edit it there, not here; a repository adds its own rules as other files in .github/instructions/. -->

# GitHub Actions workflows

These rules apply when you write or review a workflow or action.

- The workflow's top level sets `permissions: {}`, and each job asks for only the permissions it uses.
- The house workflows authenticate with a Resnovas Bot GitHub App token (`actions/create-github-app-token`, from the `RESNOVAS_BOT_APP_ID` variable and `RESNOVAS_BOT_PRIVATE_KEY` secret), minted only for the repository's own code, and fall back to `github.token`. Anything that runs from a fork, Dependabot or another outside trigger gets only the workflow token, so a feature that needs the app turns itself off with a notice instead of failing the run.
- Untrusted input, such as pull request titles, bodies, branch names, issue and comment text, reaches `run:` only through `env:`, never as `${{ }}` inside the script.
- `pull_request_target` and `workflow_run` workflows never check out or run the pull request's code with write access or secrets.
- `actions/checkout` sets `persist-credentials: false` unless a later step pushes.
- A secret is never printed, uploaded as an artifact or passed on a command line.

In a review, a breach of these rules is a security finding and blocks the merge ([APPROVAL_POLICY.md](../../APPROVAL_POLICY.md#ap-31)).
