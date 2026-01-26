# ✅ Phase P11 - Cache Serveur & Métriques SLO

## 🎯 Objectif

Implémenter un système de cache serveur multi-niveaux pour les endpoints dashboard API avec stratégies par type de vue, et ajouter des métriques SLO pour piloter les budgets de performance.

**Aucun impact UX** : Le routeur avancé reste l'orchestrateur, le registry continue d'être la source unique des vues, la Sidebar/Subnav pilote la navigation, et la KPI Bar garde son rôle d'action rapide.

---

## ✅ Implémentation

### 1. Système de Cache Serveur

#### 1.1 Stratégies de Cache

**Fichier** : `lib/server/dashboard/cache/cacheStrategy.ts`

Stratégies définies selon le type de vue :

- **REALTIME** : Données en temps réel (5s cache)
  - Routes : `realtime/*`
  - Cache : 5 secondes
  - Invalidation : Immédiate sur mutations

- **OPERATIONAL** : Données opérationnelles (30s cache)
  - Routes : `overview/*`, `performance/*`, `actions/*`, `risks/*`, `decisions/*`
  - Cache : 30 secondes
  - Invalidation : Immédiate sur mutations

- **REPORTING** : Données de reporting mensuel (60s cache)
  - Routes : `performance/reporting/*`, `trends/monthly`, `trends/quarterly`
  - Cache : 60 secondes (max-age), 300 secondes (s-maxage CDN)
  - Invalidation : Pas d'invalidation immédiate (reporting mensuel)

- **STATIC** : Données statiques (300s cache)
  - Routes : Référentiels, configurations
  - Cache : 5 minutes
  - Invalidation : Sur mutations

#### 1.2 Headers Cache-Control

Le système applique automatiquement les headers `Cache-Control` selon la stratégie :

```http
Cache-Control: private, max-age=60, s-maxage=300, must-revalidate
X-Cache-Strategy: reporting
X-Cache-Tenant: <tenant-id>
X-Revalidate: 60
```

**Important** : Le cache est **privé** (tenant-scopé) pour respecter RBAC. Chaque tenant a son propre cache.

#### 1.3 Application aux Endpoints

**Fichier** : `app/api/dashboard/[main]/[sub]/[leaf]/route.ts`

Le cache est appliqué automatiquement selon la route :

```typescript
// Déterminer la stratégie de cache
const cacheStrategy = getCacheStrategy(main, sub, leaf);

// Créer la réponse avec cache
const res = cachedResponse(data, cacheStrategy, ctx.tenantId, 200);
```

---

### 2. Métriques SLO

#### 2.1 Time To First Byte (TTFB)

**Fichier** : `lib/server/dashboard/cache/sloMetrics.ts`

**Budget SLO** : P95 < 400ms pour les endpoints API read

Métrique enregistrée automatiquement pour chaque requête :

```typescript
recordTTFB(route, 'GET', ttfbSeconds, cacheStrategy);
```

**Métrique Prometheus** : `dashboard_api_ttfb_seconds`
- Labels : `method`, `route`, `cache_strategy`
- Buckets : `[0.05, 0.1, 0.2, 0.4, 0.8, 1.6, 3.2]`

#### 2.2 Cache Hit Rate

Métriques pour piloter l'efficacité du cache :

- `dashboard_cache_hits_total` : Nombre de cache hits
- `dashboard_cache_misses_total` : Nombre de cache misses

**Budget SLO** : Cache hit rate > 70% pour les routes reporting

#### 2.3 Export Size

Métrique pour piloter les coûts d'export :

- `dashboard_export_size_bytes` : Taille des exports (CSV, JSON, PDF, Excel)

---

### 3. Intégration avec l'Observabilité Existante

Le système s'intègre avec les métriques existantes (Phase P4) :

- **Métriques HTTP** : `http_request_duration_seconds` (déjà existant)
- **Métriques API** : `dashboard_api_request_duration_seconds` (déjà existant)
- **Nouvelles métriques SLO** : `dashboard_api_ttfb_seconds`, `dashboard_cache_hits_total`, etc.

---

## 📊 Utilisation

### Endpoints Cachés

Tous les endpoints `/api/dashboard/[main]/[sub]/[leaf]` sont automatiquement cachés selon leur type :

- **Realtime** : `realtime/*` → 5s cache
- **Operational** : `overview/*`, `performance/*` → 30s cache
- **Reporting** : `performance/reporting/*` → 60s cache (300s CDN)
- **Static** : Référentiels → 5min cache

### Headers de Réponse

Chaque réponse inclut :

```http
Cache-Control: private, max-age=60, s-maxage=300, must-revalidate
X-Cache-Strategy: reporting
X-Cache-Tenant: tenant-123
X-Revalidate: 60
X-TTFB-Ms: 245
```

### Métriques Prometheus

Exposer les métriques SLO :

```bash
curl http://localhost:3000/api/internal/metrics
```

Métriques disponibles :

```
# TTFB
dashboard_api_ttfb_seconds{method="GET",route="/api/dashboard/performance/reporting/overview",cache_strategy="reporting"} 0.245

# Cache hits/misses
dashboard_cache_hits_total{cache_strategy="reporting",route="/api/dashboard/performance/reporting/overview"} 42
dashboard_cache_misses_total{cache_strategy="reporting",route="/api/dashboard/performance/reporting/overview"} 8
```

---

## 🔒 Sécurité & RBAC

### Cache Tenant-Scopé

Le cache est **privé** (tenant-scopé) pour respecter RBAC :

- Header `Cache-Control: private` (pas de cache partagé)
- Header `X-Cache-Tenant` pour identifier le tenant
- Les permissions RBAC sont vérifiées **avant** le cache

### Invalidation

Le cache est invalidé automatiquement selon la stratégie :

- **Realtime/Operational** : Invalidation immédiate sur mutations
- **Reporting** : Pas d'invalidation immédiate (refresh via MViews)
- **Static** : Invalidation sur mutations

---

## 📈 Prochaines Étapes (Optionnel)

1. **Cache Redis** : Remplacer le cache in-memory par Redis pour le partage entre instances
2. **Cache CDN** : Utiliser un CDN (Cloudflare, Vercel Edge) pour le cache `s-maxage`
3. **Invalidation Intelligente** : Système d'invalidation basé sur les événements (ex: refresh MViews)
4. **Métriques TTI** : Ajouter les métriques Time To Interactive côté client (Performance API)
5. **Alertes SLO** : Configurer des alertes Prometheus si les budgets SLO sont dépassés

---

## ✅ Validation

- [x] Stratégies de cache définies (realtime, operational, reporting, static)
- [x] Headers Cache-Control appliqués automatiquement
- [x] Cache tenant-scopé (respect RBAC)
- [x] Métriques SLO (TTFB, cache hit rate)
- [x] Intégration avec observabilité existante
- [x] Aucun impact UX (routeur, registry, navigation inchangés)

**Status** : ✅ Cache serveur implémenté et fonctionnel
