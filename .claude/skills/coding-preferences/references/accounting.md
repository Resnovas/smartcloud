# Local and online accounting

Preferences and rationale only. For Blnk or Airwallex APIs, call Context7.

---

## Two roles, not two forever vendors

**Preference:** Split accounting into **local / self-hosted** and **online / SaaS** roles. Vendor names are starting points, not locks.

1. **Local / self-hosted (default):** Open-source, source-available ledger we can run ourselves. **Blnk** is the usual starter (TypeScript SDK under `externals/`, OTEL and logs into PostHog).
2. **Online / SaaS product builds:** Prefer a hosted finance platform that already ships wallets, FX, payouts, connected accounts, reporting, and compliance tooling. **Airwallex** is the usual starter.

**Default rule:** Local path defaults to the open-source ledger. SaaS path defaults to the best-fit hosted platform for the project's goals. Force the role split, not a brand forever.

Blnk Cloud is Blnk's hosted product; evaluate it against Airwallex (or the current best online option) rather than assuming it is our SaaS choice.

---

## Migration compatibility (hard rule)

Durable money data must stay **100% compatible** between the local accounting service and the chosen online service so we can migrate into our paid online product without remapping semantics.

- Treat the online provider's account / wallet / balance / transaction / reference shapes as the target contract
- ISO-4217 currencies; amounts and precision must round-trip without loss
- Stable external references so local ids map 1:1 on migrate
- Reversible online-facing id mapping from day one when both sides will exist
- Exportable history that can be replayed or imported
- No durable fields without an online equivalent unless clearly ephemeral
- Both providers behind **integration modules**; core talks to finance ports only

When local-only features fight online portability, **portability wins** unless a written product decision says otherwise.