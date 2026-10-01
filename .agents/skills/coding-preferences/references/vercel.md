# Vercel

Preferences and rationale only. For how any of these work - current API, options, examples - call **Context7** or the matching vendor router skill.

---

## Vercel as the default deployment target

**Preference:** Deploy online surfaces to Vercel first. Local-first is unchanged: the UI and user data still work without a connection, and Vercel hosts the online parts and server functions.

**Rationale:** Deploying on Vercel unlocks its platform features and SDKs (Connect, Sandbox, BotID, Workflow observability, the AI Gateway) with little operations work.

### Keep portability

- Prefer Vercel tools that also run elsewhere: AI SDK, Chat SDK, Flags SDK, and Workflow through its Worlds.
- Put Vercel-only features (Connect, Sandbox, BotID) behind integration modules, so a deployment elsewhere can swap them without touching core code. See `references/integrations.md`.

---

## Vercel plugin for coding agents

**Preference:** When working on a Vercel project on a local machine, install the Vercel plugin into the coding agent: `npx plugins add vercel/vercel-plugin`. Do not install it on CI runners or headless agent boxes.

**Rationale:** It gives Claude Code, Cursor, Codex, GitHub Copilot CLI, Grok Build and Kimi Code Vercel's own skills and tooling. It needs Node 18 or newer and Bun.

---

## Vercel Connect

**Preference:** Use Vercel Connect (`@vercel/connect`, Apache-2.0) whenever the app or an AI agent acts on behalf of a user in a third-party service.

**Rationale:** It issues short-lived, scoped OAuth or API-key tokens per user and authenticates the project through OIDC, so provider keys are never stored in environment variables. It covers services such as Slack, GitHub, Microsoft, Salesforce and MCP servers.

It requires Vercel; keep it behind an integration module.

---

## eve for durable agents

**Preference:** Build durable backend AI agents with eve (npm `eve`, Apache-2.0, `npx eve@latest init`). Its instructions, tools, skills, channels and schedules are files under `agent/`.

**Control from PostHog:** prompts and instructions are versioned and improved in PostHog, and agent behaviour is gated by PostHog flags, so an agent can change without a redeploy.

eve is in beta: pin its version and ship new agents behind a flag.

---

## Vercel Sandbox for untrusted code

**Preference:** Run code submitted by other people (plugins, extensions, user code, AI-generated code) in Vercel Sandbox (`@vercel/sandbox`, Apache-2.0), never on our own servers or machines.

**Rationale:** Each run gets a short-lived Firecracker microVM on Vercel's infrastructure, so a hostile submission cannot reach the core code or data.

The sandbox replaces reviewing the submitted code, not the controls around it:

- Pass no secrets or long-lived credentials into a sandbox.
- Restrict network access and set time and resource limits.
- Treat everything that comes out as untrusted input and decode it with Effect Schema.

---

## BotID for bot protection

**Preference:** On Vercel deployments, use BotID (npm `botid`, with `botid/server` for the server check) instead of reCAPTCHA or similar challenges.

**Rationale:** It is invisible to users, and it lets verified bots such as ChatGPT agents through while blocking unauthorised ones.

**Constraints:** it only works on projects deployed to Vercel, and it has no published open-source licence. A deployment elsewhere needs a different protection behind the same integration module.

---

## Workflow and Chat SDK

- **Durable workflows:** Vercel Workflow is the durable engine, with Effect inside each step. See `workflow-sdk-vendor` and `references/effect.md`.
- **Chat bots:** Chat SDK, one bot across Discord, GitHub, Linear, Twilio, the web and vendor-official adapters. See `chat-sdk-vendor`.

---

## When this does not apply

- Odoo modules, which deploy with Odoo.
- Offline-only or on-device features.
- Sensitive personal data, which never leaves the local machine.