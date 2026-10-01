---
name: no-em-or-en-dashes
description: Use ASCII hyphen-minus only in agent-authored text. Scan changed files before commit.
---
# No em or en dashes

Never use Unicode em dash (U+2014) or en dash (U+2013) in agent-authored text, code comments, strings, docs, commit messages, rules, or plans. Use ASCII hyphen-minus (-) only.

After every finished job / before commit: scan changed files and replace any U+2014 / U+2013 with -.
Do not "fix" markdown table separators. Do not rewrite binary assets, vendor libs, LICENSE texts, or intentional Unicode in imported customer data.

Examples: write "15-30s - configurable" and "Sync partner data - then notify". Never insert U+2013 between numbers or U+2014 as a clause separator.