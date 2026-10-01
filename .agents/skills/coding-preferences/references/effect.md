# Effect-TS

Preferences and rationale only. For how any of these libraries actually work - current API, options, examples - call **Context7** (`effect`, `@effect/schema`, `@effect/platform`, `@effect/vitest`).

---

## Effect-TS at core

**Preference:** All production TypeScript code uses Effect-TS v3 as the foundational library, in every repository. A repository that does not use Effect yet adds it with its first production TypeScript; a repository that already uses it never grows a plain-TypeScript feature beside the Effect ones.

**Rationale:** Effect provides typed errors, dependency injection, concurrency, streaming, and a composable service architecture. It is the mandatory foundation for all projects. The choice is made here, once, so that no task has to make it again: an agent or contributor never decides that a given feature is "simple enough" to skip it.

### Implementation

- Use latest Effect v3 with modules: Cluster, AI, Platform
- Keep two copies available: current stable version plus Effect main branch, clearly separated
- Review Effect's main branch `.agents`, `.patterns`, `scripts`, and root for workflow improvements to adopt
- Use `@effect/docgen`, `@effect/ai-docgen`, and `@effect/doctest` for documentation

### When this applies

- Designing new systems or services
- Creating production applications
- Managing complex dependencies
- Building concurrent or streaming systems
- Implementing error handling with typed errors

### When it does not apply

- A pure function with no IO and no failure path (a parser step, a formatter, arithmetic): plain TypeScript, called from Effect code.
- Repository tooling under `tools/` or `scripts/` that ships nowhere; the house tools are plain Node for this reason.
- Legacy code that cannot be refactored yet. New code beside it is still Effect.

Nothing else is exempt. "It is only a small utility", "it is simpler without Effect", "it is a prototype" and "the library is Promise-based" are not exemptions: a Promise-based library is wrapped at its boundary (next section). Writing a feature, a module or a parser in plain TypeScript where Effect is the standard is a house-rule override, which only the accountable human can give, by naming this rule. A task that asks for plain TypeScript without naming the rule is a stop-and-ask.

### Boundaries, and what the commit hook refuses

- Failures are `Data.TaggedError` classes on the error channel (`Effect.fail`); a `throw` in Effect code is a defect, not an error.
- Services are `Context.Tag` classes provided by a `Layer`; a new operation copies the shape of the module's existing operations, in the same module.
- Raw Promise code exists only at a vendor boundary inside an integration module: the one `Effect.tryPromise`, `Effect.try` or `Effect.async` that wraps the vendor call, with a `// effect-boundary: <reason>` comment on the line above it.
- The commit hook (`tools/dev/commit-check.mjs`, installed by setup) refuses an added TypeScript source line with `async`, `await`, `try {`, `throw`, `new Promise` or `.then(` unless that line itself calls into `Effect.` or the line above it carries the boundary comment, and refuses `any` in every added source line. Tests, `.d.ts` files, `externals/`, `tools/` and `scripts/` are outside the scan. The hook is the floor; the repository's lint (`@typescript-eslint/no-explicit-any`) and the Effect Language Service are the rest of the gate.

---

## Effect Language Service and Dev Tools

**Preference:** Every repository that uses Effect installs the Effect Language Service and Effect Dev Tools by default, from the day it is created.

**Rationale:** Effect-specific diagnostics (floating effects, leaked requirements, untagged errors, chained provides) catch mistakes the type checker alone does not, and Dev Tools shows spans and metrics live. Both should be there without anyone having to remember them.

### Implementation

- `@effect/language-service` as a root dev dependency, listed as a plugin in the base tsconfig (Effect 4 repositories use `@effect/tsgo`; the plugin name stays the same).
- A `prepare` script runs `effect-language-service patch`, so `tsc` and the repository's `typecheck` fail on Effect warnings and errors, not only the editor. Set `includeSuggestionsInTsc: false` when the tsconfig has `noEmitOnError`, or a suggestion silently stops the build emitting; suggestions stay in the editor.
- Editors run the workspace TypeScript so the plugin loads: `.vscode/settings.json` (`typescript.tsdk`) and `.zed/settings.json` (vtsls `typescript.tsdk`); JetBrains uses the project TypeScript.
- `.vscode/extensions.json` recommends the Effect Dev Tools extension (`effectful-tech.effect-vscode`).
- The application connects to Dev Tools only when `EFFECT_DEVTOOLS` is set (`true` for the default address, or a WebSocket URL), layered over the existing tracer so telemetry keeps working. Never on by default, never in production.
- A deliberate exception is a per-line `@effect-diagnostics-next-line <rule>:off` comment with the reason, never a rule turned off project-wide.
- Reference implementation: `Resnovas/smartcloud` (`packages/runtime/src/devtools.ts`).

---

## Effect first, never at the cost of functionality

**Preference:** When Effect has built-in tooling that fully covers the need, use it. When Effect's support is partial or weaker than a dedicated library, use the more capable library and integrate it into Effect: an Effect service with a layer, typed errors, Effect Schema at the boundary, and `Config.redacted` for its credentials. Never settle for a subpar Effect-native tool, and never let raw promises leak into Effect code.

**Rationale:** Effect is the foundation for its guarantees, not for purity. A partial Effect module costs features and user experience; a wrapped, more complete library keeps both the features and the guarantees.

### Current decisions

| Need | Effect-native option | Decision |
|---|---|---|
| AI models, agents, AI UI | `@effect/ai` (0.x; v4 providers incomplete) | AI SDK alongside Effect AI, wrapped in Effect; see `references/ai.md` |
| Durable workflows | `@effect/workflow` (0.x, needs Cluster) | Vercel Workflow as the engine, Effect inside each step; see `workflow-sdk-vendor` |
| Chat bots across platforms | none | Chat SDK, wrapped in Effect; see `chat-sdk-vendor` |
| Feature flags | none | OpenFeature with PostHog, Flags SDK on Next.js and SvelteKit; see `feature-flags` |

Re-check this table when an Effect module reaches 1.0: if it then covers the same features, Effect wins.

---

## Effect style guidelines

### Use `runMain` for entry points

Place teardown logic in the main effect. If Cluster changes this, an equivalent will be documented.

### Prefer functions over methods

Functions are tree-shakeable; methods are not. Functions extend without modifying prototypes.

---

## Effect Schema

**Preference:** Use `effect/Schema` for data definition, validation, and transformation.

**Rationale:** Schema provides a single source of truth for data shapes, supporting decoding, encoding, assertion, JSON Schema generation, and pretty printing.

### Roundtrip consistency

Schemas must be defined so that encode followed by decode returns the original value.

### When this applies

- Defining data types
- Validating input and output
- Creating JSON schemas
- Building type-safe APIs
- Serialization and deserialization
- Data transformation pipelines

### When it does not apply

- Simple runtime checks without schema needs
- When Zod or another validator is already established
- Performance-critical paths where Schema overhead is unacceptable

---

## Effect Platform

**Preference:** Use `@effect/platform` for OS interactions.

**Rationale:** Platform-independent abstractions that work across Node.js, Deno, Bun, and browsers.

### Conflict resolution

Cluster wins over Platform unless explicitly specified by the user.

### When this applies

- Building CLI tools
- Handling file operations
- Interacting with the terminal
- Managing key-value storage
- Cross-platform utilities

### When it does not apply

- When using Cluster for distributed systems
- Simple Node.js scripts that do not need portability
- Performance-critical file operations, where native Node may be faster

---

## Effect Configuration

**Preference:** Use Effect Configuration for all configuration needs. Sensitive values must use `Config.redacted`.

**Rationale:** Type-safe configuration management with built-in support for environment variables, JSON, TOML, and custom config providers.

All API keys, secrets and sensitive config use `Config.redacted`, without exception.

### When this applies

- Setting up application configuration
- Loading environment variables
- Managing secrets and API keys
- Creating configuration schemas
- Setting up custom config providers
- Validating configuration at startup

### When it does not apply

- Simple scripts with hardcoded values
- Configuration that does not need type safety
- When another config system is already established

---

## Batching and caching

**Preference:** Use Effect's batching and caching for all external data interactions.

**Rationale:** Prevents redundant computation, reduces API calls, and improves performance.

### When this applies

- Making API calls
- Database queries
- Repeated computations
- Expensive operations
- Any code that runs multiple times with the same inputs

### When it does not apply

- One-off computations
- Operations that must always be fresh
- When caching adds complexity for minimal benefit

---

## Testing with Effect

**Preference:** Use `@effect/vitest` for all Effect-based tests.

**Rationale:** Provides test context injection such as TestClock, and Effect-aware test runners.

### The golden rule

**No existing test should ever be deleted.** If the code fails, fix the code. If coverage is insufficient, improve the tests.

### Test location

Tests live under `tests/<package-path>/src/**/*.spec.ts`, mirroring the `packages/<package-path>/src/**/*.ts` structure. For example `packages/core/src/cluster/config.ts` maps to `tests/core/src/cluster/config.spec.ts`.

### Module resolution

When tests run from the main repo CI, `@your-org/*` imports resolve to the main repo's implementation in `packages/` or `dist/`. The tests repo does not contain implementation code.

### When this applies

- Creating new test files
- Setting up test infrastructure
- Writing tests for Effect services
- Testing time-dependent code
- Testing with mock services

### When it does not apply

- Testing non-Effect code
- Quick unit tests without Effect context
- Integration tests that need live dependencies