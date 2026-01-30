# Plan de navigation BMO — Sitemap

Arbre de navigation du portail BMO Maître d'Ouvrage : **PILOTAGE / EXÉCUTION / SUPPORT**, hiérarchie global → détail.

**Source unique (single source of truth)** : `src/lib/navigation/bmoSitemap.json`. Le front (sidebar, PageTemplate, subnav) et la doc produit dérivent de ce JSON. La liste des modules pour la sidebar est générée dans `bmoModules.ts` à partir du sitemap.

---

## Niveau 0 — Shell BMO

| Route | Description |
|-------|-------------|
| `/` | Landing / choix d'espace |
| `/maitre-ouvrage/*` | Espace BMO Maître d'Ouvrage (topbar + sidebar) |

**Shell** : `BmoPortalLayout` (topbar : centre d'activités, profil, thème ; sidebar : modules issus de `bmoModules`).

---

## Niveau 1 — Modules (sidebar)

Config : dérivée de `src/lib/navigation/bmoSitemap.json` dans `bmoModules.ts`. Ordre = PILOTAGE → EXÉCUTION → SUPPORT.

### PILOTAGE

| Route | Module | Phase |
|-------|--------|-------|
| `/maitre-ouvrage/cockpit` | Cockpit DG | — |
| `/maitre-ouvrage/alerts` | Alertes & Incidents | — |
| `/maitre-ouvrage/governance` | Gouvernance & Arbitrage | — |
| `/maitre-ouvrage/performance` | Performance & SLA | — |
| `/maitre-ouvrage/opportunities` | Opportunités & Programmes | 0–2 |

### EXÉCUTION

| Route | Module | Phase |
|-------|--------|-------|
| `/maitre-ouvrage/chantiers` | Chantiers & Programmes | — |
| `/maitre-ouvrage/conception` | Études & Conception | 3 |
| `/maitre-ouvrage/planning` | Planning & Ordonnancement | — |
| `/maitre-ouvrage/execution` | Suivi Exécution Chantier | 6–8 |
| `/maitre-ouvrage/quality` | Qualité & Réserves | 8–9 |
| `/maitre-ouvrage/receptions` | Livraisons & Réceptions | 9 |
| `/maitre-ouvrage/engagements` | Engagements & Finances | — |

### SUPPORT

| Route | Module | Phase |
|-------|--------|-------|
| `/maitre-ouvrage/foncier` | Foncier & Diagnostics | 1 |
| `/maitre-ouvrage/achats` | Achats & Appels d'offres | 5 |
| `/maitre-ouvrage/fournisseurs` | Fournisseurs & Entreprises | — |
| `/maitre-ouvrage/conformite` | Conformité & Autorisations | 4 |
| `/maitre-ouvrage/maintenance` | Maintenance & Garanties | 10 |
| `/maitre-ouvrage/documents` | Documents & Contrats | — |
| `/maitre-ouvrage/support` | Aide & Support | — |
| `/maitre-ouvrage/admin` | Admin & Référentiels | — |

---

## Niveau 2 — Sous-pages par module (exemples)

- **Opportunités** : `/opportunities` (liste + pipeline) ; fiche → modal `OpportunityDetailModal` (ou `/opportunities/[id]`).
- **Conception** : `/conception` (liste ESQ/APS/APD) ; fiche → modal `DesignModal`.
- **Conformité** : `/conformite` (tableau permis/DEEC/assurances) ; fiche → modal `ConformiteModal`.
- **Achats** : `/achats` (liste AO/lots) ; fiche → modal `TenderModal`.
- **Exécution** : `/execution` (liste chantiers + DPR) ; `/execution/[chantierId]` (dashboard chantier) ; `/execution/[chantierId]/journal` (rapports journaliers).
- **Qualité** : `/quality` (tableau réserves) ; `/quality/[chantierId]` (réserves d’un chantier).
- **Réceptions** : `/receptions` (liste chantiers en réception, statut GPA/PV).
- **Maintenance** : `/maintenance` (bâtiments livrés) ; `/maintenance/[batimentId]` (planning + interventions).

Fiches détail : modals (SPA) ou routes `[id]` selon choix produit.

---

## Fil conducteur (liens principaux phases 0 → 10)

| Étape | Action | Cible |
|-------|--------|--------|
| Opportunité validée (Gate 2) | « Créer projet » | `/chantiers/[id]` + `/conception/[id]` |
| Conception APD gelée (Gate 3) | « Préparer DCE » | `/achats?projet=...` |
| Gate 4 OK (Permis & Assurances) | « Lancer consultation » | AO actif dans `/achats` |
| AO attribué | « Créer chantier d'exécution » | `/execution/[chantierId]` |
| Chantiers en finitions | « Préparer réception » | `/receptions/[chantierId]` + `/quality/[chantierId]` |
| Réception définitive + fin GPA | « Basculer en maintenance » | `/maintenance/[batimentId]` |

Référence fil conducteur : `src/lib/navigation/bmoFilConducteur.ts` et `docs/bmo/FIL_CONDUCTEUR_MODULES_BMO.md`.

---

## Implémentation

- **Layout** : une seule `BmoPortalLayout` pour `/maitre-ouvrage/*` (topbar + sidebar).
- **Pages** : `PageTemplate` pour toutes les pages niveau 1/2 (breadcrumbs + header + contenu).
- **Sidebar** : lit `bmoModules` (généré depuis `bmoSitemap.json`) ; regroupement PILOTAGE / EXÉCUTION / SUPPORT.
- **Fiches [id]** : modals (DesignModal, TenderModal, ReserveModal, etc.) ou routes dynamiques selon besoin.
- **Sous-pages** : `getModuleChildren(moduleId)` (depuis `@/lib/navigation`) retourne les `children` du sitemap pour subnav / breadcrumbs.

## Fichier JSON (single source of truth)

- **Fichier** : `src/lib/navigation/bmoSitemap.json`
- **Structure** : `{ app, area, groups[] }` ; chaque groupe a `id`, `label`, `modules[]` ; chaque module a `id`, `label`, `path`, `phaseRange`, optionnel `children[]`.
- **Exports** : `bmoSitemap`, `getModuleChildren`, types `BmoSitemap`, `BmoSitemapGroup`, `BmoSitemapModule`, `BmoSitemapChild` dans `@/lib/navigation`.
