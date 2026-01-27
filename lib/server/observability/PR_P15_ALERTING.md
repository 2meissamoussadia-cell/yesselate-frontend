# Phase P15 - Moteur d'Alertes (Règles & Canaux)

## 🎯 Objectifs

- **Détection automatique** : Alertes métier BTP (RAP, RàF, DSO, OTIF Achats, ruptures Stock, blocages, retards projets, conformité)
- **Dé-duplication** : Fingerprint pour éviter le spam
- **Agrégation** : Grouping par labels/scope
- **Canaux multiples** : E-mail, Teams, SMS, Webhook
- **Anti-bruit** : Cooldown, silences, escalades
- **ACK** : open → acknowledged → closed
- **Intégration** : Branché sur MViews et bus event-driven

**Règle** : Aucun changement d'UX. Réutilisation des composants existants (KPINotifications, KpiTile, badges dans nav).

---

## ✅ Implémentation

### 1. Schéma SQL

**Fichier** : `lib/server/dashboard/sql/22_alerting.sql`

**Tables** :
- `alert_rules` : Règles d'alerte (expression JSON, seuils, canaux)
- `alert_channels` : Configuration des canaux (SMTP, Teams webhook, etc.)
- `alert_subscriptions` : Abonnements (qui reçoit quoi)
- `alert_events` : Incidents (dé-duplication via fingerprint)
- `alert_silences` : Silences ad-hoc ou programmés
- `alert_notifications` : Historique des notifications envoyées

**Vues** :
- `v_alert_events_active` : Alertes actives
- `v_alert_rules_stats` : Statistiques par règle

### 2. Moteur d'Évaluation

**Fichiers** :
- `lib/server/dashboard/alerting/types.ts` : Types TypeScript
- `lib/server/dashboard/alerting/evaluator.ts` : Évaluateur de règles
- `lib/server/dashboard/alerting/processor.ts` : Processeur principal
- `lib/server/dashboard/alerting/channels.ts` : Canaux de notification
- `lib/server/dashboard/alerting/worker.ts` : Worker d'évaluation

**Fonctionnalités** :
- Évaluation de règles depuis expressions JSON
- Construction de requêtes SQL depuis expressions
- Dé-duplication via fingerprint
- Cooldown et silences
- Envoi via canaux (Teams, Webhook implémentés ; Email/SMS stubs)

### 3. Intégration Event-Driven

**Fichier** : `lib/server/dashboard/workers/refreshMViewsWorker.ts`

**Modification** :
- Après chaque refresh de MView, évaluation des règles qui en dépendent
- Appel à `evaluateRulesForMView(tenantId, mviewName)`

### 4. API Endpoints

**Fichiers** :
- `app/api/alerts/events/route.ts` : GET événements actifs
- `app/api/alerts/events/[id]/ack/route.ts` : POST ACK événement
- `app/api/alerts/stats/route.ts` : GET statistiques

### 5. Frontend

**Fichiers** :
- `src/modules/dashboard/hooks/useAlerts.ts` : Hooks React Query
- `src/modules/dashboard/components/AlertNotifications.tsx` : Intégration dans DashboardNotifications

**Intégration** :
- Alertes converties en notifications Dashboard
- Badges dans Sidebar (à ajouter)
- ACK via action dans notification

---

## 📊 DSL d'Expression

**Format JSON** :
```json
{
  "source": "rm_reporting_overview",
  "aggregate": {
    "field": "dso_jours",
    "op": "avg"
  },
  "filters": [
    { "field": "tenant_id", "op": "eq", "value": "..." }
  ],
  "condition": {
    "field": "dso_jours",
    "op": "gt",
    "threshold": 60
  },
  "groupBy": ["bureau"]
}
```

---

## 🔧 Exemples de Règles

### 1. DSO > 60 jours

```json
{
  "name": "DSO élevé",
  "severity": "warning",
  "expr": {
    "source": "rm_reporting_overview",
    "condition": {
      "field": "dso_jours",
      "op": "gt",
      "threshold": 60
    }
  },
  "defaultChannels": { "email": true, "teams": true }
}
```

### 2. Rupture de stock

```json
{
  "name": "Rupture de stock",
  "severity": "critical",
  "expr": {
    "source": "rm_stocks",
    "filters": [
      { "field": "stock_actuel", "op": "lte", "value": 0 }
    ],
    "condition": {
      "field": "stock_actuel",
      "op": "lte",
      "threshold": 0
    },
    "groupBy": ["article_id"]
  }
}
```

---

## 🚀 Déploiement

### Étapes

1. **Appliquer SQL** :
   ```bash
   psql -d your_database -f lib/server/dashboard/sql/22_alerting.sql
   ```

2. **Configurer canaux** :
   ```sql
   -- Exemple : Canal Teams
   INSERT INTO alert_channels (tenant_id, kind, name, config)
   VALUES (
     '<tenant-id>',
     'teams',
     'Teams Ops',
     '{"webhook": "https://outlook.office.com/webhook/..."}'
   );
   ```

3. **Créer une règle** :
   ```sql
   INSERT INTO alert_rules (tenant_id, name, severity, expr, default_channels)
   VALUES (
     '<tenant-id>',
     'DSO élevé',
     'warning',
     '{"source": "rm_reporting_overview", "condition": {"field": "dso_jours", "op": "gt", "threshold": 60}}'::jsonb,
     '{"teams": true}'::jsonb
   );
   ```

4. **Vérifier** :
   - Après refresh MView → règles évaluées
   - Alertes créées dans `alert_events`
   - Notifications envoyées via canaux
   - Alertes visibles dans DashboardNotifications

---

## ⚠️ Prochaines Étapes

### À Implémenter

- [ ] Badges dans Sidebar (compteur d'alertes par route)
- [ ] Canal Email (SMTP avec nodemailer)
- [ ] Canal SMS (Twilio ou autre)
- [ ] UI de gestion des règles (CRUD)
- [ ] UI de gestion des silences
- [ ] Escalades (alertes non-ACK après X minutes)
- [ ] Tests unitaires évaluateur
- [ ] Documentation DSL complète

---

**Status** : ✅ **Moteur d'alertes implémenté** — Prêt pour intégration complète
