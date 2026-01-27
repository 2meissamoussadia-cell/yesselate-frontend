# 23_alerting_v2.sql — Phase P17 Règles d'alerting avancées

## Vue d'ensemble

Extensions du moteur d'alertes P15 avec DSL v2 enrichi, hystérésis, escalades, et traçabilité complète.  
**Zéro impact UX** : routeur, registry, nav et KPI Bar inchangés ; seuls les composants de notifications sont alimentés.

## Fichier

- **`lib/server/dashboard/sql/23_alerting_v2.sql`**

## Déploiement

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/23_alerting_v2.sql
```

## Extensions du schéma

### 1. `alert_rules` — colonnes v2

| Colonne | Type | Description |
|---------|------|-------------|
| `expr_v2` | JSONB | DSL v2 enrichi (fenêtres temporelles, agrégations, seuils dynamiques, compositions booléennes) |
| `hysteresis` | JSONB | Anti-flapping : `{ "enter": {">=": 60}, "exit": {"<=": 55} }` |
| `group_by` | JSONB | Découpage par périmètre : `{ "keys": ["bureau_code"], "topN": 5 }` |
| `correlation` | JSONB | Corrélations inter-KPIs : `[{ "metric": "raf_ht", "op": ">", "value": 500000 }, ...]` |

### 2. `alert_events` — traçabilité

| Colonne | Type | Description |
|---------|------|-------------|
| `acked_by` | TEXT | Utilisateur qui a ACK |
| `acked_at` | TIMESTAMPTZ | Timestamp de l'ACK |
| `closed_at` | TIMESTAMPTZ | Timestamp de fermeture |
| `closed_by` | TEXT | Utilisateur qui a fermé |
| `evidence` | JSONB | Données de preuve (séries temporelles, valeurs sources) |

### 3. `alert_escalations` — nouvelle table

Escalades (ladder de canaux) : step 1 = email après 30 min, step 2 = SMS après 1h, etc.

| Colonne | Type | Description |
|---------|------|-------------|
| `step` | INT | Ordre d'escalade (1, 2, 3...) |
| `delay_sec` | INT | Délai après OPEN si non ACK (ex: 1800 = 30 min) |
| `channel_id` | UUID | Canal à utiliser |
| `target` | TEXT | Cible spécifique (override ou additionnelle) |

### 4. `alert_silences` — extension

| Colonne | Type | Description |
|---------|------|-------------|
| `kind` | TEXT | Type : `'mute'` (silence programmé/maintenance) ou `'snooze'` (report temporaire par utilisateur) |

## DSL v2 — structure

Voir **`lib/server/dashboard/alerting/dsl_v2.ts`** pour les types TypeScript complets.

### Exemple minimal

```json
{
  "source": { "type": "view", "view": "rm_finance_overview" },
  "window": { "range": "30d", "granularity": "1d" },
  "aggregate": { "metric": "dso_jours", "func": "avg" },
  "condition": { "op": ">", "left": "metric", "right": 60 },
  "labels": { "domain": "finance", "kpi": "DSO" }
}
```

### Exemple avec corrélation

```json
{
  "source": { "type": "view", "view": "rm_finance_overview" },
  "window": { "range": "30d", "granularity": "1d" },
  "aggregate": { "metric": "raf_ht", "func": "avg" },
  "condition": {
    "all": [
      { "op": ">", "left": "metric", "right": 500000 },
      {
        "metric": "production",
        "op": "<",
        "value": 0.8,
        "compare": "n-1",
        "delta_pct": -0.2
      }
    ]
  },
  "labels": { "domain": "finance", "kpi": "RàF" }
}
```

### Exemple avec group-by et hystérésis

```json
{
  "source": { "type": "view", "view": "rm_stocks_overview" },
  "aggregate": { "metric": "ruptures_count", "func": "sum" },
  "condition": { "op": ">", "left": "metric", "right": 10 },
  "groupBy": { "keys": ["bureau_code"], "topN": 5 },
  "hysteresis": {
    "enter": { ">=": 10 },
    "exit": { "<=": 8 }
  },
  "labels": { "domain": "stocks", "kpi": "ruptures" }
}
```

## Fonctions SQL

- **`alert_in_hysteresis(rule_id, current_value, previous_status)`** : vérifie si une valeur déclenche l'hystérésis (seuil d'entrée ou de sortie selon l'état précédent).

## Vues

- **`v_alert_events_escalation_pending`** : alertes ouvertes non ACK avec escalades en attente (pour worker d'escalade).

## Migration depuis P15

Les règles P15 (`expr` JSONB) continuent de fonctionner. Les nouvelles règles peuvent utiliser `expr_v2` pour bénéficier des fonctionnalités avancées. L'évaluateur détecte automatiquement la version du DSL.

## Vérification

```sql
SELECT COUNT(*) FROM alert_rules WHERE expr_v2 IS NOT NULL;
SELECT COUNT(*) FROM alert_escalations;
SELECT COUNT(*) FROM alert_events WHERE evidence IS NOT NULL;
```
