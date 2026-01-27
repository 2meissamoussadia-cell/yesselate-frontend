# Phase P15: Moteur d'alertes - Implémentation complète

## ✅ Résumé

Implémentation complète du système d'alertes métier BTP avec :
- ✅ API REST complète (CRUD règles + actions événements)
- ✅ Intégration UI (notifications, tuiles KPI, badges, modal)
- ✅ 13 règles BTP prêtes à l'emploi
- ✅ Guards RBAC + filtrage ABAC
- ✅ Rate limiting Redis
- ✅ Anti-bruit (cooldown, dé-dup, silences)

## 📁 Fichiers créés/modifiés

### API REST
- ✅ `app/api/alerts/rules/route.ts` - GET/POST règles
- ✅ `app/api/alerts/rules/[id]/route.ts` - PUT règle
- ✅ `app/api/alerts/rules/[id]/enable/route.ts` - PATCH enable/disable
- ✅ `app/api/alerts/events/route.ts` - GET événements (amélioré)
- ✅ `app/api/alerts/events/[id]/ack/route.ts` - POST ACK (amélioré)
- ✅ `app/api/alerts/events/[id]/close/route.ts` - POST close (nouveau)
- ✅ `app/api/alerts/stats/route.ts` - GET statistiques (amélioré)
- ✅ `app/api/alerts/test/route.ts` - POST test dry-run (nouveau)
- ✅ `app/api/cron/alerts-evaluate/route.ts` - CRON évaluation (nouveau)

### Composants UI
- ✅ `src/modules/dashboard/components/AlertNotifications.tsx` - Notifications (max 5)
- ✅ `src/modules/dashboard/components/AlertKPITiles.tsx` - Tuiles KPI par gravité
- ✅ `src/modules/dashboard/components/AlertDetailModal.tsx` - Modal avec ACK/Close

### Hooks
- ✅ `src/modules/dashboard/hooks/useAlerts.ts` - Amélioré avec `useOpenAlerts` et `useCloseAlert`

### Navigation
- ✅ `src/modules/dashboard/navigation/DashboardSidebar.tsx` - Badges dynamiques basés sur stats

### SQL
- ✅ `lib/server/dashboard/sql/24_alerting_rules_seed.sql` - 13 règles BTP prêtes à l'emploi

### Documentation
- ✅ `docs/ALERTS_UI_INTEGRATION.md` - Guide d'intégration UI
- ✅ `docs/ALERTS_DEPLOYMENT_CHECKLIST.md` - Checklist de déploiement
- ✅ `docs/ALERTS_P15_COMPLETE.md` - Ce document

## 🎯 Endpoints API

### Règles
| Méthode | Endpoint | Description | Guard |
|---------|----------|-------------|-------|
| GET | `/api/alerts/rules` | Liste règles | `alerts:view` |
| POST | `/api/alerts/rules` | Créer règle | `alerts:admin` |
| PUT | `/api/alerts/rules/[id]` | Mettre à jour | `alerts:admin` |
| PATCH | `/api/alerts/rules/[id]/enable` | Activer/désactiver | `alerts:admin` |

### Événements
| Méthode | Endpoint | Description | Guard |
|---------|----------|-------------|-------|
| GET | `/api/alerts/events?status=open&limit=5` | Liste événements | `alerts:view` |
| POST | `/api/alerts/events/[id]/ack` | ACK événement | `alerts:view` |
| POST | `/api/alerts/events/[id]/close` | Fermer événement | `alerts:view` |
| GET | `/api/alerts/stats` | Statistiques | `alerts:view` |

### Test
| Méthode | Endpoint | Description | Guard |
|---------|----------|-------------|-------|
| POST | `/api/alerts/test` | Test dry-run | `alerts:admin` |

### CRON
| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| POST | `/api/cron/alerts-evaluate` | Évaluer toutes les règles | `CRON_SECRET` |

## 🎨 Intégration UI

### 1. Notifications (AlertNotifications)
- **Emplacement** : Bottom-right (fixed)
- **Source** : `/api/alerts/events?status=open&limit=5`
- **Auto-refresh** : 30s
- **Action** : Clic → ouvre `AlertDetailModal`

### 2. Tuiles KPI (AlertKPITiles)
- **Emplacement** : Section "Alertes actives" dans `OverviewPage`
- **Source** : `/api/alerts/stats`
- **Affichage** : 3 tuiles (Critiques, Warning, Info)

### 3. Badges navigation (DashboardSidebar)
- **Emplacement** : À côté des sections performance
- **Source** : `useAlertStats()` avec mapping routeKey
- **Couleurs** : Rose (>10), Amber (>5), Default

### 4. Modal détail (AlertDetailModal)
- **Ouverture** : Clic sur notification ou tuile KPI
- **Actions** : ACK (si open), Close (si open)
- **Affichage** : Payload, labels, dates, compteur

## 📊 Règles BTP (13 règles)

### Finance (3)
1. **DSO > 60 jours** (critical) - `rm_reporting_dso`
2. **RàF mois > 500 k€** (warning) - `rm_reporting_overview`
3. **RAP mois > 1 M€** (warning) - `rm_reporting_overview`

### Achats (3)
4. **OTIF < 85%** (warning) - `rm_achats_overview`
5. **Variance prix > 8%** (warning) - `rm_achats_overview`
6. **Commandes ouvertes > 50** (warning) - `rm_achats_open_orders`

### Stocks (2)
7. **Ruptures > 10** (warning) - `rm_stocks_ruptures`
8. **Stock élevé + rotation faible** (info) - `rm_stocks_overview`

### Matériel (2)
9. **Taux dispo < 80%** (warning) - `rm_materiel_overview`
10. **Backlog curatif > 10** (critical) - `rm_materiel_backlog_maintenance`

### Conformité (3)
11. **Lots non attribués > 5** (warning) - `rm_compliance_overview`
12. **Contrats incomplets > 0** (critical) - `rm_compliance_missing_docs`
13. **Délai visa moyen > 5 jours** (warning) - `rm_compliance_visas_backlog`

## 🔒 Sécurité

### RBAC
- `alerts:view` : Lecture (liste, stats, ACK/Close)
- `alerts:admin` : Écriture (créer, modifier, tester)

### ABAC
- Filtrage par `bureau` via `labels->>'bureau'`
- Filtrage par `chantier` via `labels->>'chantier'`
- Vérification des scopes dans les endpoints ACK/Close

### Rate Limiting
- Routes GET : 120-240 req, 2-4/s
- Routes POST/PUT : 20-60 req, 0.5-1/s
- Route test : 10 req, 0.2/s (strict car coûteux)

## 🚀 Déploiement

### 1. SQL
```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/23_alerting.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/24_alerting_rules_seed.sql
```

### 2. CRON
Configurer un job pour appeler `/api/cron/alerts-evaluate` toutes les 5-10 minutes avec le header `x-cron-secret`.

### 3. Vérification
- ✅ Notifications s'affichent
- ✅ Badges dans sidebar
- ✅ Modal fonctionnel
- ✅ Test POST `/api/alerts/test`

## 📝 Notes importantes

1. **Tenant ID** : Les règles seed utilisent `(SELECT id FROM tenants LIMIT 1)` - à remplacer en production
2. **MViews** : Les MViews doivent exister avant de créer les règles
3. **Worker** : Déjà intégré dans `refreshMViewsWorker` - évalue automatiquement après refresh
4. **Escalade** : À implémenter dans `channels.ts` (si critical non ACK sous 30 min)

## 🎉 Statut

**Phase P15 complète** ✅

Tous les endpoints, composants UI, règles seed et intégrations sont prêts. Le système est opérationnel après application du SQL et configuration du CRON.
