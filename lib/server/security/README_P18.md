# Phase P18 : Sécurité Avancée - Guide d'Utilisation

## 📚 Fichiers Créés

### 1. Middleware Sécurité
- **`middleware.ts`** : CSP stricte, headers sécurité, cookies, CSRF tokens

### 2. Protection CSRF
- **`lib/server/security/csrf.ts`** : Génération et validation de tokens CSRF (double-submit cookie)

### 3. Cookies Sécurisés
- **`lib/server/security/cookies.ts`** : Cookies signés avec rotation automatique

### 4. Durcissement JWT
- **`lib/server/security/jwt.ts`** : JWT avec validation stricte, jti/kid, replay protection
- **`lib/server/dashboard/sql/25_jwt_security.sql`** : Tables pour blacklist et rotation de clés

### 5. RLS Postgres
- **`lib/server/security/rls.sql`** : Politiques RLS par tenant et ABAC
- **`lib/server/security/rls.ts`** : Helpers pour configurer le contexte RLS
- **`lib/server/dashboard/sql/26_rls_mviews.sql`** : RLS sur Materialized Views

### 6. Chiffrement E2E
- **`lib/server/security/encryption.ts`** : AES-256-GCM pour exports
- **`lib/server/security/exportEncryption.ts`** : Helpers pour chiffrer exports sensibles

### 7. Rotation de Clés
- **`lib/server/security/keyRotation.ts`** : Gestion et rotation automatique des clés

### 8. Secrets Management
- **`lib/server/security/secrets.ts`** : Abstraction multi-provider (Vault, AWS KMS, etc.)

### 9. Rate-Limit Homogène
- **`lib/server/security/rateLimit.ts`** : Rate-limit centralisé avec FinOps

### 10. mTLS
- **`lib/server/security/mtls.ts`** : Configuration mTLS pour inter-services

### 11. Nonce CSP
- **`lib/server/security/cspNonce.tsx`** : Provider React pour exposer le nonce

### 12. Audit & Alertes
- **`lib/server/security/middleware.ts`** : Logging d'événements sécurité
- **`lib/server/dashboard/alerting/securityAlerts.ts`** : Règles d'alertes sécurité

---

## 🚀 Guide d'Intégration

### 1. Utiliser le Nonce CSP

```tsx
// Dans un composant avec script inline critique
import { useCspNonce } from '@/lib/server/security/cspNonce';

function HydrationScript() {
  const nonce = useCspNonce();
  return (
    <script nonce={nonce} dangerouslySetInnerHTML={{
      __html: `window.__HYDRATION_DATA__ = ${JSON.stringify(data)};`
    }} />
  );
}
```

### 2. Migrer vers Cookies Sécurisés

```typescript
// ❌ Ancien (localStorage)
localStorage.setItem('token', token);

// ✅ Nouveau (cookies signés)
import { setSessionCookie } from '@/lib/server/security/cookies';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, sessionId, 3600 * 24 * 7); // 7 jours
  return res;
}
```

### 3. Protéger un Endpoint avec CSRF

```typescript
import { secureMutationHandler } from '@/lib/server/security/middleware';

export async function POST(req: NextRequest) {
  return secureMutationHandler(req, async (req) => {
    // Votre handler ici
    return NextResponse.json({ ok: true });
  });
}
```

### 4. Appliquer Rate-Limit + FinOps

```typescript
import { applyRateLimitAndQuota, recordRequestUsage } from '@/lib/server/security/rateLimit';

export async function GET(req: NextRequest) {
  const ctx = extractContextFromHeaders(req.headers);
  
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
  
  // Enregistrer l'usage
  await recordRequestUsage(ctx, 'route:/api/dashboard/overview/summary', {
    rows: data.length,
    bytes: JSON.stringify(data).length,
  });
  
  return NextResponse.json({ data });
}
```

### 5. Utiliser RLS dans les Requêtes

```typescript
import { withRLSContext } from '@/lib/server/security/rls';

const client = await pgPool.connect();
try {
  const result = await withRLSContext(client, ctx, async () => {
    return await client.query('SELECT * FROM rm_kpis_projets');
  });
} finally {
  client.release();
}
```

### 6. Chiffrer un Export Sensible

```typescript
import { shouldEncryptExport, encryptExportResponse } from '@/lib/server/security/exportEncryption';

if (shouldEncryptExport(format, route, encrypted)) {
  return encryptExportResponse(fileBuffer, filename, format);
}
```

---

## 🔧 Configuration Requise

### Variables d'environnement

```env
# Cookies
COOKIE_SECRET=<32-byte-hex-string>

# JWT
JWT_SECRET=<32-byte-hex-string>

# Chiffrement
ENCRYPTION_KEY=<64-char-hex-string>

# mTLS (optionnel)
POSTGRES_SSL_MODE=require
POSTGRES_CLIENT_CERT=<cert>
POSTGRES_CLIENT_KEY=<key>
POSTGRES_CA_CERT=<ca>
```

### Migrations SQL

```bash
# RLS
psql $DATABASE_URL -f lib/server/security/rls.sql

# Tables sécurité
psql $DATABASE_URL -f lib/server/dashboard/sql/24_security.sql

# JWT security
psql $DATABASE_URL -f lib/server/dashboard/sql/25_jwt_security.sql

# RLS sur MViews
psql $DATABASE_URL -f lib/server/dashboard/sql/26_rls_mviews.sql
```

---

## ✅ Checklist d'Intégration

- [ ] Appliquer toutes les migrations SQL
- [ ] Configurer les variables d'environnement (COOKIE_SECRET, JWT_SECRET, ENCRYPTION_KEY)
- [ ] Ajouter CspNonceProvider dans Providers.tsx (✅ fait)
- [ ] Migrer localStorage → cookies signés
- [ ] Intégrer CSRF dans tous les endpoints mutation
- [ ] Appliquer rate-limit homogène sur tous les endpoints
- [ ] Activer RLS dans toutes les requêtes SQL sensibles
- [ ] Tester chiffrement E2E sur exports sensibles
- [ ] Configurer mTLS (si applicable)
- [ ] Vérifier audit logs dans security_audit_log

---

**Phase P18 complétée avec toutes les améliorations** ✅
