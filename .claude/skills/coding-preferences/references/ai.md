# AI stack

Preferences and rationale only. For how any of these work - current API, options, examples - call **Context7** or the matching vendor router skill.

---

## AI SDK alongside Effect AI

**Preference:** Use Vercel's AI SDK (npm `ai`, Apache-2.0) together with Effect AI (`@effect/ai`). Effect AI is used where it fully covers the need. The AI SDK covers the rest: every model provider, streaming AI UI hooks such as `useChat`, agents and tool calling, and devtools. AI SDK calls are wrapped in Effect services, so Effect code never handles raw promises.

**Rationale:** This is the most capable AI stack available without giving up Effect's guarantees. It follows the rule in `references/effect.md`: Effect first, never at the cost of functionality. Effect AI's v3 packages are still 0.x, and the v4 line does not yet ship every provider.

---

## Which tool for which job

| Job | Tool | Skill |
|---|---|---|
| Model calls, streaming, structured output, tools, agents, AI UI | AI SDK alongside Effect AI | `ai-sdk-vendor` |
| Durable backend agents | eve | `references/vercel.md` |
| Long-running or resumable steps | Vercel Workflow, with Effect inside each step | `workflow-sdk-vendor` |
| Chat surfaces (Discord, GitHub, Linear, Twilio, web) | Chat SDK | `chat-sdk-vendor` |
| Acting on behalf of users in other apps | Vercel Connect | `references/vercel.md` |
| Running AI-generated or user-submitted code | Vercel Sandbox | `references/vercel.md` |

---

## Controlled from PostHog

**Preference:** Every AI feature can be changed remotely and measured.

- Prompts and agent instructions are versioned and improved in PostHog, not hard-coded.
- New models, prompts and agent behaviours roll out behind PostHog flags and experiments.
- Every generation is traced into PostHog LLM analytics, linked to Session Replay and Error Tracking. See `references/telemetry.md`.

---

## When this does not apply

- Sensitive personal data never goes to a hosted model or a hosted AI service.
- Local-only tools may use a local model; the same wrapping and tracing rules still apply where PostHog is available.