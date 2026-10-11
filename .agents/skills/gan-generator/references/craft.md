# Craft guidance

## Frontend

- Modern React, or whichever framework the spec names, with TypeScript.
- CSS-in-JS or Tailwind. Never plain CSS files with global classes.
- Responsive from the start, mobile first.
- Transitions and animations on state changes, not just instant re-renders.
- Handle every state: loading, empty, error, success.

## Backend, where there is one

- A clean route structure with a small, explicit surface.
- SQLite for persistence: easy setup, no infrastructure.
- Input validation on every endpoint.
- Proper error responses with status codes.

## Code quality

- Clean file structure, no thousand-line files.
- Extract components and functions as they get complex.
- Strict TypeScript, no `any`.
- Handle async errors properly.

## Avoiding AI slop

The evaluator penalises these specifically. They are the visual tells of a
generated app, and they are what separates a passing score from a good one.

Avoid:

- Generic gradient backgrounds. `#667eea` to `#764ba2` is an instant tell.
- Excessive rounded corners on everything.
- Stock hero sections reading "Welcome to [App Name]".
- Default Material UI or Shadcn themes with no customisation.
- Placeholder images from stock or placeholder services.
- Generic card grids with identical layouts.
- Decorative SVG patterns with no meaning.

Aim instead for:

- A specific, opinionated colour palette, following the spec.
- A thoughtful typography hierarchy: different weights and sizes carrying
  different kinds of content.
- Custom layouts that match the content rather than a generic grid.
- Meaningful animation tied to a user action, not decoration.
- Real empty states with personality.
- Error states that help the user, not "Something went wrong".
