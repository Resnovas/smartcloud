---
name: apify-vendor
description: Apify-published skills for production web scraping and automation - choosing Actors from the Apify Store, running scrapers via API/SDK, the apify-ultimate-scraper skill, and MCP integration. Use when scraping websites, automating browsers at scale, or working with Apify Actors or the Apify MCP server.
---
# Apify vendor routing

A routing layer over Apify's own published Agent Skills for production web
scraping and browser automation, plus the house overrides that replace the
parts of the vendor guidance that conflict with local rules.

**Posture: routing only.** This skill does not restate Apify's documentation.
It tells you where the authoritative vendor material is and which two of its
instructions not to follow. Fetch the vendor skill for the actual how-to.

## The two rules that bite hardest

1. **Do not follow the vendor's token handling.** Every Apify example exports
   `APIFY_TOKEN` into the shell or an env file. House rule: secrets live in a
   secret manager and resolve at run time, never in a shell rc or a committed
   `.env`.
2. **Fetch the vendor skill; do not work from this page.** Actor behaviour,
   pricing and options change on Apify's release schedule, not ours. Anything
   restated here would be a snapshot rotting quietly.

## Source

Apify-published Agent Skills at <https://github.com/apify/agent-skills>
(Apache-2.0, 5 skills), with a docs index at <https://docs.apify.com/llms.txt>.
None of this came from Context7; the vendor repo was the better source and was
used directly.

## How to use

Install or fetch the vendor skill matching the task:

```bash
npx skills add https://github.com/apify/agent-skills --skill apify-ultimate-scraper
```

Or read the skill files directly under
<https://github.com/apify/agent-skills/tree/main/skills/>. The repo's
`agents/AGENTS.md` is a one-page index of every skill; start there.

The Apify MCP server (<https://mcp.apify.com>) exposes Actor discovery and
runs. Prefer it for live Actor metadata over any pasted list.

## House overrides

Vendor instructions deliberately not adopted:

1. **API token handling**: see rule 1 above.
2. **Package manager**: vendor examples assume npm. Use PNPM, and `pnpm dlx`
   for a one-off runner.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/apify-vendor/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `vendor-llms-indexes` - the directory of vendor docs endpoints, for when
  Apify's own MCP server does not answer the question.
- `coding-preferences` - why PNPM, and the rest of the house defaults these
  overrides derive from.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this thin: it is a pointer plus a short override list, and it should
stay that way even as Apify's own skill set grows. Re-check the source URLs
and the skill count when refreshing, and update the override list only when a
vendor instruction actually changes. Prefer the smallest edit primitive
(`edits`) over a full body replace, and chain `base_version`.