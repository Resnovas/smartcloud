---
name: extendable-module-architecture
description: Prefer composable core-plus-feature modules over monoliths; secrets in config; Odoo service_* split when Enterprise.
---
# Extendable module architecture

Prefer extendable, composable modules over monoliths across all stacks.

Principles:
1. Core integration module per external service: config, client, retries/backoff, logging, generic hooks. No feature coupling in core.
2. Separate feature modules that hook one product area each and depend on core + that area. Prefer auto-activation when both dependencies are present (e.g. Odoo auto_install).
3. Never hard-code feature logic inside core; expose clean interfaces feature modules consume.
4. Keep feature modules isolated from each other; add another feature module rather than cross-wiring.
5. Secrets in config/env, not source. Do not block user hot paths with sync IO to external services.

When the stack is Odoo Enterprise, also apply the odoo-enterprise and odoo-module-separation skills (service_<vendor>_core + service_<vendor>_<hook> naming, depends/auto_install patterns).