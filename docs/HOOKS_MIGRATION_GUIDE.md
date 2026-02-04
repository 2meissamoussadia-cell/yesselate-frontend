# Guide de Migration des Hooks vers React Query

## Vue d'ensemble

Ce guide documente la migration des hooks custom utilisant `useState` + `fetch` vers React Query (`@tanstack/react-query`).

## Bénéfices de React Query

1. **Cache automatique** : Pas besoin de gérer manuellement le state
2. **Retry automatique** : Réessai en cas d'erreur
3. **Abort automatique** : Annulation des requêtes obsolètes
4. **Background refresh** : Refresh automatique en arrière-plan
5. **Optimistic updates** : Mise à jour optimiste pour une UX fluide
6. **Devtools** : Outils de debugging intégrés
7. **Code plus simple** : Moins de boilerplate

## Pattern de Migration

### Avant (Hook custom)

```typescript
// ❌ Ancien pattern avec useState
export function useDelegations(options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/delegations');
      if (!response.ok) throw new Error('Erreur');
      const result = await response.json();
      setData(result.items);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [/* deps */]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
```

### Après (React Query)

```typescript
// ✅ Nouveau pattern avec React Query
export function useDelegations(filters = {}) {
  return useQuery({
    queryKey: ['delegations', filters],
    queryFn: async () => {
      const response = await fetch('/api/delegations');
      if (!response.ok) throw new Error('Erreur');
      return response.json();
    },
    staleTime: 30000, // Cache 30s
    retry: 2,
    retryDelay: 1000,
  });
}

// Utilisation identique dans le composant
const { data, isLoading, error, refetch } = useDelegations();
```

## Hooks Migrés

### ✅ `useDelegations` (nouveau fichier)

**Avant :** `useDelegationAPI.ts` (500+ lignes)  
**Après :** `useDelegations.ts` (340 lignes, plus maintenable)

**Changements :**
- `data` → reste `data`
- `loading` → `isLoading`
- `error` → `error`
- `refresh()` → `refetch()`

**Nouveaux hooks disponibles :**

```typescript
// Liste avec filtres
const { data, isLoading, error } = useDelegations({ 
  queue: 'active',
  bureau: 'BMO' 
});

// Détail par ID
const { data: delegation } = useDelegation(id);

// Stats
const { data: stats } = useDelegationStats();

// Alertes
const { data: alerts } = useDelegationAlerts();

// Insights
const { data: insights } = useDelegationInsights();

// Mutations
const createMutation = useCreateDelegation();
const updateMutation = useUpdateDelegation();
const revokeMutation = useRevokeDelegation();
const deleteMutation = useDeleteDelegation();
```

### Options avancées

```typescript
// Auto-refresh toutes les 60 secondes
const { data } = useDelegations({}, {
  refetchInterval: 60000
});

// Désactiver la requête conditionnellement
const { data } = useDelegation(id, {
  enabled: !!id // Ne lance que si id existe
});
```

## Mutations avec React Query

### Avant (Hook custom)

```typescript
export function useCreateDelegation() {
  const [loading, setLoading] = useState(false);
  
  const execute = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/delegations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading };
}
```

### Après (React Query)

```typescript
export function useCreateDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/delegations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalider automatiquement les caches
      queryClient.invalidateQueries({ queryKey: ['delegations'] });
    },
  });
}

// Utilisation
const createMutation = useCreateDelegation();

createMutation.mutate(newDelegation, {
  onSuccess: () => console.log('Créé !'),
  onError: (error) => console.error(error),
});

// Accès aux états
createMutation.isPending // équivalent à loading
createMutation.error
createMutation.data
```

## Query Keys Pattern

Utiliser une structure hiérarchique pour les query keys :

```typescript
export const delegationKeys = {
  all: ['delegations'] as const,
  lists: () => [...delegationKeys.all, 'list'] as const,
  list: (filters) => [...delegationKeys.lists(), filters] as const,
  details: () => [...delegationKeys.all, 'detail'] as const,
  detail: (id) => [...delegationKeys.details(), id] as const,
  stats: () => [...delegationKeys.all, 'stats'] as const,
};

// Utilisation
useQuery({ queryKey: delegationKeys.list({ queue: 'active' }) })
useQuery({ queryKey: delegationKeys.detail(id) })

// Invalidation ciblée
queryClient.invalidateQueries({ queryKey: delegationKeys.lists() });
queryClient.invalidateQueries({ queryKey: delegationKeys.detail(id) });
```

## Checklist de Migration

Pour chaque hook custom à migrer :

- [ ] Identifier les appels `fetch` ou `axios`
- [ ] Créer les fonctions API (`fetchXxx`)
- [ ] Définir les query keys
- [ ] Créer le hook `useXxx` avec `useQuery`
- [ ] Créer les mutations si nécessaire
- [ ] Configurer `staleTime`, `retry`, etc.
- [ ] Mettre à jour les composants consommateurs
- [ ] Tester le comportement
- [ ] Marquer l'ancien hook comme `@deprecated`
- [ ] Documenter la migration

## Hooks à Migrer (TODO)

1. ✅ `useDelegationAPI` → `useDelegations` (FAIT)
2. ⏳ `use-demands-api.ts` → Utiliser `/api/demandes` unifié
3. ⏳ `use-demand-actions.ts` → Migrations vers React Query
4. ⏳ Autres hooks custom à identifier

## Configuration React Query

Assurer que le `QueryClientProvider` est configuré dans `app/layout.tsx` :

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## DevTools React Query

Ajouter les devtools en développement :

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  {process.env.NODE_ENV === 'development' && (
    <ReactQueryDevtools initialIsOpen={false} />
  )}
</QueryClientProvider>
```

## Bonnes Pratiques

1. **Toujours définir des query keys** hiérarchiques et typées
2. **Utiliser `staleTime`** pour contrôler la fraîcheur du cache
3. **Invalider les caches** après mutations avec `invalidateQueries`
4. **Gérer les erreurs** avec `onError` callbacks
5. **Utiliser `enabled`** pour les requêtes conditionnelles
6. **Préférer `refetch()`** à `refresh()` pour plus de clarté

---

Date de création : 2026-02-04
Dernière mise à jour : 2026-02-04
