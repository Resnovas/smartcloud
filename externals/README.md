# Vendored source

Source of the libraries smartcloud is built on, vendored with `git subtree --squash` so people and agents can read the real implementation instead of compiled code in `node_modules`.

| Directory | Upstream | Why |
| --- | --- | --- |
| `effect-stable` | `Effect-TS/effect` at the release in `pnpm-workspace.yaml` (`effect@3.22.2`) | The code smartcloud runs on. Read this first. |
| `effect-main` | `Effect-TS/effect` `main` | The next major line, for seeing where the APIs are heading. Never import from it. |

Nothing here is built, linted, tested or imported. The workspace, Nx, ESLint, the licence header check and Graphify all ignore `externals/`. Release commits leave it out, so the action download stays small.

## Updating

Move `effect-stable` whenever the `effect` catalog version in `pnpm-workspace.yaml` changes, in the same pull request:

```sh
git subtree pull --prefix externals/effect-stable https://github.com/Effect-TS/effect.git effect@<version> --squash
git subtree pull --prefix externals/effect-main https://github.com/Effect-TS/effect.git main --squash
```

Each pull lands as one squashed commit. Add a `Signed-off-by` trailer to it, as to every commit here.

## Patterns

Where smartcloud's usage of each module is defined. Read the vendored source for the API, and the smartcloud file for how it is used here.

| Need | Vendored source | Used in smartcloud |
| --- | --- | --- |
| Data shapes, config schema, JSON Schema | `effect-stable/packages/effect/src/Schema.ts` | `packages/config/src/schema.ts`, `sections.ts` |
| Configuration and secrets | `effect-stable/packages/effect/src/Config.ts`, `Redacted.ts` | `packages/runtime/src/github.ts`, `apps/action/src/inputs.ts` |
| Services and layers | `effect-stable/packages/effect/src/Context.ts`, `Layer.ts` | `packages/integrations.github/src/service.ts`, `live.ts` |
| Batching and caching of GitHub reads | `effect-stable/packages/effect/src/Request.ts`, `RequestResolver.ts` | `packages/integrations.github` |
| Logging, tracing and metrics | `effect-stable/packages/effect/src/Logger.ts`, `Tracer.ts`, `Metric.ts`, `effect-stable/packages/opentelemetry/src` | `packages/integrations.posthog` |
| Files, paths and processes | `effect-stable/packages/platform/src/FileSystem.ts`, `Path.ts`, `Command.ts` | `apps/cli/src/commands.ts` |
| The command line | `effect-stable/packages/cli/src` | `apps/cli/src/cli.ts` |
| Tests | `effect-stable/packages/vitest/src` | `tests/*` |
