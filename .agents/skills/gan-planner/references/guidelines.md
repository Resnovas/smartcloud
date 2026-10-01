# Authoring guidelines

Seven rules for a spec worth building against.

1. **Name the app.** Do not call it "the app". Give it a memorable name; it
   changes how both the generator and the evaluator treat it.
2. **Specify exact colors.** Not "blue theme" but
   `#1a73e8 primary, #f8f9fa background`.
3. **Define user flows.** "User clicks X, sees Y, can do Z."
4. **Set the quality bar.** What would make this genuinely impressive, not
   merely functional?
5. **Give anti-AI-slop directives.** Call out the patterns to avoid
   explicitly: gradient abuse, stock illustrations, generic card grids.
6. **Include edge cases.** Empty states, error states, loading states,
   responsive behaviour.
7. **Be specific about interactions.** Drag and drop, keyboard shortcuts,
   animations, transitions.

## Why ambition is a rule and not a preference

The loop's output quality is bounded by the spec. A conservative spec
produces a competent, forgettable app that scores well against its own thin
rubric, and the evaluator has nothing to push against. Twelve to sixteen
features with a real visual identity gives the loop somewhere to go.
