---
name: chat-sdk-vendor
description: Vercel Chat SDK vendor routing (npm `chat`, MIT): one TypeScript bot that runs on many chat platforms through `@chat-adapter/*` packages, including Discord, GitHub, Linear, Twilio (SMS and MMS), Web (AI SDK useChat protocol), Slack, Microsoft Teams, Google Chat, Gmail, Telegram, WhatsApp, Messenger, Instagram, Notion and X; mentions, direct messages, threads, reactions, slash commands, cards, modals, files and streamed AI replies; Redis, Postgres or memory state. Routes to Vercel's own chat-sdk Agent Skill at a pinned commit and carries the house overrides. Use when building a chatbot or support agent, adding a bot to Discord, GitHub, Linear, SMS or a website, or writing a custom chat adapter.
license: MIT
---
# Chat SDK vendor routing

A routing layer over Vercel's published Agent Skill for the Chat SDK (npm `chat`, MIT).

**Posture: routing only.** Vercel maintains the skill; fetch it for SDK behaviour. This page carries the house overrides.

## The two rules that bite hardest

1. **One bot, many adapters.** Write the bot logic once and add platforms as adapters. The house channels are Discord, GitHub, Linear, Twilio and Web; prefer a vendor-official adapter over a hand-built integration for any other platform.
2. **Bot logic is Effect; the SDK is the edge.** Handlers call into Effect services for AI, data and flags. The AI replies come from the AI SDK wrapped in Effect; see `ai-sdk-vendor`.

## Source

Repo <https://github.com/vercel/chat>. Pinned commit `d7aa75b1d8b8fdc075a4241e7350813c01c85151`.

## How to use

Fetch the vendor skill from `https://raw.githubusercontent.com/vercel/chat/d7aa75b1d8b8fdc075a4241e7350813c01c85151/skills/chat/SKILL.md`. For API detail use Context7 (`/vercel/chat`).

## House overrides

1. **State**: use the Redis state adapter on Upstash, or Postgres on Neon when the bot's data already lives there. The memory adapter is for tests only.
2. **Secrets**: platform tokens come from the secret manager at run time or through Vercel Connect, never `.env` files in the repo.
3. **Customer-facing copy**: bot replies follow `whitelabel-customer-facing-copy`.
4. **Flags and telemetry**: new bot behaviour ships behind a PostHog flag, and AI replies are traced into PostHog LLM analytics.
5. **Package manager**: PNPM.

## Companions

- `ai-sdk-vendor` - generating and streaming the replies.
- `workflow-sdk-vendor` - conversations that wait on people or external events.
- `coding-preferences` - `references/vercel.md` and `references/ai.md`.

## Maintaining this skill

Keep this thin. On a sync, move the pin in `.agents/skills-upstream-catalog.yaml` and in the raw URL together, and re-check the adapter list.