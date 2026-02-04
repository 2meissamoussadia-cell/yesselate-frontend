# Corrections types, doublons et syntaxe

Ce document recense les corrections effectuées et les points restants à traiter.

## Corrections effectuées

### 1. `lib/types/index.ts` (racine)
- **Problème** : Fichier cassé (code orphelin, interfaces incomplètes, doublons).
- **Correction** : Fichier réduit à un re-export propre vers `src/lib/types/index.ts` (24 lignes). Plus de code dupliqué.

### 2. Identifiants avec tirets (syntaxe invalide)
- **Fichiers** : `src/lib/api/exploitation-maintenance.ts`, `src/lib/api/pre-projet.ts`, hooks associés.
- **Problème** : `exploitation-maintenanceApi` et `pre-projetApi` utilisent un tiret, interprété comme opérateur par TypeScript.
- **Correction** :
  - `exploitation-maintenanceApi` → `exploitationMaintenanceApi`
  - `pre-projetApi` → `preProjetApi`
  - Types explicites ajoutés sur les paramètres (Record<string, unknown>, string).

### 3. Design tokens (exports manquants)
- **Problème** : `BmoLayoutShell` importait `SIDEBAR_MOBILE_BREAKPOINT`, `SIDEBAR_WIDTH_CLASS`, `Z_INDEX` depuis `@/lib/design-tokens`, qui ne les exportait pas.
- **Correction** : Ré-export de ces trois symboles depuis `./design-tokens/index` dans `src/lib/design-tokens.ts`.

### 4. ComposeMessageDialog manquant
- **Problème** : `src/components/bmo/index.ts` exportait `ComposeMessageDialog` depuis un fichier inexistant.
- **Correction** : Création d’un stub `src/components/bmo/messages/ComposeMessageDialog.tsx` (dialog basique) pour éviter les imports cassés.

### 5. AuthContext et type Employe / User
- **Problème** : Utilisation de `employe.avatar`, `employe.bureauId`, `employe.statut`, `employe.fonction` alors que le mock (lib/mocks) a `status`, `poste`, et pas d’avatar/bureauId.
- **Correction** : Mapping dans AuthContext pour accepter les deux formes (nom/prenom ou name, poste ou fonction, status ou statut) et fournir des valeurs par défaut (avatar/bureauId à `undefined`).

### 6. API Autorisations (doublon et typage)
- **Problème** : Deux méthodes `getAutorisations` (liste et détail), paramètres sans type.
- **Correction** :
  - Liste : `getAutorisations(params?)`
  - Détail : `getAutorisation(id)` (singulier).
  - Types ajoutés sur tous les paramètres.
- **Hook** : Deux exports du même nom `useAutorisations` → liste reste `useAutorisations`, détail renommé en `useAutorisation`.

---

## Architecture des types (état actuel)

- **Point d’entrée** : `src/lib/types/index.ts` (ré-exporte common, api-error, bmo, modules).
- **Types communs** : `src/lib/types/common.types.ts` (User, BaseEntity, ApiResponse, etc.).
- **Compatibilité** : `lib/types/index.ts` à la racine ré-exporte `../../src/lib/types/index`.

Les imports `@/lib/types` ou `@/lib/types/…` résolvent vers `src/lib/types` (alias tsconfig).

---

## Erreurs TypeScript restantes (à traiter par lot)

La commande `npx tsc --noEmit` remonte encore des erreurs dans d’autres zones, par exemple :

- **Dashboard / Alertes** : `DashboardAlerte` vs `Alerte`, `DashboardBudgetPoint` vs `BudgetData` (champs optionnels).
- **Composants BMO** : `FilterBar` (DropdownMenuCheckboxItem), `QuickActionsBar` (variants primary/secondary), `TruncateWithTooltip` (ref HTMLElement vs HTMLDivElement), `PreProjetDetailPanel` (Badge non importé).
- **Hooks / services** : `useContratActions` (ContratDecision, signatures), `useGovernanceAlerts` (index any), `usePDFExport` (jsPDF), `gouvernanceApi` (isNotFound/response).
- **Modules** : gouvernance (GouvernanceData.points_attention, navigation), validation-bc (ValidationNavItem en double export), validation-contrats (filtres, couleurs), etc.
- **Présentation** : ChartTooltip/ChartWrapper, DragDrop export, RefObject HTMLDivElement vs HTMLElement, workers.

Il est recommandé de traiter ces erreurs par domaine (dashboard, BMO, gouvernance, validation-bc, etc.) et de mettre à jour ce document au fur et à mesure.

---

## Checklist rapide

- [x] `lib/types/index.ts` nettoyé et re-export uniquement
- [x] Identifiants avec tirets corrigés (exploitation-maintenance, pre-projet)
- [x] Design tokens : SIDEBAR_*, Z_INDEX exportés
- [x] ComposeMessageDialog stub créé
- [x] AuthContext aligné avec le format mock (nom/prenom, poste, status)
- [x] API autorisations : getAutorisation(id) + useAutorisation(id) sans doublon
- [ ] Erreurs tsc restantes à corriger par zone (voir liste ci-dessus)
