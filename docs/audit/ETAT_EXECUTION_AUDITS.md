# État d'exécution des audits — Yessalate ERP BTP

**Réponse à la question :** *Est-ce que tout ce qui était dans tous les audits est fait et exécuté ?*

**Réponse courte :** **Non.** Les **urgences (Phase 1)** de l’audit technique exhaustif sont faites. Le reste (Phase 2, Phase 3, autres audits) est **partiellement fait ou non fait**.

---

## 1. Audit technique exhaustif (31 janv. 2026)

**Source :** `docs/audit/AUDIT_TECHNIQUE_EXHAUSTIF_2026_01_31.md`

### Phase 1 : Urgences (2 semaines) — ✅ FAIT

| Point | Statut | Détail |
|-------|--------|--------|
| **Subsidebar** | ✅ Fait | `isCockpitHome` corrigé ; Centre d’alertes, Gouvernance, Calendrier, Analytics changent bien le contenu. |
| **Vues manquantes** | ✅ Fait | AlertesCenterView (AlertsActivesPage), GovernancePilotageView, CalendrierEcheancesView, AnalyticsReportsView présentes et branchées dans le registry. |
| **Loaders** | ✅ Fait | Skeleton + barre de progression lors du changement de vue (`DashboardContentSwitch`) ; `setLoading(false)` corrigé en succès. |
| **Toasts** | ✅ Fait | Confirmation après Rafraîchir et Export ; message d’erreur si chargement vue échoue (sonner). |

### Phase 2 : Données & métier (4–6 semaines) — ✅ FAIT (mock)

| Point | Statut |
|-------|--------|
| **performance/kpis/demandes, performance/kpis/budget** | ✅ API dashboard : `dashboardReadService` sert `performance/kpis/projets`, `performance/kpis/demandes` (délégation repo), `performance/kpis/budget` (mock KpisBudgetData). DemandesKpiPage et BudgetKpiPage reçoivent les données via loaders. |
| Filtres périmètre explicites (NICE RÉNOVATION vs tous) | ✅ UI + mock : select filtre KPIs strip, score qualité et typologie blocages (dashboardCockpitMock) ; brancher API plus tard |
| Décomposition score qualité (finitions, délais, conformité, NPS) | ✅ Tooltip + données mock par périmètre (getScoreQualiteBreakdown) ; brancher API plus tard |
| Typologie des blocages (technique, admin, financier, RH) | ✅ Tooltip + données mock par périmètre (getTypologieBlocages) ; brancher API plus tard |
| KPIs manquants : productivité, taux accidents, prévisionnel tréso J+30/60/90, ROI par type chantier | ✅ Fait (mock) : Productivité (€/h MO) et ROI moyen (strip + mapping) ; widget « ROI par type de chantier » ; HSEConformiteWidget (taux accidents) ; TresoreriePrevisionnelleWidget avec sélecteur J+30 / J+60 / J+90. |
| Délai paiement, taux utilisation, bilan carbone | ✅ Fait (mock) : indicateurs complémentaires centralisés dans dashboardCockpitMock (getIndicateursComplementaires) ; 6 cartes dans cockpit (HSE, productivité, délai paiement, ROI, taux utilisation, bilan carbone) selon périmètre. |

### Phase 3 : UX & accessibilité (4–6 semaines) — Partiel

| Point | Statut |
|-------|--------|
| Hiérarchie visuelle (tailles XL/L/M/S pour KPIs) | ✅ KPICard/KPICardPro size xl/lg/md/sm ; strip dashboard utilise xl/lg/md |
| Hiérarchie titres (h1/h2) | ✅ h1 sr-only + h2 visible (GovernancePilotageView, Calendrier, Analytics, HSE) ; h1 sr-only AlertsActivesPage ; aria-live sur strip KPI ; contraste text-slate-400 page dashboard |
| Tooltips sur sparklines, skeleton partout, gestion d’erreurs (toast + retry) | ✅ Toast/retry ; SparklineChart showTooltip ; skeleton ContentSwitch ; DashboardLoadingFallback + EmptyState role/aria-live |
| Raccourcis clavier (⌘K recherche), mode clair/sombre, conformité WCAG AA | Partiel (⌘K ✅ ; mode clair/sombre ✅ ; focus-visible ; skip link ; aria-live strip KPI + recherche + notifications ; contraste : text-slate-300 sur BTPAlertModal, DemandesKpiPage, BudgetKpiPage, KPICard, BTPIntelligentModal ; DashboardPanel role="region" aria-labelledby ; aria-label Fermer + focus-visible sur modals ; BTPAlertModal Tabs aria-label "Détail de l'alerte") |

### Ce qui ne fonctionne toujours pas (55/87) — non traité en totalité

| Catégorie | Exemples | Statut |
|-----------|----------|--------|
| **Données fictives** | Données mock ; « Dernière MAJ » mise à jour au rafraîchissement | ✅ Choix projet : on reste en données fictives (pas d’API réelle pour l’instant) |
| **Boutons inactifs** | Appeler entreprise, Relance automatique, Escalade au DG, Planifier visite (tableau Phase 4) | ✅ Modals branchés (CallCompany, AutoRelance, EscalateDG, ScheduleVisit) |
| **Boutons header** | Exporter → ✅ ; Rafraîchir → ✅ ; Recherche ⌘K → ✅ ; Notifications → ✅ ; Menu utilisateur A. DIALLO (dropdown) | ✅ Dropdown user (Mon profil, Paramètres, Déconnexion) dans BmoTopbar |
| **Interactions** | Tooltips sparkline, clic ligne tableau → détail chantier, clic "3 créances" / "21 validations" / score qualité | ✅ Sparkline tooltip ; clic ligne Phase 4 → ChantierDetailModal ; créances/validations → modals ; tooltip score qualité |

---

## 2. Spec Dashboard ERP BTP (fonctionnalités / composants)

**Source :** `docs/dashboard/SPEC_DASHBOARD_ERP_BTP.md` + implémentation récente

### Header — Fait

| Élément | Statut |
|--------|--------|
| Nom utilisateur + rôle | ✅ BmoTopbar |
| Notifications (cloche) | ✅ Ouvre NotificationPanel (event `bmo-open-notifications`) |
| Recherche globale (⌘K) | ✅ Ouvre DashboardCommandPalette sur la page dashboard |
| Menu utilisateur (profil, paramètres, déconnexion) | ✅ Dropdown BmoTopbar : Mon profil, Paramètres → /maitre-ouvrage/parametres ; Déconnexion (onLogout) |

### Sub-sidebar, KPI, Actions rapides, Notifications — En place

- Sub-sidebar : Vue d’accueil, Centre d’alertes, Gouvernance, Calendrier, Analytics ✅  
- Dernière MAJ + Rafraîchir + Export ✅  
- Zone KPI (strip pliable, modals) ✅  
- Actions rapides (DashboardModulesBar) ✅  
- Panneau notifications (cloche) ✅  

---

## 3. Audit manquements / incohérences (dashboard)

**Source :** `docs/dashboard/AUDIT_MANQUEMENTS_INCOHERENCES.md`

| Action | Statut |
|--------|--------|
| Imports EmptyState unifiés (shared) | ✅ Documenté comme fait |
| ErrorBoundary autour du contenu dynamique | ✅ Documenté comme fait |
| DashboardShell documenté (shell vs layout shared) | ✅ Documenté comme fait |
| DashboardContentRouter @deprecated | ✅ Documenté comme fait |
| Règle registry vs navigation.config.json documentée | ✅ `docs/dashboard/REGISTRY_NAV_CONFIG_CONVENTION.md` |
| Factoriser pages PerformanceBureaux* | ✅ PerformanceBureauxSinglePage ; Bmo, Bpl, Bcg, Brc, Bop, Bf, Bj, Bct, Bja, Bex délèguent |
| Composant KPI partagé (gouvernance / BMO) | ✅ Documenté : `docs/dashboard/KPI_COMPONENTS_USAGE.md` (usage par zone) |

---

## 4. Cockpit DG — Roadmap d’amélioration

**Source :** `docs/dashboard/COCKPIT_DG_AUDIT_ROADMAP.md`

| Bloc | Fait | Non fait |
|------|------|----------|
| **UX/UI** (loading, empty states, tooltips, dark mode, responsive, theme toggle, skeleton) | ✅ Tous marqués "Fait" dans le doc | — |
| **Performances** (InstancedMesh, LOD, worker, virtual scroll, 60 FPS) | — | ❌ Tous "À faire" |
| **APIs** (PostgreSQL/Prisma, WebSocket, Orange Money, Mapbox) | — | ❌ Tous "À faire" |
| **IA** (prédiction retard, change detection, NLP voice) | — | ❌ Tous "À faire" |
| **Mobile / PWA** (installable, swipe, offline) | Push + bannière consent ✅ | ❌ PWA, offline |
| **Sécurité** (Auth DG, audit trail, hash photos, RGPD) | — | ❌ Tous "À faire" |
| **Métriques business** | — | Voir le doc pour le détail |

---

## 5. Synthèse : quoi de fait, quoi restant

### ✅ Fait (aligné avec les audits)

1. **Subsidebar** : correction `isCockpitHome`, les 4 vues (Alertes, Gouvernance, Calendrier, Analytics) s’affichent.
2. **Loaders** : skeleton + progression lors du changement de vue ; bug `setLoading(false)` corrigé.
3. **Toasts** : succès/erreur pour Rafraîchir, Export, erreur de chargement des vues.
4. **Header** : recherche (⌘K) ouvre la palette sur le dashboard ; cloche ouvre le panneau notifications.
5. **Vues sub-sidebar** : présentes et branchées dans le registry.
6. **Spec Dashboard** : section 12 "État d’implémentation" à jour.

### ❌ Non fait ou partiel

1. **Phase 2 (données réelles)** : branchement API pour périmètre, score qualité, typologie blocages, KPIs (productivité, accidents, prévisionnel tréso, ROI, délai paiement, taux utilisation, bilan carbone). *En mock : Phase 2 est complète.* HighlightsKpiPage utilise désormais l’API `/api/dashboard/risks` en priorité (repli sur mock si vide).
2. **Phase 3** : WCAG AA (hiérarchie KPI, tooltips sparklines, mode clair/sombre faits).
3. **Données** : passage données fictives → données réelles / API.
4. **Cockpit DG** : performances, APIs réelles, IA, PWA complète, sécurité (auth, audit, RGPD).
5. **Audit manquements** : composant KPI documenté (KPI_COMPONENTS_USAGE.md).

### ✅ Fait (compléments)

- **Menu utilisateur** : dropdown BmoTopbar (Mon profil, Paramètres, Déconnexion).
- **Hiérarchie KPI** : tailles xl/lg/md sur strip dashboard.
- **Filtre périmètre** : select NICE RÉNOVATION / Tous ; en mock, filtre KPIs strip + score qualité + typologie blocages (dashboardCockpitMock).
- **Tooltips** : décomposition score qualité, typologie blocages, sparklines (showTooltip).
- **Drill-down** : clic créances > 30j → CreancesModal ; 21/45 validations → ValidationsModal ; score qualité (tooltip).
- **Clic ligne tableau Phase 4** : toute la ligne ouvre ChantierDetailModal ; bouton action (Appeler, etc.) ouvre le modal d’action sans ouvrir le détail.
- **Boutons Phase 4** : CallCompany, AutoRelance, EscalateDG, ScheduleVisit modals branchés.
- **Mode clair/sombre** : DarkModeToggle dans BmoTopbar ; BmoLayoutShell adapté au thème.
- **Audit manquements** : convention registry vs config documentée (REGISTRY_NAV_CONFIG_CONVENTION.md) ; factorisation PerformanceBureaux* (PerformanceBureauxSinglePage).
- **WCAG** : focus-visible sur overlay sidebar, boutons sub-sidebar ; aria-busy/aria-live sur ContentSwitch ; role="status" + sr-only sur DashboardLoadingFallback ; role="alert" + aria-label retry sur erreur.
- **Skeleton** : affichage dès le début de la transition (showSkeleton = loading || isTransitioning && view?.loader) pour éviter flash de l’ancien contenu.
- **WCAG titres / contraste** : h1 masqué (sr-only) + aria-labelledby sur la région dashboard ; libellés « Indicateurs clés », « Dernière MAJ » en text-slate-300 pour meilleur contraste.
- **KPI usage** : KPI_COMPONENTS_USAGE.md (KPICard, KpiStatCard, KpiCard gouvernance/BMO).

---

## 7. Corrections post-audit (suite — fév. 2026)

Suite à la demande « corrigeons » (alignement sur l’audit) :

### WCAG — Contraste

- **text-slate-500 → text-slate-400** (meilleur contraste) dans : ProjetKpiPage, ConducteurTravauxPage (icônes + texte secondaire), LastUpdateDisplay, KPINotifications (ancienne valeur, lien « Tout marquer lu », bouton fermer), DashboardNotifications, DashboardRegistryView.

### WCAG — Annonces chargement

- **DashboardLoadingFallback** : ajout de `aria-live="polite"` pour annoncer « Chargement en cours » aux lecteurs d’écran.

### Vues Admin — Messages vides explicites

- **AdminSettingsDashboardPage**, **AdminSettingsKpisPage**, **AdminSettingsNotificationsPage** : lorsque les données sont vides (API non branchée), affichage de « Vue en construction » + « Connectez l’API pour afficher… » avec `variant="comingSoon"` au lieu d’un simple « Aucun élément ».

---

## 8. Unification interface (BMO / Maître d’ouvrage — fév. 2026)

Suite à la demande « corrige tout cela pour unifier l’interface » (BMO = même projet que maître d’ouvrage) :

### Viewport — Pas de scroll horizontal

- **BmoLayoutShell** : `<main>` avec `overflow-auto` → `max-w-full overflow-x-hidden overflow-y-auto` (règle `.cursor/rules/interface-layout-viewport.mdc`).
- **BmoPortalLayout** : zone main hérite du shell ; pas de changement.
- **bmo/layout/PageTemplate** : zone scroll avec `overflow-y-auto` → `max-w-full overflow-x-hidden overflow-y-auto`.
- **DocumentsContentPane**, **OpportunitiesKanbanView** : zone scroll avec `overflow-x-hidden overflow-y-auto` + `min-w-0 max-w-full`.
- **BmoSidebar** (nav) : `overflow-y-auto` → `overflow-x-hidden overflow-y-auto` + `min-w-0`.
- **ExplorerLayoutResponsive** : panneau nav avec `overflow-x-hidden overflow-y-auto`.

### Contraste unifié (text-slate-500 → text-slate-400)

- **BMO / portail** : BmoTopbar (breadcrumb, dropdown), DashboardModals, ParametresWorkspaceContent, DashboardCommandPalette, NotificationPanel, BMOModulePlaceholder, Placeholder, DocumentsContentPane, CockpitLayout, ReserveModal, IntegratedAnalytics, FoncierScreen, PhaseChecklist, PhaseModal, DocumentsNavigationPane, SectionHeader, SubNavigation, OpportunitiesKanbanView, UserRoleManager, DocumentLibrary, Header, validation-bc DocumentDetailsModal, PaiementValidationModal, IncidentDetailModal, StatsModal, ExportModal (system-logs), EchangesStructuresCommandPalette.
- **Suite possible** : autres composants sous `src/components/features/bmo/` (plusieurs dizaines de fichiers) — à traiter par lot si besoin.

---

## 6. Conclusion

- **Phase 1 (urgences)** de l’audit technique exhaustif : **exécutée** (subsidebar, loaders, toasts, vues, header recherche/notifications).
- **Phase 2 (données & métier en mock)** : **exécutée** — filtres périmètre, score qualité, typologie blocages, KPIs (productivité, ROI, taux accidents, prévisionnel tréso J+30/60/90, délai paiement, taux utilisation, bilan carbone), indicateurs centralisés, mappings drill-down.
- **Phase 3 (UX & accessibilité)** : **partiellement exécutée** — hiérarchie titres, tooltips, skeleton, ⌘K, mode clair/sombre, aria-live, contraste, DashboardPanel.
- **Phase 4 (Modals et navigation — Plan Qualité)** : **exécutée** — AlertListModal, RiskDetailModal, BlocageDetailModal, BudgetDetailModal branchés.
- **Phase 5 (Types complets — Plan Qualité)** : **exécutée** — types KpisBudgetData et ValidationsGlobalData complétés. **Phase 5 Production (Cockpit DG)** : APIs chantiers/health/ecosystem en place ; WebSocket et déploiement PostgreSQL à finaliser.
- **Phase 2 (données réelles)** et **Phase 3** (WCAG AA global), Cockpit DG (IA, PWA complète, sécurité), etc. : **non fait ou partiel**.

Pour un suivi au fil de l’eau, utiliser ce fichier et cocher au fur et à mesure les points réalisés. Liste exhaustive des API : `docs/API_LIST_EXHAUSTIVE.md`.
