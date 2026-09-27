<!-- house:managed:begin - synced from Resnovas/.github templates/APPROVAL_POLICY.md. Edits inside this block are overwritten. -->
# <a id="top"></a>Approval Policy

This policy tells an automated approval agent, such as the [Cursor approval agent](https://cursor.com/docs/approval-agents#approval-policy-files), which pull requests it may approve on its own, which always go to a human maintainer, and what it must check first.
The agent reads this file because it is named `APPROVAL_POLICY.md` and sits at the root, so it applies to every changed file in the repository.
A more specific `APPROVAL_POLICY.md` in a subdirectory may add rules for the files under it; it cannot relax a rule here.

The key words **MUST**, **MUST NOT**, **MAY** and **SHOULD** are used as in the [AI Contribution Policy](AI_POLICY.md#keywords).
Every rule has an identifier, so a decision can cite the rule it rests on.

## <a id="precedence"></a>How this policy fits with the others

This file adds nothing to what a contributor must do; it states how an agent applies the house rules.
It links to them rather than repeating them, and when they disagree, the first of these wins:

1. [GOVERNANCE.md](GOVERNANCE.md): roles, review requirements and merging.
1. This file.
1. The repository's `AGENTS.md`, and `AGENT-SETUP.md` where there is one: how the repository is built and tested.

The [AI Contribution Policy](AI_POLICY.md), the [Contributing Guidelines](CONTRIBUTING.md), the [Developer Certificate of Origin](DCO.md), the [Cooperation Commitment](COOPERATION_COMMITMENT.md) and the [Security Policy](SECURITY.md) set the evidence this file asks for.
Where this file and one of them seem to disagree, the agent follows the stricter reading and asks a human.

### <a id="ap-01"></a>AP-01: An agent's approval never replaces a human review

Every pull request is reviewed by a human before it merges ([GOVERNANCE.md](GOVERNANCE.md#review)).
An approval agent's approval states that the pull request is low risk and its evidence is complete.
It **MUST NOT** be counted as a maintainer's approval, and it never merges, enables auto-merge or bypasses a ruleset.

### <a id="ap-02"></a>AP-02: Changes to this policy use the base branch's version

A pull request that changes this file, or any other `APPROVAL_POLICY.md`, is judged by the version on the base branch, and always needs a human maintainer ([AP-20](#ap-20)).

## <a id="risk"></a>Risk levels

The agent grades each pull request by its riskiest changed file.

| Level | Meaning | What the agent does |
| --- | --- | --- |
| Low | Only the changes in [AP-10](#ap-10). | Approves when every item in [the evidence](#evidence) holds. |
| Medium | Only the changes in [AP-11](#ap-11). | Approves when every item in the evidence holds and nothing in [AP-11](#ap-11) is uncertain. |
| High | Anything in [AP-20](#ap-20), or anything this file does not name. | Does not approve. Leaves a non-blocking comment giving the level and the rule, and requests review from a maintainer. |

When the agent cannot tell which level applies, it **MUST** choose the higher one.

## <a id="approve"></a>What an agent may approve alone

### <a id="ap-10"></a>AP-10: Low risk

- **Documentation only:** Markdown and documentation pages, and code comments, that change no behaviour, no configuration and no document named in [AP-20](#ap-20).
- **Tests only:** new or extended tests that do not delete, skip or loosen an existing test ([AI-11](AI_POLICY.md#ai-11)).
- **Generated files that match their generator:** a lockfile, schema, reference page or code graph, when the pull request also contains the change that produced it and the repository's check that regenerates it passes.

### <a id="ap-11"></a>AP-11: Medium risk

- **Dependency updates, patch or minor:** from Dependabot, Renovate or a person, within the same major version, with the lockfile updated and every required check green. The update **MUST NOT** add a new dependency ([AI-12](AI_POLICY.md#ai-12)); a new one needs a maintainer.

## <a id="human"></a>What always needs a human maintainer

### <a id="ap-20"></a>AP-20: High risk

The agent **MUST NOT** approve a pull request that changes any of these, whatever else it contains:

- **Workflows and automation:** anything under `.github/workflows/`, and actions, scripts or tools that run in CI.
- **Permissions and tokens:** workflow `permissions`, token scopes, `ACCESS_TOKEN` and its fallback to `github.token`, and anything run by a fork, Dependabot or another outside trigger, which must drop to the least access that works.
- **Secrets:** any secret, credential, key or environment value, or code that reads, stores or sends one.
- **The licence and headers:** `LICENSE`, licence headers in source files, and the tool that checks them.
- **Governance and policy:** every file synced from Resnovas/.github, including this one, `AGENTS.md`, `AGENT-SETUP.md`, `CODEOWNERS` and `.github/smartcloud.yml`. In Resnovas/.github this includes their sources under `templates/`, `house.yml` and the preset in `smartcloud/`.
- **Release configuration:** release workflows, versioning, tags, publishing and changelog tooling.
- **Repository settings and rulesets:** branch protection, rulesets, merge settings, environments and code scanning, and the configuration that applies them.
- **Security-sensitive code:** authentication, token handling, permission checks, least-privilege fallbacks, input that reaches a shell or the network, and anything the [Security Policy](SECURITY.md) covers.
- **Breaking changes:** a conventional title or commit with `!`, or a `BREAKING CHANGE` footer.
- **Major dependency updates,** and any new dependency.
- **Large vendored code:** third-party source copied into the repository.
- **Anything the AI policy flags:** a process label from [the AI policy](AI_POLICY.md#labels) on the pull request, or a submission at the `autonomous` level that its accountable human has not yet marked ready ([AI-21](AI_POLICY.md#ai-21), [AI-31](AI_POLICY.md#ai-31)).
- **Behaviour changes:** any other change to source code, however small.

## <a id="evidence"></a>Evidence required before any approval

### <a id="ap-30"></a>AP-30: Check every item

The agent **MUST** confirm each item, from the pull request itself rather than its description's claims ([AI-06](AI_POLICY.md#ai-06)):

1. **Checks:** every required status check has finished and passed, including the `smartcloud` check. A pending, skipped or cancelled required check is not a pass.
1. **Reviews:** every review thread is resolved or answered by the accountable human, and no automated reviewer ([known review tools](CONTRIBUTING.md#ReviewTools), security agents and bug finders) has an open finding.
1. **Title:** the title is a [conventional commit](CONTRIBUTING.md#pr-title).
1. **Sign-off:** every commit carries a `Signed-off-by` trailer naming a person ([DCO.md](DCO.md), [AI-03](AI_POLICY.md#ai-03)); trusted bots named in the house preset are exempt.
1. **AI disclosure:** the description declares the AI level, tools, accountable human and human review, and the commits carry the trailers, as [AI-01](AI_POLICY.md#ai-01) and [AI-02](AI_POLICY.md#ai-02) require.
1. **Issue link:** the description links the issue it resolves, in the repository's tracker.
1. **Tests:** changed behaviour has tests, and coverage stays at the repository's threshold ([Tests](CONTRIBUTING.md#Tests)).
1. **Documentation:** documentation that describes the changed behaviour is updated in the same pull request.

## <a id="blocks"></a>What blocks an approval outright

### <a id="ap-40"></a>AP-40: Never approve when

- the pull request is a draft;
- the agent, or the automation it runs in, authored the pull request or any of its commits;
- any required check fails, or any item in [AP-30](#ap-30) cannot be confirmed;
- a commit deletes, skips or weakens a test, or lowers a coverage threshold ([AI-11](AI_POLICY.md#ai-11));
- a maintainer has requested changes, or placed a hold;
- the change touches code under a licence other than the repository's ([AI-14](AI_POLICY.md#ai-14), [Cooperation Commitment](COOPERATION_COMMITMENT.md));
- the pull request mixes low-risk files with anything in [AP-20](#ap-20).

When it does not approve, the agent says which rule applied, in one or two plain sentences, and requests a maintainer's review.

## <a id="local"></a>Repository rules

The rules below are this repository's own.
They may raise a change's risk level or ask for more evidence; they cannot lower a level or waive a rule set above.
<!-- house:managed:end -->
<!-- house:local - add this repository's own approval rules below this line. -->

### <a id="smartcloud-generated"></a>Generated schema, reference and code graph

These are generated files under [AP-10](#ap-10), low risk only when they match their generator and the change that produced them is in the same pull request:

- `schema/smartcloud.schema.json`, regenerated with `SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests`; the config tests fail when it is stale.
- `docs/reference/`, regenerated with `pnpm docs:reference`; `pnpm docs:reference:check` must pass.
- `graphify-out/`, the committed code graph, refreshed by the Graphify workflow.
- `.claude/commands`, `.cursor/commands` and `.opencode/commands`, written from `.agents/prompts/` by `node tools/dev/surfaces.mjs sync`; `pnpm run check` must pass. A change to `.agents/prompts/` itself is governance under [AP-20](#ap-20).

A schema change is still a change to `packages/config`, so the pull request as a whole is high risk unless the only change is the regeneration.

### <a id="smartcloud-contracts"></a>API contracts

A pull request that changes an export of a package or app also passes the `docgen` and `contracts` targets, as [API contracts in AGENTS.md](AGENTS.md#api-contracts) requires, before any approval.
Coverage here is 100% of lines, functions and statements, not the house minimum.

### <a id="smartcloud-externals"></a>Vendored source in `externals/`

`externals/` holds upstream source vendored with `git subtree --squash` ([externals/README.md](externals/README.md)).
Nothing there is built, tested or imported, and it is reviewed by provenance, not line by line: the maintainer checks that each squashed commit pulls the upstream repository and ref the README names, and that `effect-stable` matches the `effect` version in `pnpm-workspace.yaml`.
Every change under `externals/` is high risk under [AP-20](#ap-20), and an approval agent **MUST NOT** approve it however clean its checks are.

### <a id="smartcloud-release"></a>Release and changelog pull requests from the Resnovas Bot

Releases are cut only by the `release` workflow ([docs/releasing.mdx](docs/releasing.mdx)).
A pull request from the Resnovas Bot that bumps versions, moves tags or changes what is published is release configuration, high risk under [AP-20](#ap-20).
One that only updates the changelog or release notes is documentation under [AP-10](#ap-10), and may be approved when every changed file is one the release tooling writes and every check in [AP-30](#ap-30) passes; the Resnovas Bot is exempt from the AI disclosure and sign-off items only as far as the house preset names it a trusted bot.

### <a id="smartcloud-evidence"></a>Evidence

Before any approval, the `ci` workflow's lint, typecheck, test and build jobs, `pnpm typecheck:tests`, `pnpm headers` and `pnpm docs:reference:check` pass; see [AGENTS.md](AGENTS.md#commands).
Work is tracked in Linear, so the issue link is the Linear issue (team SMC), named in the branch and the description.
