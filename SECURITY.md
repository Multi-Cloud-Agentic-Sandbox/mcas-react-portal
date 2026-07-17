# Security Policy

## Reporting

Open a GitHub Issue on this repository. Do not include secrets in the report.

## Auth warnings

- Without full MSAL env (`VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`, `VITE_AUTH_SERVICE_URL`), the portal runs **NoAuth / DEV** mode via `@mcas/auth-client` — not for production.
- Registry API calls send `Authorization: Bearer <MCAS JWT>`. Tokens live in **sessionStorage** (XSS-readable); prefer a hardened CSP in deployed environments.
- Pointing at an auth-service with `AUTH_DISABLE=true` issues JWTs without Azure — **DEV ONLY**.
