# Authentication and identity

Preferences and rationale only. For WorkOS, Clerk, Auth0, or peers, call Context7.

---

## Enterprise-ready auth platform

**Preference:** Do not build SSO, SCIM, MFA, or org user-admin from scratch. Pick an auth platform that clears the enterprise checklist, then keep product code behind our own auth ports.

### Must-have capabilities

- **SSO** - SAML and OIDC, including IdP-initiated when customers need it
- **Directory sync** - SCIM (and HRIS when available) for provision / update / deprovision with session revoke on disable
- **User management** - signup/signin, invitations, identity linking, organizations / memberships, roles
- **MFA** - TOTP at minimum; prefer passkeys and org-enforceable MFA policies when offered
- **Admin / IT self-serve** - customer-facing SSO and directory setup when the vendor has it
- **Auditability** - auth and admin events into PostHog / OTEL

**More features is better** among vendors that already clear the must-haves (IdP breadth, fine-grained authorization, bot detection, custom domains, published SLAs, agent-identity hooks).

**Usual starter:** WorkOS (AuthKit + SSO + Directory Sync + MFA + User Management + Audit Logs) for B2B SaaS selling to IT buyers. Not a forever lock.

**Evaluate peers** (Clerk, Auth0, Stytch, Better Auth + enterprise plugins, FusionAuth, others) when they clearly win on the checklist, Effect/TypeScript DX, pricing shape, or React Native / Expo fit. Re-check per product.

### Hard rules

- Capability bar beats brand loyalty
- Auth vendor stays in an **integration module**
- Prefer source-available SDKs under `externals/` when depended on deeply
- Wire auth telemetry into PostHog / OTEL like other services