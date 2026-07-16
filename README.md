# MCAS React Portal

> Part of **MCAS** — full repository map: **[mcas-agent-framework](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-agent-framework)**.

Module Federation **host** for the MCAS micro-frontend platform: home grid, dynamic tool routes, admin registry UI, and design-system showcase.

## Prerequisites

Clone sibling repos at the MCAS workspace root:

- [mcas-react-design-system](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-react-design-system)
- [mcas-react-auth-client](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-react-auth-client)
- [mcas-tool-registry](https://github.com/Multi-Cloud-Agentic-Sandbox/mcas-tool-registry) (running on :8090)

## Dev

```bash
cp .env.example .env
npm install
npm run dev
```

Portal: **http://localhost:5173** (strict port — required for Module Federation).

Or from MCAS root: `run-microfrontend.bat`

## Routes

- `/` — tool cards from registry
- `/tools/:toolId/*` — federated remotes
- `/admin/tools` — register tools via manifest URL
- `/design-system/*` — design system showcase

## Env

| Variable | Default |
|----------|---------|
| `VITE_REGISTRY_URL` | `http://localhost:8090` |
| `VITE_AZURE_*` | optional — see `@mcas/auth-client` |
