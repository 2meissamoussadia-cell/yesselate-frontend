# Audit : manquements, incohérences, doublons, problèmes

Rapport d'audit du module dashboard et zones connexes (état au 29/01/2025).

---

## 1. Manquements

| Élément | Détail | Priorité |
|--------|--------|----------|
| **Import manquant** | `useCockpitUrgentNotification` était utilisé dans `CockpitDGPage.tsx` sans import (corrigé). | — |
| **EmptyState : chemin non unifié** | Corrigé : implémentation unique dans shared, tous les imports unifiés vers `../shared/EmptyState` ou `./shared/EmptyState`. | — |
| **ErrorBoundary** | Les docs signalent l'absence d'ErrorBoundary autour du contenu rendu par `DashboardContentSwitch`. Corrigé : ErrorBoundary ajouté dans `DashboardViewRouter` autour du contenu dynamique (ContentSwitch + Component). | — |
| **Données réelles** | Beaucoup de vues (Admin, PerformanceBureaux, Actions, Decisions, Risks, etc.) affichent des listes vides ou des placeholders ; les commentaires « Données à connecter via API » restent d'actualité. | Métier |

---

## 2. Incohérences

| Sujet | Détail | Recommandation |
|-------|--------|----------------|
| **Import EmptyState** | Unifié : implémentation unique dans shared, ré-export depuis views ; AdminSettings* et ViewRouter importent depuis shared. | Fait. |
| **Deux shells « DashboardShell »** | `DashboardShell.tsx` (racine) = shell complet. `shared/DashboardShell.tsx` = layout seul. Documenté dans les deux fichiers + index (DashboardShell vs DashboardShellShared). | Fait. |
| **Registry vs config / loadComponent** | `DashboardViewRouter` : si la route est dans le **registry** → rend `DashboardContentSwitch` (loaders + data). Sinon → charge le composant par **nom** via `loadComponent` + `navigation.config.json`. Deux sources de vérité (registry vs JSON) pour « quelle URL → quelle vue ». | Clarifier la convention (registry = priorité ou unique source) et documenter ; éviter qu'une route soit définie seulement dans l'un des deux. |
| **Exports dashboard** | Le module exporte `DashboardShell` (shell complet) et `DashboardShellShared` (layout). Commentaires ajoutés dans l'index. | Fait. |

---

## 3. Doublons / redondances

| Élément | Détail | Action suggérée |
|--------|--------|------------------|
| **DashboardContentRouter** | Déprécié, remplacé par `DashboardViewRouter`. Export marqué @deprecated dans `components/index.ts` ; conservé pour rétrocompat. | Fait (dépréciation documentée). |
| **mapKPIColorToTone / mapKPIToneToColor** | Dans `kpi.ts`, wrappers autour de `mapColorToTone` / `mapToneToColor` de `colorMapping.ts`. | Garder tel quel (rétrocompat). |
| **KpiCard (gouvernance) vs KpiStatCard (BMO)** | Comportement proche, pas de composant partagé. | Optionnel : extraire un composant KPI commun ou documenter les deux usages. |
| **Pages PerformanceBureaux*** | Structure et rendu quasi identiques (liste + EmptyState « Aucun projet »). | Factoriser un composant commun (ex. `PerformanceBureauxListPage`) avec paramètre bureau. |

---

## 4. Problèmes (bugs / techniques)

| Problème | Détail | Statut |
|----------|--------|--------|
| **manifest.json `purpose`** | `"purpose": "any maskable"` valide (chaîne space-separated). | OK |
| **Skip link position** | Lien « Aller au contenu » en absolute ; comportement acceptable. | OK |
| **AdministrationLogs* supprimés** | Les anciens noms `AdministrationLogsActivitePage` / `AdministrationLogsSystemePage` ne sont plus utilisés. Registry et vues pointent vers `AdminLogsActivitePage` / `AdminLogsSystemePage`. Aucune référence aux anciens noms. | OK (vérifié). |

---

## 5. Synthèse des actions recommandées

1. **Court terme**  
   - Imports `EmptyState` unifiés (shared = source unique).  
   - Références logs admin vérifiées (AdminLogs* utilisés partout).  
   - ErrorBoundary ajouté dans DashboardViewRouter autour du contenu dynamique.  
   - DashboardShell documenté (shell complet vs layout shared).  
   - DashboardContentRouter marqué @deprecated aux exports.

2. **Moyen terme**  
   - Documenter la règle registry vs `navigation.config.json` pour le ViewRouter.

3. **Long terme**  
   - Factoriser les pages PerformanceBureaux* et, si pertinent, les autres familles de vues très similaires.  
   - Optionnel : composant KPI partagé entre gouvernance et BMO.

Ce document est mis à jour au fil des corrections et évolutions.
