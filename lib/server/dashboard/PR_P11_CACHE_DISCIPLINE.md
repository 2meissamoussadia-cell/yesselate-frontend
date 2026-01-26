# ✅ Phase P11 - Discipline Cache : TTL Unique depuis le Registry

## 🎯 Principe Fondamental

**Un seul endroit définit la fraîcheur par vue : le Registry.**

Le TTL (Time To Live) est défini une seule fois dans le `dashboardRegistry` pour chaque vue, et tous les systèmes (serveur + client) s'alignent sur cette valeur.

---

## 📋 Architecture

### 1. Source de Vérité : Registry

**Fichier** : `src/modules/dashboard/registry/dashboardRegistry.tsx`

Chaque entrée du registry définit un `ttl` (en millisecondes) :

```typescript
const entry: ViewEntry = {
  component: MyComponent,
  loader: loadMyData,
  ttl: 30_000, // 30 secondes - Source unique de vérité
  // ...
};
```

### 2. Client : TanStack Query

**Fichiers de référence** :
- `lib/dashboard/useDashboardData.ts` (version simple)
- `src/modules/dashboard/hooks/useDashboardData.ts` (version complète)

**Discipline** : Le hook lit le TTL depuis le registry et l'utilise pour `staleTime` :

```typescript
export function useDashboardData<TData>(nav: NavKey) {
  const key = navToKey(nav);
  const entry = dashboardRegistry[key];
  
  return useQuery({
    queryKey: ['dashboard', key],
    queryFn: async () => entry?.loader ? entry.loader(nav) : { ... },
    staleTime: entry?.ttl ?? 60_000, // ✅ TTL depuis le registry
    gcTime: 5 * 60_000, // GC time: 5 minutes (fixe)
  });
}
```

**Règle** : `staleTime = entry?.ttl ?? 60_000`
- Si le registry définit un TTL → utiliser ce TTL
- Sinon → fallback à 60 secondes

### 3. Serveur : Cache-Control

**Fichier** : `app/api/dashboard/[main]/[sub]/[leaf]/route.ts`

Le serveur applique un cache HTTP selon le type de route :

- **Routes reporting** : `Cache-Control: public, max-age=30, s-maxage=30, stale-while-revalidate=60`
- **Autres routes** : `Cache-Control: no-store` (pas de cache serveur)

**Note** : Le cache serveur est indépendant du TTL client, mais complémentaire :
- Le cache serveur réduit la charge DB
- Le TTL client (TanStack Query) gère la fraîcheur côté UI

---

## ✅ Bénéfices

### 1. Charge DB Lissée

Le cache serveur (30s pour reporting) réduit les appels DB répétés, tout en conservant la fraîcheur des données.

### 2. Fraîcheur Garantie

Le TTL unique dans le registry garantit que :
- Tous les composants utilisent la même fraîcheur
- Pas de divergence entre différentes parties de l'UI
- Facile à ajuster : modifier une seule valeur dans le registry

### 3. UX Intacte

Le routeur avancé continue d'afficher instantanément grâce à :
- **Lazy loading** : Composants chargés à la demande
- **Animations** : Transitions fluides entre vues
- **Cache client** : TanStack Query affiche immédiatement les données en cache

---

## 🔒 Discipline Verrouillée

### Règle #1 : TTL Unique

**Ne JAMAIS définir un TTL ailleurs que dans le registry.**

❌ **Mauvais** :
```typescript
// Dans un composant
const { data } = useQuery({
  staleTime: 120_000, // ❌ TTL hardcodé
  // ...
});
```

✅ **Bon** :
```typescript
// Dans le registry
const entry = {
  ttl: 120_000, // ✅ Source unique
  // ...
};

// Dans le hook
const entry = dashboardRegistry[key];
staleTime: entry?.ttl ?? 60_000, // ✅ Lit depuis le registry
```

### Règle #2 : Fallback Cohérent

Si le registry ne définit pas de TTL, utiliser **60 secondes** comme fallback partout.

### Règle #3 : GC Time Fixe

Le `gcTime` (garbage collection) est fixe à **5 minutes** (ou 2x TTL) pour tous les hooks, indépendamment du TTL.

---

## 📊 Exemple Concret

### Registry

```typescript
// dashboardRegistry.tsx
export const dashboardRegistry: DashboardRegistry = {
  'overview::summary::dashboard': {
    component: OverviewSummaryDashboard,
    loader: loadOverviewSummaryDashboardApi,
    ttl: 30_000, // ✅ 30 secondes - Source unique
  },
  'performance::reporting::overview': {
    component: ReportingOverviewPage,
    loader: loadReportingOverviewApi,
    ttl: 60_000, // ✅ 60 secondes - Source unique
  },
};
```

### Client (TanStack Query)

```typescript
// useDashboardData.ts
const entry = dashboardRegistry[routeKey];
staleTime: entry?.ttl ?? 60_000, // ✅ Lit 30_000 ou 60_000 depuis le registry
```

### Serveur (Cache-Control)

```typescript
// route.ts
const isReporting = main === 'performance' && sub === 'reporting';
if (isReporting) {
  headers['Cache-Control'] = 'public, max-age=30, s-maxage=30, stale-while-revalidate=60';
} else {
  headers['Cache-Control'] = 'no-store';
}
```

---

## ✅ Validation

- [x] TTL défini uniquement dans le registry
- [x] Hooks client lisent le TTL depuis le registry
- [x] Fallback cohérent (60s) partout
- [x] Cache serveur complémentaire (reporting uniquement)
- [x] UX intacte (lazy loading + animations)
- [x] Documentation de la discipline

**Status** : ✅ Discipline verrouillée et documentée
