<!-- house:managed:begin - synced from Resnovas/.github templates/ai-docs/README.md. Edits inside this block are overwritten. -->
# ai-docs

The documentation for AI agents. Everything here is assembled into one file,
`LLMS.md` at the repository root, which an agent reads in a single pass before
working on or with this repository.

People have their own documentation (the README and any `docs/` pages). The two
cover the same features for different readers, and a change updates both in
the same commit.

## Why it is generated

The guidance sits beside real examples: ordinary `.ts` files that the
repository's type check compiles. An example that stops compiling fails the
build, instead of quietly teaching an agent an API that no longer exists.
`LLMS.md` is then built from the sources, and CI fails when the committed copy
is stale, so it never drifts from them.

## Layout

```
ai-docs/
  README.md                      this file (synced)
  src/
    05_house-standards/index.md  the house rules every repository shares (synced)
    10_overview/index.md         this repository's own sections, from 10 up
    20_<topic>/
      index.md                   prose: what it is, why, the rules that matter
      10_<example>.ts            an example, rendered under the prose
      fixtures/                  supporting code for the examples, not rendered
LLMS.md                          generated; never edit it by hand
tools/ai-docs/docgen.mjs         the generator (synced)
```

## Conventions

- A section is a directory under `ai-docs/src` with an `index.md`. Its numeric
  prefix orders it. Numbers 00 to 09 belong to the house sections synced from
  `Resnovas/.github`; number this repository's own sections from 10.
- Start `index.md` with a `##` heading; examples appear under it as `###`.
- Examples are `.ts` files beside `index.md`, ordered by their own prefix. A
  leading JSDoc block names the example with `@title`, and its other lines
  become the text above the code. A licence header before it is left out of
  `LLMS.md`.
- A `fixtures/` directory holds code the examples import. It is never rendered.
- Comment the why, not the what. Show real usage in the codebase's own style,
  importing from the packages' public paths.
- Include `ai-docs/src` in the type check (for example in a `tsconfig.json`
  that the `typecheck` target covers), so the examples keep compiling.

```ts
/**
 * @title Decode input before using it
 *
 * The text here appears above the code in LLMS.md.
 */
import { Schema } from "effect"

// Why this matters, not what the line does.
const decode = Schema.decodeUnknown(Schema.String)
```

## Commands

| Command | What it does |
| --- | --- |
| `node tools/ai-docs/docgen.mjs` | Writes `LLMS.md` from `ai-docs/src`. |
| `node tools/ai-docs/docgen.mjs --check` | Fails when `LLMS.md` does not match its sources. |

Every repository wires them as package scripts, `ai-docs` and `ai-docs:check`,
and runs `ai-docs:check` from its `check` script so CI enforces it:

```json
{
  "scripts": {
    "ai-docs": "node tools/ai-docs/docgen.mjs",
    "ai-docs:check": "node tools/ai-docs/docgen.mjs --check"
  }
}
```

`LLMS.md` is listed in the synced `.prettierignore`, because the generator owns
its formatting.
<!-- house:managed:end -->
<!-- house:local - add notes for this repository's ai-docs below this line. -->
