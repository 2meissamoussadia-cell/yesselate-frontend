# Monitoring — Sentry + Analytics (Cockpit DG V5)

## Sentry (erreurs)

Le code est déjà prêt pour Sentry via `NEXT_PUBLIC_SENTRY_DSN` (ErrorBoundary, `monitoring.ts`, `logger.ts`). Pour activer l’envoi des erreurs :

### 1. Créer un projet sur [sentry.io](https://sentry.io)

- Créer une organisation et un projet **Next.js**.
- Récupérer la **DSN** (Data Source Name).

### 2. Installer le SDK Sentry pour Next.js

```bash
npm install @sentry/nextjs
```

### 3. Configurer Sentry

- Exécuter le wizard : `npx @sentry/wizard@latest -i nextjs`
- Ou créer manuellement :
  - `sentry.client.config.ts` (init côté client)
  - `sentry.server.config.ts` (init côté serveur)
  - `sentry.edge.config.ts` (optionnel, Edge)
  - Dans `next.config.ts` : wrapper la config avec `withSentryConfig()`.

### 4. Variables d’environnement

Dans `.env.local` :

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx   # pour les source maps (upload)
```

Sans installer le SDK : le code actuel utilise `(window as any).Sentry` ; il faut charger le script Sentry via un composant ou `_document` pour que les erreurs soient envoyées.

---

## Vercel Analytics

Sur Vercel, activer **Analytics** dans le projet (Dashboard → Settings → Analytics).

Pour les Web Vitals dans l’app :

```bash
npm install @vercel/analytics
```

Dans le layout racine ou un provider client :

```tsx
import { Analytics } from '@vercel/analytics/react';
// ...
<Analytics />
```

---

## Mixpanel (optionnel)

Pour du tracking métier (événements, parcours) :

1. Créer un projet sur [mixpanel.com](https://mixpanel.com).
2. Récupérer le **Project Token**.
3. Installer : `npm install mixpanel-browser`
4. Initialiser dans un provider client avec `NEXT_PUBLIC_MIXPANEL_TOKEN`.
5. Appeler `mixpanel.track('Cockpit Action', { ... })` depuis les composants (ex. ExecutiveControls).

---

## Résumé

| Service        | Rôle              | Variable / action                          |
|----------------|-------------------|--------------------------------------------|
| Sentry         | Erreurs + traces  | `NEXT_PUBLIC_SENTRY_DSN` + `@sentry/nextjs` |
| Vercel Analytics | Web Vitals / usage | Activer dans le projet + `@vercel/analytics` |
| Mixpanel      | Événements métier | `NEXT_PUBLIC_MIXPANEL_TOKEN` + SDK        |

Les ErrorBoundary et `monitoring.ts` envoient déjà les erreurs à Sentry lorsque le SDK est chargé et que la DSN est définie.
