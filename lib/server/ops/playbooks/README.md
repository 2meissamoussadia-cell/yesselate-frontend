# Playbooks Opérations – P15 / P20

## 📋 Vue d'ensemble

Playbooks pour opérations critiques de **sécurité** (freeze, revoke, rotate JWT) et **maintenance** (MViews, DB hygiene, cache, workers, exports, failover).  
P20 : audit centralisé (`lib/server/ops/audit`), guards (dry-run, scope, blast radius), API `/api/ops/runbook`, approvals two-person rule, jobs `opsRunner` / `cronWarmDashboard`.  
Voir [P20_PLAYBOOKS_OPS_REMEDIATIONS.md](../../../../docs/ops/P20_PLAYBOOKS_OPS_REMEDIATIONS.md).

---

## 🔧 Fonctions Disponibles

### 1. Freeze Tenant

Gèle un tenant (bloque toutes les requêtes).

```typescript
import { freezeTenant } from '@lib-root/server/ops/playbooks/security';

// Dry-run (par défaut)
const result = await freezeTenant({
  tenantId: 'tenant-uuid',
  reason: 'Suspicious activity detected',
  dryRun: true,
});

// Exécution réelle
const result = await freezeTenant({
  tenantId: 'tenant-uuid',
  reason: 'Suspicious activity detected',
  dryRun: false,
});
```

**Comportement** :
- Stocke un flag dans Redis : `tenant:{tenantId}:frozen` (TTL 1h)
- Middleware doit vérifier ce flag et bloquer les requêtes
- Audit log créé

### 2. Revoke Sessions

Révoque les sessions d'un tenant ou d'un utilisateur spécifique.

```typescript
import { revokeSessions } from '@lib-root/server/ops/playbooks/security';

// Révoquer toutes les sessions d'un tenant
const result = await revokeSessions({
  tenantId: 'tenant-uuid',
  dryRun: false,
});

// Révoquer sessions d'un utilisateur spécifique
const result = await revokeSessions({
  tenantId: 'tenant-uuid',
  userId: 'user-uuid',
  dryRun: false,
});
```

**Comportement** :
- Supprime les clés Redis : `sess:{tenant}:{user}:*`
- Convention de nommage des sessions
- Audit log créé

### 3. Rotate JWT (kid)

Rotation des clés JWT avec support kid (Key ID).

```typescript
import { rotateJWT } from '@lib-root/server/ops/playbooks/security';

// Rotation globale (default)
const result = await rotateJWT({
  dryRun: false,
});

// Rotation tenant-specific
const result = await rotateJWT({
  tenantId: 'tenant-uuid',
  dryRun: false,
});
```

**Comportement** :
- Génère nouveau kid (Key ID) : `kid-{timestamp}-{random}`
- Génère nouvelle clé JWT (32 bytes, base64)
- Stocke dans Secrets Manager : `jwt-secret:{kid}` ou `jwt-secret:{tenant}:{kid}`
- Met à jour kid actif : `jwt-kid:default` ou `jwt-kid:{tenant}`
- Conserve ancienne clé pour période de transition (7 jours)
- Audit log créé

**Période de transition** :
- Ancienne clé marquée comme `deprecated` (7 jours)
- Support des deux clés (ancienne + nouvelle) pendant transition
- Job de nettoyage pour supprimer clés dépréciées après 7 jours

### 4. Is Tenant Frozen

Vérifie si un tenant est gelé.

```typescript
import { isTenantFrozen } from '@lib-root/server/ops/playbooks/security';

const frozen = await isTenantFrozen('tenant-uuid');
if (frozen) {
  // Bloquer requête
}
```

### 5. Unfreeze Tenant

Dégèle un tenant.

```typescript
import { unfreezeTenant } from '@lib-root/server/ops/playbooks/security';

const result = await unfreezeTenant({
  tenantId: 'tenant-uuid',
  dryRun: false,
});
```

---

## 🔒 Sécurité

### Dry-Run par Défaut

Toutes les fonctions sont en mode `dryRun: true` par défaut pour éviter les erreurs accidentelles.

### Audit Logging

Toutes les opérations sont auditées :
- Type d'opération (`ops:freeze-tenant`, `ops:revoke-sessions`, `ops:rotate-jwt`)
- Tenant ID
- Détails (reason, userId, count, etc.)
- Timestamp

### Scope Validation

Validation du scope (tenantId) avant toute opération.

---

## 📊 Intégration

### Middleware - Vérification Freeze

```typescript
// middleware.ts
import { isTenantFrozen } from '@lib-root/server/ops/playbooks/security';

export async function middleware(req: NextRequest) {
  const tenantId = req.headers.get('x-tenant-id');
  
  if (tenantId && await isTenantFrozen(tenantId)) {
    return NextResponse.json(
      { error: 'Tenant frozen' },
      { status: 403 }
    );
  }
  
  // ... reste du middleware
}
```

### JWT Validation - Support kid

```typescript
// lib/server/security/jwt.ts
import { getSecret } from '@lib-root/server/security/secretsManager';

async function getJWTSecret(kid?: string): Promise<string> {
  // Récupérer kid actif si non fourni
  if (!kid) {
    kid = await getSecret('jwt-kid:default') ?? 'default';
  }
  
  // Récupérer clé correspondante
  const secret = await getSecret(`jwt-secret:${kid}`);
  if (secret) return secret;
  
  // Fallback : essayer clé dépréciée (période de transition)
  const deprecated = await getSecret(`jwt-secret:${kid}:deprecated`);
  if (deprecated) return deprecated;
  
  // Fallback : clé par défaut
  return await getSecret('jwt-secret:default') ?? '';
}

export async function verifyJWT(token: string): Promise<any> {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded?.header?.kid;
  
  const secret = await getJWTSecret(kid);
  return jwt.verify(token, secret);
}
```

---

## ⚠️ Notes importantes

1. **Redis** : Nécessite `REDIS_URL` configuré
2. **Secrets Manager** : Nécessite Secrets Manager configuré (Azure Key Vault, AWS Secrets Manager, etc.)
3. **Dry-Run** : Toujours tester en dry-run avant exécution réelle
4. **Audit** : Toutes les opérations sont auditées (non-bloquant)
5. **Période de transition** : Rotation JWT supporte période de transition (7 jours)

---

**Dernière mise à jour** : 2026-01-26
