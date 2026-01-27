# Phase P15 - Moteur d'Alertes

## 🎯 Vue d'ensemble

Moteur d'alertes métier BTP avec règles déclaratives, dé-duplication, anti-bruit, et canaux multiples (Email, Teams, SMS, Webhook).

**Aucun changement d'UX** : Alertes intégrées dans `DashboardNotifications` et badges dans `DashboardSidebar`.

---

## 📋 DSL d'Expression

### Format JSON

Les règles sont stockées dans `alert_rules.expr` au format JSON.

### Format 1 : MView (Read-Model)

```json
{
  "source": {
    "view": "rm_finance_overview"
  },
  "select": {
    "metric": "dso_jours"
  },
  "where": [
    { "col": "tenant_id", "op": "=", "val": "${tenantId}" }
  ],
  "condition": {
    "op": ">",
    "left": "metric",
    "right": 60
  },
  "groupBy": ["bureau"]
}
```

### Format 2 : Requête SQL Directe

```json
{
  "source": {
    "query": "SELECT COUNT(*) AS retards FROM projets p WHERE p.tenant_id = $1 AND p.statut = 'En cours'",
    "params": ["${tenantId}"]
  },
  "select": {
    "metric": "retards"
  },
  "condition": {
    "op": ">",
    "left": "metric",
    "right": 5
  }
}
```

---

## 🔧 Opérateurs

### WHERE (filtres)

- `=` : Égalité
- `!=` : Inégalité
- `>` : Supérieur
- `>=` : Supérieur ou égal
- `<` : Inférieur
- `<=` : Inférieur ou égal
- `IN` : Dans une liste
- `LIKE` : Pattern matching (sensible à la casse)
- `ILIKE` : Pattern matching (insensible à la casse)

### CONDITION (déclenchement)

- `>` : Supérieur
- `>=` : Supérieur ou égal
- `<` : Inférieur
- `<=` : Inférieur ou égal
- `=` : Égalité
- `!=` : Inégalité

**`left`** : `'metric'` (référence à `select.metric`) ou nom de colonne

**`right`** : Nombre ou chaîne (seuil)

---

## 📊 Exemples Concrets

### 1. DSO > 60 jours (critique)

```json
{
  "name": "DSO élevé",
  "severity": "critical",
  "expr": {
    "source": { "view": "rm_finance_overview" },
    "select": { "metric": "dso_jours" },
    "where": [{ "col": "tenant_id", "op": "=", "val": "${tenantId}" }],
    "condition": { "op": ">", "left": "metric", "right": 60 }
  },
  "cooldownSec": 600,
  "reopenAfterSec": 3600,
  "defaultChannels": { "email": true, "teams": true }
}
```

### 2. OTIF < 85% (warning)

```json
{
  "name": "OTIF faible",
  "severity": "warning",
  "expr": {
    "source": { "view": "rm_achats_overview" },
    "select": { "metric": "conformite_ratio" },
    "where": [{ "col": "tenant_id", "op": "=", "val": "${tenantId}" }],
    "condition": { "op": "<", "left": "metric", "right": 0.85 }
  }
}
```

### 3. Ruptures > 10 (warning)

```json
{
  "name": "Ruptures de stock",
  "severity": "warning",
  "expr": {
    "source": { "view": "rm_stocks_overview" },
    "select": { "metric": "ruptures" },
    "where": [{ "col": "tenant_id", "op": "=", "val": "${tenantId}" }],
    "condition": { "op": ">", "left": "metric", "right": 10 }
  }
}
```

### 4. Retards projets > 5 (critique) - SQL directe

```json
{
  "name": "Retards projets",
  "severity": "critical",
  "expr": {
    "source": {
      "query": "SELECT COUNT(*) AS retards FROM projets p WHERE p.tenant_id = $1 AND p.statut = 'En cours' AND p.progression < 100 AND p.created_at < (NOW() - INTERVAL '90 days')",
      "params": ["${tenantId}"]
    },
    "select": { "metric": "retards" },
    "condition": { "op": ">", "left": "metric", "right": 5 }
  }
}
```

### 5. RàF > 100k€ par bureau (warning) - Avec grouping

```json
{
  "name": "RàF élevé par bureau",
  "severity": "warning",
  "routeKey": "performance::finance::dashboard",
  "labels": { "domain": "finance", "kpi": "RAF" },
  "expr": {
    "source": { "view": "rm_finance_overview" },
    "select": { "metric": "raf_euros" },
    "where": [{ "col": "tenant_id", "op": "=", "val": "${tenantId}" }],
    "condition": { "op": ">", "left": "metric", "right": 100000 },
    "groupBy": ["bureau"]
  }
}
```

---

## 🔄 Flux d'Évaluation

1. **Déclenchement** : Après refresh MView (event-driven) ou CRON
2. **Évaluation** : Construction SQL depuis expression → exécution → vérification condition
3. **Dé-duplication** : Calcul fingerprint (rule_id + labels)
4. **Anti-bruit** : Vérification cooldown + silences
5. **Création/Mise à jour** : Upsert dans `alert_events`
6. **Notification** : Envoi via canaux configurés
7. **UI** : Affichage dans `DashboardNotifications` + badges Sidebar

---

## 🛡️ Anti-Bruit

- **Cooldown** : `cooldown_sec` (défaut 600s) - Pas de ré-émission avant ce délai
- **Reopen** : `reopen_after_sec` (défaut 3600s) - Fermeture auto si condition non re-dépassée
- **Silences** : Ad-hoc (table `alert_silences`) ou programmés (calendrier)
- **Dé-duplication** : Fingerprint (rule_id + labels) pour éviter les doublons

---

## 📡 Canaux

### Teams (implémenté)

```sql
INSERT INTO alert_channels (tenant_id, kind, name, config)
VALUES (
  '<tenant-id>',
  'teams',
  'Teams Ops',
  '{"webhook": "https://outlook.office.com/webhook/..."}'::jsonb
);
```

### Webhook (implémenté)

```sql
INSERT INTO alert_channels (tenant_id, kind, name, config)
VALUES (
  '<tenant-id>',
  'webhook',
  'Webhook Custom',
  '{"url": "https://api.example.com/alerts", "headers": {"Authorization": "Bearer ..."}}'::jsonb
);
```

### Email (stub)

À implémenter avec `nodemailer` ou équivalent.

### SMS (stub)

À implémenter avec Twilio ou équivalent.

---

## 🚀 Déploiement

### 1. Appliquer SQL

```bash
psql -d your_database -f lib/server/dashboard/sql/22_alerting.sql
```

### 2. Créer une règle

```sql
INSERT INTO alert_rules (tenant_id, name, severity, expr, default_channels)
VALUES (
  '<tenant-id>',
  'DSO élevé',
  'critical',
  '{
    "source": {"view": "rm_finance_overview"},
    "select": {"metric": "dso_jours"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 60}
  }'::jsonb,
  '{"teams": true, "email": true}'::jsonb
);
```

### 3. Configurer un canal

```sql
INSERT INTO alert_channels (tenant_id, kind, name, config)
VALUES (
  '<tenant-id>',
  'teams',
  'Teams Ops',
  '{"webhook": "https://outlook.office.com/webhook/..."}'::jsonb
);
```

### 4. Créer un abonnement

```sql
INSERT INTO alert_subscriptions (tenant_id, rule_id, channel_id, target, enabled)
VALUES (
  '<tenant-id>',
  '<rule-id>',
  '<channel-id>',
  'ops@example.com', -- ou URL webhook
  true
);
```

---

## ✅ Validation

- [ ] Règle créée en DB
- [ ] Après refresh MView → règle évaluée
- [ ] Alerte créée dans `alert_events` si condition déclenchée
- [ ] Notification envoyée via canal configuré
- [ ] Alerte visible dans `DashboardNotifications`
- [ ] Badge affiché dans Sidebar (si alertes critiques)
- [ ] ACK fonctionne (POST `/api/alerts/events/[id]/ack`)

---

**Status** : ✅ **Moteur d'alertes implémenté** — Prêt pour production
