# Analyse de redistribution — Dashboard → Modules maître-ouvrage

**Date** : Janvier 2025  
**Objectif** : Analyser tout ce qui est actuellement sous `maitre-ouvrage/dashboard` (et associé dans `src/modules/dashboard`) et proposer une redistribution des fonctionnalités dans les autres modules du portail maître-ouvrage selon leur pertinence métier.

---

## 1. Synthèse

Aujourd’hui, le **dashboard** concentre une grande partie de l’interface maître-ouvrage : vue d’ensemble (overview), performance, validations, retards, risques, actions, décisions, temps réel, administration. En parallèle, le portail dispose déjà de modules dédiés avec leurs propres routes et layouts :

| Module (route) | Chemin app | Chemin src/modules | Rôle |
|----------------|------------|--------------------|------|
| **Alertes** | `maitre-ouvrage/alerts` | `alertes`, `alerts`, `centre-alertes` | Alertes critiques, projets, RH, SLA |
| **Gouvernance** | `maitre-ouvrage/governance` | `gouvernance` | Arbitrages, attention, conformité, synthèses, tendances |
| **Validation BC** | `maitre-ouvrage/validation-bc` | `validation-bc` | BC, factures, avenants, statuts, analyse |
| **Demandes** | `maitre-ouvrage/demandes` | `demandes` | Liste et workflow des demandes |
| **Décisions** | `maitre-ouvrage/decisions` | `decisions` | Décisions en attente / exécutées |
| **Arbitrages vivants** | `maitre-ouvrage/arbitrages-vivants` | `arbitrages-vivants` | Dossiers bloqués, substitution |
| **Analytics** | `maitre-ouvrage/analytics` | (nav BMO) | Chantiers, finance, écarts, révisions |
| **Calendrier** | `maitre-ouvrage/calendrier` | `calendrier` | Événements, jalons, Gantt, vue ensemble |
| **Finances** | `maitre-ouvrage/finances` | `finances` | Vue finances |
| **Projets en cours** | `maitre-ouvrage/projets-en-cours` | `projets-en-cours` | Chantiers, documents |
| **Validation contrats** | `maitre-ouvrage/validation-contrats` | `validation-contrats` | Contrats, priorité, statut |
| **Validation paiements** | `maitre-ouvrage/validation-paiements` | `validation-paiements` | Paiements |
| **Paramètres** | `maitre-ouvrage/parametres` | `parametres` | Paramètres utilisateur / app |
| **Logs** | `maitre-ouvrage/logs`, `system-logs` | `logs`, `system-logs` | Activité, système |

**Recommandation** : garder le dashboard comme **centrale de commandement** (accueil, KPIs agrégés, cockpit DG, lien rapide vers les modules). Les **vues détaillées** (validations, retards, risques, actions, décisions, temps réel, administration) doivent être **réparties** dans les modules existants ou dédiés, avec des liens depuis le dashboard.

---

## 2. Inventaire — Ce qui est sous le dashboard aujourd’hui

Source : `dashboardNavigationConfig`, `navigation.config.json`, `src/modules/dashboard/components/views`, `loadComponent.ts`, `dashboardRegistry`.

### 2.1 Overview (Accueil)

| Sub | Leaf | Composant / Vue | Description |
|-----|------|-----------------|-------------|
| summary | cockpit | CockpitDGPage | Centrale de commandement (cockpit DG) |
| summary | cockpit-v2 | CockpitDG_V2Page | Centrale V2 (IA) |
| summary | rapport-dg | RapportDGPage | Rapport DG |
| summary | dashboard | SummaryDashboardPage | Dashboard principal |
| summary | points | SummaryPointsPage | Points clés |
| summary | projets, budget | ProjetKpiPage, BudgetKpiPage | KPIs projets / budget (résumé) |
| kpis | dashboard, highlights, projets, demandes, budget, finances | KpiOverviewPage, HighlightsKpiPage, ProjetKpiPage, DemandesKpiPage, BudgetKpiPage, FinancesOverviewPage | KPIs clés |
| alerts | actives, urgentes | AlertsActivesPage, AlertsUrgentesPage | Alertes critiques (actives / urgentes) |
| activity | timeline, notifications, conversations | ActivityTimelinePage, ActivityNotificationsPage, ConversationsHistoryPage | Activité récente |

**Pertinence** :  
- **Rester dans dashboard** : summary (cockpit, cockpit-v2, rapport-dg, dashboard, points), kpis (synthèse globale).  
- **Rediriger vers modules** : alerts → `maitre-ouvrage/alerts` ; activity (notifications / conversations) → à placer dans un module « Notifications » ou « Activité » ou garder en entrée dashboard avec lien profond vers `alerts`.

### 2.2 Performance

| Sub | Leaf | Composant / Vue | Description |
|-----|------|----------------|-------------|
| indicators | synthese, projets, demandes, budget | PerformanceSynthesePage, PerformanceProjetsPage, PerformanceDemandesPage, PerformanceBudgetPage | Indicateurs |
| validation | global, en-attente, validees, rejetees, circuit | ValidationsGlobalPage | Validations (BC / contrats) |
| budget | consommation, restant, previsions, analyse, dashboard | BudgetKpiPage | Budget |
| delays | critiques, moyens, analyse-causes | DelaysCritiquesPage, DelaysMoyensPage, DelaysAnalyseCausesPage | Retards |
| comparison | bureaux, projets | BureauxPage, ProjetKpiPage, PerformanceBureaux*Page, ComparisonBureauxPage | Comparaisons par bureaux / projets |
| achats | dashboard, trends, fournisseurs, open-orders | AchatsOverviewPage, TendancesPage, AchatsFournisseursPage, AchatsOpenOrdersPage | Achats & contrats |
| stocks | overview, trends | StocksOverviewPage, StocksTrendsPage | Stocks |
| materiel | overview | MaterielOverviewPage | Parc matériel |
| compliance | dashboard, documents, backlog, lots | ComplianceOverviewPage, ComplianceDocumentsPage, ComplianceWorkflowsPage, ComplianceLotsPage | Conformité |
| reporting | dashboard, tendances, bureaux, chantiers | ReportingOverviewPage, ReportingTrendsPage, ReportingByBureauPage, ReportingByChantierPage | Reporting direction |
| bureaux | all, bmo, bf, bj, bct, bop, bcg, bja, brc, bpl, bex, comparaison | BureauxPage, PerformanceBureauxAllPage, PerformanceBureauxBmoPage, … | Bureaux (détail par bureau) |
| trends | mensuelles, trimestrielles, annuelles | TendancesPage, TrendsMensuellesPage, TrendsTrimestriellesPage, TrendsAnnuellesPage | Tendances |

**Pertinence** :  
- **Validation** → `maitre-ouvrage/validation-bc` (BC) et `maitre-ouvrage/validation-contrats` (contrats). Le dashboard peut garder une « synthèse validations » avec liens vers ces modules.  
- **Budget / Finances** → `maitre-ouvrage/finances` ou module dédié « Budget » ; dashboard garde une vue KPIs budget.  
- **Retards (delays)** → `maitre-ouvrage/alerts` (projets/retards) ou `maitre-ouvrage/governance` (attention/retards-critiques).  
- **Bureaux / Comparaison** → soit garder sous dashboard (vue reporting), soit créer `maitre-ouvrage/reporting` ou intégrer sous `governance/synthese` + `governance/tendances`.  
- **Achats, Stocks, Matériel, Compliance, Reporting** → modules métier dédiés si ils existent (ex. `maitre-ouvrage/achats`, `maitre-ouvrage/stocks`, etc.) ; sinon les garder sous dashboard avec une nav dédiée.  
- **Tendances** → `maitre-ouvrage/governance/tendances` ou `maitre-ouvrage/analytics`.

### 2.3 Actions & Tâches

| Sub | Leaf | Composant (config / registry) | Description |
|-----|------|-------------------------------|-------------|
| inbox | urgentes, aujourdhui, semaine, personnalisees | ActionsInbox*Page, SummaryDashboardPage (fallback) | Boîte de réception |
| type | contrats, arbitrages, paiements, bc, autres | (divers) | Par type |
| priority | critique, haute, moyenne | (divers) | Par priorité |
| blocked | blocages, escalades, analyse | ActionsBlocked*Page | Bloquées |
| assigned | moi, equipe, non-assignees | ActionsAssigned*Page | Assignées |
| history | recentes, anciennes, archivees | ActionsHistory*Page | Historique |

**Pertinence** :  
- **Bloquées / Escalades** → `maitre-ouvrage/arbitrages-vivants` et `maitre-ouvrage/governance` (attention/escalades).  
- **Contrats, BC, Paiements** → `maitre-ouvrage/validation-contrats`, `maitre-ouvrage/validation-bc`, `maitre-ouvrage/validation-paiements`.  
- **Boîte de réception / Assignées / Historique** : soit module dédié `maitre-ouvrage/actions` (ou « Ma boîte »), soit intégration dans les modules existants (demandes, validation-bc, etc.) avec onglets « À moi » / « Équipe ».  
- **Dashboard** : garder un bloc « Actions prioritaires » (liens + compteurs) vers ces modules.

### 2.4 Risques

| Sub | Leaf | Composant | Description |
|-----|------|-----------|-------------|
| critical | risques, alertes | RisksCriticalRisquesPage, RisksCriticalAlertesPage | Critiques |
| warnings | moyens, faibles | RisksWarningsMoyensPage, RisksWarningsFaiblesPage | Avertissements |
| type | paiements-retard, contrats-expires, blocages, alertes-systeme | RisksType*Page | Par type |
| analyse | tendances, causes-racines, previsions | RisksAnalyse*Page | Analyse |
| actions-correctives | en-cours, planifiees | RisksActionsCorrectives*Page | Actions correctives |

**Pertinence** :  
- **Risques / Alertes** → `maitre-ouvrage/alerts` (structure déjà : critiques, overview, projets, RH, SLA). Enrichir les pages alerts avec les vues « par type » et « analyse » si besoin.  
- **Actions correctives** → `maitre-ouvrage/governance` (attention) ou `maitre-ouvrage/arbitrages-vivants`.  
- **Dashboard** : garder une entrée « Risques & Santé » avec KPIs + lien vers `maitre-ouvrage/alerts`.

### 2.5 Décisions

| Sub | Leaf | Composant | Description |
|-----|------|-----------|-------------|
| pending | urgentes, normales, planifiees | (SummaryDashboardPage ou dédié) | En attente |
| executed | recentes, anciennes, par-type | (idem) | Exécutées |
| timeline | chronologique, par-type, par-auteur | DecisionsTimeline*Page | Timeline |
| audit | traces, rapports, conformite | (idem) | Audit |
| modeles | substitution, delegation, arbitrage | (liens) | Modèles |

**Pertinence** :  
- **Tout le bloc Décisions** → `maitre-ouvrage/decisions` (module existant). Adapter les pages app `maitre-ouvrage/decisions` pour qu’elles utilisent les vues actuellement dans `src/modules/dashboard/components/views` (DecisionsTimeline*, etc.) ou les déplacer dans `src/modules/decisions`.  
- **Substitution / Délégation / Arbitrage** → déjà des routes : `maitre-ouvrage/substitution`, `maitre-ouvrage/delegations`, `maitre-ouvrage/governance` (arbitrages). Le dashboard garde des liens rapides.

### 2.6 Temps réel

| Sub | Leaf | Composant | Description |
|-----|------|-----------|-------------|
| monitoring | vue-globale, metriques, performance | RealtimeMonitoring*Page | Monitoring |
| alerts | actives, resolues, historique | RealtimeAlerts*Page | Alertes |
| notifications | non-lues, toutes, preferences | RealtimeNotifications*Page | Notifications |
| sync | etat, historique, configuration | RealtimeSync*Page | Synchronisation |

**Pertinence** :  
- **Alertes temps réel** → `maitre-ouvrage/alerts` (avec onglet ou section « Temps réel »).  
- **Notifications** → module ou section « Notifications » (ex. dans paramètres ou header global).  
- **Monitoring / Sync** → soit sous dashboard (onglet « Temps réel »), soit sous `maitre-ouvrage/parametres` ou un module « Admin » si réservé à des rôles techniques.

### 2.7 Administration

| Sub | Leaf | Description |
|-----|------|-------------|
| settings | dashboard, kpis, notifications | Paramètres dashboard / KPIs / notifications |
| users | liste, permissions | Utilisateurs |
| permissions | roles, acces | Rôles et accès |
| logs | activite, systeme | Logs activité / système |

**Pertinence** :  
- **Paramètres** → `maitre-ouvrage/parametres` (étendre la config existante).  
- **Utilisateurs / Permissions** → selon RBAC : soit `maitre-ouvrage/parametres`, soit une route dédiée `maitre-ouvrage/administration` (réservée admin).  
- **Logs** → `maitre-ouvrage/logs` et `maitre-ouvrage/system-logs` (déjà présents).

---

## 3. Matrice de redistribution recommandée

Pour chaque **fonctionnalité** du dashboard, proposition de **module cible** (route + module src) et **action**.

| Fonctionnalité dashboard | Route cible recommandée | Module src cible | Action |
|--------------------------|---------------------------|------------------|--------|
| Overview > Summary (cockpit, rapport DG, points) | Rester `/maitre-ouvrage/dashboard` | `dashboard` | Garder |
| Overview > KPIs (synthèse, projets, demandes, budget, finances) | Rester `/maitre-ouvrage/dashboard` | `dashboard` | Garder (vue agrégée) |
| Overview > Alertes (actives, urgentes) | `/maitre-ouvrage/alerts` | `alertes` / `centre-alertes` | Rediriger ou intégrer les vues AlertsActivesPage, AlertsUrgentesPage dans le module alertes |
| Overview > Activité (timeline, notifications, conversations) | Option A : rester dashboard. Option B : `/maitre-ouvrage/activite` ou section dans paramètres | `dashboard` ou nouveau module | Décision produit : lien unique vs module dédié |
| Performance > Indicateurs (synthèse, projets, demandes, budget) | Rester dashboard (onglet Performance) ou `/maitre-ouvrage/analytics` | `dashboard` ou `analytics` | Garder sous dashboard ou dupliquer entrée analytics |
| Performance > Validations | `/maitre-ouvrage/validation-bc` et `/maitre-ouvrage/validation-contrats` | `validation-bc`, `validation-contrats` | Dashboard : résumé + liens. Détail dans modules dédiés |
| Performance > Budget (détail) | `/maitre-ouvrage/finances` ou `/maitre-ouvrage/budget` | `finances` | Étendre finances ou créer module budget |
| Performance > Retards | `/maitre-ouvrage/alerts` (projets/retards) ou `governance` (attention/retards-critiques) | `alertes`, `gouvernance` | Déplacer Delays*Page vers alertes ou gouvernance |
| Performance > Bureaux / Comparaison | Rester dashboard ou `/maitre-ouvrage/governance/synthese` + tendances | `dashboard` ou `gouvernance` | Garder sous dashboard « Reporting » ou aligner sur governance |
| Performance > Achats, Stocks, Matériel, Compliance, Reporting | Modules dédiés si existent (ex. `/maitre-ouvrage/achats`) | Modules dédiés | Créer routes + modules ou garder sous dashboard |
| Performance > Tendances | `/maitre-ouvrage/governance/tendances` ou `/maitre-ouvrage/analytics` | `gouvernance`, `analytics` | Réutiliser gouvernance/tendances |
| Actions > Bloquées / Escalades | `/maitre-ouvrage/arbitrages-vivants`, `/maitre-ouvrage/governance` | `arbitrages-vivants`, `gouvernance` | Déplacer ActionsBlocked* vers ces modules |
| Actions > Par type (contrats, BC, paiements) | validation-contrats, validation-bc, validation-paiements | idem | Liens depuis dashboard ; détail dans chaque module |
| Actions > Inbox / Assignées / Historique | Module `maitre-ouvrage/actions` ou répartir dans demandes, validation-bc | `demandes` ou nouveau `actions` | Décision produit |
| Risques (toutes vues) | `/maitre-ouvrage/alerts` (+ sous-routes type, analyse, actions correctives) | `alertes`, `centre-alertes` | Enrichir module alertes avec Risks* et liens gouvernance |
| Décisions (toutes vues) | `/maitre-ouvrage/decisions` | `decisions` | Déplacer composants Decisions* dans `src/modules/decisions`, utiliser layout decisions |
| Temps réel > Alertes / Notifications | `/maitre-ouvrage/alerts`, + notifications (header ou paramètres) | `alertes` | Section « Temps réel » dans alertes ou dashboard |
| Temps réel > Monitoring / Sync | Rester dashboard ou `parametres` / admin | `dashboard` | Garder sous dashboard ou admin |
| Administration > Paramètres / Users / Permissions / Logs | `parametres`, `maitre-ouvrage/logs`, `system-logs` | `parametres`, `logs` | Ne pas dupliquer ; une seule entrée par fonction |

---

## 4. Plan d’action proposé

1. **Court terme (sans casser l’existant)**  
   - Ajouter dans la sidebar BMO et dans le dashboard des **liens explicites** vers : alertes, governance, validation-bc, validation-contrats, validation-paiements, demandes, decisions, arbitrages-vivants, finances, parametres, logs.  
   - Documenter dans ce fichier et dans la nav que « le détail vit dans le module dédié ».

2. **Moyen terme (redistribution des vues)**  
   - **Validations** : s’assurer que les vues « En attente », « Validées », « Rejetées », « Circuit » du dashboard pointent vers les mêmes données que `validation-bc` / `validation-contrats` ; éventuellement remplacer le contenu dashboard par un iframe ou un lien « Voir dans Validation BC ».  
   - **Retards** : déplacer DelaysCritiquesPage, DelaysMoyensPage, DelaysAnalyseCausesPage dans le module alertes (ou gouvernance) et exposer des routes sous `maitre-ouvrage/alerts` (ex. `/alerts/projets/retards`, `/alerts/attention/retards-critiques`).  
   - **Risques** : déplacer Risks*Page dans `src/modules/alertes` (ou `centre-alertes`), ajouter des sous-routes sous `maitre-ouvrage/alerts`.  
   - **Décisions** : déplacer DecisionsTimeline*Page et vues « En attente / Exécutées » dans `src/modules/decisions`, faire pointer `maitre-ouvrage/decisions` vers ces vues avec le layout decisions.  
   - **Actions bloquées / escalades** : s’assurer que arbitrages-vivants et governance couvrent les cas ; supprimer ou rediriger les entrées « Actions > Bloquées » du dashboard vers ces modules.

3. **Long terme (dashboard allégé)**  
   - Le dashboard ne contient plus que : accueil (cockpit DG, rapport DG), KPIs agrégés, barre d’actions rapides, liens vers tous les modules.  
   - Toute la « logique métier » (validations, retards, risques, décisions, actions détaillées, administration) vit dans les modules correspondants avec des URLs stables (`maitre-ouvrage/alerts`, `maitre-ouvrage/governance`, etc.).

---

## 5. Fichiers et dossiers concernés

- **Routes dashboard** : `app/(portals)/maitre-ouvrage/dashboard/page.tsx`, `layout.tsx`, `DashboardLayoutClient.tsx` ; redirections sous `dashboard/validation`, `dashboard/performance/retards`, etc.  
- **Config nav** : `src/modules/dashboard/navigation/dashboardNavigationConfig.ts`, `navigation.config.json`.  
- **Routage des vues** : `DashboardViewRouter.tsx`, `DashboardContentSwitch.tsx`, `routeValidation.ts`, `loadComponent.ts`, `dashboardRegistry.tsx` (ou `simpleRegistry.tsx`).  
- **Composants à déplacer** (exemples) :  
  - Vers **alertes** : `AlertsActivesPage`, `AlertsUrgentesPage`, `Delays*Page`, `Risks*Page`, `RealtimeAlerts*Page`.  
  - Vers **gouvernance** : réutilisation des pages existantes (attention, synthese, tendances) ; éventuellement `PerformanceBureaux*`, `TendancesPage`, `Trends*Page`.  
  - Vers **decisions** : `DecisionsTimeline*Page`, vues pending/executed.  
  - Vers **validation-bc** / **validation-contrats** : pas forcément déplacer les composants ; plutôt faire en sorte que les routes dédiées affichent le détail et que le dashboard n’affiche qu’un résumé + lien.

En appliquant cette analyse, les fonctionnalités sont **réparties dans les modules maître-ouvrage selon leur pertinence**, tout en gardant le dashboard comme **point d’entrée unique** (centrale de commandement) avec des liens clairs vers chaque module.

---

## 6. Réalisé (court terme)

- **DashboardModulesBar** : ajout d'une ligne « Accès modules » avec liens directs vers Alertes, Gouvernance, Validation BC, Validation contrats, Validation paiements, Demandes, Décisions, Arbitrages, Finances, Paramètres.
- **ValidationsGlobalPage** : bandeau « Accès modules » en haut de page avec liens vers `/maitre-ouvrage/validation-bc` et `/maitre-ouvrage/validation-contrats`.
- **DelaysCritiquesPage, DelaysMoyensPage, DelaysAnalyseCausesPage** : bandeau « Accès module » avec lien vers `/maitre-ouvrage/alerts/projets/retards`.
- La route `maitre-ouvrage/alerts/projets/retards` existait déjà ; les vues Retards du dashboard pointent désormais explicitement vers ce module.

### Réorganisation complète de la barre latérale du dashboard

- **Accueil** : Vue d'ensemble (Cockpit, V2, Rapport DG) + KPIs clés (Synthèse, Projets, Demandes, Budget, Finances) ; « Centre d'alertes » = lien externe vers `/alerts`. Suppression des sous-menus « Alertes critiques » et « Activité récente » (remplacés par le lien Centre d'alertes).
- **Performance** : Indicateurs (Synthèse, Projets, Demandes, Budget) conservés ; Validations, Retards, Budget/Finances, Gouvernance, Décisions = liens externes ; Bureaux et Tendances conservés en interne.
- **Actions** : tout le sous-menu (inbox, type, priority, blocked, assigned, history) remplacé par des liens externes : Demandes, Validation BC, Validation contrats, Validation paiements, Dossiers bloqués, Arbitrages & Goulots, Substitution.
- **Risques** : tout le sous-menu remplacé par un lien « Centre d'alertes » → `/alerts`.
- **Décisions** : tout le sous-menu remplacé par deux liens : Registre Décisions → `/decisions`, Gouvernance (arbitrages) → `/governance`.
- **Temps réel** : tout le sous-menu remplacé par un lien « Centre d'alertes » → `/alerts`.
- **Administration** : tout le sous-menu remplacé par trois liens : Paramètres → `/parametres`, Journal des actions → `/logs`, Logs système → `/system-logs`.

### Redirections client (anciennes URLs → modules)

- **Implémentation** : `src/modules/dashboard/utils/dashboardRedirectMap.ts` + effet dans `useDashboardCommandCenterUrlSync`.
- Lorsqu’un utilisateur ouvre une URL du type `/maitre-ouvrage/dashboard?main=...&sub=...&leaf=...` correspondant à une section déplacée, une redirection côté client (`router.replace`) envoie vers la route du module.

**Mapping des redirections :**

| Ancienne URL (main / sub / leaf) | Route cible |
|----------------------------------|-------------|
| overview / alerts | `/maitre-ouvrage/alerts` |
| performance / validation | `/maitre-ouvrage/validation-bc` |
| performance / delays, retards | `/maitre-ouvrage/alerts/projets/retards` |
| performance / budget | `/maitre-ouvrage/finances` |
| performance / comparison, bureaux | `/maitre-ouvrage/governance` |
| performance / trends | `/maitre-ouvrage/governance/tendances` |
| actions / blocked, blocages | `/maitre-ouvrage/arbitrages-vivants` |
| actions / type (leaf: contrats, bc, paiements) | validation-contrats, validation-bc, validation-paiements |
| actions / inbox, assigned, history, priority | `/maitre-ouvrage/demandes` |
| risks, risques | `/maitre-ouvrage/alerts` |
| decisions | `/maitre-ouvrage/decisions` |
| realtime | `/maitre-ouvrage/alerts` |
| administration / logs, journal | `/maitre-ouvrage/logs` |
| administration / system, systeme | `/maitre-ouvrage/system-logs` |
| administration (autres) | `/maitre-ouvrage/parametres` |
| overview / kpis (leaf: demandes, budget, finances) | demandes → `/demandes`, budget/finances → `/finances` |
| performance / indicators (leaf: demandes, budget) | idem |

### Allègement nav dashboard (éviter doublons avec barre principale)

- **Accueil > KPIs clés** : affiche uniquement « Synthèse » et « Projets ». Demandes, Budget, Finances retirés (accessibles via barre principale).
- **Performance > Indicateurs** : affiche uniquement « Synthèse » et « Projets ». Demandes et Budget retirés.
- Les URLs anciennes `?main=overview&sub=kpis&leaf=demandes` (ou budget/finances) et `?main=performance&sub=indicators&leaf=demandes` (ou budget) redirigent vers les modules correspondants.

### Vues exposées dans les modules

- **Alertes > Projets > Retards**  
  - Page principale : `/maitre-ouvrage/alerts/projets/retards` → `RetardsDetectesPage` (centre-alertes) + bandeau vers les vues détaillées.  
  - Sous-routes (réutilisent les vues dashboard) :  
    - `/maitre-ouvrage/alerts/projets/retards/critiques` → `DelaysCritiquesPage`  
    - `/maitre-ouvrage/alerts/projets/retards/moyens` → `DelaysMoyensPage`  
    - `/maitre-ouvrage/alerts/projets/retards/analyse-causes` → `DelaysAnalyseCausesPage`  

- **Finances** : la section « Performance > Budget » du dashboard redirige vers `/maitre-ouvrage/finances` ; le module finances conserve son contenu propre (pas d’import de BudgetKpiPage pour l’instant).
