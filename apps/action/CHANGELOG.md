# 2.0.0 (2026-10-11)

### Features

- **commits:** assistedBy toggle, unassisted AI level and the synced house tools ([#719](https://github.com/Resnovas/smartcloud/pull/719))
- **sync:** read the template source from one archive per run ([#718](https://github.com/Resnovas/smartcloud/pull/718))
- token split, auto-merge, release preview, setup guides and pattern safety ([#714](https://github.com/Resnovas/smartcloud/pull/714))
- **sync:** a placeholder may carry a default, written {{KEY:-default}} ([eb11eee9](https://github.com/Resnovas/smartcloud/commit/eb11eee9))
- **commands:** answer slash commands in comments ([999141fd](https://github.com/Resnovas/smartcloud/commit/999141fd))
- **notifications:** send policy failures and stale items to Slack, Discord and Linear ([26232a70](https://github.com/Resnovas/smartcloud/commit/26232a70))
- **cli:** smartcloud doctor ([14c7e3ee](https://github.com/Resnovas/smartcloud/commit/14c7e3ee))
- **backport:** open cherry-pick pull requests to release branches by label ([#693](https://github.com/Resnovas/smartcloud/pull/693))
- **lock:** lock threads once they have been closed for N days ([#692](https://github.com/Resnovas/smartcloud/pull/692))
- **reviews:** add reviewer assignment strategies ([#691](https://github.com/Resnovas/smartcloud/pull/691))
- **codeowners:** validate CODEOWNERS and generate it from config ([#690](https://github.com/Resnovas/smartcloud/pull/690))
- **branches:** a branch naming policy for pull requests ([#689](https://github.com/Resnovas/smartcloud/pull/689))
- **freeze:** merge freeze windows ([#688](https://github.com/Resnovas/smartcloud/pull/688))
- **conditions:** dependencyUpdateType for Dependabot and Renovate updates ([#687](https://github.com/Resnovas/smartcloud/pull/687))
- **conditions:** createdBefore and timeWindow for dates and times ([#686](https://github.com/Resnovas/smartcloud/pull/686))
- **conditions:** commentMatches and reactionCount ([#685](https://github.com/Resnovas/smartcloud/pull/685))
- **conditions:** lockfileChanged, fileCount and binaryFilesAdded ([#684](https://github.com/Resnovas/smartcloud/pull/684))
- **conditions:** commitsVerified for signed commits ([#683](https://github.com/Resnovas/smartcloud/pull/683))
- **conditions:** codeownersTouched for changes to a team's files ([#682](https://github.com/Resnovas/smartcloud/pull/682))
- **conditions:** linksIssue for pull requests tied to an issue ([#681](https://github.com/Resnovas/smartcloud/pull/681))
- **conditions:** hasMilestone and milestoneMatches ([#680](https://github.com/Resnovas/smartcloud/pull/680))
- **conditions:** hasAssignee, assigneeMatches and reviewerMatches ([#678](https://github.com/Resnovas/smartcloud/pull/678))
- **conditions:** authorAssociation for newcomers, collaborators and bots ([#677](https://github.com/Resnovas/smartcloud/pull/677))
- **settings:** stronger default-branch ruleset ([#635](https://github.com/Resnovas/smartcloud/pull/635))
- **conditions:** baseBranchMatches for the pull request's target branch ([#658](https://github.com/Resnovas/smartcloud/pull/658))
- **conditions:** checksPass and checkStatus for named CI checks ([#646](https://github.com/Resnovas/smartcloud/pull/646))
- **conditions:** isApproved can count approvals while reviews are pending ([#642](https://github.com/Resnovas/smartcloud/pull/642))
- **conditions:** hasConflict for pull requests with merge conflicts ([#637](https://github.com/Resnovas/smartcloud/pull/637))
- **required:** fail closed on missing expected checks and a missing check run ([#668](https://github.com/Resnovas/smartcloud/pull/668))
- **required:** one aggregate "all required" check ([#645](https://github.com/Resnovas/smartcloud/pull/645))
- **labels:** built-in XS to XL size labels ([#638](https://github.com/Resnovas/smartcloud/pull/638))
- **reporting:** show config left out of a restricted run in the check runs ([#660](https://github.com/Resnovas/smartcloud/pull/660))
- **settings:** Actions, access, webhooks, Pages and variables as code ([#644](https://github.com/Resnovas/smartcloud/pull/644))
- **release:** write workspace and app changelogs, and bring them to main ([#659](https://github.com/Resnovas/smartcloud/pull/659))
- **telemetry:** track every failure with source maps, and add product analytics ([#626](https://github.com/Resnovas/smartcloud/pull/626))
- **telemetry:** trace, log and measure every feature and GitHub call ([#622](https://github.com/Resnovas/smartcloud/pull/622))
- **telemetry:** report runs to PostHog and put every feature behind a flag ([#621](https://github.com/Resnovas/smartcloud/pull/621))
- **mcp:** add the smartcloud MCP server ([#613](https://github.com/Resnovas/smartcloud/pull/613))
- **cli:** dry-run, plan settings and sync on a shared runtime ([#612](https://github.com/Resnovas/smartcloud/pull/612))
- **action:** run every feature as the v2 GitHub Action ([#607](https://github.com/Resnovas/smartcloud/pull/607))
- **sync:** keep synced files in step with their templates ([#606](https://github.com/Resnovas/smartcloud/pull/606))
- **settings:** apply repository settings, security and the branch ruleset ([#605](https://github.com/Resnovas/smartcloud/pull/605))
- **stale:** mark stale and abandoned issues and pull requests on schedule ([#604](https://github.com/Resnovas/smartcloud/pull/604))
- **labels:** sync repository labels and apply labelling rules ([#603](https://github.com/Resnovas/smartcloud/pull/603))
- **reviews:** add the review gate, approval requests and automatic approve ([#602](https://github.com/Resnovas/smartcloud/pull/602))
- **disclosure:** require the AI disclosure in pull request descriptions ([#601](https://github.com/Resnovas/smartcloud/pull/601))
- **commits:** check sign-off and AI attribution on every commit ([#600](https://github.com/Resnovas/smartcloud/pull/600))
- **conventions:** enforce title conventions on pull requests and issues ([#599](https://github.com/Resnovas/smartcloud/pull/599))
- **cli:** add the smartcloud command with validate and migrate ([#598](https://github.com/Resnovas/smartcloud/pull/598))
- **reporting:** publish runs as check runs, a summary, annotations and one comment ([#597](https://github.com/Resnovas/smartcloud/pull/597))
- **engine:** normalise GitHub events and run features in isolation ([#596](https://github.com/Resnovas/smartcloud/pull/596))
- **integrations.github:** add the GitHub service with live, dry-run and in-memory layers ([#595](https://github.com/Resnovas/smartcloud/pull/595))
- **config:** add the v2 config schema, extends with locked presets and v1 migration ([#594](https://github.com/Resnovas/smartcloud/pull/594))
- **conditions:** add the condition language and a pure evaluator ([#592](https://github.com/Resnovas/smartcloud/pull/592))

### Bug fixes

- **release:** read the POSTHOG_CLI_API_KEY organization secret ([#636](https://github.com/Resnovas/smartcloud/pull/636))
- **required:** stale and overlapping runs, checks token and check ownership ([#653](https://github.com/Resnovas/smartcloud/pull/653))
- **settings:** never write a setting the repository already has ([#666](https://github.com/Resnovas/smartcloud/pull/666))
- **config:** drop unknown keys and invalid values with a warning instead of failing the run ([#664](https://github.com/Resnovas/smartcloud/pull/664))
- **config:** only drop sections a skipped preset could have completed ([#651](https://github.com/Resnovas/smartcloud/pull/651))
- **access:** least-privilege fallback on fork, Dependabot and external runs ([#639](https://github.com/Resnovas/smartcloud/pull/639))
- **security:** let only the default branch and release tags deploy to protected environments ([#616](https://github.com/Resnovas/smartcloud/pull/616))
- **security:** trust marker comments only from bots and trusted accounts ([#615](https://github.com/Resnovas/smartcloud/pull/615))

### Performance

- **github:** reuse unchanged responses and report the API calls a run makes ([23e027c9](https://github.com/Resnovas/smartcloud/commit/23e027c9))

### Documentation

- exhaustive ELI5 guides for every feature, option, preset and workflow ([09e4322a](https://github.com/Resnovas/smartcloud/commit/09e4322a))
- **ai-docs:** generate LLMS.md for agents from ai-docs, and check it in CI ([f496870e](https://github.com/Resnovas/smartcloud/commit/f496870e))
- **governance:** approval policy for approval agents ([e7b203b1](https://github.com/Resnovas/smartcloud/commit/e7b203b1))
- Mintlify docs, a generated configuration reference, and the Docusaurus site retired ([#610](https://github.com/Resnovas/smartcloud/pull/610))

### Thank you

- Jonathan S @TGTGamer
- Jonathan Stevens @TGTGamer
