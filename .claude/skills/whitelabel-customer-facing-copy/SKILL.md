---
name: whitelabel-customer-facing-copy
description: Customer-facing copy must not name vendors or platforms unless the reader must recognise that integration.
---
# Whitelabel customer-facing copy

All products must be fully whitelabelled. Any text a customer, partner, exhibitor, supplier, or end user might see (website/portal, checkout, emails, PDFs/reports, SMS, public tooltips, KB articles, translatable UI strings) must not name vendors or platforms unless the task explicitly requires a named integration the reader must recognise.

Avoid: product/vendor names (e.g. Odoo, PostgreSQL, Cloudflare, Stripe), internal codenames, and phrases like "the ERP" / "the backend" / "the system" when they read like product marketing.

Write instead: plain language about what to do. Prefer role + object ("Open the purchase order", "Upload your artwork on the order page").

Staff-only backend UI, technical logs, code comments, and agent docs may use vendor names when they aid developers.

Before shipping UI or reports: grep new copy for vendor trademarks.