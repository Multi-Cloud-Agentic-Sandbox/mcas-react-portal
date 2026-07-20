# MCAS React Portal

> Part of **MCAS** — full repository map: **[mcas-agent-framework](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-agent-framework)**.

Module Federation **host** for the MCAS micro-frontend platform: home grid, dynamic tool routes, and admin registry UI. Design-system demos live in the **Design System DEMO** tool card on Home.

## Prerequisites

- [mcas-tool-registry](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-tool-registry) on `:8090`
- [mcas-auth-service](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-auth-service) on `:8080` (JWT exchange)

`@mcas/auth-client` and `@mcas/design-system` are installed from **public GitHub Release `.tgz`** URLs (no PAT). Local override: `file:../mcas-react-auth-client` while iterating on auth.

With MSAL configured (`VITE_AZURE_*` + `VITE_AUTH_SERVICE_URL`), unauthenticated users are redirected to **`/auth`**. NoAuth / DEV mode (incomplete Azure env) skips the gate.

## Dev

```bash
cp .env.example .env
npm install
npm run dev
```

Portal: **http://localhost:5173** (strict port — Module Federation).

Local library override (optional):

```bash
npm install file:../mcas-react-auth-client file:../mcas-react-design-system
```

## Auth & registry JWT

All registry fetches send `Authorization: Bearer` via `ensureMcasToken()`.

| Mode | When | Notes |
|------|------|--------|
| MSAL | `VITE_AZURE_CLIENT_ID` + `VITE_AZURE_TENANT_ID` + `VITE_AUTH_SERVICE_URL` | Azure → MCAS JWT |
| NoAuth / DEV | Any omitted | **Not production-ready** |

## Routes

- `/` — active tools from registry
- `/tools/:toolId/*` — federated remotes (incl. Design System DEMO showcase)
- `/admin/tools` — manifest import (all statuses)

## Env

| Variable | Notes |
|----------|--------|
| `VITE_REGISTRY_URL` | Default `http://localhost:8090` |
| `VITE_AZURE_CLIENT_ID` / `TENANT_ID` / `AUTH_SERVICE_URL` | Required for MSAL |
| `VITE_AZURE_API_SCOPE` | Optional |
