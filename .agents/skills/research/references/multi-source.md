# Multi-source mode

Use when the question splits into distinct subtopics that need synthesising.

## Step 1: Create and save a research plan

Before delegating anything:

1. **Create a research folder** relative to the working directory, so the
   files stay organised rather than cluttering it:

   ```bash
   mkdir research_[topic_name]
   ```

2. **Analyse the question** and break it into distinct, non-overlapping
   subtopics.

3. **Write the plan** to `research_[topic_name]/research_plan.md`, covering
   the main question, the subtopics, what each is expected to produce, and
   how the results will be synthesised.

Sizing:

- Simple fact-finding: 1 to 2 subtopics
- Comparative analysis: one subtopic per comparison element, maximum 3
- Complex investigation: 3 to 5 subtopics

## Step 2: Delegate to subagents

For each subtopic, spawn a research subagent with a clear, specific question
written without acronyms, instructions to write findings to
`research_[topic_name]/findings_[subtopic].md`, and a budget of 3 to 5 web
searches.

Run up to three in parallel.

Template:

```text
Research [SPECIFIC TOPIC]. Gather information from the web.
When done, save your findings to
research_[topic_name]/findings_[subtopic].md.
Include key facts, relevant quotes, and source URLs.
Use 3-5 web searches maximum.
```

File-based communication is deliberate: subagents save findings to files
rather than returning them, so the synthesis step reads a stable artifact
rather than a transcript.

## Step 3: Synthesise

1. List the research folder to see which files were actually created, then
   read them by path. Read local files; fetch URLs with a fetch tool, not a
   file reader.
2. Write a response that answers the original question, integrates every
   subtopic, cites specific sources with URLs taken from the findings files,
   and names any gaps or limitations.
3. Optionally write a final report to
   `research_[topic_name]/research_report.md`.

## Best practices

- Plan before delegating. Always write the plan file first.
- Keep subtopics genuinely non-overlapping, or you pay twice for one answer.
- Read every findings file before writing the synthesis.
- Stop appropriately. Three to five searches per subtopic is usually enough,
  and over-researching is a real cost.
