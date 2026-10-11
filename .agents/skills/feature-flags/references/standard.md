# The standard

Preferences and rationale only. For SDK usage, call Context7.

---

## Provider and interface

- **Provider: PostHog.** Flags are created, targeted and rolled out in PostHog only. Vercel Flags, LaunchDarkly and other flag stores are not used.
- **Interface: OpenFeature by default.** Code evaluates flags through OpenFeature (Apache-2.0, CNCF) with PostHog as the provider, so call sites do not depend on one vendor's SDK and the provider can be swapped. PostHog publishes official MIT providers: `@posthog/openfeature-node-provider` and `@posthog/openfeature-web-provider`, and documents a Python provider.
- **Prefer open-source SDKs.** Every SDK in the table below is open source.

## Which SDK per runtime

| Runtime | Use |
|---|---|
| Next.js, SvelteKit | Flags SDK (npm `flags`, MIT) with `@flags-sdk/openfeature` over the PostHog OpenFeature provider, or `@flags-sdk/posthog`. See `flags-sdk-vendor`. |
| Other Node servers | OpenFeature server SDK with `@posthog/openfeature-node-provider` |
| Web without Next.js or SvelteKit | OpenFeature web SDK (plus the React SDK for React) with `@posthog/openfeature-web-provider` |
| React Native and Expo | `posthog-react-native` behind the app's flag helper. The Flags SDK does not support React Native, and no PostHog OpenFeature provider for React Native was found when this was written; switch to one when it exists. |
| Odoo and other Python | PostHog's documented OpenFeature provider for Python, or `posthog-python`; see `references/odoo.md` |

## What "set up" means

1. The SDK for the runtime, from the table above, is integrated and initialised with PostHog as the provider.
2. There is one small helper per app that checks a flag and returns its in-code default when no value is available. Feature code calls the helper, not the SDK directly, so defaults live in one place. With OpenFeature the default is the value passed at each evaluation, and the helper keeps those in one place.
3. Users are identified with a stable distinct ID, and the organisation or company is set as a PostHog group, so a rollout can target one customer.

**Rationale:** A flag lets a change be rolled out gradually, targeted at one customer, and switched off without a deploy. Retrofitting flags after an incident is too late.

## What goes behind a flag

- New user-facing features.
- Changes to existing behaviour.
- Risky migrations and new integrations.

Pure refactors that do not change behaviour do not need a flag.

## Naming and ownership

- Name flags `<app-or-module>-<feature>` in kebab-case, for example `eventiva-checkout-v2` or `climb-sale-margin-guard`.
- The PostHog flag description records the purpose, the owner, and the condition for removing it.

## Clean-up

When a flag has been fully rolled out and stable, remove the flag check and the dead branch in code, then archive the flag in PostHog. Stale flags are a defect because every one doubles the paths a reader has to reason about.

## When this does not apply

- One-off scripts with no users.
- Vendored third-party code under `externals/`.