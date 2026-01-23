# 🔍 AUDIT COMPLET - Refonte Conférences

**Date**: 10 janvier 2026  
**Statut**: Architecture créée ✅ | Composants manquants ❌  
**Priorité**: CRITIQUE

---

## ✅ COMPOSANTS CRÉÉS

1. ✅ **Store** - `conferencesCommandCenterStore.ts`
2. ✅ **Sidebar** - `ConferencesCommandSidebar.tsx`
3. ✅ **SubNavigation** - `ConferencesSubNavigation.tsx`
4. ✅ **KPIBar** - `ConferencesKPIBar.tsx`
5. ✅ **ContentRouter** - `ConferencesContentRouter.tsx` (basique)
6. ✅ **CommandPalette** - `ConferencesCommandPalette.tsx`
7. ✅ **ActionsMenu** - `ActionsMenu.tsx`
8. ✅ **Page refactorisée** - `conferences/page.tsx`

---

## ❌ COMPOSANTS MANQUANTS (Critiques)

### 1. **ConferencesModals** ❌ CRITIQUE

**Référence**: `src/components/features/bmo/analytics/command-center/AnalyticsModals.tsx`

**Problème**: Pas de wrapper centralisé pour gérer tous les modals

**Modals nécessaires**:

| Type | Description | Statut |
|------|-------------|--------|
| `create` | Créer nouvelle conférence | ❌ Manquant |
| `detail` | Détails conférence (overlay) | ❌ Manquant |
| `export` | Exporter données | ❌ Manquant |
| `filters` | Filtres avancés | ❌ Manquant |
| `stats` | Statistiques | ❌ Manquant |
| `settings` | Paramètres | ❌ Manquant |
| `shortcuts` | Raccourcis clavier | ❌ Manquant |
| `confirm` | Confirmations | ❌ Manquant |

**Structure nécessaire**:
```tsx
export function ConferencesModals() {
  const { modal, closeModal } = useConferencesCommandCenterStore();
  
  if (!modal.isOpen || !modal.type) return null;
  
  switch (modal.type) {
    case 'create':
      return <ConferenceCreateModal open={true} onClose={closeModal} />;
    case 'detail':
      return <ConferenceDetailModal open={true} onClose={closeModal} conferenceId={modal.data?.conferenceId} />;
    case 'export':
      return <ConferenceExportModal open={true} onClose={closeModal} />;
    // ... autres
  }
}
```

---

### 2. **ConferenceDetailModal** ❌ CRITIQUE

**Référence**: Pattern modal overlay (tickets-clients)

**Problème**: Pas de modal overlay pour afficher les détails d'une conférence

**Pattern nécessaire**: 
- Modal overlay (comme tickets) plutôt que navigation
- Préservation du contexte de la liste
- Navigation prev/next entre conférences
- Tabs multiples

**Tabs nécessaires**:

| Tab | Contenu |
|-----|---------|
| **Infos** | Titre, type, statut, priorité, date/heure, durée, lieu, contexte lié |
| **Agenda** | Ordre du jour avec items, décisions requises, résultats |
| **Participants** | Liste participants, présence, rôles, bureau |
| **Compte-rendu** | CR généré/validé, points clés, décisions, actions |
| **Documents** | Pièces jointes, enregistrements, transcriptions |
| **Historique** | Timeline des événements, modifications, actions |
| **Visioconférence** | Lien visio, intégration, enregistrement |

**Actions nécessaires**:
- 🔗 Rejoindre (si planifiée/en cours)
- 📋 Copier lien visio
- 🤖 Générer CR (IA)
| ✅ Valider CR
- 📤 Extraire décisions
- ✏️ Éditer
- 🗑️ Supprimer
- 📥 Exporter
- 📤 Partager

**Navigation prev/next**:
```tsx
const handlePrev = () => {
  const currentIndex = conferences.findIndex(c => c.id === conferenceId);
  const prevId = conferences[currentIndex - 1]?.id;
  if (prevId) openModal('detail', { conferenceId: prevId });
};

const handleNext = () => {
  const currentIndex = conferences.findIndex(c => c.id === conferenceId);
  const nextId = conferences[currentIndex + 1]?.id;
  if (nextId) openModal('detail', { conferenceId: nextId });
};
```

---

### 3. **ConferencesDetailPanel** ❌ CRITIQUE

**Référence**: `src/components/features/bmo/analytics/command-center/AnalyticsDetailPanel.tsx`

**Problème**: Pas de panel latéral pour vue rapide

**Fonctionnalités nécessaires**:
- Vue rapide d'une conférence (sans quitter la liste)
- Informations essentielles: titre, statut, date, participants count
- Actions rapides: Rejoindre, Copier lien, Ouvrir en modal complète
- Bouton "Ouvrir en modal complète" → `openModal('detail', { conferenceId })`

**Structure**:
```tsx
export function ConferencesDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useConferencesCommandCenterStore();
  
  if (!detailPanel.isOpen) return null;
  
  const conference = conferences.find(c => c.id === detailPanel.entityId);
  
  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-40">
      {/* Header, Content, Actions */}
      <Button onClick={() => {
        openModal('detail', { conferenceId: conference.id });
        closeDetailPanel();
      }}>
        Ouvrir en modal complète
      </Button>
    </div>
  );
}
```

---

### 4. **ConferencesBatchActionsBar** ❌ CRITIQUE

**Référence**: `src/components/features/bmo/analytics/command-center/AnalyticsBatchActionsBar.tsx`

**Problème**: Pas de barre d'actions en masse

**Fonctionnalités nécessaires**:
- Affichage quand `selectedItems.length > 0`
- Compteur d'items sélectionnés
- Actions batch:
  - 📥 Exporter
  - 🗑️ Supprimer
  - 📤 Partager
  - 🏷️ Étiqueter
  - 📦 Archiver
  - ✅ Marquer terminé

**Intégration dans la page**:
```tsx
// Dans conferences/page.tsx
const { selectedItems, clearSelection } = useConferencesCommandCenterStore();

const handleBatchAction = (actionId: string, ids: string[]) => {
  switch (actionId) {
    case 'export':
      openModal('export', { selectedIds: ids });
      break;
    case 'delete':
      // Confirmation puis suppression
      break;
    // ... autres
  }
};

// Dans le JSX
<ConferencesBatchActionsBar onAction={handleBatchAction} />
```

---

### 5. **ConferencesFiltersPanel** ⚠️ RECOMMANDÉ

**Référence**: `src/components/features/bmo/analytics/command-center/AnalyticsFiltersPanel.tsx`

**Problème**: Pas de panneau de filtres avancés

**Filtres nécessaires**:
- 📅 Date range (start/end)
- 📊 Statuts (planifiée, en cours, terminée, annulée)
- 🎯 Types (crise, arbitrage, revue_projet, etc.)
- ⚡ Priorités (normale, haute, urgente, critique)
- 🏢 Bureaux (multi-select)
- 👥 Participants (recherche)
- 🏷️ Tags (multi-select)
- 📝 Recherche texte (titre, ID, contexte)

---

### 6. **ContentRouter - Logique Métier** ❌ CRITIQUE

**Problème**: ContentRouter très basique, pas de vraie logique métier

**Actuellement**:
```tsx
function OverviewView() {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Vue d'ensemble</h2>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
}
```

**Nécessaire**:
- Liste réelle des conférences
- Filtrage selon catégorie/sous-catégorie
- Sélection d'items
- Ouverture detail panel/modal
- Actions (rejoindre, copier lien, etc.)
- Statistiques par vue
- Grid/List view toggle
- Tri et recherche

**Exemple pour PlannedView**:
```tsx
function PlannedView({ subCategory }: { subCategory: string | null }) {
  const { openDetailPanel, openModal } = useConferencesCommandCenterStore();
  const conferences = useConferences(); // Hook API
  
  const filtered = useMemo(() => {
    let result = conferences.filter(c => c.status === 'planifiee');
    
    if (subCategory === 'soon') {
      const nowMs = Date.now();
      const DAY_MS = 24 * 60 * 60 * 1000;
      result = result.filter(c => {
        const d = new Date(c.scheduledAt);
        const delta = d.getTime() - nowMs;
        return delta > 0 && delta <= DAY_MS;
      });
    }
    // ... autres filtres
    
    return result;
  }, [conferences, subCategory]);
  
  return (
    <div className="p-6">
      <ConferenceListView
        conferences={filtered}
        onSelect={(id) => openDetailPanel('conference', id)}
        onOpenDetail={(id) => openModal('detail', { conferenceId: id })}
      />
    </div>
  );
}
```

---

## 📡 APIs / HOOKS MANQUANTS

### 1. **Hooks API** ❌

**Référence**: `src/lib/api/hooks/useAnalytics.tsx`

**Hooks nécessaires**:

```tsx
// src/lib/api/hooks/useConferences.ts

export function useConferences(filters?: ConferenceFilters) {
  return useQuery({
    queryKey: ['conferences', filters],
    queryFn: () => conferencesApi.getConferences(filters),
  });
}

export function useConference(id: string | null) {
  return useQuery({
    queryKey: ['conference', id],
    queryFn: () => conferencesApi.getConference(id!),
    enabled: !!id,
  });
}

export function useConferenceStats() {
  return useQuery({
    queryKey: ['conferences', 'stats'],
    queryFn: () => conferencesApi.getStats(),
  });
}

export function useCreateConference() {
  return useMutation({
    mutationFn: (data: CreateConferenceDto) => conferencesApi.create(data),
  });
}

export function useUpdateConference() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConferenceDto }) =>
      conferencesApi.update(id, data),
  });
}

export function useDeleteConference() {
  return useMutation({
    mutationFn: (id: string) => conferencesApi.delete(id),
  });
}

export function useJoinConference() {
  return useMutation({
    mutationFn: (id: string) => conferencesApi.join(id),
  });
}

export function useGenerateSummary() {
  return useMutation({
    mutationFn: (id: string) => conferencesApi.generateSummary(id),
  });
}

export function useValidateSummary() {
  return useMutation({
    mutationFn: ({ id, summaryId }: { id: string; summaryId: string }) =>
      conferencesApi.validateSummary(id, summaryId),
  });
}

export function useExtractDecisions() {
  return useMutation({
    mutationFn: (id: string) => conferencesApi.extractDecisions(id),
  });
}
```

---

### 2. **Service API** ❌

**Référence**: `src/lib/services/analyticsApiService.ts`

**Service nécessaire**:

```tsx
// src/lib/services/conferencesApiService.ts

export const conferencesApi = {
  // GET
  getConferences: async (filters?: ConferenceFilters): Promise<Conference[]> => {
    // Appel API réel
  },
  
  getConference: async (id: string): Promise<Conference> => {
    // Appel API réel
  },
  
  getStats: async (): Promise<ConferenceStats> => {
    // Appel API réel
  },
  
  // POST
  create: async (data: CreateConferenceDto): Promise<Conference> => {
    // Appel API réel
  },
  
  // PATCH
  update: async (id: string, data: UpdateConferenceDto): Promise<Conference> => {
    // Appel API réel
  },
  
  // DELETE
  delete: async (id: string): Promise<void> => {
    // Appel API réel
  },
  
  // Actions
  join: async (id: string): Promise<{ url: string }> => {
    // Appel API réel
  },
  
  generateSummary: async (id: string): Promise<ConferenceSummary> => {
    // Appel API réel
  },
  
  validateSummary: async (id: string, summaryId: string): Promise<void> => {
    // Appel API réel
  },
  
  extractDecisions: async (id: string): Promise<Decision[]> => {
    // Appel API réel
  },
};
```

---

### 3. **Mock Data Complet** ⚠️

**Référence**: `src/lib/data/bmo-mock-6.ts`

**Problème**: Mock data existant mais peut être enrichi

**Améliorations nécessaires**:
- Plus d'exemples de conférences (20-30)
- Différents statuts, types, priorités
- Participants variés
- Comptes-rendus générés
- Décisions extraites
- Enregistrements et transcriptions
- Différentes dates (passées, futures, aujourd'hui)

---

## 🎨 COMPOSANTS UI MANQUANTS

### 1. **ConferenceListItem / ConferenceCard** ❌

**Fonctionnalités**:
- Affichage conférence dans liste/grid
- Sélection checkbox
- Actions rapides (hover)
- Badges (statut, priorité, type)
- Indicateurs visuels (bientôt, en retard, critique)
- Clic → `openDetailPanel` ou `openModal`

---

### 2. **ConferenceCreateModal** ❌

**Champs nécessaires**:
- Titre
- Type (dropdown)
- Priorité (dropdown)
- Date/heure (datepicker + timepicker)
- Durée (minutes)
- Lieu (visio/présentiel/hybride)
- Contexte lié (recherche + sélection)
- Participants (multi-select avec recherche)
- Ordre du jour (optionnel, auto-généré sinon)

---

### 3. **ConferenceExportModal** ❌

**Formats**:
- Excel
- PDF
- CSV
- JSON

**Options**:
- Plage de dates
- Filtres appliqués
- Colonnes à inclure
- Inclure participants
- Inclure comptes-rendus

---

## 🔄 INTÉGRATION DANS LA PAGE

### Problèmes actuels:

1. ❌ **selectedItems non utilisé** - Pas de sélection d'items
2. ❌ **BatchActionsBar non intégré** - Pas de barre d'actions
3. ❌ **DetailPanel non intégré** - Pas de panel latéral
4. ❌ **Modals non intégrés** - Pas de wrapper modals
5. ❌ **ContentRouter basique** - Pas de vraie logique

### Nécessaire dans `conferences/page.tsx`:

```tsx
// Ajouter dans le JSX
<ConferencesModals />
<ConferencesDetailPanel />
<ConferencesBatchActionsBar onAction={handleBatchAction} />

// Ajouter handlers
const handleBatchAction = (actionId: string, ids: string[]) => {
  // Logique batch actions
};

const handleConferenceClick = (id: string) => {
  openDetailPanel('conference', id);
};

const handleConferenceDoubleClick = (id: string) => {
  openModal('detail', { conferenceId: id });
};
```

---

## 📊 SOUS-ONGlets - DÉTAILS

### Vue d'ensemble (overview)
- ✅ `all` - Toutes les conférences
- ✅ `summary` - Résumé/Stats
- ✅ `highlights` - Points clés (à implémenter)

### Planifiées (planned)
- ✅ `all` - Toutes planifiées
- ✅ `soon` - Bientôt (< 24h) (à filtrer)
- ✅ `today` - Aujourd'hui (à filtrer)
- ✅ `week` - Cette semaine (à filtrer)

### En cours (ongoing)
- ✅ `all` - Toutes en cours
- ✅ `active` - Actives (à filtrer)
- ✅ `starting` - En début (à filtrer)

### Terminées (completed)
- ✅ `all` - Toutes terminées
- ✅ `recent` - Récentes (à filtrer)
- ✅ `with-summary` - Avec CR (à filtrer)

**Statut**: Sous-onglets définis ✅ | Logique de filtrage à implémenter ❌

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### 🔴 CRITIQUE (À faire en premier)

1. **ConferenceDetailModal** - Modal overlay complet avec tabs
2. **ConferencesDetailPanel** - Panel latéral pour vue rapide
3. **ConferencesBatchActionsBar** - Barre d'actions en masse
4. **ConferencesModals** - Wrapper pour tous les modals
5. **ContentRouter** - Logique métier réelle (liste, filtrage, sélection)

### 🟡 IMPORTANT (Après critiques)

6. **ConferenceCreateModal** - Création conférence
7. **ConferencesFiltersPanel** - Filtres avancés
8. **ConferenceExportModal** - Export
9. **Hooks API** - React Query hooks
10. **Service API** - API service layer

### 🟢 RECOMMANDÉ (Améliorations)

11. **Mock data enrichi** - Plus d'exemples
12. **ConferenceListItem** - Composant réutilisable
13. **Stats modals** - Statistiques détaillées
14. **Settings modal** - Paramètres
15. **Shortcuts modal** - Aide raccourcis

---

## 📝 CHECKLIST FINALE

### Architecture ✅
- [x] Store créé
- [x] Sidebar créée
- [x] SubNavigation créée
- [x] KPIBar créée
- [x] ContentRouter créé (basique)
- [x] CommandPalette créée
- [x] Page refactorisée

### Composants critiques ❌
- [ ] ConferencesModals
- [ ] ConferenceDetailModal (overlay)
- [ ] ConferencesDetailPanel
- [ ] ConferencesBatchActionsBar
- [ ] ConferenceCreateModal
- [ ] ConferencesFiltersPanel
- [ ] ConferenceExportModal

### Logique métier ❌
- [ ] ContentRouter avec vraie logique
- [ ] Filtrage par sous-onglets
- [ ] Sélection d'items
- [ ] Actions batch
- [ ] Navigation prev/next dans modal

### APIs ❌
- [ ] Hooks React Query
- [ ] Service API
- [ ] Mock data enrichi

### Intégration ❌
- [ ] Modals intégrés dans page
- [ ] DetailPanel intégré
- [ ] BatchActionsBar intégré
- [ ] Handlers d'actions
- [ ] Sélection d'items fonctionnelle

---

## 🎯 PROCHAINES ÉTAPES

1. **Créer ConferenceDetailModal** (pattern overlay)
2. **Créer ConferencesDetailPanel** (vue rapide)
3. **Créer ConferencesBatchActionsBar** (actions en masse)
4. **Créer ConferencesModals** (wrapper)
5. **Enrichir ContentRouter** (logique métier)
6. **Créer hooks API** (React Query)
7. **Intégrer dans page** (modals, panels, handlers)

---

**Note**: Cette architecture est prête pour l'implémentation. Les composants critiques doivent être créés pour avoir une expérience utilisateur complète et cohérente avec Analytics/Gouvernance.








