# Review workflow

How to enter a review, what to run, and how to report. The findings themselves
come from `references/review-priorities.md`.

## When invoked

1. Run `git diff -- '*.py'` to see the recent Python changes.
2. Run the static analysis tools the project has available.
3. Focus on modified `.py` files, and read the surrounding context before
   commenting.
4. Begin the review.

If linting or type checking fails outright, report that first rather than
reviewing on top of it.

## Diagnostic commands

Prefer the project's own scripts and its declared environment over the
fallbacks below.

```bash
mypy .                                     # type checking
ruff check .                               # fast linting
black --check .                            # format check
bandit -r .                                # security scan
pytest --cov=app --cov-report=term-missing # test coverage
```

## Framework checks

- **Django**: `select_related` / `prefetch_related` for N+1, `atomic()` around
  multi-step writes, migrations reviewed for lock behaviour.
- **FastAPI**: CORS configuration, Pydantic validation on every input,
  declared response models, no blocking calls inside `async def`.
- **Flask**: proper error handlers, CSRF protection on state-changing routes.

## Output format

```text
[SEVERITY] Issue title
File: path/to/file.py:42
Issue: description
Fix: what to change
```

## Approval criteria

- **Approve**: no CRITICAL or HIGH issues.
- **Warning**: MEDIUM issues only; mergeable with caution.
- **Block**: any CRITICAL or HIGH issue.

Review with the mindset: would this code pass review at a well-maintained
open-source project?
