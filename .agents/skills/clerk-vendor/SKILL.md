---
name: clerk-vendor
description: Clerk-published guidance for adding authentication: the Clerk CLI accountless quickstart (npx clerk init), claimable applications, framework-specific setup, and the vendor's Agent Skills collection. Use when adding Clerk auth to an app, scaffolding a Clerk integration, or working against the Clerk API or MCP server.
---
# Clerk vendor routing

A routing layer over Clerk's published Agent Skills and CLI prompt for adding
authentication: the accountless quickstart, claimable applications, and
framework-specific setup.

**Posture: routing only.** Clerk maintains the quickstarts and versions them
against the CLI. Fetch the vendor material; this page carries the house
overrides and the two behaviours worth knowing before you start.

## The two rules that bite hardest

1. **Never choose an application for the user.** Pass `--app <id>` only when
   they supply the ID, and do not run `clerk auth login` unless asked.
   Picking one silently wires an app they did not intend to use.
2. **The CLI writes development keys into an env file, and that is only
   acceptable for a throwaway claimable app.** Production Clerk keys follow
   the house rule: held in a secret manager, resolved at run time, never
   committed. The two cases look identical at the shell.

## Source

All vendor-maintained:

- <https://clerk.com/SKILL.md> - root quickstart skill, the CLI accountless flow
- <https://github.com/clerk/skills> - full Agent Skills collection (`npx skills add clerk/skills`)
- <https://clerk.com/docs/guides/ai/prompts.md> - quickstart index per framework

Appending `.md` works across clerk.com docs URLs. None of this came from
Context7; the vendor sources were better and were used directly.

## How to use

For a new integration, fetch <https://clerk.com/SKILL.md> and follow it.
Vendor guidance worth trusting:

- `npx -y clerk@latest init` provisions a claimable application with
  temporary development keys, with no Clerk account needed up front. Relay
  the claim instruction the CLI prints.
- Framework quickstarts live at
  `https://clerk.com/docs/<framework>/getting-started/quickstart.md`.

For deeper work, install the relevant skill from `clerk/skills` on demand
rather than pre-loading all of them.

## House overrides

Vendor instructions deliberately not adopted:

1. **Temporary keys written to env files**: see rule 2 above.
2. **Package manager**: vendor examples assume npm and npx defaults. Use
   PNPM, and `pnpm dlx` where a one-off runner is needed.

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/clerk-vendor/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `coding-preferences` - why PNPM, and the house position on secrets.
- `react-reviewer` - reviewing the integration once written, particularly
  session-token handling in the client and any `NEXT_PUBLIC_*` leak.
- `typescript-reviewer` - the generic language lane on the same diff.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this thin: pointers plus the override list. Re-fetch the source URLs
when refreshing rather than trusting the summary here, since the CLI flow
changes with Clerk's releases. Prefer the smallest edit primitive (`edits`)
over a full body replace, and chain `base_version`.