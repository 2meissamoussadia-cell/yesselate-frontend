# Phase P18 : Améliorations Sécurité - Détails d'Implémentation

## 🎯 Améliorations Apportées

### 1. Utilisation du Nonce CSP

**Fichier** : `lib/server/security/cspNonce.tsx`

**Fonctionnalités** :
- ✅ `CspNonceProvider` : Context React pour exposer le nonce côté client
- ✅ `useCspNonce()` : Hook pour récupérer le nonce dans les composants
- ✅ Injection automatique via meta tag ou `window.__CSP_NONCE__`

**Usage** :
```tsx
import { useCspNonce } from '@/lib/server/security/cspNonce';

function MyComponent() {
  const nonce = useCspNonce();
  return <script nonce={nonce}>/* Script inline critique */</script>;
}
```

**Intégration** : Ajouté dans `lib/providers/Providers.tsx` pour être disponible globalement.

### 2. Cookies Sécurisés avec Rotation

**Fichier** : `lib/server/security/cookies.ts`

**Fonctionnalités** :
- ✅ Cookies signés avec HMAC-SHA256
- ✅ Options sécurisées : HttpOnly, Secure (prod), SameSite=Lax (minimum)
- ✅ Rotation automatique via tokens de session
- ✅ Pas de tokens dans localStorage (utiliser cookies signés)

**Fonctions** :
- `setSecureCookie()` : Définit un cookie signé
- `getSecureCookie()` : Récupère et vérifie un cookie signé
- `setSessionCookie()` : Cookie de session avec rotation
- `getSessionCookie()` : Récupère la session

**Migration depuis localStorage** :
```typescript
// ❌ Ancien (non sécurisé)
localStorage.setItem('token', token);

// ✅ Nouveau (sécurisé)
setSessionCookie(res, sessionId, maxAge);
```

### 3. Durcissement JWT/OIDC

**Fichier** : `lib/server/security/jwt.ts` + `lib/server/dashboard/sql/25_jwt_security.sql`

**Fonctionnalités** :
- ✅ Validation stricte : audience, issuer, algorithm, exp, nbf
- ✅ Replay protection : `jti` (JWT ID) avec blacklist
- ✅ Rotation de clés : `kid` (Key ID) pour rotation
- ✅ Scopes alignés sur permissions P10
- ✅ Short-lived tokens : 15 minutes par défaut
- ✅ Refresh en backchannel (pas de tokens longue durée côté front)

**Table `jwt_blacklist`** : Stocke les JWT révoqués pour replay protection.

**Table `jwt_keys`** : Gestion des clés de signature avec rotation.

**Usage** :
```typescript
import { signJWT, verifyJWT, revokeJWT } from '@/lib/server/security/jwt';

// Signer un JWT
const token = signJWT({
  sub: userId,
  aud: 'yesselate-api',
  iss: 'yesselate-auth',
  scopes: ['dashboard:read', 'export:read'],
  tenantId,
  role: 'manager',
  expiresIn: 15 * 60, // 15 minutes
});

// Vérifier un JWT
const payload = verifyJWT(token, {
  audience: 'yesselate-api',
  issuer: 'yesselate-auth',
  requireKid: true,
});

// Révoquer un JWT
await revokeJWT(payload.jti, payload.exp);
```

### 4. mTLS & Network Policies

**Fichier** : `lib/server/security/mtls.ts`

**Fonctionnalités** :
- ✅ Configuration SSL/TLS pour PostgreSQL avec certificats client
- ✅ Helpers pour workers (mTLS vers API)
- ✅ Documentation pour Network Policies Kubernetes

**Configuration PostgreSQL** :
```typescript
import { getPostgresSSLConfig } from '@/lib/server/security/mtls';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getPostgresSSLConfig(),
});
```

**Variables d'environnement** :
```env
POSTGRES_SSL_MODE=require
POSTGRES_CLIENT_CERT=<cert>
POSTGRES_CLIENT_KEY=<key>
POSTGRES_CA_CERT=<ca>
```

### 5. Rate-Limit Homogène avec FinOps

**Fichier** : `lib/server/security/rateLimit.ts`

**Fonctionnalités** :
- ✅ Configuration centralisée par endpoint
- ✅ Intégration FinOps (quotas + usage recording)
- ✅ Helper `applyRateLimitAndQuota()` pour endpoints

**Configuration** :
```typescript
const RATE_LIMIT_CONFIG = {
  '/api/dashboard': { tokens: 240, refill: 4 },
  '/api/export': { tokens: 20, refill: 1 },
  '/api/telemetry': { tokens: 1000, refill: 10 },
  '/api/alerts/test': { tokens: 30, refill: 1 }, // Plus restrictif
  '/api/admin': { tokens: 60, refill: 1 },
};
```

**Usage** :
```typescript
import { applyRateLimitAndQuota, recordRequestUsage } from '@/lib/server/security/rateLimit';

export async function GET(req: NextRequest) {
  const { rateLimit, quota } = await applyRateLimitAndQuota(
    req,
    ctx,
    'route:/api/dashboard/overview/summary'
  );
  
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
  
  if (!quota.allowed) {
    return NextResponse.json({ error: quota.reason }, { status: 429 });
  }
  
  // ... handler
  
  // Enregistrer l'usage après succès
  await recordRequestUsage(ctx, 'route:/api/dashboard/overview/summary', {
    rows: data.length,
    bytes: JSON.stringify(data).length,
  });
}
```

### 6. RLS sur Materialized Views

**Fichier** : `lib/server/dashboard/sql/26_rls_mviews.sql`

**Fonctionnalités** :
- ✅ Activation RLS sur toutes les MViews
- ✅ Politiques d'isolation par tenant
- ✅ Politiques ABAC par bureau/chantier (ex: `rm_kpis_projets`)

**MViews protégées** :
- `rm_kpis_overview`
- `rm_trends_daily`
- `rm_kpis_projets` (avec ABAC bureau)
- `rm_kpis_demandes`
- `rm_finance_overview`
- `rm_finance_trends`
- `rm_stocks_overview`
- `rm_materiel_overview`
- `rm_stocks_trends`
- `rm_compliance_overview`
- `rm_compliance_visas_backlog`
- `rm_compliance_missing_docs`

**Exemple de politique ABAC** :
```sql
CREATE POLICY bureau_scope_rm_kpis_projets ON rm_kpis_projets
  FOR SELECT
  USING (
    tenant_id = current_setting('app.tenant_id', true)::UUID AND
    (
      current_setting('app.user_role', true) = 'admin' OR
      bureau_code IS NULL OR
      bureau_code = ANY(/* scopes bureau */)
    )
  );
```

---

## 📋 Checklist de Déploiement

### 1. Appliquer les migrations SQL

```bash
# JWT security
psql $DATABASE_URL -f lib/server/dashboard/sql/25_jwt_security.sql

# RLS sur MViews
psql $DATABASE_URL -f lib/server/dashboard/sql/26_rls_mviews.sql
```

### 2. Configurer les variables d'environnement

```env
# Cookies
COOKIE_SECRET=<32-byte-hex-string>

# JWT
JWT_SECRET=<32-byte-hex-string>

# mTLS (optionnel)
POSTGRES_SSL_MODE=require
POSTGRES_CLIENT_CERT=<cert>
POSTGRES_CLIENT_KEY=<key>
POSTGRES_CA_CERT=<ca>
```

### 3. Migrer depuis localStorage vers cookies

```typescript
// Remplacer tous les localStorage.setItem('token', ...)
// par setSessionCookie(res, sessionId, maxAge)
```

### 4. Intégrer rate-limit homogène

```typescript
// Dans chaque endpoint API
import { applyRateLimitAndQuota } from '@/lib/server/security/rateLimit';

const { rateLimit, quota } = await applyRateLimitAndQuota(req, ctx, scope);
```

### 5. Activer RLS dans les requêtes MViews

```typescript
// Les politiques RLS s'appliquent automatiquement si setSecurityContext() est appelé
import { withRLSContext } from '@/lib/server/security/rls';

const result = await withRLSContext(client, ctx, async () => {
  return await client.query('SELECT * FROM rm_kpis_projets');
});
```

---

## 🔒 Bonnes Pratiques

1. **Nonce CSP** : Utiliser uniquement pour scripts inline critiques (hydration boot)
2. **Cookies** : Jamais de tokens dans localStorage, toujours cookies signés
3. **JWT** : Short-lived (15 min) + refresh en backchannel
4. **Rate-limit** : Toujours combiner avec quotas FinOps pour exports
5. **RLS** : Toujours appeler `setSecurityContext()` avant requêtes SQL
6. **mTLS** : Activer en production pour communication inter-services

---

**Phase P18 améliorations complétées** ✅

Toutes les améliorations demandées sont implémentées et prêtes pour la production.
