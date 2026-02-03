# Plan de migration détaillé — Architecture Outlook-like complète BMO

**Date** : 3 février 2025  
**Objectif** : Migrer l'intégralité des modules BMO vers une architecture type Microsoft Outlook.

---

## 1. État actuel du projet (analyse)

### 1.1 Ce qui existe déjà ✅

| Composant | Emplacement | État |
|-----------|-------------|------|
| **OutlookLikeLayout** | `src/components/bmo/layout/OutlookLikeLayout.tsx` | ✅ Opérationnel (sidebar, filterBar, list, detail, quickActions) |
| **QuickActionsBar** | `src/components/bmo/ui/QuickActionsBar.tsx` | ✅ Opérationnel (props: primary, actions, selectedCount) |
| **FilterBar** | `src/components/bmo/ui/FilterBar.tsx` | ✅ Opérationnel (viewTabs, activeFilters, sort) |
| **SidebarFolders** | `src/components/bmo/ui/SidebarFolders.tsx` | ✅ Opérationnel (utilise BmoFolder, type messages) |
| **MessageList** | `src/components/bmo/messages/MessageList.tsx` | ✅ Opérationnel (spécifique BmoMessage) |
| **MessageListRow** | `src/components/bmo/messages/MessageListRow.tsx` | ✅ Opérationnel |
| **MessageDetailPanel** | `src/components/bmo/messages/MessageDetailPanel.tsx` | ✅ Opérationnel |
| **EmptyStates** | `src/components/common/EmptyStates.tsx` | ✅ Réutilisable (EmptyState, EmptyList, ErrorState) |
| **LoadingStates** | `src/components/common/LoadingStates.tsx` | ✅ Réutilisable (SkeletonList, Skeleton) |
| **Page Messages** | `app/(portals)/maitre-ouvrage/messages/page.tsx` | ✅ **Module pilote déjà migré** |
| **Documentation** | `docs/bmo/OUTLOOK_LIKE_INTEGRATION.md`, `PLAN_MIGRATION_LAYOUT_OUTLOOK_LIKE.md` | ✅ Complète |

### 1.2 Ce qui manque / à créer

| Élément | Action requise |
|---------|----------------|
| **ModuleSubSidebar** | Créer version générique (SidebarFolders utilise BmoFolder) OU adapter SidebarFolders avec types génériques |
| **ItemList** | Créer composant générique avec `renderItem` (MessageList = spécifique messages) |
| **ListRow** | Créer base générique OU pattern `renderItem` dans ItemList |
| **DetailPanel** | Créer générique (MessageDetailPanel = spécifique) avec slots header/content |
| **DashboardLayout** | Créer ou réutiliser `ContentPaneWithGrid` / layout dashboard existant |
| **CalendarLayout** | Créer ou adapter `ExplorerLayoutResponsive` |
| **lib/config/modules/** | Créer 24+ fichiers config (alerts, demandes, validation-bc, etc.) |
| **lib/types/module.types.ts** | Créer ModuleConfig, SubSidebarConfig, etc. |
| **lib/types/bmo.types.ts** | Consolider AlerteBTP, DemandeBTP, ValidationBC, etc. |

### 1.3 Modules du projet (plus de 24)

Le projet contient **60+ routes** réparties en 7 sections. Le prompt cible 24 modules principaux. Cartographie :

**PILOTAGE** : dashboard, alerts, governance, performance, opportunities, calendrier, analytics  
**EXÉCUTION** : demandes, validation-bc, blocked, substitution, arbitrages-vivants, chantiers, conception, planning, execution, quality, receptions, engagements  
**SUPPORT** : foncier, achats, fournisseurs, conformité, maintenance, documents, aide, admin  
**COMMUNICATION** : echanges-structures, conferences, messages (✅ fait), messages-externes  
**SYSTÈME** : decisions, audit, logs, system-logs, parametres, ia  

---

## 2. Plan d'action détaillé

### PHASE 1 : Infrastructure de base (Jours 1–2)

#### 1.1 Types globaux

**Fichier** : `src/lib/types/module.types.ts` (nouveau)

```typescript
// ModuleConfig, SubSidebarConfig, SubSidebarSection, SubSidebarItem
// QuickActionsConfig, FilterBarConfig, ViewTab, QuickFilter
```

**Fichier** : `src/lib/types/bmo.types.ts` (créer ou enrichir)

- Consolider les types existants (`src/lib/types/alert.types.ts`, etc.)
- Exporter AlerteBTP, DemandeBTP, ValidationBC, etc.

#### 1.2 Composants génériques à créer

| Composant | Emplacement | Description |
|-----------|-------------|-------------|
| **ModuleSubSidebar** | `src/components/bmo/ModuleSubSidebar.tsx` | Version générique de SidebarFolders, accepte SubSidebarSection[] |
| **ItemList** | `src/components/bmo/ItemList.tsx` | Liste générique avec `renderItem`, selectedId, onSelect, virtualisation si >50 items |
| **DetailPanel** | `src/components/bmo/DetailPanel.tsx` | Slots `renderHeader`, `renderContent`, emptyMessage |
| **DashboardLayout** | `src/components/bmo/layout/DashboardLayout.tsx` | Zone unique (grille KPIs/widgets) |
| **CalendarLayout** | `src/components/bmo/layout/CalendarLayout.tsx` | Sub-sidebar + zone calendrier + détail optionnel |

**Réutiliser** (pas de doublon) :
- EmptyState → `@/components/common/EmptyStates`
- LoadingSkeleton → `@/components/common/LoadingStates` ou `@/components/ui/skeleton`
- ErrorBanner → `ErrorState` dans EmptyStates

#### 1.3 Configs modules (24+ fichiers)

**Dossier** : `src/lib/config/modules/`

Créer pour chaque module principal :
- `alerts.config.ts`, `demandes.config.ts`, `validation-bc.config.ts`, `governance.config.ts`
- `performance.config.ts`, `opportunities.config.ts`, `chantiers.config.ts`, `planning.config.ts`
- etc. (voir annexe)

Chaque config exporte : `moduleConfig: ModuleConfig` avec subSidebar, quickActions, filterBar.

#### 1.4 Checklist Phase 1

- [ ] module.types.ts créé
- [ ] bmo.types.ts enrichi/consolidé
- [ ] ModuleSubSidebar créé
- [ ] ItemList créé (avec virtualisation)
- [ ] DetailPanel créé
- [ ] DashboardLayout créé
- [ ] CalendarLayout créé
- [ ] 24 fichiers config créés
- [ ] Aucun doublon
- [ ] Build OK, 0 erreur TypeScript

---

### PHASE 2 : Module pilote — Centre d'alertes (Jours 3–4)

**Page actuelle** : `app/(portals)/maitre-ouvrage/alerts/page.tsx` (CockpitLayout + graphiques)

**Objectif** : Passer à OutlookLikeLayout avec liste+détail, garder option synthèse en sous-vue.

#### 2.1 Tâches

1. Créer `alerts.config.ts` avec dossiers (Toutes, Critiques, Par typologie, Par chantier)
2. Créer composants spécifiques :
   - `AlerteListRow.tsx` (ou utiliser ItemList + renderItem)
   - `AlerteDetailHeader.tsx`, `AlerteDetailContent.tsx`
3. Migrer la page : remplacer CockpitLayout par OutlookLikeLayout
4. Conserver les graphiques dans une vue "Synthèse" (onglet ou sous-route)

#### 2.2 Pattern de la page migrée

```tsx
<OutlookLikeLayout
  quickActions={<QuickActionsBar ... />}
  filterBar={<FilterBar ... />}
  sidebar={<ModuleSubSidebar sections={alertsModuleConfig.subSidebar.sections} />}
  list={<ItemList items={alertes} renderItem={...} />}
  detail={<DetailPanel item={selectedAlerte} renderHeader={...} renderContent={...} />}
/>
```

#### 2.3 Checklist Phase 2

- [ ] Page alerts migrée
- [ ] Navigation dossiers OK
- [ ] Filtres OK
- [ ] Sélection + détail OK
- [ ] Actions (traiter, assigner) OK
- [ ] Responsive OK
- [ ] Pas de régression design

---

### PHASE 3 : Modules similaires (Jours 5–7)

**Modules** : Demandes, Validation BC, Gouvernance

- Dupliquer le pattern du module pilote
- Adapter config + renderItem pour chaque type d'entité
- Tester chaque module

---

### PHASE 4 : Modules exécution (Jours 8–12)

**Modules** : Chantiers, Études (conception), Planning, Suivi (execution), Qualité, Livraisons (receptions), Engagements

- Planning : utiliser CalendarLayout
- Même pattern OutlookLikeLayout pour les autres

---

### PHASE 5 : Modules support (Jours 13–16)

**Modules** : Foncier, Achats, Fournisseurs, Conformité, Maintenance, Documents, Aide, Admin

- Admin : DashboardLayout (grille widgets)

---

### PHASE 6 : Modules communication (Jours 17–19)

**Modules** : Échanges, Conférences, Messages (✅), Registre, Audit, Journal

- Conférences : CalendarLayout

---

### PHASE 7 : Dashboard général (Jour 20)

- Migrer avec DashboardLayout
- Garder tuiles Quick Access et KPIs

---

### PHASE 8 : Tests et optimisation (Jours 21–22)

- Tests de régression
- Virtualisation listes longues
- Accessibilité (WCAG AA)
- Documentation

---

## 3. Décisions d'architecture

### 3.1 Emplacements des fichiers

| Rôle | Chemin | Note |
|------|--------|------|
| Layouts | `src/components/bmo/layout/` | OutlookLikeLayout déjà là |
| Composants BMO génériques | `src/components/bmo/` | ModuleSubSidebar, ItemList, DetailPanel |
| Configs modules | `src/lib/config/modules/` | Nouveau dossier |
| Types | `src/lib/types/` | module.types.ts, bmo.types.ts |

### 3.2 Réutilisation vs création

- **SidebarFolders** : Garder pour Messages. Créer **ModuleSubSidebar** générique pour les autres (sections avec items, icônes lucide par nom de string).
- **MessageList** : Garder pour Messages. Créer **ItemList** générique avec `renderItem: (item, selected) => ReactNode`.
- **MessageDetailPanel** : Garder pour Messages. Créer **DetailPanel** générique avec slots.

### 3.3 Pas de duplication

- Un seul `OutlookLikeLayout`
- Un seul `QuickActionsBar`, `FilterBar`
- Un seul `ItemList` (réutilisé partout)
- Configs dans `lib/config/modules/` (pas de folders/dossiers hardcodés dans les pages)

---

## 4. Prochaines étapes immédiates

1. **Validation** : Confirmer ce plan avant exécution.
2. **Phase 1** : Créer les types, composants génériques et configs.
3. **Phase 2** : Migrer le Centre d'alertes en module pilote.

---

## 5. Annexe — Liste des configs à créer

```
src/lib/config/modules/
├── dashboard.config.ts
├── alerts.config.ts
├── demandes.config.ts
├── validation-bc.config.ts
├── governance.config.ts
├── performance.config.ts
├── opportunities.config.ts
├── chantiers.config.ts
├── conception.config.ts      (etudes)
├── planning.config.ts
├── execution.config.ts       (suivi-execution)
├── quality.config.ts
├── receptions.config.ts      (livraisons)
├── engagements.config.ts
├── foncier.config.ts
├── achats.config.ts
├── fournisseurs.config.ts
├── conformite.config.ts
├── maintenance.config.ts
├── documents.config.ts
├── aide.config.ts
├── admin.config.ts
├── echanges.config.ts
├── conferences.config.ts
├── messages.config.ts        (déjà migré, config pour cohérence)
├── registre.config.ts
├── audit.config.ts
├── journal.config.ts
└── index.ts                  (exporte toutes les configs)
```

---

*Document généré par analyse du projet. À valider avant exécution.*
