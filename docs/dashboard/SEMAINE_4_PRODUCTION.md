# Semaine 4 — Production (Cockpit DG V5)

Checklist pour finaliser le passage en production : tests, monitoring, déploiement, formation.

---

## 1. Tests E2E (Playwright)

**État** : Tests Cockpit + Executive présents dans `e2e/dashboard/cockpit-executive.spec.ts`.

**Scénarios couverts** :
- Chargement Cockpit sans ReferenceError
- Barre Executive (toolbar) visible
- Pas de scroll horizontal sur le viewport
- Ouverture du panneau Actions et visibilité des commandes
- Breadcrumbs sans erreur « t is not defined »

**Lancer les tests** :
```bash
npm run dev
# Dans un autre terminal :
npm run test:e2e
# ou avec UI :
npm run test:e2e:ui
```

**PWA (V5)** : Test ajouté dans `e2e/dashboard/cockpit-executive.spec.ts` — `manifest.json` doit être servi (200) et contenir `name`, `short_name`, `start_url`, `icons`.

**À ajouter (optionnel)** :
- Test navigation sidebar → vue Cockpit
- Test raccourci clavier (?) pour l’aide
- Test consentement Push (bannière visible / masquée)

---

## 2. Monitoring (Sentry, analytics)

**Sentry (erreurs)** :
1. Créer un projet sur [sentry.io](https://sentry.io).
2. Installer : `npm install @sentry/nextjs`.
3. Configurer selon [docs Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/).
4. Variables d’env : `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (build).

**Analytics (Vercel / Mixpanel)** :
- Vercel Analytics : activer dans le projet Vercel (Dashboard → Project → Analytics).
- Mixpanel (optionnel) : `npm install mixpanel-browser`, initialiser dans un provider client avec `NEXT_PUBLIC_MIXPANEL_TOKEN`.

**OpenTelemetry** : Déjà présent via `instrumentation.ts` et `lib/server/observability/telemetry`. Configurer les endpoints (Tempo, etc.) en production.

---

## 3. Déploiement

**Frontend (Vercel)** :
1. Connecter le repo GitHub à Vercel.
2. Build : `next build`, output : standalone si configuré.
3. Variables d’environnement : toutes les `NEXT_PUBLIC_*` et clés API (OpenAI, VAPID, etc.).
4. Domaine : configurer le domaine de production.

**Backend / API** (si séparé) :
- Render.com, Railway ou Vercel Serverless pour les routes API Next.js.
- Supabase / PostgreSQL pour la persistance (abonnements push, etc.).

**Checklist pré-déploiement** :
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` en production (push)
- [ ] `OPENAI_API_KEY` si briefing GPT-4
- [ ] HTTPS obligatoire (PWA, Push, Service Worker)
- [ ] CORS et headers de sécurité vérifiés
- [ ] Bannière install PWA (`PwaInstallPrompt`) + SW `sw-calendrier.js` (cache shell V5)

---

## 4. Formation (doc utilisateur + parcours DG)

**À produire** :
1. **Guide utilisateur Cockpit DG** (PDF ou page dédiée) :
   - Accès au Cockpit, vue d’ensemble des 4 quadrants
   - Barre Executive : 12 boutons, raccourcis clavier, commandes vocales (FR/EN)
   - Briefing IA et prédictions ML
   - Mode hors ligne et notifications Push
   - Installation PWA (écran d’accueil)

2. **Parcours DG** (scénarios type) :
   - « Consulter le briefing du jour »
   - « Lancer un paiement Orange Money / Wave »
   - « Demander une certification Huissier »
   - « Envoyer une annonce (Broadcast) »
   - « Utiliser la voix pour une urgence »

3. **FAQ** : questions fréquentes (notifications, offline, voix, sécurité).

---

## 5. Résumé

| Item            | Statut   | Action |
|-----------------|----------|--------|
| Tests E2E       | En place | `e2e/dashboard/cockpit-executive.spec.ts` + test PWA manifest ; lancer `npm run test:e2e` |
| Sentry          | À faire  | Créer projet, installer @sentry/nextjs, configurer DSN (voir MONITORING_SETUP.md) |
| Analytics       | À faire  | Activer Vercel Analytics et/ou Mixpanel (voir MONITORING_SETUP.md) |
| Déploiement     | Doc OK   | Vercel + variables d’env + HTTPS (voir DEPLOYMENT_VERCEL.md) |
| Formation / Doc| À faire  | Guide utilisateur + parcours DG (voir GUIDE_UTILISATEUR_COCKPIT_DG.md) |

---

*Document aligné sur la feuille de route Cockpit DG V5 Ultimate.*
