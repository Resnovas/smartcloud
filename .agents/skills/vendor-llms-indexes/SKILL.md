---
name: vendor-llms-indexes
description: Directory of vendor-published llms.txt and AI docs endpoints for the MCP vendors in use: Stripe, PostHog, Cloudflare, Neon, Canva, Vercel, Next.js, Convex, Apify, Grafana, Ramp, Base44, Fiscal.ai, Consensus, DeepWiki/Devin, LottieFiles, Storybook, Clerk, AgentGrade, TalkToHumans. Use when you need authoritative current docs for one of these vendors and their MCP server or context7 does not cover the question.
---
# Vendor llms.txt directory

A directory of vendor-published `llms.txt` and AI-docs endpoints, for getting
authoritative current documentation when a vendor's MCP server and Context7
both come up short.

**Posture: reference only.** This is a list of pointers. Fetch the endpoint at
need; never paste a snapshot of vendor docs into code or into another skill.

## The two rules that bite hardest

1. **Follow the precedence order, and do not skip to the list.** A vendor's
   installed MCP server is live and authoritative; these indexes are third
   in line. Reaching for the URL when the MCP server would have answered
   gets you a docs page instead of the actual current state.
2. **Presence here is not evidence a vendor is provisioned.** The table
   records what each vendor publishes, verified on the date below. It says
   nothing about whether that integration is live in any given environment.
   Confirm before treating an entry as a working connection.

## Precedence

1. The vendor's installed MCP server: live and authoritative.
2. Context7 (`resolve-library-id`, then `query-docs`) for library API shape.
   It is on a metered free tier, so do not probe speculatively.
3. These `llms.txt` indexes, fetched over HTTP.
4. Model memory: last resort, always suspect.

## The directory

Verified 2026-09-17 (HTTP 200, text).

| Vendor | Endpoint |
|---|---|
| Stripe | <https://docs.stripe.com/llms.txt> |
| PostHog | <https://posthog.com/llms.txt> |
| Cloudflare | <https://developers.cloudflare.com/llms.txt> |
| Neon | <https://neon.com/llms.txt> |
| Canva | <https://www.canva.dev/llms.txt> |
| Vercel | <https://vercel.com/docs/llms.txt> |
| Next.js | <https://nextjs.org/docs/llms.txt> |
| Convex | <https://www.convex.dev/llms.txt> |
| Apify | <https://docs.apify.com/llms.txt> |
| Grafana | <https://grafana.com/llms.txt> |
| Ramp | <https://docs.ramp.com/llms.txt> |
| Base44 | <https://docs.base44.com/llms.txt> |
| Fiscal.ai | <https://docs.fiscal.ai/llms.txt> |
| Consensus | <https://docs.consensus.app/llms.txt> |
| Devin / DeepWiki | <https://docs.devin.ai/llms.txt> |
| LottieFiles | <https://docs.lottiefiles.com/llms.txt> |
| Storybook | <https://storybook.js.org/llms.txt> and <https://storybook.js.org/docs/ai.md> |
| Clerk | append `.md` to any clerk.com/docs URL; index at <https://clerk.com/docs/guides/ai/prompts.md> |
| AgentGrade | <https://agentgrade.com/llms.txt> |
| TalkToHumans | <https://www.talktohumans.app/llms.txt> |

## Checked and found to have none

On the same date, with no `llms.txt` and no published skills or rules: Figma,
Linear, Clay, GitHub (see awesome-copilot for Copilot-specific instructions),
BrowserStack, Chrome DevTools, plane, MDN, Icons8, Eagle, Apollo, Home
Assistant, work-iq, ms-docs, m365 toolkit, bankmcp, ssh-mcp-server.

Terraform is the exception worth knowing: it publishes an example `AGENTS.md`
instead. See `terraform-vendor`.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/vendor-llms-indexes/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `apify-vendor`, `clerk-vendor`, `cloudflare-workers`, `convex-vendor`,
  `neon-vendor`, `terraform-vendor`, `twilio` - the per-vendor routing
  layers, which carry the house overrides as well as the pointer. Prefer
  those when one exists for the vendor in hand; this directory is the
  fallback for the rest.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

The table is the whole skill, so the maintenance contract is: re-verify the
endpoints and update the verification date rather than letting it drift, and
move a vendor out of the "found to have none" list the moment it starts
publishing. When a vendor gets its own routing skill, add it to Companions
and leave the endpoint in the table. Prefer the smallest edit primitive
(`edits`) over a full body replace, and chain `base_version`.