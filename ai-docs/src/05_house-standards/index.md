<!-- house:managed:begin - synced from Resnovas/.github templates/ai-docs/src/05_house-standards/index.md. Edits inside this block are overwritten. -->
## House standards

Every Resnovas repository follows the same standards. This section is synced from
[`Resnovas/.github`](https://github.com/Resnovas/.github); the rules come from
`AGENTS.md`, `CONTRIBUTING.md`, `AI_POLICY.md` and the PostHog skill
`coding-preferences`, and those documents win if this summary ever disagrees
with them. The sections after this one describe this repository itself.

### Code

- **Effect-TS v3 first.** TypeScript is the primary language, written with
  Effect v3: services as `Context.Tag` with `Layer`s, `Effect.gen` for
  sequencing, `Schema` to decode anything from outside the process. Load the
  PostHog skill `coding-preferences` and its `effect` reference before writing
  Effect code, and look up current APIs with Context7 rather than from memory.
- **Strict TypeScript, never `any`.** Keep `strict` on. Decode unknown input
  with `Schema` instead of casting it.
- **Typed errors.** Model failures as tagged errors (`Data.TaggedError` or
  `Schema.TaggedError`) in the error channel, so a caller sees every way a call
  can fail. Do not throw for expected failures.
- **Secrets through `Config` and `Redacted`.** Read configuration with
  Effect `Config`, and hold every secret as `Redacted` (`Config.redacted`)
  until the boundary that needs its value. Never put a secret in source, logs,
  telemetry, command-line arguments, issues or pull requests.
- **PostHog telemetry and feature flags.** Every app ships PostHog feature
  flags; new behaviour goes behind a flag with a safe default in code, never
  behind an environment variable or configuration toggle (house skill
  `feature-flags`). Telemetry events carry no secret or personal data.
- **Module boundaries.** The core package holds domain-agnostic building
  blocks only. Vendor SDKs and API clients live in
  `@resnovas/integrations.<vendor>`. Features depend on core and
  integrations, never the other way round (`AI_POLICY.md` AI-13).
- **Comments explain why.** Constraints, trade-offs and anything surprising;
  never a restatement of the code.

### Tests

- Write tests with `@effect/vitest`. Line and branch coverage never falls
  below 90%, and most repositories hold 100%.
- **Never delete, skip or weaken a test** to make a change pass: fix the code
  (`AI_POLICY.md` AI-11). A flaky test is a bug to fix, not to retry away.
- Every bug fix comes with a regression test that fails before the fix.

### TypeScript

- Effect-TS v3 is the foundation of all production TypeScript, in every
  repository (house skill `coding-preferences`, `references/effect.md`).
  Anything that does IO, can fail, reads configuration, retries, runs
  concurrently or holds a resource is an `Effect` with `Data.TaggedError`
  failures, services as `Context.Tag` classes behind a `Layer`, input through
  `Schema`, configuration through `Config`, tests with `@effect/vitest`, in
  the shape of the module's existing code.
- Raw Promise code (`async`, `await`, `try`/`catch`, `throw`, `new Promise`,
  `.then`) lives only at a vendor boundary inside an integration module, in
  the one `Effect.tryPromise` or `Effect.try` that wraps the vendor call,
  marked with `// effect-boundary: <reason>` on the line above. The commit
  hook refuses it anywhere else in added source lines, and refuses `any`.
- A pure function with no IO and no failure path stays plain TypeScript. A
  whole feature in plain TypeScript is never an agent's decision: it is a
  house-rule override only the accountable human gives, by naming the rule.

### Files

- Every source file carries the FCL-1.0-MIT licence header from
  `tools/license/header.txt`, with its own path on the second line and the
  current year. `node tools/license/check-headers.mjs` (the `headers` package
  script) verifies it and `--fix` writes it; synced house tools carry none.
- ASCII hyphen-minus only in text an agent writes: no em or en dashes, and no
  emoji in titles or descriptions (house skill `no-em-or-en-dashes`,
  `AI_POLICY.md` AI-09).

### Commits and pull requests

- Conventional commits (`type(scope): summary`, imperative mood), one logical
  change each, and every commit signed off for the Developer Certificate of
  Origin with the commit author's name and address. An AI tool never signs off
  (`AI_POLICY.md` AI-03).
- Every commit an AI tool materially changed carries one `Co-authored-by`
  trailer per tool naming the tool and the model at the tool's attribution
  address (`AI_POLICY.md` AI-02); the commit author and the sign-off are the
  accountable human. No "Generated with" footer, robot emoji or host session
  line (house skill `commits-and-rd-evidence`). `tools/dev/commit-check.mjs`,
  installed as the commit-msg hook by setup, refuses a commit that breaks
  these rules.
- A pull request an agent opens is a draft (`AI_POLICY.md` AI-20) and states
  `AI level: autonomous` and every tool and model used (AI-01); the
  accountable human fills in `Accountable human` and `Human review` when
  marking it ready (AI-21). No "Generated with" footer or session link.
- One pull request per batch of work: one stacked branch per issue, each
  squashed to one conventional, signed-off commit naming its issue, all opened
  as a single pull request. Once a maintainer approves it, it lands as an owner
  fast-forward (its signed commits pushed onto the default branch unchanged),
  so each issue keeps its own commit; the merge queue squashes, because GitHub
  cannot sign rebased commits. Run the full gate locally first; CI is not the
  debugger.
- Deterministic gates (the repository's checks and the `smartcloud` check)
  decide a merge. AI review bots are advisory.
- Releases are cut by the synced house release workflow from `release.config.json`
  at the repository root (what the repository ships: bundles, apps, the major
  tag, error tracking project, npm package); the tools under `tools/release/`
  are synced too. Never run `nx release` without `--dry-run`; the workflow is
  the only release path, and its first run in a repository takes a specifier
  with first-release ticked.

### Document everything twice

Every change to a feature, option, preset or workflow updates both kinds of
documentation in the same commit:

- **ELI5 docs for people.** Plain words and short sentences; what it is and why
  you would want it before how; step-by-step setup; one complete example; what
  you will see when it runs; every option with its default; common problems
  and their fixes.
- **ai-docs for agents.** The sections under `ai-docs/src`, with compiling
  examples in the codebase's own style. `LLMS.md` is generated from them by
  `node tools/ai-docs/docgen.mjs` and checked in CI with `--check`; never edit
  it by hand.
<!-- house:managed:end -->
<!-- house:local - add this repository's own standards below this line. -->
