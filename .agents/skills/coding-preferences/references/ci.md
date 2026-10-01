# CI, merge gates, and review bots

Preferences and rationale only. For current CLI flags and YAML schemas, call Context7 (`nx`, Trunk, CodeRabbit).

---

## Nx build pipelines and self-healing CI

**Preference:** Nx owns monorepo task graph, caching, affected runs, and CI orchestration. Prefer Nx Cloud self-healing (`nx fix-ci` / equivalent) so agents can propose fixes for flaky or broken CI from known failure patterns.

**Rationale:** Deterministic task graph plus remote cache beats ad-hoc scripts. Self-healing reduces human time on transient CI failures without inventing free-form patches outside the monorepo rules.

### Hard rules

- Required checks come from Nx targets, not from AI reviewers alone
- Prefer `nx affected` over full-repo rebuilds when the graph allows it

---

## Trunk merge queues and flaky tests

**Preference:** Use Trunk (or equivalent) for merge queues and flaky-test quarantine. Quarantine flaky tests rather than deleting them or disabling the suite.

**Rationale:** Merge queues protect main. Quarantine keeps signal without silently deleting coverage.

### Hard rules

- Never delete a failing test to green the build
- Quarantined tests remain tracked until fixed or intentionally retired with a written reason

---

## Smartcloud code-driven PR and issue rules

**Preference:** Prefer Resnovas/smartcloud (or equivalent) for **code-driven** PR and issue conventions: labels, title rules and policy checks. Releases in an Nx workspace use Nx release (conventional commits, tag-driven versions), not release-please. Do not rely on AI chat to apply those conventions.

**Rationale:** Conventions that live as reviewable code are auditable and consistent across agents and humans.

---

## AI pull request review

**Preference:** AI review bots (CodeRabbit and peers) are **advisory**. They do not replace human review, Nx/Trunk gates, or smartcloud conventions.

### Hard rules

- Config and path instructions live in-repo
- Prefer `request_changes_workflow: false` (or equivalent) so bots comment without being the sole merge blocker
- When bots disagree with Nx/Trunk, trust the deterministic gates first