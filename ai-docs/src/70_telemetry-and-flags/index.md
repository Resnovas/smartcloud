## Telemetry and feature flags

`@resnovas/integrations.posthog` sends product analytics, error tracking, logs,
traces and metrics to PostHog, and evaluates feature flags through
OpenFeature. Every surface provides `telemetry(surface, version)` from
`@resnovas/runtime` once, around everything it runs; the surfaces read
telemetry through the runtime, never the integration directly.

### It never changes behaviour, and it names nothing

- **Opt-out, one switch.** Nothing is sent when `SMARTCLOUD_TELEMETRY=false`,
  `DO_NOT_TRACK=1` or the action input `telemetry: false` is set, and sending
  stops once a config says `telemetry: false` (`optOut`). Opting out never
  changes what smartcloud does: every flag then keeps its default.
- **Failing to send never fails the caller.** `emit`, `reportError` and
  `evaluateFlag` return `Effect<void>` or the fallback, never an error.
- **Values name nothing.** Events carry counts, outcomes and fixed names only.
  Repositories are hashed (`identify`), a rule a repository named is sanitised
  (`sanitiseRule`), and every message and stack is passed through `redact`,
  which removes GitHub tokens, bearer credentials, email addresses and given
  secrets. Spans and logs follow the same rule: feature names, the event,
  counts and outcomes, never what the event is about. A finding's message can
  quote titles and logins, so only its feature, rule and level are logged.

### Analytics events

`ANALYTICS_EVENTS` in `packages/runtime/src/analytics.ts` is the whole
taxonomy, each event with a schema for its properties: `command run`, `config
resolved`, `feature run`, `sync proposed` and `settings applied`. Nothing else
names an event. A feature does not call `emit`; it records a `Fact` with
`report.measure`, and `measuredEvents` turns the facts it knows into events
after the run. To add an event, add its schema to `ANALYTICS_EVENTS`, build it
from the run in `analytics.ts`, and document it on the telemetry page.

### Metrics and traces

`smartcloud.findings` (by level and feature), `smartcloud.feature.duration_ms`
(by feature and outcome) and the `smartcloud.github.*` metrics are Effect
`Metric`s. Spans are `Effect.withSpan` with `captureStackTrace: false` and
attributes that follow the rules above. `EFFECT_DEVTOOLS=true` streams the
CLI's and MCP server's spans to the Effect Dev Tools extension; never set it
on CI.

### Feature flags

New behaviour ships behind a PostHog flag with a safe default in code, never
behind an environment variable or a config toggle. Each feature has one flag,
`smartcloud-<feature>` (`flagFor`), listed with its default in
`FEATURE_FLAGS` in `packages/runtime/src/flags.ts`, the only place a flag
default lives. `turnedOffFeatures` evaluates them before a run, and the engine
skips a feature whose flag is off with the flag named as the reason. A flag
for finer behaviour inside a feature goes in the same map and is read with
`featureEnabled`; `tests/runtime/src/flags.spec.ts` checks that every feature
has its flag and that the table in `docs/telemetry.mdx` lists every flag.

A flag exists only once it is created in the PostHog project: evaluation
falls back to the default when the key is unknown, so a flag nobody created
cannot turn its feature off. `tools/posthog/feature-flags.ts` (`pnpm run
flags:check`, `pnpm run flags:sync`) lists the flags PostHog lacks and creates
them from the built runtime's `FEATURE_FLAGS`, each released to every
repository in its default state, with `POSTHOG_API_KEY` (a personal API key
with `feature_flag:read`, and `feature_flag:write` to create) for the project
in `release.config.json`. Its pure logic is `tools/posthog/flags.ts`, tested
in `tests/tools`. Adding a feature therefore means: its entry in
`FEATURE_FLAGS`, its row on the telemetry page, and `flags:sync` once the
feature is released.
