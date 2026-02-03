# Plan de migration — Architecture Outlook-like comme gabarit standard BMO

**Objectif** : faire du layout type Outlook (triple-pane + barres) le gabarit standard de toutes les pages métier BMO (PILOTAGE / EXÉCUTION / SUPPORT et autres sections), avec le même shell (BmoTopbar + BmoSidebar) et une fenêtre centrale structurée de façon cohérente.

**Contraintes** : ne pas casser le design BMO, ne pas dupliquer les layouts, réutiliser `OutlookLikeLayout` ou en dériver (TwoPaneLayout, DashboardLayout).

**Principe UX** (voir `OUTLOOK_LIKE_INTEGRATION.md` §8bis) : dupliquer la **logique visuelle et les comportements UX** d’Outlook ; toujours adapter **design system** et **vocabulaire métier** BMO.

**Guide d’adaptation** (§8ter) : pour chaque nouveau module, suivre les 4 étapes (équivalent Outlook, gabarit A/B/C, mapping des zones, libellés/icônes) et les exemples concrets QuickActionsBar, FilterBar, SidebarFolders, liste/détail BTP. Documenter dans ce plan : gabarit choisi, type de contenu métier, choix UX (liste vs détail).

**Spécification fine** (§8quater) : pour chaque page type A, appliquer les micro‑comportements (chargement skeleton + placeholder, état vide, erreurs, QuickActionsBar sticky, FilterBar toggles, liste hover/sélection/non lu/contextuel, détail skeleton/header/corps/pièces jointes, transitions 150–200 ms, toast, accessibilité).

---

## 1. Cartographie des écrans BMO

### 1.1 Sources

- **Shell** : `BmoPortalLayout` → `BmoLayoutShell` (BmoSidebar + BmoTopbar) + `PageTemplate` (breadcrumbs, header optionnel, SubNav, contenu).
- **Routes** : `app/(portals)/maitre-ouvrage/` + `src/config/navigation.ts` (7 sections, 60+ routes).
- **Layouts actuels** : `PageTemplate` (header + zone contenu), `OutlookLikeLayout` (/messages), `ExplorerLayoutResponsive` (engagements, documents), `CockpitLayout` (alerts), dashboard custom (DashboardLayoutClient + registry).

### 1.2 Sections du menu (navigationConfig)

| Section | Exemples de routes | Type d’écrans actuels |
|--------|---------------------|------------------------|
| **1. PILOTAGE** | /dashboard, /governance, /calendrier, /analytics, /alerts | Dashboard DG, KPIs, listes, centre d’alertes |
| **2. EXÉCUTION** | /demandes, /validation-bc, /blocked, /substitution, /arbitrages-vivants | Listes + détail, formulaires, pipelines |
| **3. PROJETS & CLIENTS** | /projets-en-cours, /clients, /tickets-clients | Listes, fiches |
| **4. FINANCE & CONTENTIEUX** | /finances, /recouvrements, /litiges | Listes, tableaux, fiches |
| **5. RH & RESSOURCES** | /employes, /missions, /demandes-rh, /delegations, /organigramme | Listes, fiches, organigramme |
| **6. COMMUNICATION** | /echanges-structures, /conferences, /messages-externes | Listes, messages |
| **7. SYSTÈME** | /decisions, /audit, /logs, /system-logs, /ia, /parametres | Listes, fiches, paramètres |

### 1.3 Types d’écrans (gabarits actuels)

| Type | Description | Exemples actuels |
|------|-------------|------------------|
| **Dashboard / Cockpit** | Vue synthèse, KPIs, widgets, graphiques, pas de liste principale. | /dashboard, /cockpit, /governance (KPIs + listes), /alerts (CockpitLayout + graphiques) |
| **Liste + détail (triple-pane)** | Sidebar dossiers/catégories + liste d’items + panneau détail. | /messages (OutlookLikeLayout) |
| **Explorer 2 colonnes** | Sidebar navigation + zone contenu (liste ou détail unique). | /engagements, /documents (ExplorerLayoutResponsive) |
| **Liste seule** | Une liste avec filtres/barre d’actions, détail en modal ou route séparée. | Beaucoup de sous-pages (validation-bc, demandes, etc.) |
| **Fiche plein écran** | Un formulaire ou une fiche détail (chantier, employé, décision). | /chantiers/[chantierId], fiches détail |
| **Centre d’alertes** | Liste d’alertes + détail + filtres par typologie/chantier. | /alerts (actuellement CockpitLayout avec graphiques + listes) |
| **Calendrier / Planning** | Vue calendrier ou Gantt, pas de liste type Outlook. | /calendrier, /chantiers/planning |
| **Paramètres / Aide** | Formulaire ou contenu statique. | /parametres, /aide |

---

## 2. Design system de layouts (2–3 gabarits)

Proposition : **3 gabarits** seulement, tous compatibles avec le shell BMO (BmoTopbar + BmoSidebar) et avec `PageTemplate` (ou une variante « full page » sans header compact).

### 2.1 Gabarit A — Triple-pane (Outlook-like)

**Nom** : `OutlookLikeLayout` (existant).

**Structure** : `[ quickActions ]` + `[ sidebar | filterBar + list | detail ]`.

- **Sidebar** : dossiers / catégories / projets / chantiers (contexte de navigation).
- **Liste** : items (messages, alertes, demandes, tickets) avec barre de filtres au-dessus.
- **Détail** : panneau détail de l’item sélectionné.

**Responsive** : Desktop 3 colonnes ; tablette 2 (liste + détail ou sidebar + liste) ; mobile liste pleine page, détail en route/modal.

**Où l’utiliser** :
- Messages (/messages) ✅ déjà fait
- Centre d’alertes (/alerts) — sidebar = typologies/chantiers, liste = alertes, détail = fiche alerte
- Demandes (/demandes) — sidebar = états/catégories, liste = demandes, détail = fiche
- Tickets clients (/tickets-clients)
- Validation BC/listes (/validation-bc, /validation-contrats, /validation-paiements) — sidebar = filtres/statuts, liste = dossiers, détail = fiche
- Gouvernance listes (arbitrages, décisions) — sidebar = états, liste = items, détail = fiche
- Documents (/documents) — peut rester en Explorer 2 colonnes ou passer en triple-pane (sidebar dossiers + liste docs + prévisualisation)
- Logs / Journal (/logs, /system-logs) — sidebar = catégories, liste = entrées, détail = détail log

### 2.2 Gabarit B — Two-pane (Explorer)

**Nom** : `TwoPaneLayout` (à créer ou dériver de `ExplorerLayoutResponsive`).

**Structure** : `[ optional quickActions ]` + `[ sidebar | content ]`.

- **Sidebar** : arborescence ou onglets (ex. BC, Factures, Paiements).
- **Content** : une seule zone — soit une liste pleine largeur, soit un détail, soit un dashboard de sous-module.

**Responsive** : Desktop 2 colonnes ; mobile sidebar en drawer.

**Où l’utiliser** :
- Engagements (/engagements) — déjà en ExplorerLayoutResponsive : sidebar BC / Factures / Paiements / Demandes, contenu = liste ou détail du sous-module
- Documents (/documents) — si on ne passe pas en triple-pane : sidebar dossiers, contenu = grille/liste de documents
- Chantiers (/chantiers) — sidebar programmes / carte / planning, contenu = liste chantiers ou carte ou planning
- Paramètres (/parametres) — sidebar Profil / Notifications / Référentiels / API, contenu = formulaire
- Employés (/employes) — sidebar Liste / Organigramme, contenu = liste ou organigramme

### 2.3 Gabarit C — Dashboard / Full content

**Nom** : `DashboardLayout` ou « full content » (pas de colonnes liste/détail).

**Structure** : `[ optional barre d’actions / filtres ]` + **zone unique** : grille de widgets (KPIs, graphiques) ou un seul bloc (calendrier, Gantt, formulaire, texte).

**Où l’utiliser** :
- Dashboard DG (/dashboard) — grille de widgets, KPIs, cartes (existant, à garder cohérent avec barres BMO)
- Cockpit (/cockpit) — idem
- Gouvernance synthèse (/governance) — KPIs + tableau arbitrages (peut avoir une barre d’actions type QuickActionsBar)
- Centre d’alertes **vue synthèse** (graphiques, typologie) — en haut ; la vue « liste + détail » peut être le gabarit A
- Calendrier (/calendrier) — plein écran calendrier
- Planning / Gantt (/chantiers/planning, gantt) — plein écran
- Analytics (/analytics) — rapports, graphiques
- Fiche détail plein écran (/chantiers/[chantierId]) — une fiche unique
- Pages « simple » : aide, conformité, etc. — titre + contenu

---

## 3. Récapitulatif : quel gabarit pour quelle page

| Module / Route | Type d’écran cible | Gabarit proposé |
|----------------|--------------------|------------------|
| **PILOTAGE** | | |
| /dashboard | Dashboard DG | C — Dashboard |
| /governance | Synthèse + listes arbitrages/décisions | C (synthèse) + A (sous-vues liste/détail) |
| /calendrier | Calendrier | C — Full |
| /analytics | Rapports | C — Full |
| /alerts | Centre d’alertes (liste + détail + typologies) | A — Triple-pane |
| **EXÉCUTION** | | |
| /demandes | Liste demandes + détail | A — Triple-pane |
| /validation-bc, /validation-contrats, /validation-paiements | Listes + détail | A — Triple-pane |
| /blocked, /substitution, /arbitrages-vivants | Listes + détail | A — Triple-pane |
| **PROJETS & CLIENTS** | | |
| /projets-en-cours | Liste projets | A ou B |
| /clients | Liste clients + fiche | A — Triple-pane |
| /tickets-clients | Liste tickets + détail | A — Triple-pane |
| **FINANCE & CONTENTIEUX** | | |
| /engagements | BC / Factures / Paiements | B — Two-pane (existant Explorer) |
| /finances, /recouvrements, /litiges | Listes / tableaux | A ou B selon sous-page |
| **RH & RESSOURCES** | | |
| /employes | Liste / Organigramme | B — Two-pane |
| /demandes-rh, /missions, /evaluations, /delegations | Listes + détail | A — Triple-pane |
| /organigramme | Vue organigramme | C — Full |
| **COMMUNICATION** | | |
| /messages | Déjà fait | A — Triple-pane ✅ |
| /messages-externes, /echanges-structures, /conferences | Listes ou contenu | A ou C |
| **SYSTÈME** | | |
| /decisions, /audit, /logs, /system-logs | Listes + détail | A — Triple-pane (ou B pour logs) |
| /parametres | Paramètres | B — Two-pane |
| /ia | Page IA | C — Full |
| **Détail / Fiche** | | |
| /chantiers/[chantierId] | Fiche chantier | C — Full (fiche) |
| /chantiers | Liste + carte/planning | B — Two-pane |

---

## 4. Principes techniques

- **Shell inchangé** : `BmoPortalLayout` → `BmoLayoutShell` + `PageTemplate`. Seul le **contenu** passé à `PageTemplate` change (au lieu d’un bloc libre, on enveloppe dans OutlookLikeLayout, TwoPaneLayout ou DashboardLayout).
- **PageTemplate** : pour les pages « full page » (dashboard, alerts, messages, etc.), `useFullPage` reste true ; la zone `children` devient le nouveau layout (A, B ou C).
- **Réutilisation** : `OutlookLikeLayout` tel quel pour le gabarit A. Pour B : factoriser ou renommer `ExplorerLayoutResponsive` en `TwoPaneLayout` (sidebar + content, optionnellement quickActions), même breakpoints et drawer mobile que dans OUTLOOK_LIKE_INTEGRATION.md.
- **Composants partagés** : QuickActionsBar, FilterBar, SidebarFolders (ou variantes SidebarNav) déjà dans `bmo/ui` et `bmo/messages` ; les réutiliser pour toutes les pages en gabarit A ; pour B, une sidebar plus « navigation » que « dossiers » peut utiliser le même composant avec des props différentes ou un SidebarNav dédié.
- **Pas de duplication** : un seul fichier par layout (OutlookLikeLayout, TwoPaneLayout, DashboardLayout si nécessaire). Les pages importent le layout et fournissent les slots (sidebar, list, detail, quickActions, filterBar).

---

## 5. Ordre de migration proposé

### Phase 1 — PILOTAGE (prioritaire)

1. **Centre d’alertes** (/alerts)  
   Passer de CockpitLayout à **OutlookLikeLayout** : sidebar = typologies/chantiers (SidebarFolders ou équivalent), liste = alertes (MessageList ou composant AlertList), détail = fiche alerte (MessageDetailPanel-like ou AlertDetailPanel), barres QuickActionsBar + FilterBar. Sous-pages (/alerts/critiques, etc.) peuvent rester en onglets/filtres dans la barre.

2. **Gouvernance** (/governance)  
   - Page d’accueil : garder KPIs + tableau (Gabarit C) avec une barre d’actions type QuickActionsBar.  
   - Sous-vues « listes » (arbitrages, décisions) : proposer **OutlookLikeLayout** (sidebar états/catégories, liste, détail).

3. **Dashboard** (/dashboard)  
   Conserver le comportement actuel (Gabarit C). S’assurer que la barre d’actions / filtres du dashboard utilise les mêmes patterns que QuickActionsBar/FilterBar (design system).

4. **Calendrier** (/calendrier)  
   Garder full content (Gabarit C). Option : barre d’actions au-dessus du calendrier pour cohérence.

5. **Analytics** (/analytics)  
   Gabarit C. Barre d’actions/export si besoin.

### Phase 2 — EXÉCUTION

6. **Demandes** (/demandes) — OutlookLikeLayout (sidebar états, liste demandes, détail).
7. **Validation BC / Contrats / Paiements** — OutlookLikeLayout (sidebar statuts/types, liste dossiers, détail).
8. **Blocked, Substitution, Arbitrages** — OutlookLikeLayout ou même pattern.

### Phase 3 — Autres sections

9. **Documents** — soit garder ExplorerLayoutResponsive (Gabarit B), soit migrer vers OutlookLikeLayout (sidebar dossiers + liste + prévisualisation).
10. **Chantiers** — TwoPaneLayout (sidebar programmes/carte/planning, contenu).
11. **Projets, Clients, Tickets clients** — Triple-pane où pertinent.
12. **RH (employés, demandes-rh, etc.)** — A ou B selon page.
13. **Finance & Contentieux** — Engagements déjà en B ; les autres listes en A si liste + détail.
14. **Système (logs, decisions, audit, paramètres)** — A pour listes, B pour paramètres.

---

## 6. Prochaines étapes (avant de coder)

1. **Valider** cette cartographie et le choix des 3 gabarits (A, B, C) avec le product owner / équipe.
2. **Décider** du nom exact des layouts dans le code : garder `OutlookLikeLayout` pour A ; introduire `TwoPaneLayout` (et éventuellement `DashboardLayout`) dans `src/components/bmo/layout/`.
3. **Migrer** en commençant par PILOTAGE : d’abord /alerts (centre d’alertes) avec OutlookLikeLayout, puis gouvernance (listes), sans toucher au shell ni à PageTemplate sauf pour envelopper le contenu dans le bon layout.
4. **Documenter** chaque migration par un résumé « avant / après » (fichiers touchés, gabarit appliqué) comme dans OUTLOOK_LIKE_INTEGRATION.md.

---

## Annexe — Liste des routes (app/(portals)/maitre-ouvrage) et gabarit proposé

| Route | Gabarit proposé | Note |
|-------|-----------------|------|
| /dashboard, /dashboard/... | C — Dashboard | Existant, cohérence barres |
| /alerts, /alerts/critiques/..., /alerts/overview/..., /alerts/projets/..., /alerts/qualite, /alerts/rh/..., /alerts/sla/... | A — Triple-pane | Centre d’alertes unifié |
| /governance, /governance/arbitrages/..., /governance/attention/..., /governance/conformite/..., /governance/dashboard, /governance/decisions, /governance/instances/..., /governance/synthese/..., /governance/tendances | C (synthèse) + A (listes) | Selon sous-vue |
| /calendrier, /calendrier/... | C — Full | Calendrier / planning |
| /analytics | C — Full | Rapports |
| /messages | A — Triple-pane | ✅ Déjà fait |
| /demandes | A — Triple-pane | |
| /validation-bc, /validation-contrats, /validation-paiements + sous-routes | A — Triple-pane | Listes + détail |
| /blocked, /substitution, /arbitrages-vivants | A — Triple-pane | |
| /chantiers, /chantiers/carte, /chantiers/planning, /chantiers/programmes | B — Two-pane | Sidebar + contenu |
| /chantiers/[chantierId] | C — Full (fiche) | Fiche chantier |
| /engagements, /engagements/bc, /engagements/demandes, /engagements/factures, /engagements/paiements | B — Two-pane | Déjà ExplorerLayoutResponsive |
| /documents, /documents/avenants | B ou A | Explorer ou triple-pane |
| /projets-en-cours | A ou B | |
| /clients | A — Triple-pane | |
| /tickets-clients | A — Triple-pane | |
| /finances, /recouvrements, /litiges | A ou B | Selon sous-page |
| /employes, /employes/organigramme | B — Two-pane | Liste / organigramme |
| /demandes-rh, /missions, /evaluations, /delegations, /organigramme | A ou C | Listes + détail ou full |
| /messages-externes, /echanges-structures, /conferences | A ou C | |
| /decisions, /audit, /logs, /system-logs | A — Triple-pane (listes) | |
| /parametres, /parametres/... | B — Two-pane | Sidebar + formulaire |
| /ia | C — Full | |
| /execution, /support, /cockpit, /performance, /conception, etc. | C ou selon contenu | À aligner selon type réel |

---

*Document de référence pour la migration globale. À mettre à jour au fil des phases.*
