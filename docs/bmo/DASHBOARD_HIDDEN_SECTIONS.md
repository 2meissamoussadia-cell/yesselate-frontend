# Sections / composants cachés dans le dashboard

## 1. Layout actif : `useCleanLayout = true` (défaut)

### Masqués volontairement (sub-nav en sidebar)
- **DashboardSubNavigation** avec `mainTabsOnly` : seuls les onglets principaux (Pilotage, Chantiers, etc.) sont affichés en haut. Les **chips de sous-catégories** (niveau 2), les **filtres leaf** (niveau 3) et le **breadcrumb en bas** sont masqués — la navigation détaillée est dans le **DashboardSubSidebar** à gauche.

### Non rendus dans ce layout
- **DashboardModulesBar** : pas utilisé en layout « clean » (uniquement dans le layout classique).
- **KPIAlertsSystem** : pas présent dans le layout clean ; uniquement dans le layout classique.
- **DashboardBottomNav** : composant mobile (`md:hidden`) non utilisé actuellement dans la page dashboard (exporté mais jamais rendu).

---

## 2. Layout classique : `useCleanLayout = false`

### Caché par breakpoint
- **KPIAlertsSystem** : enveloppé dans `<div className="mt-3 hidden md:block">` → **visible uniquement à partir du breakpoint `md`** (768px). Sur mobile/tablette, le bloc d’alertes KPI n’est pas affiché.

### Visibles dans ce layout
- **DashboardSidebar** (barre latérale complète).
- **DashboardModulesBar** (barre de modules).
- **DashboardBreadcrumbs**, barre KPI, **KPIAlertsSystem** (desktop uniquement).

---

## 3. Responsive (tous layouts)

- **Boutons header** (Rafraîchir, Exporter PDF, Analytics, Pilotage, Paramètres) : libellés en `hidden sm:inline` → sur très petit écran, seul l’icône est visible.
- **DashboardBreadcrumbs** : « Tableau de bord » en `hidden sm:inline`, « Accueil » en `sm:hidden` → libellé court sur mobile.
- **DashboardCleanLayout** (quand header affiché) : barre de recherche en `hidden md:block` → recherche masquée sur petit écran. Avec `hideHeader` (dashboard actuel), le header entier n’est pas rendu.

---

## 4. Composant non utilisé

- **DashboardBottomNav** (`src/modules/dashboard/components/mobile/DashboardBottomNav.tsx`) : exporté mais **jamais rendu** dans la page dashboard ni dans le layout. Prévu pour une navigation mobile en bas d’écran (`md:hidden`).
