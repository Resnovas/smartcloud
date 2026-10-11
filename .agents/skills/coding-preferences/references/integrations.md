# Integrations vs core

Preferences and rationale only. For vendor SDK APIs, call Context7.

---

## Integration modules stay outside core

**Preference:** External services (payments, email, webhooks, analytics, auth vendors, ledgers, cloud APIs) live in dedicated integration packages, not in core product modules.

**Rationale:** Core stays vendor-portable. Feature modules hook one product area each and depend on a thin core + the relevant area. Multiple vendors for the same job can coexist behind ports.

### Shape

- One **core integration** module per external service: config, client, retries/backoff, logging, generic hooks. No feature coupling in core.
- Separate **feature** modules that hook one product area and depend on core + that area. Prefer auto-activation when both dependencies are present.
- Never hard-code feature logic inside the integration core; expose clean interfaces feature modules consume.
- Keep feature modules isolated from each other; add another feature module rather than cross-wiring.
- Secrets in config/env, not source. Do not block user hot paths with sync IO to external services.

### When this applies

- Adding a new third-party service
- Reviewing whether a vendor import belongs in core
- Designing payments, auth, email, ledger, or webhook hooks

### When it does not apply

- Pure domain logic with no external I/O
- First-party shared libraries that are not vendor adapters