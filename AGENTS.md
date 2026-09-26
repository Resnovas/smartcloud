# Working in smartcloud

smartcloud v2 is tracked in Linear (team SMC). v1 is no longer in the tree; its last release is the `1.0.0-beta.8` tag, and v1 configs are still read through the migration in `packages/config`.

House standards apply: the PostHog skill `coding-preferences` (Effect v3, strict TypeScript, pnpm, Nx module boundaries, FCL-1.0-MIT) and the rules in `Resnovas/.github`.

## Layout

| Path              | What lives there                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/<name>` | Libraries. Tag every project with a type (`type_core`, `type_shared`, `type_database`, `type_extension`, `type_platform`) and a layer (`layer_shared`, `layer_backend`, `layer_frontend`) under `tags` in its `project.json`. GitHub API code only in `packages/integrations.github`. |
| `apps/<name>`     | Platforms: the GitHub Action, the CLI and the MCP server. Their `project.json` sets `projectType: library`, because the test projects import them and Nx forbids importing an application.                                                                                            |
| `tests/<name>`    | One test project per package, mirroring `packages/<name>/src`. Tagged `type_test`.                                                                                                                                                                                                    |
| `tools/`          | Workspace scripts, run with Node's built-in TypeScript support.                                                                                                                                                                                                                       |

## Commands

Agents and cloud runners set up with `scripts/agent-setup` (Windows: `scripts\agent-setup.cmd`); `AGENT-SETUP.md` lists the environment, network and runner settings. Editor tasks, debug configurations and agent surfaces only call the package scripts below.

```sh
pnpm install
pnpm run setup                                   # install, nx sync, build (idempotent)
pnpm nx run-many -t lint typecheck test build   # everything
pnpm nx affected -t lint typecheck test build   # what a change affects
pnpm headers                                     # licence header check (pnpm headers:fix to add them)
pnpm typecheck:tests                             # type-check every test project (Nx skips them)
pnpm docs:api                                    # docgen (type-checks @example blocks) and the contracts check
```

## Editor and agent surfaces

Every editor task, debug configuration and app action calls a package script. VS Code and Cursor read `.vscode/`, Zed reads `.zed/`, JetBrains reads `.run/`, Codex desktop reads `.codex/environments/environment.toml` and Orca reads `orca.yaml`. Orca quick commands and OpenChamber project actions live in per-user settings, so `.agents/surfaces.json` lists them and `pnpm run surfaces:install` (run by the setup script) registers them for the checkout.

Agent prompts live once in `.agents/prompts/<name>.md`; `pnpm run surfaces:sync` writes them to `.claude/commands`, `.cursor/commands` and `.opencode/commands`, and `pnpm run check` fails when those drift. Edit the prompt, never the generated copies.

## Adding a package

1. `packages/<name>/package.json`: `"name": "@resnovas/<name>"`, `"type": "module"`, and an export map whose `.` entry lists `"@resnovas/source": "./src/index.ts"` first, then `types` and `import` pointing at `dist/`. Nx configuration stays out of `package.json`.
2. `packages/<name>/project.json`: `name` (the package name), `$schema` (`../../node_modules/nx/schemas/project-schema.json`), `projectType: library`, `sourceRoot: packages/<name>/src` and the `tags`. Targets come from the Nx plugins and `targetDefaults` in `nx.json`; declare one here only for what those do not provide, and spread (`"..."`) any inherited array you extend.
3. `packages/<name>/tsconfig.json` referencing `tsconfig.lib.json`, which extends `../../tsconfig.base.json` with `rootDir: src`, `outDir: dist` and `emitDeclarationOnly: false`.
4. `packages/<name>/eslint.config.mjs` spreading the root config.
5. `tests/<name>/`: a `package.json` depending on `@resnovas/<name>` with `workspace:*`, a `project.json` tagged `type_test` and the package's layer, `vitest.config.mts` calling `testProject('<name>', ['packages/<name>/src/**'])` from `vitest.shared.ts`, a `tsconfig.json` with `noEmit`, and `src/**/*.spec.ts` using `@effect/vitest`.
6. `pnpm install`, then `pnpm headers:fix`.

Coverage runs on every test and fails below 100% of lines, functions and statements. Never delete a test to make a build pass.

Tests mirror sources file for file: `packages/<name>/src/<path>.ts` is tested by `tests/<name>/src/<path>.spec.ts` (apps map the same way). Barrels and type-only files need no spec; shared fixtures stay as non-spec helper files.

## API contracts

Every exported const, function and class carries a description, a typed `@example` importing from the package's public path, `@param` per parameter and `@returns` unless it returns void; add `@remarks` where behaviour needs explaining. Exports left out of the package's `index.ts` are marked `@internal`. Each package and app has a `docgen.json` for `@effect/docgen`, whose `docgen` target type-checks every example and writes the API docs to `dist/docs`; the `contracts` target (`tools/docs/check-contracts.ts`) checks the built declarations for the tags. Mark an example fence `ts import.meta.vitest` to run it as a test through `@effect/doctest`, and assert with a trailing `// => value` comment (primitives only: Effect 3's `Equal` compares plain objects and arrays by reference). Vitest counts a run example's coverage against the source file it sits in, so a runnable example must call every function it defines; leave the marker off an example that cannot.

## Releasing

Releases are cut by Nx release from the `release` workflow (Actions, run on `main`); see `docs/releasing.mdx`. Conventional commits since the last `v*` tag decide the version, and the tag is the only record of it: nothing is committed to `main`, whose app versions stay `0.0.0`. The workflow pushes a `v<version>` tag on a release commit that holds `dist/index.js` and the bumped versions, writes the notes to the GitHub release, moves `v<major>`, and publishes `@resnovas/smartcloud` to npm. `CHANGELOG.md` is the v1 history and is no longer written.

- Never run `nx release` without `--dry-run`: the workflow is the only release path, and a local run pushes and creates a GitHub release.
- The first v2 release has no `v*` tag to count from (v1's tags have no `v`): run the workflow once with `specifier` `2.0.0` and `first-release` ticked. Every later release leaves both empty.
- Preview a release with `pnpm release:dry-run` (add `--first-release --specifier 2.0.0` before the first release), or run the workflow with `dry-run` ticked (the default).

## Commits and pull requests

Small stacked pull requests through GitButler, one Linear issue each, titled with conventional commits and the issue key in the branch. Every commit is signed off (DCO).
