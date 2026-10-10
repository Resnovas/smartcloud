# Language and package manager

Preferences and rationale only. For how any of these tools actually work - current API, options, examples - call **Context7** (`typescript`, `pnpm`).

---

## TypeScript over JavaScript

**Preference:** All code must be written in TypeScript, never plain JavaScript.

**Rationale:** Type safety ensures code is reliable, self-documenting, and catches errors at compile time. TypeScript is non-negotiable for all new projects.

### Implementation

- Set `"strict": true` in `tsconfig.json`
- Never use `any` types. Use proper generics, Effect Schema types, or branded types
- If the type system forces a cast, prefer `unknown` with a type guard
- Always use `.ts` or `.tsx` file extensions, never `.js`

### When this applies

- Creating new source files
- Converting existing JavaScript to TypeScript
- Reviewing code for language choice
- Setting up new projects
- Configuring `tsconfig.json`

### When it does not apply

- Editing configuration files that do not support TypeScript, such as `.json` or `.yaml`
- Working with third-party tools that only accept JavaScript
- Quick scripts where TypeScript would add unnecessary overhead, which is rare

---

## PNPM as package manager

**Preference:** Use PNPM for all projects.

**Rationale:** PNPM's workspace protocol, strict dependency isolation, and content-addressable storage are required for the monorepo setup. Many other preferences depend on PNPM tooling.

### Implementation

- Root `pnpm-workspace.yaml` defines workspace packages
- Use the `workspace:*` protocol for internal dependencies
- Never use `npm` or `yarn` in these projects
- Always use `pnpm add`, `pnpm install`, `pnpm run`

### When this applies

- Initializing new projects
- Installing dependencies
- Setting up monorepo workspaces
- Running package scripts
- Updating dependency versions

### When it does not apply

- Working with legacy projects that require npm
- CI environments where pnpm is not installed, which is rare