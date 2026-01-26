# Plan de Tests Résilience
## Phase P13: Résilience & DR

---

## 🎯 Objectifs

Valider la résilience du système face aux incidents :
- **Failover DB** : Bascule automatique ou manuelle primary → standby
- **Coupure réseau** : Circuit breaker et retry avec backoff
- **Inondation requêtes** : Rate limiting Redis effectif
- **PITR** : Restauration à T-Δ avec validation RPO/RTO

---

## Test 1 – Kill DB Primaire

### Objectif
Vérifier que le failover fonctionne, les workers se reconnectent, le health check détecte le changement, et les pages restent accessibles.

### Prérequis
- Primary et standby PostgreSQL configurés
- Worker en cours d'exécution
- Health check actif (`/api/internal/health`)

### Étapes

#### 1.1 État Initial
```bash
# Vérifier l'état initial
curl http://localhost:3000/api/internal/health | jq
# Doit retourner : db.role='primary', replayLagSec=0

# Vérifier le worker
psql -c "SELECT * FROM dashboard_worker_heartbeat ORDER BY last_seen DESC LIMIT 1;"
```

#### 1.2 Simuler Panne Primary
```bash
# Arrêter brutalement le primary
sudo systemctl stop postgresql  # Sur le primary

# Ou kill le processus
sudo kill -9 $(pgrep -f postgres)  # Sur le primary
```

#### 1.3 Vérifier Détection
```bash
# Health check doit détecter la panne
curl http://localhost:3000/api/internal/health | jq
# Doit retourner : ok: false ou erreur de connexion

# Attendre 30 secondes pour la détection
sleep 30
```

#### 1.4 Promouvoir Standby → Primary
```bash
# Suivre le runbook "Failover DB Planifié" (DR_RUNBOOK.md section 1)

# Sur le standby
psql -h standby-host -c "SELECT pg_promote();"

# Vérifier la promotion
psql -h standby-host -c "SELECT pg_is_in_recovery();"  # Doit retourner false
```

#### 1.5 Reconfigurer DATABASE_URL
```bash
# Mettre à jour DATABASE_URL dans les variables d'environnement
# Ancien : DATABASE_URL=postgresql://user:pass@primary-host:5432/db
# Nouveau : DATABASE_URL=postgresql://user:pass@standby-host:5432/db

# Redémarrer les services
sudo systemctl restart nextjs-api  # Si applicable
# Le worker se reconnectera automatiquement
```

#### 1.6 Vérifier Workers Reconnectés
```bash
# Vérifier les logs du worker
tail -f logs/worker.log | grep -i reconnect

# Vérifier le heartbeat (doit être mis à jour)
psql -c "SELECT * FROM dashboard_worker_heartbeat ORDER BY last_seen DESC LIMIT 1;"

# Vérifier les métriques
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep worker_pg_reconnects_total
```

#### 1.7 Vérifier Health Check Primary
```bash
# Health check doit indiquer primary
curl http://localhost:3000/api/internal/health | jq
# Doit retourner :
# {
#   "ok": true,
#   "db": {
#     "role": "primary",
#     "replayLagSec": 0
#   },
#   "mviews": [...]
# }
```

#### 1.8 Vérifier Pages OK
```bash
# Le routeur doit continuer de rendre les vues
curl http://localhost:3000/dashboard/performance
# Doit retourner la page (même si données en cache ou erreur gracieuse)

# Les loaders retentent si 5xx
# Vérifier dans les DevTools du navigateur que les requêtes sont retentées
```

### Critères de Réussite
- [ ] Failover détecté en < 1 min
- [ ] Standby promu en < 5 min
- [ ] Workers reconnectés en < 30s (métrique `worker_pg_reconnects_total` incrémentée)
- [ ] Health check OK après failover (role='primary', lag=0)
- [ ] Pages accessibles (routeur fonctionne)
- [ ] MViews cohérentes

---

## Test 2 – Coupure Réseau 2 min

### Objectif
Vérifier que le circuit breaker s'ouvre, les retries utilisent le backoff, et le rétablissement se fait sans intervention.

### Prérequis
- API en cours d'exécution
- Circuit breaker configuré (5 erreurs → open, reset après 30s)

### Étapes

#### 2.1 État Initial
```bash
# Vérifier que l'API fonctionne
curl http://localhost:3000/api/dashboard/performance/overview/summary
# Doit retourner 200 OK
```

#### 2.2 Simuler Coupure Réseau
```bash
# Bloquer les connexions vers la DB (iptables)
DB_IP=$(echo $DATABASE_URL | grep -oP '@\K[^:]+')
sudo iptables -A OUTPUT -d ${DB_IP} -j DROP

# Ou simuler avec un firewall
# sudo ufw deny out to ${DB_IP} port 5432
```

#### 2.3 Observer Circuit Breaker
```bash
# Faire plusieurs requêtes (doivent échouer)
for i in {1..10}; do
  curl -s http://localhost:3000/api/dashboard/performance/overview/summary
  sleep 0.5
done

# Vérifier les logs
tail -f logs/api.log | grep -i circuit

# Après 5 erreurs, circuit breaker doit s'ouvrir
# Vérifier les métriques
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep circuit_open_total
```

#### 2.4 Vérifier Retries avec Backoff
```bash
# Les retries doivent utiliser le backoff exponentiel
# Vérifier les logs pour les délais entre tentatives
tail -f logs/api.log | grep -i retry

# Vérifier les métriques
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep retry_attempts_total
```

#### 2.5 Rétablir Réseau
```bash
# Restaurer les connexions
sudo iptables -D OUTPUT -d ${DB_IP} -j DROP

# Ou restaurer avec ufw
# sudo ufw allow out to ${DB_IP} port 5432
```

#### 2.6 Vérifier Rétablissement
```bash
# Attendre 30s (reset du circuit breaker)
sleep 30

# Circuit breaker doit passer en half-open après 30s
# Puis se fermer après succès

# Faire une requête
curl http://localhost:3000/api/dashboard/performance/overview/summary
# Doit retourner 200 OK

# Vérifier les logs
tail -f logs/api.log | grep -i circuit
```

### Critères de Réussite
- [ ] Circuit breaker s'ouvre après 5 erreurs (métrique `circuit_open_total` incrémentée)
- [ ] Retries avec backoff exponentiel (pas de thundering herd)
- [ ] Circuit breaker se ferme après rétablissement (half-open → closed)
- [ ] Pas d'intervention manuelle nécessaire
- [ ] Service opérationnel après rétablissement

---

## Test 3 – Inondation Requêtes Export

### Objectif
Vérifier que le rate limiting Redis est effectif et qu'il n'y a pas d'épuisement mémoire.

### Prérequis
- API en cours d'exécution
- Redis configuré pour rate limiting
- Limite : 20 requêtes/minute (exemple)

### Étapes

#### 3.1 État Initial
```bash
# Vérifier l'utilisation mémoire
ps aux | grep node | awk '{print $4, $11}'

# Vérifier Redis
redis-cli ping
```

#### 3.2 Générer Charge
```bash
# Faire 25 requêtes rapides (limite = 20)
for i in {1..25}; do
  curl -H "x-tenant-id: test" -H "x-user-id: test" \
    "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx" &
done

# Attendre la fin
wait
```

#### 3.3 Vérifier Rate Limiting
```bash
# Les 5 dernières requêtes doivent retourner 429
curl -I -H "x-tenant-id: test" -H "x-user-id: test" \
  "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx"

# Doit retourner :
# HTTP/1.1 429 Too Many Requests
# Retry-After: 60
# X-RateLimit-Remaining: 0
# X-RateLimit-Limit: 20

# Vérifier les logs
tail -f logs/api.log | grep -i "rate limit"
```

#### 3.4 Vérifier Mémoire
```bash
# Pas d'épuisement mémoire
ps aux | grep node | awk '{print $4, $11}'
# Doit rester stable (pas de croissance excessive)

# Vérifier Redis
redis-cli info memory
# Doit rester raisonnable
```

#### 3.5 Vérifier Service Stable
```bash
# Les autres endpoints doivent fonctionner normalement
curl http://localhost:3000/api/dashboard/performance/overview/summary
# Doit retourner 200 OK
```

### Critères de Réussite
- [ ] Rate limiting effectif (429 après 20 requêtes)
- [ ] Headers Retry-After présents
- [ ] Pas d'épuisement mémoire
- [ ] Service reste stable
- [ ] Redis fonctionne correctement (circuit breaker fail-open si Redis indisponible)

---

## Test 4 – PITR : Reprise à T-10 min

### Objectif
Vérifier que la restauration PITR fonctionne, que les MViews sont cohérentes, et que RPO/RTO sont mesurés.

### Prérequis
- WAL archiving configuré (wal-g)
- Base backups disponibles
- Accès au stockage objet (S3, etc.)

### Étapes

#### 4.1 Préparer Test
```bash
# Créer des données de test à T
psql -c "CREATE TABLE IF NOT EXISTS pitr_test (id SERIAL, data TEXT, created_at TIMESTAMP DEFAULT NOW());"
psql -c "INSERT INTO pitr_test (data) VALUES ('test-before');"

# Noter le timestamp
TEST_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "Test time: ${TEST_TIME}"

# Attendre 10 minutes
sleep 600

# Créer d'autres données après T
psql -c "INSERT INTO pitr_test (data) VALUES ('test-after');"
```

#### 4.2 Restaurer à T-10min
```bash
# Calculer T-10min
RESTORE_TIME=$(date -d '10 minutes ago' '+%Y-%m-%d %H:%M:%S')
echo "Restore time: ${RESTORE_TIME}"

# Suivre le runbook "PITR" (DR_RUNBOOK.md section 2)
# Ou utiliser le script
sudo /usr/local/bin/postgres-pitr-restore.sh "${RESTORE_TIME}"
```

#### 4.3 Vérifier Cohérence
```bash
# Les données créées après T-10min ne doivent pas exister
psql -c "SELECT * FROM pitr_test WHERE created_at > '${RESTORE_TIME}';"
# Doit retourner 0 lignes (ou seulement les données avant T-10min)

# Vérifier les MViews
psql -c "SELECT view_name, refreshed_at FROM mview_refresh_log ORDER BY refreshed_at DESC LIMIT 10;"
```

#### 4.4 Contrôle MViews
```bash
# Rafraîchir toutes les MViews depuis le nouveau point de restauration
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_overview;"
# ... autres MViews

# Vérifier la cohérence
psql -c "SELECT view_name, refreshed_at, now() - refreshed_at as age FROM mview_refresh_log ORDER BY refreshed_at DESC LIMIT 10;"
```

#### 4.5 Mesurer RPO et RTO
```bash
# RPO (Recovery Point Objective) : Écart entre incident et dernier WAL
INCIDENT_TIME="${TEST_TIME}"
LAST_WAL_TIME=$(psql -t -c "SELECT pg_last_xact_replay_timestamp();")
RPO=$(psql -t -c "SELECT EXTRACT(EPOCH FROM (TIMESTAMP '${INCIDENT_TIME}' - '${LAST_WAL_TIME}'));")
echo "RPO: ${RPO} secondes (objectif: ≤ 300s = 5 min)"

# RTO (Recovery Time Objective) : Temps de restauration complet
# Mesurer depuis le début de la restauration jusqu'à service OK
START_TIME=$(date +%s)  # Au début de la restauration
END_TIME=$(date +%s)    # Quand le service est OK
RTO=$((END_TIME - START_TIME))
echo "RTO: ${RTO} secondes (objectif: ≤ 900s = 15 min)"

# Vérifier les métriques Prometheus
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep dr_recovery_time_seconds
```

### Critères de Réussite
- [ ] Restauration réussie à T-10min
- [ ] Cohérence vérifiée (données correctes)
- [ ] RPO ≤ 5 min (300s)
- [ ] RTO ≤ 15 min (900s)
- [ ] MViews rafraîchies et cohérentes
- [ ] Health check OK après restauration

---

## 5. Métriques à Vérifier

### 5.1 Métriques Prometheus

```bash
# Récupérer toutes les métriques
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics

# Métriques spécifiques DR
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep -E "(db_replay_lag_seconds|db_role|worker_pg_reconnects_total|worker_refresh_failures_total|circuit_open_total|retry_attempts_total)"
```

### 5.2 Alertes à Vérifier

- `db_replay_lag_seconds > 60` (warning)
- `db_replay_lag_seconds > 300` (critical)
- `circuit_open_total` (circuit breaker ouvert)
- `worker_pg_reconnects_total` (reconnexions worker)

---

## 6. Rapport de Test

### 6.1 Template

```markdown
# Rapport de Test Résilience - [Date]

## Test 1 – Kill DB Primaire
- **Statut** : ✅ Réussi / ❌ Échoué
- **Temps failover** : X min
- **Temps reconnexion worker** : X s
- **Observations** : ...

## Test 2 – Coupure Réseau
- **Statut** : ✅ Réussi / ❌ Échoué
- **Temps ouverture circuit breaker** : X s
- **Temps rétablissement** : X s
- **Observations** : ...

## Test 3 – Inondation Exports
- **Statut** : ✅ Réussi / ❌ Échoué
- **Rate limiting effectif** : Oui / Non
- **Mémoire stable** : Oui / Non
- **Observations** : ...

## Test 4 – PITR
- **Statut** : ✅ Réussi / ❌ Échoué
- **RPO mesuré** : X s (objectif: ≤ 300s)
- **RTO mesuré** : X s (objectif: ≤ 900s)
- **Observations** : ...

## Actions Correctives
- [ ] Action 1
- [ ] Action 2
```

---

**Dernière mise à jour** : 2026-01-26  
**Prochaine révision** : 2026-04-26 (trimestriel)
