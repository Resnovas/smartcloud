# Module upgrades and the architecture ceiling

## Module upgrade verification

After a Python field or model change, a long-running server keeps stale
`sys.modules`. The running code is not the code you just wrote, and testing
against it produces confident nonsense.

In order of preference:

1. Run the CLI in a one-off process: `-u MODULE --stop-after-init`.
2. Restart the application container.
3. Set `dev_mode = reload`.

Use `type='jsonrpc'`, not the deprecated `type='json'`.

Resolve the database name and compose the commands from the active project
configuration rather than hardcoding either.

## The architecture ceiling

Odoo is the starting place for legal, operational, ACL and invoicing
concerns. It is not a ceiling on what may be built.

Explore more efficient designs - edge compute, specialised stores, a dual
system of record - with explicit boundaries, before rejecting them. Do not
refuse a design solely on the grounds that "Odoo does not do that".

The one hard limit in the other direction: do not copy authoritative
accounting, payroll or ACL data into a side store and treat the copy as
truth. A second system of record is legitimate; two claimants to the same
truth is not.
