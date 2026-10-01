# Telemetry

Preferences and rationale only. For how any of these libraries actually work - current API, options, examples - call **Context7** (`posthog-js`).

---

## PostHog integration

**Preference:** PostHog is mandatory for all projects and software.

**Rationale:** Tracks usage, problems, errors, and controls features, so the product can be steered by evidence rather than impression. This is what makes a self-driving product possible.

### One PostHog project per product

**Preference:** Every product gets its own PostHog project, created when telemetry is first wired in, and its events, logs, traces, errors and feature flags all live there. Never point a product at an existing project, including the organisation's default one.

**Rationale:** Keeps each product's data separate, so dashboards, flags, cohorts and error tracking never mix products.

### Must have, on every platform

- Tracing
- Logging, linked to Session Replay and Person
- Error Tracking, with source maps
- Feature Flags, with Early Access
- Metrics
- Experiments
- Session Replay, with Replay Vision
- Heatmaps
- Toolbar

### Feature flags on every application and module

**Preference:** Every application and every Odoo module has PostHog feature flags set up, and new behaviour ships behind a flag. Load the `feature-flags` skill for the full standard: defaults, naming, clean-up, Odoo, offline-first and federated components.

### AI features, always installed when using AI

- AI Observability, linked to Session Replay, Error Tracking and Self Driving
- Prompts, with A/B testing
- Skills
- Datasets
- Semantics

### The telemetry toggle

Provide a `telemetry: false` configuration option. Redact sensitive data from logs and error messages.

For larger systems the opt-out route should be discouraged, because it removes the signal the system improves from. Discouraged, not removed: the toggle must exist.

### When this applies

- Setting up new projects
- Configuring analytics
- Implementing feature flags
- Setting up error tracking
- Adding session replay
- Configuring AI observability

### When it does not apply

- Projects with explicit privacy requirements
- Offline-only applications. Offline-first applications still apply it; see the `feature-flags` skill.
- Legacy systems without PostHog integration