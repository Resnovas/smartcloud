---
name: terraform-vendor
description: HashiCorp-published style guidelines for writing Terraform - formatting, resource naming, variable and output conventions, module structure, state handling, and the vendor's example AGENTS.md for Terraform repositories. Use when writing or reviewing .tf/.hcl files or setting up agent context for a Terraform repository.
---
# Terraform vendor routing

A routing layer over HashiCorp's published Terraform style guidance, plus the
house overrides. Covers formatting, resource naming, variable and output
conventions, module structure and state handling.

**Posture: routing only.** The authoritative style baseline is HashiCorp's
file, not this page. Fetch it when working in a Terraform repository.

## The two rules that bite hardest

1. **Never replace an existing `AGENTS.md`.** HashiCorp intends its example
   to be committed as `AGENTS.md` beside the Terraform configuration. If the
   repository already has one, merge; do not overwrite. Inspect, preserve,
   merge.
2. **Reject any vendor example that puts cloud credentials in backend config
   or an env file.** House rule: secrets live in a secret manager and resolve
   at run time. This is the most common thing to copy across by accident,
   because the vendor examples are otherwise good.

## Source

HashiCorp's published example AGENTS.md in the terraform-mcp-server repo:
<https://github.com/hashicorp/terraform-mcp-server/blob/main/instructions/example-AGENTS.md>
(frontmatter `applyTo: "**/*.{tf,hcl}"`). None of this came from Context7;
the vendor file was the better source and was used directly.

Terraform publishes this rather than an `llms.txt`.

## How to use

When working in a Terraform repository, fetch
<https://raw.githubusercontent.com/hashicorp/terraform-mcp-server/main/instructions/example-AGENTS.md>
and apply it as the style baseline for `.tf` and `.hcl` files. Commit it into
an actual Terraform repository, not into an agent or knowledge library.

For provider and resource API detail, use the Terraform MCP server's registry
lookup rather than memory.

## House overrides

Vendor instructions deliberately not adopted:

1. **Committing `AGENTS.md` wholesale**: see rule 1 above.
2. **State and credential examples**: see rule 2 above.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/terraform-vendor/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `vendor-llms-indexes` - the directory of vendor docs endpoints, which
  records that Terraform ships this AGENTS.md instead of an llms.txt.
- `database-reviewer` - when the Terraform provisions Postgres and the schema
  or access model also needs review.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this thin: a pointer plus a short override list. Re-fetch the source URL
when refreshing rather than trusting the summary here, and update the
override list only when a vendor instruction actually changes. Prefer the
smallest edit primitive (`edits`) over a full body replace, and chain
`base_version`.