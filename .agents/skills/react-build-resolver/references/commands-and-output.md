# Commands and output

## Build commands

Run the project's own script first; these are the per-bundler fallbacks.
Use the project's declared package manager rather than assuming npm.

```bash
pnpm build --if-present

next build                          # Next.js
vite build                          # Vite
react-scripts build                 # CRA
webpack --mode=production           # webpack
parcel build src/index.html         # Parcel
bun build ./src/index.tsx --outdir=dist
```

Typecheck independently of the bundler, only when TypeScript is configured.
`--no-install` honours the project's pinned TypeScript version; never
auto-install an unpinned compiler, which produces non-reproducible results
across machines.

```bash
pnpm typecheck --if-present
test -f tsconfig.json && npx --no-install tsc --noEmit -p tsconfig.json
```

## Dependency diagnosis

```bash
npm ls react                       # check for duplicates
npm ls @types/react                # check version alignment
npm dedupe                         # consolidate duplicates
```

Only upgrade when `npm ls react` reports duplicates or a mismatch with
`@types/react`. Upgrade `react` and `react-dom` **as a pair**, matching the
major already in use; never independently. Jumping majors is a separate,
deliberate change, not part of a build fix.

## Key principles

- Surgical fixes only. Do not refactor, just fix the error.
- Never disable type-checking or a lint rule to make it green.
- Never add `@ts-ignore` without an inline explanation and a TODO.
- Always re-run the build after each fix. Do not stack changes.
- Fix the root cause rather than suppressing the symptom.
- If the error indicates a real architectural problem, such as a database
  client imported into a Client Component, stop and report. Do not paper
  over it.

## Output format

Per fix:

```text
[FIXED] src/components/UserCard.tsx
Error: 'React' is not defined
Fix: tsconfig.json -> set "jsx": "react-jsx"; removed the obsolete import
Remaining errors: 2
```

Finish with one of:

```text
Build Status: SUCCESS | Errors Fixed: N | Files Modified: <list>
Build Status: FAILED  | Errors Fixed: N | Blocked by: <reason>
```
