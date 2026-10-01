# Twilio vendor skill routing table

Fetch the vendor SKILL.md for the matching task from:

```text
https://raw.githubusercontent.com/twilio/ai/main/skills/<category>/<skill>/SKILL.md
```

The category is `twilio`, except for the email skill, which is `sendgrid`.

| Vendor skill | Use for |
|---|---|
| `twilio-account-setup` | Account creation, trial limits, subaccounts, product enablement |
| `twilio-sms-send-message` | SMS and MMS sending, error codes, message filtering |
| `twilio-whatsapp-send-message` | WhatsApp Business API, templates, the 24-hour window |
| `twilio-verify-send-otp` | OTP delivery, channel selection, Fraud Guard |
| `twilio-sendgrid-email-send` | Transactional and bulk email, dynamic templates |
| `twilio-security-hardening` | Request validation, webhook signatures |
| `twilio-compliance-traffic` | TCPA, opt-in and opt-out, quiet hours, consent |
| `twilio-compliance-onboarding` | A2P 10DLC, toll-free verification, STIR/SHAKEN |
| `twilio-webhook-architecture` | Webhook design, signature validation, retries |

## Order of work for a new integration

1. `twilio-account-setup` if the account or subaccount does not exist yet.
2. The compliance skill for the channel, before the send path. Registration
   lead times are measured in days, so discovering the requirement after the
   code is written stalls the launch rather than the development.
3. The product skill for the actual send.
4. `twilio-security-hardening` and `twilio-webhook-architecture` for the
   inbound half.

## Live API detail

Prefer the Twilio MCP server (<https://mcp.twilio.com/docs>) over any pasted
example for current parameter detail.

## The CANNOT sections

Every vendor skill carries a `CANNOT` section. Read it. These are real
platform limits, not hedging, and two in particular bite hard:

- Rotating the Auth Token invalidates every API key issued under it.
- An API Key secret is displayed once at creation and never again.
