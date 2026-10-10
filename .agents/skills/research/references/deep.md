# Deep research mode

> Requires `parallel-cli` 0.3.0 or later. If a command below errors with
> `no such option`, `no such command` or `unrecognized arguments`, the user
> is on an older CLI. Tell them to run `parallel-cli update`, or
> `pipx upgrade parallel-web-tools` if installed that way, then retry.

## When to use this, and when not to

Only when the user explicitly requests deep or exhaustive research. This is
10 to 100 times slower and more expensive than a normal multi-source run.
For "research X", a quick lookup, or a fact-check, use another mode.

## Step 1: Start the research

Choose a descriptive filename from the topic, lowercase with hyphens and no
spaces. Reuse it in step 2 as `-o "$FILENAME"`.

```bash
parallel-cli research run "$TOPIC" --processor pro-fast --text --no-wait --json
```

`--text` asks the API for a Markdown report with inline citations rather
than the default structured JSON. That is what most people want from deep
research. Drop it if the user explicitly wants JSON. With `--text` you can
also pass `--text-description "Keep under 1500 words, focus on M&A activity"`
to steer length, format or focus.

**Never omit `--no-wait`.** Without it the command blocks for minutes and
will hit the tool execution timeout.

For a follow-up where you know the `interaction_id`, chain the context and
drop to a lighter processor, since the heavy lifting is already done:

```bash
parallel-cli research run "$TOPIC" --processor lite-fast --text --no-wait --json \
  --previous-interaction-id "$INTERACTION_ID"
```

### Processor tiers

| Processor | Expected latency | Use when |
|-----------|-----------------|----------|
| `lite-fast` | 10-60s | Quick lookups, follow-ups |
| `base-fast` | 15-100s | Simple questions |
| `core-fast` | 1-5 min | Moderate research |
| `pro-fast` | 2-10 min | **Default**: exploratory, good depth-to-speed balance |
| `ultra-fast` | 5-25 min | Multi-source deep research, roughly twice the cost |
| `ultra2x-fast` / `ultra4x-fast` / `ultra8x-fast` | up to 2 hr | Hardest questions, only when explicitly requested |

The `-fast` tiers use cached web data. The non-fast variants re-fetch fresher
data: slower, but better for events from the last day or two. Default to
`-fast`. Run `parallel-cli research processors` for the current list.

Parse the JSON to extract `run_id`, `interaction_id` and the monitoring URL,
then immediately tell the user that research has started, the expected
latency for the tier chosen, and the monitoring URL. They can background the
polling and carry on working.

## Step 2: Poll for results

```bash
parallel-cli research poll "$RUN_ID" -o "$FILENAME" --timeout 540
```

- Use `--timeout 540`, nine minutes, to stay inside tool execution limits.
- Do **not** pass `--json`: the full output is large and floods context.
  `-o` writes to files instead.
- `$FILENAME.json` is always written. `$FILENAME.md` is written only if step
  1 used `--text`.
- The poll prints an executive summary to stdout on completion. Share that;
  it gives the user the overview without opening anything.
- Pass `--force` when re-polling if you want to overwrite existing files.

If the poll times out, the research is still running server side. Tell the
user, and re-run the same poll command to keep waiting.

## Response format

After step 1, share the monitoring URL, for progress only. It is not the
report.

After step 2:

1. Share the executive summary the poll printed.
2. Give the file paths: `$FILENAME.md` for the report if `--text` was used,
   `$FILENAME.json` for metadata and basis.
3. Share the `interaction_id` and say follow-up questions can build on this
   research.

Do not re-share the monitoring URL after completion; the results are in the
files. Do not read the file contents into context unless asked.

## Setup and billing

If `parallel-cli` is not found, install and authenticate it before retrying.

If a command returns `403`, balance is likely required. Offer to run
`parallel-cli balance get`, and ask for explicit confirmation before running
`parallel-cli balance add <amount_cents>`. Then retry.
