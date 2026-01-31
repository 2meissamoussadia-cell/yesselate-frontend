# Usage des composants KPI — Dashboard & BMO

**Objectif :** Clarifier quel composant KPI utiliser où (audit manquements : KpiCard vs KpiStatCard).

## Composants concernés

| Composant | Emplacement | Usage |
|-----------|-------------|--------|
| **KPICard** | `src/modules/dashboard/components/shared/KPICard.tsx` | Strip KPI du dashboard (registry, vues avec loaders). Props : `kpi` (KPICardData), `size` (xl/lg/md/sm). Utilisé par la page dashboard (KPICardPro), PerformanceBureauxSinglePage, etc. |
| **KpiCardPro** | `app/(portals)/maitre-ouvrage/dashboard/page.tsx` | Wrapper local autour de KPICard avec mapping tone/trend et `onClick` → modal drill-down. Utilisé dans la barre KPI du dashboard. |
| **KpiStatCard** | `src/components/features/bmo/dashboard/components/KpiStatCard.tsx` | Cartes KPI BMO (ton, trend, label, value). Utilisé par BudgetKpiPage et le wrapper KPICard dans `features/bmo/dashboard/components/KPICard.tsx`. |
| **KpiCard** (BMO metrics) | `src/components/bmo/metrics/KpiCard.tsx` | Wrapper autour de KPICard dashboard avec API simplifiée (label, value, trend, variant). Utilisé par FoncierScreen et autres écrans BMO. |
| **KpiCardClean** | `src/modules/dashboard/components/shared/KpiCardClean.tsx` | Carte KPI « propre » (titre, valeur, sous-texte, couleur). Utilisé par DashboardCleanHome. |
| **KpiCard** (gouvernance) | `src/modules/gouvernance/components/KpiPanel.tsx` | Composant local dans KpiPanel (label, value, delta, tone). Non partagé avec le dashboard. |

## Règle pratique

- **Vues dashboard (registry, loaders)** : utiliser **KPICard** (shared) ou **KpiCardPro** (page dashboard).
- **Pages BMO type BudgetKpiPage** : utiliser **KpiStatCard** (features/bmo/dashboard) ou le wrapper **KPICard** du même dossier qui convertit vers KpiStatCard.
- **Écrans BMO (Foncier, etc.)** : utiliser **KpiCard** de `components/bmo/metrics` (API simple).
- **Gouvernance** : **KpiCard** local dans KpiPanel ; pas de partage avec dashboard pour l’instant.

## Conversions

- `mapColorToTone` / `mapToneToColor` (`colorMapping.ts`) : conversion entre couleurs KPICard et tons KpiStatCard.
- `mapKPIColorToTone` / `mapKPIToneToColor` (`kpi.ts`) : wrappers pour la rétrocompat.

---

*Document ajouté pour répondre à l’audit manquements (composant KPI partagé — optionnel : documenter les deux usages).*
