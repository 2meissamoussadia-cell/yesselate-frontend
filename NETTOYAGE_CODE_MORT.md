# Nettoyage du code mort - Suppression de `topKpis`

## Problème identifié

La variable `topKpis` était déclarée dans `DashboardContent` mais n'était plus utilisée nulle part dans le code actif. Elle était conservée "temporairement pour compatibilité avec ARIA Live Region" selon le commentaire TODO, mais l'ARIA Live Region utilise directement `allKpis`.

## Solution appliquée

### Suppression de la variable inutilisée

**Fichier** : `app/(portals)/maitre-ouvrage/dashboard/page.tsx`

**Avant** :
```typescript
// ✅ Filtre géré par useKPIFilter hook (persistance localStorage + debounce inclus)

// ✅ topKpis est maintenant géré par DashboardKPIBar via useKPIFilter
// Conservé temporairement pour compatibilité avec ARIA Live Region
// TODO: Supprimer après migration complète vers DashboardKPIBar
const topKpis = allKpis; // Fallback temporaire - sera supprimé

const stats = useMemo(
```

**Après** :
```typescript
// ✅ Filtre géré par useKPIFilter hook (persistance localStorage + debounce inclus)
// Note: Le filtrage des KPIs est maintenant géré par DashboardKPIBar via useKPIFilter

const stats = useMemo(
```

## Vérification

### ✅ ARIA Live Region utilise `allKpis` directement
```typescript
{refreshStatus === 'idle' && refreshCount > 0 && `Données actualisées. ${allKpis.length} indicateur${allKpis.length > 1 ? 's' : ''} affiché${allKpis.length > 1 ? 's' : ''}`}
```

### ✅ Aucune référence à `topKpis` restante
- La variable a été supprimée
- Aucune utilisation dans le code
- Le commentaire TODO a été supprimé

## Résultat

- ✅ Code plus propre et maintenable
- ✅ Suppression du code mort
- ✅ Réduction de la confusion (plus de variable inutilisée)
- ✅ Migration vers `DashboardKPIBar` considérée comme complète

## Notes

- Le filtrage des KPIs est maintenant entièrement géré par `DashboardKPIBar` via `useKPIFilter`
- L'ARIA Live Region utilise directement `allKpis` pour les annonces d'accessibilité
- Aucun impact fonctionnel : la variable n'était pas utilisée
