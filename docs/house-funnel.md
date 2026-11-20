<!-- Synced from Resnovas/.github templates/docs/house-funnel.md. Edit it there. -->
# Adopt the verification funnel

The funnel moves recurring corrections into examples, corrective static checks and executable verification. AGENTS.md retains authority and judgment the tools cannot establish. Existing repository gates remain required. This is repository tooling, not application behavior, so it does not introduce a runtime feature flag.

## What changes for contributors

Pre-commit runs only static checks and affected tests. Full verification, smoke and evidence collection run in CI on PRs and pushes to main, including repositories that ship directly to main. The hook rejects partial staging rather than silently testing a different tree. Feature evidence covers only affected features, uses synthetic data, and expires after seven days in the existing CI artifact audience. No deployment, new artifact access or production fixture is authorized by adopting this tooling.

## Install without replacing local checks

Every house Node repository must adopt the shared ESLint rules through its normal house-sync review. The house repository hosts and tests the config with ESLint 10.15.0 and eslint-plugin-jsdoc 65.5.0 on Node 24.15 or newer; it does not impose an unrelated style preset. A synced file alone does not enable a downstream gate: track config/script adoption as incomplete until its real discovered-config fixtures pass.

First land the policy-only sync of `.github/dependency-review-config.yml`, then rebase dependency adoption onto that accepted commit. Its managed licence exceptions cover all versions of exactly `parse-statements`, `spdx-exceptions` and `uri-js`, approved in [house #57](https://github.com/Resnovas/.github/pull/57). Dependency review reads the base commit, so adding policy and dependencies in the same PR cannot unblock adoption. Vulnerability checks and the licence allowlist stay unchanged. If local policy already lists exactly these three packages, remove only the duplicate local `allow-dependencies-licenses` key/list during reviewed sync; preserve unrelated keys. A local list with additional packages needs an owner-reviewed migration, not silent deletion or a broader shared exception. On rollback, revert dependent adoption before or together with the policy sync.

1. Review the house sync, including `tools/lint/funnel.mjs`, `tools/verification/` and `tools/dev/pre-commit.mjs`.
2. Add the approved `eslint-plugin-jsdoc` version to the repository's development dependencies. Use the existing ESLint and TypeScript parser; a repository without them needs approval before adding those peers. Keep its lockfile and frozen CI install.
3. Add the exported `funnel` config to editable tests and lint tooling; add `contracts` to editable production TypeScript using the existing parser. Keep the existing parser, language options, Nx restrictions, declaration examples, rationale checks and ratchets. Do not apply to vendored, generated or immutable historical files.
4. Define `verify:static` for lint/type/source checks, including `node tools/verification/docs-budget.mjs`; build only prerequisites those checks need. Define `test:affected` to select tests from staged paths and their dependents using the repository's existing test graph or reviewed path map. Include deletions and both sides of renames. Report a genuine empty selection; never alias it to full `verify`, smoke or evidence collection. Dependency/config changes may affect every test. Define `verify` for the complete existing behavior, smoke, documentation, build and platform gates in CI; do not replace that suite with affected-only proof.
5. Run `node --run setup`. The installer adds pre-commit when `verify:static` and `test:affected` exist. Existing house hooks use the new command after sync, so add `test:affected` in the same adoption PR; a missing command fails rather than falling back to full verification. Exclusive creation preserves commit-msg and existing hooks. Review and compose foreign hooks using only static checks and affected tests; setup will not overwrite them.
6. Add the Markdown registry and repository-owned source inventory/affected-selection adapter described below. Wire their comparison into `verify:static` or a contract test included in `verify`.
7. Add `verify:evidence` to execute affected paths without test-result caching, and `verify:evidence:check` to validate the publication directory. Call `.github/workflows/house-funnel.yml` from existing PR and main-push CI only after those commands are real. Keep merge-group callers and every previous required job. The reusable workflow has no push/PR trigger of its own; the repository caller supplies both. Never collect evidence or run smoke from a commit hook, directly or through a nested script.

To run the commit gate explicitly after staging the complete snapshot:

```sh
node tools/dev/pre-commit.mjs run
```

It executes `node --run verify:static` then `node --run test:affected`, and stops on either failure or a changed working/index tree. Full CI verification remains independently runnable for diagnosis; it is not a prerequisite of every local commit.

### Retain a repository-owned hook

If a native runner already protects staged snapshots or isolates Git's alternate index, retain it. Add this optional property after the local marker in `.agents/surfaces.jsonc`, using the runner's actual package script and existing comment marker:

```json
"preCommit": { "script": "funnel:pre-commit", "marker": "smartcloud-funnel pre-commit" }
```

Both properties are required; unknown properties, shell syntax, multiline markers and missing package scripts fail setup. Omit `preCommit` to use the house runner. Setup exclusively installs or recognizes exactly `#!/bin/sh`, `# <marker>`, `exec node --run <script>` with final newlines. It never overwrites a differing hook, including a previously installed house hook. A maintainer must review any replacement; declaring the native owner is not permission to discard a hook. `--dry-run` inspects without writing.

The native runner must execute `verify:static` then staged `test:affected`, propagate failures and retain before/after snapshot guards. Do not also invoke the house runner or run full verification from the native hook. If verification children clear Git-local environment variables, pass the captured staged-tree identifier explicitly to the affected-test adapter; never silently select the ordinary index. Test that contract in the repository. The installer validates identity and required scripts, not the runner's semantics. Run `node --run setup` twice to verify idempotence and exercise a real commit plus a failing affected-test control.

### Adopt smartcloud's native queue profile

Only `Resnovas/smartcloud` may copy `tools/ci/smartcloud-native.yml` verbatim to `.github/workflows/smartcloud.yml` in its owned adoption PR. Other repositories keep the published-action workflow. Sync the recipe, `tools/ci/smartcloud-native-contract.cjs` and `house-workflow-lint.yml` together. The checker permits CRLF and outer whitespace only; changing steps, comments, pins or conditions requires an upstream recipe review. Do not edit a bot-owned sync branch. Retain smartcloud's existing sync ownership for its native workflow.

The recipe checks repository identity, a positive check-run ID and complete main-based queue metadata before building. It checks out only `refs/heads/main`, installs frozen dependencies without lifecycle scripts, rebuilds without Nx cache and reads main's config. House read-only and full app tokens are minted after building; queue/comment/open-PR events never receive the full app token. Authorized slash comments remain eligible. The checker rejects additional steps, candidate refs/config, missing queue guards, skipped queue actions and broader permissions/tokens. There is no profile switch or general local-action exemption.

In the house source, run `node --test test/workflows.test.mjs` for accepted/rejected workflows, executed metadata guards and event/token fixtures. Downstream, run workflow lint against the copied recipe, then verify actual queue execution, the self check-run ID and aggregation on the exact queued SHA. The static recipe cannot attest branch protection, hosted execution or the safety of trusted main's build/config; retain protection and required checks. Release v2.1.1 supplies the separately delivered merge-group runtime, but a release is not live queue proof. Smartcloud's identity selects this strict profile even if a candidate replaces the local action with a published action. A rollback to that different execution model needs a reviewed upstream contract change; never restore a skipped queue job or disable the checker.

Example flat-config addition, after the existing parser configuration:

```js
import { funnel, contracts } from './tools/lint/funnel.mjs'

// Keep the repository's existing entries and its established exclusions.
export default [
  ...existingConfig,
  { ...funnel, files: ['test/**/*.mjs', 'tests/**/*.ts', 'tools/lint/**/*.mjs'] },
  { ...contracts, files: ['packages/*/src/**/*.ts', 'apps/*/src/**/*.ts'] },
]
```

## Opt into React ownership checks

React repositories can import `reactLifecycle` and `reactUiTimers` from `tools/lint/react.mjs`. Neither is enabled by the base funnel config. They require no new dependency; keep the existing ESLint parser. Both sets use error severity and leave file selection to the caller. The timer rule takes no options; retain the supplied lifecycle options when composing existing rules.

`reactLifecycle` preserves Eventiva's bootstrap/event-owner correction: reject `useEffect` imports and re-exports, default/namespace React imports, literal dynamic React imports and literal CommonJS React loading. Other named React imports remain allowed. Apply it across editable active sources, including backend/runtime/tests as Eventiva does, rather than only components. It does not follow aliases of loaders or computed module names.

`reactUiTimers` enables `house-react/no-zero-delay-ui-timer` only on the UI globs you select. It rejects global `setTimeout` with omitted or literal zero delay, including `+0`/`-0`, optional calls and literal `globalThis`/`window`/`self` members. Genuine delays, local shadows and spread arguments remain allowed; aliases and dynamic delays are not evaluated. Fix state ownership instead of changing zero to one; use scoped Effect scheduling for genuinely timed work. The messages are preserved verbatim from [Eventiva's source revision](https://github.com/Resnovas/Eventiva/commit/9e379bf6a5c6629752d14e822dd673ae51894c81).

For a config without overlapping restriction rules, append these entries after its parser:

```js
import { reactLifecycle, reactUiTimers } from './tools/lint/react.mjs'

export default [
  ...existingConfig,
  { ...reactLifecycle, files: ['**/*.{ts,tsx,mts,js,mjs}'] },
  { ...reactUiTimers, files: ['apps/client/**/*.{ts,tsx}', 'packages/ui-modules/src/**/*.{ts,tsx}'] },
]
```

When a repository already configures `no-restricted-imports`, `no-restricted-modules` or `no-restricted-syntax`, compose their options explicitly: flat config replaces arrays, it does not concatenate them. At every overriding scope, retain local `paths`/`patterns` and append `reactLifecycle.rules['no-restricted-imports'][1].paths` (or the equivalent modules paths); prepend `reactLifecycle.rules['no-restricted-syntax'].slice(1)` to its existing syntax selectors. For example, package export scopes must keep the dynamic-import selector alongside their `ExportAllDeclaration` restriction. A later severity-only setting is not a substitute for combining options. Keep Nx, React Hooks, localization, portability and other existing rules and exclusions unchanged.

Eventiva must retain its current active-source and UI globs, including repeated portable/runtime import restrictions. Replace the local timer plugin only after the shared revision is accepted and synced; retain the real-config boundary suite, updating only the timer rule ID to `house-react/no-zero-delay-ui-timer`. Run passing/failing probes for imports, re-exports, loaders, timers, lexical shadows, server timer controls and package barrels before removing the local copy. `test/funnel-lint.test.mjs` exercises shared policy and composition; it is not proof of downstream adoption.

## Source documentation contracts

Every editable TypeScript function, method, class, interface and type alias needs useful JSDoc explaining its contract, purpose and important constraints. Apply `contracts` only to the repository's editable sources, preserving its reviewed vendored, generated and immutable historical exclusions. Extend discovered-config fixtures to prove ordinary sources are checked and those existing exclusions stay excluded; never grow exclusions to obtain a passing gate.

The shared config enables the following 20 contracts as errors. Every rule in its `jsdoc` plugin delegates to the vendor with the same canonical-header exemption, including additional rules a consumer enables. The existing `house/require-description` and `house/match-description` aliases remain for compatibility; all other enabled rule IDs use `jsdoc/`. Options not listed use eslint-plugin-jsdoc 65.5.0 defaults:

| Rules | Contract |
| --- | --- |
| `require-jsdoc` | All functions, methods, classes, interfaces, type aliases, declared functions and method signatures, including empty bodies and inline callbacks. An explicit arrow selector covers callbacks that the built-in visitor skips. |
| `require-description`, `informative-docs`, `no-blank-block-descriptions` | Prose on every JSDoc block, no leading blank filler, and no name-only restatements. Shared aliases reject `runMain` described as "runs the main entry point". |
| `require-param`, `require-param-description`, `check-param-names` | Document parameters with descriptions and names matching the signature. |
| `require-returns`, `require-returns-description`, `require-throws` | Describe returned values and direct thrown exceptions when detected. Effect error channels and indirect failure constraints still need explicit prose. |
| `check-tag-names`, `no-types`, `valid-types`, `require-template`, `empty-tags` | Valid tags and type syntax, no duplicated TypeScript parameter/return types, documented generic parameters, and no payload on empty tags. |
| `check-alignment`, `multiline-blocks`, `tag-lines` | Aligned comment stars and multiline delimiters; exactly one blank line before tags and none between tags. |
| `match-description` | Sentence-form block, parameter, return, throw and template descriptions: initial capital (or code-led text), final period, question mark or exclamation mark. Grammar and truth still need review. |
| `require-example` | Nonempty examples at named/default/star export boundaries, including aliases and re-exports; public methods/signatures of directly exported classes/interfaces; and declarations marked `@public`. No empty-example autofix. Private helpers and private/protected methods are not forced to carry examples. |

All JSDoc delegates suppress only diagnostics attached to the exact current-year, matching-path header produced from `tools/license/header.txt` by `headerFor`. The synced module's location under `tools/lint/` anchors the repository root and adjacent licence template, independently of ESLint's invocation directory. Root commands and package-local commands such as Nx's `eslint .` use the same repository-relative `@file` identity; relative input filenames still resolve against ESLint's cwd. LF/CRLF and the header checker's optional leading shebang are supported. Changed legal text, a different file path, an ordinary top-of-file comment or a later licence block gets no exemption. Declaration JSDoc, whole-file requirements and invalid rule settings remain checked; a licence header cannot document a declaration. Suppressed header diagnostics cannot offer autofixes that alter legal text. Keep the byte-exact licence-header check required.

Both `funnel` and `contracts` register the same licence-aware `jsdoc` plugin object. If existing entries or vendor presets already register raw `eslint-plugin-jsdoc`, replace only their `plugins.jsdoc` binding with `funnel.plugins.jsdoc`; retain their rules, settings, parser and processor. Do not register raw and adapted plugins under the same key in overlapping scopes. Consumer-added `jsdoc/` rules then receive the exemption without being disabled. The normal house sync delivers the canonical module and licence template to every consuming Node repository; it is not a smartcloud-specific override. A repository that does not consume this config still needs reviewed adoption, not a claim that syncing files enabled lint.

`test/funnel-lint.test.mjs` executes accepted/rejected TypeScript fixtures for all 20 rules both with and without canonical headers, 12 declaration/callback shapes and 13 export forms, plus public/private member controls. Rendered synthetic Eventiva, smartcloud and unrelated Node consumers exercise real config discovery from root/nested directories, additional vendor rules, wrong-path rejection and missing declaration docs. Tests use the parser already locked transitively under the approved JSDoc dependency; consumers keep their own parser. The house repository does not adopt a broad style preset.

Jonathan approved sentence-form descriptions and public/exported examples on 2026-11-20. Write examples on export boundaries even when a symbol is exported later or re-exported from another module; mark other public surfaces `@public` at their declaration. These syntax rules do not follow arbitrary runtime object graphs or execute examples. Keep the repository's explicit public-API inventory and compiling example gates, including smartcloud's existing declaration/example checker.

Judgment remains guidance: explain why meaningful internal phases, invariants, security boundaries and non-obvious decisions exist, rather than narrating syntax. Ensure JSDoc truthfully describes purpose, constraints and failure semantics. No lint can prove those statements true or decide where a rationale is necessary. Eventiva's attached-contract/body-rationale checker, fixtures, prune-only ratchet and strict zero gate remain required; heuristic success is not semantic proof.

## Assert behavior rather than source removal

`house/no-source-absence` follows local source-read initializers and source-code inspection, rejecting negative source-string/file assertions with a corrective message. Tests should execute the affected public path. Assertions about runtime behavior, hidden UI or redacted outputs remain valid. This is bounded lexical analysis, not arbitrary cross-module dataflow: keep behavioral fixtures for aliases, wrappers and config-discovery scopes used by the repository. Do not disable the rule or widen exclusions when a fixture fails.

Files written as fixtures in the same function are test outputs, even with source-code extensions; transformation and redaction assertions on them are legitimate behavior tests. The lint does not certify the meaning of a test or trace arbitrary filesystem aliases.

## Keep the registry in Markdown

Each feature has one fenced `verification` JSON object inside its Markdown guide or combined registry. Prose supplies prerequisites, synthetic input, steps, expected results and unsupported platforms. JSON is embedded metadata, not a second authored registry. Commands are argument arrays, not a shell command assembled from user input. The shared parser validates metadata and never executes it.

````markdown
# Cart total

Use a synthetic cart with two items priced 5 and 12. Invoke the checkout CLI.
The total is 17; the empty cart fails with the documented error.

```verification
{
  "id": "checkout.total",
  "status": "implemented",
  "interfaces": ["cli:checkout"],
  "command": ["node", "--test", "test/checkout.test.mjs"],
  "selector": "cart total and empty cart",
  "assertions": ["total equals 17", "empty cart is rejected"],
  "evidence": ["log"]
}
```
````

Required implemented fields are `id`, `status`, `interfaces`, `command`, `selector`, `assertions` and `evidence`. IDs use lowercase letters, digits, dots and hyphens. `status` is `implemented`, `blocked` or `unimplemented`; the latter two require `reason` and do not claim proof. Evidence kinds are `log`, `screenshot` and `recording`. Unknown fields, duplicate IDs, empty selectors and empty registries fail.

Import `parseRegistry`, `checkCoverage` and `selectFeatures` from `tools/verification/registry.mjs`. Supply `checkCoverage` with an inventory discovered from actual entry points/actions/workflows, independently of the registry. Compute affected IDs from changed files and dependencies, then review the selection. Unknown IDs, duplicate selection and empty selection fail. A docs-only change with no affected executable feature must be reported explicitly by the repository adapter, not represented as a passing empty feature run. The house cannot infer each product's routes or native interfaces.

## Bind evidence to execution

The manifest has `version: 1`, full Git `commit` and `tree` SHA, SHA-256 `registryDigest` of the exact Markdown bytes, `synthetic: true`, `retentionDays: 7`, `audience: "existing-artifact-audience"`, `affected` IDs and `runs`.

Each run records `id`, `status` (`pass`, `fail`, `blocked`, `unimplemented`), `startedAt` and `finishedAt` ISO timestamps. A blocked/unimplemented run needs a `reason` and cannot attach files. An executed run also records the exact `command`, `selector`, positive executed `tests` count, `exitCode`, every assertion as `{name, passed}`, and `files`. Every file has `kind`, relative `path`, byte `sha256` and `reviewed: true`; recordings also have `seconds`, greater than zero and at most 60. A pass requires exit zero and all assertions passing. Missing media, zero tests, partial assertions, stale registry/tree or broadened selection cannot pass.

Obtain commit/tree/affected context independently of the manifest. For local dirty work, use the staged tree only after checking that the working tree matches it; otherwise mark the proof as blocked or capture an explicit dirty-tree digest in the repository adapter. Never label a dirty execution with a clean commit alone. In CI compare against the checked-out revision, which may be a PR merge commit rather than the branch head.

`checkManifest(manifest, context)` checks claims and returns false for a valid non-passing run. `validateEvidence(directory, manifest, context)` additionally checks nonempty file bytes/digests through one open descriptor, rejects escapes, symlinks, duplicates and unlisted files. Use a dedicated publication directory with no concurrent writers; validation cannot lock a later uploader's path reads. `context` contains `{markdown, commit, tree, affected}`. The CLI exits nonzero on invalid or non-passing evidence:

```sh
node tools/verification/evidence.mjs .verification/publish docs/verification.md .verification/context.json
```

For CI publication, call `validateEvidence` in the repository's `verify:evidence:check`. A valid failed run may be published for diagnosis, but the collection job must retain its failing exit code. The publication check validates safety/structure independently of the behavioral result. Never turn a failure into success with `|| true` or `continue-on-error`.

## Keep captures synthetic and reviewed

Use disposable fixtures, generated identities and secret-free browser profiles. Do not record customer sessions, real test data, auth headers, environment dumps or shared databases. A suggestion to obtain real data is a request for access and handling approval, not permission to upload it. Inspect screenshots and recordings, redact sensitive pixels before hashing, and inspect logs before marking `reviewed`. Automated text scanning cannot certify media redaction; a manifest's attestation does not prove it happened.

Capture only the affected feature and necessary neighboring controls, not an entire session. A screenshot shows visual state; an interaction needs a recording of the real pointer/keyboard flow. Nonvisual paths use logs and assertions, not fabricated video. Keep captures and manifests in ignored per-run directories; copy only reviewed files into `.verification/publish/`. The upload directory must contain exactly declared files plus `manifest.json`. Seven days is fixed, not a caller-configurable retention extension. Existing artifact permissions remain unchanged; do not publish to Pages or an external bucket.

## Review candidate-code trust before CI adoption

The reusable workflow grants only `contents: read`, disables checkout credential persistence, runs on a fresh hosted runner, has a 30-minute limit and refuses `pull_request_target`. Do not pass secrets through `secrets: inherit`, use privileged/self-hosted runners, restore credential-bearing caches or expose shared infrastructure to PR code. `install-command` defaults to `npm ci --ignore-scripts`; only reviewed caller code may set it. `node-version` defaults to `24`. Both inputs are repository configuration, never PR title/body fields.

Database-backed PR tests use separately reviewed disposable synthetic fixtures with bounded resources and cleanup. Preserve trusted push/merge-group integration jobs alongside them. A PR proof is not evidence of production permissions. This workflow supplies no database service and cannot approve a product's trust model.

## Enforce document and deployment boundaries

`docs-budget.mjs` checks root README/CONTRIBUTING, docs Markdown and `ai-docs/src` at 400 lines and 32,000 bytes per file. The shared AGENTS entry block is capped at 120 lines and 16,000 bytes. Generated LLMS/host mirrors, vendor/skill sources, legal documents and `docs/archive/` provenance are outside this entry-point budget. These are fixed shared defaults; archive only obsolete material and repair current links. Do not evade the limit with enormous single lines or move active rules into an archive.

The Git inventory includes tracked and non-ignored untracked Markdown, uses NUL-delimited paths, and selects these paths before buffering with no fixed subprocess-output cap. Repository size does not authorize a fallback, truncation or a larger document budget.

Inside `docs/` only, balanced standalone `<!-- linear:generated:start -->` / `<!-- linear:generated:end -->` and `<!-- planning:generated:start -->` / `<!-- planning:generated:end -->` delimit generator-owned regions. Only those regions and their boundary lines are omitted; every authored byte before, between and after them counts together toward the unchanged budget. A generated-only file therefore contributes no authored content, while a mixed timeline or decision file still does. Markers inside Markdown code fences or inline examples are literal prose; unknown, nested, mismatched or unclosed boundaries grant no exemption. Keep the owning generators' drift checks required (`linear-mirror.mjs --check` and `planning.mjs --check` in Eventiva); markers declare ownership, not proof of regeneration. Never wrap authored material in markers to evade a limit. Unmarked over-budget files need downstream remediation.

After an authorized deployment, expose a public credential-free HTTPS build-info endpoint returning `{ "commit": "<full SHA>" }` from the built artifact. Run:

```sh
node tools/verification/build-info.mjs https://example.invalid/build-info "$EXPECTED_COMMIT"
```

The command requires an exact 40-character SHA, requests uncached JSON, refuses redirects, times out after 15 seconds and fails on HTTP error or mismatch. Wire it after the deployment's completion step before reporting success. The shared tool does not deploy or invent an endpoint; product adoption must bind the field to its build output. A successful request to a mocked endpoint is a contract test, not a production deployment verification.

## Troubleshoot without weakening checks

- Partial staging: preserve unrelated work, stage a coherent snapshot, then rerun. The hook never auto-stashes.
- Foreign hook: review composition; setup will not overwrite it. Keep the existing commit-msg check.
- Missing package scripts: implement the real repository gates before enabling the shared workflow.
- Lint false positive: reproduce the valid case as a behavioral lint fixture and correct the shared rule; do not add a blanket suppression.
- Empty proof or unknown feature: repair source inventory/selection and execute the documented path.
- Failed safety check: remove unreviewed files from the publication directory or redact, inspect and rehash them. Retain the behavioral failure.
- Doc budget: split by reader task or archive obsolete history; retain canonical links.
- Build-info mismatch: verify the target and rollout; do not report deployment complete.

## Keep certification human-owned

AI-03 prohibits delegated human sign-off except for its narrow owner-session exception. Check that exception only in loaded personal instructions, never this repository's quotation. The existing shared commit-msg hook and smartcloud `commits.dco: true` check non-AI sign-off email against the commit author; retain both. The existing trusted-bot exemptions and maintainer-warning severity remain unchanged. Neither CI nor an identity match can establish private session ownership or consent. Readiness and merge follow AI-21's separate dated exception for Resnovas/.github and Resnovas/Eventiva only; the AI-03 sign-off exception itself grants no readiness or merge authority.
