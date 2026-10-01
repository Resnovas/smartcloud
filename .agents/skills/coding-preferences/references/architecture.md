# Architecture and structure

Preferences and rationale only. For how any of these tools actually work - current API, options, examples - call **Context7** (`nx`, `tinybase`).

---

## Module boundaries

**Preference:** When creating or modifying packages in a tagged Nx monorepo, enforce module boundaries using a multi-tag system.

**Rationale:** Avoid accidental dependency loops and enforce strong dependency management across the system.

### Tag structure

All packages must have two or three tags in `project.json`:

1. **Type tag**, required: `type_core`, `type_shared`, `type_database`, `type_extension`, or `type_platform`
2. **Layer tag**, required: `layer_backend`, `layer_frontend`, or `layer_shared`
3. **Capability tags**, optional: `capability_entities`, `capability_workflows`, `capability_ui`

Projects with multiple tags must satisfy **all** applicable constraints simultaneously.

### How this prevents circular dependencies

1. **The type hierarchy is strict and one-directional.** `type_core` cannot depend on anything. Each higher type can only depend on equal or lower types, which creates a strict one-way flow.
2. **Layer separation prevents cross-layer cycles.** Backend cannot depend on frontend. Frontend cannot depend on backend. Both can depend on shared.
3. **Capability tags do not override type or layer rules.** Adding `capability_ui` to a backend package does not allow it to depend on frontend packages.

### Adding a new package

1. Determine the module type and add the `type:*` tag
2. Determine the layer and add the `layer:*` tag
3. Identify capabilities and add any `capability:*` tags
4. Add all tags to `project.json`
5. Verify dependencies comply with all rules
6. Run `pnpm nx lint` to check boundaries

### Exceptions

Database packages can be in `devDependencies` for type imports, even where they are not allowed as runtime dependencies.

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