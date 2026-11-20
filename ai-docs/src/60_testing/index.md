## Testing

### Verification funnel

Run `node --run funnel:static` immediately after coding, before documentation or other work. It runs production and test-project type checks plus corrective ESLint rules. Then run `node --run funnel:verify` for behavior and coverage, and `node --run check` before delivery. Setup installs a pre-commit hook outside CI that runs static checks before tests and refuses a staged tree different from the worktree; existing foreign hooks are preserved, not overwritten.

Hook creation uses an exclusive write rather than checking existence before writing. Reinstalling a matching hook does not rewrite it; existing unreadable or foreign hooks fail closed with a preservation diagnostic.

The hook captures the initial index tree and rejects staged-tree changes, tracked worktree drift or untracked files after either phase. Successful generators must not silently replace the tree being certified; review and stage their output, then rerun. Only verification children have Git-local environment variables removed. The hook itself retains the committing Git environment so temporary and alternate indexes are inspected correctly. Installed-hook regression commits cover mutation in both phases, unchanged success, child Git isolation and foreign-hook preservation. Checks observe phase boundaries; they do not lock out concurrent writers.

The canonical Markdown registry is `docs/verification.md`. It maps the runtime `FEATURES` registration and every workflow to triggers, executable checks and expected observations. Update the relevant row with new behavior; `node --run funnel:contracts` checks inventory drift and exercises lint rejection/acceptance plus real disposable Git hook scenarios. PR CI runs these contracts even for docs-only changes. Local in-memory tests do not prove live permissions or releases; record live checks as pending until a GitHub run proves them.

The syntax restrictions exclude integration SDK callbacks and repository tooling. The existing MCP startup await has one documented exception pending lifecycle migration; synchronous parser throw contracts are unchanged. These limits are not blanket permission to add Promise-based feature code.

Shared JSDoc adoption is tracked by SMC-176 and Resnovas/smartcloud#749. Document and enable the shared contracts for each package in the same commit, retaining its base ESLint config and all existing gates. The root config opts in `feature.lock` source using house revision `92bb0b9d06e95d88395d158e35c5aaf1b9e65004`; package configs keep importing the base without cross-boundary tooling imports. The shared adapter resolves canonical header identity from its repository location, independently of ESLint cwd. Test root and nested-package invocation, noncanonical headers and declaration prose; do not change legal notices or suppress rules. The migration status and verification commands live in `docs/verification.md`; global enforcement follows completion of every editable package.

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

### Coverage: 90% enforced, 100% the goal

`testProject` in `vitest.shared.ts` fails a project below 90% of lines,
functions, statements or branches of the package it covers. 100% is the goal:
below it the run passes, and `tools/ci/coverage-goal.ts` warns (an annotation
on CI) with each metric that falls short. The GitHub ruleset blocks a pull
request only below 80%. Aim for 100% in every change; never lower a threshold,
skip a test or delete one to make a build pass; add the missing case. On CI a failed test is retried twice and each test that passed
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

Every call is recorded by name in `state.calls`, so a test asserts a
feature's request budget (`expect(state.calls).toStrictEqual([...])`).
`getArchive` serves the seeded `files` at a ref with their `executables`, and
`resolveRef` answers `refs` (`refKey(owner, repo, ref)` to a SHA), or the ref
itself; an archive read at a SHA also serves the files of every ref that
resolves to it, and a read of the service's own default branch by name serves
the files seeded with an empty ref. `maxBytes` is honoured, so a small limit
exercises a feature's fallback.

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
