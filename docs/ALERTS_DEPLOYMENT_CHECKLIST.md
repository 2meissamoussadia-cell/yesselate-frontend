# Phase P15: Checklist de déploiement - Moteur d'alertes

## ✅ Checklist express

### 1. Base de données
- [ ] Appliquer `lib/server/dashboard/sql/23_alerting.sql`
- [ ] Appliquer `lib/server/dashboard/sql/24_alerting_rules_seed.sql`
- [ ] Vérifier que les MViews existent (rm_finance_overview, rm_achats_overview, etc.)
- [ ] Vérifier les tables : `alert_rules`, `alert_events`, `alert_channels`, `alert_subscriptions`, `alert_silences`

### 2. Endpoints API REST
- [x] GET `/api/alerts/rules` - Liste règles (avec guards RBAC + ABAC)
- [x] POST `/api/alerts/rules` - Créer règle (JSON DSL)
- [x] PUT `/api/alerts/rules/[id]` - Mettre à jour
- [x] PATCH `/api/alerts/rules/[id]/enable` - Activer/désactiver
- [x] GET `/api/alerts/events?status=open&limit=5` - Alertes ouvertes
- [x] GET `/api/alerts/stats` - Statistiques
- [x] POST `/api/alerts/events/[id]/ack` - ACK
- [x] POST `/api/alerts/events/[id]/close` - Fermer
- [x] POST `/api/alerts/test` - Test dry-run

### 3. Workers
- [x] `evaluateRulesForMView` appelé après refresh MViews (déjà intégré)
- [ ] CRON configuré pour `evaluateAllTenantsRules` (toutes les 5-10 min)
- [ ] Vérifier que le worker ne bloque pas le refresh MViews

### 4. UI - Composants
- [x] `AlertNotifications` - Notifications (max 5)
- [x] `AlertKPITiles` - Tuiles KPI par gravité
- [x] `AlertDetailModal` - Modal avec ACK/Close
- [x] Badges dans `DashboardSidebar` (basés sur stats)

### 5. Intégration
- [x] `AlertNotifications` intégré dans `DashboardCommandCenterPage`
- [ ] `AlertKPITiles` ajouté dans une page (ex: OverviewPage ou page dédiée)
- [x] Badges dynamiques dans sidebar (basés sur `useAlertStats()`)

### 6. Sécurité
- [x] Guards RBAC : `alerts:view` et `alerts:admin`
- [x] Filtrage ABAC : par bureau/chantier via labels
- [x] Rate limiting Redis sur toutes les routes
- [x] Validation Zod pour création/mise à jour

### 7. Tests
- [ ] Tester POST `/api/alerts/test` avec une règle
- [ ] Vérifier que les notifications s'affichent
- [ ] Vérifier que les badges apparaissent dans la sidebar
- [ ] Tester ACK/Close depuis le modal

## 🔧 Configuration CRON

### Option 1: Node.js (node-cron)
```javascript
const cron = require('node-cron');
const { evaluateAllTenantsRules } = require('./lib/server/dashboard/alerting/alertsEvaluatorWorker');

// Toutes les 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await evaluateAllTenantsRules();
});
```

### Option 2: Système (crontab)
```bash
# Toutes les 5 minutes
*/5 * * * * cd /path/to/project && node -r ts-node/register lib/server/dashboard/alerting/alertsEvaluatorWorker.ts
```

### Option 3: Next.js API Route (recommandé)
Créer `/app/api/cron/alerts-evaluate/route.ts` protégé par secret :

```typescript
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { evaluateAllTenantsRules } = await import('@/lib/server/dashboard/alerting/alertsEvaluatorWorker');
  await evaluateAllTenantsRules();
  
  return NextResponse.json({ ok: true });
}
```

Puis configurer un CRON externe (ex: Vercel Cron) pour appeler cette route.

## 📊 Règles BTP seed

Les 13 règles sont prêtes dans `24_alerting_rules_seed.sql` :

**Finance** (3) : DSO > 60j, RàF > 500k€, RAP > 1M€
**Achats** (3) : OTIF < 85%, Variance > 8%, Commandes > 50
**Stocks** (2) : Ruptures > 10, Stock élevé + rotation faible
**Matériel** (2) : Dispo < 80%, Backlog curatif > 10
**Conformité** (3) : Lots > 5, Contrats incomplets, Délai visa > 5j

## 🛡️ Anti-bruit & silences

- ✅ **Cooldown** : `cooldown_sec` (défaut 600s = 10 min)
- ✅ **Dé-dup** : Par fingerprint (rule_id + labels)
- ✅ **Reopen** : `reopen_after_sec` (défaut 3600s = 1h)
- ✅ **Silences** : Table `alert_silences` + `schedule.mute` (plages horaires)
- ✅ **Escalade** : À implémenter dans `channels.ts` (si critical non ACK sous 30 min → canal 2)

## ⚠️ Risques & garde-fous

### Faux positifs
- Régler `cooldown_sec` et `reopen_after_sec` selon le contexte
- Utiliser moyennes glissantes plutôt que seuils simples (à implémenter dans le DSL)

### Latence
- Si nombreuses règles : batcher par domaine (finance → achats → stocks)
- Worker déjà optimisé avec gestion d'erreurs par règle

### Sécurité
- ✅ Rate limiting Redis (P11)
- ✅ Secrets de canaux (Teams/SMTP) stockés en DB, jamais exposés au front
- ✅ Guards RBAC sur tous les endpoints

## 🎯 Prochaines étapes

1. **Tester les règles seed** : Exécuter le SQL et vérifier qu'elles sont créées
2. **Tester POST /api/alerts/test** : Valider qu'une règle s'évalue correctement
3. **Vérifier l'UI** : S'assurer que les notifications et badges s'affichent
4. **Configurer CRON** : Mettre en place le job périodique
5. **Ajuster les seuils** : Régler les cooldowns selon les retours utilisateurs
