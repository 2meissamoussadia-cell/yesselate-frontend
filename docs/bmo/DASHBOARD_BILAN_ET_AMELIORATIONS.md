# Dashboard Maître d'ouvrage — Bilan et pistes d'amélioration

## Ce qui a été bien travaillé

### Structure et navigation
- **Un seul shell** : BmoPortalLayout pour (bmo) et (portals)/maitre-ouvrage, pas de doublon.
- **Sub-sidebar** : Sous-catégories du bloc actif uniquement ; « Accès rapide » redondant supprimé.
- **Config pilotage** : Ordre logique (Cockpit DG → Centre d'alertes → Gouvernance → Calendrier → Analytics) ; « Vue avancée 3D » retirée du dashboard.
- **Pas de `<main>` imbriqué** : Un seul landmark `main#main-content`, pas de doublon d’IDs.

### Appels et données
- **Un seul appel KPI** au chargement : la palette reçoit les KPIs de la page (pas de second `useDashboardKPIs`).
- **KPIs** : Barre des 6 cartes alimentée par `useDashboardKPIs` + fallback, cliquables pour drill-down.

### UX
- **Bande KPI pliable** : En-tête « Indicateurs clés » avec chevron pour plier/déplier la ligne des 6 cartes.
- **Barre redondante supprimée** : Ligne « Synthèse pilotage / NICE RÉNOVATION / 8 décisions / 3 blocages » retirée (doublon avec les cartes KPI et la section « Indicateurs clés de performance »).
- **Accessibilité** : Skip link « Aller au contenu », `aria-expanded` / `aria-controls` sur les sections pliables, labels cohérents.

### Documentation
- **Sections cachées** : Documenté dans `DASHBOARD_HIDDEN_SECTIONS.md`.
- **KPIAlertsSystem** : Visible sur tous les breakpoints en layout classique (plus de `hidden md:block`).

---

## Pistes d'amélioration

### 1. Données réelles vs mock
- **DashboardAccueil3P** : Bloc « Indicateurs clés de performance » (Demandes 247, Validations 89%, etc.) et sections Finance / Portefeuille / Risques utilisent encore des **valeurs en dur ou des mocks** (`phase4Critiques`, `financesGlobales`, etc.).
- **À faire** : Brancher ces blocs sur les mêmes sources que la barre KPI (API stats / dashboard) ou des endpoints dédiés (synthèse pilotage, finance, risques) pour afficher des données cohérentes et à jour.

### 2. Layout clean : alertes et mobile
- **KPIAlertsSystem** : Présent uniquement dans le layout classique ; absent du layout clean (défaut). On peut l’ajouter sous la bande KPI en layout clean pour garder les alertes visibles.
- **Mobile** : `DashboardBottomNav` existe mais n’est pas rendu ; sur petit écran, la navigation repose sur le SubSidebar (dépliable au survol). On peut intégrer `DashboardBottomNav` dans le layout dashboard pour une vraie navigation mobile en bas d’écran.

### 3. État plié/déplié persisté
- **Bande KPI** : État `kpiStripCollapsed` est en mémoire ; rechargement = tout se redéplie. Option : persister dans `localStorage` ou dans le store (ex. `dashboardCommandCenterStore`) pour garder le choix de l’utilisateur.

### 4. Indicateurs clés dans DashboardAccueil3P
- **Doublon sémantique** : La section « Indicateurs clés de performance » (Demandes, Validations, Blocages, Décisions) dans `DashboardAccueil3P` reprend les mêmes métriques que la bande KPI en haut. Options :
  - Soit alimenter cette section avec les **mêmes données** que la bande KPI (une seule source).
  - Soit la transformer en **synthèse détaillée** (répartition, tendances, liens vers les vues dédiées) pour éviter la simple répétition.

### 5. Erreurs et chargement
- **Erreur API KPI** : La page affiche un fallback (valeurs par défaut) ; on pourrait afficher un message discret « Données en cache » ou « Actualisation impossible » quand l’appel échoue.
- **Skeleton** : Le chargement initial a un `DashboardSkeleton` ; les vues internes (DashboardAccueil3P, ViewRouter) pourraient avoir des skeletons ciblés pendant le chargement des blocs (finance, risques, etc.) si on branche des appels asynchrones.

### 6. Export et rafraîchissement
- **Export** : Déjà présent (PDF, Excel, etc.) dans le layout classique ; en layout clean, pas de boutons Export visibles dans la zone principale. Option : ajouter un bouton Export (ou un menu) dans la barre du dashboard (à côté de « Indicateurs clés » ou dans le topbar BMO).
- **Rafraîchissement** : Rafraîchissement global (Ctrl+R) existe ; on pourrait afficher un indicateur discret « Dernière MAJ : il y a X min » sous la bande KPI en layout clean pour rappeler la fraîcheur des données.

---

## Éléments manquants (optionnels)

| Élément | Description | Priorité |
|--------|-------------|----------|
| Filtre projet / périmètre | Sélecteur « NICE RÉNOVATION » ou périmètre (tous / par projet / par bureau) pour filtrer les KPIs et les blocs | Moyenne |
| Raccourcis clavier | Raccourcis documentés (ex. ? pour aide, Ctrl+K déjà présent) dans une modale ou un pied de page | Basse |
| KPIAlertsSystem en layout clean | Bloc d’alertes KPI sous la bande KPI quand layout clean actif | Moyenne |
| Navigation mobile (BottomNav) | Afficher `DashboardBottomNav` sur viewport &lt; md pour faciliter la navigation sur téléphone | Moyenne |
| Persistance état plié | Se souvenir si la bande KPI est pliée ou dépliée (localStorage ou store) | Basse |

---

## Synthèse

- **Oui, la page dashboard a bien été travaillée** : structure claire, moins de redondances, un seul shell, appels KPI dédupliqués, bande KPI pliable, barre inutile supprimée, accessibilité prise en compte.
- **On peut encore améliorer** : brancher les blocs de `DashboardAccueil3P` sur des données réelles, ajouter KPIAlertsSystem et/ou navigation mobile en layout clean, persister l’état plié, et affiner messages d’erreur / fraîcheur des données. Les éléments listés ci‑dessus sont des pistes, pas des blocants.
