# Analyse des Fonctionnalités Manquantes - Dashboard

## 🔍 Problème Identifié

Les **109 composants créés** sont actuellement des **squelettes** avec uniquement:
- Structure de base (KPICards, EmptyState)
- TODOs partout
- Pas de chargement de données depuis l'API
- Pas de fonctionnalités interactives

Comparé à `DemandesKpiPage.tsx` qui est un **composant complet** avec:
- ✅ Chargement de données depuis l'API
- ✅ Calculs de KPIs complexes
- ✅ Tableaux interactifs
- ✅ Graphiques et visualisations
- ✅ Modals pour détails
- ✅ Export CSV/JSON fonctionnel
- ✅ Filtres de recherche fonctionnels
- ✅ Interactions utilisateur (clics, tooltips)

---

## 📋 Fonctionnalités Manquantes par Catégorie

### 1. Chargement de Données (109 composants)

**Problème**: Tous les loaders retournent `data: {}` (vide)

**Solution nécessaire**:
- Créer les loaders API réels dans `src/modules/dashboard/api/loaders.ts`
- Connecter aux endpoints backend existants
- Implémenter la gestion d'erreurs et fallback

**Exemple**:
```typescript
// Actuel (vide)
loader: async () => ({ key: 'overview::alerts::actives', fetchedAt: Date.now(), data: {} }),

// Nécessaire
loader: async () => {
  const res = await fetch('/api/dashboard/overview/alerts/actives');
  const data = await res.json();
  return { key: 'overview::alerts::actives', fetchedAt: Date.now(), data };
},
```

---

### 2. Affichage de Listes/Tableaux (80+ composants)

**Problème**: `{/* TODO: Implémenter la liste */}` partout

**Composants nécessaires**:
- Tableaux de données avec tri, pagination
- Listes d'items avec actions
- Cards list pour affichage en grille
- Timeline/chronologie pour activités

**Exemple depuis DemandesKpiPage**:
- Tableau des blocages avec tri
- Distribution par type avec graphiques
- Performance par bureau

---

### 3. Graphiques et Visualisations (40+ composants)

**Problème**: `{/* TODO: Implémenter les graphiques */}`

**Fonctionnalités nécessaires**:
- Graphiques en barres (comparaisons)
- Graphiques linéaires (tendances)
- Graphiques circulaires (distribution)
- Sparklines dans les KPICards
- Heatmaps pour matrices

**Composants disponibles**:
- `DashboardCharts.tsx` (existe mais sous-utilisé)
- Intégration avec bibliothèque de graphiques (Recharts, Chart.js, etc.)

---

### 4. Modals et Détails (50+ composants)

**Problème**: Pas de modals pour voir les détails

**Fonctionnalités nécessaires**:
- Modals de détail (comme `BlocageDetailModal` dans DemandesKpiPage)
- Modals d'édition
- Modals de confirmation d'actions
- Drawers pour panneaux latéraux

**Exemple**:
```tsx
// Dans DemandesKpiPage
<BlocageDetailModal 
  blocage={selectedBlocage} 
  isOpen={!!selectedBlocage}
  onClose={() => setSelectedBlocage(null)}
/>
```

---

### 5. Export de Données (109 composants)

**Problème**: `onExportCSV={() => {}}` et `onExportJSON={() => {}}` vides

**Fonctionnalités nécessaires**:
- Export CSV avec en-têtes
- Export JSON formaté
- Export Excel (optionnel)
- Filtrage avant export

**Exemple depuis DemandesKpiPage**:
```typescript
const handleExportCSV = useCallback(() => {
  const headers = ['Type', 'Bureau', 'Nombre', 'Priorité'];
  const rows = filteredBlocages.map(b => [b.type, b.bureau, b.count, b.priorite]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  // ... téléchargement
}, [filteredBlocages]);
```

---

### 6. Filtres et Recherche (60+ composants)

**Problème**: `SearchFilter` présent mais non fonctionnel

**Fonctionnalités nécessaires**:
- Recherche textuelle fonctionnelle
- Filtres par date
- Filtres par catégorie/type
- Filtres par statut
- Filtres combinés (multi-critères)

**Exemple depuis DemandesKpiPage**:
```typescript
const filteredBlocages = useMemo(() => {
  if (!searchQuery.trim()) return blocages;
  const query = searchQuery.toLowerCase();
  return blocages.filter(b => 
    b.type.toLowerCase().includes(query) || 
    b.bureau.toLowerCase().includes(query)
  );
}, [searchQuery, blocages]);
```

---

### 7. Calculs et KPIs (40+ composants)

**Problème**: KPIs avec valeurs statiques `0` ou `'+0%'`

**Fonctionnalités nécessaires**:
- Calculs de KPIs depuis les données réelles
- Tendances calculées (comparaison périodes)
- Calculs de pourcentages
- Calculs de moyennes, totaux
- Formattage monétaire, dates, etc.

**Exemple depuis DemandesKpiPage**:
```typescript
const kpiCalculations = useMemo(() => {
  const leadTimeFournisseur = calculateAverageLeadTime(demandes);
  const tauxConformite = calculateConformityRate(contrats);
  const dso = calculateDSO(paiements);
  return { leadTimeFournisseur, tauxConformite, dso };
}, [demandes, contrats, paiements]);
```

---

### 8. Interactions Utilisateur (80+ composants)

**Problème**: Pas d'interactions (clics, hover, etc.)

**Fonctionnalités nécessaires**:
- Clics sur KPICards pour filtrer/naviguer
- Hover pour tooltips avec détails
- Actions sur items (valider, rejeter, etc.)
- Drag & drop (si applicable)
- Sélection multiple

**Exemple depuis DemandesKpiPage**:
```typescript
const handleKPIClick = useCallback((kpi: DemandeKPI) => {
  // Navigation ou filtrage basé sur le KPI cliqué
  openModal('kpi-detail', { kpi });
}, [openModal]);
```

---

### 9. États de Chargement et Erreurs (109 composants)

**Problème**: Pas de gestion d'états de chargement

**Fonctionnalités nécessaires**:
- Skeleton loaders pendant le chargement
- Gestion des erreurs API
- Retry automatique
- Messages d'erreur utilisateur-friendly

---

### 10. Pagination et Virtualisation (30+ composants)

**Problème**: Pas de pagination pour grandes listes

**Fonctionnalités nécessaires**:
- Pagination côté client
- Pagination côté serveur
- Virtualisation pour très grandes listes
- Infinite scroll (optionnel)

---

## 🎯 Plan d'Implémentation Priorisé

### Phase 1 - Fondations (Priorité Critique)

1. **Loaders API Réels** (109 composants)
   - Créer tous les loaders dans `api/loaders.ts`
   - Connecter aux endpoints backend
   - Gestion d'erreurs

2. **Composants de Liste/Tableau Réutilisables**
   - Créer `DataTable` générique
   - Créer `CardList` générique
   - Créer `TimelineList` pour activités

### Phase 2 - Fonctionnalités Core (Priorité Haute)

3. **Export Fonctionnel** (109 composants)
   - Implémenter export CSV/JSON dans tous les composants
   - Utiliser les données filtrées

4. **Recherche et Filtres** (60+ composants)
   - Implémenter recherche textuelle
   - Ajouter filtres par type/statut/date

5. **Calculs de KPIs** (40+ composants)
   - Calculer KPIs depuis données réelles
   - Calculer tendances

### Phase 3 - Interactivité (Priorité Moyenne)

6. **Modals de Détail** (50+ composants)
   - Créer modals génériques
   - Implémenter dans composants nécessaires

7. **Graphiques** (40+ composants)
   - Intégrer bibliothèque de graphiques
   - Créer composants graphiques réutilisables

8. **Interactions** (80+ composants)
   - Ajouter clics sur KPIs
   - Ajouter tooltips
   - Ajouter actions sur items

### Phase 4 - Optimisations (Priorité Basse)

9. **Pagination** (30+ composants)
10. **États de chargement avancés** (109 composants)
11. **Virtualisation** (10+ composants avec très grandes listes)

---

## 📊 Estimation

- **Composants à compléter**: 109
- **Fonctionnalités par composant**: 3-8 en moyenne
- **Total fonctionnalités manquantes**: ~500-800

**Temps estimé**:
- Phase 1: 2-3 semaines
- Phase 2: 3-4 semaines
- Phase 3: 2-3 semaines
- Phase 4: 1-2 semaines

**Total**: ~8-12 semaines pour compléter toutes les fonctionnalités

---

## 🚀 Actions Immédiates Recommandées

1. **Créer les loaders API** pour les composants les plus critiques (Alerts, Actions, Validations)
2. **Créer composants réutilisables** (DataTable, CardList, Modal générique)
3. **Implémenter export** dans les composants prioritaires
4. **Ajouter recherche/filtres** dans les composants avec listes

---

**Date**: 2026-01-27  
**Statut**: Analyse complète des fonctionnalités manquantes
