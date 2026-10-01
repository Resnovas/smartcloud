# Vendoring and patterns

---

## Git subtree instead of submodules

**Preference:** Use `git subtree` to vendor external source code.

**Rationale:** Submodules require initialization, introduce indirection, require `.gitmodules` tracking, and break GitButler. Subtrees behave like regular directories.

Two flags matter when adding one: `--prefix` sets the directory the repo lives in, and `--squash` collapses the entire upstream history into a single commit, which avoids importing thousands of commits. Each later update then shows up as one commit, which is easy to review.

### When this applies

- Adding external repositories
- Updating vendored dependencies
- Configuring editors to ignore vendored code
- Setting up agent configuration for vendored repos

### When it does not apply

- You need true submodule behaviour, such as tracking multiple repos independently
- The repo has its own build system that conflicts with subtree
- You need to contribute changes back to the vendored repo

---

## Source code available

**Preference:** Vendor external repositories into the project using Git subtree under `externals/`.

**Rationale:** Coding agents are better at reading code than documentation. Having the source available locally lets an agent explore the actual implementation rather than isolated snippets.

### Why not `node_modules`

- The code is often compiled or flattened, which removes the structure that makes it readable
- Most coding agents are deoptimized from exploring `node_modules` and other gitignored directories
- Documentation explains what an API does, but not how it is actually used

### When this applies

- Starting a new project with external dependencies
- Adding a major library to a project
- Configuring agent access to external code
- Creating pattern files for frequent dependencies

### When it does not apply

- The external repo is too large to vendor
- You need to contribute changes back to the vendored repo
- The repo does not have a stable public URL

---

## Pattern files

**Preference:** Create pattern files for frequently used modules from vendored codebases.

**Rationale:** Gives agents a project-local reference to return to, instead of rediscovering the same patterns repeatedly.

### When to create one

- After first substantial work with a new external library
- After a major refactor that changes usage patterns
- When agents repeatedly rediscover the same patterns
- When establishing a team practice

### When not to

- The module is simple
- You are using a single, simple API
- The module has excellent official documentation
- The pattern will be short-lived, as in a prototype

### Updating one

When you learn something better, update the pattern file, note what changed and why, and keep the most recent version current. A stale pattern file is worse than none, because it is trusted.