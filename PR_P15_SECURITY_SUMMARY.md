# PR P15 – Sécurité des Données - Résumé

## 📋 Vue d'ensemble

Implémentation de la sécurité des données avec :
- **SET LOCAL app.tenant_id** : Affectation automatique depuis le contexte validé (P10)
- **Chiffrement at-rest** : Support pour KMS, rotation de clés (KEK/DEK)
- **Chiffrement E2E** : Exports sensibles (PDF/XLSX) avec PGP ou secret éphémère

**Compatibilité** : Aucun changement d'UX. Les exports fonctionnent normalement, le chiffrement est optionnel.

---

## ✅ Fichiers Modifiés/Créés

### 1. Pool PostgreSQL

- ✅ **`lib/server/db/pool.ts`**
  - `SET LOCAL app.tenant_id` depuis `RequestContext.tenantId`
  - `SET LOCAL app.bureau` depuis scopes (ex: 'bureau:BMO' → 'BMO')
  - Compatible avec RLS existant (`set_security_context` conservé)

### 2. Utilitaires de Chiffrement

- ✅ **`lib/server/security/encryption.ts`**
  - `encryptAesGcm()` / `decryptAesGcm()` : AES-256-GCM
  - `encryptWithEphemeralSecret()` / `decryptWithEphemeralSecret()` : Secret éphémère
  - `encryptWithPgp()` : Chiffrement PGP (nécessite package `openpgp`)
  - `wrapDek()` / `unwrapDek()` : Rotation de clés (KEK/DEK)

- ✅ **`lib/server/security/encryptionExport.ts`**
  - `encryptExport()` : Chiffrement d'exports avec options (pgp/age/ephemeral)
  - `createEncryptedResponse()` : Réponse Next.js avec fichier chiffré
  - `parseEncryptionOptions()` : Parse options depuis query params

- ✅ **`lib/security/encryptionClient.ts`** (côté client)
  - `decryptExport()` : Déchiffrement côté client avec Web Crypto API
  - `parseEncryptedBuffer()` : Parse buffer chiffré
  - `generateEphemeralSecret()` : Génération secret côté client

- ✅ **`lib/server/security/index.ts`** : Exports centralisés

### 3. Intégration Exports

- ✅ **`app/api/export/dashboard/route.ts`**
  - Support chiffrement optionnel pour PDF et XLSX
  - Paramètres : `encrypt=true`, `encrypt_mode=ephemeral|pgp|age`, `secret=...`, `recipient_key=...`
  - Secret éphémère généré automatiquement si `generate_secret=true`

### 4. Documentation

- ✅ **`lib/server/security/ENCRYPTION_DEPLOYMENT.md`** : Guide de déploiement

---

## 🔧 Utilisation

### 1. Export avec chiffrement éphémère (recommandé)

**Côté serveur** (automatique via API) :
```bash
# Export XLSX chiffré (secret généré automatiquement)
curl "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx&encrypt=true&encrypt_mode=ephemeral&generate_secret=true" \
  -H "x-tenant-id: tenant-uuid"
# Le secret est retourné dans X-Ephemeral-Secret (⚠️ à partager via canal séparé en prod)
```

**Côté client** :
```typescript
import { decryptExport, generateEphemeralSecret } from '@/lib/security/encryptionClient';

// Générer un secret
const secret = generateEphemeralSecret();

// Export avec chiffrement
const res = await fetch(
  `/api/export/dashboard?format=xlsx&encrypt=true&encrypt_mode=ephemeral&secret=${secret}`,
  { headers: { 'x-tenant-id': tenantId } }
);

const encrypted = await res.arrayBuffer();
const decrypted = await decryptExport(encrypted, secret);

// Télécharger
downloadFile(decrypted, 'export.xlsx');
```

### 2. Export avec PGP

```bash
# Export PDF chiffré avec clé publique destinataire
curl "http://localhost:3000/api/export/dashboard?main=performance&format=pdf&encrypt=true&encrypt_mode=pgp&recipient_key=<public-key-armored>" \
  -H "x-tenant-id: tenant-uuid"
```

### 3. SET LOCAL app.tenant_id (automatique)

Le pool PostgreSQL affecte automatiquement :
- `SET LOCAL app.tenant_id` depuis `RequestContext.tenantId`
- `SET LOCAL app.bureau` depuis scopes (ex: 'bureau:BMO')

**Vérification** :
```sql
-- Dans une transaction
SELECT current_setting('app.tenant_id', true);
SELECT current_setting('app.bureau', true);
```

---

## 🔒 Sécurité

### Chiffrement at-rest

- **Volumes DB** : Chiffrement au niveau infrastructure (AES-256)
- **Snapshots** : Chiffrés automatiquement
- **Exports durables** : Chiffrer avant upload vers S3/Azure Blob

### Chiffrement E2E

- **Secret éphémère** : Partager via canal séparé (Teams/SMS), jamais dans headers HTTP en production
- **PGP** : Clé publique destinataire, seul le destinataire peut déchiffrer
- **Rotation** : Re-chiffrer périodiquement avec nouvelles clés

### Rotation de clés

- **KEK** : Rotation gérée par KMS (annuelle ou en cas de compromission)
- **DEK** : Re-chiffrer avec nouvelle KEK lors de la rotation
- **Job de rotation** : Exécuter périodiquement pour re-chiffrer les données

---

## ⚠️ Notes importantes

1. **SET LOCAL** : Les variables `app.tenant_id` et `app.bureau` sont définies par transaction (LOCAL)
2. **Secret éphémère** : Ne jamais inclure dans les headers HTTP en production, partager via canal séparé
3. **PGP** : Nécessite le package `openpgp` installé (`npm install openpgp`)
4. **Performance** : Le chiffrement ajoute une latence (acceptable pour exports sensibles)
5. **Compatibilité** : Les exports non chiffrés continuent de fonctionner normalement

---

## 📝 Checklist Déploiement

- [x] Pool PostgreSQL modifié (SET LOCAL app.tenant_id et app.bureau)
- [x] Utilitaires de chiffrement AES-GCM créés
- [x] Utilitaires PGP créés (nécessite package openpgp)
- [x] Intégration chiffrement dans exports PDF/XLSX
- [x] Client côté frontend pour déchiffrement
- [x] Documentation complète

---

**Status** : ✅ **PR P15 – Sécurité des Données PRÊTE**

**Dernière mise à jour** : 2026-01-26
