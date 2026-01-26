# ✅ Phase P11 - Pagination & Streaming JSON

## 🎯 Objectif

Implémenter un pattern générique de pagination pour les gros exports ou listes volumineuses, avec support OFFSET/LIMIT dans les repos SQL.

---

## ✅ Implémentation

### 1. Types de Pagination

**Fichier** : `lib/server/dashboard/types/pagination.ts`

Types standardisés pour la pagination :

```typescript
export interface PaginationOptions {
  page: number;  // Numéro de page (commence à 1)
  limit: number; // Nombre d'éléments par page (50-500)
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
```

### 2. Parsing des Paramètres

**Helper** : `parsePaginationParams(url: URL)`

Parse et valide les paramètres depuis l'URL :

```typescript
const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
const limit = Math.min(500, Math.max(50, Number(url.searchParams.get('limit') ?? 100)));
```

**Règles** :
- `page` : Minimum 1, défaut 1
- `limit` : Entre 50 et 500, défaut 100

### 3. Intégration dans la Route

**Fichier** : `app/api/dashboard/[main]/[sub]/[leaf]/route.ts`

```typescript
// Phase P11: Parse des paramètres de pagination (optionnel)
const url = new URL(req.url);
const pagination = parsePaginationParams(url);

// Passer les options de pagination au service
const data = await svc.getData(
  parsed.data.main, 
  parsed.data.sub ?? null, 
  parsed.data.leaf ?? null, 
  ctx as any,
  { pagination }
);
```

### 4. Service & Repos

**Fichier** : `lib/server/dashboard/services/dashboardReadService.ts`

Le service accepte maintenant des options incluant la pagination :

```typescript
export interface GetDataOptions {
  pagination?: PaginationOptions;
}

async getData(
  main: string, 
  sub: string | null, 
  leaf: string | null, 
  ctx: RequestContext,
  options: GetDataOptions = {}
) {
  // ...
}
```

**Dans les repos SQL** : Appliquer OFFSET/LIMIT sur les vues concernées :

```typescript
// Exemple dans un repo
async loadList(ctx: RequestContext, options?: GetDataOptions) {
  const offset = options?.pagination ? getOffset(options.pagination) : 0;
  const limit = options?.pagination?.limit ?? 100;
  
  // Requête SQL avec pagination
  const query = `
    SELECT * FROM rm_some_view
    WHERE tenant_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const { rows } = await client.query(query, [ctx.tenantId, limit, offset]);
  
  // Compter le total (sans LIMIT)
  const { rows: countRows } = await client.query(
    'SELECT COUNT(*) as total FROM rm_some_view WHERE tenant_id = $1',
    [ctx.tenantId]
  );
  const total = Number(countRows[0].total);
  
  // Retourner réponse paginée
  return createPaginatedResponse(rows, total, options.pagination!);
}
```

---

## 📊 Utilisation

### Requête Paginée

```bash
GET /api/dashboard/performance/achats/fournisseurs?page=2&limit=100
```

**Réponse** :

```json
{
  "items": [...],
  "page": 2,
  "limit": 100,
  "total": 450,
  "hasMore": true
}
```

### Requête Non-Paginée

```bash
GET /api/dashboard/overview/summary/dashboard
```

**Réponse** : Format normal (pas de pagination)

---

## 🔧 Helpers Disponibles

### `parsePaginationParams(url: URL)`

Parse et valide les paramètres depuis l'URL.

### `getOffset(options: PaginationOptions)`

Calcule l'offset SQL : `(page - 1) * limit`

### `createPaginatedResponse<T>(items, total, options)`

Crée une réponse paginée standardisée.

---

## 📋 Contrat de Réponse

### Format Paginé

Pour les listes volumineuses, le contrat peut renvoyer :

```typescript
{
  items: T[],      // Items de la page courante
  page: number,    // Numéro de page (1-based)
  limit: number,   // Nombre d'éléments par page
  total: number,   // Nombre total d'items
  hasMore: boolean // true si page suivante existe
}
```

### Format Normal

Pour les vues non-paginées (KPIs, overview, etc.), le format reste inchangé.

---

## ✅ Validation

- [x] Types de pagination standardisés
- [x] Parsing et validation des paramètres
- [x] Intégration dans la route principale
- [x] Service accepte les options de pagination
- [x] Helpers pour OFFSET/LIMIT
- [x] Contrat de réponse paginée
- [x] Documentation du pattern

**Status** : ✅ Pagination implémentée et prête pour les repos SQL

---

## 🚀 Prochaines Étapes

1. **Implémenter dans les repos** : Ajouter OFFSET/LIMIT dans les méthodes de repos qui retournent des listes
2. **Streaming JSON** : Pour les très gros exports, implémenter le streaming (Next.js Response streaming)
3. **Cursor-based pagination** : Optionnel, pour de meilleures performances sur très gros datasets
