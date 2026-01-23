# Optimisations Prioritaires - Dashboard

**Date**: 2026-01-23  
**Statut**: 🚧 **EN COURS**

---

## 🎯 Objectif

Optimiser les performances du dashboard en :
1. Réduisant le nombre de `useEffect` (24 actuellement)
2. Virtualisant les listes longues si nécessaire
3. Mémorisant les calculs coûteux

---

## 📊 Analyse Actuelle

### 1. Nombre de useEffect : **24** ⚠️

**Problème** : Trop de `useEffect` interdépendants peuvent causer :
- Boucles de rendu
- Re-renders en cascade
- Difficulté de maintenance

**Solution** : Consolider et optimiser les dépendances

### 2. Listes à Virtualiser

**DashboardKPIBar** :
- Affichage en grille responsive
- Si >50 KPIs → virtualisation recommandée
- Actuellement : `.map()` simple

**Autres listes** :
- À identifier dans les vues (SummaryPointsPage, KpiOverviewPage, etc.)

### 3. Calculs Non Mémorisés

**À identifier** :
- Calculs dans les `useMemo` existants
- Nouvelles opportunités de mémorisation

---

## 📋 Plan d'Action

### Phase 1: Optimiser useEffect (4 J/H)

#### 1.1 Analyser les useEffect (1 J/H)
- [ ] Lister tous les useEffect
- [ ] Identifier les dépendances instables
- [ ] Détecter les effets redondants

#### 1.2 Consolider les effets (2 J/H)
- [ ] Fusionner les effets liés
- [ ] Optimiser les dépendances
- [ ] Utiliser `useRef` pour les valeurs stables

#### 1.3 Tester et valider (1 J/H)
- [ ] Vérifier non-régression
- [ ] Mesurer l'impact performance

### Phase 2: Virtualiser Listes (2 J/H)

#### 2.1 Identifier les listes longues (0.5 J/H)
- [ ] DashboardKPIBar (>50 items)
- [ ] Autres vues avec listes

#### 2.2 Implémenter virtualisation (1 J/H)
- [ ] Installer `@tanstack/react-virtual` si nécessaire
- [ ] Virtualiser DashboardKPIBar si >50 items
- [ ] Tester avec différentes tailles d'écran

#### 2.3 Optimiser le rendu (0.5 J/H)
- [ ] Mémoriser les items virtuels
- [ ] Optimiser les calculs de taille

### Phase 3: Mémorisation (2 J/H)

#### 3.1 Identifier les calculs coûteux (0.5 J/H)
- [ ] Analyser les `useMemo` existants
- [ ] Détecter les nouveaux calculs à mémoriser

#### 3.2 Optimiser les calculs (1 J/H)
- [ ] Ajouter `useMemo` où nécessaire
- [ ] Optimiser les dépendances
- [ ] Utiliser `useCallback` pour les handlers

#### 3.3 Valider (0.5 J/H)
- [ ] Mesurer l'impact
- [ ] Vérifier non-régression

---

## ✅ Prochaines Étapes

1. **Analyser les 24 useEffect** dans `page.tsx`
2. **Identifier les opportunités de consolidation**
3. **Implémenter les optimisations**

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 **EN COURS**
