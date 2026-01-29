# Audit Navigation ↔ Registry (Dashboard)

**Date:** 2025-01-28  
**Source de vérité nav:** `src/modules/dashboard/navigation/dashboardNavigationConfig.ts`  
**Source de vérité registry:** `src/modules/dashboard/registry/dashboardRegistry.tsx`

## Résumé

| Métrique | Valeur |
|----------|--------|
| Clés dans le registry | 129 |
| Routes dans la navigation (feuilles) | 128 |
| **Dans le registry, absentes de la nav** | 1 |
| **Dans la nav, absentes du registry** | 0 |

## 1. Entrées du registry non présentes dans la nav

Ces clés existent dans `dashboardRegistry` mais ne sont pas proposées dans le menu (sidebar). Elles restent accessibles par deep-link / URL.

| Clé registry | Remarque |
|--------------|----------|
| `overview::summary::highlights` | "Points clés" sous Synthèse. La nav propose uniquement `overview::summary::dashboard` sous Synthèse et `overview::kpis::highlights` ("Synthèse stratégique") sous KPIs. |

**Recommandation:**  
- ~~Soit ajouter un item "Points clés" sous **Vue d'ensemble → Synthèse** dans `dashboardNavigationConfig`~~ **Appliqué (option A).**
- Soit considérer la vue comme dépréciée et la retirer du registry si elle n’est plus utilisée.

## 2. Routes de la nav sans entrée registry

Aucune. Toutes les routes définies dans `dashboardNavigationConfig` ont une entrée correspondante dans `dashboardRegistry`.

## 3. Cohérence des alias

Les alias dans `src/modules/dashboard/utils/routeAliases.ts` sont pris en compte par `normalizeRoute` / `routeValidation`. Les clés du registry utilisent déjà les noms "cibles" (ex. `performance::validation::*`, `actions::blocked::*`). Aucune incohérence détectée.

## 4. Fichiers concernés

- **Nav:** `dashboardNavigationConfig.ts`, `navigation.config.json` (utilisé ailleurs, pas par la sidebar principale)
- **Registry:** `dashboardRegistry.tsx`
- **Résolution de route:** `routeValidation.ts`, `routeAliases.ts`, `dashboardCommandCenterStore`

---

*Rapport généré dans le cadre de l’audit de cohérence nav ↔ registry.*
