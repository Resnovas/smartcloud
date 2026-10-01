# Primary sources mode

The cheapest mode. Use it when the question has an authoritative answer
somewhere and the job is to go and get it.

Spin up a **background agent** to do the reading, so you keep working while
it runs.

Its job:

1. Investigate the question against **primary sources**: official docs,
   source code, specs, first-party APIs. Not a secondary write-up of them.
   Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repository already keeps such notes. Match the existing
   convention; if there is none, put it somewhere sensible and say where.

## Why primary sources specifically

A secondary write-up introduces a second author's interpretation and a
second opportunity for staleness, and it usually drops the caveats. When the
recap and the spec disagree, the spec is right and you will not know it
unless you read the spec.

Where the primary source is genuinely unavailable - paywalled, withdrawn, or
never published - say so explicitly in the findings rather than quietly
substituting the recap.
