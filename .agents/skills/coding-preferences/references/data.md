# Data layer

Preferences and rationale only. For how any of these libraries actually work - current API, options, examples - call **Context7** (`drizzle-orm`, `@effect/sql-pg`).

---

## Drizzle ORM with Effect

**Preference:** Use Drizzle ORM with Effect for database access.

**Rationale:** Drizzle provides type-safe SQL queries with native Effect integration. The `@effect/sql-pg` driver enables PostgreSQL connections with Effect's error handling and concurrency.

### When this applies

- Setting up database connections
- Creating migrations
- Writing type-safe queries
- Integrating with Effect services
- Adding vector embeddings for AI features
- Creating Effect schemas from database tables

### When it does not apply

- Using a different ORM such as Prisma or TypeORM
- Non-PostgreSQL databases without an Effect driver
- Simple scripts without database access

### Platform

Neon is the default Postgres platform. See the `neon-vendor` skill for its
branching model, pooled versus direct connections, and scale-to-zero
behaviour, and `database-reviewer` for reviewing the resulting schema.