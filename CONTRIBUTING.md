<!-- Generated from Resnovas/.github templates/CONTRIBUTING.md. Edit it there, not here. -->
# <a id="WhyTheGuidelines"></a>Contributing Guidelines

First off, thank you for considering contributing to this project.

Following these guidelines shows that you respect the time of the people who maintain it.
In return, they will respect yours: by looking at your issue, assessing your change, and helping you get your pull request finished.
These guidelines exist so that everyone works from the same information.

## <a id="BeforeYouStart"></a>Before you start

- Do not use the issue tracker for support questions.
See [Support](SUPPORT.md) for where to ask.
- Search open **and closed** issues and pull requests before opening a new one, and say what you searched for.
- Read the [AI Contribution Policy](AI_POLICY.md) if an AI tool touched any part of your work, and read it anyway if you are unsure.
- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
Taking part means you agree to it.

## <a id="SecurityIssues"></a>Security issues

To work out whether you are dealing with a security issue, ask yourself two questions:

- Can I access something that is not mine, or something I should not have access to?
- Can I disable something for other people?

If the answer to either is "yes", you are probably dealing with a security issue.
Even if both answers are "no", you may still be, so if you are unsure, treat it as one.

**Never report a security issue in a public issue.**
Follow [the Security Policy](SECURITY.md) instead.

## <a id="dco"></a>Developer Certificate of Origin

This project does **not** use a Contributor Licence Agreement.
Every contribution is made under the [Developer Certificate of Origin 1.1](DCO.md) (DCO), and there is nothing to sign in advance.

You certify the DCO by adding a `Signed-off-by` trailer, with your real name and the email address of the commit author, to **every** commit:

```shell
git commit -s
```

```
feat(billing): add proration preview

Signed-off-by: Jane Doe <jane@example.com>
```

- The sign-off applies to every contribution, however small.
There is no size below which it is not needed.
- The address in the sign-off **must** match the commit author's address, or the check fails.
- By signing off you also certify any part of the commit an AI tool produced.
An AI tool **never** signs off; see [AI-03](AI_POLICY.md#ai-03).
- If you forgot, add it to existing commits with `git rebase --signoff main` and force-push your branch.
- Commits made in the GitHub web interface are signed off automatically; the repository requires it.

Contributions are licensed under the project's [licence](LICENSE) (FCL-1.0-MIT unless the repository says otherwise).
Licence breaches, including those that come from AI-produced material, are cured through the [Cooperation Commitment](COOPERATION_COMMITMENT.md).

## <a id="AiAssisted"></a>AI-assisted contributions

AI tools are allowed, and a human is always accountable for what they produce.
The full rules are in the [AI Contribution Policy](AI_POLICY.md); these are the parts you will meet first:

- Declare the autonomy level (`unassisted`, `autocomplete`, `chat`, `agent` or `autonomous`) and the tools on every issue and pull request.
- Credit each AI tool that materially changed a commit with a `Co-authored-by` trailer, and sign off yourself.
- Open AI-assisted pull requests as drafts, and mark them ready only once you have reviewed and run every change yourself.
- Reply to reviewers in your own words.

## <a id="Responsibilities"></a>Responsibilities

- Ensure every change you submit works on every platform the project supports.
- Ensure your change meets every requirement in [Code standards](#Standards).
- Create each contribution on its own branch, so releases can follow [Semantic Versioning](https://semver.org/).
- Be welcoming to newcomers, and encourage contributors from every background.

## <a id="Issues"></a>Issues

### <a id="BugReports"></a>Bug reports

Use the bug report form.
A bug report **must**:

- reproduce the problem on the production branch, not a fork or an old release;
- give the exact released version as published (for example `v1.4.2`), or the full commit SHA if the problem is in unreleased code;
- list the exact steps to reproduce it;
- say where it happens: the operating system, the runtime version and the package or surface involved;
- include logs, and a recording or screenshots.

Stack traces, versions and identifiers must be copied from what you actually ran, and must match what is published.
A report with no reproduction will be slowed down, or closed for lack of evidence.

### <a id="FeatureRequests"></a>Feature requests

Use the feature request form.
Say what problem you have and what you propose, briefly.
A short, clear request is read sooner than a long one.

### <a id="DocumentationIssues"></a>Documentation

Use the documentation form when a page is wrong, out of date, missing or hard to follow.
Name the page, quote what is wrong, and say what it should say instead and what makes that right (the code, a specification or a release note).
A typo or a small fix is quicker as a pull request.

### <a id="PerformanceIssues"></a>Performance problems

Use the performance form when something works but is too slow or uses too much memory, CPU or network.
Give the version, the exact steps anyone can repeat, the numbers you measured over several runs and how you measured them, what you expected and why, and the environment you ran on.
A report without measurements cannot be checked, and will be slowed down or closed for lack of evidence.

## <a id="PullRequests"></a>Pull requests

### <a id="pr-title"></a>Titling your pull request

Pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), because the merge queue squashes a pull request and its title becomes the commit that drives the changelog and releases. Write each commit's message the same way: the squash keeps them in its body, and a maintainer's batch pull request lands its commits as they are.
The check fails if the title does not follow it.

Use one of `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `style` or `revert`, with a scope where one applies: `fix(auth): reject expired tokens`.

### <a id="BranchPrefixes"></a>Branch prefixes

Name your branch after the kind of change:

- Chore: `chore/`
- Enhancement: `enhance/`
- Feature: `feat/`
- Documentation: `docs/`
- Bug: `fix/`
- Optimisation: `opt/`
- Deprecation: `dep/`
- Refactor: `ref/`
- Style: `style/`

If the work is tracked in an issue, include the issue number: `fix/142-expired-tokens`.

### <a id="Commits"></a>Commits

- One logical change per commit.
A single commit that mixes unrelated changes is rejected outright.
- Commit messages follow Conventional Commits, in the imperative mood: "add", not "added".
- Every commit is signed off ([Developer Certificate of Origin](#dco)).

### <a id="Description"></a>Describing your change

The pull request template has four parts: what changed and why, the evidence, context (only if needed), and the AI disclosure.

- Describe the code in the pull request, and nothing else.
No conversation history, prompts, or background the code does not need.
- Keep the description shorter than the diff, and do not restate the diff line by line.
- Evidence means the exact commands you ran and their output, or a link to the CI run.
A tick or "it works" is not evidence.
See [evidence by type of change](AI_POLICY.md#evidence).
- No emoji, and no scattering of em dashes and en dashes.
Write plainly; imperfect is fine.
- No checklists.

### <a id="DraftPullRequest"></a>Draft pull requests

Open a draft when the work is not ready for review.
Draft pull requests cannot be merged, and code owners are not asked to review them.
AI-assisted pull requests **must** be opened as drafts, and leave draft only when you have reviewed them yourself ([AI-21](AI_POLICY.md#ai-21)).

## <a id="Standards"></a>Code standards

### <a id="Tests"></a>Tests

- Never delete, skip or weaken an existing test to make a change pass.
Fix the code instead.
Doing so leads to a permanent ban ([AI-11](AI_POLICY.md#ai-11)).
- Line and branch coverage must not fall below 90%.
Most repositories expect 100%.
- Every bug fix comes with a regression test that fails before the fix and passes after it.
- CI retries a failed test and reports every test that passed only on a retry as flaky, in a warning annotation and the job summary.
A flaky test is a bug: fix the test or the code it exercises, rather than relying on the retry.
Locally, tests run once.

### <a id="Dependencies"></a>Dependencies

Do not add a dependency a maintainer has not already approved for the change.
Ask in the issue first.

### <a id="ModuleBoundaries"></a>Module boundaries

Module boundaries are enforced, and cross-component pollution is closely watched.

- The **core** package holds domain-agnostic building blocks only.
- Vendor SDKs, API clients and service-specific configuration belong in `@resnovas/integrations.<vendor>`.
- Features depend on core and integrations, never the other way round.

A change that breaks these boundaries has to be refactored by the submitter before review continues, so it pays to get it right the first time.

### <a id="Comments"></a>Code comments

Comment the code throughout, but make every comment earn its place.
Explain why the code is the way it is: constraints, trade-offs, and anything surprising.
Do not repeat what the code already says.

### <a id="Quality"></a>Quality over speed

Code quality is never traded for speed.
Linting, type checking and tests must pass locally before you ask for review.

### <a id="CodeGraph"></a>Code graph

Repositories that contain `tools/graphify/graphify` commit a [Graphify](https://github.com/Graphify-Labs/graphify) knowledge graph of their code in `graphify-out/graph.json`.
You and your tools can query it to find what a change touches, without reading the whole codebase.
Everything runs on your machine: building the code graph uses local parsers only, with no model, no network and no cost.

1. Install [uv](https://docs.astral.sh/uv/).
1. Run `sh tools/graphify/graphify setup` once in your clone.
This installs the latest Graphify release, which it keeps up to date, and git hooks that keep the graph current.
1. Ask questions with `sh tools/graphify/graphify query "<question>"`.
1. After changing code, run `sh tools/graphify/graphify update` and commit the changes under `graphify-out/` in the same pull request.

A stale graph never blocks a pull request: CI reports it, and the default branch refreshes itself.
AI agents find the full instructions in `.agents/skills/graphify/SKILL.md`.

## <a id="MinorContributions"></a>Minor contributions

Small changes that add no new functionality or creative thinking, such as spelling fixes, typos, white space, comment clean-up, log messages, or moving files, are welcome as minor patches.
They follow the same process and still need a sign-off ([Developer Certificate of Origin](#dco)).

## <a id="CodeReviewProcess"></a>Code review process

Once you open a pull request, automated checks run:

- **House policy:** AI disclosure, co-author and sign-off trailers, and the pull request title. The [trusted bots](GOVERNANCE.md#trusted-bots) (`dependabot[bot], renovate[bot], github-actions[bot], resnovas-smartcloud[bot]`) skip these.
- **Build and test:** build, lint, type check and tests for everything the change affects.
- **Security and quality:** the security and code quality scans configured for the repository.
- **Automated review:** AI and analysis tools review the change, including drafts.
Treat their comments as seriously as a person's, and reply if you disagree.

Then a maintainer (`TGTGamer`) reviews it.
The number of human approvals needed is set in [the governance document](GOVERNANCE.md#review): two maintainers for an outside contribution once a project has two or more maintainers.
Code owners for the files you changed are asked to review as well.

A human reviewer's comment gets a reply from you, in your own words, even if the fix itself was produced with an AI tool.

When every required review is in, a maintainer adds the pull request to the merge queue, which runs the required checks once more with the latest default branch and the pull requests queued ahead of it, then squashes it; merge commits are disabled.
A maintainer may queue it before the last check passes, and it joins the queue as soon as they do.
If it fails in the queue it is removed, and it can be queued again once fixed.
See [merging](GOVERNANCE.md#merging) for how the queue works and what it asks of each commit; the head branch is deleted automatically after the merge.

### <a id="ReviewTools"></a>Known review tools

These tools may comment on your pull request.
They are the only AI reviews allowed without a maintainer asking ([AI-15](AI_POLICY.md#ai-15)).
Not every repository uses all of them.
Which of their findings block a merge, and which are advisory, is set out in [the governance document](GOVERNANCE.md#review-bots).

| Tool | What it does |
| --- | --- |
| CodeRabbit | The main line-level AI review and the only pull request summary. |
| GitHub Copilot code review | The security and permissions review of every pull request, drafts included, and again on each push. |
| Qodo Merge | Checks the change against its ticket, and reviews its tests and edge cases. |
| Cursor Bugbot | Looks for logic bugs. |
| Cursor approval agent | Approves low-risk pull requests under the [Approval Policy](APPROVAL_POLICY.md). |
| Graphify | Architecture review from the committed code graph: coupling, blast radius and module boundaries. |
| GitHub code scanning (CodeQL) with Copilot Autofix | Security and quality analysis; high or critical findings block the merge, and Autofix suggests fixes. |
| GitHub secret scanning | Blocks pushes containing credentials, including AI-detected generic secrets. |
| Dependabot | Dependency alerts, and grouped security and version update pull requests. |
| SonarQube Cloud (formerly SonarCloud) | Code quality and coverage analysis. |
| Sweep | AI suggestions against the repository's coding rules. |

## <a id="firstProject"></a>Your first contribution

Working on your first pull request?
The free series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github) walks you through it.
If a maintainer asks you to "rebase", a lot has changed on the main branch since you started, and you need to update your branch so it can be merged.

Everyone is a beginner at first.
Ask for help whenever you need it.
