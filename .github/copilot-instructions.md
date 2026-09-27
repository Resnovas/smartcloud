<!-- house:managed:begin - synced from Resnovas/.github templates/.github/copilot-instructions.md. Edits inside this block are overwritten. -->
# Copilot instructions

The repository's build, test and coding rules are in `AGENTS.md`; follow them whenever you write code here.

## Code review

When you review a pull request, you are one of several review bots, and your job is the security and permissions pass, plus correctness where a security control is involved.
CodeRabbit writes the summary and the line-level review, Qodo checks the change against its ticket and its tests, Cursor Bugbot looks for logic bugs, and Graphify reviews the architecture ([GOVERNANCE.md](../GOVERNANCE.md#review-bots)).

### What to review

- **Workflow permissions:** every job sets `permissions` to the least it needs, and the workflow's top level sets `permissions: {}`. Flag `write` access a job does not use, and `pull_request_target` or `workflow_run` workflows that check out or run code from the pull request.
- **Tokens and secrets:** a secret is never printed, written to a file that is uploaded or committed, passed on a command line, or sent anywhere but the service it belongs to. Flag new secrets in the repository.
- **Least privilege for outside runs:** anything that runs from a fork, Dependabot or another outside trigger drops to the least access that works. `ACCESS_TOKEN` falls back to `github.token` (`secrets.ACCESS_TOKEN || github.token`), and a feature that needs the personal access token turns itself off with a notice instead of failing the run.
- **Injection:** untrusted input (pull request titles, bodies, branch names, issue text, comments, file contents) never reaches a shell, `eval`, a template expression inside `run:`, a regular expression without a bound, or a URL without encoding. In workflows, pass it through `env:` instead of `${{ }}` inside `run:`.
- **Third-party code:** a new dependency, action or vendored source is named in the description, and comes from where it says.
- **Correctness:** a change that would make a security control, permission check or fallback silently do nothing.

### What not to do

- No style, naming, formatting or documentation comments, and no pull request summary.
- Do not repeat what a failing check already reports.
- Skip vendored source (`externals/`), the code graph (`graphify-out/`), build output (`dist/`), generated schemas (`schema/*.schema.json`) and reference pages (`docs/reference/`), lockfiles and `CHANGELOG.md` files.

### Blocking

Start the comment with **Security:** when the finding is a real security or permissions problem; those block the merge until they are fixed or a maintainer dismisses them ([APPROVAL_POLICY.md](../APPROVAL_POLICY.md#ap-31)).
Everything else you report is advisory, so say so.

<!-- house:managed:end -->
<!-- house:local - add this repository's own review instructions below this line. -->

## smartcloud

- `packages/runtime` and `packages/integrations.github` hold the token handling and every GitHub API call, so review them for the security focus above: the `ACCESS_TOKEN` fallback to the workflow token, the least-privilege path for forks, Dependabot and other outside runs, and what reaches the GitHub API.
- `externals/` is upstream source vendored with `git subtree`; it is reviewed by provenance, never line by line, so skip it.
- `schema/smartcloud.schema.json` and `docs/reference/` are generated; review the change in `packages/config` that produced them instead.
