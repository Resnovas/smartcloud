# UI

Preferences and rationale only. For how any of these libraries actually work - current API, options, examples - call **Context7** (`expo`, `react-native`).

---

## Component-first design

**Preference:** Design and build components first, then compose pages from them. Components are versioned and can be updated individually without rebuilding the whole application.

**Rationale:** A fix or change to one component ships on its own, and the same component serves every app that uses it. This is the model bit.dev offered; it is kept here without depending on a paid platform.

---

## React Native and Module Federation

**Preference:** Use React Native with Expo for all UI applications. Deliver independently updatable components with Module Federation 2.0 (`module-federation/core`) on the web and Re.Pack's Module Federation v2 plugin on React Native. Host the remote bundles ourselves on static hosting or a CDN.

**Rationale:** Both are MIT-licensed and free to self-host, so open-source apps carry no platform cost. Zephyr is not used, because it is a paid service. React Native for Web is stable, so one component serves web and native.

**Offline:** Offline-first applies to databases and user data. Remote components may be cached on the device after first load; the app still needs a bundled or cached copy of each remote so a screen does not break without a connection.

### When this applies

- Creating new mobile applications
- Building cross-platform UIs
- Setting up web interfaces with React Native for Web
- Configuring Module Federation for shared components
- Preparing for EAS builds

### When it does not apply

- Simple web-only applications, where React with Vite is the better fit
- Desktop applications
- Non-UI projects
- When native performance is critical and React Native overhead is unacceptable

---

## i18n by default

**Preference:** All apps and tools must fully support internationalization, even when no translations are provided.

**Rationale:** Having the tooling built in early streamlines future internationalisation and avoids costly rework later. Retrofitting i18n touches every string in the codebase; building it in touches none.

### When this applies

- Creating new UI components
- Setting up new projects
- Adding text content to applications
- Designing error messages
- Building user-facing applications

### When it does not apply

- Internal tools with single-language users
- Simple scripts without user interfaces
- When the app is explicitly single-language only