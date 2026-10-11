---
name: twilio
description: Twilio vendor guidance for building messaging, voice, verification and email features: product selection, SMS/WhatsApp/Verify/SendGrid patterns, webhook signature validation, A2P 10DLC and TCPA compliance, security hardening. Use when writing code against Twilio or SendGrid APIs, choosing between Twilio products, or handling Twilio webhooks and compliance.
---
# Twilio vendor routing

A routing layer over Twilio's published Agent Skills for messaging, voice,
verification and email: product selection, SMS, WhatsApp, Verify, SendGrid,
webhook signature validation, and A2P 10DLC and TCPA compliance.

**Posture: routing only.** Twilio maintains the per-product skills. Fetch the
one matching the task; this page carries the house overrides and the routing
table.

## The three rules that bite hardest

1. **Trust the `CANNOT` section in every vendor skill.** It documents real
   platform limits rather than caution, and two of them cause outages:
   rotating the Auth Token invalidates every API key, and an API Key secret
   is shown exactly once.
2. **Compliance is not optional decoration.** A2P 10DLC registration, TCPA
   consent, opt-out handling and quiet hours are legal requirements with
   carrier-level enforcement. Route to the compliance skills before writing
   the send path, not after.
3. **Do not follow the vendor's credential handling.** Every example exports
   `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` and reads `process.env` or
   `os.environ` directly. House rule: secrets live in a secret manager and
   resolve at run time via a wrapper. Never write a Twilio credential into a
   config file, shell rc or committed `.env`.

## Files

| File | Read it when |
|---|---|
| `references/vendor-skills.md` | Picking which Twilio skill to fetch. The routing table from product to vendor skill, the URL pattern, and the MCP server. |
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/twilio/` in the repository; the published catalogue mirrors them with version history.

## Source

Twilio-published Agent Skills at <https://github.com/twilio/ai>, documented at
<https://www.twilio.com/docs/ai/skills>. None of this came from Context7; the
vendor repo was the better source and was used directly.

## House overrides

Vendor instructions deliberately not adopted:

1. **Credentials**: see rule 3 above.
2. **Package manager**: vendor examples use `npm install` and `pip install`.
   Use PNPM for Node, and a managed virtual environment for Python.
3. **Plain-JS examples**: vendor snippets are plain Node or Python.
   TypeScript with Effect-TS is the house style; treat vendor snippets as
   API-shape reference, not as code to paste.

## Companions

- `coding-preferences` - the language, package manager and secrets positions
  these overrides come from.
- `typescript-reviewer` - reviewing the integration, especially webhook
  signature validation and input handling on the public endpoint.
- `vendor-llms-indexes` - the wider vendor docs directory.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

New or renamed vendor skills go in `references/vendor-skills.md`, not in this
body. The override list changes only when a vendor instruction actually
changes. Prefer the smallest edit primitive (`edits` / `file_edits`) over a
full replace, and chain `base_version`.