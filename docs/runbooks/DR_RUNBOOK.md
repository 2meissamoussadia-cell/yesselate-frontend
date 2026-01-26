# Runbooks DR (Disaster Recovery)
## Phase P13: Résilience & DR

---

## 1. Failover DB Planifié (Primary → Standby)

### Prérequis
- Standby configuré et synchronisé
- Monitoring actif (health checks)
- Accès aux deux serveurs (primary et standby)

### Étapes

#### 1.1 Préparation
```bash
# Vérifier le lag de réplication
psql -c "SELECT application_name, replay_lag, state FROM pg_stat_replication;"

# Vérifier le statut du standby
psql -h standby-host -c "SELECT pg_is_in_recovery(), pg_last_wal_replay_lag();"
```

#### 1.2 Arrêter les Writes Non-Critiques
```bash
# Optionnel : Verrouiller endpoints mutation (si existants)
# Via feature flag ou maintenance mode
```

#### 1.3 Promouvoir Standby → Primary
```bash
# Sur le standby
psql -h standby-host -c "SELECT pg_promote();"

# Vérifier la promotion
psql -h standby-host -c "SELECT pg_is_in_recovery();"  # Doit retourner false
```

#### 1.4 Reconfigurer DATABASE_URL
```bash
# Mettre à jour DATABASE_URL dans les variables d'environnement
# Ancien : DATABASE_URL=postgresql://user:pass@primary-host:5432/db
# Nouveau : DATABASE_URL=postgresql://user:pass@standby-host:5432/db

# Redémarrer les services
# - API (Next.js)
# - Workers
```

#### 1.5 Vérification Post-Failover
```bash
# Health check
curl http://localhost:3000/api/internal/health | jq

# Vérifier :
# - db.role='primary'
# - replayLagSec=0 (ou très faible)
# - mviews OK (pas de staleness excessive)
```

#### 1.6 Relancer Worker (si nécessaire)
```bash
# Le worker se reconnectera automatiquement avec backoff
# Vérifier les logs :
tail -f logs/worker.log | grep -i reconnect
```

### Checklist
- [ ] Lag de réplication vérifié (< 5 min)
- [ ] Standby promu en primary
- [ ] DATABASE_URL mis à jour
- [ ] Services redémarrés
- [ ] Health check OK (role=primary, lag=0)
- [ ] MViews cohérentes
- [ ] Worker reconnecté

---

## 2. PITR (Point-In-Time Recovery)

### Scénario
Incident détecté à T, besoin de restaurer à T-Δ (ex. 10 min avant)

### Prérequis
- WAL archiving configuré (wal-g ou autre)
- Base backups disponibles
- Accès au stockage objet (S3, etc.)

### Étapes

#### 2.1 Identifier le Timestamp Cible
```bash
# Timestamp de l'incident
INCIDENT_TIME="2026-01-25 14:30:00"

# Timestamp de restauration (10 min avant)
RESTORE_TIME="2026-01-25 14:20:00"
```

#### 2.2 Arrêter PostgreSQL
```bash
# Sur le serveur à restaurer
sudo systemctl stop postgresql
```

#### 2.3 Restaurer Base Backup
```bash
# Avec wal-g
wal-g backup-fetch /var/lib/postgresql/data LATEST

# Ou restaurer depuis un backup spécifique
wal-g backup-fetch /var/lib/postgresql/data backup-name
```

#### 2.4 Configurer Recovery
```bash
# PostgreSQL 12+ : Créer recovery.signal
touch /var/lib/postgresql/data/recovery.signal

# Configurer postgresql.conf ou recovery.conf
cat > /var/lib/postgresql/data/postgresql.conf <<EOF
restore_command = 'wal-g wal-fetch %f %p'
recovery_target_time = '${RESTORE_TIME}'
recovery_target_action = 'promote'
EOF
```

#### 2.5 Démarrer PostgreSQL
```bash
sudo systemctl start postgresql

# PostgreSQL rejouera les WAL jusqu'au timestamp cible
# Vérifier les logs :
tail -f /var/log/postgresql/postgresql.log | grep -i recovery
```

#### 2.6 Vérifier Cohérence
```bash
# Vérifier le timestamp de restauration
psql -c "SELECT pg_last_xact_replay_timestamp();"

# Requêtes de contrôle (exemples)
psql -c "SELECT COUNT(*) FROM projets WHERE created_at <= '${RESTORE_TIME}';"
psql -c "SELECT COUNT(*) FROM factures WHERE created_at <= '${RESTORE_TIME}';"

# Vérifier les MViews
psql -c "SELECT view_name, refreshed_at FROM mview_refresh_log ORDER BY refreshed_at DESC LIMIT 10;"
```

#### 2.7 Promouvoir en Primary (si reprise définitive)
```bash
# Si PostgreSQL n'a pas été promu automatiquement
psql -c "SELECT pg_promote();"

# Vérifier
psql -c "SELECT pg_is_in_recovery();"  # Doit retourner false
```

#### 2.8 Rafraîchir MViews
```bash
# Rafraîchir toutes les MViews depuis le nouveau point de restauration
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_overview;"
# ... autres MViews
```

#### 2.9 Mesurer RPO et RTO
```bash
# RPO (Recovery Point Objective) : Écart entre incident et dernier WAL
RPO=$(psql -t -c "SELECT EXTRACT(EPOCH FROM (TIMESTAMP '${INCIDENT_TIME}' - pg_last_xact_replay_timestamp()));")
echo "RPO: ${RPO} secondes"

# RTO (Recovery Time Objective) : Temps de restauration complet
# Mesurer depuis le début de la restauration jusqu'à service OK
# Objectif : RPO ≤ 5 min, RTO ≤ 15 min
```

### Checklist
- [ ] Timestamp cible identifié
- [ ] Base backup restauré
- [ ] Recovery configuré (timestamp cible)
- [ ] PostgreSQL démarré et WAL rejoués
- [ ] Cohérence vérifiée (requêtes de contrôle)
- [ ] MViews rafraîchies
- [ ] Promu en primary (si définitif)
- [ ] RPO et RTO mesurés
- [ ] Health check OK

---

## 3. Test de Résilience - Kill DB Primary

### Objectif
Vérifier que le failover fonctionne automatiquement ou avec intervention minimale

### Étapes

#### 3.1 Simuler Panne Primary
```bash
# Arrêter brutalement le primary
sudo systemctl stop postgresql  # Sur le primary

# Ou kill le processus
sudo kill -9 $(pgrep -f postgres)
```

#### 3.2 Vérifier Détection
```bash
# Health check doit détecter la panne
curl http://localhost:3000/api/internal/health | jq
# Doit retourner : ok: false ou erreur de connexion
```

#### 3.3 Promouvoir Standby
```bash
# Suivre le runbook "Failover DB Planifié" (section 1)
```

#### 3.4 Vérifier Workers
```bash
# Les workers doivent se reconnecter automatiquement
# Vérifier les logs :
tail -f logs/worker.log | grep -i reconnect

# Vérifier le heartbeat
psql -c "SELECT * FROM dashboard_worker_heartbeat;"
```

#### 3.5 Vérifier Pages OK
```bash
# Le routeur doit continuer de rendre les vues
# Les loaders retentent si 5xx
curl http://localhost:3000/dashboard/performance
# Doit retourner la page (même si données en cache ou erreur gracieuse)
```

### Critères de Réussite
- [ ] Failover détecté en < 1 min
- [ ] Standby promu en < 5 min
- [ ] Workers reconnectés en < 30s
- [ ] Pages accessibles (routeur fonctionne)
- [ ] Health check OK après failover

---

## 4. Test de Résilience - Coupure Réseau

### Objectif
Vérifier circuit breaker et retry avec backoff

### Étapes

#### 4.1 Simuler Coupure Réseau
```bash
# Bloquer les connexions vers la DB (iptables)
sudo iptables -A OUTPUT -d <db-ip> -j DROP

# Ou simuler avec un firewall
```

#### 4.2 Observer Circuit Breaker
```bash
# Les requêtes doivent échouer
# Après 5 erreurs, circuit breaker doit s'ouvrir
# Vérifier les logs :
tail -f logs/api.log | grep -i circuit
```

#### 4.3 Rétablir Réseau
```bash
# Restaurer les connexions
sudo iptables -D OUTPUT -d <db-ip> -j DROP
```

#### 4.4 Vérifier Rétablissement
```bash
# Circuit breaker doit passer en half-open après 30s
# Puis se fermer après succès
# Vérifier les logs :
tail -f logs/api.log | grep -i circuit
```

### Critères de Réussite
- [ ] Circuit breaker s'ouvre après 5 erreurs
- [ ] Retries avec backoff (pas de thundering herd)
- [ ] Circuit breaker se ferme après rétablissement
- [ ] Pas d'intervention manuelle nécessaire

---

## 5. Test de Résilience - Inondation Exports

### Objectif
Vérifier rate limiting Redis effectif

### Étapes

#### 5.1 Générer Charge
```bash
# Faire 25 requêtes rapides (limite = 20)
for i in {1..25}; do
  curl -H "x-tenant-id: test" -H "x-user-id: test" \
    "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx" &
done
```

#### 5.2 Vérifier Rate Limiting
```bash
# Les 5 dernières requêtes doivent retourner 429
# Vérifier les headers :
curl -I -H "x-tenant-id: test" -H "x-user-id: test" \
  "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx"
# Doit retourner : Retry-After: 60, X-RateLimit-Remaining: ...
```

#### 5.3 Vérifier Mémoire
```bash
# Pas d'épuisement mémoire
# Vérifier l'utilisation :
ps aux | grep node
# Doit rester stable
```

### Critères de Réussite
- [ ] Rate limiting effectif (429 après 20 requêtes)
- [ ] Pas d'épuisement mémoire
- [ ] Headers Retry-After présents
- [ ] Service reste stable

---

## 6. Test PITR - Restauration T-10min

### Objectif
Vérifier PITR fonctionnel avec RPO/RTO mesurés

### Étapes

#### 6.1 Préparer Test
```bash
# Créer des données de test à T
psql -c "INSERT INTO test_table (data, created_at) VALUES ('test', NOW());"

# Noter le timestamp
TEST_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "Test time: ${TEST_TIME}"

# Attendre 10 min
sleep 600

# Créer d'autres données
psql -c "INSERT INTO test_table (data, created_at) VALUES ('test2', NOW());"
```

#### 6.2 Restaurer à T-10min
```bash
# Suivre le runbook "PITR" (section 2)
# Restaurer à : ${TEST_TIME} - 10 minutes
```

#### 6.3 Vérifier Cohérence
```bash
# Les données créées après T-10min ne doivent pas exister
psql -c "SELECT * FROM test_table WHERE created_at > '${TEST_TIME}';"
# Doit retourner 0 lignes (ou seulement les données avant T-10min)
```

#### 6.4 Mesurer RPO/RTO
```bash
# RPO : Écart entre incident et dernier WAL
# RTO : Temps de restauration complet
# Objectifs : RPO ≤ 5 min, RTO ≤ 15 min
```

### Critères de Réussite
- [ ] Restauration réussie à T-10min
- [ ] Cohérence vérifiée (données correctes)
- [ ] RPO ≤ 5 min
- [ ] RTO ≤ 15 min
- [ ] MViews rafraîchies et cohérentes

---

## 7. Exercice DR Trimestriel

### Planning
- **Fréquence** : Trimestrielle (tous les 3 mois)
- **Durée** : 2-4 heures
- **Participants** : Équipe DevOps + DBA + Développeurs

### Scénarios à Tester
1. **Failover DB** (section 1)
2. **PITR** (section 2)
3. **Coupure réseau** (section 4)
4. **Saturation disque** (nouveau)
5. **Worker crash** (nouveau)

### Checklist Post-Exercice
- [ ] RPO mesuré et documenté
- [ ] RTO mesuré et documenté
- [ ] Runbooks mis à jour si nécessaire
- [ ] Métriques DR vérifiées
- [ ] Rapport d'exercice rédigé
- [ ] Actions correctives identifiées

---

## 8. Contacts & Escalade

### Niveau 1 - Détection
- Monitoring : Alertes automatiques (Prometheus/Grafana)
- Health checks : `/api/internal/health` toutes les 30s

### Niveau 2 - Intervention
- On-call : Rotation équipe DevOps
- Runbooks : Ce document

### Niveau 3 - Escalade
- DBA : Pour failover/PITR complexes
- Architecte : Pour décisions stratégiques

---

## 9. Métriques à Surveiller

### RPO (Recovery Point Objective)
- **Cible** : ≤ 5 minutes
- **Mesure** : Écart entre incident et dernier WAL archivé
- **Métrique** : `db_replay_lag_seconds` (Prometheus)

### RTO (Recovery Time Objective)
- **Cible** : ≤ 15 minutes
- **Mesure** : Temps de restauration complet (détection → service OK)
- **Métrique** : `dr_recovery_time_seconds` (Prometheus)

### Disponibilité
- **Cible** : 99.9% (8.76h d'indisponibilité/an max)
- **Mesure** : Uptime monitoring (Prometheus)

---

**Dernière mise à jour** : 2026-01-25  
**Prochaine révision** : 2026-04-25 (trimestriel)
