# Phase P14 - Observabilité Produit (Télémetrie)

## 🎯 Objectifs

- **Télémetrie événements utilisateur** : Views, clicks, exports, filtres, erreurs, perf
- **Stockage minimal & performant** : Table `telemetry_events` avec index, vue matérialisée
- **Client front léger** : Queue + batch automatique (~1.2s, max 100 événements)
- **Hooks React** : Autocapture navigation, actions, erreurs, perf
- **Rétention** : 180 jours par défaut (configurable)

**Règle** : Aucun impact UX. Le routeur avancé, le registry, la Sidebar/Subnav et la KPI Bar restent inchangés.

---

## ✅ Implémentation

### 1. Schéma SQL

**Fichier** : `lib/server/dashboard/sql/20_telemetry.sql`

**Table `telemetry_events`** :
- `id` : BIGSERIAL PRIMARY KEY
- `tenant_id` : UUID NOT NULL
- `user_id` : TEXT (pseudonymisé si nécessaire)
- `occurred_at` : TIMESTAMPTZ (défaut NOW())
- `event_name` : TEXT NOT NULL ('view_opened', 'kpi_click', 'export_triggered', etc.)
- `route_key` : TEXT ('main::sub::leaf')
- `props` : JSONB (données spécifiques)
- `user_agent` : TEXT
- `ip_hash` : TEXT (SHA256(ip+salt) pour pseudonymisation)

**Index** :
- `idx_tel_tenant_time` : (tenant_id, occurred_at DESC)
- `idx_tel_event_name` : (event_name)
- `idx_tel_route_key` : (route_key)
- `idx_tel_props_gin` : GIN sur props JSONB (recherche)

**Vue matérialisée** : `rm_telemetry_views_daily`
- Agrégation : volume par page (jour)
- Refresh : CONCURRENTLY (via cron/worker)

**Rétention** : Fonction `purge_old_telemetry(days_to_keep)` (défaut 180 jours)

### 2. Schéma Zod

**Fichier** : `lib/telemetry/schema.ts`

**Schémas** :
- `TelemetryEvent` : Validation d'un événement
- `TelemetryBatch` : Validation d'un batch (1-200 événements)

### 3. Client Front (Queue + Batch)

**Fichier** : `lib/telemetry/client.ts`

**Fonctionnalités** :
- Queue en mémoire : `QUEUE: Item[]`
- Batch automatique : Toutes les ~1.2s (FLUSH_INTERVAL_MS)
- Taille batch : Max 100 événements (BATCH_SIZE)
- Best effort : `keepalive: true`, `navigator.sendBeacon()` avant déchargement
- Non-bloquant : Erreurs silencieuses (console.warn)

**Fonctions** :
- `track(item)` : Ajoute un événement à la queue
- `flush()` : Force l'envoi immédiat

### 4. Hooks React

**Fichier** : `src/modules/dashboard/telemetry/useTrack.ts`

**Hooks** :
- `useTrackView(routeKey)` : Autocapture ouverture de vue
- `useTrackAction()` : Tracker actions (clics, exports, etc.)
- `useTrackError()` : Tracker erreurs
- `useTrackPerf()` : Tracker métriques de performance

### 5. API Endpoint

**Fichier** : `app/api/telemetry/route.ts`

**Fonctionnalités** :
- POST `/api/telemetry` : Reçoit un batch d'événements
- Validation : Zod schema
- Insertion batch : Performance optimisée
- Pseudonymisation : IP hashé avec salt (si TELEMETRY_SALT défini)
- Best effort : Erreurs non-bloquantes

### 6. Intégration dans Composants

**Fichiers modifiés** :
- `src/modules/dashboard/components/DashboardViewRouter.tsx` : `useTrackView()` pour autocapture navigation
- `src/modules/dashboard/components/DashboardKPIBar.tsx` : `useTrackAction()` pour exports et clics KPI

---

## 📊 Événements Trackés

### Événements Automatiques

- **`view_opened`** : Ouverture d'une vue (autocapture via `useTrackView`)
  - Props : `routeKey` ('main::sub::leaf')

### Événements Manuels

- **`kpi_click`** : Clic sur un KPI
  - Props : `kpiId`, `value`
  
- **`export_triggered`** : Déclenchement d'un export
  - Props : `format` ('csv', 'json', 'xlsx', 'pdf')
  
- **`filter_applied`** : Application d'un filtre
  - Props : `filterType`, `value`
  
- **`error`** : Erreur capturée
  - Props : `error`, `stack`, `context`
  
- **`perf`** : Métrique de performance
  - Props : `metric`, `value`, `context`

---

## 🔧 Configuration

### Variables d'Environnement

```env
# Pseudonymisation IP (optionnel, selon RGPD)
TELEMETRY_SALT=your-random-salt-here
```

### SQL

```bash
# Appliquer le schéma
psql -d your_database -f lib/server/dashboard/sql/20_telemetry.sql

# Configurer rétention (cron)
# 0 2 * * * psql -d your_database -c "SELECT purge_old_telemetry(180);"
```

---

## 🧪 Tests

### Test Client Front

```typescript
import { track, flush } from '@/lib/telemetry/client';

// Tracker un événement
track({ event: 'test_event', props: { test: true } });

// Forcer l'envoi
await flush();
```

### Test API

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: <tenant>" \
  -H "x-user-id: <user>" \
  -d '{
    "items": [
      { "event": "view_opened", "routeKey": "overview::summary::dashboard", "at": 1234567890 }
    ]
  }'
```

### Vérification DB

```sql
-- Vérifier les événements récents
SELECT event_name, route_key, occurred_at, props
FROM telemetry_events
ORDER BY occurred_at DESC
LIMIT 10;

-- Vérifier la vue matérialisée
SELECT * FROM rm_telemetry_views_daily
WHERE tenant_id = '<tenant-id>'
ORDER BY d DESC
LIMIT 10;
```

---

## ⚠️ Risques & Atténuations

### 1. Volume de Données

**Risque** : Table `telemetry_events` peut grossir rapidement

**Atténuation** :
- ✅ Rétention 180 jours (configurable)
- ✅ Index optimisés pour requêtes fréquentes
- ✅ Vue matérialisée pour agrégations (pas de scan complet)
- ✅ Partitionnement possible si volume très élevé

### 2. Performance Front

**Risque** : Tracking peut impacter les performances

**Atténuation** :
- ✅ Queue asynchrone (non-bloquant)
- ✅ Batch automatique (réduit nombre de requêtes)
- ✅ `keepalive: true` + `sendBeacon()` (ne bloque pas le déchargement)
- ✅ Best effort (erreurs silencieuses)

### 3. RGPD / Privacy

**Risque** : Collecte de données personnelles

**Atténuation** :
- ✅ IP hashé avec salt (pseudonymisation)
- ✅ `user_id` optionnel (peut être pseudonymisé côté serveur)
- ✅ Rétention limitée (180 jours)
- ✅ Props JSONB limitées (pas de données sensibles)

---

## 🚀 Déploiement

### Étapes

1. **Appliquer SQL** :
   ```bash
   psql -d your_database -f lib/server/dashboard/sql/20_telemetry.sql
   ```

2. **Configurer rétention** (cron) :
   ```bash
   # Purge quotidienne à 2h du matin
   0 2 * * * psql -d your_database -c "SELECT purge_old_telemetry(180);"
   ```

3. **Configurer salt** (optionnel) :
   ```env
   TELEMETRY_SALT=$(openssl rand -hex 32)
   ```

4. **Vérifier intégration** :
   - Ouvrir une page → vérifier `view_opened` en DB
   - Cliquer sur un KPI → vérifier `kpi_click` en DB
   - Exporter → vérifier `export_triggered` en DB

### Validation

- [ ] Événements `view_opened` enregistrés lors de navigation
- [ ] Événements `kpi_click` enregistrés lors de clics KPI
- [ ] Événements `export_triggered` enregistrés lors d'exports
- [ ] Batch automatique fonctionne (~1.2s)
- [ ] Vue matérialisée `rm_telemetry_views_daily` rafraîchie
- [ ] Pas d'impact sur les performances UI

---

## 📝 Prochaines Étapes

### Analytics Dashboard (Futur)

- Page `/admin/analytics` : Visualisation des événements
- Graphiques : Volume par page, top pages, erreurs, perf
- Filtres : Par tenant, date, événement

### Enrichissement (Futur)

- Session ID : Tracker les sessions utilisateur
- Device info : Mobile/Desktop, OS, Browser
- Performance : TTFB, TTI, FCP, LCP

---

**Status** : ✅ Télémetrie implémentée — Prêt pour production
