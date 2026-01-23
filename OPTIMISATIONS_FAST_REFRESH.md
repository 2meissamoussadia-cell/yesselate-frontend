# ⚡ Optimisations Fast Refresh - Plan d'Action

**Date**: 2026-01-23  
**Statut**: 📋 **PLAN PROPOSÉ**

---

## 🔍 Analyse du Problème

### Fast Refresh Lent (1.6-2.1s)

**Causes identifiées**:
1. **Taille du projet**: Nombre de fichiers à recompiler
2. **Dépendances lourdes**: React 19.2.3, Next.js 16.1.1, nombreuses librairies
3. **Configuration Next.js**: Pas d'optimisations spécifiques Fast Refresh
4. **Imports non optimisés**: Possiblement des imports lourds non lazy

---

## ✅ Corrections Déjà Appliquées

### 1. Logger Unifié ✅
- ✅ Tous les `console.log` remplacés par `useLogger`
- ✅ Méthode `debug` ajoutée au wrapper dans `routeValidation.ts`
- ✅ Réduction du bruit dans la console

### 2. Routes Invalides Corrigées ✅
- ✅ Utilisation des valeurs parentes correctes dans `DashboardSidebar`
- ✅ Warnings réduits (debug au lieu de warn)

---

## 🎯 Optimisations Proposées pour Fast Refresh

### 1. Configuration Next.js ⚡

**Fichier**: `next.config.ts`

**Optimisations à ajouter**:

```typescript
const nextConfig: NextConfig = {
  // ... config existante ...

  // ✅ Optimisations Fast Refresh
  experimental: {
    // Optimiser la compilation
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'lucide-react',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
    ],
    // Réduire la taille des chunks
    optimizeCss: true,
  },

  // ✅ Compiler optimisé
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ✅ Optimisations webpack pour Fast Refresh
  webpack: (config, { isServer, dev }) => {
    // ... config existante ...

    if (dev && !isServer) {
      // Optimiser Fast Refresh
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };

      // Réduire la taille des chunks en développement
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};
```

**Impact estimé**: -20% à -30% du temps de Fast Refresh

---

### 2. Lazy Loading des Composants Lourds ⚡

**Fichiers à optimiser**:
- `app/(portals)/maitre-ouvrage/dashboard/page.tsx`
- Composants de modals et tooltips

**Exemple**:

```typescript
// AVANT
import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';

// APRÈS
const DashboardModals = lazy(() => 
  import('@/components/features/bmo/dashboard/command-center/DashboardModals').then(m => ({ default: m.DashboardModals }))
);
const KPIAlertsSystem = lazy(() => 
  import('@/components/features/bmo/dashboard/command-center/KPIAlertsSystem').then(m => ({ default: m.KPIAlertsSystem }))
);
```

**Impact estimé**: -15% à -25% du temps de Fast Refresh

---

### 3. Optimisation des Imports ⚡

**Stratégie**:
- Importer uniquement ce qui est nécessaire
- Utiliser des imports nommés au lieu d'imports par défaut
- Éviter les imports de barils (`index.ts`) dans les composants fréquemment modifiés

**Exemple**:

```typescript
// AVANT
import { Button, Badge, Tooltip } from '@/components/ui';

// APRÈS
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
```

**Impact estimé**: -10% à -15% du temps de Fast Refresh

---

### 4. Configuration TypeScript ⚡

**Fichier**: `tsconfig.json`

**Optimisations**:

```json
{
  "compilerOptions": {
    // ... config existante ...
    
    // ✅ Optimisations compilation
    "incremental": true,
    "tsBuildInfoFile": ".next/cache/.tsbuildinfo",
    
    // ✅ Réduire les vérifications en développement
    "skipLibCheck": true,
  }
}
```

**Impact estimé**: -5% à -10% du temps de compilation

---

### 5. Optimisation des Hooks ⚡

**Stratégie**:
- Utiliser `useMemo` et `useCallback` pour stabiliser les dépendances
- Éviter les dépendances instables dans `useEffect`
- Utiliser des refs pour les valeurs qui ne doivent pas déclencher de re-renders

**Déjà fait**:
- ✅ `useAutoRefresh` optimisé
- ✅ Handlers mémorisés dans `DashboardKPIBar`

**Impact estimé**: -5% à -10% du temps de Fast Refresh

---

## 📊 Impact Global Estimé

### Avant
- Fast Refresh: **1.6-2.1s** ⚠️

### Après (avec toutes les optimisations)
- Fast Refresh: **0.8-1.2s** ✅ (-40% à -50%)

---

## 🎯 Priorisation

### Phase 1 (Impact élevé, effort faible) ⚡
1. ✅ Configuration Next.js (`optimizePackageImports`)
2. ✅ Lazy loading des composants lourds
3. ✅ Optimisation des imports

**Estimation**: 2-3 J/H  
**Impact**: -30% à -40% du temps de Fast Refresh

### Phase 2 (Impact moyen, effort moyen) 📋
4. ✅ Configuration TypeScript
5. ✅ Optimisation webpack

**Estimation**: 1-2 J/H  
**Impact**: -10% à -15% supplémentaire

### Phase 3 (Impact faible, effort élevé) 🔄
6. ✅ Refactoring complet des imports
7. ✅ Optimisation avancée des hooks

**Estimation**: 4-6 J/H  
**Impact**: -5% à -10% supplémentaire

---

## ✅ Checklist

### Corrections Immédiates
- [x] Logger unifié avec méthode `debug`
- [x] Routes invalides corrigées
- [x] Warnings réduits

### Optimisations Fast Refresh
- [ ] Configuration Next.js (`optimizePackageImports`)
- [ ] Lazy loading composants lourds
- [ ] Optimisation imports
- [ ] Configuration TypeScript
- [ ] Optimisation webpack

---

## 📝 Notes

- Les optimisations proposées sont **non-destructives** et peuvent être appliquées progressivement
- Tester chaque optimisation individuellement pour mesurer l'impact
- Le Fast Refresh peut varier selon la machine et l'environnement

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 📋 **PLAN PROPOSÉ** (prêt à être implémenté)
