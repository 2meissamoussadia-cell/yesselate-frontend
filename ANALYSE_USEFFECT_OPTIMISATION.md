# Analyse et Optimisation des useEffect - Dashboard

**Date**: 2026-01-23  
**Objectif**: Réduire de 24 à ~10-12 useEffect optimisés

---

## 📊 Analyse des 24 useEffect

### Groupe 1: Logging & Debug (2 useEffect) - ✅ Peuvent être fusionnés

1. **Ligne 273**: Log navigation (dev uniquement)
   - Dépendances: `navigationKeyForLog`, `main`, `sub`, `leaf`
   - Impact: Faible (dev uniquement)

2. **Ligne 331**: Log render avec navigation (dev uniquement)
   - Dépendances: `navigationKey`, `main`, `sub`, `leaf`
   - Impact: Faible (dev uniquement)

**Optimisation**: Fusionner en 1 seul useEffect avec guard dev

---

### Groupe 2: Synchronisation Refs (3 useEffect) - ✅ Peuvent être optimisés

3. **Ligne 365**: Synchroniser `refetchKPIsFromAPIRef`
   - Dépendances: `refetchKPIsFromAPI`
   - Impact: Moyen

4. **Ligne 637**: Synchroniser `refreshStatusRef`
   - Dépendances: `refreshStatus`
   - Impact: Moyen

5. **Ligne 642**: Marquer composant monté/démonté
   - Dépendances: Aucune
   - Impact: Critique (cleanup)

**Optimisation**: Garder séparés (responsabilités différentes)

---

### Groupe 3: Gestion KPIs (4 useEffect) - ⚠️ À optimiser

6. **Ligne 462**: Mettre à jour `lastUpdate` depuis API
   - Dépendances: `apiLastUpdate`
   - Impact: Moyen

7. **Ligne 470**: Persister `kpiFilter` dans localStorage
   - Dépendances: `kpiFilter`
   - Impact: Faible

8. **Ligne 490**: Debounce `kpiFilter`
   - Dépendances: `kpiFilter`
   - Impact: Moyen

9. **Ligne 572**: Détecter changements KPIs et créer notifications
   - Dépendances: `currentKpisKey`, `allKpis`
   - Impact: Élevé (calculs coûteux)

**Optimisation**: 
- Fusionner 7 et 8 (debounce + localStorage)
- Optimiser 9 avec meilleure mémorisation

---

### Groupe 4: Performance & Metrics (1 useEffect) - ✅ OK

10. **Ligne 520**: Mesurer temps de rendu
    - Dépendances: `main`, `sub`, `leaf`
    - Impact: Faible (dev uniquement)

**Optimisation**: Garder tel quel

---

### Groupe 5: Auto-refresh & Intervalles (6+ useEffect) - ⚠️ À consolider

11-16. **Plusieurs useEffect** pour gérer:
    - Auto-refresh avec pause si onglet invisible
    - Gestion réseau (online/offline)
    - Intervalles de refresh
    - Retry logic

**Optimisation**: Créer un hook personnalisé `useAutoRefresh`

---

### Groupe 6: Keyboard Shortcuts (2+ useEffect) - ✅ Peuvent être fusionnés

17-18. **Gestion raccourcis clavier**
    - Dépendances: Diverses
    - Impact: Moyen

**Optimisation**: Fusionner en 1 seul useEffect

---

### Groupe 7: Cleanup & Lifecycle (3+ useEffect) - ✅ OK

19-21. **Cleanup timers, timeouts, etc.**
    - Dépendances: Aucune ou minimales
    - Impact: Critique

**Optimisation**: Garder séparés (sécurité)

---

## 🎯 Plan d'Optimisation

### Phase 1: Fusionner les effets simples (2 J/H)

1. **Fusionner logging** (0.5 J/H)
   - Combiner les 2 useEffect de logging
   - Garder guard dev uniquement

2. **Fusionner debounce + localStorage** (0.5 J/H)
   - Combiner useEffect 7 et 8
   - Créer hook `useDebouncedLocalStorage`

3. **Fusionner keyboard shortcuts** (1 J/H)
   - Combiner les useEffect de raccourcis
   - Créer hook `useKeyboardShortcuts`

### Phase 2: Extraire hooks personnalisés (3 J/H)

4. **Créer `useAutoRefresh`** (2 J/H)
   - Extraire toute la logique auto-refresh
   - Gérer intervalles, pause, retry
   - Réduire de 6 à 1 useEffect

5. **Créer `useKPINotifications`** (1 J/H)
   - Extraire logique détection changements KPIs
   - Optimiser avec meilleure mémorisation

### Phase 3: Optimiser dépendances (1 J/H)

6. **Optimiser dépendances restantes** (1 J/H)
   - Vérifier toutes les dépendances
   - Utiliser `useRef` où approprié
   - Mémoriser les valeurs stables

---

## 📊 Résultat Attendu

**Avant**: 24 useEffect  
**Après**: ~10-12 useEffect optimisés

**Bénéfices**:
- ✅ Moins de re-renders
- ✅ Code plus maintenable
- ✅ Performance améliorée
- ✅ Moins de risques de boucles

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 **EN COURS**
