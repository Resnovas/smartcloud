---
applyTo: 'packages/runtime/**,packages/integrations.github/**,apps/action/**'
---

# Token handling and the GitHub API

These packages hold smartcloud's token handling and every GitHub API call.

- The action authenticates with `ACCESS_TOKEN` and falls back to the workflow token. On a run from a fork, Dependabot or another outside trigger, only the workflow token is available, so a feature that needs the personal access token turns itself off with a notice instead of failing the run.
- A token is never logged, written to a report or telemetry, or sent anywhere but the GitHub API.
- Input from a pull request, issue or configuration file reaches a request only as encoded parameters, and a pattern from a configuration file only through the `Pattern` schema and `compilePattern` in `@resnovas/conditions`.
- A new permission or token scope is asked for only by the feature that uses it, and documented in `docs/`.

In a review, a breach of these rules is a security finding and blocks the merge ([APPROVAL_POLICY.md](../../APPROVAL_POLICY.md#ap-31)).
