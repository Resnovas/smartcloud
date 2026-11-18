# Architecture and structure

Preferences and rationale only. For how any of these tools actually work - current API, options, examples - call **Context7** (`nx`, `tinybase`).

---

## Module boundaries

**Preference:** When creating or modifying packages in a tagged Nx monorepo, enforce module boundaries using a multi-tag system.

**Rationale:** Avoid accidental dependency loops and enforce strong dependency management across the system.

### Tag structure

Use colon-separated tags in the project's Nx configuration (`project.json` or the repository's configured equivalent). Read the repository's `eslint.config.mjs` before choosing dependencies: it is the source of truth for allowed imports, not a universal type hierarchy.

1. **Type tag**, required: for example, `type:core`, `type:shared`, `type:runtime`, `type:integration`, `type:extension`, `type:platform` or `type:test`.
2. **Layer tag**, required: `layer:backend`, `layer:frontend`, `layer:shared` or, where configured, `layer:test`.
3. **Capability tags**, as configured by the repository: for example, `capability:contracts`, `capability:schema`, `capability:actions`, `capability:flags` or `capability:i18n`. Eventiva requires one capability tag per project.

Projects with multiple tags must satisfy **all** applicable constraints simultaneously. Allowed sets intersect; one matching row cannot override another.

### Eventiva boundary baseline (EVE-22)

These 16 workspace dependency constraints describe Eventiva's reset foundation, reconciled on 2026-11-17. In Eventiva, read `docs/foundation.md`, `packages/README.md` and `eslint.config.mjs` together. Other repositories use their own checked constraints; this reference does not install or relax lint rules.

| Source tag | Allowed target tags |
| --- | --- |
| `type:core` | `type:core` |
| `type:shared` | `type:core`, `type:shared` |
| `type:runtime` | `type:core`, `type:shared`, `type:runtime` |
| `type:integration` | `type:core`, `type:shared`, `type:integration` |
| `type:extension` | `type:core`, `type:shared`, `type:extension` |
| `type:platform` | `type:core`, `type:shared`, `type:runtime`, `type:integration`, `type:extension` |
| `type:test` | `*` |
| `layer:shared` | `layer:shared` |
| `layer:frontend` | `layer:frontend`, `layer:shared` |
| `layer:backend` | `layer:backend`, `layer:shared` |
| `layer:test` | `layer:frontend`, `layer:backend`, `layer:shared`, `layer:test` |
| `capability:contracts` | `capability:contracts` |
| `capability:schema` | `capability:contracts`, `capability:schema` |
| `capability:actions` | `capability:contracts`, `capability:schema`, `capability:actions` |
| `capability:flags` | `capability:contracts`, `capability:flags` |
| `capability:i18n` | `capability:contracts`, `capability:i18n` |

`*` permits any target type, not a bypass of layers or other matching constraints. A `type:test layer:backend` project cannot import a frontend library; `type:test layer:test` can import either layer, subject to its other constraints. Same-type integration imports are allowed when their layers and capabilities also allow the edge. Platforms cannot import platforms. Flags and i18n are separate capability sets, not successive levels in a hierarchy; `capability:app`, `capability:storage`, `capability:telemetry`, `capability:ui` and `capability:test` have no capability-specific row.

External restrictions apply separately: `type:core`, `type:shared` and `capability:actions` allow only `effect` and its subpaths externally. Shared/frontend code also rejects the explicit server-only SDK/driver list in lint. Node built-ins are banned in shared/frontend/actions code; the listed Node globals are banned in shared/frontend code. Eventiva additionally rejects Zod globally and `export *` in package TypeScript. Drivers, SQL adapters and vendor SDKs belong in integrations wired by composition roots, not in portable contracts or the action runtime. There is no active `type:database` tier or exemption for `import type` or `devDependencies`.

### Cycle checks are separate

Same-type permission does not make a dependency cycle valid. Nx reports workspace dependency cycles; layer separation alone does not prevent cycles within one layer. In Eventiva the foundational direction is `runtime` -> `schema` -> `contracts`, never a back-import. The additional source, manifest and emitted-declaration audits cover edges beyond lint, including type-only edges; runtime module/provider admission has its own cycle checks. Keep these gates rather than inferring acyclicity from the tag table.

### Adding a new package

1. Read the repository's lint constraints and package-boundary documentation.
2. Add the required `type:*`, `layer:*` and configured `capability:*` tags to its Nx project configuration.
3. Check every dependency against all matching rows and external restrictions, including type-only imports.
4. Run the project's Nx lint target. In Eventiva also run `pnpm nx test @eventiva/boundaries-tests` and the source/declaration audits documented in `docs/foundation.md`; build declared dependencies before the emitted-declaration audit.
5. If an import is denied, move the responsibility or inject its implementation through an allowed contract. Do not weaken the boundary rule to allow it.

### Vendor ownership

Third-party service integrations - analytics, error reporting, email, payments, webhooks - must live in a dedicated workspace package (`@your-org/integrations.<vendor>`), not in core, unless an explicit exception is documented.

### When this applies

- Creating new packages in a monorepo
- Adding dependencies between packages
- Reviewing code for dependency violations
- Setting up ESLint module boundaries
- Planning architecture for new systems

### When it does not apply

- Single-package projects
- Non-Nx monorepos without the module boundaries plugin
- Legacy packages that do not use tags yet

---

## Nx monorepo structure

**Preference:** Nx is the source of truth for project dependencies, build order, caching, and affected commands.

**Rationale:** Sophisticated monorepo tooling with automatic dependency detection, task orchestration, and remote caching.

### Configuration hierarchy

Nx task configuration comes from three sources, applied in this order, each able to override the previous:

1. **Plugin-inferred**, automatic from tooling config, lowest priority
2. **targetDefaults**, shared defaults in `nx.json`
3. **Project-level**, explicit `project.json` or `package.json` config, highest priority

Use the `"..."` spread token to extend inherited config rather than replacing it.

### When this applies

- Setting up new Nx workspaces
- Creating new projects or libraries
- Configuring task dependencies
- Optimizing CI with affected commands
- Setting up remote caching
- Creating custom generators

### When it does not apply

- Single-package projects
- Non-monorepo setups
- Projects using Lerna or Turborepo

---

## AI-first architecture

**Preference:** All platforms, features, and utilities must be designed with AI at the core.

**Rationale:** Systems should be built from the ground up with AI MCPs, APIs and RPCs so any AI can use the tooling. AI is built into the system rather than bolted on.

### Agent-native principles

- **Shared operations:** the UI triggers them; agents call them directly. Each operation is defined once as an action.
- **Shared data:** the UI and the agent both read and update the same data.
- **Shared application state:** the current page, selected record or active view is given to the agent as context.

### Tools

- **Effect AI:** provider-agnostic AI implementations with tool calling
- **MCP:** the standard interface for AI tools
- **Effect Toolkit:** a structured, type-safe approach to defining tools

### When this applies

- Designing new platforms or features
- Creating MCP endpoints
- Building APIs for AI consumption
- Planning system architecture
- Integrating AI into existing systems

### When it does not apply

- Simple scripts without AI requirements
- Legacy systems without an MCP interface
- Non-AI-focused internal tools

---

## Local-first architecture

**Preference:** All apps should be designed as local-first.

**Rationale:** The availability of another computer should never prevent you from working. Offline read and write with seamless sync when connected also enables multiplayer experiences.

### When this applies

- Building collaborative applications
- Creating apps with offline capability
- Implementing real-time sync
- Building multiplayer experiences
- Designing for mobile-first users

### When it does not apply

- Simple server-rendered applications
- Apps that do not need offline support
- When the overhead of local-first is unnecessary
