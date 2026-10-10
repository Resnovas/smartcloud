# Workflow

## 1. Collect all errors

Run the typecheck and get the complete list before changing anything.
Categorise them: type inference, missing types, imports, config,
dependencies. Prioritise build-blocking first, then type errors, then
warnings.

Type errors cascade. A single bad inference can produce a dozen downstream
complaints that disappear once the root one is fixed, so fixing in file order
means fixing symptoms.

## 2. Fix, minimally

For each error:

1. Read the error message carefully and understand expected versus actual.
2. Find the minimal fix: a type annotation, a null check, an import fix.
3. Rerun the typecheck to confirm it did not break something else.
4. Iterate until the build passes.

## Diagnostic commands

Run the project's own scripts first. These are the fallback, and they use
`--no-install` so the project's pinned compiler is honoured rather than an
arbitrary latest.

```bash
npx --no-install tsc --noEmit --pretty
npx --no-install tsc --noEmit --pretty --incremental false   # show all errors
pnpm build
npx --no-install eslint . --ext .ts,.tsx,.js,.jsx
```

## Recovery

These discard state. Say what you are doing before running one.

```bash
# Clear build caches
rm -rf .next node_modules/.cache && pnpm build

# Reinstall dependencies from the lockfile
rm -rf node_modules && pnpm install --frozen-lockfile

# Apply the auto-fixable lint rules
npx --no-install eslint . --fix
```

## Success criteria

- The typecheck exits zero
- The build completes
- No new errors introduced
- Minimal lines changed, under roughly 5 percent of the affected file
- Tests still passing

Fix the error, verify the build passes, move on. Speed and precision over
perfection.
