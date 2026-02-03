# Audit Modernité 2026 — Réponse et Roadmap

> Document de synthèse et correction des constats.  
> *Dernière mise à jour : février 2025*

---

## ⚠️ Corrections sur l'audit initial

| Constat audit | Réalité projet |
|---------------|----------------|
| **#2 Pas de PWA / Service worker** | ❌ **Incorrect** — Le projet dispose de : `manifest.json`, `public/sw.js` (cache, offline, push), `PwaRegistration` dans Providers, push notifications. Voir `docs/dashboard/PHASE7_PWA_MOBILE_PUSH.md`. |
| **#16 Badge "Compiling..." en prod** | À vérifier — S'assurer que le build est fait avec `next build` (NODE_ENV=production). Le badge Next.js DevTools ne s'affiche qu'en dev. |

---

## LIMITES CRITIQUES IDENTIFIÉES

### 1. Architecture non-modulaire — Routing par query string
- **Actuel** : `?main=pilotage&sub=dashboard&leaf=default`
- **Standard 2026** : `/pilotage/dashboard` ou `/pilotage/dashboard/vue-dg`
- **Impact** : SEO, partage de liens, bookmarking
- **Action** : Migrer vers segments de path Next.js (refactor des layouts)

### 2. PWA — Déjà en place ✅
- manifest.json, sw.js, PwaRegistration
- Cache offline, push notifications
- **Action** : Améliorer stratégie cache (NetworkFirst sur API), tester offline

### 3. Lazy loading / Code splitting
- **Problème** : Modules chargés en bloc
- **Action** : `next/dynamic` pour les modules lourds (Calendrier, Chantiers, Analytics)

### 4. Skeleton loaders
- **Problème** : "Chargement du graphique..." en texte brut
- **Action** : Composants `Skeleton` animés (déjà présents dans `src/components/ui/skeleton.tsx` — à généraliser)

### 5. Navigation hiérarchique complexe
- 4 niveaux imbriqués
- **Actions** : Mega menu, breadcrumbs avec preview, recherche Ctrl+K (déjà présente)

### 6. Carrousel KPI auto-défilant
- **Problème** : Défile automatiquement, perte de contrôle
- **Actions** : Vue grille scroll horizontal, infinite scroll, ou "toutes les métriques" condensée

### 7. Graphiques statiques
- **Manques** : tooltip hover, zoom, drill-down, export individuel
- **Action** : Enrichir Recharts (tooltip, brush, export PNG/SVG)

### 8. Temps réel
- **Manques** : WebSocket, indicateur "● LIVE", notifications push
- **Existant** : Push via service worker, `usePushNotifications`
- **Action** : WebSocket pour mises à jour données, badge LIVE

### 9. Dashboard non personnalisable
- **Action** : `react-grid-layout` pour drag & drop, sauvegarde préférences (partiel via CustomizableDashboard)

### 10. IA / ML
- **Manques** : Prédictions, anomalies, suggestions
- **Action** : Module IA existant (`src/components/features/bmo/ia/`) — à enrichir

### 11. Mode Focus / Zen
- **Action** : Masquer menu/footer, hotkey F11 ou dédié

### 12. Gamification
- **Action** : Badges, streaks, leaderboards (priorité basse)

---

## PHASE 1 — CRITIQUES (1–2 mois)

| # | Item | Effort | Statut |
|---|------|--------|--------|
| 16 | NODE_ENV=production — next.config.ts devIndicators:false, removeConsole | — | ✅ |
| 1 | Routing moderne (path segments) | — | ✅ Path /r/main/sub/leaf, canonisation query→path, BmoTopbar, moduleLinks |
| 4 | Skeleton loaders généralisés | 3 j | ✅ Arbitrages, Calendrier, Dashboard |
| 3 | Lazy loading (next/dynamic) | 2 j | ✅ DashboardHome, Achats, Calendrier, Reporting |
| 21 | RGPD (bannière cookies, consentement) | 3 j | ✅ CookieConsentBanner (import corrigé, thème light/dark) |

**Effort** : ~15 jours | **Impact** : 38 → 55/100

---

## PHASE 2 — ESSENTIELLES (2–4 mois)

| # | Item | Effort | Statut |
|---|------|--------|--------|
| 2 | PWA — améliorer cache (NetworkFirst API) | 2 j | ✅ API étendu (dashboard, alerts, cockpit, chantiers, gouvernance, bureaux, health) |
| 8 | WebSocket temps réel + badge LIVE | 15 j | ✅ useDashboardLive, LiveStatusBadge dans page + footer, setLiveStats store |
| 7 | Graphiques interactifs (tooltip, zoom, export) | 5 j | ✅ Brush zoom, export PNG/SVG (TrendsChart, MonthlyComparisonChart, TresoreriePrevisionnelleWidget), ChartContainer thème light |
| 9 | Dashboard drag & drop (react-grid-layout) | 10 j | ✅ CustomizableDashboard @dnd-kit (glisser-déposer + flèches) |
| 13 | Mobile-first refonte | 20 j | ⬜ |

**Effort** : ~35 jours | **Impact** : 55 → 75/100

---

## PHASE 3 — DIFFÉRENCIANTES (4–6 mois)

| # | Item | Effort | Statut |
|---|------|--------|--------|
| 10 | IA : prédictions, anomalies | 15 j | ✅ GET /api/ai/suggestions + DashboardAISuggestionsPanel |
| 22 | Collaboration temps réel | 20 j | ✅ presenceStore + PresenceIndicator (mock, extensible WebSocket) |
| 11 | Mode Focus / Zen | 2 j | ✅ (déjà fait Phase 2) |
| 23 | Commandes vocales | 10 j | ✅ useVoiceCommands (Web Speech API) + bouton Micro footer |
| 24 | API publique + webhooks | 15 j | ✅ Page Paramètres > API & Webhooks + POST /api/webhooks/register |

**Effort** : ~45 jours | **Impact** : 75 → 90/100

---

## PHASE 4 — INNOVATION (6–12 mois)

- Gamification
- AR/VR chantiers
- IoT capteurs
- Blockchain traçabilité
- Multi-tenancy SaaS

---

## POINTS FORTS À CONSERVER

| Élément | Statut |
|---------|--------|
| Palette de commandes (Ctrl+K) | ✅ |
| Fil d'Ariane | ✅ |
| Thème sombre/clair | ✅ (unifié) |
| Architecture modulaire | ✅ |
| Graphiques visuels | ✅ |
| Sidebar rétractable | ✅ |
| ARIA partiel | ✅ |
| **PWA + Service worker** | ✅ (présent) |
| **Manifest + Push** | ✅ |

---

## SCORING MODERNITÉ (corrigé)

| Catégorie | Score | Note |
|-----------|-------|------|
| Architecture | ⭐⭐☆☆☆ | Query string daté |
| Performance | ⭐⭐⭐☆☆ | À optimiser |
| UX/UI | ⭐⭐⭐☆☆ | Correct |
| Interactivité | ⭐⭐☆☆☆ | Graphiques statiques |
| Mobile | ⭐⭐☆☆☆ | Desktop-first |
| Accessibilité | ⭐⭐⭐☆☆ | ARIA partiel |
| Temps réel | ⭐☆☆☆☆ | Push OK, WebSocket absent |
| IA/ML | ⭐☆☆☆☆ | Module basique |
| PWA | ⭐⭐⭐☆☆ | **Présent** (cache, push) |
| Collaboration | ⭐☆☆☆☆ | Absent |

**Score global** : ~42/100 (PWA compté)

---

## PRIORITÉS ABSOLUES (Top 5)

1. 🔴 **NODE_ENV production** — 1 jour
2. 🔴 **Routing path segments** — 5 jours
3. 🟠 **Skeleton loaders** — 3 jours
4. 🟠 **Lazy loading** — 2 jours
5. 🟠 **RGPD bannière** — 3 jours

**Total Phase 1** : ~14 jours ≈ 15–20 k€

---

## RÉFÉRENCES TECHNIQUES

- PWA : `public/sw.js`, `src/components/pwa/PwaRegistration.tsx`
- Manifest : `public/manifest.json`
- Push : `src/modules/dashboard/hooks/usePushNotifications.ts`
- Skeleton : `src/components/ui/skeleton.tsx`
- Routing actuel : `lib/stores/dashboardCommandCenterStore.ts` (mainCategory, subCategory, leaf)
- Layouts : `app/(portals)/maitre-ouvrage/*/layout.tsx`
