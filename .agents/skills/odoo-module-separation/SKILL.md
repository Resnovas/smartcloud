---
name: odoo-module-separation
description: Odoo core vs feature module separation for external service integrations: service_<vendor>_core plus service_<vendor>_<hook>, the depends graph, and auto_install. Use when adding or refactoring an Odoo integration with a third-party service, naming new Odoo modules, or deciding what belongs in a core module versus a feature module.
---
# Odoo module separation

Separate core integration logic from feature-specific hooks when integrating
Odoo with an external service, so the integration stays reusable and safe to
evolve. One `service_<vendor>_core` module, plus one feature module per Odoo
app area it hooks.

**Posture: architecture guidance.** This decides module boundaries and
naming. It does not cover ORM performance or Settings configuration; see
`odoo-enterprise` for those.

## The two rules that bite hardest

1. **Nothing in core may name a feature model.** The moment core references
   `crm.lead`, it stops being reusable and every future feature inherits a
   dependency on CRM. Core holds config, the client, retries, logging and
   generic mixins, and nothing else.
2. **`auto_install=True` belongs on the feature module, never on core.**
   Core auto-installing drags the integration into every database whether or
   not it is wanted. The feature module auto-installs precisely when both its
   Odoo app and core are already present, which is the behaviour you want.

## Principles

1. A dedicated **core** module per service: config, client, retries and
   backoff, logging, generic hooks and mixins. No feature coupling.
2. Separate **feature** modules: each hooks exactly one Odoo app area,
   `depends` on that app plus core, and sets `auto_install=True`.
3. Never hard-code feature logic in core. Avoid cross-feature dependencies.

## Naming

- Core: `service_<vendor>_core`, for example `service_posthog_core`
- Feature: `service_<vendor>_<hook>`, for example `service_posthog_crm`,
  `service_posthog_website`

## Layout

```text
service_posthog_core/
  models/          # config, service registry, mixins
  services/        # API client
  controllers/     # webhooks if needed
  data/            # ir.config_parameter defaults, crons
  security/
  tests/

service_posthog_crm/
  models/          # hooks on create/write/stage
  tests/
```

## Manifests

Core: `depends: ["base"]`, `auto_install: False`.

Feature: `depends: ["crm", "service_posthog_core"]`, `auto_install: True`.

Use proper semver in manifests, for example `1.0.0`, not `19.0.x.y.z`.

## Core guidelines

- Credentials in `ir.config_parameter`; settings via `res.config.settings`
  and the Settings sidebar (see `odoo-enterprise`).
- A single client class handling auth, retries, timeouts and 429s. Never log
  a secret.
- Generic mixins and helpers only.

## Feature guidelines

- Override `create` and `write`, or the key state transitions. Batch where
  possible.
- Do not block a hot path with synchronous HTTP; defer it. See the
  `odoo-enterprise` hot-path rules, which this is a direct application of.
- Map model events to core methods and keep feature logic thin.

## Checklist

- [ ] Core exists with config, client and generic hooks
- [ ] Feature targets one app and depends on core plus that app
- [ ] `auto_install=True` on the feature only
- [ ] Secrets in config, not in code
- [ ] Tests for both core and feature behaviour

## Files

| File | Read it when |
|---|---|
| `CHANGELOG.md` | Recent changes to this skill, newest first. Rolling 30-entry window. |
| `HANDOVER.md` | What is in flight on this skill. Read first when resuming work on it. |

Read these files directly from `.agents/skills/odoo-module-separation/` in the repository; the published catalogue mirrors them with version history.

## Companions

- `odoo-enterprise` - ORM hot-path rules, logging levels, Settings sidebar
  configuration and upgrade verification for the modules this skill lays out.
- `python-reviewer` - reviewing the resulting Python.

## Maintaining this skill

When resuming work on this skill, read `HANDOVER.md` first, then
`CHANGELOG.md`. Add a one-line `CHANGELOG.md` entry on every meaningful
change and trim past the window as you write. Overwrite your `HANDOVER.md`
section at the end of a session and delete it when the work lands.

Keep this body thin. If per-vendor integration notes accumulate, they belong
in a `references/` file rather than in this layout guide, which should stay
generic. Prefer the smallest edit primitive (`edits`) over a full body
replace, and chain `base_version`.