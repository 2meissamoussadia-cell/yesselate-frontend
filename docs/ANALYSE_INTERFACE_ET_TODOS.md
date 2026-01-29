# Analyse globale de l’interface et TODOs à exécuter

Document généré à partir d’une analyse du code (TODO/FIXME, vues squelettes, APIs non branchées, checklists existantes).

---

## 1. Dashboard — Vues squelettes (à compléter)

Ces pages ont **structure + KPIs vides + "TODO: Charger depuis l'API"** et **"TODO: Implémenter la liste"**. À brancher sur des APIs ou des données réelles.

| Module | Fichier | Manque |
|--------|---------|--------|
| **Admin** | AdminLogsActivitePage | Description, API, liste |
| | AdminLogsSystemePage | Idem |
| | AdminPermissionsAccesPage | Idem |
| | AdminPermissionsRolesPage | Idem |
| | AdminUsersListePage | Idem |
| | AdminUsersPermissionsPage | Idem |
| | AdminSettingsDashboardPage | Idem |
| | AdminSettingsKpisPage | Idem |
| | AdminSettingsNotificationsPage | Idem |
| **Performance > Bureaux** | PerformanceBureauxAllPage | Description, API, liste |
| | PerformanceBureauxBmoPage, BfPage, BjPage, BctPage, BopPage, BcgPage, BjaPage, BrcPage, BplPage, BexPage | Idem (une page par bureau) |
| | PerformanceBureauxComparaisonPage | Idem |
| **Performance** | MaterielOverviewPage | API, liste/tableau matériel |

**Action recommandée :**  
- Soit brancher une API commune (ex. `/api/dashboard/admin/logs`, `/api/dashboard/performance/bureaux/[code]`) et adapter chaque page.  
- Soit remplacer par un composant générique "Vue en construction" avec lien vers la spec, le temps d’avoir les APIs.

---

## 2. BMO / Workspace — APIs et modales à finaliser

| Composant | TODO repéré |
|-----------|--------------|
| PaiementDetailsModal | Remplacer par API `/paiements/[id]/full` |
| BlockedKanbanView | API réelle liste, PATCH `/api/bmo/blocked/[id]/update` |
| BlockedResolutionModal | API selon type de résolution |
| BlockedDossierDetailsModal | API full, POST comment, upload, GET download, toggle watchlist, export PDF/Excel |
| DemandView | Gestion explicite "id manquant" (message + redirection) |
| LogsModals | API réelle, graphiques, export réel |
| StatistiquesModals, SinistresModals, ReclamationsModals | Idem (API, détails, export) |
| SystemLogsModals | Créer ExportModal, IntegrityScanModal, IncidentDetailModal, StatsModal, SettingsModal, ShortcutsModal (actuellement `return null`) |
| DashboardModals | Export JSON côté client si besoin |
| DecisionsView | Logique "planifiées" |
| ActionsView | Logique d’assignation |
| MissionsContentRouter | Migrer vers missionsCommandCenterStore (note archi) |
| IAModuleDetailModal | Implémenter export |

---

## 3. Auth, I18n, Sécurité

| Fichier | TODO |
|---------|------|
| AuthContext | Remplacer par appels API réels (login, logout, refresh), permission manquante → message/redirect cohérent |
| I18nProviderWrapper | Récupérer `x-tenant-id` et `x-user-id` depuis le contexte auth |
| rateLimiter (middleware) | Extraire user ID depuis session/JWT |

---

## 4. API Routes — Stubs à implémenter

Beaucoup de routes renvoient du mock ou ont des blocs `// TODO: ...` (DB, permissions, notifications). Résumé par domaine.

- **validation-bc** : documents (create, update, [id], comments, annotations), delegations, alerts, anomalies resolve, reminders — DB, session, notifications.
- **paiements** : create, [id], update, schedule — vérifs fournisseur/budget/RIB, DB, timeline, notifications.
- **bmo/blocked** : route, [id], [id]/full, assign, arbitrate, substitute, sla — DB, permissions, timeline, notifications.
- **gouvernance** : stats, overview, tendances — remplacer par vrai backend/BDD.
- **calendar** : stats, sla-alerts, export — idem.
- **analytics** : modules, domains, submodules, kpis, elements — appels BDD réels.
- **delegations** : bulk-action, notifications read-all — logique métier + userId session.
- **projects/stats** : appel BDD réel.
- **bmo/blocked/export** : génération Excel/PDF/CSV.
- **arbitrages** : export réel, validation/création réelle.
- **security/csp-report** : stockage DB + seuils alertes (P15).

---

## 5. Portals Maître d’ouvrage — Foncionalités manquantes

| Page | TODO |
|------|------|
| echanges-structures | Créer EchangesStructuresCommandPalette |
| governance/layout | Implémenter command palette |
| employes | Édition, suppression, assignation, évaluation, marquage SPOF, archivage (par action) |
| missions | Démarrage / annulation batch |
| analytics | Appel API export, génération rapport |
| organigramme | Suppression batch, suppression unitaire |
| ia | Actions batch, chiffrement/Web Crypto si besoin |
| demandes | newToday, satisfactionScore depuis API |
| demandes-rh | Navigation précédent/suivant |
| recouvrements | Appliquer filtres au contenu |
| validation-contrats | Appliquer filtres au contenu |
| arbitrages-vivants | Refresh réel des données |
| conferences | Suppression (élément) |
| validation-bc (page) | Navigation vers route précédente |

---

## 6. Cockpit DG V5 (checklist existante)

D’après `docs/dashboard/V5_ULTIMATE_CHECKLIST.md` :

- **À faire :** 120 FPS cible, Web Workers (analytics partiellement fait), IndexedDB cache offline, intégrations backend (Orange Money, Wave, Huissier, WebRTC, Broadcast), RBAC cockpit, rate limiting, audit log, responsive/PWA/push/offline, GPT-4 briefing, ML/anomaly detection.
- **Déjà fait :** FPS/qualité adaptative, 12 boutons 1-clic, commandes vocales, API chantiers + fallback, Phase 6 (Photos GPS, Plan AR, Pointage, Drone en mock).

---

## 7. Cohérence UI / Design

- **Design tokens** : `dashboardDesignTokens` (couleurs, espacements) utilisés par le dashboard et le cockpit ; à réutiliser partout pour cohérence.
- **EmptyState / ErrorBoundary** : présents côté dashboard ; à généraliser aux vues BMO/portals où c’est pertinent.
- **i18n** : navigation labels "à faire au niveau composant" (navigationLabels.ts) ; traductions à compléter (fr-FR, en-GB, ar-MA) pour les nouvelles vues.

---

## 8. Synthèse des priorités

| Priorité | Domaine | Action |
|----------|---------|--------|
| Haute | Admin + Performance Bureaux (dashboard) | Décider : API réelle ou "Vue en construction" + spec |
| Haute | Blocked (BMO) | Brancher API full, comment, upload, download, export |
| Haute | Paiements | API détail / full + cohérence avec validation BC |
| Moyenne | Auth | Brancher login/logout/refresh réels + tenant/user pour i18n et rate limit |
| Moyenne | Validation BC | Implémenter create/update/comments/annotations en DB + workflow |
| Moyenne | System Logs | Créer les 6 modales (Export, IntegrityScan, Incident, Stats, Settings, Shortcuts) |
| Basse | Cockpit V5 | Backend Orange Money / Wave, RBAC, PWA, ML (selon roadmap) |
| Basse | Portals (employes, missions, analytics, etc.) | Filtres, batch, export, navigation (au fil de l’eau) |

---

## 9. Fichiers de référence

- Checklist Cockpit V5 : `docs/dashboard/V5_ULTIMATE_CHECKLIST.md`
- Phases P7/P8 : `PHASES_P7_P8_STATUS.md`
- Cockpit V2 roadmap : `src/modules/dashboard/cockpit-v2/README_V2.md`
