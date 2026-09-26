<!-- Generated from Resnovas/.github templates/GOVERNANCE.md. Edit it there, not here. -->
# <a id="top"></a>Project Governance

This document sets out who decides what, and how changes get reviewed and merged.

## <a id="goals"></a>Goals

- Decisions are made in the open.
- Everyone knows their role and what is expected of them.
- The community stays welcoming and inclusive.
- Quality and direction are protected, including against a volume of submissions nobody has reviewed.

## <a id="roles"></a>Roles

### <a id="owner"></a>Owner

The owner is Resnovas.
While a project has a single maintainer, the owner has full discretion over it: they may review, approve and merge their own work, and no rule in this document blocks them.

### <a id="maintainers"></a>Maintainers

Maintainers review and merge pull requests, steer technical direction, uphold the standards in the [Contributing Guidelines](CONTRIBUTING.md) and the [AI Contribution Policy](AI_POLICY.md), and resolve conflicts.
The current maintainers are listed under `roles.maintainers` in the house smartcloud preset, [`smartcloud/house.yml`](https://github.com/Resnovas/.github/blob/main/smartcloud/house.yml).

### <a id="code-owners"></a>Code owners

Code owners oversee designated parts of a repository, listed in its `CODEOWNERS` file, and review changes to them.

### <a id="contributors"></a>Contributors

Contributors submit issues and pull requests and take part in discussions, following the Contributing Guidelines, the AI Contribution Policy and the [Code of Conduct](CODE_OF_CONDUCT.md).

## <a id="decisions"></a>Decisions

- **Technical decisions** are made by maintainers, preferably in pull requests and issues, where the reasoning stays on record.
- **Non-technical decisions**, such as community guidelines and project direction, are discussed with the community.
Maintainers take community feedback into account and act on the outcome.

## <a id="review"></a>Review requirements

Every pull request is reviewed by a human before it merges.
How many depends on how many maintainers the project has.

| Maintainers | Outside contribution | Maintainer's own pull request |
| --- | --- | --- |
| One | The owner reviews and merges at their discretion. | The owner merges at their discretion. |
| Two or more | Approval from **two** maintainers. | Approval from **one other** maintainer. The author's own review is part of their accountability and does not count. |

A review of an AI-assisted pull request follows [AI-40](AI_POLICY.md#ai-40): an approval states that the reviewer read every changed line and checked the evidence.

### <a id="enforcing-review"></a>Enforcement

[smartcloud](https://github.com/Resnovas/smartcloud) counts approvals from the maintainers in the house preset and applies the table above, reporting the result as the `smartcloud / reviews` check.
As soon as the preset names two or more maintainers, the house ruleset makes the `smartcloud` check required on the default branch; it fails on any policy error, including too few approvals.
With a single maintainer the review gate is always open, so a sole maintainer is never blocked.
The owner can always bypass the ruleset, including the review gate, whatever the number of maintainers; a bypass is recorded in the pull request.

## <a id="merging"></a>Merging

History on the default branch is linear.
Merge commits are disabled; a pull request is either squashed or rebased.

- **Squash** when the pull request has a noisy history: fix-ups, review responses, work in progress.
The squash keeps every commit message in its body, so each `Signed-off-by`, `Co-authored-by` and `Assisted-by` trailer survives.
- **Rebase** when the pull request is small and every commit already stands on its own.

Branches are kept up to date from the pull request page, auto-merge is available, and head branches are deleted once merged.

## <a id="settings"></a>Repository settings

Every repository is configured to the same baseline, applied automatically by smartcloud from the house preset (see the [house repository](https://github.com/Resnovas/.github) README):

- merging as above, with sign-off required on web commits and the wiki disabled, because documentation is published elsewhere;
- Discussions, sponsorships and release immutability enabled;
- private vulnerability reporting, the dependency graph, Dependabot alerts, security updates and grouped version updates;
- CodeQL code scanning with Copilot Autofix, and on public repositories secret scanning with push protection;
- GitHub Actions with a read-only workflow token by default, which may still open pull requests, and on private repositories reusable workflows shared across the organisation;
- a ruleset on the default branch requiring linear history, blocking deletion and force pushes, requesting Copilot code review, and blocking merges on serious code scanning findings;
- deployment environments for what the repository ships: Production, Staging and Development for software as a service; Windows, Linux and macOS with a Beta of each for desktop applications; Release for libraries.

One setting has no API and is set by hand: pushes are limited to updating five branches or tags at once.

## <a id="synced-files"></a>Synced files

The governance documents, templates and shared configuration are synced from [Resnovas/.github](https://github.com/Resnovas/.github).

- **Documents** (the Markdown documents at the root and `LICENSE`) are synced whole.
- **Configuration** (`CODEOWNERS`, `dependabot.yml`, `FUNDING.yml`, the issue forms and their `config.yml`, the pull request template, `.github/smartcloud.yml`, and the smartcloud and Graphify workflows) contains a block between `house:managed:begin` and `house:managed:end`.
The sync only ever replaces that block.
A repository adds its own rules outside it, at the `house:local` line, and those are kept.

Local rules extend the synced ones; they cannot change them.
A pull request that edits a synced document or a managed block, or adds a local rule that redefines a synced one, fails the `smartcloud` check.
In `CODEOWNERS` the managed block comes last, so its owners win over any local rule.
A repository that genuinely needs its own version of a file lists it under `sync.exclude` in `.github/smartcloud.yml`, which a maintainer has to approve.

## <a id="amendments"></a>Changing this document

This document, and every other governance file, is maintained centrally in [Resnovas/.github](https://github.com/Resnovas/.github) and synchronised into each repository.
Propose changes there.
Significant changes need agreement among the maintainers, after discussion with contributors.
