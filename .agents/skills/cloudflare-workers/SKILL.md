---
name: cloudflare-workers
description: Cloudflare-published guidance for generating Workers code: service selection (KV, Durable Objects, D1, R2, Hyperdrive, Queues, Vectorize, Workers AI), WebSocket hibernation, agents SDK, wrangler configuration, and Workers security practices. Use when writing or reviewing Cloudflare Workers code, choosing between Cloudflare storage/compute services, or configuring wrangler.
---
# Cloudflare Workers vendor routing

A routing layer over Cloudflare's published Workers system prompt: which
storage or compute service to use, wrangler configuration, WebSocket
hibernation, the Agents SDK, and Workers security practice.

**Posture: routing only.** Cloudflare maintains a 40 KB prompt file and keeps
it current. Fetch that; this page carries the house overrides, which matter
more here than for most vendors because the vendor prompt is written for a
standalone code-generation bot rather than for a team codebase.

## The two rules that bite hardest

1. **Four of the vendor prompt's instructions are written for its own bot,
   not for us.** "Keep all code in a single file", "minimize external
   dependencies" as an absolute, "always output complete files, never diffs",
   and "focus exclusively on Cloudflare solutions" all conflict with house
   architecture. Read the platform knowledge, ignore those four. The full
   list is below.
2. **Service selection is an architecture decision, not a vendor default.**
   The `<cloudflare_integrations>` section is an excellent map of what each
   service does; it is not a mandate to solve every problem inside
   Cloudflare.

## Source

Cloudflare's published system prompt at
<https://developers.cloudflare.com/workers/prompt.txt> (roughly 40 KB,
maintained by Cloudflare). None of this came from Context7; the vendor's own
prompt.txt was the better source and was used directly.

## How to use

Fetch the prompt and treat these sections as authoritative platform
knowledge:

- `<cloudflare_integrations>` - which service for which need: KV, Durable
  Objects, D1, R2, Hyperdrive, Queues, Vectorize, Analytics Engine, Workers
  AI, Browser Rendering, Static Assets
- `<configuration_requirements>` - wrangler.jsonc rules
- `<security_guidelines>` - never bake in secrets, validate requests
- The WebSocket hibernation API and the Agents SDK patterns

Cloudflare also publishes <https://developers.cloudflare.com/llms.txt> as a
docs index, and the installed Cloudflare MCP server gives live docs access.
Prefer the MCP server for API detail.

## House overrides

Vendor instructions deliberately not adopted:

1. **"Keep all code in a single file unless otherwise specified"** - house
   style is Nx module boundaries. Structure a Worker like any other module.
2. **"Minimize external dependencies" taken as absolute** - Effect-TS is the
   foundation here. The guideline still applies to incidental dependencies.
3. **Output-format rules** ("always output complete files, never diffs") -
   those govern their bot, not our workflow.
4. **Behaviour guidelines** ("focus exclusively on Cloudflare solutions") -
   see rule 2 above.

The secrets rule aligns rather than conflicts: Cloudflare also says never
bake in secrets. Here they resolve from a secret manager at run time.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/cloudflare-workers/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `coding-preferences` - the module-boundary and dependency positions that
  override the vendor prompt.
- `vendor-llms-indexes` - Cloudflare's llms.txt and the rest of the vendor
  docs directory.
- `typescript-reviewer` - reviewing the Worker once written.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this thin: a pointer, the section map, and the override list. Re-fetch
the prompt when refreshing, and check whether the four overridden
instructions are still present and still worded the same way. Prefer the
smallest edit primitive (`edits`) over a full body replace, and chain
`base_version`.