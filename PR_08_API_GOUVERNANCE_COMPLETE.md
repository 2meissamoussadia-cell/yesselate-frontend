# PR #08: Compléter Routes API Gouvernance

**Branch**: `feat/api-gouvernance-complete`  
**Priorité**: 🟡 **HAUTE**  
**Estimation**: 24 J/H (3 jours)  
**Statut**: 🚧 À implémenter

---

## 🎯 Contexte Métier

Créer les 16 routes API gouvernance manquantes pour compléter l'intégration du module gouvernance.

**Bénéfices métier**:
- Module gouvernance fonctionnel en production
- Plus d'erreurs 404
- Données réelles disponibles (après intégration backend)
- Cohérence avec documentation

---

## 📋 Routes à Créer

### 1. Routes Synthèse (5 routes) - 8 J/H

- `GET /api/gouvernance/synthese/projets`
- `GET /api/gouvernance/synthese/budget`
- `GET /api/gouvernance/synthese/jalons`
- `GET /api/gouvernance/synthese/risques`
- `GET /api/gouvernance/synthese/validations`

### 2. Routes Attention (4 routes) - 6 J/H

- `GET /api/gouvernance/attention/depassements-budget`
- `GET /api/gouvernance/attention/retards-critiques`
- `GET /api/gouvernance/attention/ressources-indispo`
- `GET /api/gouvernance/attention/escalades`

### 3. Routes Arbitrages (3 routes) - 5 J/H

- `GET /api/gouvernance/arbitrages/decisions-validees`
- `GET /api/gouvernance/arbitrages/en-attente`
- `GET /api/gouvernance/arbitrages/historique`

### 4. Routes Instances (3 routes) - 3 J/H

- `GET /api/gouvernance/instances/reunions-dg`
- `GET /api/gouvernance/instances/reunions-moa-moe`
- `GET /api/gouvernance/instances/reunions-transverses`

### 5. Routes Conformité (3 routes) - 2 J/H

- `GET /api/gouvernance/conformite/indicateurs`
- `GET /api/gouvernance/conformite/audit`
- `GET /api/gouvernance/conformite/engagements`

---

## 📋 Plan Technique Détaillé

### Structure de Fichiers

```
app/api/gouvernance/
  ├── overview/route.ts ✅ (déjà créé)
  ├── stats/route.ts ✅ (déjà créé)
  ├── tendances/route.ts ✅ (déjà créé)
  ├── synthese/
  │   ├── projets/route.ts
  │   ├── budget/route.ts
  │   ├── jalons/route.ts
  │   ├── risques/route.ts
  │   └── validations/route.ts
  ├── attention/
  │   ├── depassements-budget/route.ts
  │   ├── retards-critiques/route.ts
  │   ├── ressources-indispo/route.ts
  │   └── escalades/route.ts
  ├── arbitrages/
  │   ├── decisions-validees/route.ts
  │   ├── en-attente/route.ts
  │   └── historique/route.ts
  ├── instances/
  │   ├── reunions-dg/route.ts
  │   ├── reunions-moa-moe/route.ts
  │   └── reunions-transverses/route.ts
  └── conformite/
      ├── indicateurs/route.ts
      ├── audit/route.ts
      └── engagements/route.ts
```

### Template de Route

```typescript
/**
 * GET /api/gouvernance/synthese/projets
 * =====================================
 * 
 * Synthèse des projets de gouvernance
 * 
 * Query params:
 * - bureau: Filtrer par bureau (optionnel)
 * - status: Filtrer par statut (optionnel)
 * - page: Numéro de page (défaut: 1)
 * - pageSize: Taille de page (défaut: 25)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaginatedResponse, mockProjets } from '@/modules/gouvernance/api/gouvernanceApiMock';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

    // TODO: Remplacer par vrai appel backend/BDD
    // Pour l'instant, retourner les données mockées
    let projets = [...mockProjets];

    // Appliquer filtres si présents (simulation)
    if (bureau) {
      projets = projets.filter(p => p.bureau === bureau);
    }
    if (status) {
      projets = projets.filter(p => p.status === status);
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProjets = projets.slice(start, end);

    return NextResponse.json({
      success: true,
      data: createPaginatedResponse(paginatedProjets, projets.length, page, pageSize),
    });
  } catch (error) {
    console.error('Error fetching gouvernance synthese projets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la synthèse projets',
      },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Tests Requis

### Tests API

**Fichiers à créer**:
```
app/api/gouvernance/__tests__/
  ├── synthese/
  │   ├── projets.test.ts
  │   ├── budget.test.ts
  │   ├── jalons.test.ts
  │   ├── risques.test.ts
  │   └── validations.test.ts
  ├── attention/
  │   ├── depassements-budget.test.ts
  │   ├── retards-critiques.test.ts
  │   ├── ressources-indispo.test.ts
  │   └── escalades.test.ts
  ├── arbitrages/
  │   ├── decisions-validees.test.ts
  │   ├── en-attente.test.ts
  │   └── historique.test.ts
  ├── instances/
  │   ├── reunions-dg.test.ts
  │   ├── reunions-moa-moe.test.ts
  │   └── reunions-transverses.test.ts
  └── conformite/
      ├── indicateurs.test.ts
      ├── audit.test.ts
      └── engagements.test.ts
```

**Scénarios de test**:
- Route retourne 200 avec données
- Filtres fonctionnent
- Pagination fonctionne
- Gestion d'erreurs (500)

---

## ✅ Checklist QA

### Fonctionnel
- [ ] Toutes les 16 routes créées
- [ ] Routes retournent données mockées
- [ ] Filtres fonctionnent
- [ ] Pagination fonctionne
- [ ] Gestion d'erreurs appropriée

### Technique
- [ ] Tests API passent
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] Documentation OpenAPI mise à jour

### Intégration
- [ ] Front peut appeler toutes les routes
- [ ] Plus d'erreurs 404
- [ ] Fallback données mockées fonctionnel

---

## 📊 Métriques

| Métrique | Avant | Après |
|----------|-------|-------|
| Routes gouvernance | 3/19 | 19/19 |
| Erreurs 404 | 16 | 0 |
| Coverage tests API | 0% | 80%+ |

---

## 🚀 Plan de Rollback

Si problèmes:
1. Revert commit PR
2. Vérifier routes existantes toujours fonctionnelles

---

**Créé par**: Cursor AI Assistant  
**Date**: 2026-01-23  
**Statut**: 🚧 Prêt pour implémentation
