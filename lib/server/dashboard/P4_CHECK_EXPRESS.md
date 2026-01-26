# ✅ P4 - Check Express Déploiement

## 🎯 Validation rapide Phase P4 (Observabilité & Robustesse + ChartKit)

---

## 1️⃣ Tracing OpenTelemetry

**Démarrage** :
```bash
# Option A: Via instrumentation.ts (Next.js)
# Vérifier que next.config.ts a:
experimental: { instrumentationHook: true }

# Option B: Bootstrap manuel (si besoin)
node --require lib/server/observability/otel/node-otel.js node_modules/.bin/next start
```

**Variables d'environnement** :
```env
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://tempo:4318/v1/traces
NODE_ENV=production
```

**Vérification** :
```bash
# Logs au démarrage
grep "OTEL" logs/app.log | grep "tracing started"
# Attendu: [OTEL] tracing started
```

---

## 2️⃣ Métriques Prometheus

**Endpoint** :
```bash
curl http://localhost:3000/api/internal/metrics
```

**Attendu** : Format Prometheus text avec :
- `http_request_duration_seconds`
- Métriques système (nodejs_*)

**Vérification métriques clés** :
```bash
curl http://localhost:3000/api/internal/metrics | grep "http_request_duration_seconds"
```

---

## 3️⃣ Health Check

**Endpoint interne** :
```bash
curl http://localhost:3000/api/internal/health
```

**Attendu** :
```json
{
  "ok": true,
  "mviews": [
    { "view_name": "rm_kpis_overview", "refreshed_at": "...", "age": "..." },
    ...
  ]
}
```

**Vérification DB** :
```sql
SELECT view_name, refreshed_at, now() - refreshed_at as age
FROM mview_refresh_log
ORDER BY refreshed_at DESC
LIMIT 6;
```

---

## 4️⃣ Rate Limiting

**Test** :
```bash
# 120 requêtes avec refill 2/s (limite: 120)
for i in {1..125}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "x-tenant-id: test" \
    http://localhost:3000/api/dashboard/overview/summary/dashboard &
done
wait
```

**Attendu** : Les requêtes 121-125 retournent `429 Too Many Requests`

---

## 5️⃣ Logs structurés (Pino)

**Vérification** :
```bash
# Logs JSON avec reqId
curl -H "x-tenant-id: test" http://localhost:3000/api/dashboard/overview/summary/dashboard
# Noter le x-request-id dans la réponse

# Chercher dans les logs
grep "reqId" logs/app.log | head -3
```

**Attendu** : Logs JSON avec champ `reqId` corrélé

---

## 6️⃣ Front - ChartKit Recharts

**Vérification visuelle** :
1. Accéder à `/maitre-ouvrage/dashboard/overview/tendances/dashboard`
2. Vérifier que les graphiques s'affichent (Recharts)
3. Console navigateur : aucune erreur

**Vérification bundle** :
```bash
npm run build 2>&1 | grep -i "chart.js" || echo "✅ Chart.js non trouvé"
```

**Vérification DashboardCharts** :
- `src/modules/dashboard/components/DashboardCharts.tsx` utilise `LineChartLazy` et `AreaChartLazy`
- Plus de Chart.js

---

## 7️⃣ Compatibilité UX (100% préservée)

**Navigation** :
- [ ] Sidebar/Subnav fonctionnent
- [ ] Deep-links fonctionnent
- [ ] Back/forward navigateur fonctionnent

**Registry** :
- [ ] Données se chargent via le registry
- [ ] TTL fonctionne

**KPI Bar** :
- [ ] KPIs s'affichent correctement
- [ ] Drill-down fonctionne

---

## ✅ Checklist finale

- [ ] OpenTelemetry : Traces visibles dans Tempo/Jaeger
- [ ] Prometheus : Métriques accessibles
- [ ] Health : Endpoint retourne `ok: true` avec mviews
- [ ] Rate limit : 429 sur rafales
- [ ] Logs : JSON structurés avec reqId
- [ ] ChartKit : Tous les graphiques utilisent Recharts
- [ ] UX : Aucun changement visible

---

## 🚀 Prêt pour P5 (Achats/Contrats)

Une fois P4 validé, on peut enchaîner avec P5 :
- SQL : `07_achats_core.sql`, `08_achats_views.sql`, `09_achats_triggers_notify.sql`
- Registry : Clés `performance::achats::*` déjà préparées
- Pages : `AchatsOverviewPage`, `AchatsFournisseursPage`, `AchatsOpenOrdersPage`

**Commande** : `go Achats` pour démarrer P5
