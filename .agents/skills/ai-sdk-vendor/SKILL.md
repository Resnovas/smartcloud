---
name: ai-sdk-vendor
description: Vercel AI SDK vendor routing (npm `ai`, Apache-2.0): one API over every model provider for text generation, streaming, structured output, tool calling, agents (ToolLoopAgent), embeddings, RAG and UI hooks such as useChat, plus AI SDK devtools. Routes to Vercel's own ai-sdk Agent Skill at a pinned commit and carries the house overrides: use it alongside Effect AI and wrap it in Effect, trace every call into PostHog LLM analytics, keep prompts in PostHog. Use when adding AI to an app, choosing a model provider, building an agent or chatbot, streaming AI UI, or deciding between the AI SDK and @effect/ai.
license: Apache-2.0
---
# AI SDK vendor routing

A routing layer over Vercel's published Agent Skill for the AI SDK (npm `ai`, Apache-2.0).

**Posture: routing only.** Vercel maintains the skill; fetch it for SDK behaviour. This page carries the house overrides. The decision itself is in `coding-preferences`, `references/ai.md`.

## The two rules that bite hardest

1. **Effect wins only where it is complete.** Use `@effect/ai` for what it fully covers. Where it is partial, use the AI SDK and wrap it in an Effect service (typed errors, Schema at the boundary, layers for provider config). Do not settle for a weaker Effect-native path, and do not let raw promises leak into Effect code.
2. **Every AI call is observable in PostHog.** Trace generations into PostHog LLM analytics and manage prompts in PostHog, so they can be versioned and improved remotely.

## Source

Repo <https://github.com/vercel/ai>. Pinned commit `e9c5e0ff19d775c9d4182dee28ec55dfebfacf63`.

## How to use

Fetch the vendor skill from `https://raw.githubusercontent.com/vercel/ai/e9c5e0ff19d775c9d4182dee28ec55dfebfacf63/skills/use-ai-sdk/SKILL.md`. The vendor skill tells agents to read the documentation shipped in the installed `ai` package; follow that, and use Context7 (`/vercel/ai`) for API detail.

For an upgrade, the vendor also ships `skills/migrate-ai-sdk-v6-to-v7/SKILL.md` in the same repo.

## House overrides

1. **Effect integration**: per rule 1.
2. **Devtools**: `@ai-sdk/devtools` is local development only. Never ship it to production.
3. **Credentials**: provider keys come from the secret manager at run time or, on Vercel, through Vercel Connect or the AI Gateway. Never commit or pull them into `.env` files.
4. **Package manager**: PNPM.

## Companions

- `coding-preferences` - `references/ai.md` for the AI stack decision, `references/effect.md` for Effect rules.
- `chat-sdk-vendor` - chat bots across Discord, GitHub, Linear, Twilio and the web.
- `workflow-sdk-vendor` - durable steps for long-running agents.
- `instrument-llm-analytics` (ships with the PostHog MCP) - tracing AI calls into PostHog.

## Maintaining this skill

Keep this thin. On a sync, move the pin in `.agents/skills-upstream-catalog.yaml` and in the raw URL together.