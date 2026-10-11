# Offline-first apps and federated components

Preferences and rationale only. For SDK usage, call Context7.

---

## Offline-first

Offline-first here means the user's data works without a connection. Flags still apply.

- Persist the last evaluated flag values on the device and start from them.
- On a cold start with no cached values, use the in-code defaults.
- A flag must never block the app from opening or from saving user data while offline.

## Module-federated components

Components that deploy independently still check flags through the host app's helper, so every component shares one client, one identity and one set of cached values. A remote component must not initialise its own PostHog client.

A flag can decide which version of a remote component loads. Keep the previous version available until the flag is removed.