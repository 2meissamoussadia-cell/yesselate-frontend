# ✅ Checklist de validation post-déploiement - Phase P3

## 🎯 Objectif

Valider que le déploiement de la Phase P3 (Event-Driven Refresh + Jobs + KPIs Finance) fonctionne correctement sans impact sur l'UX existante.

---

## 1. Routing UI - Navigation & Deep-links

### ✅ Navigation via Sidebar/Subnav

- [ ] **Sidebar principale** : Tous les liens fonctionnent (Overview, Projets, Demandes, Budget, etc.)
- [ ] **Subnav** : Navigation secondaire fonctionnelle (Summary, KPIs, Tendances, etc.)
- [ ] **URL synchronisée** : L'URL change lors de la navigation dans la Sidebar/Subnav
- [ ] **Deep-links** : Accès direct via URL (ex: `/maitre-ouvrage/dashboard/overview/summary/dashboard`) fonctionne
- [ ] **Back/Forward** : Boutons navigateur (précédent/suivant) fonctionnent correctement
- [ ] **Lazy loading** : Les composants se chargent à la demande (pas de chargement initial lourd)
- [ ] **Transitions** : Animations/transitions fluides entre les pages

### 🔍 Tests manuels

```bash
# 1. Ouvrir l'application
# 2. Naviguer via Sidebar : Overview → Projets → Demandes → Budget
# 3. Vérifier que l'URL change à chaque navigation
# 4. Utiliser les boutons Back/Forward du navigateur
# 5. Copier une URL et l'ouvrir dans un nouvel onglet (deep-link)
```

### 📝 Fichiers concernés

- `src/modules/dashboard/navigation/DashboardSidebar.tsx`
- `src/modules/dashboard/navigation/DashboardSubNavigation.tsx`
- `src/modules/dashboard/router/DashboardViewRouter.tsx`

---

## 2. Synthèse (Overview/Summary/Dashboard) - KPIs Finance

### ✅ KPIs visibles et réalistes

- [ ] **RAT (Reste à Terminer)** : Affiché et calculé correctement
- [ ] **RAP (Reste à Produire)** : Affiché et calculé correctement
- [ ] **Reste à Facturer** : Affiché et calculé correctement
- [ ] **DSO (Days Sales Outstanding)** : Affiché et calculé correctement
- [ ] **Factures impayées** : Compteur visible
- [ ] **CA réalisé (30j)** : Montant visible

### 🔍 Tests manuels

```bash
# 1. Accéder à /maitre-ouvrage/dashboard/overview/summary/dashboard
# 2. Vérifier que tous les KPIs Finance sont visibles
# 3. Vérifier que les valeurs sont réalistes (pas de NaN, Infinity, ou valeurs aberrantes)
# 4. Vérifier le formatage des montants (€, séparateurs de milliers)
```

### 📝 Fichiers concernés

- `src/modules/dashboard/components/views/SummaryPointsPage.tsx`
- `src/modules/dashboard/components/DashboardKPIBar.tsx`
- `lib/server/dashboard/repositories/SqlReadModelsRepo.ts` (méthode `loadKpisFinance`)

### 🧪 Test API direct

```bash
# Tester l'API directement
curl -H "x-tenant-id: <tenant-uuid>" -H "x-user-id: <user-id>" \
  http://localhost:3000/api/dashboard/overview/summary/dashboard | jq '.data.finance'
```

---

## 3. KPIs Projets / Demandes - Listes & Compteurs

### ✅ Projets

- [ ] **Liste des projets** : Affichée correctement
- [ ] **Compteurs** : Nombre de projets actifs, en cours, terminés
- [ ] **Scopes respectés** : Filtrage par tenant/bureau/chantier fonctionne
- [ ] **Données fraîches** : Les valeurs se mettent à jour après refresh

### ✅ Demandes

- [ ] **Liste des demandes** : Affichée correctement
- [ ] **Compteurs** : Nombre de demandes en attente, validées, rejetées
- [ ] **Scopes respectés** : Filtrage par tenant/bureau/chantier fonctionne
- [ ] **Données fraîches** : Les valeurs se mettent à jour après refresh

### 🔍 Tests manuels

```bash
# 1. Accéder à /maitre-ouvrage/dashboard/performance/projets/dashboard
# 2. Vérifier la liste des projets
# 3. Vérifier les compteurs (en haut de page)
# 4. Changer de bureau/chantier (si applicable)
# 5. Vérifier que les données changent selon le scope

# 6. Accéder à /maitre-ouvrage/dashboard/performance/demandes/dashboard
# 7. Répéter les mêmes vérifications
```

### 🧪 Test API direct

```bash
# Test KPIs Projets
curl -H "x-tenant-id: <tenant-uuid>" -H "x-user-id: <user-id>" \
  -H "x-scope: bureau:PARIS" \
  http://localhost:3000/api/dashboard/performance/projets/dashboard | jq '.data'

# Test KPIs Demandes
curl -H "x-tenant-id: <tenant-uuid>" -H "x-user-id: <user-id>" \
  -H "x-scope: bureau:PARIS" \
  http://localhost:3000/api/dashboard/performance/demandes/dashboard | jq '.data'
```

### 📝 Fichiers concernés

- `src/modules/dashboard/components/views/ProjetKpiPage.tsx`
- `src/modules/dashboard/components/views/DemandesKpiPage.tsx`
- `lib/server/dashboard/repositories/SqlReadModelsRepo.ts` (méthodes `loadKpisProjets`, `loadKpisDemandes`)

---

## 4. Event-Driven Refresh - Mise à jour automatique

### ✅ Mutation → Refresh ciblé → Mise à jour

- [ ] **Trigger PostgreSQL** : Les triggers `notify_dashboard_refresh` sont actifs
- [ ] **Worker écoute** : Le worker Event-Driven écoute le canal `dashboard_refresh`
- [ ] **Refresh ciblé** : Seules les vues concernées sont rafraîchies
- [ ] **TTL Registry** : Le registry invalide le cache après TTL
- [ ] **Mise à jour UI** : Les valeurs se mettent à jour dans le dashboard après le refresh

### 🔍 Tests manuels

```sql
-- 1. Dans psql, insérer un nouveau projet
INSERT INTO projets (tenant_id, bureau_code, nom, ...) VALUES (...);

-- 2. Vérifier que le trigger a envoyé une notification
-- (Le worker devrait logger : [WORKER] 🚀 Notification reçue pour domain: projets)

-- 3. Attendre quelques secondes (refresh + TTL)

-- 4. Rafraîchir la page dashboard
-- 5. Vérifier que le nouveau projet apparaît dans la liste
```

### 🧪 Test de notification manuelle

```sql
-- Tester une notification manuelle
SELECT pg_notify('dashboard_refresh', '{"domain":"projets","tenant_id":"test"}');

-- Vérifier les logs du worker
# Dans les logs, chercher :
# [WORKER] 🚀 Notification reçue
# [MVIEW] ✅ Vue rm_kpis_projets rafraîchie
```

### 📝 Fichiers concernés

- `lib/server/dashboard/sql/05_triggers_notify.sql`
- `lib/server/dashboard/workers/refreshMViewsWorker.ts`
- `src/modules/dashboard/registry/dashboardRegistry.tsx` (TTL)

---

## 5. Fallback Routeur - Bascule automatique

### ✅ Gestion des erreurs

- [ ] **Route invalide** : Si une feuille `leaf` est mal configurée, bascule sur le dashboard du `main`
- [ ] **Aucune page vide** : Jamais de page blanche en production
- [ ] **Erreurs gracieuses** : Messages d'erreur clairs si nécessaire

### 🔍 Tests manuels

```bash
# 1. Accéder à une route invalide
# Ex: /maitre-ouvrage/dashboard/overview/invalid/route

# 2. Vérifier que l'application bascule automatiquement sur
# /maitre-ouvrage/dashboard/overview/summary/dashboard
# (ou le dashboard par défaut du main "overview")

# 3. Vérifier qu'il n'y a pas de page blanche
```

### 📝 Fichiers concernés

- `src/modules/dashboard/components/DashboardViewRouter.tsx` (lignes 160-181 : fallback automatique)
- `src/modules/dashboard/utils/routeValidation.ts` (fonction `getFallbackComponent`)
- `src/modules/dashboard/registry/dashboardRegistry.tsx` (TTL et cache)

---

## 6. Sécurité ABAC - Rôles & Scopes

### ✅ Filtrage effectif

- [ ] **Rôles** : admin / manager / reader respectés
- [ ] **Scopes** : `bureau:*`, `chantier:*` appliqués correctement
- [ ] **Filtrage SQL** : Les requêtes incluent les clauses WHERE pour tenant/bureau/chantier
- [ ] **Aucune fuite** : Un utilisateur ne peut pas voir les données d'un autre bureau/chantier

### 🔍 Tests manuels

```bash
# 1. Se connecter avec un utilisateur ayant scope "bureau:PARIS"
# 2. Vérifier que seules les données de Paris sont visibles
# 3. Se connecter avec un utilisateur ayant scope "bureau:LYON"
# 4. Vérifier que seules les données de Lyon sont visibles
# 5. Vérifier qu'il n'y a pas de chevauchement
```

### 🧪 Test API avec différents scopes

```bash
# Test avec scope bureau:PARIS
curl -H "x-tenant-id: <tenant-uuid>" \
  -H "x-user-id: <user-id>" \
  -H "x-scope: bureau:PARIS" \
  http://localhost:3000/api/dashboard/performance/projets/dashboard | jq '.data'

# Test avec scope bureau:LYON
curl -H "x-tenant-id: <tenant-uuid>" \
  -H "x-user-id: <user-id>" \
  -H "x-scope: bureau:LYON" \
  http://localhost:3000/api/dashboard/performance/projets/dashboard | jq '.data'

# Vérifier que les résultats sont différents
```

### 📝 Fichiers concernés

- `lib/server/dashboard/abac.ts` (fonction `buildScopeWhereFragment`)
- `lib/server/dashboard/repositories/SqlReadModelsRepo.ts` (toutes les méthodes `load*`)

---

## 7. Rollback Plan - Retour en arrière sûr

### ✅ Procédure de rollback

- [ ] **Stopper worker/cron** : Les processus sont arrêtés
- [ ] **Fallback InMemory** : Désactiver `DATABASE_URL` → fallback automatique vers `InMemoryReadModelsRepo`
- [ ] **Front inchangé** : Le router/registry continuent de fonctionner
- [ ] **MViews optionnelles** : Les vues matérialisées peuvent être ignorées

### 🔍 Procédure de rollback

```bash
# 1. Stopper le worker Event-Driven
pm2 stop dashboard-refresh-worker
# ou
sudo systemctl stop dashboard-refresh-worker

# 2. Stopper le CRON (commenter la ligne dans crontab)
crontab -e
# Commenter : */10 * * * * curl -X POST ...

# 3. Désactiver DATABASE_URL (ou le retirer du .env)
# Le système basculera automatiquement vers InMemoryReadModelsRepo

# 4. Redémarrer l'application
npm run start

# 5. Vérifier que le dashboard fonctionne toujours (avec données mock)
```

### 📝 Fichiers concernés

- `lib/server/dashboard/repositories/ReadModelsRepo.ts` (factory qui choisit InMemory ou SQL)
- `lib/server/dashboard/repositories/InMemoryReadModelsRepo.ts` (fallback)

---

## 8. Observabilité - Préparation P4

### ⚠️ À valider après déploiement P4

- [ ] **Métriques Prometheus** : Temps de refresh par vue, erreurs, notifications reçues
- [ ] **Logs structurés** : CorrelationId côté API et worker
- [ ] **Traces OpenTelemetry** : Spans sur `/api/dashboard/*` et refresh jobs
- [ ] **Health checks** : Endpoint `/api/health` fonctionne

**Note** : Ces points seront validés lors du déploiement de la Phase P4.

---

## 9. Extensions fonctionnelles - À venir

### 📋 Modules futurs (après P3)

- [ ] **Achats/Contrats** : Lead time fournisseur, écart prix, conformité (CCAP/CCAG)
- [ ] **Stocks/Matériel** : Immobilisations, disponibilité, maintenances
- [ ] **Reporting Direction** : Consolidation multi-bureaux/chantier avec filtres

**Note** : Ces modules seront implémentés dans les phases suivantes.

---

## 📊 Résumé de validation

### ✅ Checklist complète

- [ ] **1. Routing UI** : Navigation fonctionnelle
- [ ] **2. Synthèse** : KPIs Finance visibles
- [ ] **3. KPIs Projets/Demandes** : Listes et compteurs corrects
- [ ] **4. Event-Driven** : Refresh automatique fonctionnel
- [ ] **5. Fallback** : Bascule automatique en cas d'erreur
- [ ] **6. Sécurité ABAC** : Filtrage effectif
- [ ] **7. Rollback** : Procédure testée
- [ ] **8. Observabilité** : À valider en P4
- [ ] **9. Extensions** : À implémenter plus tard

---

## 🚨 Points de vigilance

### 1. Performance

- Les vues matérialisées doivent être rafraîchies régulièrement (worker + CRON)
- Le TTL du registry doit être adapté à la fréquence de refresh

### 2. Données

- Vérifier que les données Finance sont cohérentes (RAT, RAP, RàF, DSO)
- S'assurer que les scopes sont correctement appliqués

### 3. Monitoring

- Surveiller les logs du worker pour détecter les erreurs
- Vérifier que les notifications PostgreSQL sont bien reçues

---

## 📚 Documentation associée

- **Déploiement** : `lib/server/dashboard/DEPLOYMENT_SCRIPTS.md`
- **Worker** : `lib/server/dashboard/workers/WORKER_DEPLOYMENT.md`
- **CRON** : `scripts/CRON_SETUP.md`
- **PR P3** : `lib/server/dashboard/PR_P3_SYNTHESE.md`

---

**Date de validation** : _______________

**Validé par** : _______________

**Notes** : _______________
