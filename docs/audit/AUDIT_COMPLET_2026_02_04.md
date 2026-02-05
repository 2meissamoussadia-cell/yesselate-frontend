# Audit complet — Yesselate Frontend

**Date :** 4 février 2026  
**Périmètre :** codebase complète (portail maître d’ouvrage, BMO, cockpit DG, ERP BTP).

---

## 1. Synthèse exécutive

| Domaine | État | Priorité |
|--------|------|----------|
| **Sécurité (npm)** | ✅ 0 vulnérabilités (jspdf@4.1, next@16.1.6, npm audit fix) | — |
| **TypeScript** | ~1 023 erreurs TSC ; `ignoreBuildErrors: true` en build | Haute |
| **Tests** | 20 fichiers unitaires ; couverture partielle | Moyenne |
| **Lint** | ESLint configuré ; exécution lente sur le repo | Moyenne |
| **CI/CD** | ✅ Lint + `npm audit --audit-level=high` bloquants ; typecheck \|\| true | — |
| **Architecture** | 189 doublons signalés (audit BMO 03/02) ; types partagés OK | Moyenne |

**Verdict :** Vulnérabilités npm et CI (lint/audit) corrigées. Reste : réduction des erreurs TSC et désactivation de `ignoreBuildErrors` pour une mise en production robuste.

---

## 2. Sécurité

### 2.1 Vulnérabilités npm (`npm audit`)

**État actuel :** 0 vulnérabilités (corrigé le 4 février 2026).

| Package | Sévérité | Problème | Statut |
|---------|----------|----------|--------|
| **jspdf** ≤4.0.0 | **Critique** | LFI/Path Traversal, injection PDF, DoS BMP, XMP metadata, race addJS | ✅ jspdf@4.1.0 |
| **next** 15.6–16.1.4 | **Haute** | DoS Image Optimizer `remotePatterns`, PPR Resume, RSC deserialization | ✅ next@16.1.6 |
| **lodash** 4.0.0–4.17.21 | Modérée | Prototype pollution `_.unset` / `_.omit` | ✅ npm audit fix |

- **Recommandation :**  
  - Corriger **jspdf** en priorité (mise à jour majeure + tests régression PDF).  
  - Évaluer la montée **next** en version mineure/majeure et ajuster `remotePatterns` / config PPR si besoin.  
  - Appliquer `npm audit fix` pour lodash.

### 2.2 Pipelines et bonnes pratiques

- **Headers de sécurité** (`next.config.ts`) : HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection — OK.
- **Workflow Security** (`.github/workflows/security.yml`) :  
  Gitleaks, TruffleHog, SAST (ESLint security, npm audit, Snyk), SBOM (CycloneDX, Syft), signature Cosign, policy Conftest.  
  Les étapes utilisent `|| true` / `continue-on-error: true` : les échecs ne bloquent pas.
- **Recommandation :** Rendre bloquants au moins : scan secrets (Gitleaks/TruffleHog) et `npm audit --audit-level=high` (après correction des vulnérabilités).

---

## 3. TypeScript

### 3.1 Configuration

- **Build Next :** `next.config.ts` → `typescript.ignoreBuildErrors: true`.  
  Le build ne bloque pas sur les erreurs de types.
- **Fichier d’erreurs :** `tsc-errors.txt` (export TSC) : **~1 023 erreurs**.

### 3.2 Familles d’erreurs (échantillon)

1. **`string` assigné à `never`** (très fréquent)  
   - Fichiers : nombreux composants BMO `command-center` (sidebars, KPI bars, content routers, modals, filters).  
   - Cause probable : types de vue/onglet trop stricts (union discriminée ou `Record` mal typé).  
   - Ex. : `DashboardSubNavigation.tsx` — propriété `administration` absente du type `Partial<Record<DashboardMainCategory, SubNavItem[]>>`.

2. **Module introuvable**  
   - `EventDetailModal.tsx` : `../calendrier/types` — chemin ou fichier manquant.

3. **Props incompatibles (calendrier)**  
   - `EventDetailModal` : `headerBadge`, `GenericDetailModalProps`.  
   - `CalendarCommandPalette` : `hideHeader`.  
   - `CalendarStatsModal` : `size`.  
   - Badge : `"secondary"` non assignable au type attendu (ex. Fluent).

4. **Implicite `any` / indexation**  
   - `EventDetailModal` : paramètre `assignee` ; `CalendarWorkspaceContent` : indexation d’objets typés.

### 3.3 Recommandations

- Ne pas garder `ignoreBuildErrors: true` à long terme.  
- Plan de résolution :  
  1) Corriger les types des vues/onglets BMO (DashboardMainCategory, SubNavItem, types des routers).  
  2) Créer ou corriger le module `calendrier/types` et aligner les props des modales calendrier.  
  3) Remplacer les `any` par des types explicites et resserrer les indexations.  
- Réactiver le type-check en CI en mode bloquant une fois le nombre d’erreurs ramené sous un seuil acceptable (ex. 0 pour `main`).

---

## 4. Tests

### 4.1 Couverture actuelle

- **Fichiers de tests (Jest)** : 20 fichiers dans `__tests__/` (accessibility, bmo, components/bmo, hooks, layouts, modules/alerts, ui).
- **E2E** : Playwright — `e2e/` (alerts, dashboard, demandes).
- **Config** : `jest.config.js` — coverage sur `src/hooks`, `src/components/features/bmo/governance`, `src/domain` ; nombreux `testPathIgnorePatterns` (mocks, e2e, suites en attente).

### 4.2 Points faibles

- Peu de tests unitaires par rapport à la taille de `src/` (nombreux composants BMO sans tests dédiés).
- Suites désactivées ou ignorées : governanceHelpers, TrendAnalysisService, VirtualizedList, useGouvernanceDataWithDomain, useGovernanceFilters, hooks, etc.
- **Recommandation :** Réactiver progressivement les suites ignorées et ajouter des tests pour les chemins critiques (auth, données sensibles, command-center, calendrier).

---

## 5. Lint

- **Config :** `eslint.config.mjs` (Next.js core-web-vitals + TypeScript).  
- Règles dégradées en `warn` : `@typescript-eslint/no-explicit-any`, `react/no-unescaped-entities`, règles React compiler / hooks (purity, set-state-in-effect, etc.), `prefer-const`.  
- **Pratique observée :** `npm run lint` peut être très long (timeout 60 s dans l’audit).  
- **Recommandation :** Lint incrémental ou ciblé (ex. par package/workspace) ; puis passer progressivement les warnings en erreurs sur les répertoires déjà nettoyés.

---

## 6. CI/CD

- **Fichier :** `.github/workflows/ci.yml`.  
- **Jobs :** lint-and-typecheck → test (Jest + coverage, Codecov) → build.  
- **Problème :** `Run ESLint` et `Type check` exécutés avec `|| true` : les échecs ne font pas échouer le job.  
- **Recommandation :**  
  - Retirer `|| true` une fois lint et TSC stabilisés.  
  - Aligner la version de Node (ex. 20.x) et le gestionnaire de paquets (npm vs pnpm) entre CI et README/contributors.

---

## 7. Architecture et dette

### 7.1 Types partagés

- **`lib/types/index.ts`** : fichier de compatibilité ; réexporte `../../src/lib/types/index`.  
- Types réels dans `src/lib/types/` (common, bmo, api-error, index) — cohérent.

### 7.2 Doublons (rapport BMO 03/02/2026)

- **189 paires** de doublons ; **0 recommandation critique** dans le rapport.  
- Exemples : `*FormUtils` (tender, design, reserve, reception, chantier, opportunity), `FilterBar`, `ErrorBoundary`, `LoadingStates`, `Toast*`, `BatchActionsBar`, `ActionsMenu`, vues Alert/Arbitrages, etc.  
- **Recommandation :** Factoriser par étapes (ex. composants communs BMO, puis FormUtils, puis command-center) pour réduire la duplication et faciliter les corrections de types.

### 7.3 Fichiers supprimés (git status)

- `lib/data/clientsMockData.ts`, `lib/utils/verifyHash.ts` — s’assurer qu’aucun import orphelin ne reste dans le projet.

---

## 8. Références aux audits existants

- **Plan d’audit :** `docs/audit/PLAN_AUDIT_LOGICIEL.md`.  
- **Audit technique 31/01/2026 :** `docs/audit/AUDIT_TECHNIQUE_EXHAUSTIF_2026_01_31.md` (score 48/100, non production-ready).  
- **État d’exécution :** `docs/audit/ETAT_EXECUTION_AUDITS.md` (Phase 1 faite, Phase 2/3 partielles, Cockpit DG roadmap).  
- **Rapport BMO :** `reports/audit-bmo-2026-02-03T17-29-50.md` (1395 composants, 189 doublons).

---

## 9. Plan d’action priorisé

| Priorité | Action | Responsable | Statut |
|----------|--------|-------------|--------|
| P0 | Corriger vulnérabilité **jspdf** (maj + tests PDF) | Dev | ✅ Fait (jspdf@4.1.0) |
| P0 | Corriger vulnérabilité **next** ou documenter mitigation (remotePatterns, PPR) | Dev | ✅ Fait (next@16.1.6) |
| P1 | Appliquer `npm audit fix` (lodash) | Dev | ✅ Fait (0 vulnérabilités) |
| P1 | Rendre bloquants en CI : lint et typecheck (après réduction des erreurs TSC) | Dev/DevOps | ⚠️ Lint bloquant ; typecheck \|\| true |
| P2 | Réduire les ~1 023 erreurs TSC (types BMO + calendrier) et désactiver `ignoreBuildErrors` | Dev | À faire |
| P2 | Réactiver les suites Jest ignorées et ajouter tests sur chemins critiques | QA/Dev | À faire |
| P3 | Factoriser les doublons (BatchActionsBar, FormUtils, etc.) | Dev | À faire |
| P3 | Sécuriser la pipeline (secrets + audit-level high bloquant) | DevOps | À faire |

---

*Rapport généré le 4 février 2026. Mise à jour : vulnérabilités npm corrigées, CI lint bloquant.*
