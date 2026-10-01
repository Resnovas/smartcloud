# Review priorities (React-specific only)

Generic TypeScript concerns belong to `typescript-reviewer`. Everything here
is React.

## CRITICAL - React security

- **`dangerouslySetInnerHTML` with unsanitized input**: user-controlled HTML
  rendered without DOMPurify or an equivalent allowlist sanitizer. Halt the
  review until the source is documented and sanitisation is at the same call
  site.
- **`href` or `src` with unvalidated user URLs**: `javascript:` and `data:`
  schemes execute code. Require URL scheme validation.
- **Server Action without input validation**: a `"use server"` function
  accepting `FormData` or arguments without a schema. Treat it as a public
  API endpoint, because it is one.
- **Secret in the client bundle**: `NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*`,
  or any client-imported env var holding a private key, token or
  service-side secret.
- **`localStorage` or `sessionStorage` for session tokens**: readable by any
  XSS. Require httpOnly cookies.

## CRITICAL - Hook rules

- **Conditional hook call**: a hook inside `if`, `for`, `&&`, a ternary, or
  after an early return. `eslint-plugin-react-hooks` should catch this; flag
  it if the rule is disabled.
- **Hook called outside a component or custom hook**: `useState` in a plain
  function.
- **Mutating state directly**: `state.push(x)` or `obj.foo = 1` followed by
  `setObj(obj)`. Mutation does not trigger a re-render and it breaks the
  `===` check in memoized children, so the symptom appears somewhere else.

## HIGH - Hook correctness

- **Missing dependency** in `useEffect` / `useMemo` / `useCallback`: a
  reactive value referenced inside but absent from the dep array. Flag every
  `// eslint-disable-next-line react-hooks/exhaustive-deps` that carries no
  justification comment.
- **Effect for derived state**: `setX(computed(props.y))` inside
  `useEffect([props.y])`. Compute during render instead.
- **Effect missing cleanup**: subscriptions, intervals, listeners, or fetch
  without an `AbortController`.
- **Stale closure**: an async handler or interval capturing a value that has
  since changed. Fix with a functional updater or a ref.
- **Custom hook not prefixed `use`**: breaks lint detection. Rename.

## HIGH - Server and client boundary (Next.js App Router, RSC)

- **Server-only import in a Client Component**: a `"use client"` file
  importing a module marked `"server-only"`, or a known DB client.
- **`"use client"` propagation**: a file marked `"use client"` importing a
  tree of components that did not need to be client components. The
  directive propagates.
- **Sensitive data leaked via props**: a Server Component passing a full user
  record, including hashed passwords or tokens, to a Client Component.
- **Server Action without an auth check**: a `"use server"` function
  reachable without confirming the current user is authorized.

## HIGH - Accessibility

- **Interactive element without keyboard reachability**: `<div onClick>`
  instead of `<button>`. Mouse-only interaction excludes keyboard and
  assistive-technology users.
- **Form input without a label**: no associated `<label htmlFor>`,
  `aria-label` or `aria-labelledby`.
- **Missing `alt` on `<img>`**: decorative images need `alt=""`, content
  images need a description.
- **`target="_blank"` without `rel="noopener noreferrer"`**: window opener
  hijack risk.
- **Misuse of ARIA**: `aria-label` on a non-interactive element, a `role`
  overriding native semantics, missing `aria-controls` or `aria-expanded` on
  a disclosure widget.
- **Heading order violation**: skipping levels, `<h1>` then `<h3>`.
- **Colour as the sole indicator**: errors signalled only by red text, with
  no icon or text label.

## HIGH - Rendering and state correctness

- **`key={index}` in a dynamic list**: reordering, insertion or deletion
  attaches state to the wrong row. Use stable database IDs.
- **Duplicated state**: the same data in two `useState` calls, or in state
  plus a computed copy.
- **`useEffect` chain**: an effect that sets state, triggering another
  effect, which sets more state. Derive during render or consolidate.
- **Initializing state from a prop without `key`**: the component does not
  reset when the prop changes. Fix with `key={propValue}` on the parent.

## MEDIUM - Performance

- **Over-memoization**: `useMemo` or `useCallback` with no measured win,
  where props change on most renders or the value feeds neither a memoized
  child nor another hook's deps.
- **New object or function inline as a prop to a memoized child**: defeats
  `React.memo` entirely.
- **Heavy work in render without `useMemo`**: synchronous parsing, sorting
  or regex compilation on every render.
- **Suspense at the route root only**: a wholesale loading state instead of
  progressive reveal. Push boundaries closer to the data.
- **Missing virtualization for long lists**: 50 or more visible items with
  non-trivial rows, scrolling poorly.
- **`useContext` for a high-frequency value**: every consumer re-renders on
  every change.

## MEDIUM - Forms

- **Form without a semantic `<form>` element**: loses native submit-on-Enter,
  browser form integration and the accessibility tree.
- **`onSubmit` without `preventDefault()`**: the page navigates and state is
  lost, unless using React 19 form actions, which handle it.
- **Roll-your-own validation in a non-trivial form**: recommend React Hook
  Form, TanStack Form, or React 19 `useActionState`.
- **Missing `name` on inputs inside a form**: cannot be read via `FormData`.

## MEDIUM - Composition

- **Prop drilling beyond three levels**: consider Context, or composition
  with `children`.
- **Component over 200 lines**: extract subcomponents or a custom hook.
- **Class component in new code**: convert to a function component when
  modifying it.
