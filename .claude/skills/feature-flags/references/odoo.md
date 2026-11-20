# Odoo

Preferences and rationale only. For SDK usage, call Context7 (`posthog-python`).

---

## Where the client lives

Put the PostHog client and the flag helper in the shared core module, not in each feature module. There is then one client per database and one place for defaults. Feature modules depend on that core module and call its helper. See `odoo-module-separation` for the core versus feature module split.

## Evaluate on the server

Evaluate flags in Python on the server and pass the result to the OWL frontend. Do not fetch flags separately in the browser.

**Rationale:** Server-side evaluation keeps one source of truth for a request, works for scheduled actions and RPC calls that have no browser, and stops the frontend and backend disagreeing about the same flag.

## Identity and groups

- The Odoo user is the PostHog distinct ID.
- The company is the PostHog group, so a rollout can target a single customer database or company.

## Module lifecycle

A new Odoo module ships with its flags created in PostHog before the module is installed on any customer database. Include the flag keys in the module's README.