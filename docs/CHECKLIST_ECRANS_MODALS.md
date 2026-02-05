# Checklist — Écrans et modals (tests manuels)

À utiliser après `npm run dev` (port 4001). Parcourir chaque écran et ouvrir les modals associés.

---

## 1. Shell et layout

| Élément | URL / action | Vérification |
|--------|---------------|---------------|
| Maître d'ouvrage | `/maitre-ouvrage` | Redirige vers dashboard ou page d'accueil |
| Dashboard | `/maitre-ouvrage/dashboard` | Shell (sidebar + topbar + contenu), pas d'erreur console |
| Sidebar repliée | Clic chevron / bouton menu | Passe en mode icônes, chevron en bas |
| Topbar | Partout | User, recherche, notifications, fil d'Ariane |
| Skip link | Tab au chargement | "Aller au contenu" visible au focus |

---

## 2. Écrans principaux (maitre-ouvrage)

| Module | URL | Vérification |
|--------|-----|---------------|
| Alertes | `/maitre-ouvrage/alerts` | Liste + détail, pas de "displayName undefined" |
| Demandes | `/maitre-ouvrage/demandes` | Liste, filtres, détail |
| Gouvernance | `/maitre-ouvrage/governance` | Navigation 3 niveaux, pages synthèse |
| Validation BC | `/maitre-ouvrage/validation-bc` | Liste documents, filtres, détail |
| Calendrier | `/maitre-ouvrage/calendrier` | Grille / jalons, vues |
| Blocked | `/maitre-ouvrage/blocked` | Vues (inbox, kanban, etc.) |
| Messages | `/maitre-ouvrage/messages` | OutlookLikeLayout (sidebar + liste + détail) |
| Chantiers | `/maitre-ouvrage/chantiers` | Liste, cockpit si applicable |
| Délégations | `/maitre-ouvrage/delegations` | Liste, création, détail |
| Validation Paiements | `/maitre-ouvrage/validation-paiements` | Liste, modals |
| Autres modules | Paramètres, Employés, Finances, etc. | Page charge sans crash |

---

## 3. Modals à ouvrir (échantillon)

| Contexte | Action | Vérification |
|----------|--------|---------------|
| Alertes | Assigner une alerte | AssignModal : liste users, pas de "undefined" |
| Alertes | Détail alerte | Modal détail, fermeture Escape |
| Demandes | Détail demande | DemandeDetailModal |
| Dashboard | Détail chantier / KPI | ChantierDetailModal, KPIDrillDownModal |
| Validation BC | Détail document | DocumentDetailsModal, ValidationModal |
| Blocked | Détail dossier / résolution | BlockedDetailModal, BlockedResolutionModal |
| Topbar | Menu user | Dropdown : nom, Déconnexion |
| Topbar | Notifications | Panneau notifications (Escape ferme) |
| Recherche | Cmd/Ctrl+K | SearchGlobal / command palette |

---

## 4. Tests automatisés (Jest) — état

- **62 suites, 559 tests** : tous passent (dernière exécution).
- Couverts par les tests unitaires / composants :
  - **Layout** : BmoLayoutShell, BmoPortalLayout
  - **BMO** : FilterBar, DetailPanel, ItemList, ModuleSubSidebar, QuickActionsBar, SelectionManager, AlertListRow, OutlookLikeLayout
  - **Alertes** : AlertsPage, useAlerteMutations
  - **UI** : Error boundaries, Loading (skeletons)
  - **Hooks** : useGovernanceRACI, useGovernanceFilters

## 5. E2E Playwright

- Les specs E2E couvrent : dashboard (home, navigation, topbar), alertes, demandes.
- Pour les lancer : `npm i @playwright/test` puis `npm run test:e2e` (le serveur dev peut être réutilisé si déjà lancé).

---

*Dernière mise à jour : checklist créée après migration cn et correction GovernanceSubNavigation.*
