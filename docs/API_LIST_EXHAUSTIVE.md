# Liste exhaustive des API — Yessalate Frontend

Document de référence de toutes les routes API utilisées ou exposées par le projet (frontend + `app/api`).

**Convention** : `GET /api/...` = méthode HTTP et chemin. Réponse = forme JSON typique (mock ou contrat).

---

## 1. Dashboard (Command Center / Pilotage)

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/dashboard/stats` | Stats globales, KPIs strip, bureaux, tendances | `{ period, timestamp, kpis, counters, bureaux, trends }` |
| GET | `/api/dashboard/cash-flow-previsions` | Prévisionnel trésorerie (J+30/60/90) | `{ previsions[], days, seuilMinimal }` |
| GET | `/api/dashboard/risks` | Risques (severity, limit) | `{ risks[], stats, timestamp }` |
| GET | `/api/dashboard/actions` | Actions (urgency, status, limit) | `{ actions[], stats, timestamp }` |
| GET | `/api/dashboard/decisions` | Décisions (status, limit) | `{ decisions[], stats, timestamp }` |
| GET | `/api/dashboard/bureaux` | Liste bureaux (sortBy, order) | `{ bureaux[], stats, timestamp }` |
| GET | `/api/dashboard/trends` | Tendances (kpi, months) | Données tendances |
| GET | `/api/dashboard/kpis/:id` | Détail KPI (period) | `{ kpi, timestamp }` |
| GET | `/api/dashboard/[main]/[sub]/[leaf]` | Vue dynamique (loaders registry) | Payload selon main/sub/leaf |
| POST | `/api/dashboard/refresh` | Rafraîchir scope | `{ success, scope, data, timestamp }` |
| POST | `/api/dashboard/export` | Export (format, sections, period) | `{ success, export, message }` |
| GET | `/api/dashboard/filters` | Filtres disponibles | — |
| GET | `/api/dashboard/preferences` | Préférences utilisateur | — |

---

## 2. Authentification / Politique / RBAC

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/me/policy` | Perms + flags + i18n (locale, currency, timezone) | `{ perms[], flags{}, locale, currency, timezone, direction }` |
| GET | `/api/rbac/permissions` | Permissions RBAC | Liste permissions |
| GET | `/api/rbac/admin/roles` | Admin rôles | — |
| GET | `/api/rbac/admin/permissions` | Admin permissions | — |
| GET | `/api/rbac/admin/feature-flags` | Feature flags | — |

---

## 3. Alertes (moteur d’alertes Phase P15)

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/alerts/events` | Liste événements (status, routeKey, severity, limit, offset) | `{ ok, events[], pagination }` |
| GET | `/api/alerts/stats` | Stats alertes (routeKey) | `{ ok, stats: { open_count, ack_count, closed_count, critical_open, warning_open, info_open } }` |
| GET | `/api/alerts/queue/:queue` | File d’alertes par queue | — |
| GET | `/api/alerts/:id` | Détail alerte | — |
| POST | `/api/alerts/notify` | Notification (DashboardAlertProvider) | — |
| POST | `/api/alerts/events/:id/ack` | Accusé réception | — |
| POST | `/api/alerts/events/:id/close` | Fermer | — |
| POST | `/api/alerts/events/:id/snooze` | Snooze | — |
| GET | `/api/alerts/rules` | Règles | — |
| GET | `/api/alerts/critical` | Alertes critiques | — |
| GET | `/api/alerts/stream` | Stream SSE | — |
| GET | `/api/alerts/trends` | Tendances | — |
| GET | `/api/alerts/analytics` | Analytics | — |
| GET | `/api/alerts/blocked` | Blocages | — |
| GET | `/api/alerts/sla` | SLA | — |
| GET | `/api/alerts/search` | Recherche | — |
| GET | `/api/alerts/timeline` | Timeline | — |
| POST | `/api/alerts/bulk` | Actions bulk | — |
| GET | `/api/alerts/export` | Export | — |
| GET | `/api/alerts/audit/*` | Audit | — |

---

## 4. Analytics (BTP / rapports / KPIs)

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/analytics/reports` | Liste rapports | `{ reports[] }` avec `reportId`, `downloadUrl` |
| POST | `/api/analytics/reports` | Créer rapport | `{ reportId, downloadUrl, ... }` |
| GET | `/api/analytics/reports/download` | Téléchargement rapport (?id=) | Fichier ou redirect |
| GET | `/api/analytics/export` | Statut export (?id=) | `{ id, status, downloadUrl, expiresAt }` |
| POST | `/api/analytics/export` | Lancer export (format, type, dateRange, bureaux) | `{ export, message }` (202) |
| GET | `/api/analytics/alerts` | Liste alertes config | — |
| POST | `/api/analytics/alerts` | Créer/éditer alerte | — |
| POST | `/api/analytics/simulate` | Simulation (BTPSimulationModal) | — |
| GET | `/api/analytics/modules/:moduleId/data` | Données module (BTPModuleView) | — |
| GET | `/api/analytics/domains/:domainId/:dataSource` | Données domaine (BTPDomainView) | — |
| GET | `/api/analytics/domains/:domainId/summary` | Résumé domaine | — |
| GET | `/api/analytics/kpis/:id` | Détail KPI | — |
| GET | `/api/analytics/kpis/:id/timeseries` | Série temporelle KPI | — |
| GET | `/api/analytics/kpis/:id/comparison` | Comparaison KPI | — |
| GET | `/api/analytics/kpis/:id/causes` | Causes KPI | — |
| GET | `/api/analytics/kpis/:id/recommendations` | Recommandations KPI | — |
| GET | `/api/analytics/elements/:id` | Détail élément (BTPElementDetailView) | — |
| POST | `/api/analytics/search` | Recherche avancée (BTPAdvancedSearch) | — |
| GET | `/api/analytics/dashboard` | Dashboard analytics | — |
| GET | `/api/analytics/stats` | Stats | — |
| GET | `/api/analytics/trends` | Tendances | — |
| GET | `/api/analytics/performance` | Performance | — |
| GET | `/api/analytics/realtime` | Realtime (SSE/WebSocket) | — |
| GET | `/api/analytics/predictive` | Prédictif | — |
| GET | `/api/analytics/bureaux` | Bureaux | — |
| GET | `/api/analytics/bureaux/performance` | Performance bureaux | — |
| GET | `/api/analytics/submodules/:domainId/:moduleId/:subModuleId/kpis` | KPIs sous-module | — |
| GET | `/api/analytics/submodules/:domainId/:moduleId/:subModuleId/deviations` | Déviation sous-module | — |

---

## 5. Export / Partage

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/export/dashboard` | Export dashboard (format, sections, period) | Fichier ou JSON |
| POST | `/api/share/create` | Créer lien partage (DashboardModals) | `{ token, url, ... }` |

---

## 6. Délégations

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/delegations` | Liste (?queue=, limit=) | — |
| GET | `/api/delegations/:id` | Détail (modal) | — |
| GET | `/api/delegations/:id/full` | Détail complet | — |
| POST | `/api/delegations` | Créer (DelegationCreateWizard) | — |
| POST | `/api/delegations/:id/extend` | Prolonger | — |
| POST | `/api/delegations/:id/suspend` | Suspendre | — |
| POST | `/api/delegations/:id/revoke` | Révoquer | — |
| POST | `/api/delegations/:id/reactivate` | Réactiver | — |
| GET | `/api/delegations/:id/timeline` | Timeline | — |
| GET | `/api/delegations/:id/search` | Recherche dans délégation | — |
| GET | `/api/delegations/:id/actions` | Actions disponibles | — |
| GET | `/api/delegations/:id/audit` | Audit | — |
| GET | `/api/delegations/:id/export` | Export (?format=) | Fichier |
| GET | `/api/delegations/stats` | Stats | — |
| GET | `/api/delegations/notifications` | Notifications | — |
| PUT | `/api/delegations/notifications/:id/read` | Marquer lu | — |
| POST | `/api/delegations/notifications/read-all` | Tout marquer lu | — |
| DELETE | `/api/delegations/notifications/:id` | Supprimer notif | — |
| GET | `/api/delegations/insights` | Insights | — |
| POST | `/api/delegations/simulate` | Simulateur | — |
| GET | `/api/delegations/alerts` | Alertes délégations | — |

---

## 7. Demandes (demands / inbox BMO)

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/demands` | Liste (?queue=) | — |
| GET | `/api/demands/:id` | Détail demande | — |
| POST | `/api/demands/:id/actions` | Exécuter action | — |
| POST | `/api/demands/bulk` | Actions bulk | — |
| GET | `/api/demands/export` | Export (?queue=, format=csv) | Fichier |
| GET | `/api/demands/stats` | Stats (LiveCounters) | — |

---

## 8. Demandes RH

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/demandes-rh/:id` | Détail demande RH | — |
| GET | `/api/rh/demandes` | Liste (?type=depenses|conges) | — |

---

## 9. Calendrier

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/calendar/stats` | Stats calendrier | — |
| GET | `/api/calendar/events` | Liste événements | — |
| GET | `/api/calendar/events/:id` | Détail événement | — |
| GET | `/api/calendar/events/:id/export` | Export événement (?format=) | Fichier |
| GET | `/api/calendar/export` | Export global (?format=ical|csv|pdf|json, month, year) | Fichier |

---

## 10. Validation BC

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/validation-bc/workflow` | Workflow (?type=) | — |
| POST | `/api/validation-bc/workflow` | Déclencher étape workflow | — |
| GET | `/api/validation-bc/reminders` | Rappels | — |
| GET | `/api/validation-bc/insights` | Insights prédictifs | — |
| GET | `/api/validation-bc/delegations` | Délégations (?status=) | — |
| GET | `/api/validation-bc/activity` | Historique activité (?limit=, filter=) | — |
| GET | `/api/validation-bc/documents/:id/full` | Document complet (commenté dans le code) | — |

(+ nombreuses autres sous-routes : alerts, annotations, batch-actions, comments, documents, export, metrics, reports, search, stats, timeline, validators, webhooks, etc.)

---

## 11. Arbitrages

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/arbitrages` | Liste (params) | — |
| GET | `/api/arbitrages/:id` | Détail (ArbitrageViewer) | — |
| POST | `/api/arbitrages/:id/trancher` | Trancher | — |
| POST | `/api/arbitrages/:id/reporter` | Reporter | — |
| POST | `/api/arbitrages/:id/complement` | Demander complément | — |
| GET | `/api/arbitrages/:id/timeline` | Timeline | — |
| GET | `/api/arbitrages/timeline` | Timeline globale | — |
| GET | `/api/arbitrages/stats` | Stats | — |
| GET | `/api/arbitrages/notifications` | Notifications | — |
| PUT | `/api/arbitrages/notifications/:id` | Marquer notif | — |
| POST | `/api/arbitrages/notifications/read-all` | Tout marquer lu | — |
| DELETE | `/api/arbitrages/notifications/:id` | Supprimer notif | — |
| GET | `/api/bureaux/:code` | Détail bureau (BureauViewer) | — |

---

## 12. BMO / Blocages

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/bmo/blocked` | Liste dossiers bloqués | — |
| GET | `/api/bmo/blocked/stats` | Stats (useBlockedStats) | — |
| GET | `/api/bmo/blocked/bureaux` | Bureaux (useBlockedBureaux) | — |
| GET | `/api/bmo/blocked/:id/full` | Détail complet (TODO dans modal) | — |
| PATCH | `/api/bmo/blocked/:id/update` | Mise à jour statut (TODO Kanban) | — |
| POST | `/api/bmo/blocked/:id/comment` | Commentaire (TODO) | — |
| POST | `/api/bmo/blocked/:id/documents/upload` | Upload document (TODO) | — |
| GET | `/api/bmo/blocked/documents/:id/download` | Téléchargement document (TODO) | — |
| GET | `/api/bmo/employees` | Employés (employees-documents-api) | — |
| GET | `/api/bmo/documents` | Documents (employees-documents-api) | — |

---

## 13. Chantiers / Cockpit DG (Phase 5 Production)

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/chantiers` | Liste (?phase=, segment=, limit=) | — |
| GET | `/api/chantiers/health` | Health spheres (useLiveChantiers) | — |
| GET | `/api/chantiers/ecosystem` | Écosystème live (chantiers + ouvriers + quincaillerie) | — |
| POST | `/api/chantiers/:id/paye` | Marquer payé (OrangeMoneyButton) | — |
| GET | `/api/cockpit/chantiers` | Cockpit chantiers (useCockpitChantiers) | — |
| POST | `/api/cockpit/contract` | Contrat (ExecutiveControls) | — |
| POST | `/api/cockpit/broadcast` | Broadcast (ExecutiveControls) | — |

---

## 14. Paiements / Orange Money / Huissier

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| POST | `/api/paiements/orange-money` | Paiement Orange Money | — |
| GET | `/api/payments/orange-money` | Statut / déclenchement (ExecutiveControls) | — |
| POST | `/api/payments/wave` | Wave (ExecutiveControls) | — |
| POST | `/api/huissier/certify` | Certification huissier (ExecutiveControls) | — |

---

## 15. IA / Briefing / Prédictions

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/ai/briefing` | Briefing IA (useCockpitBriefing, useAIBriefing) | — |
| GET | `/api/ai/predictions` | Prédictions (useCockpitPredictions) | — |

---

## 16. Push / Notifications

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/push/vapid-public` | Clé VAPID (usePushConsent) | — |
| POST | `/api/push/subscribe` | S’abonner | — |
| POST | `/api/push/unsubscribe` | Se désabonner | — |

---

## 17. Recherche / Partage / Santé

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/search` | Recherche globale (SearchGlobal, ⌘K) | — |
| GET | `/api/share/:token` | Accès lien partagé | — |
| GET | `/api/health` | Health check | — |
| GET | `/api/reports/dg` | Rapport DG (?format=json|pdf|…) | — |

---

## 18. Gouvernance / Demandes (stats)

| Méthode | Chemin | Usage | Réponse (résumé) |
|---------|--------|--------|------------------|
| GET | `/api/gouvernance/overview` | Vue d’ensemble | — |
| GET | `/api/gouvernance/stats` | Stats | — |
| GET | `/api/gouvernance/tendances` | Tendances | — |
| GET | `/api/demandes/stats` | Stats demandes | — |

---

## Phases 4 et 5 (référence projet)

### Phase 4 (DASHBOARD_QUALITY_RECOVERY_PLAN) — Exécutée avec mock

- **Objectif** : Modals et navigation vers détails (alertes, risques, blocages, budget).
- **Statut** : ✅ Fait — AlertListModal, RiskDetailModal, BlocageDetailModal, BudgetDetailModal branchés.
- **Données mockées** : `/api/alerts/events` et `/api/alerts/stats` retournent des mocks quand la base est vide ou indisponible. **DemandesKpiPage / BudgetKpiPage** : les loaders appellent `/api/dashboard/performance/kpis/demandes` et `/api/dashboard/performance/kpis/budget`, servis par `dashboardReadService` (données repo ou mock KpisBudgetData). HighlightsKpiPage utilise `/api/dashboard/risks` + fallback mock.

### Phase 5 — Exécutée avec mock

- **Plan Qualité (DASHBOARD_QUALITY_RECOVERY_PLAN)** : Types complets (reporting, analytics) — ✅ Fait.
- **Production (PHASE5_PRODUCTION.md)** : Cockpit DG — APIs chantiers avec données mockées :
  - `GET /api/chantiers` : liste depuis `chantiersMock` (src/modules/dashboard/data/chantiersMock.ts).
  - `GET /api/chantiers/health` : health spheres depuis le même mock (top 42 par CA).
  - `GET /api/chantiers/ecosystem` : chantiers + ouvriers + quincailleries mock.
- **Statut** : routes présentes et alimentées en mock ; passage PostgreSQL/WebSocket à faire en production.

---

## Routes à implémenter ou compléter (mock)

| Route | Priorité | Note |
|-------|----------|------|
| `GET /api/analytics/reports/download?id=` | Haute | Téléchargement rapport ; ajoutée en tant que route GET retournant un placeholder ou redirect. |
| Endpoints BMO blocked (comment, upload, download) | Moyenne | TODOs dans le front ; routes existantes sous `/api/bmo/blocked/*`. |
| `/api/documents` (placeholder chantierDocumentsMock) | Basse | Référencé en baseUrl mock. |

---

*Dernière mise à jour : 2026-01-30*
