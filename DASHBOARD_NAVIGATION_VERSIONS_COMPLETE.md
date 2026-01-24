# 🎯 Versions Améliorées de la Navigation Dashboard

**Date**: 2026-01-23  
**Version**: 2.0

---

## 📋 VERSION 1 : OPTIMISÉE (Proche de la structure actuelle)

### Arborescence Complète

```
Dashboard
│
├── 📊 Vue d'ensemble
│   ├── Synthèse
│   │   ├── Dashboard principal
│   │   │   └── [10 sections organisées]
│   │   └── Points clés
│   │       └── [Alertes critiques, KPIs importants]
│   ├── KPIs
│   │   ├── Projets
│   │   │   └── [Tableau projets avec filtres]
│   │   ├── Demandes
│   │   │   └── [Tableau demandes avec statuts]
│   │   └── Budget
│   │       └── [Graphiques consommation]
│   └── Tendances
│       ├── Mensuelles
│       │   └── [Graphiques évolution mensuelle]
│       └── Trimestrielles
│           └── [Graphiques évolution trimestrielle]
│
├── 📈 Performance & KPIs
│   ├── Validations
│   │   ├── En attente
│   │   │   └── [Tableau validations en attente]
│   │   ├── Validées
│   │   │   └── [Tableau validations validées]
│   │   └── Rejetées
│   │       └── [Tableau validations rejetées]
│   ├── Budget
│   │   ├── Consommation
│   │   │   └── [Graphiques + détails]
│   │   └── Restant
│   │       └── [Montants restants par projet]
│   ├── Retards
│   │   ├── Critiques
│   │   │   └── [Liste retards critiques]
│   │   └── Moyens
│   │       └── [Liste retards moyens]
│   ├── Comparaisons
│   │   ├── Par bureaux
│   │   │   └── [Tableau comparatif bureaux]
│   │   └── Par projets
│   │       └── [Tableau comparatif projets]
│   └── Bureaux
│       ├── Tous
│       │   └── [Vue globale tous bureaux]
│       ├── BMO, BF, BJ, BCT, BOP, BCG, BJA, BRC, BPL, BEX
│       │   └── [Détail bureau individuel]
│
├── ⚡ Actions prioritaires
│   ├── Urgentes
│   │   ├── Critiques
│   │   │   └── [Liste actions critiques]
│   │   └── Importantes
│   │       └── [Liste actions importantes]
│   ├── Bloquées
│   │   ├── Blocages
│   │   │   └── [Liste blocages actifs]
│   │   └── Escalades
│   │       └── [Liste escalades]
│   ├── En attente
│   │   ├── Actions
│   │   │   └── [Liste actions en attente]
│   │   └── Décisions
│   │       └── [Liste décisions en attente]
│   └── Terminées
│       ├── Récentes
│       │   └── [Liste actions récentes]
│       └── Anciennes
│           └── [Liste actions anciennes]
│
├── ⚠️ Risques & Santé
│   ├── Critiques
│   │   ├── Risques
│   │   │   └── [Liste risques critiques]
│   │   └── Alertes
│   │       └── [Liste alertes critiques]
│   ├── Avertissements
│   │   ├── Moyens
│   │   │   └── [Liste risques moyens]
│   │   └── Faibles
│   │       └── [Liste risques faibles]
│   ├── Paiements
│   │   ├── En retard
│   │   │   └── [Liste paiements en retard]
│   │   └── À venir
│   │       └── [Liste paiements à venir]
│   └── Contrats
│       ├── Expirés
│       │   └── [Liste contrats expirés]
│       └── À renouveler
│           └── [Liste contrats à renouveler]
│
├── ⚖️ Décisions & Timeline
│   ├── En attente
│   │   ├── Urgentes
│   │   │   └── [Liste décisions urgentes]
│   │   └── Normales
│   │       └── [Liste décisions normales]
│   ├── Exécutées
│   │   ├── Récentes
│   │   │   └── [Liste décisions récentes]
│   │   └── Anciennes
│   │       └── [Liste décisions anciennes]
│   ├── Timeline
│   │   ├── Chronologique
│   │   │   └── [Timeline chronologique]
│   │   └── Par type
│   │       └── [Timeline par type]
│   └── Audit
│       ├── Traces
│       │   └── [Logs et traces]
│       └── Rapports
│           └── [Rapports d'audit]
│
└── 🔴 Temps réel
    ├── Live
    │   ├── Monitoring
    │   │   └── [Vue monitoring temps réel]
    │   └── Métriques
    │       └── [Métriques live]
    ├── Alertes
    │   ├── Actives
    │   │   └── [Liste alertes actives]
    │   └── Résolues
    │       └── [Liste alertes résolues]
    ├── Notifications
    │   ├── Non lues
    │   │   └── [Liste notifications non lues]
    │   └── Toutes
    │       └── [Liste toutes notifications]
    └── Synchronisation
        ├── État
        │   └── [État synchronisation]
        └── Historique
            └── [Historique synchronisation]
```

### Interactions & Actions

#### Boutons Principaux

| Page | Bouton | Action | Destination |
|------|--------|--------|-------------|
| Vue d'ensemble | "Voir tout" (sections) | Navigue vers vue détaillée | Performance/Actions/Risques |
| Vue d'ensemble | "Rechercher indicateur" | Ouvre recherche KPI | Filtre KPIs |
| Performance | "Exporter" | Export données | Modal export |
| Actions | "Valider tout" | Valide sélection | API + refresh |
| Actions | "Assigner" | Ouvre modal assignation | Modal assignation |
| Risques | "Intervenir" | Ouvre modal intervention | Modal intervention |
| Décisions | "Exécuter" | Exécute décision | API + refresh |

#### Formulaires

**Performance > Validations > En attente**
- Formulaire de validation :
  - Bouton "Valider" → Valide la demande
  - Bouton "Rejeter" → Ouvre modal rejet (raison requise)
  - Champ "Commentaire" (optionnel)

**Actions > En attente > Actions**
- Formulaire d'action :
  - Sélection multiple (checkboxes)
  - Bouton "Valider sélection"
  - Bouton "Assigner à..." (dropdown utilisateurs)
  - Bouton "Reporter" (date picker)

**Risques > Critiques**
- Formulaire d'intervention :
  - Sélection action (dropdown)
  - Champ "Description"
  - Bouton "Planifier" (date picker)
  - Bouton "Intervenir maintenant"

#### Tableaux

**Performance > Validations > En attente**
| Colonnes | Actions |
|----------|--------|
| Référence | Lien vers détail |
| Type | Badge |
| Fournisseur | Texte |
| Montant | Formaté (M FCFA) |
| Projet | Texte |
| Bureau | Badge |
| Priorité | Badge coloré |
| Délai | Texte coloré (rouge si retard) |
| Statut | Badge |
| Actions | Boutons Valider/Rejeter/Voir |

**Actions > Urgentes > Critiques**
| Colonnes | Actions |
|----------|--------|
| Checkbox | Sélection |
| Type | Icône + Badge |
| Titre | Lien vers détail |
| Bureau | Badge |
| Priorité | Badge |
| Délai | Texte coloré |
| Montant | Formaté |
| Actions | Boutons Valider/Assigner/Voir |

#### Menus Déroulants

**Filtres Globaux (Header)**
- Période : [Mois / Trimestre / Année]
- Bureau : [Tous / BMO / BF / ...]
- Projet : [Tous / Projet 1 / Projet 2 / ...]

**Actions (Barre d'outils)**
- Trier par : [Urgence / Date / Montant]
- Filtrer par : [Type / Bureau / Statut]
- Grouper par : [Type / Bureau / Priorité]

#### Flux Utilisateurs

**Flux 1 : Valider une demande**
1. Performance > Validations > En attente
2. Clic sur ligne → Modal détail
3. Clic "Valider" → Confirmation
4. Refresh automatique → Ligne disparaît

**Flux 2 : Traiter une action urgente**
1. Actions > Urgentes > Critiques
2. Sélection (checkbox)
3. Clic "Valider sélection" → Modal confirmation
4. Confirmation → API → Notification succès

**Flux 3 : Intervenir sur un risque**
1. Risques > Critiques > Risques
2. Clic sur risque → Modal détail
3. Clic "Intervenir" → Modal intervention
4. Sélection action → Planification
5. Confirmation → API → Notification

---

## 📋 VERSION 2 : IDÉALE (Architecture professionnelle)

### Arborescence Complète

```
Dashboard
│
├── 🏠 Accueil
│   ├── Vue d'ensemble
│   │   └── [10 sections : KPIs, Activité, Finances, Risques, Performance, Circuit, Agenda, Actions, Risk Radar, Décisions]
│   ├── KPIs clés
│   │   └── [4 KPIs principaux avec recherche]
│   └── Alertes critiques
│       └── [Liste alertes nécessitant action immédiate]
│
├── 📊 Performance
│   ├── Indicateurs
│   │   ├── Synthèse
│   │   │   └── [Vue synthèse tous KPIs]
│   │   ├── Projets
│   │   │   └── [KPIs par projet]
│   │   ├── Demandes
│   │   │   └── [KPIs demandes]
│   │   └── Budget
│   │       └── [KPIs budget]
│   ├── Validations
│   │   ├── En attente
│   │   │   └── [Tableau + filtres]
│   │   ├── Validées
│   │   │   └── [Tableau + export]
│   │   ├── Rejetées
│   │   │   └── [Tableau + analyse]
│   │   └── Circuit de validation
│   │       └── [Flow chart interactif]
│   ├── Budget
│   │   ├── Consommation
│   │   │   └── [Graphiques + détails]
│   │   └── Restant
│   │       └── [Répartition par projet]
│   ├── Retards
│   │   ├── Critiques
│   │   │   └── [Liste + actions]
│   │   └── Moyens
│   │       └── [Liste + prévisions]
│   ├── Comparaisons
│   │   ├── Par bureaux
│   │   │   └── [Tableau comparatif]
│   │   └── Par projets
│   │       └── [Tableau comparatif]
│   └── Bureaux
│       ├── Tous
│       │   └── [Vue globale]
│       └── [Chaque bureau]
│           └── [Détail bureau]
│
├── 📋 Actions & Tâches
│   ├── Ma boîte de réception
│   │   ├── Urgentes
│   │   │   └── [Actions urgentes assignées à moi]
│   │   ├── Aujourd'hui
│   │   │   └── [Actions dues aujourd'hui]
│   │   └── Cette semaine
│   │       └── [Actions de la semaine]
│   ├── Par type
│   │   ├── Contrats
│   │   │   └── [Actions contrats]
│   │   ├── Arbitrages
│   │   │   └── [Actions arbitrages]
│   │   ├── Paiements
│   │   │   └── [Actions paiements]
│   │   └── BC
│   │       └── [Actions BC]
│   ├── Bloquées
│   │   ├── Blocages
│   │   │   └── [Liste blocages]
│   │   └── Escalades
│   │       └── [Liste escalades]
│   └── Historique
│       ├── Récentes
│       │   └── [Actions récentes]
│       └── Anciennes
│           └── [Actions anciennes]
│
├── ⚠️ Risques
│   ├── Critiques
│   │   └── [Liste risques critiques]
│   ├── Avertissements
│   │   └── [Liste avertissements]
│   ├── Paiements en retard
│   │   └── [Liste paiements]
│   ├── Contrats expirés
│   │   └── [Liste contrats]
│   └── Alertes système
│       └── [Liste alertes]
│
├── ⚖️ Décisions
│   ├── En attente
│   │   ├── Urgentes
│   │   │   └── [Liste décisions urgentes]
│   │   └── Normales
│   │       └── [Liste décisions normales]
│   ├── Exécutées
│   │   └── [Liste décisions exécutées]
│   ├── Timeline
│   │   ├── Chronologique
│   │   │   └── [Timeline verticale]
│   │   └── Par type
│   │       └── [Timeline groupée par type]
│   └── Audit
│       ├── Traces
│       │   └── [Logs détaillés]
│       └── Rapports
│           └── [Rapports générés]
│
└── 🔴 Temps réel
    ├── Monitoring
    │   └── [Vue monitoring]
    ├── Alertes
    │   ├── Actives
    │   │   └── [Liste alertes]
    │   └── Résolues
    │       └── [Liste résolues]
    ├── Notifications
    │   ├── Non lues
    │   │   └── [Liste non lues]
    │   └── Toutes
    │       └── [Liste toutes]
    └── Synchronisation
        ├── État
        │   └── [État sync]
        └── Historique
            └── [Historique sync]
```

### Interactions & Actions

#### Boutons Principaux

| Page | Bouton | Action | Destination |
|------|--------|--------|-------------|
| Accueil | "Actualiser" | Refresh KPIs | API refresh |
| Accueil | "Exporter" | Export dashboard | Modal export |
| Performance | "Comparer" | Ouvre comparaison | Modal comparaison |
| Actions | "Nouvelle action" | Crée action | Modal création |
| Actions | "Filtres avancés" | Ouvre filtres | Panel filtres |
| Risques | "Créer alerte" | Crée alerte | Modal création |
| Décisions | "Nouvelle décision" | Crée décision | Modal création |

#### Formulaires

**Actions > Ma boîte de réception > Urgentes**
- Formulaire de traitement :
  - Sélection multiple
  - Bouton "Traiter" → Ouvre modal traitement
  - Bouton "Déléguer" → Ouvre modal délégation
  - Bouton "Reporter" → Date picker

**Risques > Critiques**
- Formulaire d'intervention :
  - Type d'intervention (radio)
  - Description (textarea)
  - Priorité (select)
  - Date planifiée (date picker)
  - Assignation (select utilisateur)
  - Bouton "Créer intervention"

**Décisions > En attente > Urgentes**
- Formulaire d'exécution :
  - Type décision (readonly)
  - Commentaire (textarea)
  - Pièces jointes (upload)
  - Bouton "Exécuter"
  - Bouton "Rejeter" (avec raison)

#### Tableaux

**Performance > Validations > En attente**
| Colonnes | Filtres | Tri | Actions |
|----------|---------|-----|---------|
| Référence | ✅ | ✅ | Voir détail |
| Type | ✅ | ✅ | - |
| Fournisseur | ✅ | ✅ | - |
| Montant | ✅ | ✅ | - |
| Projet | ✅ | ✅ | Voir projet |
| Bureau | ✅ | ✅ | Voir bureau |
| Priorité | ✅ | ✅ | - |
| Délai | ✅ | ✅ | - |
| Statut | ✅ | ✅ | - |
| Actions | - | - | Valider/Rejeter/Voir |

**Actions > Ma boîte de réception > Urgentes**
| Colonnes | Filtres | Tri | Actions |
|----------|---------|-----|---------|
| Checkbox | - | - | Sélection |
| Type | ✅ | ✅ | - |
| Titre | ✅ | ✅ | Voir détail |
| Bureau | ✅ | ✅ | Voir bureau |
| Priorité | ✅ | ✅ | - |
| Délai | ✅ | ✅ | - |
| Assigné à | ✅ | ✅ | - |
| Actions | - | - | Traiter/Déléguer/Reporter |

#### Menus Déroulants

**Header Global**
- Période : [Aujourd'hui / Semaine / Mois / Trimestre / Année / Personnalisé]
- Bureau : [Tous / BMO / BF / ...] + Recherche
- Projet : [Tous / Projet 1 / ...] + Recherche
- Vue : [Compacte / Étendue]

**Actions (Barre d'outils)**
- Trier par : [Urgence / Date / Montant / Bureau]
- Filtrer par : [Type / Bureau / Statut / Priorité / Assigné]
- Grouper par : [Type / Bureau / Priorité / Date]
- Afficher : [10 / 25 / 50 / 100]

#### Flux Utilisateurs

**Flux 1 : Traiter ma boîte de réception**
1. Actions > Ma boîte de réception > Urgentes
2. Sélection actions (checkboxes)
3. Clic "Traiter" → Modal traitement
4. Remplir formulaire → Confirmation
5. Refresh → Actions disparaissent de la boîte

**Flux 2 : Créer une intervention sur risque**
1. Risques > Critiques
2. Clic risque → Modal détail
3. Clic "Créer intervention" → Modal création
4. Remplir formulaire → Confirmation
5. Notification → Risque mis à jour

**Flux 3 : Exécuter une décision**
1. Décisions > En attente > Urgentes
2. Clic décision → Modal détail
3. Clic "Exécuter" → Modal exécution
4. Remplir formulaire → Confirmation
5. Timeline mise à jour

---

## 📋 VERSION 3 : MINIMALISTE (Simplifiée)

### Arborescence Complète

```
Dashboard
│
├── 🏠 Accueil
│   └── Vue d'ensemble
│       └── [10 sections compactes]
│
├── 📊 Performance
│   ├── KPIs
│   │   └── [Tous KPIs avec filtres intégrés]
│   ├── Validations
│   │   └── [Tableau avec filtres : En attente/Validées/Rejetées]
│   ├── Budget
│   │   └── [Graphiques consommation/restant]
│   └── Bureaux
│       └── [Liste bureaux avec filtres]
│
├── 📋 Actions
│   ├── Urgentes
│   │   └── [Liste urgentes avec filtres]
│   ├── Bloquées
│   │   └── [Liste bloquées]
│   └── En attente
│       └── [Liste en attente avec filtres Actions/Décisions]
│
├── ⚠️ Risques
│   ├── Critiques
│   │   └── [Liste critiques]
│   └── Avertissements
│       └── [Liste avertissements]
│
├── ⚖️ Décisions
│   ├── En attente
│   │   └── [Liste en attente]
│   └── Exécutées
│       └── [Liste exécutées]
│
└── 🔴 Temps réel
    └── Monitoring
        └── [Vue monitoring]
```

### Interactions & Actions

#### Boutons Principaux

| Page | Bouton | Action |
|------|--------|--------|
| Toutes | "Actualiser" | Refresh |
| Toutes | "Exporter" | Export |
| Actions | "Traiter" | Traite sélection |
| Risques | "Intervenir" | Ouvre intervention |

#### Filtres Intégrés (Dans les vues)

**Performance > KPIs**
- Filtres inline : [Type / Bureau / Période]
- Recherche : Champ recherche KPI

**Actions > Urgentes**
- Filtres inline : [Type / Bureau / Priorité]
- Tri : Dropdown [Urgence / Date / Montant]

#### Tableaux Simplifiés

**Performance > Validations**
| Colonnes | Actions |
|----------|--------|
| Référence | Voir |
| Type | - |
| Montant | - |
| Bureau | - |
| Priorité | - |
| Délai | - |
| Actions | Valider/Rejeter |

#### Flux Utilisateurs Simplifiés

**Flux 1 : Valider**
1. Performance > Validations
2. Filtre "En attente" (toggle)
3. Clic ligne → Modal
4. Clic "Valider" → Confirmation
5. Refresh

---

## 📋 VERSION 4 : AVANCÉE (Très complet)

### Arborescence Complète

```
Dashboard
│
├── 🏠 Accueil
│   ├── Vue d'ensemble
│   │   └── [10 sections détaillées]
│   ├── KPIs clés
│   │   └── [KPIs avec drill-down]
│   ├── Alertes critiques
│   │   └── [Alertes + actions rapides]
│   └── Activité récente
│       └── [Timeline activité]
│
├── 📊 Performance
│   ├── Indicateurs
│   │   ├── Synthèse
│   │   │   └── [Dashboard KPIs]
│   │   ├── Projets
│   │   │   ├── [Liste projets]
│   │   │   └── [Détail projet] → KPIs projet
│   │   ├── Demandes
│   │   │   ├── [Vue globale]
│   │   │   └── [Détail demande] → Historique
│   │   └── Budget
│   │       ├── [Vue globale]
│   │       └── [Détail budget] → Répartition
│   ├── Validations
│   │   ├── En attente
│   │   │   ├── [Tableau]
│   │   │   └── [Détail validation] → Formulaire validation
│   │   ├── Validées
│   │   │   ├── [Tableau]
│   │   │   └── [Détail] → Historique
│   │   ├── Rejetées
│   │   │   ├── [Tableau]
│   │   │   └── [Détail] → Raison rejet
│   │   └── Circuit de validation
│   │       └── [Flow chart interactif avec goulots]
│   ├── Budget
│   │   ├── Consommation
│   │   │   ├── [Graphiques]
│   │   │   └── [Détail] → Par projet/bureau
│   │   ├── Restant
│   │   │   ├── [Montants]
│   │   │   └── [Répartition] → Graphiques
│   │   ├── Prévisions
│   │   │   └── [Projections]
│   │   └── Analyse
│   │       └── [Analyse détaillée]
│   ├── Retards
│   │   ├── Critiques
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Actions correctives
│   │   ├── Moyens
│   │   │   └── [Liste]
│   │   └── Analyse des causes
│   │       └── [Analyse causes racines]
│   ├── Comparaisons
│   │   ├── Par bureaux
│   │   │   └── [Tableau comparatif]
│   │   ├── Par projets
│   │   │   └── [Tableau comparatif]
│   │   ├── Par période
│   │   │   └── [Graphiques évolution]
│   │   └── Benchmarking
│   │       └── [Comparaison objectifs]
│   ├── Bureaux
│   │   ├── Tous
│   │   │   └── [Vue globale]
│   │   ├── [Chaque bureau]
│   │   │   ├── [Détail bureau]
│   │   │   ├── [KPIs bureau]
│   │   │   ├── [Équipe]
│   │   │   └── [Historique]
│   │   └── Comparaison
│   │       └── [Tableau comparatif]
│   └── Tendances
│       ├── Mensuelles
│       │   └── [Graphiques]
│       ├── Trimestrielles
│       │   └── [Graphiques]
│       └── Annuelles
│           └── [Graphiques]
│
├── 📋 Actions & Tâches
│   ├── Ma boîte de réception
│   │   ├── Urgentes
│   │   │   └── [Actions urgentes assignées]
│   │   ├── Aujourd'hui
│   │   │   └── [Actions dues aujourd'hui]
│   │   ├── Cette semaine
│   │   │   └── [Actions semaine]
│   │   └── Personnalisées
│   │       └── [Vues sauvegardées]
│   ├── Par type
│   │   ├── Contrats
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Historique contrat
│   │   ├── Arbitrages
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Contexte arbitrage
│   │   ├── Paiements
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Facture
│   │   ├── BC
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → BC complet
│   │   └── Autres
│   │       └── [Liste]
│   ├── Par priorité
│   │   ├── Critique
│   │   │   └── [Liste]
│   │   ├── Haute
│   │   │   └── [Liste]
│   │   └── Moyenne
│   │       └── [Liste]
│   ├── Bloquées
│   │   ├── Blocages
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Cause blocage
│   │   ├── Escalades
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Historique escalade
│   │   └── Analyse
│   │       └── [Analyse patterns blocages]
│   ├── Assignées
│   │   ├── À moi
│   │   │   └── [Liste]
│   │   ├── À mon équipe
│   │   │   └── [Liste]
│   │   └── Non assignées
│   │       └── [Liste]
│   └── Historique
│       ├── Récentes
│       │   └── [Liste]
│       ├── Anciennes
│       │   └── [Liste]
│       └── Archivées
│           └── [Liste]
│
├── ⚠️ Risques
│   ├── Critiques
│   │   ├── Risques
│   │   │   ├── [Liste]
│   │   │   └── [Détail] → Actions correctives
│   │   └── Alertes
│   │       └── [Liste]
│   ├── Avertissements
│   │   ├── Moyens
│   │   │   └── [Liste]
│   │   └── Faibles
│   │       └── [Liste]
│   ├── Par type
│   │   ├── Paiements en retard
│   │   │   └── [Liste]
│   │   ├── Contrats expirés
│   │   │   └── [Liste]
│   │   ├── Blocages
│   │   │   └── [Liste]
│   │   └── Alertes système
│   │       └── [Liste]
│   ├── Analyse
│   │   ├── Tendances
│   │   │   └── [Graphiques]
│   │   ├── Causes racines
│   │   │   └── [Analyse]
│   │   └── Prévisions
│   │       └── [Projections]
│   └── Actions correctives
│       ├── En cours
│       │   └── [Liste]
│       └── Planifiées
│           └── [Liste]
│
├── ⚖️ Décisions
│   ├── En attente
│   │   ├── Urgentes
│   │   │   └── [Liste]
│   │   ├── Normales
│   │   │   └── [Liste]
│   │   └── Planifiées
│   │       └── [Liste]
│   ├── Exécutées
│   │   ├── Récentes
│   │   │   └── [Liste]
│   │   ├── Anciennes
│   │   │   └── [Liste]
│   │   └── Par type
│   │       └── [Liste groupée]
│   ├── Timeline
│   │   ├── Chronologique
│   │   │   └── [Timeline verticale]
│   │   ├── Par type
│   │   │   └── [Timeline groupée]
│   │   └── Par auteur
│   │       └── [Timeline par auteur]
│   ├── Audit
│   │   ├── Traces
│   │   │   └── [Logs détaillés]
│   │   ├── Rapports
│   │   │   └── [Rapports générés]
│   │   └── Conformité
│   │       └── [Vérification conformité]
│   └── Modèles
│       ├── Substitution
│       │   └── [Modèles substitution]
│       ├── Délégation
│       │   └── [Modèles délégation]
│       └── Arbitrage
│           └── [Modèles arbitrage]
│
├── 🔴 Temps réel
│   ├── Monitoring
│   │   ├── Vue globale
│   │   │   └── [Dashboard monitoring]
│   │   ├── Métriques
│   │   │   └── [Métriques détaillées]
│   │   └── Performance
│   │       └── [Métriques performance]
│   ├── Alertes
│   │   ├── Actives
│   │   │   └── [Liste]
│   │   ├── Résolues
│   │   │   └── [Liste]
│   │   └── Historique
│   │       └── [Historique alertes]
│   ├── Notifications
│   │   ├── Non lues
│   │   │   └── [Liste]
│   │   ├── Toutes
│   │   │   └── [Liste]
│   │   └── Préférences
│   │       └── [Configuration notifications]
│   └── Synchronisation
│       ├── État
│       │   └── [État sync]
│       ├── Historique
│       │   └── [Historique sync]
│       └── Configuration
│           └── [Config sync]
│
└── ⚙️ Administration
    ├── Paramètres
    │   ├── Dashboard
    │   │   └── [Config dashboard]
    │   ├── KPIs
    │   │   └── [Config KPIs]
    │   └── Notifications
    │       └── [Config notifications]
    ├── Utilisateurs
    │   ├── Liste
    │   │   └── [Tableau utilisateurs]
    │   └── Permissions
    │       └── [Gestion permissions]
    ├── Permissions
    │   ├── Rôles
    │   │   └── [Gestion rôles]
    │   └── Accès
    │       └── [Gestion accès]
    └── Logs
        ├── Activité
        │   └── [Logs activité]
        └── Système
            └── [Logs système]
```

### Interactions & Actions Avancées

#### Boutons Principaux

| Page | Bouton | Action | Destination |
|------|--------|--------|-------------|
| Accueil | "Personnaliser" | Ouvre config | Modal personnalisation |
| Performance | "Créer rapport" | Génère rapport | Modal création rapport |
| Actions | "Workflow" | Ouvre workflow | Vue workflow |
| Risques | "Analyser" | Analyse risques | Vue analyse |
| Décisions | "Créer modèle" | Crée modèle | Modal création modèle |
| Administration | "Exporter config" | Export config | Téléchargement |

#### Formulaires Avancés

**Actions > Créer action**
- Formulaire complet :
  - Type (select)
  - Titre (input)
  - Description (textarea)
  - Priorité (select)
  - Bureau (select)
  - Projet (select)
  - Assigné à (select)
  - Échéance (date picker)
  - Montant (input)
  - Pièces jointes (upload)
  - Bouton "Créer"
  - Bouton "Créer et assigner"

**Risques > Analyse > Causes racines**
- Formulaire d'analyse :
  - Risque (select)
  - Cause identifiée (textarea)
  - Impact (select)
  - Probabilité (select)
  - Actions préventives (textarea)
  - Actions correctives (textarea)
  - Responsable (select)
  - Date cible (date picker)
  - Bouton "Enregistrer analyse"

**Décisions > Modèles > Créer modèle**
- Formulaire modèle :
  - Nom modèle (input)
  - Type (select)
  - Description (textarea)
  - Champs requis (checkboxes)
  - Workflow (select)
  - Bouton "Créer modèle"

#### Tableaux Avancés

**Performance > Validations > En attente**
| Colonnes | Filtres | Tri | Groupe | Export | Actions |
|----------|---------|-----|--------|--------|---------|
| Checkbox | - | - | - | - | Sélection |
| Référence | ✅ | ✅ | ✅ | ✅ | Voir détail |
| Type | ✅ | ✅ | ✅ | ✅ | - |
| Fournisseur | ✅ | ✅ | ✅ | ✅ | Voir fournisseur |
| Montant | ✅ | ✅ | ✅ | ✅ | - |
| Projet | ✅ | ✅ | ✅ | ✅ | Voir projet |
| Bureau | ✅ | ✅ | ✅ | ✅ | Voir bureau |
| Priorité | ✅ | ✅ | ✅ | ✅ | - |
| Délai | ✅ | ✅ | ✅ | ✅ | - |
| Statut | ✅ | ✅ | ✅ | ✅ | - |
| Assigné à | ✅ | ✅ | ✅ | ✅ | Voir utilisateur |
| Actions | - | - | - | - | Valider/Rejeter/Déléguer/Voir |

#### Menus Déroulants Avancés

**Header Global**
- Période : [Aujourd'hui / Semaine / Mois / Trimestre / Année / Personnalisé]
- Bureau : [Tous / BMO / BF / ...] + Recherche + "Sélection multiple"
- Projet : [Tous / Projet 1 / ...] + Recherche + "Sélection multiple"
- Vue : [Compacte / Étendue / Personnalisée]
- Thème : [Clair / Sombre / Auto]

**Actions (Barre d'outils)**
- Trier par : [Urgence / Date / Montant / Bureau / Projet]
- Filtrer par : [Type / Bureau / Statut / Priorité / Assigné / Projet]
- Grouper par : [Type / Bureau / Priorité / Date / Projet]
- Afficher : [10 / 25 / 50 / 100 / Tout]
- Colonnes : [Sélection colonnes visibles]
- Export : [CSV / Excel / PDF / JSON]

#### Flux Utilisateurs Avancés

**Flux 1 : Créer et traiter une action**
1. Actions > Par type > Contrats
2. Clic "Nouvelle action" → Modal création
3. Remplir formulaire → Confirmation
4. Action créée → Notification
5. Action apparaît dans "Ma boîte de réception"
6. Clic action → Modal détail
7. Clic "Traiter" → Formulaire traitement
8. Confirmation → Action traitée

**Flux 2 : Analyser un risque**
1. Risques > Critiques > Risques
2. Clic risque → Modal détail
3. Clic "Analyser" → Vue analyse
4. Remplir analyse causes racines
5. Définir actions préventives/correctives
6. Assigner responsable
7. Enregistrer → Risque mis à jour

**Flux 3 : Créer un modèle de décision**
1. Décisions > Modèles > Substitution
2. Clic "Créer modèle" → Modal création
3. Remplir formulaire modèle
4. Définir workflow
5. Enregistrer → Modèle disponible
6. Utiliser modèle pour créer décision

---

## 🎯 RECOMMANDATION FINALE

**Version recommandée** : **Version 2 (IDÉALE)**

**Raisons** :
1. ✅ Structure claire et professionnelle
2. ✅ 2 niveaux maximum (navigation simple)
3. ✅ Logique métier respectée
4. ✅ Pas de redondances
5. ✅ Facile à maintenir
6. ✅ Évolutive (peut devenir Version 4)

**Plan d'implémentation** :
1. Phase 1 : Appliquer patches minimaux (✅ fait)
2. Phase 2 : Restructurer selon Version 2
3. Phase 3 : Ajouter fonctionnalités avancées (optionnel)

---

**Statut** : ✅ **DOCUMENTATION COMPLÈTE**
