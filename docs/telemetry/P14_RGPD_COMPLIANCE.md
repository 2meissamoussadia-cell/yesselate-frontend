# Phase P14 - Conformité RGPD / Privacy

## 🎯 Objectifs

- **Consentement utilisateur** : Bannière paramétrable par tenant
- **Opt-out** : Cookie `telemetry_consent=off` pour désactiver
- **Minimisation** : Pas de données personnelles dans props, IP hashée
- **Rétention** : 180 jours (configurable)
- **Droits** : Endpoint d'anonymisation `/api/telemetry/anonymize`
- **Audit** : Logs d'accès et opérations sensibles

---

## ✅ Implémentation

### 1. Consentement UI

**Fichiers** :
- `src/modules/dashboard/telemetry/consent/TelemetryConsentBanner.tsx` : Bannière de consentement
- `src/modules/dashboard/telemetry/consent/useTelemetryConsent.ts` : Hook de gestion

**Fonctionnalités** :
- Bannière affichée si consentement non donné
- Cookie `telemetry_consent` (on/off/null)
- Expiration : 1 an
- Message personnalisable par tenant

**Intégration** :
```tsx
import { TelemetryConsentBanner } from '@/modules/dashboard/telemetry/consent';

// Dans le layout principal
<TelemetryConsentBanner 
  message="Message personnalisé par tenant"
  privacyPolicyUrl="/privacy"
  position="bottom"
/>
```

### 2. Respect du Consentement

**Fichier** : `lib/telemetry/client.ts`

**Modification** :
- `track()` vérifie le cookie `telemetry_consent` avant d'ajouter à la queue
- Si `telemetry_consent=off` ou absent → aucun tracking

### 3. Minimisation des Données

**Règles** :
- ✅ `user_id` : Pseudonymisé côté serveur si nécessaire
- ✅ `ip_hash` : SHA256(ip + salt) pour pseudonymisation
- ✅ `props` : Pas de données personnelles (nom, email, etc.)
- ✅ `user_agent` : Conservé pour analytics (non identifiant)

**Validation** :
- Props limitées à : `kpiId`, `format`, `filterName`, `error`, `metric`, `value`
- Pas de `email`, `name`, `phone`, `address` dans props

### 4. Rétention

**Fichier** : `lib/server/dashboard/sql/20_telemetry.sql`

**Fonction** :
```sql
SELECT purge_old_telemetry(180); -- 180 jours par défaut
```

**Cron** :
```bash
# Purge quotidienne à 2h du matin
0 2 * * * psql -d your_database -c "SELECT purge_old_telemetry(180);"
```

### 5. Anonymisation

**Endpoint** : `POST /api/telemetry/anonymize`

**Usage** :
```bash
curl -X POST http://localhost:3000/api/telemetry/anonymize \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: <tenant>" \
  -H "x-user-id: <user>" \
  -d '{"userId": "user123"}'
```

**Action** :
- Remplace `user_id` par `NULL`
- Ajoute `props.anonymized = true`
- Log dans `telemetry_audit_log`

### 6. Audit Logs

**Fichier** : `lib/server/dashboard/sql/20_telemetry_rgpd_audit.sql`

**Table** : `telemetry_audit_log`
- `operation` : 'anonymize', 'export', 'delete'
- `target_user_id` : Utilisateur concerné
- `performed_by` : Utilisateur qui a effectué l'opération
- `details` : JSONB avec détails (nombre d'enregistrements, etc.)
- `ip_address`, `user_agent` : Traçabilité

**Vue** : `v_telemetry_audit_summary`
- Résumé des opérations par tenant/opération

---

## 📊 Rapports Métiers

### 1. Adoption par Module

**Vue** : `v_telemetry_adoption_by_module`

**Métriques** :
- Views par module/route (7 derniers jours)
- Utilisateurs uniques par module
- Tendance jour par jour

**Requête** :
```sql
SELECT * FROM v_telemetry_adoption_by_module
WHERE tenant_id = '<tenant-id>'
ORDER BY day DESC, views DESC;
```

### 2. Funnel Export

**Vue** : `v_telemetry_export_funnel`

**Métriques** :
- `total_views` : Nombre de vues
- `users_clicked_kpi` : Utilisateurs ayant cliqué sur un KPI
- `users_exported` : Utilisateurs ayant exporté
- `click_rate_pct` : Taux de clic KPI
- `export_rate_pct` : Taux d'export

**Requête** :
```sql
SELECT * FROM v_telemetry_export_funnel
WHERE tenant_id = '<tenant-id>'
ORDER BY export_rate_pct DESC;
```

### 3. Taux d'Erreur UI

**Vue** : `v_telemetry_error_rate`

**Métriques** :
- `total_views` : Nombre de vues
- `total_errors` : Nombre d'erreurs
- `error_rate_pct` : Taux d'erreur par route

**Requête** :
```sql
SELECT * FROM v_telemetry_error_rate
WHERE tenant_id = '<tenant-id>'
ORDER BY error_rate_pct DESC;
```

### 4. Temps Passé par Page

**Vue** : `v_telemetry_time_spent`

**Métriques** :
- `sessions` : Nombre de sessions
- `avg_time_seconds` : Temps moyen
- `median_time_seconds` : Temps médian

**Requête** :
```sql
SELECT * FROM v_telemetry_time_spent
WHERE tenant_id = '<tenant-id>'
ORDER BY sessions DESC;
```

---

## 🧪 Tests QA

### 1. Test Sans Consentement

```typescript
// Désactiver le cookie
document.cookie = 'telemetry_consent=off; path=/';

// Tenter de tracker
track({ event: 'test', props: { test: true } });

// Vérifier : aucun événement dans la queue
// La queue doit rester vide
```

### 2. Test Avec Consentement

```typescript
// Activer le cookie
document.cookie = 'telemetry_consent=on; path=/';

// Tracker
track({ event: 'test', props: { test: true } });

// Vérifier : événement dans la queue
// Après ~1.2s, vérifier l'envoi au serveur
```

### 3. Test Rate Limiting

```bash
# Envoyer 1000+ requêtes rapidement
for i in {1..1100}; do
  curl -X POST http://localhost:3000/api/telemetry \
    -H "Content-Type: application/json" \
    -H "x-tenant-id: <tenant>" \
    -d '{"items": [{"event": "test", "at": 1234567890}]}'
done

# Vérifier : 429 après ~100 requêtes
```

### 4. Test Anonymisation

```bash
# Anonymiser un utilisateur
curl -X POST http://localhost:3000/api/telemetry/anonymize \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: <tenant>" \
  -d '{"userId": "user123"}'

# Vérifier en DB
SELECT user_id, props->>'anonymized' 
FROM telemetry_events 
WHERE user_id IS NULL 
  AND props->>'anonymized' = 'true';
```

### 5. Vérification Pas de Données Personnelles

```sql
-- Vérifier qu'aucun prop ne contient de données personnelles
SELECT id, props
FROM telemetry_events
WHERE props::text ILIKE '%email%'
   OR props::text ILIKE '%phone%'
   OR props::text ILIKE '%name%'
   OR props::text ILIKE '%address%';

-- Doit retourner 0 lignes
```

---

## 🚀 Déploiement

### Checklist

- [ ] Appliquer `sql/20_telemetry.sql`
- [ ] Appliquer `sql/20_telemetry_rgpd_audit.sql`
- [ ] Configurer rétention (cron) : `purge_old_telemetry(180)`
- [ ] Configurer `TELEMETRY_SALT` (optionnel)
- [ ] Déployer endpoint `/api/telemetry`
- [ ] Déployer endpoint `/api/telemetry/anonymize`
- [ ] Intégrer `TelemetryConsentBanner` dans le layout
- [ ] Vérifier que `track()` respecte le consentement
- [ ] Tester rate limiting (1000 req, refill 10/s)
- [ ] Créer dashboards Grafana/Superset/Metabase :
  - Adoption par module
  - Funnel export
  - Taux d'erreur UI
  - Temps passé par page
- [ ] Documenter politique de confidentialité
- [ ] Former équipe support sur anonymisation

---

## ⚠️ Risques & Atténuations

### 1. Consentement Non Respecté

**Risque** : Tracking sans consentement

**Atténuation** :
- ✅ Vérification cookie dans `track()`
- ✅ Tests automatisés
- ✅ Audit logs

### 2. Données Personnelles dans Props

**Risque** : Fuite de données personnelles

**Atténuation** :
- ✅ Validation côté client (Zod schema)
- ✅ Validation côté serveur (sanitization)
- ✅ Audit SQL régulier

### 3. Rétention Non Appliquée

**Risque** : Données conservées indéfiniment

**Atténuation** :
- ✅ Cron automatique
- ✅ Monitoring de la taille de la table
- ✅ Alertes si rétention > 200 jours

---

**Status** : ✅ RGPD/Privacy implémenté — Prêt pour audit
