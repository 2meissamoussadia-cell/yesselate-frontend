# Checklist Déploiement P13 – Résilience & DR
## Phase P13: Résilience & DR

---

## 🎯 Objectifs

Déployer les composants de résilience et DR sans impact UX :
- Health endpoint étendu
- Worker robustifié avec reconnexion automatique
- Circuit breaker et retry
- Rate limiting Redis avec résilience
- Documentation runbooks et PITR

**Règle** : Aucun changement d'UX. Le routeur avancé, le registry, la Sidebar/Subnav et la KPI Bar restent inchangés.

---

## 1. Base de Données

### 1.1 Réplication PostgreSQL

- [ ] Réplication configurée (primary + standby)
- [ ] Streaming replication activée
- [ ] `pg_stat_replication` accessible (permissions)
- [ ] Lag de réplication < 5 min (RPO)

**Vérification** :
```bash
psql -c "SELECT application_name, replay_lag, state FROM pg_stat_replication;"
psql -h standby-host -c "SELECT pg_is_in_recovery(), pg_last_wal_replay_lag();"
```

### 1.2 WAL Archiving

- [ ] wal-g installé et configuré
- [ ] Variables d'environnement S3/Azure configurées
- [ ] `postgresql.conf` mis à jour :
  - `archive_mode = on`
  - `archive_command = 'wal-g wal-push %p'`
  - `archive_timeout = 300` (5 min)
- [ ] PostgreSQL redémarré
- [ ] WAL archiving testé (`pg_switch_wal()`)

**Vérification** :
```bash
wal-g wal-list
tail -f /var/log/postgresql/postgresql.log | grep -i archive
```

### 1.3 Base Backups Journalières

- [ ] Script de backup créé (`/usr/local/bin/postgres-backup.sh`)
- [ ] CRON configuré (backup quotidien à 2h)
- [ ] Backups testés et validés
- [ ] Retention configurée (30 jours)

**Vérification** :
```bash
wal-g backup-list
sudo /usr/local/bin/postgres-backup.sh
```

### 1.4 pgBouncer (Optionnel)

- [ ] pgBouncer installé et configuré
- [ ] Mode transaction pooling activé
- [ ] Limite de connexions par pool configurée
- [ ] Health check intégré

---

## 2. API

### 2.1 Health Endpoint Étendu

- [ ] `app/api/internal/health/route.ts` mis à jour
- [ ] Rôle DB exposé (`db.role`: 'primary' | 'standby')
- [ ] Replication lag exposé (`db.replayLagSec`)
- [ ] MViews staleness exposé
- [ ] Métriques Prometheus mises à jour (`db_replay_lag_seconds`, `db_role`)

**Vérification** :
```bash
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

### 2.2 Circuit Breaker

- [ ] `lib/server/resilience/circuit.ts` créé
- [ ] Circuit breaker intégré dans `rateLimitRedis.ts`
- [ ] Métriques exposées (`circuit_open_total`)

**Vérification** :
```bash
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep circuit_open_total
```

### 2.3 Retry avec Backoff

- [ ] `lib/server/resilience/retry.ts` créé
- [ ] Retry intégré dans `rateLimitRedis.ts`
- [ ] Helpers `isPostgresRetryable()` et `isRedisRetryable()` disponibles
- [ ] Métriques exposées (`retry_attempts_total`)

**Vérification** :
```bash
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep retry_attempts_total
```

### 2.4 Rate Limiting Redis

- [ ] `lib/server/observability/rateLimitRedis.ts` mis à jour
- [ ] Circuit breaker intégré (fail-open si Redis indisponible)
- [ ] Retry avec backoff pour erreurs réseau
- [ ] Testé avec inondation de requêtes

**Vérification** :
```bash
# Faire 25 requêtes rapides (limite = 20)
for i in {1..25}; do
  curl -H "x-tenant-id: test" "http://localhost:3000/api/export/dashboard?format=xlsx" &
done
# Les 5 dernières doivent retourner 429
```

---

## 3. Workers

### 3.1 Worker Event-Driven Robustifié

- [ ] `lib/server/dashboard/workers/refreshMViewsWorker.ts` mis à jour
- [ ] Reconnexion automatique avec backoff exponentiel
- [ ] Gestion d'erreurs (`client.on('error')`)
- [ ] Arrêt gracieux (SIGTERM/SIGINT)
- [ ] Métriques de reconnexion (`worker_pg_reconnects_total`)

**Vérification** :
```bash
# Tuer le worker, vérifier la reconnexion
kill -9 $(pgrep -f refreshMViewsWorker)
tail -f logs/worker.log | grep -i reconnect

# Vérifier les métriques
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep worker_pg_reconnects_total
```

### 3.2 Métriques Worker

- [ ] `worker_pg_reconnects_total` exposé
- [ ] `worker_refresh_failures_total` exposé
- [ ] Métriques incrémentées lors des reconnexions/échecs

---

## 4. Observabilité

### 4.1 Métriques Prometheus

- [ ] `db_replay_lag_seconds` (Gauge)
- [ ] `db_role` (Gauge)
- [ ] `worker_pg_reconnects_total` (Counter)
- [ ] `worker_refresh_failures_total` (Counter)
- [ ] `circuit_open_total` (Counter)
- [ ] `retry_attempts_total` (Counter)
- [ ] `dr_recovery_time_seconds` (Histogram)

**Vérification** :
```bash
curl -H "x-metrics-secret: ${METRICS_SECRET}" http://localhost:3000/api/internal/metrics | grep -E "(db_replay_lag_seconds|db_role|worker_pg_reconnects_total|worker_refresh_failures_total|circuit_open_total|retry_attempts_total|dr_recovery_time_seconds)"
```

### 4.2 Alertes

- [ ] `db_replay_lag_seconds > 60` (warning)
- [ ] `db_replay_lag_seconds > 300` (critical)
- [ ] `circuit_open_total` (circuit breaker ouvert)
- [ ] `worker_pg_reconnects_total` (reconnexions fréquentes)

**Configuration** (exemple Prometheus) :
```yaml
groups:
  - name: resilience
    rules:
      - alert: HighReplicationLag
        expr: dashboard_db_replay_lag_seconds > 300
        for: 5m
        annotations:
          summary: "Replication lag > 5 min (RPO)"
```

### 4.3 Traces

- [ ] CorrID (P4) conservé de bout en bout
- [ ] Traces incluent informations de résilience (circuit breaker, retry)

---

## 5. Documentation

### 5.1 Runbooks DR

- [ ] `docs/runbooks/DR_RUNBOOK.md` créé/mis à jour
- [ ] Failover DB planifié documenté
- [ ] PITR documenté
- [ ] Tests de résilience documentés

### 5.2 Documentation PITR/Backup

- [ ] `docs/database/PITR_BACKUP.md` créé
- [ ] Configuration WAL archiving documentée
- [ ] Scripts de backup documentés
- [ ] Scripts PITR documentés

### 5.3 Plan de Tests QA

- [ ] `docs/qa/RESILIENCE_TEST_PLAN.md` créé
- [ ] Test 1 – Kill DB primaire
- [ ] Test 2 – Coupure réseau
- [ ] Test 3 – Inondation exports
- [ ] Test 4 – PITR

### 5.4 Checklist Déploiement

- [ ] `docs/deployment/P13_DEPLOYMENT_CHECKLIST.md` créé (ce document)

---

## 6. Tests de Validation

### 6.1 Health Check

- [ ] `/api/internal/health` retourne rôle DB
- [ ] `/api/internal/health` retourne lag de réplication
- [ ] `/api/internal/health` retourne staleness MViews

### 6.2 Worker Reconnexion

- [ ] Worker se reconnecte après coupure DB
- [ ] Métriques de reconnexion incrémentées
- [ ] Heartbeat mis à jour après reconnexion

### 6.3 Circuit Breaker

- [ ] Circuit breaker s'ouvre après 5 erreurs
- [ ] Circuit breaker se ferme après rétablissement
- [ ] Métriques exposées

### 6.4 Rate Limiting

- [ ] Rate limiting effectif (429 après limite)
- [ ] Circuit breaker fail-open si Redis indisponible
- [ ] Pas d'épuisement mémoire

---

## 7. Déploiement Production

### 7.1 Pré-déploiement

- [ ] Tests de validation passés
- [ ] Documentation à jour
- [ ] Runbooks validés
- [ ] Métriques configurées dans Prometheus
- [ ] Alertes configurées

### 7.2 Déploiement

- [ ] Déployer code API (health endpoint, circuit breaker, retry)
- [ ] Déployer worker robustifié
- [ ] Configurer WAL archiving (si pas déjà fait)
- [ ] Configurer backups journaliers (si pas déjà fait)
- [ ] Vérifier health check après déploiement

### 7.3 Post-déploiement

- [ ] Vérifier métriques Prometheus
- [ ] Vérifier alertes (pas d'alertes inattendues)
- [ ] Vérifier logs (pas d'erreurs)
- [ ] Tester failover (si possible en environnement de test)
- [ ] Documenter le déploiement

---

## 8. Compatibilité UX

### 8.1 Vérifications

- [ ] Routeur avancé fonctionne (affichage)
- [ ] Registry fonctionne (chargement)
- [ ] Sidebar/Subnav fonctionne (navigation)
- [ ] KPI Bar fonctionne (actions)
- [ ] Aucun changement d'UX visible

**Tests** :
```bash
# Tester les pages principales
curl http://localhost:3000/dashboard/performance
curl http://localhost:3000/dashboard/finance
# Doit retourner les pages normalement
```

---

## 9. Exercice DR Trimestriel

### 9.1 Planning

- [ ] Exercice DR planifié (trimestriel)
- [ ] Participants identifiés (DevOps, DBA, Développeurs)
- [ ] Scénarios à tester définis

### 9.2 Scénarios

- [ ] Failover DB (primary → standby)
- [ ] PITR (restauration T-Δ)
- [ ] Coupure réseau
- [ ] Saturation disque
- [ ] Worker crash

### 9.3 Post-Exercice

- [ ] RPO mesuré et documenté
- [ ] RTO mesuré et documenté
- [ ] Runbooks mis à jour si nécessaire
- [ ] Rapport d'exercice rédigé
- [ ] Actions correctives identifiées

---

## 10. Checklist Express

### 10.1 DB

- [ ] Réplication + archive WAL + backups
- [ ] pgBouncer (optionnel)

### 10.2 API

- [ ] Circuit breaker/retry intégrés
- [ ] Readiness étendu (`/api/internal/health`)
- [ ] Rate limit Redis (P11) avec résilience (P13)

### 10.3 Workers

- [ ] Reconnexion automatique + arrêts gracieux
- [ ] Logs structurés

### 10.4 Health

- [ ] Endpoint étendu en prod
- [ ] Brancher aux probes/monitors

### 10.5 Runbooks

- [ ] Documenter pas à pas (failover, PITR)
- [ ] Prévoir exercice DR trimestriel

---

## 11. Fichiers à Pousser dans la PR

- [ ] `app/api/internal/health/route.ts` (étendu : rôle DB, lag, mviews)
- [ ] `lib/server/dashboard/workers/refreshMViewsWorker.ts` (reconnexion auto + backoff)
- [ ] `lib/server/resilience/circuit.ts` (circuit breaker)
- [ ] `lib/server/resilience/retry.ts` (retry avec backoff)
- [ ] `lib/server/resilience/dbQuery.ts` (wrapper DB avec résilience)
- [ ] `lib/server/observability/rateLimitRedis.ts` (circuit breaker + retry)
- [ ] `docs/runbooks/DR_RUNBOOK.md` (runbooks DR)
- [ ] `docs/database/PITR_BACKUP.md` (notes de config DB, backup/PITR)
- [ ] `docs/qa/RESILIENCE_TEST_PLAN.md` (plan de tests)
- [ ] `docs/deployment/P13_DEPLOYMENT_CHECKLIST.md` (checklist déploiement)

---

**Dernière mise à jour** : 2026-01-26  
**Prochaine révision** : 2026-04-26 (trimestriel)
