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
The current maintainers are `TGTGamer`.
They are set under `roles.maintainers` in the house smartcloud preset, [`smartcloud/house.yml`](https://github.com/Resnovas/.github/blob/main/smartcloud/house.yml), which is also where a new maintainer is added.

### <a id="code-owners"></a>Code owners

Code owners oversee designated parts of a repository, listed in its `CODEOWNERS` file, and review changes to them.

### <a id="contributors"></a>Contributors

Contributors submit issues and pull requests and take part in discussions, following the Contributing Guidelines, the AI Contribution Policy and the [Code of Conduct](CODE_OF_CONDUCT.md).

### <a id="trusted-bots"></a>Trusted bots

Trusted bots are automation accounts that open routine pull requests, such as dependency updates and house syncs: `dependabot[bot], renovate[bot], github-actions[bot], resnovas-smartcloud[bot]`.
No person writes their commits, so the automated checks skip the AI disclosure ([AI-01](AI_POLICY.md#ai-01)), the co-author and sign-off trailers ([AI-02](AI_POLICY.md#ai-02), [AI-03](AI_POLICY.md#ai-03)), the pull request title and the [review count](#review) for them.
Their pull requests still pass every other required check, and a maintainer still decides whether they merge.
They are set under `roles.trustedBots` in the house preset.

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

An automated approval agent may approve a low-risk pull request under the [Approval Policy](APPROVAL_POLICY.md), which says what it may approve, what always goes to a maintainer, and the evidence it checks first.
Its approval never counts towards the table above.

### <a id="enforcing-review"></a>Enforcement

[smartcloud](https://github.com/Resnovas/smartcloud) counts approvals from the maintainers in the house preset and applies the table above, reporting the result as the `smartcloud / reviews` check.
The house ruleset makes the `smartcloud` check required on the default branch; it fails on any policy error, including too few approvals, and, as the aggregate check, on any other check on the pull request that fails.
Until a repository lists its main CI check under `required.expect`, keep that check required beside `smartcloud` (`settings.ruleset.statusChecks.checks`), because a restricted run from a fork or Dependabot skips the private house preset.
As soon as the preset names two or more maintainers, the ruleset also requires one approval, the minimum both columns share, and the `smartcloud` check enforces the second approval an outside contribution needs.
With a single maintainer the review gate is always open and no approval is required, so a sole maintainer is never blocked.
The owner can always bypass the ruleset, including the review gate, whatever the number of maintainers; a bypass is recorded in the pull request.

## <a id="review-bots"></a>Review bots

Review bots help the human review; they never replace it, and none of their approvals counts towards [the review requirements](#review).
Each has one job, so a pull request gets one summary and each finding comes from one place:

| Bot | Its job | Configured in |
| --- | --- | --- |
| CodeRabbit | The main line-level review: correctness, language and framework idioms, and the house rules. The only pull request summary. | `.coderabbit.yaml` |
| GitHub Copilot code review | The security and permissions pass: workflow permissions, tokens and secrets, injection, and the least-privilege fallbacks for forks, Dependabot and other outside triggers. No style comments and no summary. The house ruleset requests it on every pull request, drafts included, and again on each push. | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Qodo Merge | Checks the change against its ticket, and reviews its tests and edge cases. A few findings at most; no description and no style comments. | `.pr_agent.toml` |
| Cursor Bugbot | Logic bugs. No summary. | `.cursor/BUGBOT.md` |
| Graphify | Architecture: coupling, blast radius and module boundaries, from the committed code graph. | `.graphifyignore`, the Graphify workflow |
| Cursor approval agent | Approves low-risk pull requests under the [Approval Policy](APPROVAL_POLICY.md). | `APPROVAL_POLICY.md` |

Every bot reads the repository's `AGENTS.md` and this repository's policies, and skips the same files: vendored source under `externals/`, the code graph, build output, generated schemas and reference pages, lockfiles and changelogs.

### <a id="review-bots-blocking"></a>Which findings block

Only four kinds of finding block a merge until they are fixed, or a maintainer dismisses them with a reason:

- a security finding from Copilot code review;
- a CodeRabbit comment marked major or critical;
- a failing Graphify gate;
- Qodo reporting that the change does not match its ticket.

Everything else a bot says is advisory. The author fixes it or replies, and the conversation is resolved before merging, but it does not block on its own.
No bot's own check is a required status check; the rules above are applied by the reviewers and the [Approval Policy](APPROVAL_POLICY.md#ap-31).

CodeRabbit only reviews repositories its plan covers, such as open source ones.
Elsewhere its configuration is synced but inert, and Copilot code review and Cursor Bugbot carry the line-level review.

## <a id="merging"></a>Merging

History on the default branch is linear and every commit on it is signed.
Merge commits are disabled.
Pull requests merge through a merge queue.
**Merge when ready** on the pull request page, or `gh pr merge`, queues a pull request once its reviews and required checks pass.
The queue runs the required checks again on the pull request combined with the latest default branch and every pull request queued ahead of it, and lands it only when they pass.
A pull request that fails in the queue is removed from it, and the ones behind it are tested again without it.

The queue squashes each pull request into one commit, which GitHub signs, and keeps every commit message in its body, so each `Signed-off-by`, `Co-authored-by` and `Assisted-by` trailer survives.
It does not rebase: GitHub cannot sign the commits it rewrites that way, and every commit on the default branch must be signed.

**Batch pull requests.** Related work is batched into one pull request with one commit per issue, rather than a pull request per issue, because each pull request re-runs every check:

- **Every commit must stand on its own:** one change, a Conventional Commits message, its own trailers, and a signature.
- **Squash fix-ups, review responses and work in progress into the commit they belong to before review,** not at merge time.
- **Once the owner has reviewed and approved it,** the batch lands as an *owner fast-forward*: its signed commits are pushed onto the default branch unchanged, with the owner's ruleset bypass, after the full checks pass on top of the current default branch. Each issue keeps its own signed commit, and the pull request is closed with a link to them.

Branches can be updated from the pull request page, and head branches are deleted once merged.

## <a id="settings"></a>Repository settings

Every repository is configured to the same baseline, applied automatically by smartcloud from the house preset (see the [house repository](https://github.com/Resnovas/.github) README):

- merging as above, with sign-off required on web commits and the wiki disabled, because documentation is published elsewhere;
- Discussions, sponsorships and release immutability enabled;
- private vulnerability reporting, the dependency graph, Dependabot alerts, security updates and grouped version updates;
- CodeQL code scanning with Copilot Autofix, a dependency review of every pull request, an OpenSSF Scorecard of the default branch, and on public repositories secret scanning with push protection;
- GitHub Actions with a read-only workflow token by default, which may still open pull requests, and on private repositories reusable workflows shared across the organisation;
- a ruleset on the default branch requiring linear history, signed commits, a merge queue and a pull request (with approvals as above, stale approvals dismissed, conversations resolved and an extra approval for Copilot pull requests opened on no one's behalf), blocking deletion and force pushes, requiring the status checks up to date, requesting Copilot code review on every push and on drafts, and blocking merges on serious code scanning findings, code quality errors and open secret scanning alerts for provider patterns;
- where a repository opts in: successful deployment to its pre-production environment, ESLint code scanning results, and line coverage of at least 80% dropping no more than 5 points;
- the CodeQL merge gate, which is `true` here: while it is `true`, a pull request cannot merge with a new CodeQL error or a high or critical security alert;
- deployment environments for what the repository ships: Production, Staging and Development for software as a service; Windows, Linux and macOS with a Beta of each for desktop applications; Release for libraries. This repository ships as `library`, with the environments `that its project type implies`.

One setting has no API and is set by hand: pushes are limited to updating five branches or tags at once.

## <a id="synced-files"></a>Synced files

The governance documents, templates and shared configuration are synced from [Resnovas/.github](https://github.com/Resnovas/.github).

- **Documents** (the Markdown documents at the root and `LICENSE`) are synced whole, except the [Approval Policy](APPROVAL_POLICY.md), whose house rules sit in a managed block so a repository can add its own after them.
- **Configuration** (`CODEOWNERS`, `dependabot.yml`, `FUNDING.yml`, the issue forms and their `config.yml`, the pull request template, `.github/smartcloud.yml`, the smartcloud and Graphify workflows, and the review bot configuration) contains a block between `house:managed:begin` and `house:managed:end`.
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
