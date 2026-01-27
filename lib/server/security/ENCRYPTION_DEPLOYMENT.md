# Déploiement Chiffrement - Phase P15

## 📋 Vue d'ensemble

Sécurité des données avec chiffrement at-rest et E2E pour exports sensibles.

**Compatibilité** : Aucun changement d'UX. Les exports fonctionnent normalement, le chiffrement est optionnel.

## 🗂️ Fichiers

- **`lib/server/security/encryption.ts`** : Utilitaires de chiffrement (AES-GCM, PGP/age)
- **`lib/server/security/encryptionExport.ts`** : Intégration chiffrement dans exports
- **`lib/server/db/pool.ts`** : Pool PostgreSQL avec `SET LOCAL app.tenant_id` et `app.bureau`

## 🚀 Déploiement

### 1. Pool PostgreSQL - SET LOCAL app.tenant_id

Le pool PostgreSQL a été modifié pour affecter automatiquement :
- `SET LOCAL app.tenant_id` depuis le contexte validé (P10)
- `SET LOCAL app.bureau` depuis les scopes (ex: 'bureau:BMO' → 'BMO')

**Vérification** :
```sql
-- Vérifier que app.tenant_id est bien défini
SELECT current_setting('app.tenant_id', true);
SELECT current_setting('app.bureau', true);
```

### 2. Chiffrement at-rest (KMS)

**Configuration** :
- Chiffrement des volumes DB : Géré par l'infrastructure (AWS EBS, Azure Disk Encryption)
- Snapshots : Chiffrés automatiquement si volumes chiffrés
- Exports durables : Chiffrer avant upload vers stockage objet (S3/Azure Blob)

**Rotation de clés** :
- KEK (Key Encryption Key) : Géré par KMS (AWS KMS, Azure Key Vault)
- DEK (Data Encryption Key) : Chiffrée avec KEK, stockée dans enveloppe
- Rotation : Job périodique pour re-chiffrer avec nouvelle KEK

### 3. Chiffrement E2E pour exports

#### Option 1 : Secret éphémère (recommandé pour partage simple)

```typescript
// Côté serveur (génération)
const secret = generateEphemeralSecret(); // Génère un secret aléatoire
const encrypted = await encryptExport(fileBuffer, {
  mode: 'ephemeral',
  generateSecret: true
});

// Partager le secret via canal séparé (Teams/SMS)
// Le secret est dans metadata.secret

// Côté client (déchiffrement)
import { decryptWithEphemeralSecret } from '@/lib/server/security/encryption';
const decrypted = decryptWithEphemeralSecret(encrypted, secret);
```

**Utilisation API** :
```bash
# Export avec chiffrement éphémère (secret généré automatiquement)
curl "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx&encrypt=true&encrypt_mode=ephemeral&generate_secret=true"

# Le secret est retourné dans le header X-Ephemeral-Secret
# ⚠️ En production, ne PAS utiliser le header, partager via Teams/SMS
```

#### Option 2 : PGP (clé publique destinataire)

```typescript
// Côté serveur
const encrypted = await encryptExport(fileBuffer, {
  mode: 'pgp',
  recipientPublicKey: publicKeyArmored
});

// Côté client (déchiffrement avec clé privée)
// Utiliser openpgp pour déchiffrer
```

**Utilisation API** :
```bash
# Export avec chiffrement PGP
curl "http://localhost:3000/api/export/dashboard?main=performance&format=pdf&encrypt=true&encrypt_mode=pgp&recipient_key=<public-key-armored>"
```

## 📊 Structure

### Pool PostgreSQL

- **`SET LOCAL app.tenant_id`** : Affecté automatiquement depuis `RequestContext.tenantId`
- **`SET LOCAL app.bureau`** : Affecté depuis scopes (ex: 'bureau:BMO')
- Compatible avec RLS existant (fonction `set_security_context` conservée)

### Chiffrement AES-256-GCM

- **IV** : 12 bytes (recommandé pour GCM)
- **Tag** : 16 bytes (authentification)
- **Clé** : 32 bytes (AES-256)

### Chiffrement E2E

- **Mode ephemeral** : Secret partagé via canal séparé (Teams/SMS)
- **Mode PGP** : Clé publique destinataire (seul le destinataire peut déchiffrer)
- **Mode age** : Alternative à PGP (à implémenter si nécessaire)

## 🔧 Exemples d'utilisation

### 1. Export XLSX chiffré avec secret éphémère

```typescript
// Frontend
const onExport = async () => {
  // Générer un secret côté client (ou le recevoir via Teams/SMS)
  const secret = generateEphemeralSecret();
  
  // Export avec chiffrement
  const res = await fetch(
    `/api/export/dashboard?main=performance&format=xlsx&encrypt=true&encrypt_mode=ephemeral&secret=${secret}`,
    { headers: { 'x-tenant-id': tenantId } }
  );
  
  const encrypted = await res.arrayBuffer();
  
  // Déchiffrer côté client
  const decrypted = decryptWithEphemeralSecret(
    parseEncryptedBuffer(encrypted),
    secret
  );
  
  // Télécharger le fichier déchiffré
  downloadFile(decrypted, 'export.xlsx');
};
```

### 2. Export PDF chiffré avec PGP

```typescript
// Frontend
const onExport = async () => {
  // Clé publique du destinataire (chargée depuis config)
  const publicKey = await loadRecipientPublicKey();
  
  // Export avec chiffrement PGP
  const res = await fetch(
    `/api/export/dashboard?main=performance&format=pdf&encrypt=true&encrypt_mode=pgp&recipient_key=${encodeURIComponent(publicKey)}`,
    { headers: { 'x-tenant-id': tenantId } }
  );
  
  const encrypted = await res.arrayBuffer();
  
  // Déchiffrer avec clé privée (côté destinataire)
  const decrypted = await decryptWithPgp(encrypted, privateKey);
  
  downloadFile(decrypted, 'export.pdf');
};
```

## 🔒 Sécurité

### Chiffrement at-rest

- **Volumes DB** : Chiffrement au niveau infrastructure (AES-256)
- **Snapshots** : Chiffrés automatiquement
- **Exports durables** : Chiffrer avant upload vers S3/Azure Blob

### Chiffrement E2E

- **Secret éphémère** : Partager via canal séparé (Teams/SMS), jamais dans les headers HTTP en production
- **PGP** : Clé publique destinataire, seul le destinataire peut déchiffrer
- **Rotation** : Re-chiffrer périodiquement avec nouvelles clés

### Rotation de clés

- **KEK** : Rotation gérée par KMS (annuelle ou en cas de compromission)
- **DEK** : Re-chiffrer avec nouvelle KEK lors de la rotation
- **Job de rotation** : Exécuter périodiquement pour re-chiffrer les données

## ⚠️ Notes importantes

1. **SET LOCAL** : Les variables `app.tenant_id` et `app.bureau` sont définies par transaction (LOCAL)
2. **Secret éphémère** : Ne jamais inclure dans les headers HTTP en production, partager via canal séparé
3. **PGP** : Nécessite le package `openpgp` installé
4. **Performance** : Le chiffrement ajoute une latence (acceptable pour exports sensibles)
5. **Compatibilité** : Les exports non chiffrés continuent de fonctionner normalement

---

**Dernière mise à jour** : 2026-01-26
