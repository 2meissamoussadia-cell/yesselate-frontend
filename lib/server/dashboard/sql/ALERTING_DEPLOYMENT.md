# Déploiement Système d'Alertes - Phase P15

## 📋 Vue d'ensemble

Moteur d'alertes métier BTP : détection, déduplication, agrégation et diffusion via plusieurs canaux (email, Teams, SMS, webhook).

**Compatibilité** : Aucun changement d'UX. Le routeur, registry, Sidebar/Subnav et KPI Bar restent inchangés.

## 🗂️ Fichiers

- **`lib/server/dashboard/sql/23_alerting.sql`** : Schéma complet du système d'alertes

## 🚀 Déploiement

### 1. Exécuter le script SQL

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/23_alerting.sql
```

### 2. Vérification

```sql
-- Vérifier que les tables existent
SELECT COUNT(*) FROM alert_rules;
SELECT COUNT(*) FROM alert_channels;
SELECT COUNT(*) FROM alert_subscriptions;
SELECT COUNT(*) FROM alert_events;
SELECT COUNT(*) FROM alert_silences;
SELECT COUNT(*) FROM alert_deliveries;

-- Vérifier la vue matérialisée
SELECT COUNT(*) FROM rm_alert_events_active;
```

### 3. Rafraîchir la vue matérialisée (après création d'alertes)

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_alert_events_active;
```

## 📊 Structure

### Tables principales

1. **`alert_rules`** : Règles d'alertes (déclaratif par tenant)
   - Expression JSON pour définir la condition
   - Anti-bruit (cooldown, reopen)
   - Calendrier de silence
   - Canaux par défaut

2. **`alert_channels`** : Configuration des canaux (email, Teams, SMS, webhook)
   - Configuration spécifique par canal (SMTP, webhook URL, etc.)

3. **`alert_subscriptions`** : Abonnements (qui reçoit quoi)
   - Filtres pour scoper la réception

4. **`alert_events`** : Incidents avec déduplication
   - Fingerprint pour éviter les doublons
   - Statut : open → ack → closed
   - Payload avec valeurs à l'origine de l'alerte

5. **`alert_silences`** : Silences ad-hoc
   - Matcher JSON pour sélectionner les alertes à muter
   - Période de silence (starts_at, ends_at)

6. **`alert_deliveries`** : Historique des envois (audit)
   - Statut : pending, sent, failed, retry
   - Retry automatique

### Vue matérialisée

- **`rm_alert_events_active`** : Alertes actives par tenant
  - Utilisée pour afficher les badges/compteurs dans la nav
  - Rafraîchie après chaque évaluation de règles

## 🔧 Exemples d'utilisation

### 1. Créer une règle d'alerte (DSO > 60 jours)

```sql
INSERT INTO alert_rules (tenant_id, name, description, severity, route_key, labels, expr, default_channels)
VALUES (
  'tenant-uuid',
  'DSO élevé',
  'Alerte si DSO > 60 jours',
  'warning',
  'performance::reporting::dashboard',
  '{"domain":"finance","kpi":"DSO"}'::jsonb,
  '{
    "source": "rm_reporting_dso",
    "aggregate": "avg",
    "field": "dso_days",
    "condition": ">",
    "threshold": 60
  }'::jsonb,
  '{"email":true,"teams":true,"sms":false,"webhook":false}'::jsonb
);
```

### 2. Configurer un canal email

```sql
INSERT INTO alert_channels (tenant_id, kind, name, config)
VALUES (
  'tenant-uuid',
  'email',
  'SMTP Production',
  '{
    "smtp": {
      "host": "smtp.example.com",
      "port": 587,
      "user": "alerts@example.com",
      "password": "encrypted-password",
      "from": "alerts@example.com"
    }
  }'::jsonb
);
```

### 3. Configurer un canal Teams

```sql
INSERT INTO alert_channels (tenant_id, kind, name, config)
VALUES (
  'tenant-uuid',
  'teams',
  'Teams Ops',
  '{
    "teams": {
      "webhook": "https://outlook.office.com/webhook/..."
    }
  }'::jsonb
);
```

### 4. Créer un abonnement

```sql
INSERT INTO alert_subscriptions (tenant_id, rule_id, channel_id, target, filters)
VALUES (
  'tenant-uuid',
  'rule-uuid',
  'channel-uuid',
  'ops@example.com',
  '{"bureau":"BMO","severity":"critical"}'::jsonb
);
```

### 5. Créer un silence temporaire

```sql
INSERT INTO alert_silences (tenant_id, rule_id, matcher, starts_at, ends_at, created_by, reason)
VALUES (
  'tenant-uuid',
  'rule-uuid',
  '{"labels":{"bureau":"BMO"}}'::jsonb,
  NOW(),
  NOW() + INTERVAL '2 hours',
  'admin@example.com',
  'Maintenance planifiée'
);
```

## 📈 Requêtes utiles

### Alertes actives par tenant

```sql
SELECT 
  tenant_id,
  rule_name,
  severity,
  route_key,
  active_count,
  last_alert_at
FROM rm_alert_events_active
WHERE tenant_id = 'tenant-uuid'
ORDER BY severity DESC, last_alert_at DESC;
```

### Alertes non acquittées (open)

```sql
SELECT 
  e.id,
  r.name AS rule_name,
  r.severity,
  e.fingerprint,
  e.count,
  e.first_seen,
  e.last_seen,
  e.payload
FROM alert_events e
JOIN alert_rules r ON e.rule_id = r.id
WHERE e.tenant_id = 'tenant-uuid'
  AND e.status = 'open'
ORDER BY e.last_seen DESC;
```

### Historique des envois (derniers 24h)

```sql
SELECT 
  d.id,
  r.name AS rule_name,
  c.kind AS channel_kind,
  d.status,
  d.target,
  d.sent_at,
  d.error
FROM alert_deliveries d
JOIN alert_events e ON d.event_id = e.id
JOIN alert_rules r ON e.rule_id = r.id
JOIN alert_channels c ON d.channel_id = c.id
WHERE d.tenant_id = 'tenant-uuid'
  AND d.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY d.created_at DESC;
```

## 🔒 Sécurité

- **Secrets** : Les mots de passe et tokens sont stockés dans `alert_channels.config` (à chiffrer en production)
- **Multi-tenant** : Toutes les tables sont scoped par `tenant_id`
- **Permissions** : Utiliser ABAC (déjà en place) pour contrôler l'accès aux règles et canaux

## ⚠️ Notes importantes

1. **Fingerprint** : Utilisé pour dédupliquer les alertes (hash de rule_id + labels + scope + condition)
2. **Anti-bruit** : `cooldown_sec` empêche la ré-émission trop fréquente, `reopen_after_sec` permet la réouverture si re-dépassé
3. **Vue matérialisée** : Doit être rafraîchie après chaque évaluation de règles
4. **Event-driven** : Les règles sont évaluées après refresh de MViews (via worker)
5. **CRON** : Pour les règles calendaires (ex: fin de mois)

---

**Dernière mise à jour** : 2026-01-26
