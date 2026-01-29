# Analyse des manquements — Dashboard YESSALATE BMO

Document d’analyse des manquements identifiés sur l’interface du tableau de bord (capture : zone principale vide, placeholder image, barre d’actions avec scroll horizontal).

---

## 1. Contenu principal vide ou placeholder

### Constat
- La zone centrale affiche des en-têtes de section (« Façade nord », « Électricité ») avec coordonnées et date, puis un **placeholder type image cassée** et une **grande zone sombre vide**.
- Les blocs de contenu attendus (KPIs, graphiques, cartes) ne s’affichent pas ou sont remplacés par ce placeholder.

### Causes identifiées dans le code

#### 1.1 Données non injectées dans les vues (routeur vs registry)
- **DashboardCommandCenterPage** utilise **DashboardViewRouter**, qui :
  - résout le composant par **nom** via `getRouteComponent()` + `loadComponent()` ;
  - **n’utilise pas** le registry (loaders + `render({ data })`) ;
  - rend `<Component />` **sans aucune prop** (donc pas de `data`).
- Les vues qui dépendent des **loaders du registry** (ex. `BudgetKpiPage`, `ProjetKpiPage`, `DemandesKpiPage`) reçoivent donc **aucune donnée** quand elles sont servies par ce routeur.
- **DashboardContentSwitch** et **DashboardRegistryView** utilisent bien `entry.render({ nav, data })`, mais la page « Centrale de commandement » n’utilise pas ce chemin : seul **DashboardViewRouter** est monté.

**Impact** : vues avec loader (KPIs, synthèses) affichent un état vide ou des valeurs par défaut/mock même lorsque l’API renvoie des données.

**Piste de correction** : faire en sorte que le routeur utilise le registry pour les routes connues (ex. `overview::summary::*`, `overview::kpis::*`) et appelle `entry.render({ data })` avec les données du loader, ou unifier le rendu sur un seul mécanisme (registry + data) pour toute la Centrale de commandement.

#### 1.2 Images externes (Photos GPS — Façade nord / Électricité) — **Corrigé**
- Les libellés « Façade nord » et « Électricité » (et les coordonnées 14.7925, -16.9264 / date) proviennent du **mock** `photoGpsMock.ts`, utilisé par **CockpitPhotosGpsPanel** (section Phase 6 du Cockpit DG).
- **Correction appliquée** : les URLs utilisent désormais un **placeholder local** (`/images/placeholder-photo.svg`) au lieu de picsum.photos, ce qui évite les 503 et les images cassées. **CockpitPhotosGpsPanel** a déjà un fallback `onError` + `ImagePlaceholder` si une image échoue.
- En production : remplacer le placeholder par des URLs stock/CDN contrôlées.

#### 1.3 Cohérence route / composant
- Pour **overview > summary > dashboard**, `navigation.config.json` pointe vers **SummaryDashboardPage** (qui rend **OverviewView**).
- Pour **overview > summary > cockpit**, le composant est **CockpitDGPage** (qui contient la section Photos GPS avec Façade nord / Électricité).
- Si l’utilisateur a « Tableau de bord » comme libellé mais que la config ou l’URL correspond en fait à **cockpit**, alors la vue affichée est CockpitDGPage ; le placeholder et la zone vide viennent alors des images Photos GPS + éventuellement d’autres contenus dynamiques non chargés.

**Recommandation** : vérifier la correspondance entre libellé « Tableau de bord », segment d’URL (main/sub/leaf) et composant effectivement chargé (SummaryDashboardPage vs CockpitDGPage) pour éviter toute ambiguïté et pour cibler les corrections (OverviewView vs CockpitDGPage).

---

## 2. Barre d’actions en bas et scroll horizontal

### Constat
- Une **barre horizontale** de boutons colorés (ex. MERGENCE, BOOST, CALL TEAM, PAY NOW, etc.) est visible en bas.
- Un **scroll horizontal** est présent (surligné sur la capture), ce qui indique que le contenu dépasse la largeur visible et que des actions sont masquées sans scroll.

### Analyse dans le code
- **ExecutiveControls** (`ExecutiveControls.tsx`) est la barre fixe en bas :
  - Conteneur principal : `overflow-x-hidden`, `flex`, `flex-wrap`, `justify-center`, `gap-2`.
  - Les **12 commandes** (EXECUTIVE_COMMANDS_V5) ne sont **pas** toutes dans cette barre : la barre n’a que le bouton « ? », le sélecteur FR|EN, le bouton micro et le bouton « Actions ».
  - Les 12 boutons colorés sont dans un **panneau ouvrant** (modal) en **grille** `grid-cols-2 sm:grid-cols-3`, pas en ligne.
- Donc le **scroll horizontal** ne vient probablement **pas** des 12 boutons du panneau, mais soit :
  - d’un **autre bloc** (contenu principal ou footer) qui dépasse en largeur, soit
  - d’un **conteneur parent** qui a `overflow-x: auto` et dont un enfant (ex. contenu du tableau de bord) est plus large que la vue.

**Pistes de correction** :
- Vérifier la hiérarchie des conteneurs (main, content, footer) et s’assurer que la zone de contenu principale a `min-w-0` et `overflow-x-hidden` (ou `overflow-x: auto` uniquement si un tableau/grille large est voulu) pour éviter qu’un enfant ne force le scroll horizontal de toute la page.
- Si une future version affiche les 12 boutons en ligne sur grand écran, prévoir un **wrap** ou un **groupe scrollable** avec indicateur visuel (ombre, flèches) pour que toutes les actions restent accessibles sans surprise.

---

## 3. Synthèse des manquements et priorités

| # | Manquement | Cause probable | Priorité |
|---|------------|----------------|----------|
| 1 | Contenu principal vide / placeholder | Données non passées au composant (routeur n’utilise pas le registry + loaders) ; ou vue qui attend des données et reçoit rien | Haute |
| 2 | Image cassée / zone vide sous « Électricité » | URLs picsum.photos en échec + pas de fallback `onError` sur les images dans CockpitPhotosGpsPanel | Haute |
| 3 | Scroll horizontal en bas | Contenu (ou conteneur) plus large que la vue ; à clarifier entre barre ExecutiveControls et zone de contenu | Moyenne |
| 4 | Double système de rendu (registry vs loadComponent) | DashboardViewRouter charge par nom sans data ; DashboardContentSwitch utilise le registry avec data mais n’est pas utilisé sur cette page | Haute (technique) |

---

## 4. Recommandations techniques

1. **Unifier le rendu des vues**  
   Soit faire utiliser le **registry** (avec loaders et `render({ data })`) par la page Centrale de commandement (remplacer ou compléter le flux actuel de DashboardViewRouter), soit faire en sorte que le routeur récupère et injecte les données (loader + cache) avant de rendre le composant. Éviter d’avoir des vues « avec data » qui sont en fait rendues sans data.

2. **Robustesse des images (Photos GPS)**  
   - Ajouter `onError` (et si besoin `onLoad`) sur toutes les `<img>` de `CockpitPhotosGpsPanel.tsx`.  
   - Afficher un placeholder (div + icône ou image locale) en cas d’erreur.  
   - À terme : utiliser des URLs d’images hébergées (stock/CDN) plutôt que picsum en production.

3. **Layout et overflow**  
   - Appliquer `min-w-0` et, selon le cas, `overflow-x-hidden` sur le conteneur principal du contenu (ex. la div qui enveloppe `DashboardViewRouter`) pour éviter qu’un enfant ne provoque un scroll horizontal global.  
   - Vérifier `DashboardFooter` et tout bloc en bas de page pour s’assurer qu’ils ne dépassent pas en largeur.

4. **Cohérence config / UX**  
   - Vérifier que le libellé « Tableau de bord » et l’URL (main/sub/leaf) pointent bien vers la vue souhaitée (SummaryDashboardPage vs CockpitDGPage) et documenter ou ajuster la config pour éviter les confusions.

---

## 5. Fichiers concernés (référence)

- `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` — utilise DashboardViewRouter.
- `src/modules/dashboard/components/DashboardViewRouter.tsx` — résolution par `getRouteComponent` + `loadComponent`, pas d’injection de `data`.
- `src/modules/dashboard/components/DashboardContentSwitch.tsx` — utilise le registry et `view.render({ nav, data })` (non utilisé sur la page actuelle).
- `src/modules/dashboard/registry/dashboardRegistry.tsx` — loaders et `createLazyView` / `render` avec `data`.
- `src/modules/dashboard/components/views/CockpitDGPage.tsx` — inclut ExecutiveControls et CockpitPhase6Section.
- `src/modules/dashboard/components/cockpit/CockpitPhotosGpsPanel.tsx` — affichage des photos (Façade nord, Électricité) sans fallback image.
- `src/modules/dashboard/data/photoGpsMock.ts` — URLs picsum.photos pour thumb/large.
- `src/modules/dashboard/components/cockpit/ExecutiveControls.tsx` — barre d’actions fixe en bas.
- `src/modules/dashboard/navigation/navigation.config.json` — mapping route → composant (dashboard = SummaryDashboardPage, cockpit = CockpitDGPage).

---

*Document généré à partir de l’analyse du code et de la capture d’écran du tableau de bord YESSALATE BMO V1.0.*
