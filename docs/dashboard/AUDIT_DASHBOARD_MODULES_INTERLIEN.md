# Audit : Dashboard ↔ Modules BMO — Interconnexion et proposition de refonte

**Date** : 1er février 2025  
**Objectif** : Recenser l'existant pour proposer une refonte où le dashboard est le hub central, les modules BMO l'alimentent, et tout est interconnecté (clic → module concerné).

---

## 1. Vue d'ensemble du projet

### 1.1 Structure des répertoires clés

| Chemin | Rôle |
|--------|------|
| `app/(portals)/maitre-ouvrage/` | Pages Next.js maître d'ouvrage (~80+ routes) |
| `src/modules/` | Modules métier (dashboard, calendrier, gouvernance, validation-bc, etc.) |
| `src/components/features/bmo/` | Composants BMO (analytics, governance, demandes, etc.) |
| `src/lib/navigation/` | Config navigation (bmoModules, bmoSitemap, navigation.ts) |
| `lib/server/dashboard/` | Backend dashboard (read models, alerting, export) |
| `app/api/` | APIs (dashboard, alerts, chantiers, gouvernance, etc.) |

### 1.2 Architecture actuelle : deux systèmes de navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BmoSidebar (sidebar principale)                                             │
│  • Lit bmoModules (bmoSitemap.json)                                          │
│  • Liens : /maitre-ouvrage/dashboard, /maitre-ouvrage/chantiers,             │
│    /maitre-ouvrage/governance, /maitre-ouvrage/fournisseurs, etc.            │
│  • Changement de page complet (navigation Next.js)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Sur /maitre-ouvrage/dashboard UNIQUEMENT :                                  │
│  • DashboardSubSidebar (sub-navigation)                                      │
│  • Lit dashboardNavigationConfig (6 blocs : pilotage, chantiers, finance…)   │
│  • Navigate via store (main, sub, leaf) — RESTE sur /maitre-ouvrage/dashboard│
│  • Contenu : DashboardHome (si pilotage+dashboard) ou DashboardViewRouter    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Conséquence** : Clic sur « Chantiers » dans BmoSidebar → `/maitre-ouvrage/chantiers`. Clic sur « Chantiers » dans DashboardSubSidebar → reste sur `/maitre-ouvrage/dashboard`, contenu chantiers via registry. **Deux logiques différentes.**

---

## 2. Modules BMO (source de vérité : bmoSitemap.json)

### 2.1 Groupes et modules

| Groupe | Modules |
|--------|---------|
| **PILOTAGE** | cockpit (Dashboard), alerts, governance, performance, opportunities |
| **EXECUTION** | chantiers, conception, planning, execution, quality, receptions, engagements |
| **SUPPORT** | foncier, achats, fournisseurs, conformite, maintenance, documents, support, admin |
| **SYSTÈME** | echanges, conferences, messages, registre-decisions, audit, journal-actions, logs, ia, parametres-systeme |

### 2.2 Mapping path → module

| Module | Path | Connecté au dashboard ? |
|--------|------|-------------------------|
| cockpit | /maitre-ouvrage/dashboard | ✅ Page d'accueil |
| alerts | /maitre-ouvrage/alerts | ⚠️ SubSidebar « alertes » pointe vers dashboard interne |
| governance | /maitre-ouvrage/governance | ⚠️ Idem |
| chantiers | /maitre-ouvrage/chantiers | ⚠️ SubSidebar « chantiers » = vue dashboard, pas redirection |
| fournisseurs | /maitre-ouvrage/fournisseurs | ❌ Pas de lien dashboard |
| engagements | /maitre-ouvrage/engagements | ❌ Pas de lien dashboard |
| demandes-rh | /maitre-ouvrage/demandes-rh | ❌ Pas de lien dashboard |
| validation-bc | /maitre-ouvrage/validation-bc | ❌ Pas de lien dashboard |
| ... | ... | ... |

---

## 3. Dashboard actuel : ce qui existe

### 3.1 Composants principaux

| Composant | Fichier | Rôle |
|-----------|---------|------|
| DashboardPage | `app/(portals)/maitre-ouvrage/dashboard/page.tsx` | Page container, KPIs, toolbar, layout |
| DashboardHome | `src/modules/dashboard/components/views/DashboardHome.tsx` | Vue cockpit (~1690 lignes) — affichée si pilotage+dashboard |
| DashboardSubSidebar | `src/modules/dashboard/navigation/DashboardSubSidebar.tsx` | Sub-nav (icônes, expand au hover) |
| DashboardViewRouter | `src/modules/dashboard/components/DashboardViewRouter.tsx` | Routeur vers vues registry |
| dashboardNavigationConfig | `src/modules/dashboard/navigation/dashboardNavigationConfig.ts` | 6 blocs, enfants |

### 3.2 Contenu de DashboardHome (actuel)

- **Bandeau KPI** : Demandes, Validations, Blocages, Décisions, Délai paiement
- **Vue finances DG** : onglets Finances / Opérations / Risques, cockpit budget/trésorerie
- **HSE & Conformité**, **Risques & satisfaction**, **Indicateurs complémentaires**
- **Activité récente**, **Phase 4 – Exécution** (chantiers)
- **Modals** : Créances, Validations, Budget consommé, Décisions, Appel, Relance, Escalade, etc.

### 3.3 Données du dashboard

| Source | API / Fichier | Usage |
|--------|---------------|-------|
| KPIs | `useDashboardKPIs` → `/api/dashboard/stats` | Bandeau KPI, KPICardPro |
| Trésorerie | `useTresoreriePrevisionnelle` → `/api/dashboard/cash-flow-previsions` | TresoreriePrevisionnelleWidget |
| Mock | `chantiersMock`, `financesGlobales`, `dashboardCockpitMock` | Phase 4 chantiers, finances, indicateurs |
| dashboardReadService | `/api/dashboard/[main]/[sub]/[leaf]` | Vues registry (overview, performance, achats, etc.) |

### 3.4 Liens sortants depuis DashboardHome

| Élément | Action actuelle |
|---------|-----------------|
| AlertesIntelligentesWidget « Voir tout » | `navigate('pilotage', 'alertes', 'default')` → reste sur dashboard |
| Aucun autre lien | Pas de lien vers /maitre-ouvrage/chantiers, /fournisseurs, /governance, etc. |

---

## 4. APIs et flux de données

### 4.1 APIs dashboard

| Route | Rôle |
|-------|------|
| GET /api/dashboard/stats | KPIs agrégés |
| GET /api/dashboard/[main]/[sub]/[leaf] | Données par vue (ReadModelsRepo) |
| GET /api/dashboard/cash-flow-previsions | Trésorerie prévisionnelle |
| POST /api/export/dashboard | Export PDF/Excel |

### 4.2 APIs modules (potentiels feeders du dashboard)

| API | Module lié |
|-----|------------|
| /api/alerts/* | Alertes |
| /api/chantiers/* | Chantiers |
| /api/demandes-rh/* | Demandes RH |
| /api/governance/* | Gouvernance |
| /api/validation-bc/* | Validation BC |
| /api/paiements/* | Paiements |

### 4.3 dashboardReadService (lib/server/dashboard)

- Dispatcher par `main`, `sub`, `leaf`
- Repos : `ReadModelsRepo`, `SqlReadModelsRepoAchats`, `SqlReadModelsRepoReporting`, etc.
- Pas d'agrégation explicite depuis les modules « métier » (chantiers, fournisseurs, etc.) — données plutôt mock ou vues SQL dédiées

---

## 5. Écarts identifiés (dashboard ↔ modules)

### 5.1 Pas d'interconnexion réelle

| Besoin | État actuel |
|--------|-------------|
| Dashboard reçoit les infos des modules | ❌ Données mock ou vues SQL isolées ; pas d’API « module → dashboard » |
| Clic dashboard → module concerné | ❌ Un seul lien (alertes), et il reste dans le dashboard |
| Modules = leviers pour agir sur l’entreprise | ⚠️ Modules existent mais ne sont pas exposés comme « actions » depuis le dashboard |

### 5.2 Navigation fragmentée

- **BmoSidebar** : liens vers pages réelles (/chantiers, /governance, etc.)
- **DashboardSubSidebar** : navigation interne au dashboard (main/sub/leaf)
- Pas de convention claire : « depuis le dashboard, un clic doit mener à la page module ou à une vue dédiée ? »

### 5.3 Données non interconnectées

- Zones, fournisseurs, clients, contrats, avenants : gérés dans des modules/APIs séparés
- Aucun « graphe » de données : pas de drill-down chantier → fournisseur → contrat
- DashboardHome utilise des mocks locaux (chantiersMock, etc.)

---

## 6. Inventaire des modules BMO par domaine

### 6.1 Pilotage & vue d’ensemble

| Module | Path | Contenu typique |
|--------|------|-----------------|
| cockpit | /dashboard | DashboardHome (cockpit DG) |
| alerts | /alerts | Centre d’alertes |
| governance | /governance | Gouvernance, décisions, arbitrages |
| performance | /performance | Indicateurs, SLA, jalons |
| opportunities | /opportunities | Pipeline, études |

### 6.2 Exécution

| Module | Path | Contenu typique |
|--------|------|-----------------|
| chantiers | /chantiers | Portefeuille, programmes, carte, planning |
| conception | /conception | ESQ, APS, APD |
| planning | /planning | Ordonnancement |
| execution | /execution | Suivi chantier, rapports |
| quality | /quality | Réserves, punch list |
| receptions | /receptions | Livraisons |
| engagements | /engagements | BC, factures, paiements |

### 6.3 Support (fournisseurs, achats, conformité, etc.)

| Module | Path | Contenu typique |
|--------|------|-----------------|
| fournisseurs | /fournisseurs | Répertoire entreprises |
| achats | /achats | AO, lots |
| conformite | /conformite | Permis, DEEC, assurances |
| documents | /documents | Contrats, DCE, DOE |
| maintenance | /maintenance | Garanties |
| validation-bc | /validation-bc | Validation BC, factures |
| demandes-rh | /demandes-rh | Demandes RH |

### 6.4 Système

| Module | Path | Contenu typique |
|--------|------|-----------------|
| echanges | dashboard?main=systeme&sub=echanges | Échanges structures |
| audit | dashboard?main=systeme&sub=audit | Audit |
| parametres | /parametres | Paramètres |
| ... | ... | ... |

---

## 7. Recommandations pour la refonte

### 7.1 Principes cibles

1. **Dashboard = hub** : santé globale, alertes, orientation, porte d’entrée.
2. **Modules = feeders** : chaque module expose des indicateurs/alertes pour le dashboard.
3. **Interconnexion** : chaque signal du dashboard est cliquable et mène au module concerné (ou à une vue filtrée).
4. **Leviers** : les modules sont des points d’action sur l’entreprise ; le dashboard les met en avant.

### 7.2 Actions techniques proposées

| Action | Détail |
|--------|--------|
| **Convention de liens** | Définir : lien dashboard → `/maitre-ouvrage/[module]` (page réelle) ou vue dashboard avec contexte. Documenter dans une spec. |
| **API « Dashboard feed »** | Créer un endpoint ou un aggregateur qui récupère alertes/KPIs depuis les modules (alerts, chantiers, finance, RH, etc.). |
| **Composant LinkToModule** | Créer un helper pour générer les liens dashboard → module (avec query pour pré-filtrer si besoin). |
| **Refonte DashboardHome** | Alléger l’UI (briefing/veille), ajouter des cartes/ pastilles cliquables vers les modules. |
| **Sub-sidebar hiérarchique** | Faire évoluer le SubSidebar en structure 1 / 1.1 / 1.1.1 avec panneau de choix contextuel. |
| **Drill-down** | Préparer le drill-down chantier → fournisseur → contrat (liens dans les vues détaillées). |

### 7.3 Mapping dashboard → modules (proposition)

| Signal / KPI dashboard | Module cible | Lien proposé |
|------------------------|--------------|--------------|
| Alertes | alerts | /maitre-ouvrage/alerts |
| Décisions en attente | governance | /maitre-ouvrage/governance/decisions |
| Chantiers critiques | chantiers | /maitre-ouvrage/chantiers?filter=critiques |
| Validations | validation-bc | /maitre-ouvrage/validation-bc |
| Demandes RH | demandes-rh | /maitre-ouvrage/demandes-rh |
| Créances | engagements / recouvrements | /maitre-ouvrage/engagements ou recouvrements |
| Trésorerie | finances | /maitre-ouvrage/finances |
| Fournisseurs | fournisseurs | /maitre-ouvrage/fournisseurs |
| Dossiers bloqués | blocked | /maitre-ouvrage/blocked |

---

## 8. Fichiers de référence pour la refonte

| Fichier | Usage |
|---------|-------|
| `src/lib/navigation/bmoSitemap.json` | Liste des modules, paths, structure |
| `src/lib/navigation/bmoModules.ts` | Export bmoModules, getModuleByPath |
| `src/modules/dashboard/navigation/dashboardNavigationConfig.ts` | Config SubSidebar |
| `src/modules/dashboard/components/views/DashboardHome.tsx` | Vue cockpit à refactorer |
| `src/modules/dashboard/registry/dashboardRegistry.tsx` | Mapping main/sub/leaf → composants |
| `src/lib/hooks/useDashboardKPIs.ts` | KPIs dashboard |
| `lib/server/dashboard/services/dashboardReadService.ts` | Backend read models |
| `app/(portals)/maitre-ouvrage/dashboard/page.tsx` | Page dashboard |

---

## 9. Synthèse

| Élément | État actuel | Cible |
|---------|-------------|-------|
| Dashboard reçoit données des modules | Données mock / vues SQL isolées | API feed agrégée depuis les modules |
| Liens dashboard → modules | 1 lien (alertes, interne) | Tous les signaux cliquables → page module |
| Navigation | BmoSidebar + SubSidebar, logiques différentes | Convention unique : dashboard = hub, clic = module |
| Structure DashboardHome | Très chargée (~1690 lignes) | Épurée, briefing, veille, intent-first |
| Sub-sidebar | Liste plate, expand au hover | Hiérarchique, panneau de choix contextuel |

---

*Document produit dans le cadre de l’audit en vue de la refonte Dashboard ↔ Modules BMO.*
