# Phase P15: Intégration UI - Moteur d'alertes

## 📋 Vue d'ensemble

Intégration complète du système d'alertes dans l'interface utilisateur avec réutilisation des composants existants.

## ✅ Composants créés

### 1. AlertNotifications
**Fichier**: `src/modules/dashboard/components/AlertNotifications.tsx`

- Affiche max 5 notifications d'alertes ouvertes
- Style cohérent avec `KPINotifications`
- Clic sur notification → ouvre `AlertDetailModal`
- Auto-refresh toutes les 30s via `useOpenAlerts(5)`

**Utilisation**:
```tsx
import { AlertNotifications } from '@/modules/dashboard/components/AlertNotifications';

// Déjà intégré dans DashboardCommandCenterPage
<AlertNotifications />
```

### 2. AlertKPITiles
**Fichier**: `src/modules/dashboard/components/AlertKPITiles.tsx`

- 3 tuiles KPI : Critiques, Warning, Info
- Utilise le composant `KpiTile` existant
- Affiche les compteurs depuis `useAlertStats()`

**Utilisation**:
```tsx
import { AlertKPITiles } from '@/modules/dashboard/components/AlertKPITiles';

<AlertKPITiles />
```

### 3. AlertDetailModal
**Fichier**: `src/modules/dashboard/components/AlertDetailModal.tsx`

- Modal de détail avec payload, labels, dates
- Actions ACK/Close (si status = 'open')
- Réutilise le style de `KPIDrillDownModal`

**Utilisation**:
```tsx
import { AlertDetailModal } from '@/modules/dashboard/components/AlertDetailModal';

<AlertDetailModal
  alert={selectedAlert}
  isOpen={!!selectedAlert}
  onClose={() => setSelectedAlert(null)}
/>
```

## 🔧 Hooks améliorés

### useAlerts.ts
- ✅ `useOpenAlerts(limit)` - Récupère les alertes ouvertes
- ✅ `useAlertStats(routeKey?)` - Statistiques par gravité
- ✅ `useAckAlert()` - Mutation pour ACK
- ✅ `useCloseAlert()` - Mutation pour Close

## 🎨 Intégration dans la navigation

### DashboardSidebar
**Fichier**: `src/modules/dashboard/navigation/DashboardSidebar.tsx`

- ✅ Badges dynamiques basés sur `useAlertStats()`
- ✅ Mapping routeKey → node.id pour sections performance
- ✅ Badges colorés (rose pour >10, amber pour >5)

**Mapping routeKey**:
- `performance::reporting::dashboard` → `reporting`
- `performance::achats::dashboard` → `achats`
- `performance::stocks::dashboard` → `stocks`
- `performance::materiel::dashboard` → `materiel`
- `performance::compliance::dashboard` → `compliance`

## 📊 Règles BTP prêtes à l'emploi

### Script SQL
**Fichier**: `lib/server/dashboard/sql/24_alerting_rules_seed.sql`

**Finance** (3 règles):
- DSO > 60 jours (critical)
- RàF mois > 500 k€ (warning)
- RAP mois > 1 M€ (warning)

**Achats** (3 règles):
- OTIF < 85% (warning)
- Variance prix > 8% (warning)
- Commandes ouvertes > 50 (warning)

**Stocks** (2 règles):
- Ruptures > 10 (warning)
- Valeur stock > 3 M€ et rotation < 0.5/mois (info)

**Matériel** (2 règles):
- Taux dispo < 80% (warning)
- Backlog curatif > 10 (critical)

**Conformité** (3 règles):
- Lots non attribués > 5 (warning)
- Contrats incomplets > 0 (critical)
- Délai visa moyen > 5 jours (warning)

**Total**: 13 règles prêtes à l'emploi

## 🚀 Déploiement

### 1. Appliquer le SQL
```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/23_alerting.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/24_alerting_rules_seed.sql
```

### 2. Vérifier les endpoints API
- ✅ GET `/api/alerts/rules` - Liste règles
- ✅ POST `/api/alerts/rules` - Créer règle
- ✅ PUT `/api/alerts/rules/[id]` - Mettre à jour
- ✅ PATCH `/api/alerts/rules/[id]/enable` - Activer/désactiver
- ✅ GET `/api/alerts/events?status=open&limit=5` - Alertes ouvertes
- ✅ GET `/api/alerts/stats` - Statistiques
- ✅ POST `/api/alerts/events/[id]/ack` - ACK
- ✅ POST `/api/alerts/events/[id]/close` - Fermer
- ✅ POST `/api/alerts/test` - Test dry-run

### 3. Brancher le worker
Le worker `alertsEvaluatorWorker` doit être appelé :
- Après refresh de MViews (déjà intégré dans `refreshMViewsWorker`)
- Via CRON toutes les 5-10 minutes

### 4. Vérifier l'UI
- ✅ Notifications affichées (bottom-right)
- ✅ Tuiles KPI alertes (si ajoutées dans une page)
- ✅ Badges dans la sidebar
- ✅ Modal de détail fonctionnel

## 🔒 Sécurité

- ✅ Guards RBAC : `alerts:view` et `alerts:admin`
- ✅ Filtrage ABAC : par bureau/chantier via labels
- ✅ Rate limiting Redis sur toutes les routes
- ✅ Validation Zod pour création/mise à jour

## 📝 Notes

- Les règles seed utilisent `(SELECT id FROM tenants LIMIT 1)` - à remplacer par le tenant_id réel en production
- Les MViews doivent exister avant de créer les règles
- Le worker d'évaluation est déjà intégré dans le système de refresh MViews
