## Conditions

Conditions are how a config says "when": a labelling rule, a convention, a
stale exemption, a required-checks rule. They live in `@resnovas/conditions`,
which is `type_core`: pure schemas and a pure evaluator, with no GitHub and no
I/O.

### The language

- A **leaf condition** is `{ type, ... }`, such as `titleMatches`,
  `filesMatch`, `hasLabel`, `isStale` or `checksPass`. The `Leaf` union in
  `schema.ts` lists every one.
- A **`ConditionGroup`** is `{ requires?, condition: [...] }`: it passes when at
  least `requires` of its conditions pass, all of them when `requires` is
  omitted.
- **Combinators** nest groups: `$and`, `$or`, `$not` and `$only` (exactly
  `requires` groups pass). `$not` accepts the three shapes v1 wrote.
- Patterns (`Pattern`) are either a bare regular expression or a delimited one
  with flags (`/^feat/i`), exactly as v1 read them; the schema rejects an
  invalid one, so `compilePattern` never throws on decoded config.
- Patterns run on text contributors control (titles, bodies, branch names,
  comments), so `compilePattern` also refuses one open to catastrophic
  backtracking, such as `^(a+)+$` or `(a|aa)+$`, using `backtrackingRisk` in
  `backtracking.ts`: a static check (it never runs the pattern) that builds the
  pattern's position automaton and looks for a state with two different loops
  over the same text. A repeat that nothing after it can fail, as in an
  unanchored `^fix: (\w+\s?)+`, is checked at its minimum count. The refusal
  is an ordinary `Pattern` failure: `validate` errors, and a run's lenient
  decode drops the group that holds it with a warning naming the pattern
  (`describe` in `packages/config/src/lenient.ts` prefers a refinement message
  over a union member mismatch). Every pattern that takes config text must go
  through `Pattern` and `compilePattern`; never `new RegExp` on config text.
  Each verdict is cached per source and flags, so compiling on every event is
  cheap. Keep `tests/conditions/src/backtracking.spec.ts` green: it runs every
  YAML pattern in `docs/` and smartcloud's own configs through the check.

### The subject and its facets

`evaluate(group, subject)` tests a `Subject`: the issue or pull request as the
event described it. Anything that costs an API call is a **facet**, loaded
only when a condition needs it: `files`, `changedFiles`, `reviews`,
`pendingReviewers`, `requestedReviewers`, `commits`, `mergeable`, `checks`,
`codeowners`, `comments` and `reactions`.

`requiredFacets(groups)` walks every group, combinators included, and returns
the facets they need; a feature returns it from `facets`, and the engine's
`loadFacets` loads each one once, concurrently. A condition that reads a facet
that was not loaded fails with `MissingFacet`, which is an engine bug, not a
user error. On an issue, a pull-request-only condition (`PULL_REQUEST_ONLY` in
`evaluate.ts`) fails with the detail "only applies to pull requests" rather
than erroring.

Every result carries a `detail` line ("title matches ^feat", "3 changed
file(s)") that reports show, so write one that explains the outcome.
Time-based conditions read Effect's `Clock`, so tests control them with
`TestClock`. GitHub lists at most 3,000 files of a pull request, so a
file-based condition that finds no match in a full list fails rather than
guessing.

### Adding a condition

The recent `feat(conditions)` commits (`dependencyUpdateType`, `commentMatches`,
`lockfileChanged`) are worked examples. The steps:

1. **Schema** in `packages/conditions/src/schema.ts`: a `Schema.Struct` with a
   `type` literal, an `identifier` equal to the type and a `description`, using
   the `flag` or `matches` helper when it fits. Add a JSDoc description and a
   runnable `ts import.meta.vitest` example, add it to the `Leaf` union, and
   export it from `index.ts`.
2. **Evaluation**: a `case` in `evaluateCondition` in `evaluate.ts`, returning
   `result(type, passed, detail)`. Read a facet only through the `facet`
   helper, so a missing one fails with `MissingFacet`.
3. **Facets**: list what it needs in `FACETS`, and add the type to
   `PULL_REQUEST_ONLY` if it means nothing on an issue.
4. **A new facet** (only if no existing one carries the data): add it to
   `Subject` and `Facet` in `subject.ts`, a read to `GitHubService` with its
   live, cached and in-memory implementations in `integrations.github`, and
   its load to `loadFacets` in `packages/engine/src/runner.ts`.
5. **Generated artefacts**: regenerate `schema/smartcloud.schema.json` and
   `docs/reference/configuration.mdx` (see the config section).
6. **Tests and docs**: cases in `tests/conditions/src/evaluate.spec.ts` and
   `schema.spec.ts` (both outcomes, the detail, the issue case, the 3,000-file
   limit when it reads files), and the condition in `docs/conditions.mdx`.

A condition must never be able to pass on data an outsider controls without
saying so: `dependencyUpdateType` checks the reserved `[bot]` login, not the
branch or title, so a fork cannot pose as Dependabot.
