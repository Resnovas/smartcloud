# Log levels and Settings configuration

## Log levels

The levels are debug, info, warning, error and critical. There is no TRACE;
use **debug**.

WARNING often blocks builds and demands review. ERROR and CRITICAL are
blockers.

| Level | Use for |
|-------|---------|
| debug | Progress chatter, retries, kicks and drains, skips, handled fallbacks |
| info | Low-volume operational notes worth seeing in production |
| warning | Unexpected but recoverable; needs human review |
| error | The operation failed; needs a fix |
| critical | System-threatening failure |

The rule that gets broken most: `info` is not progress chatter. Start, retry,
skip and handled-fallback all go to **debug**. If every run of a healthy cron
emits info lines, the level is wrong.

## Settings sidebar

Admin configuration belongs in Settings sidebar apps, not in routine
Technical menus.

1. Extend `base.res_config_settings_view_form` with an `<app name="…">`.
2. Put the fields on `res.config.settings` with
   `config_parameter="module.key"`.
3. Give the module an icon via `static/description/icon.svg` and reference it
   with `logo=` on the `<app>`.
4. Use a hub module (`*_settings_hub`, `auto_install=True`) when several
   small modules share one product area, so the sidebar does not sprout an
   entry per module.
