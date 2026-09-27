## Testing

### Layout and tools

- Tests live in `tests/<name>`, one project per package, and mirror sources
  file for file: `packages/<name>/src/<path>.ts` is tested by
  `tests/<name>/src/<path>.spec.ts`. Barrels and type-only files need no spec;
  shared helpers are non-spec files such as `fixtures.ts`.
- Write specs with `@effect/vitest`: `it.effect` for an Effect, which provides
  a `TestClock` and `TestContext`, `it.live` only when real time is the point.
- `pnpm nx test <project>` runs one project with coverage, `pnpm run test:file
<path>` one file without it, and `pnpm typecheck:tests` type-checks every
  test project (Nx's inferred typecheck skips them, because they set `noEmit`).

### Coverage is 100%

`testProject` in `vitest.shared.ts` fails a project below 100% of lines,
functions and statements (95% of branches) of the package it covers. Never
lower a threshold, skip a test or delete one to make a build pass; add the
missing case. On CI a failed test is retried twice and each test that passed
only on a retry is reported as flaky: that is a bug to fix, not a reason to
raise the retry count. Keep tests portable across Linux, macOS and Windows:
build paths with `node:path`, and never assume a shell, a line ending or a
case-sensitive file system.

### The in-memory GitHub

`makeMemoryGitHub(seed)` returns a `GitHubService` and its live, mutable
`MemoryState`. Seed what the test needs (labels, `issues` by number, `pulls`,
`openIssues`, `closedIssues`, `files` keyed by `fileKey(owner, repo, path,
ref)`, ...), run the feature, then read the state to see what it did: labels,
comments, `proposals`, `backports`, `checkRuns`, raw `requests`. It behaves
like GitHub where features depend on it: labels are unique ignoring case,
missing things fail with `NotFound`, a proposal updates the open pull request
from its branch. `GitHubMemory(seed)` is the same as a layer, for a test that
does not inspect the state. To test a failure, spread the service and replace
one operation with `Effect.fail(new Forbidden(...))`.

Test a feature through `runFeatures`, as a run would, so facet loading,
enabling and isolation are exercised too. Put the clock under test control
with `TestClock.setTime` before anything reads the time.

### Documentation examples are tests

An `@example` fence marked `ts import.meta.vitest` in a package's JSDoc runs as
a test through `@effect/doctest`, asserting each trailing `// => value`
comment (primitives only: Effect 3's `Equal` compares plain objects and arrays
by reference). Its coverage counts against the source file it sits in, so a
runnable example must call every function it defines. Every other `@example`
is still type-checked by the `docgen` target. The examples in this `ai-docs`
tree are type-checked by the `@resnovas/ai-docs` project's `typecheck`.
