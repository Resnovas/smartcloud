# Review priorities

The severity catalog. Work top down: a CRITICAL finding blocks, HIGH blocks,
MEDIUM is mergeable with caution. Every finding needs a file, a line and a
concrete fix.

## CRITICAL - Security

- **Injection via `eval` / `new Function`**: user-controlled input passed to dynamic execution. Never execute untrusted strings.
- **XSS**: unsanitised user input assigned to `innerHTML`, `dangerouslySetInnerHTML`, or `document.write`.
- **SQL / NoSQL injection**: string concatenation in queries. Use parameterised queries or an ORM.
- **Path traversal**: user-controlled input in `fs.readFile` or `path.join` without `path.resolve` plus prefix validation.
- **Hardcoded secrets**: API keys, tokens, passwords in source. Resolve them from a secret manager at run time.
- **Prototype pollution**: merging untrusted objects without `Object.create(null)` or schema validation.
- **`child_process` with user input**: validate and allowlist before passing to `exec` or `spawn`.

## HIGH - Type safety

- **`any` without justification**: disables type checking. Use `unknown` and narrow, or a precise type.
- **Non-null assertion abuse**: `value!` without a preceding guard. Add a runtime check.
- **`as` casts that bypass checks**: casting to unrelated types to silence an error. Fix the type instead.
- **Relaxed compiler settings**: if `tsconfig.json` is touched and weakens strictness, call it out explicitly.

## HIGH - Async correctness

- **Unhandled promise rejections**: `async` functions called without `await` or `.catch()`.
- **Sequential awaits for independent work**: `await` inside a loop where the operations could safely run in parallel. Consider `Promise.all`.
- **Floating promises**: fire-and-forget without error handling, in event handlers or constructors.
- **`async` with `forEach`**: `array.forEach(async fn)` does not await. Use `for...of` or `Promise.all`.

## HIGH - Error handling

- **Swallowed errors**: empty `catch` blocks, or `catch (e) {}` with no action.
- **`JSON.parse` without try/catch**: throws on invalid input. Always wrap.
- **Throwing non-Error objects**: `throw "message"`. Always `throw new Error("message")`.
- **Missing error boundaries**: React trees without an error boundary around async or data-fetching subtrees.

## HIGH - Idiomatic patterns

- **Mutable shared state**: module-level mutable variables. Prefer immutable data and pure functions.
- **`var` usage**: `const` by default, `let` when reassignment is needed.
- **Implicit `any` from missing return types**: public functions should have explicit return types.
- **Callback-style async**: mixing callbacks with `async`/`await`. Standardise on promises.
- **`==` instead of `===`**: use strict equality throughout.

## HIGH - Node.js specifics

- **Synchronous fs in request handlers**: `fs.readFileSync` blocks the event loop. Use async variants.
- **Missing input validation at boundaries**: no schema validation on external data.
- **Unvalidated `process.env` access**: access without a fallback or startup validation.
- **`require()` in an ESM context**: mixing module systems without clear intent.

## MEDIUM - React and Next.js (fallback only)

Prefer the `react-reviewer` skill, which carries the full React CRITICAL and
HIGH rule set. This block is a fallback for when that skill is unavailable;
when the diff contains `.tsx`/`.jsx`, run both.

- **Missing dependency arrays**: `useEffect` / `useCallback` / `useMemo` with incomplete deps. Use the exhaustive-deps lint rule.
- **State mutation**: mutating state directly instead of returning new objects.
- **Key prop using index**: `key={index}` in dynamic lists. Use stable unique IDs.
- **`useEffect` for derived state**: compute derived values during render, not in effects.
- **Server/client boundary leaks**: importing server-only modules into client components in Next.js.

## MEDIUM - Performance

- **Object or array creation in render**: inline objects as props cause unnecessary re-renders. Hoist or memoize.
- **N+1 queries**: database or API calls inside loops. Batch, or use `Promise.all`.
- **Missing `React.memo` / `useMemo`**: expensive computations or components re-running on every render.
- **Large bundle imports**: `import _ from 'lodash'`. Use named imports or tree-shakeable alternatives.

## MEDIUM - Best practices

- **`console.log` left in production code**: use a structured logger.
- **Magic numbers and strings**: use named constants or enums.
- **Deep optional chaining without fallback**: `a?.b?.c?.d` with no default. Add `?? fallback`.
- **Inconsistent naming**: camelCase for variables and functions, PascalCase for types, classes and components.
