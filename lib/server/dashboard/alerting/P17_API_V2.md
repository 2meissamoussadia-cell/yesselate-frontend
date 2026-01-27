# Phase P17 — API v2 — Documentation

## Vue d'ensemble

Extensions des API REST P15 pour supporter le DSL v2, hystérésis, escalades, et traçabilité complète.

## Endpoints modifiés/étendus

### 1. GET /api/alerts/rules

**Modifications P17** :
- Retourne maintenant `expr_v2`, `hysteresis`, `group_by`, `correlation` en plus de `expr` (v1)
- Support rétrocompatible : règles v1 (`expr`) et v2 (`expr_v2`) sont toutes retournées

**Exemple de réponse** :
```json
{
  "ok": true,
  "rules": [
    {
      "id": "...",
      "name": "RàF > 500k€",
      "expr": null,  // v1 (legacy)
      "expr_v2": {  // v2 (P17)
        "source": { "type": "view", "view": "rm_finance_overview" },
        "window": { "range": "30d", "granularity": "1d" },
        "aggregate": { "metric": "raf_ht", "func": "avg" },
        "condition": { "op": ">", "left": "metric", "right": 500000 },
        "correlation": [...],
        "hysteresis": { "enter": { ">=": 500000 }, "exit": { "<=": 450000 } }
      },
      "hysteresis": { "enter": { ">=": 500000 }, "exit": { "<=": 450000 } },
      "group_by": { "keys": ["bureau_code"], "topN": 5 },
      "correlation": [...]
    }
  ]
}
```

### 2. POST /api/alerts/rules

**Modifications P17** :
- Accepte `expr_v2` (DSL v2) en plus de `expr` (v1)
- Accepte `hysteresis`, `group_by`, `correlation` au niveau de la règle
- Validation Zod : soit `expr` soit `expr_v2` doit être fourni

**Body (v2)** :
```json
{
  "name": "RàF > 500k€",
  "severity": "warning",
  "expr_v2": {
    "source": { "type": "view", "view": "rm_finance_overview" },
    "window": { "range": "30d", "granularity": "1d" },
    "aggregate": { "metric": "raf_ht", "func": "avg" },
    "condition": { "op": ">", "left": "metric", "right": 500000 },
    "correlation": [
      { "metric": "production", "op": "<", "value": 0.8, "compare": "n-1", "delta_pct": -0.2 }
    ]
  },
  "hysteresis": {
    "enter": { ">=": 500000 },
    "exit": { "<=": 450000 }
  },
  "group_by": { "keys": ["bureau_code"], "topN": 5 },
  "labels": { "domain": "finance", "kpi": "RàF" }
}
```

**Guards** : `alerts:admin`
**Rate limiting** : 20 req/5 min par IP

### 3. PUT /api/alerts/rules/[id]

**Modifications P17** :
- Accepte `expr_v2`, `hysteresis`, `group_by`, `correlation` pour mise à jour
- Tous les champs sont optionnels (mise à jour partielle)

**Body** :
```json
{
  "expr_v2": { ... },
  "hysteresis": { "enter": { ">=": 60 }, "exit": { "<=": 55 } },
  "group_by": { "keys": ["bureau_code"], "topN": 5 }
}
```

**Guards** : `alerts:admin`
**Rate limiting** : 30 req/min par IP

### 4. POST /api/alerts/test

**Modifications P17** :
- Support `expr_v2` pour dry-run v2
- Détection automatique : utilise `evaluateRuleV2()` si `expr_v2` présent, sinon `evaluateRule()` (v1)
- **FinOps** : Quota check avant test + recordUsage après

**Body (v2)** :
```json
{
  "name": "Test RàF",
  "severity": "warning",
  "expr_v2": {
    "source": { "type": "view", "view": "rm_finance_overview" },
    "aggregate": { "metric": "raf_ht", "func": "avg" },
    "condition": { "op": ">", "left": "metric", "right": 500000 }
  }
}
```

**Réponse** :
```json
{
  "ok": true,
  "rule": { "name": "Test RàF", "severity": "warning", "expr_v2": {...} },
  "incidents": [
    {
      "fingerprint": "...",
      "payload": { "metric": 550000, "metricName": "raf_ht", ... },
      "labels": { "domain": "finance" }
    }
  ],
  "summary": { "total": 1, "triggered": true }
}
```

**Guards** : `alerts:admin`
**Rate limiting** : 10 req/5 min par IP
**FinOps** : Quota `route:/api/alerts/test` (estimation : 1000 rows, 100 KB)

### 5. POST /api/alerts/events/[id]/ack

**Modifications P17** :
- Met à jour `acked_at` et `acked_by` (colonnes v2) en plus de `acknowledged_at`/`acknowledged_by` (v1)
- Rétrocompatible : les deux sets de colonnes sont mis à jour

**Réponse** :
```json
{
  "ok": true,
  "event": {
    "id": "...",
    "status": "ack",
    "ackedAt": "2026-01-25T10:00:00Z",  // Phase P17
    "ackedBy": "user-123",                // Phase P17
    "acknowledgedAt": "2026-01-25T10:00:00Z",  // v1 (legacy)
    "acknowledgedBy": "user-123"                // v1 (legacy)
  }
}
```

**Guards** : `alerts:view` (peut ACK ses propres alertes) ou `alerts:admin`
**Rate limiting** : 60 req/min par IP

### 6. POST /api/alerts/events/[id]/close

**Modifications P17** :
- Met à jour `closed_at` et `closed_by` (colonnes v2)
- Rétrocompatible avec v1

**Réponse** :
```json
{
  "ok": true,
  "event": {
    "id": "...",
    "status": "closed",
    "closedAt": "2026-01-25T10:00:00Z",  // Phase P17
    "closedBy": "user-123"                // Phase P17
  }
}
```

**Guards** : `alerts:view` (peut fermer ses propres alertes) ou `alerts:admin`
**Rate limiting** : 60 req/min par IP

### 7. GET /api/alerts/events

**Modifications P17** :
- Retourne `acked_at`, `acked_by`, `closed_at`, `closed_by`, `evidence` (colonnes v2)
- Filtre par `status=open|ack|closed` (inchangé)

**Réponse** :
```json
{
  "ok": true,
  "events": [
    {
      "id": "...",
      "status": "open",
      "payload": {...},
      "evidence": {  // Phase P17
        "rows": [...],
        "aggregate": { "func": "avg", "value": 550000 },
        "window": { "range": "30d" },
        "timestamp": "2026-01-25T10:00:00Z"
      },
      "ackedAt": null,
      "ackedBy": null,
      "closedAt": null,
      "closedBy": null
    }
  ]
}
```

## Sécurité

- **RBAC** : `alerts:view` (lecture), `alerts:admin` (écriture)
- **ABAC** : Filtrage par bureau/chantier via `labels` et `scopes` (inchangé P15)
- **Rate limiting** : Redis (inchangé P15)
- **FinOps** : Quotas sur `/api/alerts/test` (Phase P16)

## Observabilité

- **Métriques** : Nombre d'incidents ouverts/clos, délais d'ACK/close, escalades déclenchées
- **Logging** : Structured logging avec `withReq` (inchangé P15)
- **Evidence** : Stockage des séries temporelles et valeurs sources dans `alert_events.evidence`

## Migration depuis P15

- **Rétrocompatibilité** : Toutes les API P15 continuent de fonctionner
- **Détection automatique** : Les routes détectent v1 vs v2 selon présence de `expr` vs `expr_v2`
- **Colonnes v2** : `acked_at`/`acked_by` et `closed_at`/`closed_by` sont remplis en plus des colonnes v1

## Schémas Zod

Voir `lib/server/dashboard/alerting/schemas.ts` pour les schémas de validation complets :
- `AlertDSLv2Schema` : Validation DSL v2
- `HysteresisSchema` : Validation hystérésis
- `GroupBySchema` : Validation group-by
- `CorrelationSchema` : Validation corrélations
