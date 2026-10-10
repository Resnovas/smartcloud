# Write mechanics for the skills store

Hard-won reliability rules for pushing content via the `skill-*` tools (through `posthog:exec`). The `skills-store` and `working-with-skills` skills cover the tool surface; this file is the layer that keeps multi-write sessions from corrupting content.

## Golden rules

- Run `info <tool>` before every `call`. Tool names drift (whole tool families get renamed); the tool's own schema is the source of truth over any cached notes - including these.
- **Smallest primitive wins.** `edits` (body find/replace) and `file_edits` (one file, find/replace) beat `skill-file-create`/`-delete`/`-rename`, which beat full-`body` replace. Full-body replacement is ONLY for genuine restructures - for a one-line change it risks silently dropping unrelated content.
- Every successful write publishes a new immutable version and bumps `version` by 1. `skill-update` requires `base_version`; chain it call-to-call (grep `version:` from the previous result). Immutability means nothing is ever lost - old versions are the archive.
- Path param names are not uniform: `file-get` / `file-delete` take `file_path`; `file-create` takes `path`; `file-rename` takes `old_path` / `new_path`. Wrong key fails loudly.

## Writing large content

Content is passed as an inline JSON string - there is no content-from-file option and no base64 decode.

- **Pre-escape with Python**: `json.dumps(content, ensure_ascii=False)`, write the full `call skill-... {json}` command to a scratch file, read it back, and copy that one line verbatim into the exec command. Never hand-escape quotes/newlines for anything non-trivial.
- **≤ ~10K chars**: single-shot `skill-file-create` round-trips byte-perfect (the server strips only a single trailing newline).
- **> ~10-15K chars**: sentinel + ordered chunk appends. Create the file containing just `@@END@@`, then per chunk run `skill-update` with `file_edits: [{"old": "@@END@@", "new": "<chunk>@@END@@"}]`, finally strip the sentinel.
  - **Seam gotcha:** each append drops the single `\n` immediately before the sentinel, so a blank line (`\n\n`) at a chunk seam collapses to `\n`. Fix afterward with targeted `file_edits` and verify with a `--json skill-file-get` diff against the local source.
- **A huge echo is not an error.** Write tools echo the whole skill back (can be ~60K chars), which trips the client's "result exceeds max tokens / persisted to file" handling. The write succeeded - grep the persisted output for `version:` to confirm and to get the next `base_version`.
- To replace a file wholesale: `skill-file-delete` then `skill-file-create` (safe because versions are immutable). To *edit* a file: `file_edits` - never delete-and-recreate.

## Verification

- After any multi-chunk write, round-trip: `call --json skill-file-get` and diff against the local source file.
- After a restructure, `call skill-get` and read the `outline` + `files` manifest to confirm the shape landed.
