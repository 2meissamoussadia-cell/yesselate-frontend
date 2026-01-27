# Phase P17 — Règles d'alerting avancées — Implémentation

## Vue d'ensemble

Extensions du moteur d'alertes P15 avec DSL v2 enrichi, hystérésis, escalades, et traçabilité complète.  
**Zéro impact UX** : routeur, registry, nav et KPI Bar inchangés.

## Fichiers créés/modifiés

### Schéma SQL

- **`lib/server/dashboard/sql/23_alerting_v2.sql`** : Extensions du schéma P15
  - Colonnes v2 dans `alert_rules` : `expr_v2`, `hysteresis`, `group_by`, `correlation`
  - Colonnes de traçabilité dans `alert_events` : `acked_by`, `acked_at`, `closed_at`, `closed_by`, `evidence`
  - Table `alert_escalations` : ladder de canaux avec délais
  - Extension `alert_silences` : colonne `kind` (mute/snooze)
  - Fonction SQL `alert_in_hysteresis()` : vérifie l'hystérésis
  - Vue `v_alert_events_escalation_pending` : alertes avec escalades en attente

### Types TypeScript

- **`lib/server/dashboard/alerting/dsl_v2.ts`** : Types complets pour DSL v2
  - `AlertDSLv2` : structure complète (source, window, aggregate, baseline, condition, groupBy, correlation, hysteresis)
  - Types pour fenêtres temporelles, agrégations, baselines, conditions booléennes, corrélations
  - 5 exemples prêts à l'emploi (RàF, OTIF, Stocks, Matériel, Conformité)

- **`lib/server/dashboard/alerting/types.ts`** : Extensions
  - `AlertRule` : champs v2 (`expr_v2`, `hysteresis`, `group_by`, `correlation`)
  - `AlertEvent` : champs de traçabilité (`acked_by`, `acked_at`, `closed_at`, `closed_by`, `evidence`)

- **`lib/server/dashboard/alerting/escalations.ts`** : Interface `AlertEscalation`

### Évaluateur v2

- **`lib/server/dashboard/alerting/evaluator_v2.ts`** : Évaluateur DSL v2
  - `evaluateRuleV2(rule, ctx)` : évalue une règle v2 et retourne les incidents
  - Support fenêtres temporelles, agrégations (avg, sum, min, max, p50/p90/p95/p99, count, stddev)
  - Support compositions booléennes (`all`, `any`, `not`)
  - Support group-by avec topN
  - Support hystérésis (anti-flapping)
  - Support corrélations inter-KPIs
  - Stockage de l'evidence (séries, valeurs sources)

### Processeur v2

- **`lib/server/dashboard/alerting/processor_v2.ts`** : Traitement des résultats
  - `processEvaluationResults(rule, results, tenantId)` : upsert incidents avec evidence
  - Vérification silences (mute/snooze)
  - Vérification cooldown
  - Envoi notifications pour nouveaux incidents

### Worker d'escalades

- **`lib/server/dashboard/alerting/escalationWorker.ts`** : Worker d'escalades
  - `processEscalations()` : vérifie et déclenche les escalades
  - Utilise la vue `v_alert_events_escalation_pending`
  - Envoie via `sendAlert()` (channels.ts)
  - Enregistre les livraisons dans `alert_notifications`

### Intégration worker

- **`lib/server/dashboard/alerting/worker.ts`** : Modifié pour supporter v1 + v2
  - `evaluateAllRules()` : évalue règles v1 (expr) et v2 (expr_v2)
  - `evaluateRulesForMView()` : support v1 + v2 pour MView-specific

### API CRON

- **`app/api/cron/alerts-escalations/route.ts`** : Endpoint CRON pour escalades
  - POST protégé par `CRON_SECRET`
  - Appelle `processEscalations()`

### Canaux

- **`lib/server/dashboard/alerting/channels.ts`** : Extension
  - `sendAlert()` : fonction pour escalades (utilise `sendViaChannel`)

## Déploiement

### 1. Appliquer le schéma SQL

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/23_alerting_v2.sql
```

### 2. Vérifier les tables

```sql
SELECT COUNT(*) FROM alert_rules WHERE expr_v2 IS NOT NULL;
SELECT COUNT(*) FROM alert_escalations;
SELECT COUNT(*) FROM alert_events WHERE evidence IS NOT NULL;
```

### 3. CRON pour escalades

Ajouter dans crontab (toutes les 5 minutes) :

```bash
*/5 * * * * curl -X POST http://localhost:3000/api/cron/alerts-escalations \
  -H "x-cron-secret: $CRON_SECRET" >> /var/log/alerts_escalations.log 2>&1
```

## Utilisation

### Créer une règle v2

```sql
INSERT INTO alert_rules (tenant_id, name, severity, expr_v2, labels)
VALUES (
  '...'::uuid,
  'RàF > 500k€ ET Production < N-1',
  'warning',
  '{
    "source": {"type": "view", "view": "rm_finance_overview"},
    "window": {"range": "30d", "granularity": "1d"},
    "aggregate": {"metric": "raf_ht", "func": "avg"},
    "condition": {"op": ">", "left": "metric", "right": 500000},
    "correlation": [{"metric": "production", "op": "<", "value": 0.8, "compare": "n-1", "delta_pct": -0.2}],
    "labels": {"domain": "finance", "kpi": "RàF"}
  }'::jsonb,
  '{"domain": "finance", "kpi": "RàF"}'::jsonb
);
```

### Créer une escalade

```sql
INSERT INTO alert_escalations (tenant_id, rule_id, step, delay_sec, channel_id, target)
VALUES (
  '...'::uuid,
  '...'::uuid,  -- rule_id
  1,            -- step 1
  1800,         -- 30 min
  '...'::uuid,  -- channel_id (email)
  'ops@exemple.com'
);
```

## Points clés

- **Rétrocompatibilité** : Les règles P15 (`expr`) continuent de fonctionner
- **Détection automatique** : L'évaluateur détecte v1 vs v2 selon présence de `expr_v2`
- **Hystérésis** : Évite l'effet ping-pong (seuils entrée/sortie différents)
- **Group-by + topN** : Limite le bruit (ex: 5 pires bureaux)
- **Corrélations** : Support comparaisons relatives (n-1, baseline) et absolues
- **Evidence** : Stocke les séries temporelles et valeurs sources pour traçabilité
- **Escalades** : Ladder de canaux avec délais (step 1 = email 30 min, step 2 = SMS 1h)

## Prochaines étapes (optionnel)

- API v2 : CRUD règles v2, dry-run enrichi, import/export
- UI : Badges quota export, toasts FinOps, page Admin tenant
- Rapports FinOps : coût par tenant/module, tendances, top routes coûteuses
