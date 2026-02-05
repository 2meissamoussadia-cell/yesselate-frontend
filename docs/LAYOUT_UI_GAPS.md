# Manquements Layout et UI

Ce document recense les manquements identifiés dans les layouts (App Router) et dans les composants UI (structure, accessibilité, cohérence).

---

## 1. Layouts (App Router)

### 1.1 Layouts présents

| Segment | Fichier | Remarque |
|--------|---------|----------|
| `app/` | `layout.tsx` | Racine : QueryProvider, Providers, scripts |
| `app/(portals)/maitre-ouvrage/` | `layout.tsx` | BmoPortalLayout (shell commun) |
| `app/(portals)/maitre-ouvrage/alerts/` | `layout.tsx` | Layout dédié alertes |
| `app/(portals)/maitre-ouvrage/calendrier/` | `layout.tsx` | Layout dédié calendrier |
| `app/(portals)/maitre-ouvrage/chantiers/` | `layout.tsx` | Layout dédié chantiers |
| `app/(portals)/maitre-ouvrage/dashboard/` | `layout.tsx` | Layout dédié (i18n, AuthGuard, ErrorBoundary) |
| `app/(portals)/maitre-ouvrage/documents/` | `layout.tsx` | Layout dédié documents |
| `app/(portals)/maitre-ouvrage/engagements/` | `layout.tsx` | Layout dédié engagements |
| `app/(portals)/maitre-ouvrage/governance/` | `layout.tsx` | Layout dédié gouvernance |
| `app/(portals)/maitre-ouvrage/performance/` | `layout.tsx` | Layout dédié performance |
| `app/(portals)/maitre-ouvrage/documents/` | `layout.tsx` | Layout dédié documents |
| `app/(portals)/maitre-ouvrage/opportunities/` | `layout.tsx` | Layout dédié opportunités |
| `app/(bmo)/` | `layout.tsx` | Layout BMO |
| `app/alertes/` | `layout.tsx` | Layout alertes (hors portals) |

### 1.2 Manquements layout

- ~~**Pas de `app/loading.tsx`**~~ → **✅ Fait** : skeleton racine avec role="status", aria-label, aria-busy.
- ~~**Pas de `(portals)/maitre-ouvrage/error.tsx`**~~ → **✅ Fait** : error boundary portail avec constantes ERROR_BOUNDARY / ARIA_LABELS.
- **Segments sans layout dédié** : la plupart des segments (demandes, validation-bc, chantiers, employes, finances, etc.) n’ont pas de `layout.tsx` propre ; ils héritent uniquement de `maitre-ouvrage/layout.tsx`. À prévoir si besoin de sous-nav ou de contexte spécifique.
- ~~**Metadata**~~ : **✅ Fait** pour maitre-ouvrage (racine), dashboard, alerts, calendrier, governance, chantiers, validation-bc ; **✅ Fait** pour performance, documents, engagements, opportunities (layout serveur + *LayoutClient).

### 1.3 Loading / Error par segment

**Loading (`loading.tsx`) présent pour :**

- `dashboard/`, `alerts/`, `planning/`, `performance/`, `opportunities/`
- `governance/`, `calendrier/`, `documents/`, `engagements/`
- `demandes/outlook/`, `qualite/outlook/`, `chantiers/outlook/`, `etudes/outlook/`
- `validation-bc/outlook/`, `exploitation-maintenance/outlook/`, `autorisations/outlook/`
- `programmation/outlook/`, `foncier/outlook/`, `pre-projet/outlook/`

**Loading manquant pour :** ~~performance, opportunities~~ → **✅ Fait**. Les autres segments (validation-bc à la racine, demandes à la racine, employes, finances, etc.) : routes avec `redirect()` n’en ont pas besoin ; les routes à contenu asynchrone gagneraient à avoir un `loading.tsx`.

**Error (`error.tsx`) présent pour :**

- `app/error.tsx` (global)
- `dashboard/`, `alerts/`, `planning/`
- Tous les `*/outlook/error.tsx` listés ci‑dessus

**Error manquant pour :** ~~governance, calendrier, documents, engagements, performance, opportunities~~ → **✅ Fait** (loading.tsx + error.tsx ajoutés). En cas d’erreur, Next utilise le error du parent (maitre-ouvrage ou racine) pour les segments restants sans error dédié.

---

## 2. UI – Accessibilité et cohérence

### 2.1 Déjà en place

- **Dashboard** : SkipLink « Aller au contenu principal », `id="dashboard-main-content"`, `aria-label` sur `<main>` (voir DASHBOARD_MISSING_FEATURES.md).
- **Dashboard loading** : `aria-busy="true"`, `aria-label="Chargement du dashboard"`.
- **Composants UI** : plusieurs ont `aria-label`, `role`, `aria-describedby` (dialog, sheet, dropdown, skeleton, etc.).
- **Error global** : `role="alert"` sur le conteneur.

### 2.2 Manquements UI

- ~~**Boutons « Réessayer »**~~ → **✅ Fait** : tous les error boundaries utilisent `ARIA_LABELS.RETRY` (via `SegmentErrorView` ou constantes).
- ~~**Loading skeletons**~~ → **✅ Fait** : `OutlookLikeLoadingSkeleton` et dashboard loading ont `role="status"`, `aria-label`, `aria-busy`.
- **Composants sans aria** : certains composants UI (boutons génériques, cartes, listes) peuvent ne pas exposer d’étiquette ou de rôle lorsqu’ils sont interactifs ou porteurs de sens. À auditer au cas par cas.
- ~~**Cohérence des skeletons**~~ → **✅ Fait** : `OutlookLikeLoadingSkeleton` + ~~duplication error~~ → **✅ Fait** : `SegmentErrorView` pour tous les error boundaries de segments (outlook, alertes, planning, governance, calendrier, documents, engagements, performance, opportunities).

### 2.3 Recommandations

1. **Layout**  
   - Ajouter `app/loading.tsx` (skeleton minimal ou spinner) pour le premier chargement.  
   - Ajouter `(portals)/maitre-ouvrage/error.tsx` pour capturer les erreurs au niveau du portail.  
   - Étendre `metadata` / `generateMetadata` aux pages importantes (titres, description).  
   - Ajouter `loading.tsx` (et si besoin `error.tsx`) aux segments lourds qui n’en ont pas (governance, calendrier, etc.).

2. **UI / Accessibilité**  
   - Donner un `aria-label` à tous les boutons « Réessayer » des error boundaries.  
   - Ajouter `role="status"` et `aria-label` aux états de chargement (skeletons) qui n’en ont pas.  
   - Extraire un composant commun pour le skeleton “Outlook” et l’utiliser dans les loadings concernés.

3. **Cohérence**  
   - ~~Centraliser les messages d’erreur~~ → **✅ Fait** : `lib/constants/index.ts` expose `ERROR_BOUNDARY` et `ARIA_LABELS` ; utilisés dans `app/error.tsx`, `maitre-ouvrage/error.tsx`, `dashboard/error.tsx`.

---

## 3. Fichiers modifiés / à modifier (résumé)

| Fichier | Action | Statut |
|---------|--------|--------|
| `app/error.tsx` | Ajouter `aria-label` au bouton Réessayer | ✅ Fait |
| `app/(portals)/maitre-ouvrage/dashboard/error.tsx` | Idem | ✅ Fait |
| Tous les `*/error.tsx` (alerts, planning, outlook) | Idem | ✅ Fait |
| `app/(portals)/maitre-ouvrage/alerts/loading.tsx` | Ajouter `role="status"`, `aria-label`, `aria-busy` | ✅ Fait |
| `app/(portals)/maitre-ouvrage/demandes/outlook/loading.tsx` | Idem | ✅ Fait |
| Tous les `*/outlook/loading.tsx` + planning | Idem | ✅ Fait |
| `app/loading.tsx` | Skeleton plein écran premier chargement | ✅ Fait |
| `app/(portals)/maitre-ouvrage/error.tsx` | Error boundary portail | ✅ Fait |
| `OutlookLikeLoadingSkeleton` | Composant commun skeleton Outlook | ✅ Fait (src/components/ui/OutlookLikeLoadingSkeleton.tsx) |
| `SegmentErrorView` | Vue d’erreur partagée pour segments (outlook, alertes, planning, etc.) | ✅ Fait (src/components/ui/SegmentErrorView.tsx) |
| PageTemplate (navigation) | Zone contenu avec aria-label "Contenu principal" | ✅ Fait |
| Bmo PageTemplate (bmo/layout/PageTemplate.tsx) | Zone contenu avec aria-label "Contenu principal" | ✅ Fait |
| Metadata (maitre-ouvrage, dashboard, alerts, calendrier, governance, performance, documents, engagements, opportunities) | Titres et descriptions SEO | ✅ Fait |
| `performance/loading.tsx` + `performance/error.tsx` | Loading et error segment Performance | ✅ Fait |
| `opportunities/loading.tsx` + `opportunities/error.tsx` + layout serveur + metadata | Loading, error et SEO segment Opportunités | ✅ Fait |
| `app/not-found.tsx` | Page 404 globale (constantes NOT_FOUND, aria, lien accueil) | ✅ Fait |
| `(portals)/maitre-ouvrage/not-found.tsx` | Page 404 portail (lien dashboard) | ✅ Fait |
| SegmentErrorView | Focus automatique sur bouton Réessayer au montage (a11y clavier/lecteur d’écran) | ✅ Fait |
| app/error, dashboard/error, maitre-ouvrage/error | Focus automatique sur bouton Réessayer (aligné avec SegmentErrorView) | ✅ Fait |
| `app/loading.tsx` | Utilise `LOADING_LABELS.ROOT` (lib/constants) pour aria-label | ✅ Fait |
| PortalModuleCleanLayout | Tests layout (région Contenu, aside Sections, nav, enfants) | ✅ Fait (__tests__/layouts/PortalModuleCleanLayout.test.tsx) |
