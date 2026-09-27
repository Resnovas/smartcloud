## The GitHub service

`@resnovas/integrations.github` is the only package that talks to GitHub, and
the only one that imports Octokit. Everything else takes the `GitHub` service
(`Context.Tag`) from the Effect context and calls the operations on
`GitHubService`, which is bound to one repository (`github.coordinates`). If a
feature needs an endpoint the interface lacks, add a typed operation to
`GitHubService` and implement it in `live.ts`, `memory.ts`, `cache.ts` (reads)
and `dry-run.ts` and `restricted.ts` (writes); `repositoryRequest` and
`graphql` are escape hatches for the settings feature's many endpoints, not a
shortcut around that.

### Layers

| Layer                                           | Use                                                                                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GitHubLive`                                    | The real API: `GITHUB_TOKEN` (read with `Config.redacted`, never unwrapped outside the client) and `GITHUB_REPOSITORY`. `makeLiveGitHub` builds one for any token and repository.                                         |
| `DryRun`                                        | Wraps whichever service is below it: reads pass through, writes are recorded in `DryRunLog`. A `url` field in a recorded raw request keeps only its origin; comment bodies and GraphQL variables are recorded as written. |
| `Restricted`                                    | Wraps it for a read-only token: a write GitHub refuses as `Forbidden` is recorded in `SkippedWrites` and answered as in a dry run.                                                                                        |
| `GitHubMemory(seed)` / `makeMemoryGitHub(seed)` | In memory, for tests; see the testing section.                                                                                                                                                                            |

### Errors

Every operation fails with `GitHubError`, a union of five tagged errors, each
carrying `operation` and GitHub's `detail`:

| Tag                | Meaning                                            | Retried                                 |
| ------------------ | -------------------------------------------------- | --------------------------------------- |
| `NotFound`         | 404: missing, or the token cannot see it.          | No                                      |
| `Forbidden`        | 401 or 403 that is not a rate limit.               | No                                      |
| `RateLimited`      | 429, or 401/403 whose message says rate limit.     | Yes, with backoff                       |
| `ValidationFailed` | Any other 4xx except 408: the request's own fault. | No                                      |
| `Unavailable`      | Timeouts, 5xx, network failures.                   | Yes, except calls that create something |

`fromStatus` and `fromGraphqlErrors` do the mapping. Retries use exponential
backoff from one second, jittered, at most three times. A call that creates
something (a comment, review, label, check run, branch, pull request, REST
`POST` or GraphQL mutation) is not retried on an outage, because GitHub may
already have acted and a repeat would duplicate it. Handle the tags you
expect with `Effect.catchTag`; a `NotFound` on an optional file is normal.

### Caching and ETags

Two layers of reuse keep a run within its rate limit:

- **Request cache** (`cacheReads` in `cache.ts`): every read is an Effect
  `Request`, so equal reads share one cache entry and concurrent equal reads
  share one call, for the life of the service. Each write invalidates exactly
  the families of reads it can change (a label write the labels, a comment
  write the comments, a proposal the files, pull requests and checks, a raw
  write or GraphQL mutation everything), so a run never reads stale data after
  its own write. Sweeps and pollers (`listClosedUnlocked`,
  `listOpenPullRequests`, `listCommitChecks`) are never cached.
- **Conditional requests** (`observedClient` in `live.ts`): a repeated `GET`
  sends the last response's ETag as `If-None-Match`; GitHub does not count a
  `304 Not Modified` against the rate limit, and the stored response is
  returned.

### Telemetry

Each call is traced as `smartcloud.github.<operation>`, counted in
`smartcloud.github.requests` and timed in `smartcloud.github.duration_ms`,
recording only the operation, the outcome and the HTTP status.
`githubUsage` reports the calls a run made and the rate limit left.
