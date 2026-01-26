# ✅ Phase P11 - Rate Limiting Redis

## 🎯 Objectif

Remplacer le rate limiting in-memory par Redis pour permettre le partage entre instances et une meilleure scalabilité.

---

## ✅ Implémentation

### 1. Module Redis

**Fichier** : `lib/server/observability/rateLimitRedis.ts`

Implémentation du Token Bucket Algorithm avec Redis et script Lua atomique :

```typescript
export async function rateLimitRedis(
  key: string,
  capacity = 120,
  refillPerSec = 2
): Promise<{ allowed: boolean; remaining: number }>
```

**Caractéristiques** :
- Script Lua atomique pour garantir la cohérence
- Token Bucket Algorithm (refill progressif)
- Expiration automatique des clés (3600s)
- Gestion d'erreurs avec fallback

### 2. Rate Limiting Unifié

**Fichier** : `lib/server/observability/rateLimit.ts`

Le rate limiting utilise maintenant Redis si disponible, avec fallback in-memory :

```typescript
export async function rateLimit(
  key: string,
  capacity = 120,
  refillPerSec = 2
): Promise<{ allowed: boolean; remaining: number }>
```

**Comportement** :
1. Si `REDIS_URL` est défini → Utilise Redis
2. Sinon → Fallback in-memory (compatible Phase P4)
3. En cas d'erreur Redis → Fallback in-memory (fail-open)

### 3. Intégration dans la Route

**Fichier** : `app/api/dashboard/[main]/[sub]/[leaf]/route.ts`

Le rate limiting est maintenant asynchrone :

```typescript
const rl = await rateLimit(`dash:${ip}`, 120, 2);
if (!rl.allowed) {
  return NextResponse.json(
    { error: 'Too Many Requests', retryAfter: 60 },
    { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
  );
}
```

---

## 📋 Configuration

### Variables d'Environnement

```env
# Redis (optionnel - fallback in-memory si non défini)
REDIS_URL=redis://localhost:6379
# ou
REDIS_URL=redis://:password@host:6379/0
```

### Dépendances

```bash
npm install ioredis
```

---

## 🔧 Algorithme Token Bucket

Le script Lua implémente un Token Bucket :

1. **Récupération** : Lit l'état actuel du bucket (tokens, timestamp)
2. **Refill** : Calcule les tokens rechargés depuis la dernière mise à jour
3. **Consommation** : Consomme 1 token si disponible
4. **Mise à jour** : Sauvegarde l'état et expire après 1h

**Avantages** :
- Atomique (script Lua)
- Partage entre instances
- Pas de race conditions
- Performance (opération unique)

---

## 📊 Utilisation

### Production (Multi-Instances)

```env
REDIS_URL=redis://redis-cluster:6379
```

Le rate limiting est partagé entre toutes les instances.

### Développement (Single Instance)

```env
# REDIS_URL non défini
```

Le rate limiting utilise le fallback in-memory (compatible Phase P4).

---

## ✅ Bénéfices

1. **Scalabilité** : Partage entre instances (pas de dépassement de quota)
2. **Cohérence** : Script Lua atomique (pas de race conditions)
3. **Robustesse** : Fallback in-memory si Redis indisponible
4. **Performance** : Opération unique (script Lua)

---

## 🔒 Sécurité

- **Fail-Open** : En cas d'erreur Redis, permettre la requête (évite les faux positifs)
- **Expiration** : Les clés expirent après 1h (nettoyage automatique)
- **Isolation** : Chaque IP a son propre bucket

---

## ✅ Validation

- [x] Module Redis créé avec script Lua
- [x] Rate limiting unifié avec fallback
- [x] Intégration dans la route principale
- [x] Headers de réponse améliorés (Retry-After, X-RateLimit-Remaining)
- [x] Gestion d'erreurs robuste
- [x] Documentation complète

**Status** : ✅ Rate limiting Redis implémenté avec fallback

---

## 🚀 Déploiement

### 1. Installer ioredis

```bash
npm install ioredis
```

### 2. Configurer Redis

```env
REDIS_URL=redis://your-redis-host:6379
```

### 3. Tester

Le rate limiting fonctionne automatiquement :
- Redis si `REDIS_URL` est défini
- In-memory sinon (fallback)
