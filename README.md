# MCAS React Portal

> Part of **MCAS** — full repository map: **[mcas-agent-framework](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-agent-framework)**.

Module Federation **host** for the MCAS micro-frontend platform: home grid, dynamic tool routes, admin registry UI, and design-system showcase.

## Prerequisites

- [mcas-tool-registry](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-tool-registry) (running on :8090)
- [mcas-auth-service](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-auth-service) (for JWT exchange, :8080)

`@mcas/auth-client` and `@mcas/design-system` are pinned to **GitHub Release `.tgz` URLs** in `package.json` (publish those releases first — see each package `docs/publishing.md`).

### Local monorepo override

```bash
npm install file:../mcas-react-auth-client file:../mcas-react-design-system
```

## Dev

```bash
cp .env.example .env
npm install
npm run dev
```

Portal: **http://localhost:5173** (strict port — required for Module Federation).

Or from MCAS root: `run-microfrontend.bat`

## Auth & registry JWT

The portal uses `@mcas/auth-client` (`AuthProvider` / `useAuth`). All tool-registry fetches send `Authorization: Bearer <MCAS JWT>` from `ensureMcasToken()`.

| Mode | When | Notes |
|------|------|--------|
| MSAL | `VITE_AZURE_CLIENT_ID` + `VITE_AZURE_TENANT_ID` + `VITE_AUTH_SERVICE_URL` set | Azure login → exchange for MCAS JWT |
| **NoAuth / DEV** | Any of those omitted | Auto-authenticated for local work — **not production-ready** (console warning) |

With NoAuth, a dev JWT may still be exchanged if auth-service has `AUTH_DISABLE=true`.

## Routes

- `/` — tool cards from registry (active tools only)
- `/tools/:toolId/*` — federated remotes
- `/admin/tools` — register tools via manifest URL (all statuses)
- `/design-system/*` — design system showcase

## Env

| Variable | Default | Notes |
|----------|---------|--------|
| `VITE_REGISTRY_URL` | `http://localhost:8090` | Tool registry base URL |
| `VITE_AZURE_CLIENT_ID` | — | Required for MSAL |
| `VITE_AZURE_TENANT_ID` | — | Required for MSAL |
| `VITE_AZURE_API_SCOPE` | — | Optional API scope |
| `VITE_AUTH_SERVICE_URL` | — | Required for MSAL / JWT exchange |

**WARNING:** Omitting Azure + auth-service env enables NoAuth / DEV mode — do not use in production.
