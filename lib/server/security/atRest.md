# Phase P18 : Chiffrement At-Rest - Guide d'Implémentation

## 🎯 Objectif

Chiffrer les données au repos : volumes DB, snapshots, et exports durables (stockage objet) via KMS avec rotation de clés.

---

## 📦 Architecture

### 1. Modèle Enveloppe (Envelope Encryption)

```
┌─────────────────────────────────────────┐
│  KEK (Key Encryption Key)               │
│  - Géré par KMS (AWS KMS, Vault, etc.) │
│  - Rotation annuelle ou compromission  │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  DEK (Data Encryption Key)              │
│  - Généré par objet/fichier             │
│  - Chiffré avec KEK (enveloppe)         │
│  - Stocké avec les données              │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Données                                 │
│  - Chiffrées avec DEK (AES-256-GCM)     │
│  - Stockées avec DEK chiffré             │
└─────────────────────────────────────────┘
```

### 2. Rotation de Clés

**KEK (Key Encryption Key)** :
- Rotation annuelle ou en cas de compromission
- Géré par le KMS (rotation automatique possible)

**DEK (Data Encryption Key)** :
- Re-chiffrement périodique des données avec nouvelle KEK
- Job CRON pour re-chiffrer les exports durables

---

## 🔧 Implémentation

### 1. Chiffrement des Volumes DB

**PostgreSQL** :
- Activer le chiffrement au niveau du système de fichiers (LUKS, BitLocker)
- Ou utiliser le chiffrement natif PostgreSQL (TDE - Transparent Data Encryption)
- Configurer via variables d'environnement ou KMS

**Exemple AWS RDS** :
```yaml
# Terraform / CloudFormation
storage_encrypted: true
kms_key_id: "arn:aws:kms:region:account:key/key-id"
```

**Exemple Azure** :
```yaml
# Azure Database for PostgreSQL
ssl_enforcement: Enabled
infrastructure_encryption: Enabled
```

### 2. Chiffrement des Snapshots

**PostgreSQL** :
- Les snapshots héritent du chiffrement du volume source
- Vérifier que les backups sont chiffrés (pg_dump avec chiffrement)

**Exemple** :
```bash
# pg_dump avec chiffrement
pg_dump $DATABASE_URL | \
  openssl enc -aes-256-gcm -salt -k $BACKUP_KEY > backup.sql.enc
```

### 3. Chiffrement des Exports Durables (Stockage Objet)

**Format** :
```
[KEK-encrypted-DEK][IV][AuthTag][Encrypted-Data]
```

**Implémentation** :
```typescript
import { encryptWithEnvelope } from '@/lib/server/security/atRest';

// Chiffrer un export durable
const encrypted = await encryptWithEnvelope(fileBuffer, {
  kekId: 'kek-2025',
  objectId: `export-${exportId}`,
});

// Stocker dans S3/Azure Blob/etc.
await s3.putObject({
  Bucket: 'exports',
  Key: `encrypted/${exportId}.enc`,
  Body: encrypted,
});
```

---

## 🔄 Rotation de Clés

### Job de Re-chiffrement

```typescript
// jobs/reencryptExports.ts
import { reencryptWithNewKEK } from '@/lib/server/security/atRest';

/**
 * Re-chiffre tous les exports avec la nouvelle KEK
 * 
 * Ce job doit être exécuté :
 * - Annuellement (rotation préventive)
 * - En cas de compromission de la KEK
 */
export async function reencryptAllExports(): Promise<void> {
  // 1. Lister tous les exports chiffrés
  const exports = await listEncryptedExports();
  
  // 2. Pour chaque export
  for (const exp of exports) {
    // 3. Déchiffrer avec l'ancienne KEK
    const decrypted = await decryptWithOldKEK(exp.encryptedData, exp.oldKekId);
    
    // 4. Re-chiffrer avec la nouvelle KEK
    const reencrypted = await encryptWithNewKEK(decrypted, 'kek-2026');
    
    // 5. Mettre à jour dans le stockage
    await updateEncryptedExport(exp.id, reencrypted, 'kek-2026');
  }
}
```

---

## 📋 Configuration

### Variables d'Environnement

```env
# KMS Configuration
KMS_PROVIDER=aws-kms  # ou 'vault', 'azure-keyvault', 'gcp-kms'
KMS_KEY_ID=arn:aws:kms:region:account:key/key-id
KMS_REGION=us-east-1

# KEK (Key Encryption Key)
KEK_ID=kek-2025
KEK_ROTATION_INTERVAL_DAYS=365

# Storage
EXPORT_STORAGE_PROVIDER=s3  # ou 'azure-blob', 'gcs'
EXPORT_STORAGE_BUCKET=yesselate-exports
EXPORT_STORAGE_ENCRYPTED=true
```

---

## ✅ Checklist

- [ ] Configurer chiffrement au niveau volume DB (LUKS/BitLocker ou TDE)
- [ ] Activer chiffrement snapshots (hérite du volume)
- [ ] Implémenter chiffrement enveloppe pour exports durables
- [ ] Configurer KMS (AWS KMS, Vault, etc.)
- [ ] Créer job de re-chiffrement périodique
- [ ] Tester rotation de clés
- [ ] Documenter procédure de récupération en cas de compromission

---

**Note** : L'implémentation complète dépend de votre infrastructure cloud (AWS, Azure, GCP) et de votre KMS.
