# Working in smartcloud

smartcloud v2 is tracked in Linear (team SMC). v1 is no longer in the tree; its last release is the `1.0.0-beta.8` tag, and v1 configs are still read through the migration in `packages/config`.

House standards apply: the PostHog skill `coding-preferences` (Effect v3, strict TypeScript, pnpm, Nx module boundaries, FCL-1.0-MIT) and the rules in `Resnovas/.github`.

## Layout

| Path | What lives there |
| --- | --- |
| `packages/<name>` | Libraries. Tag every project with a type (`type_core`, `type_shared`, `type_database`, `type_extension`, `type_platform`) and a layer (`layer_shared`, `layer_backend`, `layer_frontend`) under `nx.tags` in its `package.json`. GitHub API code only in `packages/integrations.github`. |
| `apps/<name>` | Platforms: the GitHub Action and the CLI. |
| `tests/<name>` | One test project per package, mirroring `packages/<name>/src`. Tagged `type_test`. |
| `tools/` | Workspace scripts, run with Node's built-in TypeScript support. |

## Commands

Agents and cloud runners set up with `scripts/agent-setup` (Windows: `scripts\agent-setup.cmd`); `AGENT-SETUP.md` lists the environment, network and runner settings. Editor tasks, debug configurations and agent surfaces only call the package scripts below.

```sh
pnpm install
pnpm run setup                                   # install, nx sync, build (idempotent)
pnpm nx run-many -t lint typecheck test build   # everything
pnpm nx affected -t lint typecheck test build   # what a change affects
pnpm headers                                     # licence header check (pnpm headers:fix to add them)
pnpm typecheck:tests                             # type-check every test project (Nx skips them)
```

## Adding a package

1. `packages/<name>/package.json`: `"name": "@resnovas/<name>"`, `"type": "module"`, `nx.tags`, and an export map whose `.` entry lists `"@resnovas/source": "./src/index.ts"` first, then `types` and `import` pointing at `dist/`.
2. `packages/<name>/tsconfig.json` referencing `tsconfig.lib.json`, which extends `../../tsconfig.base.json` with `rootDir: src`, `outDir: dist` and `emitDeclarationOnly: false`.
3. `packages/<name>/eslint.config.mjs` spreading the root config.
4. `tests/<name>/`: a `package.json` depending on `@resnovas/<name>` with `workspace:*`, `vitest.config.mts` calling `testProject('<name>', ['packages/<name>/src/**'])` from `vitest.shared.ts`, a `tsconfig.json` with `noEmit`, and `src/**/*.spec.ts` using `@effect/vitest`.
5. `pnpm install`, then `pnpm headers:fix`.

Coverage runs on every test and fails below 100% of lines, functions and statements. Never delete a test to make a build pass.

## Commits and pull requests

Small stacked pull requests through GitButler, one Linear issue each, titled with conventional commits and the issue key in the branch. Every commit is signed off (DCO).
