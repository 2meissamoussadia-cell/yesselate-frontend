# Déploiement — Vercel (Cockpit DG V5)

## Prérequis

- Compte [Vercel](https://vercel.com)
- Dépôt Git (GitHub, GitLab, Bitbucket) lié au projet

## Déployer le frontend Next.js

### 1. Importer le projet

1. Aller sur [vercel.com/new](https://vercel.com/new).
2. Importer le dépôt `yesselate-frontend` (ou le repo contenant ce frontend).
3. Framework Preset : **Next.js** (détecté automatiquement).
4. Root Directory : laisser vide si la racine du repo est le projet Next.js.

### 2. Variables d’environnement

Dans **Settings → Environment Variables**, ajouter au minimum :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de l’API backend (si utilisée) | `https://api.nicerenovation.sn` |
| `OPENAI_API_KEY` | Clé OpenAI pour briefing GPT-4 (Cockpit V5) | (sk-…) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clé publique Web Push (optionnel) | (générée par `npx web-push generate-vapid-keys`) |
| `VAPID_PRIVATE_KEY` | Clé privée Web Push (optionnel, serveur) | (même génération) |

Pour Sentry (voir [MONITORING_SETUP.md](./MONITORING_SETUP.md)) :

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (pour l’upload des source maps)

### 3. Build

- **Build Command** : `npm run build` (ou `pnpm build` / `yarn build` selon le projet).
- **Output Directory** : laisser la valeur par défaut Next.js (`.next`).
- **Install Command** : `npm install` (ou `pnpm install`).

### 4. Déploiement

- Chaque push sur la branche principale (ou la branche configurée) déclenche un déploiement.
- Les branches peuvent avoir des **Preview Deployments** (URLs de prévisualisation).

## Port et URL

- En local : `next dev -p 4001` (port 4001).
- Sur Vercel : pas de port à configurer ; l’URL de production est fournie par Vercel (ex. `xxx.vercel.app`).

## Backend / API

Si l’API tourne ailleurs (Render, Supabase, etc.) :

1. Définir `NEXT_PUBLIC_API_URL` vers cette API.
2. Configurer CORS sur l’API pour autoriser le domaine Vercel (`*.vercel.app` et le domaine custom si utilisé).

## Checklist avant mise en production

- [ ] Variables d’environnement configurées (API, VAPID si push, Sentry si monitoring).
- [ ] Build réussi en local : `npm run build`.
- [ ] Tests E2E passent (optionnel en CI) : `npm run test:e2e`.
- [ ] Domaine personnalisé configuré dans Vercel si besoin (Settings → Domains).

## Références

- [Next.js on Vercel](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
