# AGENT-SETUP.md

Repo-root file read only by agents and cloud runners, never by people. `AGENTS.md` and `CLAUDE.md` link to it. It replaces nothing written for people (README, contributing docs stay as they are).

## Style: caveman ultra

Written in caveman ultra (the `JuliusBrussee/caveman` style): drop articles, filler and conjunctions where cause and effect stay clear; one word where one word is enough; each fact once; fragments and tables over sentences. Code symbols, commands, file paths, variable names and error strings stay exact. The house bans still apply: no em or en dashes, and no prose abbreviations or arrows (caveman ultra bans them too).

## Required sections

1. Needs: OS assumptions, runtimes with versions, services, disk and memory if unusual.
2. Env: every variable by name, required or optional, and where it comes from (Proton Pass item name, vendor secret setting). Never values.
3. Network: domains the setup and the app need, for runner allowlists.
4. Setup: the one command (`scripts/agent-setup`) and what success prints.
5. Run: dev, build, test, lint, typecheck commands; ports; how to know it is up.
6. Verify: the fastest check that proves the setup worked.
7. Runner notes: the UI-only settings each runner needs (see `cloud-agents.md`) and the recommended Orca Quick Commands.
8. Breaks: known failure, cause, fix, one line each.

Keep it short enough to read in one pass and update it in the same change as any setup change.