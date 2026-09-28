## Documentation

Everything is documented twice, in the same change as the code. A feature,
option, preset, CLI command, MCP tool or workflow is not done until both are
updated.

| For    | Where                                                                       | Style                                                                                                                                                                                                   |
| ------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| People | `docs/` (the Mintlify site, navigation in `docs/docs.json`) and `README.md` | ELI5: what it is and why before how, step-by-step setup, one complete example, what they will see on GitHub, every option with its default, common problems and fixes, every term defined on first use. |
| Agents | `ai-docs/src`, assembled into `LLMS.md`                                     | Why, the rules that matter, and compiled examples in the codebase's own style.                                                                                                                          |

### Setup guides

The human setup guides live in `docs/guides/` (the "Setup guides" group in
`docs/docs.json`) and are the first place a newcomer is sent from
`getting-started`, `configuration`, `presets` and `features/sync`:

| Page                                 | Covers                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/guides/settings-file.mdx`      | `.github/smartcloud.yml` built one section at a time, in newcomer order, with what each does when a run starts and on which events.   |
| `docs/guides/recommended-setups.mdx` | Complete files for a small repository, a monorepo, an open-source project, and an organisation preset plus a repository extending it. |
| `docs/guides/organisation-hub.mdx`   | Any organisation's own `<org>/.github` as the sync hub: preset, `templates/`, managed blocks, placeholders, app, first sync, rollout. |

When a section, option, default or event changes, update these guides with the
feature page. Every YAML config in them must decode: write it to a file and run
`pnpm run cli validate <file>` (a fragment gets `version: 2` prepended; a file
that `extends` a fictional `my-org` preset is resolved with `resolveConfig`
and an in-memory `ConfigSource` serving the guide's own preset). Quote label
colours, since an all-digit colour decodes as a number.

### Generated artefacts

Never edit one by hand; edit its source and regenerate.

| Artefact                                            | Source                                  | Regenerate                                                       | Checked by                                               |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `LLMS.md`                                           | `ai-docs/src`                           | `pnpm ai-docs`                                                   | `pnpm ai-docs:check` (in `pnpm run check` and CI `lint`) |
| `ai-docs` examples compile                          | `ai-docs/src/**/*.ts`                   | -                                                                | `nx run @resnovas/ai-docs:typecheck`                     |
| `schema/smartcloud.schema.json`                     | `SmartcloudConfig`                      | `SMARTCLOUD_UPDATE_SCHEMA=1 pnpm nx test @resnovas/config-tests` | `tests/config`                                           |
| `docs/reference/configuration.mdx`                  | the JSON Schema                         | `pnpm docs:reference`                                            | `pnpm docs:reference:check`                              |
| API docs (`dist/docs`) and contracts                | JSDoc in `packages/*/src`, `apps/*/src` | `pnpm docs:api`                                                  | the `docgen` and `contracts` targets                     |
| `.claude/commands`, `.cursor/commands`, MCP configs | `.agents/prompts`, `.agents/mcp.jsonc`  | `node tools/dev/surfaces.mjs sync`                               | `node tools/dev/surfaces.mjs check`                      |

### API contracts

Every exported const, function and class carries a description, a typed
`@example` importing from the package's public path, `@param` per parameter
and `@returns` unless it returns void, with `@remarks` for behaviour a caller
relies on. Exports left out of a package's `index.ts` are marked `@internal`.
`docgen` type-checks every example; `contracts` checks the built declarations
for the tags.

### Writing ai-docs

- A section is `ai-docs/src/NN_name/index.md`, starting with a `##` heading.
  `05_house-standards`, `ai-docs/README.md` and `tools/ai-docs/docgen.mjs` are
  synced from `Resnovas/.github`; edit them there. smartcloud's own sections
  start at `10_`.
- Examples are `.ts` files beside `index.md` with a leading JSDoc `@title`.
  Import from the packages' public paths, as a consumer would; the
  `@resnovas/ai-docs` project may import any package (tag `type_docs`), and
  its `package.json` lists the ones it uses.
- Comment the why. When a source file changes behaviour an example or
  section describes, update it in the same change, then run `pnpm ai-docs`.
