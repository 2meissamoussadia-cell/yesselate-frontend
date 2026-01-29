# Apps — NICE RÉNOVATION Monorepo

## Applications

| App | Description | Port |
|-----|-------------|------|
| **api** | NestJS 10 API (Fastify) | 3001 |
| **cockpit-dg** | Next.js 15 Cockpit DG dashboard | 3000 |

## Scripts (depuis la racine du monorepo)

- `pnpm dev:api` — Lancer l’API en mode watch
- `pnpm dev:cockpit` — Lancer le Cockpit DG en dev
- `pnpm build:workspace` — Build de tous les packages
- `pnpm test:workspace` — Tests de tous les packages
- `pnpm lint:workspace` — Lint de tous les packages

## Prérequis

- Node.js 20+
- pnpm 9+ (ou `corepack enable` puis `corepack prepare pnpm@latest --activate`)

```bash
# À la racine (première fois : installer pnpm si besoin)
pnpm install

pnpm dev:api      # terminal 1 — API sur http://localhost:3001
pnpm dev:cockpit  # terminal 2 — Cockpit DG sur http://localhost:3000
```
