# BMO Navigation — Manques et améliorations

Référence : sitemap JSON `src/lib/navigation/bmoSitemap.json`, config `bmoModules.ts`, `PageTemplate`, `useNavigation`.

---

## 1. Déjà en place

- **Source unique** : `bmoSitemap.json` → sidebar (PILOTAGE / EXÉCUTION / SUPPORT).
- **Modules** : liste dérivée du JSON avec icônes, `phaseId`, `children` exposés.
- **getModuleChildren(moduleId)** : sous-pages d’un module pour subnav / breadcrumbs.
- **getModuleByPath(pathname)** : module actif (match par longueur de path).
- **Doc** : `NAVIGATION_BMO_SITEMAP.md` décrit l’arbre et le fil conducteur.
- **pathToIdMap** : enrichi avec les paths des enfants du sitemap (paths statiques) → `activeId` et breadcrumbs corrects pour sous-pages (ex. `/cockpit/kpis` → `cockpit-kpis`).
- **SubNav dérivé du sitemap** : `getSubNavContextFromSitemap(pathname)` ; utilisé dans `PageTemplate` en fallback (cockpit, quality, opportunities, execution, receptions, achats, conformité, maintenance, etc.). Subnavs personnalisés (chantiers, alerts, engagements, governance) restent prioritaires ; Documents garde un subnav dédié (pas d’enfants dans le JSON).

---

## 2. Manques ou à améliorer

### 2.1 SubNav (onglets sous le header) — fait

- **Fait** : SubNav dérivé du sitemap via `getSubNavContextFromSitemap()` pour les modules qui ont des `children` (cockpit, opportunities, quality, execution, receptions, achats, conformité, maintenance, etc.). Subnavs personnalisés (chantiers, alerts, engagements, governance) restent prioritaires ; Documents garde un subnav dédié.

### 2.2 Breadcrumbs et pathToIdMap — partiellement fait

- **Fait** : `pathToIdMap` inclut les paths statiques des enfants du sitemap → `getActiveId` et highlight corrects pour sous-pages (ex. `/cockpit/kpis` → `cockpit-kpis`).
- **Restant** : les breadcrumbs affichent encore seulement 2 niveaux (Section > Module). Pour afficher 3 niveaux (Section > Module > Sous-page) il faudrait adapter `buildBreadcrumbs` (utils) ou ajouter une construction breadcrumbs dérivée du sitemap.

### 2.3 Cohérence SubNav Chantiers vs sitemap

- **Sitemap** : chantiers n’a qu’un child « Fiche chantier » (`/chantiers/[id]`).
- **SubNav actuel** : Programmes, Chantiers, Carte, Planning.
- **Option** : soit ajouter dans le sitemap les onglets Programmes, Carte, Planning et dériver le subnav du JSON, soit garder la config dédiée et documenter la différence.

### 2.4 Validation du sitemap JSON

- **Actuel** : import du JSON avec cast `as BmoSitemap` (pas de vérification à l’exécution).
- **Souhaitable** : validation (Zod ou autre) au build ou au chargement pour garantir `phaseRange`, `path` cohérents avec `area`, présence des champs requis.

### 2.5 Meta (titre / description) par route

- **Actuel** : pas de meta dans le JSON ; titre/description viennent de `getModuleByPath` + props de page.
- **Souhaitable** : champs optionnels `title` / `description` (et éventuellement `phase`) dans le sitemap par module ou par child pour SEO et doc produit.

### 2.6 Badge (compteurs)

- **Actuel** : badge « 4 » pour alerts est en dur dans `bmoModules.ts`.
- **Souhaitable** : laisser les badges côté code (données temps réel) ; éventuellement champ optionnel `badgeKey` dans le JSON pour associer un module à une clé de store/API.

### 2.7 Routes dynamiques et pages réelles

- S’assurer que les routes du sitemap existent ou sont gérées (modals vs URL) :
  - `/cockpit/kpis`, `/cockpit/rapports`
  - `/opportunities/[id]`, `/chantiers/[id]`, `/conception/[id]`
  - `/execution/[chantierId]`, `/execution/[chantierId]/journal`
  - `/quality/[chantierId]`, `/receptions/[chantierId]`, `/achats/[id]`, `/conformite/[id]`, `/maintenance/[batimentId]`
- Certaines sont des fiches en modal (pas de changement d’URL) ; à documenter ou à faire coïncider avec le sitemap (ex. child « Fiche » = ouverture modal depuis la liste).

### 2.8 Description par module dans le JSON

- **Actuel** : `description` des modules est `undefined` dans `bmoModules` (plus dans le JSON).
- **Souhaitable** : champ optionnel `description` dans le sitemap par module pour réutilisation dans PageTemplate, tooltips sidebar et doc.

---

## 3. Priorisation suggérée

| Priorité | Item | Effort |
|----------|------|--------|
| ~~1~~ | ~~Enrichir pathToIdMap avec les children du sitemap~~ (fait) | — |
| ~~2~~ | ~~Dériver SubNav du sitemap pour les modules avec children~~ (fait) | — |
| 3 | Ajouter `description` (et optionnellement `title`) dans le sitemap par module | Faible |
| 4 | Aligner sitemap chantiers avec subnav (Programmes, Carte, Planning) ou documenter l’écart | Faible |
| 5 | Validation Zod (ou équivalent) du JSON au chargement | Moyen |
| 6 | Vérifier / créer les pages pour les routes enfants (cockpit/kpis, etc.) | Selon routes |

---

## 4. Fichiers concernés

- **Sitemap** : `src/lib/navigation/bmoSitemap.json`
- **Config** : `src/lib/navigation/bmoModules.ts`, `config.ts`, `utils.ts`
- **UI** : `src/components/navigation/PageTemplate.tsx`, `SubNavigation.tsx`
- **Hook** : `src/hooks/navigation/useNavigation.ts`
- **Subnavs dédiés** : `src/lib/navigation/subnav/*.ts`
