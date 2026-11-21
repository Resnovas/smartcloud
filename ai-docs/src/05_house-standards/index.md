<!-- house:managed:begin - synced from Resnovas/.github templates/ai-docs/src/05_house-standards/index.md. Edits inside this block are overwritten. -->
## House standards

Use `AGENTS.md` for authority, tool routing and handoff requirements, `AI_POLICY.md` for contribution policy, and the applicable `.agents/skills/` source for engineering decisions. Do not copy those rules into feature documentation.

The funnel is code examples, corrective static checks, executable verification, minimal agent guidance, then human decisions. The adoption contract and commands are in `docs/house-funnel.md`. Preserve existing repository checks when adding shared tooling; a parser or lint pass is not semantic proof.

Read package scripts and CI before reporting verification. Pre-commit runs only `verify:static` then staged `test:affected`; full `verify`, smoke and evidence collection run in PR and main-push CI. `check` alone need not include either gate. Feature guides remain canonical Markdown; executable examples and registry entries must agree with reached public paths. Record only affected-feature evidence using synthetic data, the existing artifact audience and seven-day retention.

For an existing native hook, declare its exact package `script` and comment `marker` in local `.agents/surfaces.jsonc` `preCommit`; setup preserves matching bytes and refuses other hooks. Follow the complete example in `docs/house-funnel.md#retain-a-repository-owned-hook`. The native runner owns static/affected execution, alternate-index isolation and snapshot/failure proof; registration does not certify those semantics.

Sections numbered from 10 describe this repository's features and compiling examples. Update the corresponding people guide alongside them, and regenerate `LLMS.md` with `node tools/ai-docs/docgen.mjs`.
<!-- house:managed:end -->
<!-- house:local - add this repository's own standards below this line. -->
