# Roadmap modernisation — Phase 1 (résumé)

Ce document résume les actions Phase 1 réalisées ou à planifier suite à l’audit modernité dashboard.

## Réalisé

### #16 — Environnement de production
- **next.config.ts** : `devIndicators` déjà désactivé en production (`NODE_ENV === 'production'`).
- **Docs** : `docs/dashboard/DEPLOYMENT_VERCEL.md` — section Production et checklist mises à jour (toujours `pnpm build` + `pnpm start` en prod, jamais `pnpm dev`).

### #4 — Skeleton loaders
- **`src/components/ui/skeleton.tsx`** : nouveau composant `ChartSkeleton` (barres animées) pour remplacer le texte « Chargement du graphique... ».
- **Utilisation** :
  - `DashboardCharts.tsx` : fallback des graphiques lazy-loaded.
  - `ChartKit/PieChart.tsx`, `LineChart.tsx`, `BarChart.tsx` : loading des graphiques dynamiques.
  - `app/(portals)/maitre-ouvrage/alerts/page.tsx` : chargement des graphiques.
- **`DashboardLayoutClient.tsx`** : fallback du layout dashboard remplacé par `DashboardSkeleton` au lieu du texte « Chargement du dashboard... ».

### #21 — Conformité RGPD (bannière cookies)
- **`src/components/shared/CookieConsentBanner.tsx`** : bannière cookies avec « Tout accepter » / « Refuser les cookies non essentiels », lien vers politique de confidentialité, préférence stockée en `localStorage` (`yesselate-cookie-consent-v1`).
- **`lib/providers/Providers.tsx`** : `CookieConsentBanner` ajouté dans l’arbre des providers (affichage global).

### #1 — Routing moderne (path segments) — fait
- **Format** : `/maitre-ouvrage/dashboard/r/{main}/{sub}/{leaf}` (ex. `/maitre-ouvrage/dashboard/r/pilotage/dashboard/default`).
- **Fichiers** :
  - `src/modules/dashboard/utils/dashboardPathUrl.ts` : `parseDashboardPath`, `buildDashboardPathUrl`, `isDashboardPathUrl`.
  - `src/modules/dashboard/hooks/useDashboardCommandCenterUrlSync.ts` : lecture path ou query, push path, canonisation query → path.
  - `app/(portals)/maitre-ouvrage/dashboard/r/[[...path]]/page.tsx` : route catch-all pour les URL path.
- **Liens** : cockpit, gouvernance, BmoSidebar, KpiOverviewPage, performances redirect mis à jour vers URL path.
- **Rétrocompat** : `/maitre-ouvrage/dashboard?main=...` est redirigé vers l’URL path.

### #3 — Lazy loading / code splitting — renforcé
- **simpleRegistry.tsx** : fallback skeleton (`ContentLoadingSkeleton`) sur les vues dynamiques (DashboardAdvancedView, ProjetKpiPage, DemandesKpiPage, BudgetKpiPage, HighlightsKpiPage, SummaryPointsPage).
- Déjà en place : `DashboardCharts` (lazy + Suspense), ChartKit (`next/dynamic`).

---

## Phase 2 (démarrée)

### #2 — PWA / Service worker — amélioré
- **public/sw.js** : version cache `yessalate-dg-v2` ; URLs path dashboard dans `urlsToCache` et dans les notifications push (data.url) ; stratégie Network First + cache pour `/api/dashboard/*` (API_CACHE_NAME) ; notificationclick utilise les URL path.
- **public/manifest.json** : shortcuts « Tableau de bord » et « Cockpit DG » pointent vers `/maitre-ouvrage/dashboard/r/pilotage/dashboard/default`.
- **PwaRegistration** : enregistre déjà `/sw.js` ; pas de changement nécessaire.

### Export API dashboard
- **app/api/export/dashboard/route.ts** : accepte `main`, `sub`, `leaf` en query (inchangé). Le client `useDashboardExport` lit le store (synchronisé avec l’URL path) et envoie ces paramètres ; aucun changement côté API pour le routing path.

---

## Phase 2 (suite)

### #8 — Temps réel visible (indicateur LIVE + timestamp dynamique)
- **LastUpdateDisplay** (`components/LastUpdateDisplay.tsx`) : tick toutes les 15 s pour mettre à jour « Mise à jour : il y a X min » (au lieu de 60 s).
- **LiveIndicator** (`components/shared/LiveIndicator.tsx`) : badge « ● LIVE » + optionnel « Mise à jour : X » ; utilisé dans le footer quand `lastUpdate` est fourni.
- **DashboardFooter** : prop optionnelle `lastUpdate?: Date | null` ; si fournie, affiche `LiveIndicator` (● LIVE + timestamp dynamique).
- **DashboardCleanLayout** : prop optionnelle `lastUpdateDate?: Date | null` ; si fournie, affiche `LastUpdateDisplay` au lieu du texte statique « Dernière maj : 30s ».

### #13 — Responsive
- **DashboardHome** : grilles déjà responsives (`grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-4`, etc.) ; pas de changement supplémentaire pour cette phase.

### Branchement lastUpdate footer
- **Store** : `setLastDataUpdate(isoString)` dans `dashboardCommandCenterStore` pour mettre à jour `liveStats.lastUpdate`.
- **DashboardContentSwitch** : après chargement vue (loader ou cache frais), appelle `setLastDataUpdate` ; vues sans loader mettent aussi à jour le timestamp.
- **DashboardCommandCenterPage** : passe `lastUpdate={lastUpdateDate}` (depuis `liveStats.lastUpdate`) et `onToggleFocus` / `focusMode` au footer.

### #11 — Mode Focus / Zen
- **Store** : `displayConfig.focusMode` déjà présent.
- **DashboardCommandCenterPage** : en mode Focus, masque `DynamicSidebar` et remplace le header complet par une barre minimale « Mode Focus — contenu uniquement » + bouton « Quitter Focus (Ctrl+Shift+F) ».
- **Raccourci** : **Ctrl+Shift+F** (ou Cmd+Shift+F) pour basculer le mode Focus (hors champs de saisie).
- **DashboardFooter** : bouton « Focus » / « Quitter Focus » avec tooltip « Mode Focus : masquer menu et en-tête (Ctrl+Shift+F) » lorsque `onToggleFocus` est fourni.
- **Modal Raccourcis** : entrée « Mode Focus (masquer menu et en-tête) » avec **Ctrl+Shift+F** dans `DashboardModals.tsx` et dans le tooltip Raccourcis du footer.

### Export API & liens
- **API export dashboard** : schéma `main` étendu pour accepter `pilotage`, `chantiers`, `finance`, `clients`, `rh`, `systeme` (compatibilité avec le store et le routing path).
- **Liens** : les seules occurrences restantes de `dashboard?main=` sont dans des commentaires ou exemples ; pas de correction nécessaire.

## Références

- Audit : score 38/100, roadmap Phases 1–4.
- Priorités : #16 (fait), #1 (fait), #2 PWA (amélioré), #8 temps réel, #13 mobile-first.
