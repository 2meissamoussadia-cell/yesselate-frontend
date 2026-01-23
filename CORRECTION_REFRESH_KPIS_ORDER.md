# Correction : Ordre des déclarations dans DashboardContent

## Problème identifié

Le code utilisait des variables/fonctions avant leur déclaration dans `DashboardContent`, causant des erreurs TypeScript :
- `setLastUpdate` utilisé dans `useDashboardRefresh` mais déclaré après
- `updateLoadMetrics` utilisé dans `useDashboardRefresh` mais déclaré après
- `addNotification` utilisé dans `useDashboardRefresh` mais déclaré après
- Duplication de `useKPINotifications`

## Solution appliquée

Réorganisation de l'ordre des déclarations pour respecter les dépendances :

1. **Hooks de base** (sans dépendances) :
   - `useKPIFilter`
   - `useState` pour `lastUpdate`

2. **Hooks de données** :
   - `useDashboardKPIs`

3. **Hooks utilitaires** (déclarés avant `useDashboardRefresh`) :
   - `usePerformanceMetrics` (fournit `updateLoadMetrics`)
   - `useKPINotifications` (fournit `addNotification`)

4. **Hook de refresh** (utilise les hooks précédents) :
   - `useDashboardRefresh` (utilise `setLastUpdate`, `updateLoadMetrics`, `addNotification`)

5. **Synchronisation** :
   - `useEffect` pour synchroniser `lastUpdate` avec `refreshLastUpdate`

## Changements effectués

### Fichier : `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Avant** :
```typescript
// ❌ useDashboardRefresh déclaré avant ses dépendances
const { refresh: refreshKPIs, ... } = useDashboardRefresh({
  onSuccess: (loadTime) => {
    setLastUpdate(new Date()); // ❌ setLastUpdate pas encore déclaré
    updateLoadMetrics(loadTime); // ❌ updateLoadMetrics pas encore déclaré
  },
  onError: (error, retryAttempt) => {
    addNotification(errorNotification); // ❌ addNotification pas encore déclaré
  },
});

const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
const { updateLoadMetrics } = usePerformanceMetrics({...});
const { addNotification } = useKPINotifications({...});
```

**Après** :
```typescript
// ✅ Ordre correct : dépendances déclarées avant utilisation
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

const { performanceMetrics, updateLoadMetrics } = usePerformanceMetrics({
  componentName: 'DashboardContent',
  route: `${main}/${sub || ''}/${leaf || ''}`,
  logThreshold: 500,
});

const { notifications: kpiChangeNotifications, addNotification, dismissNotification, clearAll: clearAllNotifications } = useKPINotifications({
  maxNotifications: 10,
  autoDismissMs: 5000,
});

// ✅ useDashboardRefresh peut maintenant utiliser toutes ses dépendances
const { refresh: refreshKPIs, ... } = useDashboardRefresh({
  onSuccess: (loadTime) => {
    setLastUpdate(new Date()); // ✅ setLastUpdate disponible
    updateLoadMetrics(loadTime); // ✅ updateLoadMetrics disponible
  },
  onError: (error, retryAttempt) => {
    addNotification(errorNotification); // ✅ addNotification disponible
  },
});
```

## Résultat

- ✅ Toutes les erreurs TypeScript liées à `refreshKPIs` sont corrigées
- ✅ Ordre des déclarations respecte les dépendances
- ✅ Suppression de la duplication de `useKPINotifications`
- ✅ Code plus maintenable et lisible

## Vérification

Tous les usages de `refreshKPIs` dans le fichier sont maintenant valides :
- Ligne 726 : `onRefresh: refreshKPIs` dans `useAutoRefresh`
- Ligne 797 : `refreshKPIs()` dans timeout initial
- Ligne 840 : `refreshKPIs()` dans raccourci clavier Ctrl+R
- Ligne 847 : `refreshKPIs()` dans raccourci clavier Ctrl+Shift+R
- Ligne 912 : `refreshKPIs` dans dépendances `useEffect`
- Ligne 1027 : `await refreshKPIs()` dans handler d'export

## Notes

- L'ordre des hooks React est important pour éviter les erreurs de dépendances
- Les hooks personnalisés doivent être déclarés dans l'ordre de leurs dépendances
- TypeScript aide à détecter ces problèmes à la compilation
