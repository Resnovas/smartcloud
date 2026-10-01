# Licensing

---

## FCL-1.0-MIT

**Preference:** All projects use the FCL-1.0-MIT license unless prohibited by dependencies.

**Rationale:** Protects core ideas while maintaining open-source goals. FCL transitions to MIT after two years.

### Canonical header

The header is `tools/license/header.txt`, synced from the house, and identical in every file except two lines: the `@file` line, which carries the file's path from the repository root, and the copyright line, which carries the current year. Never type it: `node tools/license/check-headers.mjs --fix` (the `headers:fix` package script) writes it, and the `headers` script in the repository's `check` fails on a missing or outdated one. Files synced from the house carry no header. The year is the current year on purpose: the check fails each January until `headers:fix` has moved every file forward, which is one commit.

### When this applies

- Creating new source files
- Setting up new repositories
- Reviewing licensing compliance
- Adding files to existing projects

### When it does not apply

- Third-party dependencies that require their own license
- Configuration files that do not support comments
- Documentation files that are auto-generated