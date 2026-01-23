# Optimisations Phase 2 - Plan d'Intégration useAutoRefresh

**Date**: 2026-01-23  
**Statut**: 🚧 **EN COURS**

---

## 🎯 Objectif

Remplacer 6+ `useEffect` liés à l'auto-refresh par le hook `useAutoRefresh`.

---

## ✅ Hook Créé

**Fichier**: `src/modules/dashboard/hooks/useAutoRefresh.ts`

**Fonctionnalités**:
- ✅ Gestion de l'intervalle de refresh automatique
- ✅ Pause si onglet invisible
- ✅ Pause si hors ligne
- ✅ Gestion des événements réseau (online/offline)
- ✅ Gestion de la visibilité de l'onglet
- ✅ Protection contre les refreshes trop fréquents

---

## 📋 Étapes d'Intégration

### 1. Importer le hook ✅
- [x] Ajouté dans `src/modules/dashboard/index.ts`
- [x] Importé dans `page.tsx`

### 2. Remplacer les useEffect (À FAIRE)

**useEffect à remplacer**:
1. Ligne 1009-1027: Gestion visibilité onglet
2. Ligne 1129-1168: Refresh périodique avec intervalle
3. Ligne 1172-1209: Gestion événements réseau (online/offline)

**États à remplacer**:
- `isTabVisible` → retourné par `useAutoRefresh`
- `isOnline` → retourné par `useAutoRefresh`
- `isTabVisibleRef` → géré par le hook
- `isOnlineRef` → géré par le hook
- `refreshIntervalRef` → géré par le hook

### 3. Adapter le code (À FAIRE)

**À garder**:
- `autoRefreshEnabled` (état local)
- `refreshInterval` (état local)
- `refreshKPIs` (fonction de refresh)
- `refreshStatus` (état local)

**À supprimer**:
- `useEffect` ligne 1009-1027 (visibilité)
- `useEffect` ligne 1129-1168 (intervalle)
- `useEffect` ligne 1172-1209 (réseau)
- `isTabVisibleRef`, `isOnlineRef`, `refreshIntervalRef` (gérés par le hook)

---

## 🔄 Code de Remplacement

```typescript
// AVANT
const [isTabVisible, setIsTabVisible] = useState(true);
const isTabVisibleRef = useRef(true);
const [isOnline, setIsOnline] = useState(() => {
  if (typeof window !== 'undefined') {
    return navigator.onLine;
  }
  return true;
});
const isOnlineRef = useRef(isOnline);
const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

// ... 3 useEffect pour gérer tout ça ...

// APRÈS
const { isOnline, isTabVisible } = useAutoRefresh({
  enabled: autoRefreshEnabled,
  interval: refreshInterval,
  onRefresh: refreshKPIs,
  onStatusChange: (status) => {
    if (status === 'paused') {
      setRefreshStatus('paused');
    } else {
      setRefreshStatus('idle');
    }
  },
});
```

---

## 📊 Résultat Attendu

**Avant**: ~20 useEffect  
**Après**: ~14 useEffect

**Réduction**: **-6 useEffect (-30%)**

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 **EN COURS**
