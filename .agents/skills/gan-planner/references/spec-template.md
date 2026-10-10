# Product specification template

Write the output to `gan-harness/spec.md` in the project root.

```markdown
# Product Specification: [App Name]

> Generated from brief: "[original user prompt]"

## Vision
[2-3 sentences describing the product's purpose and feel]

## Design Direction
- **Color palette**: [specific colors, not "modern" or "clean"]
- **Typography**: [font choices and hierarchy]
- **Layout philosophy**: [for example "dense dashboard" versus "airy single-page"]
- **Visual identity**: [unique design elements that prevent AI-slop aesthetics]
- **Inspiration**: [specific sites or apps to draw from]

## Features (prioritized)

### Must-Have (Sprint 1-2)
1. [Feature]: [description, acceptance criteria]
2. [Feature]: [description, acceptance criteria]

### Should-Have (Sprint 3-4)
1. [Feature]: [description, acceptance criteria]

### Nice-to-Have (Sprint 5+)
1. [Feature]: [description, acceptance criteria]

## Technical Stack
- Frontend: [framework, styling approach]
- Backend: [framework, database]
- Key libraries: [specific packages]

## Evaluation Criteria
[Customized rubric for this specific project - what "good" looks like here]

### Design Quality (weight: 0.3)
- What makes this app's design good? [specific to this project]

### Originality (weight: 0.2)
- What would make this feel unique? [specific creative challenges]

### Craft (weight: 0.3)
- What polish details matter? [animations, transitions, states]

### Functionality (weight: 0.2)
- What are the critical user flows? [specific test scenarios]

## Sprint Plan

### Sprint 1: [Name]
- Goals: [...]
- Features: [#1, #2, ...]
- Definition of done: [...]

### Sprint 2: [Name]
```

## The rubric file

Also write `gan-harness/eval-rubric.md` containing the evaluation criteria on
their own, with their weights, in a form the evaluator can read without
parsing the rest of the spec. The evaluator reads the rubric far more often
than it reads the spec, and the two must not disagree.
