# Spécification complète du Dashboard ERP BTP

**Référence unique** : fonctionnalités, composants, visuels, sidebar, sub-sidebar et zones obligatoires du Dashboard Maître d’ouvrage.

Le Dashboard est la page d’accueil principale. Il doit afficher l’essentiel pour piloter l’activité BTP sans entrer dans les modules.

---

## 1. Structure globale du Dashboard

Le Dashboard est organisé en **6 zones principales** :

| Zone | Rôle |
|------|------|
| **Header** | Barre supérieure (logo, user, recherche, notifications) |
| **Sidebar** | Menu latéral principal (modules ERP) |
| **Sub-sidebar** | Menu contextuel (filtres, vues, export) |
| **Zone KPI** | Indicateurs clés (ligne(s) de cartes) |
| **Zone Graphiques / Analytics** | Visualisations (donut, barres, courbes) |
| **Zone Actions rapides** | Raccourcis (nouveau devis, chantier, etc.) |
| **Zone Notifications** | Alertes et activité récente |

---

## 2. Header (barre supérieure)

### Éléments obligatoires

| Élément | Présent | Description |
|--------|---------|-------------|
| Logo | ☐ | Logo du logiciel ou de l’entreprise |
| Nom utilisateur + rôle | ☐ | Ex. « A. DIALLO — Direction » (admin, chef chantier, compta…) |
| Menu utilisateur | ☐ | Mon profil, Paramètres, Déconnexion |
| Notifications (cloche) | ☐ | Badge nombre, liste au clic |
| Recherche globale | ☐ | Clients, chantiers, devis, fournisseurs (⌘K / Ctrl+K) |
| Switch mode sombre/clair | ☐ | Optionnel |
| Sélecteur de langue | ☐ | Optionnel |

### Comportement

- Dropdown utilisateur au clic sur le nom.
- Recherche : ouverture d’un modal ou barre de recherche.
- Notifications : liste avec lien direct vers l’élément concerné.

---

## 3. Sidebar (menu principal)

Contient les **modules principaux** de l’ERP BTP.

### Contenu minimal

| Module | Icône | Sous-menus possibles |
|--------|--------|----------------------|
| Dashboard | ☐ | — |
| Chantiers | ☐ | Portefeuille, Demandes, Exécution, Dossiers bloqués, Litiges |
| Devis | ☐ | En cours, Acceptés, Refusés |
| Clients | ☐ | Répertoire, Projets |
| Planning | ☐ | Ressources, Gantt, Calendrier |
| Achats | ☐ | Commandes, Fournisseurs |
| Stocks | ☐ | Niveaux, Mouvements |
| Fournisseurs | ☐ | Répertoire, Contrats |
| Facturation | ☐ | Factures, Relances |
| RH / Pointage | ☐ | Pointages, Congés |
| Documents (GED) | ☐ | Dossiers chantiers |
| Paramètres | ☐ | Référentiels, Utilisateurs |

### Interaction

- Icônes + libellés.
- Dépliage si sous-menu.
- État actif visible (module en cours).
- Rétractable (sidebar collapsed) optionnel.

---

## 4. Sub-sidebar (menu secondaire contextuel)

Apparaît **à droite de la sidebar** quand on est sur le Dashboard (ou selon le module). Contenu **spécifique au Dashboard** :

### Filtres et vues

| Élément | Présent | Description |
|--------|---------|-------------|
| **Vue d’accueil** | ☐ | Cockpit / Vue d’ensemble (page d’accueil du dashboard) |
| **Centre d’alertes** | ☐ | Liste des alertes (retard, budget, stock, etc.) |
| **Gouvernance** | ☐ | Décisions, instances, arbitrages |
| **Calendrier** | ☐ | Échéances, rendez-vous, jalons |
| **Analytics** | ☐ | Rapports, tendances, export avancé |

### Filtres recommandés (dans le sub-sidebar ou en barre dédiée)

| Filtre | Options |
|--------|---------|
| Période | Aujourd’hui, Cette semaine, Ce mois, Année en cours, Période personnalisée |
| Chantier | Tous, Mes chantiers, Par région / équipe / catégorie |
| Rôle / vue | Vue Direction, Vue Conducteur, Vue Chef chantier, Vue Comptabilité |
| Favoris | Tableau de bord personnalisé (optionnel) |
| Export | Exporter le Dashboard (PDF ou Excel) |

### Comportement

- Un clic sur un item du sub-sidebar change **le contenu central** (pas seulement un filtre).
- État actif clair (Centre d’alertes, Gouvernance, etc.).
- « Dernière MAJ » + bouton **Rafraîchir** visibles à proximité (header ou sous la barre KPI).

---

## 5. Zone KPI (indicateurs clés)

Bloc prioritaire : **8 à 12 KPI** pour piloter l’activité BTP.

### KPI financiers

| KPI | Présent | Format suggéré |
|-----|---------|-----------------|
| Montant total des devis en cours | ☐ | Valeur + tendance vs mois dernier |
| Marge brute moyenne | ☐ | % ou montant |
| Factures en attente de paiement | ☐ | Montant + nombre |
| Dépenses du mois vs prévisionnel | ☐ | Barre ou % (vert / orange / rouge) |

### KPI chantiers

| KPI | Présent | Format suggéré |
|-----|---------|-----------------|
| Nombre de chantiers en cours | ☐ | Chiffre + icône |
| Chantiers en retard | ☐ | Chiffre + alerte si > 0 |
| Chantiers terminés ce mois | ☐ | Chiffre |
| Chantiers à risques (marge &lt; seuil) | ☐ | Chiffre + couleur |

### KPI RH / Main-d’œuvre (optionnel)

| KPI | Présent |
|-----|---------|
| Heures totales pointées | ☐ |
| Écarts heures prévues / réalisées | ☐ |
| Absentéisme | ☐ |

### KPI achats / stocks

| KPI | Présent |
|-----|---------|
| Commandes en attente de réception | ☐ |
| Rupture stock critique | ☐ |

### Présentation visuelle des cartes KPI

- **Cartes (cards)** avec bordure / fond discret.
- **Icône** par thème (chantier, €, alerte, etc.).
- **Couleurs sémantiques** : vert = OK, orange = alerte, rouge = problème.
- **Tendance** : flèche ↑↓ + pourcentage (ex. « +12 % vs mois dernier »).
- **Mini-légende** : « par rapport au mois dernier », « objectif 90 % », etc.
- **Clic** : ouverture d’un modal détail ou navigation vers le module (drill-down).

### Réactivité

- Pas de « NaN », « undefined », ni valeurs vides sur les KPI.
- Mise à jour après action (ex. après rafraîchir ou retour d’une action).

---

## 6. Zone Graphiques / Analytics

Au moins **4 visualisations** sur le Dashboard.

### Graphiques obligatoires

| Graphique | Type | Données |
|-----------|------|---------|
| Avancement des chantiers | Donut / barres | % réalisé / % restant |
| Coûts réels vs prévisionnels | Barres | Par chantier ou par mois |
| Répartition devis | Camembert | Acceptés / refusés / en attente |
| Trésorerie ou flux | Courbe | Entrées / sorties, projection 30 j |

### Contrôles qualité

| Critère | Présent |
|---------|---------|
| Axes lisibles (libellés, unités) | ☐ |
| Légendes claires | ☐ |
| Couleurs cohérentes entre graphiques | ☐ |
| Valeurs formatées (ex. 12 500 €) | ☐ |
| Tooltip au survol | ☐ |
| Lien / détail au clic (chantier, période) | ☐ |
| Filtre synchrone avec sub-sidebar / période | ☐ |

---

## 7. Zone Actions rapides

Raccourcis pour **agir sans quitter le Dashboard**.

| Action | Présent | Icône + libellé |
|--------|---------|------------------|
| Nouveau devis | ☐ | ☐ |
| Nouveau chantier | ☐ | ☐ |
| Nouvelle commande fournisseur | ☐ | ☐ |
| Nouveau pointage d’heure | ☐ | ☐ |
| Nouvelle facture | ☐ | ☐ |
| Import Excel (clients, fournisseurs, catalogues) | ☐ | ☐ |

- Boutons compacts (icône + texte court).
- Placement : barre sous les KPI ou bloc dédié « Actions rapides ».

---

## 8. Zone Notifications

### Types à afficher

| Type | Présent | Lien vers |
|------|---------|-----------|
| Chantiers en retard | ☐ | Fiche chantier |
| Factures arrivant à échéance | ☐ | Facturation |
| Dépassement budget | ☐ | Chantier / Budget |
| Stock critique | ☐ | Stocks |
| Documents en attente de validation | ☐ | GED / Workflow |
| Nouveaux pointages | ☐ | RH |

### Format

- Liste (dropdown ou panneau) depuis l’icône cloche du header.
- Icône + couleur selon criticité (rouge / orange / bleu).
- Lien direct vers le module ou l’élément concerné.

---

## 9. Zones optionnelles

### Activité récente

- Derniers devis créés.
- Dernières modifications chantier.
- Pointages du jour.
- Commandes fournisseur récentes.

### Documents importants

- Plans récents.
- Documents mis à jour.
- Rapports de chantier disponibles.

---

## 10. Résumé visuel (layout cible)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER : Logo | Recherche (⌘K) | Notifications | User      │
└─────────────────────────────────────────────────────────────┘
┌──────────┬────────────┬─────────────────────────────────────┐
│ SIDEBAR  │ SUB-SIDEBAR│  Dernière MAJ : …  [Rafraîchir]     │
│          │            │  [Exporter PDF/Excel]                 │
│ Dashboard│ • Vue d’acc.│─────────────────────────────────────│
│ Chantiers│ • Alertes  │  ZONE KPI (ligne 1 : finances)       │
│ Devis    │ • Gouvern. │  ZONE KPI (ligne 2 : chantiers)     │
│ Clients  │ • Calendr. │  ZONE KPI (ligne 3 : RH/achats)     │
│ …        │ • Analytics│─────────────────────────────────────│
│          │            │  GRAPHIQUES :                        │
│          │            │  • Avancement chantiers | Coûts      │
│          │            │  • Répartition devis | Trésorerie   │
│          │            │─────────────────────────────────────│
│          │            │  ACTIONS RAPIDES                     │
│          │            │  [Devis] [Chantier] [Cde] [Facture]  │
│          │            │─────────────────────────────────────│
│          │            │  NOTIFICATIONS / ACTIVITÉ RÉCENTE    │
└──────────┴────────────┴─────────────────────────────────────┘
```

---

## 11. Correspondance avec l’existant (référence Yessalate)

Pour l’audit, faire correspondre cette spec aux composants réels :

- **Header** : `BmoLayoutShell` / topbar, menu user, cloche, recherche.
- **Sidebar** : `DashboardSidebar` + config `dashboardNavigationConfig`.
- **Sub-sidebar** : `DashboardSubSidebar` (Centre d’alertes, Gouvernance, Calendrier, Analytics).
- **Zone KPI** : barre KPI (strip pliable) + `KPICard` / `KpiTile`, modals au clic.
- **Graphiques** : `DashboardAccueil3P`, widgets donut/barres/courbes dans les vues.
- **Actions rapides** : `DashboardModulesBar` ou boutons dédiés.
- **Notifications** : `KPIAlertsSystem`, `DashboardAlertProvider`, liste dans le header.

Document de référence : `docs/audit/AUDIT_TECHNIQUE_EXHAUSTIF_2026_01_31.md`.

---

## 12. État d’implémentation (Yessalate)

Dernière mise à jour : aligné avec les composants actuels.

### Header (BmoTopbar)

| Élément | État | Composant / note |
|--------|------|-------------------|
| Logo | ☐ | Non affiché dans le topbar (fil d’Ariane à la place) |
| Nom utilisateur + rôle | ✔️ | `BmoTopbar` : initiales + nom + rôle (ex. A. DIALLO, DG) |
| Menu utilisateur | ☐ | Pas de dropdown (profil, paramètres, déconnexion) |
| Notifications (cloche) | ✔️ | Badge + clic → `NotificationPanel` (event `bmo-open-notifications`) |
| Recherche globale | ✔️ | Clic loupe ou ⌘K → `DashboardCommandPalette` (event `bmo-open-command-palette` sur la page dashboard) |

### Sub-sidebar

| Élément | État | Composant |
|--------|------|-----------|
| Vue d’accueil (Cockpit) | ✔️ | `DashboardSubSidebar` + `DashboardAccueil3P` |
| Centre d’alertes | ✔️ | `AlertsActivesPage` |
| Gouvernance | ✔️ | `GovernancePilotageView` |
| Calendrier | ✔️ | `CalendrierEcheancesView` |
| Analytics | ✔️ | `AnalyticsReportsView` |
| Dernière MAJ + Rafraîchir | ✔️ | Barre sous KPI (dashboard page) |
| Exporter PDF/Excel | ✔️ | Menu Export + toasts succès/erreur |

### Zone KPI

- Barre KPI pliable avec 6 cartes (strip), modals au clic (Demandes, Validations, Blocages, Créances).
- Tendances et couleurs partiellement présentes (tone, trend).

### Actions rapides

- `DashboardModulesBar` : raccourcis (Alertes, Gouvernance, Validation BC, Contrats, Paiements, Demandes, etc.).

### Notifications

- Cloche header → `NotificationPanel` (liste avec exemples ; à brancher sur API).
- `KPIAlertsSystem` sur la page dashboard pour alertes KPI.
