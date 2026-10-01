# Common fixes

## Error to fix

| Error | Fix |
|-------|-----|
| `implicitly has 'any' type` | Add a type annotation |
| `Object is possibly 'undefined'` | Optional chaining `?.` or a null check |
| `Property does not exist` | Add it to the interface, or mark it optional with `?` |
| `Cannot find module` | Check tsconfig paths, install the package, or fix the import path |
| `Type 'X' not assignable to 'Y'` | Convert the value, or fix the type |
| `Generic constraint` | Add `extends { ... }` |
| `Hook called conditionally` | Move the hook to the top level |
| `'await' outside async` | Add the `async` keyword |

## DO

- Add type annotations where they are missing
- Add null checks where they are needed
- Fix imports and exports
- Add missing dependencies
- Update type definitions
- Fix configuration files

## DON'T

- Refactor unrelated code
- Change architecture
- Rename variables, unless the name is causing the error
- Add new features
- Change logic flow, unless that is the error
- Optimize performance or style
- Silence a genuine type error with `any`, `as` or `@ts-ignore`

That last one is the important one. Suppression turns a build failure into a
runtime failure and removes the signal that would have caught it.

## Priority levels

| Level | Symptoms | Action |
|-------|----------|--------|
| CRITICAL | Build completely broken, no dev server | Fix immediately |
| HIGH | A single file failing, type errors in new code | Fix soon |
| MEDIUM | Linter warnings, deprecated APIs | Fix when convenient |
