# Provenance

Vendored from [jakubkrehel/skills](https://github.com/jakubkrehel/skills/tree/d574cc8a576dc24256ad38268b8d03d86724a1b3/skills/better-accessibility) at commit `d574cc8a576dc24256ad38268b8d03d86724a1b3`, MIT licence (see `LICENSE`).

Local changes:

- Description widened for audits and reviews, with licence and upstream pin added to the frontmatter.
- Reference files moved into `references/` and links updated.
- References to the sibling skills (`better-colors`, `better-typography`, `better-layout`, `better-writing`, `better-ui`, `better-interface`), which are not vendored, replaced with the `web-accessibility` skill or the rule itself.
- House rule: heading outline problems (no `h1`, several `h1`s, skipped levels) are reported as `MEDIUM` instead of recommendations.
- The Codex `agents/openai.yaml` display file was left out.

To update, diff the upstream folder against the pinned commit and re-apply these changes.
