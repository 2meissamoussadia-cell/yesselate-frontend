# Phase P13 - Résilience & DR (Disaster Recovery)

## 🎯 Objectifs

- **RPO (Recovery Point Objective)** : ≤ 5 minutes
- **RTO (Recovery Time Objective)** : ≤ 15 minutes
- **Base de données Postgres HA + PITR** : réplication, WAL, sauvegardes chiffrées
- **Workers & API robustes** : reconnexion automatique, arrêts gracieux, idempotence, circuit breaker
- **Health / Readiness** : endpoints étendus avec statut DB (primary/standby, lag), staleness MViews
- **Runbooks & tests DR** : jeux d'exercices, checklist
- **Observabilité** : métriques RPO/RTO, taux de failover, erreurs de reconnection

**Règle** : Aucun impact UX. Le routeur avancé, le registry, la Sidebar/Subnav et la KPI Bar restent inchangés.

---

## ✅ Implémentation Phase P13.1 - Health / Readiness Étendus

### 1. Extension Health Check

**Fichier** : `lib/server/observability/health.ts`

**Nouveautés Phase P13** :
- ✅ **Rôle DB** : Détection primary/standby via `pg_is_in_recovery()`
- ✅ **Replication lag** : Vérification du lag de replay (standby) et des replicas (primary)
- ✅ **Statut worker** : Déjà implémenté en P4 (heartbeat)

**Fonction `checkReplication()`** :
- **Standby** : Vérifie `pg_last_wal_replay_lag()` (RPO cible : 5 min)
- **Primary** : Vérifie `pg_stat_replication` pour tous les replicas
- **Status** :
  - `healthy` : Lag ≤ 5 min
  - `degraded` : Lag ≤ 15 min
  - `unhealthy` : Lag > 15 min ou pas de replicas

**Endpoints** :
- `GET /api/health` : Health check public (P4)
- `GET /api/internal/health` : Health check interne détaillé (P4 + P13)

---

## ✅ Implémentation Phase P13.2 - Workers & API Robustes

### 1. Worker Event-Driven Robustifié

**Fichier** : `lib/server/dashboard/workers/refreshMViewsWorker.ts`

**Nouveautés Phase P13** :
- ✅ **Reconnexion automatique** : Fonction `retryConnect()` avec backoff exponentiel et jitter
- ✅ **Gestion d'erreurs** : Handler `client.on('error')` qui libère la connexion et reconnecte
- ✅ **Arrêt gracieux** : Gestion SIGTERM/SIGINT avec `UNLISTEN` et release propre
- ✅ **Extraction handler** : `setupNotificationHandler()` pour réutilisation après reconnexion

**Backoff** :
- Délai initial : 1s
- Multiplicateur : 1.5x
- Jitter : 0-500ms aléatoire
- Max délai : 30s

### 2. Circuit Breaker

**Fichier** : `lib/server/resilience/circuit.ts`

**Fonctionnalités** :
- ✅ États : `closed` (normal), `open` (circuit ouvert), `half-open` (test)
- ✅ Seuils : 5 erreurs → ouvrir circuit, reset après 30s
- ✅ Méthodes : `canPass()`, `success()`, `failure()`, `getState()`, `reset()`

### 3. Retry avec Backoff Exponentiel

**Fichier** : `lib/server/resilience/retry.ts`

**Fonctionnalités** :
- ✅ Backoff exponentiel : `baseDelay * multiplier^attempt`
- ✅ Jitter aléatoire : évite thundering herd
- ✅ Helpers : `isPostgresRetryable()`, `isRedisRetryable()`
- ✅ Options : `attempts`, `baseDelay`, `maxDelay`, `multiplier`, `jitterMax`, `isRetryable`

### 4. Intégration dans Rate Limiting Redis

**Fichier** : `lib/server/observability/rateLimitRedis.ts`

**Nouveautés Phase P13** :
- ✅ Circuit breaker : Protection contre cascading failures Redis
- ✅ Retry : 3 tentatives avec backoff pour erreurs réseau
- ✅ Fail-open : Permet la requête si Redis indisponible (rate limiting non-bloquant)

### 5. Wrapper DB Query avec Résilience

**Fichier** : `lib/server/resilience/dbQuery.ts` (nouveau)

**Fonctionnalités** :
- ✅ `queryWithResilience()` : Wrapper pour requêtes SQL avec circuit breaker + retry
- ✅ `connectWithResilience()` : Obtention de connexion avec résilience
- ✅ Circuit breaker partagé pour toutes les requêtes DB

**Usage** (optionnel, pour migration progressive) :
```typescript
import { queryWithResilience } from '@/lib/server/resilience/dbQuery';

// Au lieu de :
const result = await client.query('SELECT ...');

// Utiliser :
const result = await queryWithResilience('SELECT ...', [params]);
```

---

## 📋 Prochaines Étapes P13

### 3. Base de Données Postgres HA + PITR

#### 2.1 Réplication PostgreSQL

**Configuration** :
- **Réplication synchrone** : Pour RPO = 0 (optionnel, impact perf)
- **Réplication asynchrone** : Pour RPO ≤ 5 min (recommandé)
- **Streaming replication** : Via WAL streaming

**SQL** : `lib/server/dashboard/sql/21_postgres_replication.sql` (à créer)

**Vérifications** :
- `pg_stat_replication` : Statut des replicas
- `pg_stat_wal_receiver` : Statut du receiver (standby)
- `pg_last_wal_replay_lag()` : Lag de replay (standby)

#### 2.2 PITR (Point-In-Time Recovery)

**Outils** :
- **wal-g** : Backup/restore WAL vers stockage objet (S3, Azure Blob, etc.)
- **pg_basebackup** : Backup initial
- **Archive WAL** : Archivage continu des WAL files

**Configuration** :
- `archive_mode = on`
- `archive_command = 'wal-g wal-push %p'`
- Sauvegardes chiffrées vers stockage externe

#### 2.3 pgBouncer (Pooling)

**Objectif** : Lisser les connexions des API/Workers

**Configuration** :
- Mode transaction pooling
- Limite de connexions par pool
- Health check intégré

---

### 3. Workers & API Robustes

#### 3.1 Reconnexion Automatique (Workers)

**Fichier** : `lib/server/dashboard/workers/refreshMViewsWorker.ts` (à étendre)

**Fonctionnalités** :
- Boucle de reconnexion avec backoff exponentiel
- Advisory lock pour éviter refresh concurrents (déjà en place)
- Arrêt gracieux (SIGTERM/SIGINT)

**Exemple** :
```typescript
async function reconnectWithBackoff(maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.connect();
      return;
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, i), 30000); // Max 30s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Failed to reconnect after max retries');
}
```

#### 3.2 Circuit Breaker (API)

**Fichier** : `lib/server/observability/circuitBreaker.ts` (à créer)

**Fonctionnalités** :
- Protection contre cascading failures
- États : `closed` (normal), `open` (circuit ouvert), `half-open` (test)
- Seuils : Erreurs > 50% sur 1 min → ouvrir circuit
- Timeout : 30s avant tentative de réouverture

**Intégration** :
- DB queries : Circuit breaker sur pool PostgreSQL
- Redis : Circuit breaker sur rate limiting
- External APIs : Circuit breaker sur appels externes

#### 3.3 Retry avec Jitter

**Fichier** : `lib/server/observability/retry.ts` (à créer)

**Fonctionnalités** :
- Retry exponentiel avec jitter (éviter thundering herd)
- Idempotence : Vérifier si l'opération a déjà été effectuée
- Timeouts raisonnables : Max 3 retries, timeout total 10s

#### 3.4 Rate Limiting Redis (Dimensionné pour Incidents)

**Fichier** : `lib/server/observability/rateLimitRedis.ts` (déjà en P11)

**Extensions P13** :
- Limites plus restrictives en cas d'incident détecté
- Whitelist pour IPs internes
- Rate limiting par endpoint (exports plus restrictif)

---

### 4. Observabilité RPO/RTO

#### 4.1 Métriques Prometheus

**Fichier** : `lib/server/observability/metrics.ts` (à étendre)

**Nouvelles métriques** :
- `postgres_replication_lag_seconds` : Lag de réplication (Gauge)
- `postgres_replication_replicas_total` : Nombre de replicas (Gauge)
- `postgres_replication_failover_total` : Nombre de failovers (Counter)
- `worker_reconnection_attempts_total` : Tentatives de reconnexion (Counter)
- `worker_reconnection_errors_total` : Erreurs de reconnexion (Counter)
- `circuit_breaker_state` : État du circuit breaker (Gauge)
- `circuit_breaker_failures_total` : Échecs circuit breaker (Counter)

#### 4.2 Alertes SLO

**Fichier** : `lib/server/observability/prometheus/slo_alerts.yml` (à étendre)

**Alertes** :
- `HighReplicationLag` : Lag > 5 min (RPO)
- `NoReplicas` : Primary sans replicas
- `WorkerReconnectionFailed` : Worker ne peut pas se reconnecter
- `CircuitBreakerOpen` : Circuit breaker ouvert > 1 min

---

### 5. Runbooks & Tests DR

#### 5.1 Runbooks

**Fichier** : `docs/runbooks/DR_RUNBOOK.md` (à créer)

**Contenu** :
- Failover DB (primary → standby)
- Restauration PITR
- Redémarrage workers
- Bypass circuit breaker
- Checklist de validation post-incident

#### 5.2 Tests DR

**Fichier** : `scripts/dr-tests/` (à créer)

**Scénarios** :
- **Failover DB** : Arrêter primary, promouvoir standby
- **Interruption réseau** : Simuler coupure réseau
- **Saturation disque** : Simuler disque plein
- **Worker crash** : Arrêter worker, vérifier reconnexion

**Critères de réussite** :
- RTO ≤ 15 min
- RPO ≤ 5 min
- Pas de perte de données
- Services opérationnels après failover

---

## 🧪 Tests

### Test Health Check Étendu

```bash
# Vérifier le health check avec réplication
curl http://localhost:3000/api/internal/health | jq

# Vérifier le rôle DB
curl http://localhost:3000/api/internal/health | jq '.checks[] | select(.service == "database")'

# Vérifier la réplication
curl http://localhost:3000/api/internal/health | jq '.checks[] | select(.service == "replication")'
```

### Test Replication Lag

```sql
-- Sur un standby
SELECT pg_last_wal_replay_lag();

-- Sur un primary
SELECT application_name, sync_state, replay_lag, state
FROM pg_stat_replication;
```

---

## ⚠️ Points d'Attention

### 1. Permissions PostgreSQL

**Problème** : `pg_stat_replication` nécessite superuser ou rôle replication

**Solution** :
- Créer un rôle dédié avec permissions limitées
- Ou utiliser un utilisateur avec `pg_monitor` (PostgreSQL 10+)

### 2. Performance Health Check

**Problème** : Vérification réplication peut être lente

**Solution** :
- Timeout de 5s par check
- Cache des résultats (1 min) pour health check public
- Health check interne reste en temps réel

### 3. Replication Lag Mesure

**Problème** : `pg_last_wal_replay_lag()` peut être `NULL` si pas de transactions récentes

**Solution** :
- Considérer comme `degraded` si lag non mesurable
- Vérifier aussi `pg_stat_wal_receiver` pour statut actif

---

## 📊 Métriques à Surveiller

- **Replication lag** : < 5 min (RPO)
- **Failover time** : < 15 min (RTO)
- **Worker reconnection** : < 30s
- **Circuit breaker open rate** : < 1%
- **Health check duration** : < 1s

---

## ✅ Status

- [x] **P13.1** : Health / Readiness étendus (rôle DB, replication lag)
- [x] **P13.2.1** : Worker Event-Driven robustifié (reconnexion automatique avec backoff)
- [x] **P13.2.2** : Circuit Breaker (protège contre cascading failures)
- [x] **P13.2.3** : Retry avec backoff exponentiel et jitter
- [x] **P13.2.4** : Intégration circuit breaker + retry dans rateLimitRedis
- [ ] **P13.3** : Base de données Postgres HA + PITR (réplication, wal-g, pgBouncer)
- [ ] **P13.4** : Observabilité RPO/RTO (métriques, alertes)
- [ ] **P13.5** : Runbooks & tests DR

**Prochaine étape** : Implémenter P13.3 (Postgres HA + PITR) ou P13.4 (Observabilité RPO/RTO)
