# Testing protocol

## Before testing: record the mode

The requested mode is not proof its tools were available. If the browser
tool cannot be called, switch to a documented fallback and report the
degradation rather than silently scoring a static review as a live browser
evaluation.

## Driving the browser

The host agent's browser tool is snapshot-and-ref based rather than selector
based: read the page, then act on a ref from that read. Open the tab with a
stable `label` so later calls can pass the same `targetId`.

```text
browser action="status"
browser action="open"       url="http://localhost:${GAN_DEV_SERVER_PORT:-3000}" label="gan"
browser action="snapshot"   targetId="gan" query="submit"
browser action="act"        targetId="gan" ref="<ref from snapshot>"
browser action="screenshot" targetId="gan" labels=true
browser action="errors"     targetId="gan"
browser action="requests"   targetId="gan"
```

Snapshot again after anything that navigates or opens a modal, because refs
go stale.

`errors` and `requests` are how you catch console errors and failed network
calls. Score those even when the UI looks right: an app that works and logs
a stream of errors is not finished.

## Step 1: Read the inputs

```text
gan-harness/eval-rubric.md        project-specific criteria
gan-harness/spec.md               feature requirements
gan-harness/generator-state.md    what was built this iteration
```

## Step 2: The four-part sweep

### A. First impression, 30 seconds

- Does the page load without errors?
- What is the immediate visual impression?
- Does it feel like a real product or a tutorial project?
- Is there a clear visual hierarchy?

### B. Feature walk-through

For each feature in the spec:

1. Navigate to it.
2. Test the happy path.
3. Test edge cases: empty inputs; very long inputs, 500 characters or more;
   special characters including `<script>`, emoji and unicode; rapid
   repeated actions such as double-click and spam submit.
4. Test error states: invalid data, network-like failures, missing required
   fields.
5. Screenshot each state.

### C. Design audit

1. Colour consistency across all pages.
2. Typography hierarchy: headings, body, captions.
3. Responsive behaviour at 375px, 768px and 1440px.
4. Spacing consistency: padding, margins.
5. Look for AI-slop indicators such as generic gradients and stock patterns,
   alignment issues, orphaned elements, inconsistent border radii, and
   missing hover, focus or active states.

### D. Interaction quality

1. Test every clickable element.
2. Keyboard navigation: Tab, Enter, Escape.
3. Loading states exist rather than instant renders.
4. Transitions and animations: smooth, and purposeful?
5. Form validation: inline, on submit, or real time?

## Mode fallbacks

### `browser` mode, the default

Full interaction as described above.

### `screenshot` mode

Screenshots only, analysed visually. Less thorough, but works when
interaction is unavailable. Say so in the report.

### `code-only` mode

For APIs and libraries with no UI, or when no browser is reachable at all.
Run the tests, check the build, analyse code quality. Report explicitly that
nothing was driven.

```bash
pnpm build 2>&1 | tee /tmp/build-output.txt
pnpm test  2>&1 | tee /tmp/test-output.txt
npx --no-install eslint . 2>&1 | tee /tmp/lint-output.txt
```
