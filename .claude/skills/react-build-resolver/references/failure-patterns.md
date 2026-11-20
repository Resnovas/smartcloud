# Failure patterns

## JSX and TSX compile

| Error | Cause | Fix |
|---|---|---|
| `'React' is not defined` | Old JSX transform expected `import React from 'react'` | Set `"jsx": "react-jsx"` in `tsconfig.json`, or add the import |
| `Cannot find module 'react' or its corresponding type declarations` | Missing types | Install `@types/react` and `@types/react-dom` as dev dependencies |
| `JSX element type 'X' does not have any construct or call signatures` | Wrong type for a component prop | Confirm the import is the component, not a default-versus-named mismatch |
| `Module '"react"' has no exported member 'X'` | Targeting the wrong React version's types | Match the `@types/react` major to the installed `react` |
| `Unexpected token '<'` | Loader or transformer missing | Add `@vitejs/plugin-react`, `babel-loader` with `@babel/preset-react`, or the equivalent |
| `JSX must have one parent element` | Adjacent JSX siblings | Wrap in a fragment, `<>...</>` |

## tsconfig

| Symptom | Fix |
|---|---|
| `"jsx"` not set | `"jsx": "react-jsx"` for React 17+, or `"react"` for legacy |
| `"esModuleInterop"` missing | Add `"esModuleInterop": true` for `import React from 'react'` |
| `"moduleResolution"` outdated | Set to `"bundler"` for Vite and Next.js 13+ |
| Path aliases not resolving | Sync `paths` in `tsconfig.json` with the bundler config |

## Vite

- Missing `@vitejs/plugin-react` in the `plugins` array.
- `optimizeDeps.include` needed for CJS-only dependencies.
- `define: { 'process.env.NODE_ENV': '"production"' }` for libraries
  expecting a Node environment.

## Next.js (App Router)

| Error | Fix |
|---|---|
| `You're importing a component that needs useState` | Add `"use client"` as the file's first line, or move the hook into a Client Component child |
| `Module not found: Can't resolve 'fs'` in a client file | The file is bundled for the client and `fs` is server-only. Remove the import, or move the logic into a Server Component or route handler |
| `Functions cannot be passed directly to Client Components` | Wrap the function as a Server Action (`"use server"`) and pass that |
| `Hydration failed because the initial UI does not match` | Server and client renders diverge. See the hydration section below |

## webpack

- Missing a `babel-loader` rule for `.jsx` and `.tsx`.
- `resolve.extensions` missing `.tsx` and `.jsx`.
- An `IgnorePlugin` regex that is too broad.
- A misconfigured source-map plugin causing out-of-memory.

## Create React App

CRA is unmaintained. Recommend migrating to Vite or Next.js for new work.
For an existing CRA app:

- `react-scripts` version drift against the `react` major.
- Missing `BROWSERSLIST` env or a `browserslist` field in `package.json`.
- A custom webpack layer shadowing CRA defaults.

## Hydration mismatches

The server-rendered HTML does not match the client's first render.

1. **Non-deterministic values during render**: `Date.now()`,
   `Math.random()`, `new Date().toLocaleString()`. Move to `useEffect` and
   render a placeholder initially.
2. **Browser-only API access**: `window`, `document`, `localStorage`,
   `navigator`. Gate with `typeof window !== 'undefined'` for trivial cases,
   or `useEffect` for component state.
3. **Stylesheet flicker**: CSS-in-JS without SSR setup. `styled-components`
   needs `ServerStyleSheet`; emotion needs `extractCritical`.
4. **Invalid HTML nesting**: a `<p>` containing a `<div>`, or an `<a>`
   inside an `<a>`. Browsers auto-correct, React does not.
5. **Content varying by user agent**: move to `useEffect` for the
   client-only branch.

## Runtime failures, any bundler

| Error | Fix |
|---|---|
| `Invalid hook call. Hooks can only be called inside of the body of a function component` | Multiple React copies in `node_modules`. `npm ls react` should show exactly one. Dedupe with `resolutions` or `overrides` |
| `Element type is invalid: expected a string or class/function but got: undefined` | Default versus named import mismatch. Check the component's export style |
| `Functions are not valid as a React child` | A function reference passed where a component or value is expected. Add `()` or wrap in JSX |

When a library throws on hook usage, it almost always means React is
duplicated. Check that before reading the library's code.

## Tailwind and PostCSS

- Missing entries in the `tailwind.config.js` `content` array, so no styles
  are emitted.
- `@tailwind base; @tailwind components; @tailwind utilities;` missing from
  the CSS entry point.
- PostCSS plugin order: `tailwindcss` must precede `autoprefixer`.
