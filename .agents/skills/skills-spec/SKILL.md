---
name: skills-spec
description: Reference for the Agent Skills format specification (agentskills.io) - the open SKILL.md format used by Claude Code, Codex, Copilot, and other agents. Covers required frontmatter (name, description), optional fields (license, compatibility, allowed-tools, metadata), directory layout (scripts/, references/, assets/), progressive disclosure (~100-token metadata → <5000-token body → on-demand resources), description-writing rules, and links to the canonical source pages so you can re-check for spec evolutions. Use when authoring a new skill, reviewing or refactoring an existing SKILL.md, deciding what belongs in the body vs. a reference file, troubleshooting a skill that won't trigger, or any question about the agentskills.io spec, Anthropic's open skills format, or 'how do I write a SKILL.md'.
---
# Agent Skills specification

Quick reference for the open Agent Skills format - the `SKILL.md` shape used by Claude Code, GitHub Copilot, OpenAI Codex, and other agents.

## Canonical sources - re-check these for spec evolution

This skill condenses pages on agentskills.io. **If you're investigating a subtle question about valid frontmatter, naming, or a feature that might be newer than this skill, fetch the canonical page directly.** The spec is a living document and this skill may lag.

- Specification - <https://agentskills.io/specification> ([raw markdown](https://agentskills.io/specification.md))
- Best practices - <https://agentskills.io/skill-creation/best-practices> ([raw](https://agentskills.io/skill-creation/best-practices.md))
- Optimizing descriptions - <https://agentskills.io/skill-creation/optimizing-descriptions> ([raw](https://agentskills.io/skill-creation/optimizing-descriptions.md))
- Quickstart - <https://agentskills.io/skill-creation/quickstart> ([raw](https://agentskills.io/skill-creation/quickstart.md))
- Using scripts - <https://agentskills.io/skill-creation/using-scripts> ([raw](https://agentskills.io/skill-creation/using-scripts.md))
- Evaluating skills - <https://agentskills.io/skill-creation/evaluating-skills> ([raw](https://agentskills.io/skill-creation/evaluating-skills.md))
- Adding skills support to your agent - <https://agentskills.io/client-implementation/adding-skills-support> ([raw](https://agentskills.io/client-implementation/adding-skills-support.md))
- Docs index for LLMs - <https://agentskills.io/llms.txt>
- Spec & SDK source - <https://github.com/agentskills/agentskills>
- Reference validator (`skills-ref`) - <https://github.com/agentskills/agentskills/tree/main/skills-ref>
- Anthropic example skills - <https://github.com/anthropics/skills>

## At a glance

A skill is a directory whose entry point is a `SKILL.md` with YAML frontmatter + Markdown body:

```
my-skill/
├── SKILL.md          # required: metadata + instructions
├── scripts/          # optional: executable code
├── references/       # optional: docs the agent loads on demand
├── assets/           # optional: templates, schemas, data
└── ...               # any additional files or directories
```

Progressive disclosure (≈100-token name + description at startup → full body when activated → resources on demand) is the design principle the rest of the spec serves. Keep `SKILL.md` ≤ ~500 lines / 5000 tokens; move long content to `references/` and tell the agent *when* to load it.

## Frontmatter

| Field           | Required | Constraints |
|-----------------|----------|-------------|
| `name`          | yes      | 1-64 chars, lowercase `[a-z0-9-]`, no leading/trailing/consecutive hyphens, must equal parent directory name |
| `description`   | yes      | 1-1024 chars; covers what the skill does *and* when to use it |
| `license`       | no       | License name, or pointer to a bundled license file |
| `compatibility` | no       | ≤500 chars; required products / packages / network access |
| `metadata`      | no       | Free-form `string → any` map; namespace your keys to avoid client clashes |
| `allowed-tools` | no       | Space-separated string of pre-approved tools (experimental, support varies) |

Example with all optional fields:

```yaml
---
name: pdf-processing
description: >-
  Extract PDF text and tables, fill PDF forms, merge multi-page PDFs.
  Use when the user mentions PDFs, forms, or document extraction - 
  even if they don't say "PDF" directly (e.g. "extract the table from
  this attachment").
license: Apache-2.0
compatibility: Requires Python 3.10+ and uv
allowed-tools: Bash(uv:*) Read Write
metadata:
  author: example-org
  version: "1.0"
---
```

### `name`

- 1-64 chars, lowercase letters, digits, hyphens
- No leading/trailing hyphen, no `--`
- **Must match the parent directory name**

Valid: `pdf-processing`, `data-analysis`, `code-review`
Invalid: `PDF-Processing`, `-pdf`, `pdf--processing`

### `description` - the single most important field

It carries the entire weight of triggering - it's the only field loaded into context at startup. Hard limit: 1024 chars.

From <https://agentskills.io/skill-creation/optimizing-descriptions>:

- **Imperative voice.** "Use this skill when…" not "This skill does…"
- **User intent, not implementation.** Match what the user asked for, not the skill's internals.
- **Be pushy.** Spell out non-obvious activation contexts: "even if they don't explicitly mention 'CSV' or 'analysis.'"
- **Concise but complete.** Cover what the skill does *and* when to use it.
- **Agents typically only consult skills for non-trivial tasks.** A simple one-step request may not trigger even with a perfect description - that's fine.

Good vs poor:

```yaml
# Poor - too narrow, no "when"
description: Process CSV files.

# Good - what + when + signal-words for buried prompts
description: >-
  Analyze CSV and tabular data files - compute summary statistics, add
  derived columns, generate charts, and clean messy data. Use when the
  user has a CSV, TSV, or Excel file and wants to explore, transform,
  or visualize it, even if they don't explicitly mention "CSV" or
  "analysis."
```

### `license`

Keep it short - either a license name (`MIT`, `Apache-2.0`, `Proprietary`) or a pointer to a bundled file (`Proprietary. LICENSE.txt has complete terms`).

### `compatibility`

Use only if the skill has real environment requirements. Most skills don't need it.

```yaml
compatibility: Designed for Claude Code (or similar products)
compatibility: Requires git, docker, jq, and internet access
compatibility: Requires Python 3.14+ and uv
```

### `metadata`

Free-form. Namespace keys to avoid client collisions:

```yaml
metadata:
  author: example-org
  category: visualization
  org.example.internal-id: abc-123
```

### `allowed-tools` (experimental)

Space-separated string of pre-approved tools. Support varies between agent implementations:

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

## Body content

No format restrictions. The spec recommends:

- Step-by-step instructions
- Concrete examples (input → output)
- Common edge cases / gotchas

The whole body loads when the skill activates. **Keep it under 500 lines / 5000 tokens.** Split detail into `references/` and link from the body.

### Authoring principles (from the best-practices doc)

1. **Start from real expertise.** Extract from a hands-on task, or synthesize from real artifacts (runbooks, code-review comments, incident notes). Asking an LLM to invent a skill from generic training knowledge produces vague advice.
2. **Add what the agent lacks; omit what it knows.** Skip explanations of common formats/concepts. Project-specific conventions, gotchas, and tool choices earn their tokens.
3. **One coherent unit.** Like a function: one job. Too narrow → multiple skills load for one task. Too broad → won't trigger precisely.
4. **Match specificity to fragility.** Be prescriptive where order matters or operations are destructive; give the agent freedom (and explain *why*) where multiple approaches are valid.
5. **Provide defaults, not menus.** Pick a default; mention alternatives briefly.
6. **Procedures over declarations.** Teach how to approach the *class* of problem, not the answer to one instance.
7. **Iterate against real runs.** Read execution traces, not just final outputs. When the agent gets it wrong, add the correction to a `## Gotchas` section.

### High-leverage patterns

- **Gotchas section** - environment-specific facts that defy reasonable assumptions (soft-deletes, name aliases across services, misleading health checks). Keep these in `SKILL.md` so the agent reads them *before* tripping over them.
- **Output templates** - short ones inline; longer/conditional ones in `assets/`.
- **Checklists** for multi-step workflows with dependency between steps.
- **Validation loops** - do work → run validator → fix → repeat.
- **Plan-validate-execute** for batch/destructive ops - write an intermediate plan file, validate against a source of truth, *then* execute.
- **Bundle reusable scripts** - when iteration shows the agent reinventing the same logic, extract it to `scripts/`.

## Optional directories

### `scripts/`

Executable code the skill tells the agent to run. Two patterns:

- **One-off commands** (no script file) when an existing tool already does the job: `uvx ruff@0.8.0 check .`, `npx eslint@9 --fix .`, `go run github.com/.../tool@v1.2.3`. Pin versions; declare prerequisites in `compatibility`.
- **Self-contained scripts** with inline dependency declarations:
  - Python: PEP 723 (`# /// script` block) → `uv run scripts/foo.py`
  - Deno / Bun: import specifiers like `npm:cheerio@1.0.0` directly
  - Ruby: `require 'bundler/inline'` + `gemfile do … end`

Design scripts for agentic use:

- **No interactive prompts** - agents can't respond to TTY input.
- **`--help` is the agent's manual** - brief description, flags, examples.
- **Helpful error messages** - say what was wrong, what was expected, what to try.
- **Structured output** (JSON / CSV / TSV) on stdout; diagnostics on stderr.
- **Idempotent** - retries shouldn't break things.
- **Predictable output size** - default to summaries; support `--offset` or `--output` for full data.
- **Meaningful exit codes**, documented in `--help`.

### `references/`

Docs the agent loads on demand. The spec recommends per-topic files (`REFERENCE.md`, `FORMS.md`, `finance.md`, …). **Tell the agent *when* to load each:** "Read `references/api-errors.md` if the API returns a non-200 status code." Generic "see references/ for details" doesn't trigger reliably.

### `assets/`

Static resources - document templates, config templates, lookup tables, schemas, images. Reference from `SKILL.md` only when needed.

## File references

Use **relative paths from the skill root** in `SKILL.md` and in support files inside `references/`/`scripts/` - the agent runs commands from the skill directory:

```markdown
See [the reference guide](references/REFERENCE.md) for details.

Run the extraction script:

    bash scripts/extract.sh "$INPUT"
```

Keep references one level deep. Avoid chains of references that point to other references.

## Progressive disclosure - the token budget

| Stage      | What loads                                                           | Approx size         |
|------------|------------------------------------------------------------------------|---------------------|
| Discovery  | `name` + `description` (every available skill)                       | ~100 tokens each    |
| Activation | full `SKILL.md` body (only the chosen skill)                         | ≤5000 tokens recommended |
| On demand  | individual files in `scripts/` / `references/` / `assets/`           | only what's referenced |

Two practical implications:

1. The `description` *is* your activation prompt - invest disproportionate effort here.
2. Long content goes in `references/`, with explicit "load this if X" triggers in the body.

## Validation

The Anthropic-maintained reference library validates frontmatter and naming:

```bash
# https://github.com/agentskills/agentskills/tree/main/skills-ref
skills-ref validate ./my-skill
```

Run it (or your client's equivalent linter) before publishing.

## Triggering - testing your description

Descriptions are the single biggest reason a "perfect" skill goes unused. The optimizing-descriptions guide describes a full eval loop; the minimum viable version:

1. Write 16-20 trial prompts: ~half should trigger, ~half shouldn't.
   - **Should-trigger** - vary phrasing, explicitness, length, complexity. Include cases where the connection isn't obvious.
   - **Should-not-trigger** - **near-misses** (shared keywords, different intent). That's what separates a precise description from a broad one.
2. Run each prompt through the agent multiple times (≥3) to compute a trigger rate.
3. Split into ~60% train / ~40% validation. Iterate against the train set; check generalization against the validation set.
4. Adjust the description: too narrow → broaden scope; too broad → add specificity about what the skill is *not* for. Avoid adding keywords from individual failed queries - that's overfitting.

The [`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator) skill from Anthropic automates this loop end-to-end.

## Minimum viable skill

```
roll-dice/
└── SKILL.md
```

```markdown
---
name: roll-dice
description: Roll dice using a random number generator. Use when asked to roll a die (d6, d20, etc.), roll dice, or generate a random dice roll.
---

To roll a die, run:

    echo $((RANDOM % <sides> + 1))

Replace `<sides>` with the number of sides on the die (e.g. 6, 20).
```

One file, one folder, two frontmatter fields - that's a complete skill.

## Pre-publish checklist

- [ ] `name` matches the parent directory name and is valid kebab-case (`[a-z0-9-]`, no leading/trailing/consecutive hyphens)
- [ ] `description` is ≤1024 chars, imperative, covers what + when, includes signal words for buried prompts
- [ ] Body is ≤500 lines / 5000 tokens; long content moved to `references/`
- [ ] Each `references/` file has an explicit "load this if X" cue in the body
- [ ] Scripts have `--help`, structured output, no interactive prompts
- [ ] Tested with a few real prompts - agent activated on the right ones, passed on the wrong ones
- [ ] Ran `skills-ref validate` (or the client-equivalent linter)

---

**When in doubt, fetch <https://agentskills.io/specification.md> or the relevant subpage directly.** This skill summarizes a living spec and may lag the canonical source.