# Réorganisation complète — Interface maître-ouvrage (fond et forme)

**Date** : Janvier 2025  
**Objectif** : Réorganiser en profondeur l’interface du portail maître-ouvrage, sur le **fond** (architecture de l’information, modules, parcours) et sur la **forme** (layout, design system, navigation, cohérence visuelle).

---

## 1. Principes directeurs

- **Une seule source de vérité** pour la navigation (sidebar) : `src/config/navigation.ts`.
- **Un même pattern de page** pour toutes les routes (hors dashboard) : layout portail → PageTemplate → (breadcrumbs + SubNav optionnel + zone contenu avec tokens communs).
- **Design system unifié** : tokens dashboard (couleurs, espacements, bordures) utilisés partout (SubNav, panels, cartes).
- **Pas de doublon** dans le menu : une entrée par fonctionnalité (ex. un seul « Centre d’alertes »).

---

## 2. Fond (substance)

### 2.1 Architecture de l’information

- **Pilotage** : Tableau de bord, Gouvernance, Calendrier, Analytics, Centre d’alertes.
- **Exécution** : Demandes, Validation (BC / Contrats / Paiements), Dossiers bloqués, Substitution, Arbitrages & Goulots.
- **Projets & Clients** : Projets en cours, Clients, Tickets clients (pas de doublon « Chantiers » si même périmètre).
- **Finance & Contentieux** : Gains et pertes, Recouvrements, Litiges, Trésorerie.
- **RH & Ressources** : Employés, Missions, Évaluations, Demandes RH, Délégations, Organigramme.
- **Communication** : Échanges structures, Conférences, Messages externes.
- **Système** : Registre Décisions, Audit, Logs, IA, Paramètres.

### 2.2 Décisions

- **Centre d’alertes** : une seule entrée, route `/maitre-ouvrage/alerts`. Suppression de l’entrée redondante « Centre d’Alertes MOA » (ou redirection vers `alerts`).
- **Chantiers** : si pas de route dédiée, retirer du menu ou faire pointer vers Projets en cours.
- **Validation** : garder le regroupement (Validation > BC, Contrats, Paiements) dans la config.

---

## 3. Forme (présentation)

### 3.1 Layout unifié

- **Portail** : `app/(portals)/maitre-ouvrage/layout.tsx` — BMOAppShell + zone main (viewport-contained, overflow-x-hidden).
- **Toutes les pages (hors dashboard)** : passent par PageTemplate : zone scroll unique, padding `p-4 sm:p-6`, pas de double scroll.
- **Dashboard** : conserve son layout spécifique (DashboardSidebar + DashboardShell) comme exception.

### 3.2 Design tokens (commun)

- Utiliser les tokens de `src/modules/dashboard/utils/dashboardDesignTokens.ts` (ou un réexport central) pour :
  - SubNavigation : `bg-slate-900/40`, `border-slate-800/60`, texte `text-slate-200` / `text-slate-400`.
  - Panels / cartes : `bg-slate-900/40`, `border-slate-800/70`, `rounded-2xl`.
  - Boutons secondaires : bordures et hover alignés sur le dashboard.
- Couleur d’accent commune : orange/ambre pour les états actifs (déjà utilisé dans SubNav).

### 3.3 Breadcrumbs

- Affichage systématique en haut de la zone contenu (dans PageTemplate ou juste en dessous du SubNav).
- Source : `useNavigation().breadcrumbs` (déjà disponible).
- Style : texte petit, liens cliquables, séparateur « / » ou chevron.

### 3.4 SubNavigation

- Même style que le reste du portail : fond slate-900/40, bordure slate-800/60.
- Onglets actifs : accent orange/ambre (déjà en place).

---

## 4. Fichiers modifiés

- `src/config/navigation.ts` : suppression doublon centre-alertes, ajustement Chantiers, libellés et ordre des sections.
- `src/components/navigation/PageTemplate.tsx` : breadcrumbs en haut, application des tokens (conteneur + SubNav).
- `src/components/navigation/SubNavigation.tsx` : application des tokens dashboard (couleurs, bordures).
- `app/(portals)/maitre-ouvrage/layout.tsx` : vérification viewport et overflow (déjà conformes).
- Optionnel : `src/lib/data/bmo-mock-3.ts` (navSections) : alignement sur la config navigation pour les usages restants.

---

## 5. Réalisé

- **Navigation (fond)**  
  - `src/config/navigation.ts` : suppression de l’entrée redondante « Centre d’Alertes MOA » (centre-alertes) ; suppression de « Chantiers » (pas de route dédiée) ; section « CHANTIERS & CLIENTS » renommée en « PROJETS & CLIENTS » (id `projets-clients`).
  - `src/lib/data/bmo-mock-3.ts` : suppression de « Centre d’Alertes MOA » dans navSections pour alignement avec la config.

- **Forme (layout, design)**  
  - `PageTemplate` : fil d’Ariane (breadcrumbs) en haut, issu de `useNavigation().breadcrumbs` ; style unifié (slate-950/40, border-slate-800/60, texte slate-400/slate-200) ; zone contenu avec `bg-slate-950/30` et même padding.
  - `SubNavigation` : tokens alignés sur le portail (bg-slate-900/40, border-slate-800/60, boutons/filtres slate-950/50, border-slate-800/70) ; padding horizontal `px-4 sm:px-6` comme le reste du portail.
  - Contexte SubNav pour **Alertes** (onglets Vue d’ensemble, Critiques, Projets, RH, SLA) et **Gouvernance** (Tableau de bord, Arbitrages, Attention, Conformité, Synthèse, Tendances) dans `getSubNavContextForPath`.
  - **Barre latérale du dashboard (complète)** : Actions, Risques, Décisions, Temps réel, Administration remplacés par des liens externes vers les modules (Demandes, Validation BC/contrats/paiements, Dossiers bloqués, Arbitrages, Substitution, Centre d'alertes, Décisions, Gouvernance, Paramètres, Logs).
