# PITR & Sauvegardes PostgreSQL
## Phase P13: Résilience & DR

---

## 🎯 Objectifs

- **RPO (Recovery Point Objective)** : ≤ 5 minutes
- **RTO (Recovery Time Objective)** : ≤ 15 minutes
- **WAL archiving** : Vers stockage objet (S3, Azure Blob, etc.)
- **Base backups** : Journalières, chiffrées
- **PITR** : Restauration à un instant T-Δ (ex. 10 min avant incident)

---

## 1. Configuration WAL Archiving

### 1.1 Installation wal-g

**Ubuntu/Debian** :
```bash
# Télécharger wal-g
wget https://github.com/wal-g/wal-g/releases/latest/download/wal-g-linux-amd64.tar.gz
tar -xzf wal-g-linux-amd64.tar.gz
sudo mv wal-g /usr/local/bin/
sudo chmod +x /usr/local/bin/wal-g
```

**macOS** :
```bash
brew install wal-g
```

### 1.2 Configuration S3 (exemple)

**Variables d'environnement** (`/etc/postgresql/14/main/environment`) :
```bash
export WALG_S3_PREFIX="s3://bucket-name/postgres-backups/"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="eu-west-1"
export WALG_S3_STORAGE_CLASS="STANDARD_IA"  # Intelligent Tiering
export WALG_S3_USE_LIST_OBJECT_V1="true"    # Si nécessaire
```

**Alternative Azure Blob** :
```bash
export WALG_AZ_PREFIX="azure://container-name/backups/"
export AZURE_STORAGE_ACCOUNT="account-name"
export AZURE_STORAGE_ACCESS_KEY="access-key"
```

### 1.3 Configuration PostgreSQL

**Fichier** : `/etc/postgresql/14/main/postgresql.conf`

```conf
# WAL Archiving
archive_mode = on
archive_command = 'wal-g wal-push %p'
archive_timeout = 300  # Force archive toutes les 5 min (RPO)

# Réplication (si applicable)
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB  # Garder WAL local pour réplication rapide

# Performance
checkpoint_timeout = 15min
max_wal_size = 2GB
```

**Redémarrer PostgreSQL** :
```bash
sudo systemctl restart postgresql
```

### 1.4 Vérification WAL Archiving

```bash
# Vérifier que l'archivage fonctionne
psql -c "SELECT pg_switch_wal();"  # Force un switch WAL
tail -f /var/log/postgresql/postgresql.log | grep -i archive

# Vérifier les WAL archivés dans S3
wal-g wal-list
```

---

## 2. Base Backups Journalières

### 2.1 Script de Backup

**Fichier** : `/usr/local/bin/postgres-backup.sh`

```bash
#!/bin/bash
# Script de backup PostgreSQL avec wal-g
# Phase P13: Résilience & DR

set -euo pipefail

BACKUP_DIR="/var/backups/postgres"
LOG_FILE="/var/log/postgresql/backup.log"
RETENTION_DAYS=30

# Créer le répertoire si nécessaire
mkdir -p "${BACKUP_DIR}"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

log "Début du backup PostgreSQL"

# Backup avec wal-g
if wal-g backup-push /var/lib/postgresql/14/main; then
    log "✅ Backup réussi"
    
    # Nettoyer les anciens backups (garder 30 jours)
    wal-g delete retain ${RETENTION_DAYS} --confirm || log "⚠️ Échec nettoyage anciens backups"
    
    # Lister les backups disponibles
    BACKUP_COUNT=$(wal-g backup-list | wc -l)
    log "Backups disponibles: ${BACKUP_COUNT}"
else
    log "❌ Échec du backup"
    exit 1
fi

log "Fin du backup PostgreSQL"
```

**Rendre exécutable** :
```bash
sudo chmod +x /usr/local/bin/postgres-backup.sh
```

### 2.2 CRON - Backup Journalier

**Crontab** (`sudo crontab -e`) :
```cron
# Backup PostgreSQL quotidien à 2h du matin
0 2 * * * /usr/local/bin/postgres-backup.sh >> /var/log/postgresql/backup.log 2>&1
```

### 2.3 Vérification Backups

```bash
# Lister les backups
wal-g backup-list

# Vérifier le dernier backup
wal-g backup-list | head -1

# Informations sur un backup spécifique
wal-g backup-show backup-name
```

---

## 3. PITR (Point-In-Time Recovery)

### 3.1 Scénario de Restauration

**Incident détecté** : T = `2026-01-26 14:30:00`  
**Restauration cible** : T-Δ = `2026-01-26 14:20:00` (10 min avant)

### 3.2 Script de Restauration PITR

**Fichier** : `/usr/local/bin/postgres-pitr-restore.sh`

```bash
#!/bin/bash
# Script de restauration PITR avec wal-g
# Phase P13: Résilience & DR

set -euo pipefail

RESTORE_TIME="${1:-}"  # Format: '2026-01-26 14:20:00'
DATA_DIR="/var/lib/postgresql/14/main"
LOG_FILE="/var/log/postgresql/pitr-restore.log"

if [ -z "${RESTORE_TIME}" ]; then
    echo "Usage: $0 'YYYY-MM-DD HH:MM:SS'"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

log "Début restauration PITR à ${RESTORE_TIME}"

# 1. Arrêter PostgreSQL
log "Arrêt de PostgreSQL..."
sudo systemctl stop postgresql

# 2. Sauvegarder l'ancien data directory (sécurité)
BACKUP_OLD_DIR="/var/backups/postgres/data-$(date +%Y%m%d-%H%M%S)"
log "Sauvegarde ancien data directory vers ${BACKUP_OLD_DIR}"
sudo mv "${DATA_DIR}" "${BACKUP_OLD_DIR}"

# 3. Restaurer le dernier base backup
log "Restauration du dernier base backup..."
wal-g backup-fetch "${DATA_DIR}" LATEST

# 4. Configurer recovery
log "Configuration recovery pour timestamp ${RESTORE_TIME}..."
cat > "${DATA_DIR}/recovery.conf" <<EOF
restore_command = 'wal-g wal-fetch %f %p'
recovery_target_time = '${RESTORE_TIME}'
recovery_target_action = 'promote'
EOF

# PostgreSQL 12+ : Utiliser recovery.signal
touch "${DATA_DIR}/recovery.signal"

# 5. Démarrer PostgreSQL
log "Démarrage PostgreSQL en mode recovery..."
sudo systemctl start postgresql

# 6. Attendre la fin de la recovery
log "Attente de la fin de la recovery..."
sleep 5
while sudo systemctl is-active --quiet postgresql; do
    RECOVERY_STATUS=$(sudo -u postgres psql -t -c "SELECT pg_is_in_recovery();" 2>/dev/null || echo "t")
    if [ "${RECOVERY_STATUS}" = "f" ]; then
        log "✅ Recovery terminée"
        break
    fi
    sleep 2
done

# 7. Vérifier le timestamp de restauration
RESTORED_TIME=$(sudo -u postgres psql -t -c "SELECT pg_last_xact_replay_timestamp();" 2>/dev/null || echo "")
log "Timestamp restauré: ${RESTORED_TIME}"

log "Fin restauration PITR"
```

**Rendre exécutable** :
```bash
sudo chmod +x /usr/local/bin/postgres-pitr-restore.sh
```

### 3.3 Utilisation

```bash
# Restaurer à un timestamp spécifique
sudo /usr/local/bin/postgres-pitr-restore.sh '2026-01-26 14:20:00'

# Vérifier les logs
tail -f /var/log/postgresql/pitr-restore.log
```

---

## 4. Test de PITR

### 4.1 Préparation Test

```bash
# 1. Créer des données de test à T
psql -c "CREATE TABLE IF NOT EXISTS pitr_test (id SERIAL, data TEXT, created_at TIMESTAMP DEFAULT NOW());"
psql -c "INSERT INTO pitr_test (data) VALUES ('test-before');"

# 2. Noter le timestamp
TEST_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "Test time: ${TEST_TIME}"

# 3. Attendre 10 minutes
sleep 600

# 4. Créer d'autres données après T
psql -c "INSERT INTO pitr_test (data) VALUES ('test-after');"
```

### 4.2 Restauration T-10min

```bash
# Calculer T-10min
RESTORE_TIME=$(date -d '10 minutes ago' '+%Y-%m-%d %H:%M:%S')
echo "Restore time: ${RESTORE_TIME}"

# Restaurer
sudo /usr/local/bin/postgres-pitr-restore.sh "${RESTORE_TIME}"
```

### 4.3 Vérification Cohérence

```bash
# Les données créées après T-10min ne doivent pas exister
psql -c "SELECT * FROM pitr_test WHERE created_at > '${RESTORE_TIME}';"
# Doit retourner 0 lignes (ou seulement les données avant T-10min)

# Vérifier les MViews
psql -c "SELECT view_name, refreshed_at FROM mview_refresh_log ORDER BY refreshed_at DESC LIMIT 10;"
```

### 4.4 Mesurer RPO et RTO

```bash
# RPO (Recovery Point Objective) : Écart entre incident et dernier WAL
INCIDENT_TIME="2026-01-26 14:30:00"
LAST_WAL_TIME=$(psql -t -c "SELECT pg_last_xact_replay_timestamp();")
RPO=$(psql -t -c "SELECT EXTRACT(EPOCH FROM (TIMESTAMP '${INCIDENT_TIME}' - '${LAST_WAL_TIME}'));")
echo "RPO: ${RPO} secondes (objectif: ≤ 300s = 5 min)"

# RTO (Recovery Time Objective) : Temps de restauration complet
# Mesurer depuis le début de la restauration jusqu'à service OK
# Objectif: ≤ 900s = 15 min
```

---

## 5. Validation Post-Restauration

### 5.1 Vérifications Requises

```bash
# 1. Health check
curl http://localhost:3000/api/internal/health | jq

# Vérifier :
# - db.role='primary' (ou 'standby' si applicable)
# - replayLagSec=0 (ou très faible)
# - mviews OK (pas de staleness excessive)

# 2. Cohérence MViews
psql -c "SELECT view_name, refreshed_at, now() - refreshed_at as age FROM mview_refresh_log ORDER BY refreshed_at DESC LIMIT 10;"

# 3. Requêtes de contrôle
psql -c "SELECT COUNT(*) FROM projets WHERE created_at <= '${RESTORE_TIME}';"
psql -c "SELECT COUNT(*) FROM factures WHERE created_at <= '${RESTORE_TIME}';"
```

### 5.2 Rafraîchir MViews

```bash
# Rafraîchir toutes les MViews depuis le nouveau point de restauration
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_overview;"
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_overview;"
# ... autres MViews selon besoin
```

### 5.3 Promouvoir en Primary (si nécessaire)

```bash
# Si PostgreSQL n'a pas été promu automatiquement
psql -c "SELECT pg_promote();"

# Vérifier
psql -c "SELECT pg_is_in_recovery();"  # Doit retourner false
```

---

## 6. Monitoring & Alertes

### 6.1 Métriques à Surveiller

- **RPO** : `db_replay_lag_seconds` (Prometheus)
  - Alert si > 300s (5 min)
- **RTO** : `dr_recovery_time_seconds` (Prometheus)
  - Alert si > 900s (15 min)
- **Backup success rate** : Taux de succès des backups
- **WAL archive lag** : Délai entre génération et archivage WAL

### 6.2 Alertes Prometheus

```yaml
# Exemple d'alerte (prometheus/alerts.yml)
groups:
  - name: postgres_backup
    rules:
      - alert: HighReplicationLag
        expr: dashboard_db_replay_lag_seconds > 300
        for: 5m
        annotations:
          summary: "Replication lag > 5 min (RPO)"
          
      - alert: BackupFailed
        expr: increase(postgres_backup_failures_total[1h]) > 0
        annotations:
          summary: "Backup PostgreSQL échoué"
```

---

## 7. Notes de Configuration

### 7.1 Stockage Objet

**S3** (recommandé) :
- Classe de stockage : `STANDARD_IA` (Intelligent Tiering) pour économies
- Lifecycle policy : Transition vers Glacier après 90 jours
- Versioning : Activé pour sécurité supplémentaire

**Azure Blob** :
- Tier : `Hot` pour accès fréquent, `Cool` pour archives
- Lifecycle : Transition automatique vers `Archive` après 90 jours

### 7.2 Sécurité

- **Chiffrement** : WAL-g chiffre automatiquement les backups
- **IAM** : Utiliser des rôles IAM avec permissions minimales
- **Rotation des clés** : Rotation régulière des credentials S3/Azure

### 7.3 Performance

- **Parallélisation** : WAL-g supporte la compression parallèle
- **Compression** : Utiliser `lz4` ou `zstd` pour vitesse
- **Déduplication** : WAL-g déduplique automatiquement les blocs

---

## 8. Script Illustratif d'Archive

**Fichier** : `/usr/local/bin/postgres-wal-archive-example.sh`

```bash
#!/bin/bash
# Script illustratif d'archive WAL vers S3
# À adapter selon votre infrastructure

set -euo pipefail

WAL_FILE="${1}"  # Fichier WAL à archiver (ex: /var/lib/postgresql/14/main/pg_wal/000000010000000000000001)
S3_BUCKET="postgres-wal-archive"
S3_PREFIX="wal-archive/"

# Upload vers S3 avec wal-g
wal-g wal-push "${WAL_FILE}"

# Alternative manuelle (si wal-g non disponible)
# aws s3 cp "${WAL_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}$(basename ${WAL_FILE})"

# Log
echo "[$(date)] Archived ${WAL_FILE} to S3"
```

**Configuration PostgreSQL** :
```conf
archive_command = '/usr/local/bin/postgres-wal-archive-example.sh %p'
```

---

## 9. Checklist Déploiement

- [ ] wal-g installé et configuré
- [ ] Variables d'environnement S3/Azure configurées
- [ ] `postgresql.conf` mis à jour (archive_mode, archive_command)
- [ ] PostgreSQL redémarré
- [ ] WAL archiving testé (`pg_switch_wal()`)
- [ ] Script de backup journalier créé et testé
- [ ] CRON configuré pour backups quotidiens
- [ ] Script PITR créé et testé
- [ ] Test de restauration T-10min effectué
- [ ] RPO et RTO mesurés et validés
- [ ] Monitoring et alertes configurés
- [ ] Documentation mise à jour

---

**Dernière mise à jour** : 2026-01-26  
**Prochaine révision** : 2026-04-26 (trimestriel)
