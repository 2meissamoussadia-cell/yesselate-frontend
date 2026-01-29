# Cockpit DG V5 Ultimate — Feuille de route

Vision : **Meilleur système BTP au monde 2026** — NICE RÉNOVATION.

---

## État actuel (base V4/V5 partielle)

| Composant | Fichier / zone | Statut |
|-----------|----------------|--------|
| Page Cockpit | `src/modules/dashboard/components/views/CockpitDGPage.tsx` | ✅ Existant |
| Executive Panel 12 boutons | `src/modules/dashboard/components/cockpit/ExecutiveControls.tsx` | ✅ 12 boutons + shortcuts |
| Commandes vocales | `ExecutiveControls.tsx` + `voiceCommandsV5.ts` | ✅ Web Speech API FR |
| Données chantiers | `useCockpitChantiers`, `useCockpitLive`, `chantiersMock.ts` | ✅ Hooks + mock |
| Sphères / visuels | `cockpit/ChantierSphere.tsx`, `HealthSphereGrid.tsx` | ✅ Existant |

---

## Plan 4 semaines (V5 Ultimate)

### Semaine 1 — Core V5 (40h)

- [x] **GPT-4** : API `/api/ai/briefing` + hook `useCockpitBriefing` (3 phrases, refresh 60s) — branché sur CockpitDGPage
- [x] **ML (mock puis XGBoost)** : API `/api/ai/predictions` + hook `useCockpitPredictions` (retard, budget, qualité) — affiché dans CockpitDGPage
- [x] **WebSocket** : `useCockpitLive` étendu (max 5 reconnexions, events `cockpit_payment`, `cockpit_emergency`)
- [x] **Performance** : `HealthSphereGridInner` et `ChantierSphere` en `React.memo` ; `CockpitDGPage` en `React.memo` — object pooling / workers à faire si besoin

### Semaine 2 — Features avancées (40h)

- [x] **Voice 3 langues** : EN + Wolof (patterns) + sélecteur FR|EN dans ExecutiveControls ; `voiceCommandsV5.ts` étendu (EN/Wolof)
- [x] **Orange Money / Wave** : `POST /api/payments/orange-money` et `POST /api/payments/wave` (stubs) — appelés depuis ExecutiveControls
- [x] **Huissier UCIE** : `POST /api/huissier/certify` (stub) — 1 clic depuis ExecutiveControls
- [x] **Contrat Auto / Broadcast** : stubs API `POST /api/cockpit/contract`, `POST /api/cockpit/broadcast` + boutons ExecutiveControls

### Semaine 3 — Mobile & PWA (40h)

- [x] **PWA** : `manifest.json` (id, scope), service worker (`sw-calendrier.js` = shell PWA + dashboard), installable — `public/`, `next.config` (headers SW), `PwaRegistration` dans Providers
- [x] **Offline** : IndexedDB (`dashboard-offline-v1`) + cache stratégies — module `dashboard/offline` (briefing, prédictions), hooks `useCockpitBriefing`/`useCockpitPredictions` lisent/écrivent le cache ; SW met en cache `/api/ai/briefing` et `/api/ai/predictions` (network-first) ; indicateur "Mode hors ligne / Données en cache" sur CockpitDGPage
- [x] **Push** : Web Push API — APIs `/api/push/vapid-public`, `subscribe`, `unsubscribe`, `send` ; SW `push` + `notificationclick` ; `usePushConsent` + `PushConsentBanner` sur Cockpit ; doc `docs/dashboard/PUSH_SETUP.md` (VAPID)
- [x] **Responsive / touch** : Cockpit + Executive bar adaptés mobile — safe-area, `min-h-[44px]` / `touch-manipulation` sur ExecutiveControls et panneau Actions ; cartes modules et boutons Phase avec zones tactiles ; padding bas avec `env(safe-area-inset-bottom)`

### Semaine 4 — Production (40h)

- [x] **Tests** : E2E (Playwright) sur flux Cockpit + Executive — `e2e/dashboard/cockpit-executive.spec.ts` (chargement, toolbar, pas d’overflow, panneau Actions, breadcrumbs sans « t is not defined`) ; guide `docs/dashboard/SEMAINE_4_PRODUCTION.md`
- [x] **Monitoring** : Sentry / analytics documentés — `docs/dashboard/MONITORING_SETUP.md` ; code prêt (ErrorBoundary, `monitoring.ts`, `NEXT_PUBLIC_SENTRY_DSN`)
- [x] **Déploiement** : Checklist et guide Vercel — `docs/dashboard/DEPLOYMENT_VERCEL.md` ; variables d'env (VAPID, OpenAI, Sentry) documentées
- [ ] **Formation** : doc utilisateur + parcours DG — `docs/dashboard/GUIDE_UTILISATEUR_COCKPIT_DG.md` à compléter

---

## Stack cible (alignée repo)

| Domaine | Choix | Emplacement actuel / à créer |
|---------|--------|-----------------------------|
| Frontend | Next.js 15, React 19, TS, Tailwind | ✅ `app/`, `src/` |
| Cockpit 3D / canvas | Three.js, @react-three/fiber | À vérifier dans `CockpitDGPage` |
| IA | OpenAI GPT-4 (briefing) | Nouveau : `lib/ai/` ou `app/api/ai/` |
| ML | TensorFlow.js ou API XGBoost | Nouveau : `lib/ml/` ou backend |
| Temps réel | WebSocket (Socket.io ou natif) | Étendre `useCockpitLive.ts` |
| State | Zustand, React Query | ✅ Stores existants |
| Paiements | Orange Money, Wave | Nouveau : `app/api/payments/` |
| PWA | next-pwa ou custom SW | `public/`, config Next |

---

## Métriques de succès V5

- **Performance** : 120 FPS (ou 60 FPS stable), Lighthouse > 95
- **IA** : briefing DG < 2s, précision prédictions > 85%
- **Voice** : 3 langues, taux reconnaissance > 85%
- **Temps réel** : 0 refresh manuel, reconnexion auto
- **Business** : objectifs 100 chantiers An 1, 50M FCFA, +60% satisfaction

---

## Fichiers clés à faire évoluer

- `src/modules/dashboard/components/views/CockpitDGPage.tsx` — point d’entrée Cockpit
- `src/modules/dashboard/components/cockpit/ExecutiveControls.tsx` — 12 boutons + voice
- `src/modules/dashboard/components/cockpit/voiceCommandsV5.ts` — commandes vocales
- `src/modules/dashboard/components/cockpit/executiveCommandsV5.ts` — définitions boutons
- `src/modules/dashboard/hooks/useCockpitLive.ts` — candidat WebSocket / live data
- `src/modules/dashboard/hooks/useCockpitChantiers.ts` — données chantiers
- **API prédictions** : `app/api/ai/predictions/route.ts` — mock retard/budget/qualité (remplaçable par ML)
- **API paiements** : `app/api/payments/orange-money/route.ts`, `app/api/payments/wave/route.ts` — stubs (brancher APIs réelles)
- **API Huissier** : `app/api/huissier/certify/route.ts` — stub certification UCIE
- Nouveaux : `lib/ai/`, `lib/websocket/`

---

*Document généré à partir de la vision Cockpit DG V5 Ultimate — à mettre à jour au fil des sprints.*
