Add a new workspace package named in the text after this command.

1. Follow "Adding a package" in `AGENTS.md`: `packages/<name>/package.json` with `nx.tags` (one type, one layer) and the `@resnovas/source` export first, `tsconfig.json` and `tsconfig.lib.json`, `eslint.config.mjs`, and the mirrored test project under `tests/<name>/`.
2. Add the package to the root `tsconfig.json` references.
3. Run `pnpm install`, `pnpm nx sync` and `pnpm run headers:fix`.
4. Write specs under `tests/<name>/src/**` with `@effect/vitest` until coverage reaches 100% of lines, functions and statements.
5. Finish with `pnpm run check` and `pnpm run typecheck:tests`; fix what fails, never delete a test.
