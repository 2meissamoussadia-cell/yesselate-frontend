# 🔄 Migration vers useAutoRefresh - Dashboard

**Date**: 2026-01-23  
**Statut**: ✅ **MIGRATION EN COURS**

---

## 📋 Changements Appliqués

### 1. ✅ Utilisation du hook useAutoRefresh

**Avant**:
- Implémentation manuelle de l'auto-refresh
- Gestion manuelle de `isOnline` et `isTabVisible`
- `useEffect` séparés pour les événements réseau et la visibilité
- `refreshIntervalRef` pour gérer l'intervalle

**Après**:
- ✅ Utilisation du hook `useAutoRefresh`
- ✅ Hook gère automatiquement `isOnline` et `isTabVisible`
- ✅ Hook gère les intervalles et la pause intelligente
- ✅ Code simplifié et plus maintenable

**Code avant**:
```tsx
// États manuels
const [isOnline, setIsOnline] = useState(...);
const [isTabVisible, setIsTabVisible] = useState(...);
const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

// useEffect pour refresh périodique
useEffect(() => {
  if (refreshIntervalRef.current) {
    clearInterval(refreshIntervalRef.current);
  }
  if (!autoRefreshEnabled || !isOnline || !isTabVisible) return;
  
  refreshIntervalRef.current = setInterval(() => {
    // Logique de refresh
  }, refreshInterval);
  
  return () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };
}, [autoRefreshEnabled, refreshInterval, isTabVisible, isOnline]);

// useEffect pour événements réseau
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

**Code après**:
```tsx
// ✅ Utiliser le hook useAutoRefresh
const { isOnline, isTabVisible } = useAutoRefresh({
  enabled: autoRefreshEnabled,
  interval: refreshInterval,
  onRefresh: refreshKPIs,
  onStatusChange: (status: 'idle' | 'paused') => {
    if (status === 'paused') {
      setRefreshStatus('paused');
    } else {
      setRefreshStatus('idle');
    }
  },
});
```

---

### 2. ✅ Suppression du code manuel

**Supprimé**:
- ✅ `refreshIntervalRef` (géré par le hook)
- ✅ `useEffect` pour refresh périodique (géré par le hook)
- ✅ `useEffect` pour événements réseau (géré par le hook)
- ✅ États manuels `isOnline` et `isTabVisible` (retournés par le hook)

**Conservé**:
- ✅ `autoRefreshEnabled` et `refreshInterval` (passés au hook)
- ✅ `refreshKPIs` (callback passé au hook)
- ✅ `setRefreshStatus` (utilisé dans `onStatusChange`)

---

### 3. ✅ Ajustements des dépendances

**Avant**:
```tsx
useEffect(() => {
  if (!autoRefreshEnabledRef.current || !isTabVisibleRef.current || !isOnlineRef.current) return;
  // ...
}, []); // Dépendances vides
```

**Après**:
```tsx
useEffect(() => {
  if (!autoRefreshEnabledRef.current || !isTabVisible || !isOnline) return;
  // ...
}, [isTabVisible, isOnline]); // Dépendances pour réagir aux changements
```

---

## 📊 Impact

### Code Quality
- ✅ **-2** `useEffect` (gérés par le hook)
- ✅ **-1** ref (`refreshIntervalRef`)
- ✅ **-2** états manuels (`isOnline`, `isTabVisible`)
- ✅ Code plus simple et maintenable

### Robustesse
- ✅ Gestion centralisée de l'auto-refresh
- ✅ Pause intelligente (onglet invisible, hors ligne)
- ✅ Protection contre les refreshes trop fréquents
- ✅ Cleanup automatique

---

## ✅ Checklist

- [x] Hook `useAutoRefresh` importé
- [x] Hook utilisé avec les bonnes options
- [x] Type `status` explicite dans `onStatusChange`
- [x] Code manuel supprimé
- [x] Dépendances ajustées
- [x] Références aux refs supprimées corrigées

---

## ⚠️ Notes

- Le hook `useAutoRefresh` gère maintenant toute la logique d'auto-refresh
- `isOnline` et `isTabVisible` sont retournés par le hook
- Le hook gère automatiquement la pause si l'onglet est invisible ou hors ligne
- Le hook protège contre les refreshes trop fréquents (minIntervalBetweenRefreshes)

---

**Statut**: ✅ **MIGRATION APPLIQUÉE**
