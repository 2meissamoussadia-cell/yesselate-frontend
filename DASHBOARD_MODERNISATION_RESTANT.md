# 📋 Dashboard Modernisation — Ce qui reste à faire

## ✅ **Déjà complété**

1. ✅ **Shell principal** (`app/(portals)/maitre-ouvrage/dashboard/page.tsx`)
   - Header moderne avec breadcrumbs
   - KPI bar responsive avec recherche, refresh, export
   - Layout responsive avec `clamp()`
   - Mapping des icônes KPI avec `getKPIMappingByLabel`

2. ✅ **Pages modernisées avec `clamp()`**
   - `OverviewPage.tsx` — Vue d'ensemble exécutive
   - `KpiOverviewPage.tsx` — Vue d'ensemble des KPIs
   - `EmptyState.tsx` — État vide réutilisable

3. ✅ **Composants partagés**
   - `DashboardPageShell.tsx` — Conteneur standardisé avec `clamp()`
   - `DashboardPanel.tsx` — Panel sobre
   - `DashboardKPIBar.tsx` — Barre KPI modernisée

4. ✅ **Corrections**
   - Toutes les erreurs de build corrigées
   - Imports et types corrigés
   - Props des composants alignées

---

## 🔄 **À faire — Application de `clamp()` pour responsivité**

### **Priorité 1 : Pages KPI principales** (impact utilisateur élevé)

#### 1. **BudgetKpiPage.tsx**
- [ ] Appliquer `clamp()` aux tailles de texte (`text-base`, `text-lg`, etc.)
- [ ] Appliquer `clamp()` aux padding (`px-4 py-4`, `px-5 py-5`, etc.)
- [ ] Appliquer `clamp()` aux gaps (`gap-3`, `gap-4`, `gap-6`)
- [ ] Appliquer `clamp()` aux icônes (taille fixe → responsive)
- [ ] Tester à différents niveaux de zoom (50%, 75%, 125%, 150%)

#### 2. **DemandesKpiPage.tsx**
- [ ] Appliquer `clamp()` aux tailles de texte
- [ ] Appliquer `clamp()` aux padding et gaps
- [ ] Appliquer `clamp()` aux icônes
- [ ] Vérifier la cohérence avec les autres pages

#### 3. **ProjetKpiPage.tsx**
- [ ] Appliquer `clamp()` aux tailles de texte
- [ ] Appliquer `clamp()` aux padding et gaps
- [ ] Appliquer `clamp()` aux icônes
- [ ] Optimiser les cartes de projets (virtualisation déjà présente)

### **Priorité 2 : Pages de synthèse et tendances**

#### 4. **HighlightsKpiPage.tsx**
- [ ] Appliquer `clamp()` aux tailles de texte
- [ ] Appliquer `clamp()` aux padding et gaps
- [ ] Appliquer `clamp()` aux icônes
- [ ] Vérifier les badges et indicateurs

#### 5. **TendancesPage.tsx**
- [ ] Appliquer `clamp()` aux tailles de texte
- [ ] Appliquer `clamp()` aux padding et gaps
- [ ] Appliquer `clamp()` aux icônes
- [ ] Vérifier les graphiques (Recharts) — peut nécessiter des ajustements

#### 6. **SummaryPointsPage.tsx**
- [ ] Appliquer `clamp()` aux tailles de texte
- [ ] Appliquer `clamp()` aux padding et gaps
- [ ] Appliquer `clamp()` aux icônes
- [ ] Vérifier les groupes d'indicateurs

### **Priorité 3 : Pages complexes**

#### 7. **BureauxPage.tsx** (⚠️ Fichier volumineux ~1800 lignes)
- [ ] Appliquer `clamp()` aux tailles de texte
- [ ] Appliquer `clamp()` aux padding et gaps
- [ ] Appliquer `clamp()` aux icônes
- [ ] Vérifier les tableaux et vues (grid/list)
- [ ] Optimiser les performances si nécessaire

#### 8. **ValidationsGlobalPage.tsx** (⚠️ Placeholder actuellement)
- [ ] Implémenter le contenu réel (KPIs, validations, goulets)
- [ ] Appliquer `clamp()` dès l'implémentation
- [ ] Suivre le même pattern que les autres pages

---

## 🔍 **Vérifications et optimisations**

### **Composants partagés à vérifier**

1. **KPICard** (`@/components/features/bmo/dashboard/components/KPICard.tsx`)
   - [ ] Vérifier si `clamp()` est nécessaire pour les tailles
   - [ ] Vérifier la cohérence avec les autres composants

2. **SectionTitle** (`@/components/features/bmo/dashboard/components/SectionTitle.tsx`)
   - [ ] Vérifier si `clamp()` est nécessaire

3. **Autres composants partagés**
   - [ ] Vérifier `DataCard`, `RiskScoreCard`, `ActionItem`, etc.

### **Tests de responsivité**

- [ ] Tester à 50% de zoom (affichage très compact)
- [ ] Tester à 75% de zoom
- [ ] Tester à 100% de zoom (normal)
- [ ] Tester à 125% de zoom
- [ ] Tester à 150% de zoom (affichage agrandi)
- [ ] Tester sur différentes résolutions d'écran

### **Cohérence visuelle**

- [ ] Vérifier que toutes les pages utilisent le même système de spacing
- [ ] Vérifier la cohérence des tailles de police
- [ ] Vérifier la cohérence des couleurs et badges
- [ ] Vérifier la cohérence des icônes

---

## 📝 **Pattern à suivre pour `clamp()`**

### **Tailles de texte**
```tsx
// Avant
className="text-base"
className="text-lg"
className="text-xl"

// Après
style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}  // text-base
style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }} // text-lg
style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }} // text-xl
```

### **Padding**
```tsx
// Avant
className="p-4 sm:p-5"

// Après
style={{ padding: 'clamp(1rem, 1.5vw, 1.25rem)' }}
```

### **Gaps**
```tsx
// Avant
className="gap-3 sm:gap-4"

// Après
style={{ gap: 'clamp(0.75rem, 1vw, 1rem)' }}
```

### **Icônes**
```tsx
// Avant
<Icon className="h-4 w-4" />

// Après
<Icon style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
```

---

## 🎯 **Ordre de priorité recommandé**

1. **BudgetKpiPage** (page importante, structure claire)
2. **DemandesKpiPage** (page importante, structure claire)
3. **ProjetKpiPage** (page importante, déjà optimisée avec virtualisation)
4. **HighlightsKpiPage** (synthèse stratégique)
5. **SummaryPointsPage** (points clés)
6. **TendancesPage** (graphiques à vérifier)
7. **BureauxPage** (fichier volumineux, nécessite plus de temps)
8. **ValidationsGlobalPage** (à implémenter complètement)

---

## 📊 **Estimation**

- **Pages simples** (Budget, Demandes, Projet) : ~30-45 min chacune
- **Pages moyennes** (Highlights, SummaryPoints, Tendances) : ~45-60 min chacune
- **BureauxPage** (complexe) : ~1.5-2h
- **ValidationsGlobalPage** (implémentation) : ~1-1.5h
- **Tests et vérifications** : ~1h

**Total estimé** : ~6-8 heures de travail

---

## 🚀 **Prochaines étapes**

1. Commencer par **BudgetKpiPage** (priorité 1, structure claire)
2. Continuer avec **DemandesKpiPage** et **ProjetKpiPage**
3. Puis les pages de synthèse
4. Enfin **BureauxPage** et **ValidationsGlobalPage**

---

*Dernière mise à jour : 2026-01-23*
