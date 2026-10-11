# Review priorities

The severity catalog. Work top down: CRITICAL and HIGH block, MEDIUM is
mergeable with caution. Every finding needs a file, a line and a concrete fix.

## CRITICAL - Security

- **SQL injection**: f-strings in queries. Use parameterized queries.
- **Command injection**: unvalidated input in shell commands. Use `subprocess` with list args, never `shell=True` on user input.
- **Path traversal**: user-controlled paths. Validate with `normpath` and reject `..`.
- **`eval` / `exec` abuse**: never execute untrusted strings.
- **Unsafe deserialization**: `pickle` on untrusted data, `yaml.load` without `SafeLoader`.
- **Hardcoded secrets**: API keys, tokens, passwords in source.
- **Weak crypto**: MD5 or SHA1 used for a security purpose.

## CRITICAL - Error handling

- **Bare except**: `except: pass`. Catch specific exceptions.
- **Swallowed exceptions**: silent failure. Log and handle.
- **Missing context managers**: manual file or resource management. Use `with`.

## HIGH - Type hints

- Public functions without type annotations.
- `Any` where a specific type is possible.
- Missing `Optional` on nullable parameters.

## HIGH - Pythonic patterns

- Use comprehensions over C-style loops.
- `isinstance()`, not `type() ==`.
- `Enum`, not magic numbers.
- `"".join()`, not string concatenation in a loop.
- **Mutable default arguments**: `def f(x=[])`. Use `def f(x=None)` and build inside.

## HIGH - Code quality

- Functions over 50 lines, or with more than 5 parameters (use a dataclass).
- Deep nesting, more than 4 levels.
- Duplicate code patterns.
- Magic numbers without named constants.

## HIGH - Concurrency

- Shared state without locks. Use `threading.Lock`.
- Mixing sync and async incorrectly.
- N+1 queries in loops. Batch the query.

## MEDIUM - Best practices

- PEP 8: import order, naming, spacing.
- Missing docstrings on public functions.
- `print()` instead of `logging`.
- `from module import *`, which pollutes the namespace.
- `value == None`. Use `value is None`.
- Shadowing builtins (`list`, `dict`, `str`).
