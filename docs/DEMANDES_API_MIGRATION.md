# Migration API Demandes

## Contexte

Deux systèmes parallèles existaient pour gérer les demandes :
- `/api/demandes` (système principal, plus complet)
- `/api/demands` (système legacy, plus simple)

Cette migration unifie les deux systèmes en conservant `/api/demandes` comme système principal.

## Système Principal : `/api/demandes`

### Client API
```typescript
import * as demandesApi from '@/modules/demandes/api/demandesApi';
```

### Fonctions disponibles

#### Lecture
- `getDemandes(filters?: DemandeFilters): Promise<Demande[]>`
- `getDemandeById(id: string): Promise<Demande>`
- `getDemandesStats(): Promise<DemandeStats>`
- `getDemandesTrends(days?: number): Promise<DemandeTrend[]>`
- `getServiceStats(): Promise<ServiceStats[]>`
- `getDemandesByStatus(status: string): Promise<Demande[]>`
- `getDemandesByService(service: string): Promise<Demande[]>`

#### Actions individuelles
- `createDemande(data): Promise<Demande>`
- `validateDemande(id: string, note?: string): Promise<Demande>`
- `rejectDemande(id: string, reason: string): Promise<Demande>`
- `requestComplementDemande(id: string, message: string): Promise<Demande>`

#### Actions en masse
- `batchValidateDemandes(ids: string[], comment?: string): Promise<Demande[]>`
- `batchRejectDemandes(ids: string[], reason?: string): Promise<Demande[]>`

#### Export
- `exportDemandes(filters?: DemandeFilters, format?: 'xlsx' | 'csv'): Promise<Blob>`

## Fonctions de compatibilité (deprecated)

Pour faciliter la migration, des wrappers de compatibilité sont fournis :

```typescript
// ❌ Ancien (deprecated)
import { listDemands, getDemand, transitionDemand } from '@/lib/api/demands';

// ✅ Nouveau
import { getDemandes, getDemandeById, validateDemande, rejectDemande } from '@/modules/demandes/api/demandesApi';
```

### Mapping des fonctions

| Ancien (`demands.ts`) | Nouveau (`demandesApi.ts`) |
|----------------------|----------------------------|
| `listDemands(queue, q)` | `getDemandes({ status, search })` |
| `getDemand(id)` | `getDemandeById(id)` |
| `transitionDemand(id, { action: 'validate' })` | `validateDemande(id)` |
| `transitionDemand(id, { action: 'reject' })` | `rejectDemande(id, reason)` |
| `batchTransition(ids, { action })` | `batchValidateDemandes(ids)` ou `batchRejectDemandes(ids)` |
| `getStats()` | `getDemandesStats()` |
| `exportDemands(queue, format)` | `exportDemandes(filters, format)` |

## Guide de migration

### Étape 1 : Identifier les imports

```bash
# Trouver tous les fichiers qui utilisent l'ancien système
grep -r "from.*demands\.ts" src/
grep -r "@/lib/api/demands" src/
grep -r "/api/demands" src/
```

### Étape 2 : Remplacer les imports

```typescript
// Avant
import { listDemands, getDemand, transitionDemand } from '@/lib/api/demands';

// Après
import {
  getDemandes,
  getDemandeById,
  validateDemande,
  rejectDemande,
} from '@/modules/demandes/api/demandesApi';
```

### Étape 3 : Adapter les appels

```typescript
// Avant
const demands = await listDemands('pending', searchQuery);
const { demand } = await getDemand(id);
await transitionDemand(id, { action: 'validate', details: 'OK' });

// Après
const demandes = await getDemandes({ status: ['pending'], search: searchQuery });
const demande = await getDemandeById(id);
await validateDemande(id, 'OK');
```

### Étape 4 : Adapter les types

```typescript
// Avant
import type { Demand } from '@/lib/types/bmo.types';

// Après
import type { Demande } from '@/modules/demandes/types/demandesTypes';
```

## Routes API

### Routes principales (`/api/demandes`)

- `GET /api/demandes` - Liste des demandes
- `GET /api/demandes/:id` - Détail d'une demande
- `GET /api/demandes/stats` - Statistiques
- `GET /api/demandes/trends` - Tendances
- `GET /api/demandes/services/stats` - Stats par service
- `GET /api/demandes/status/:status` - Demandes par statut
- `GET /api/demandes/services/:service` - Demandes par service
- `POST /api/demandes` - Créer une demande
- `POST /api/demandes/:id/validate` - Valider
- `POST /api/demandes/:id/reject` - Rejeter
- `POST /api/demandes/:id/request-complement` - Demander complément
- `POST /api/demandes/batch/validate` - Valider en masse
- `POST /api/demandes/batch/reject` - Rejeter en masse
- `GET /api/demandes/export` - Exporter

### Routes legacy (redirection)

Les routes `/api/demands` redirigent vers `/api/demandes` pour compatibilité.

## Bénéfices de l'unification

1. **Une seule source de vérité** : Plus de confusion entre deux systèmes
2. **API plus riche** : Statistiques, tendances, exports avancés
3. **Meilleure gestion d'erreurs** : Fallback sur mock data en développement
4. **Types cohérents** : Type `Demande` standardisé
5. **Code maintenable** : Moins de duplication

## Checklist de migration

- [ ] Identifier tous les fichiers utilisant `/api/demands`
- [ ] Remplacer les imports par `demandesApi`
- [ ] Adapter les appels de fonctions
- [ ] Adapter les types
- [ ] Tester les fonctionnalités
- [ ] Supprimer `demands.ts` une fois la migration complète

## Statut actuel

- ✅ Système principal unifié (`/api/demandes`)
- ✅ Wrappers de compatibilité créés
- ✅ Documentation rédigée
- ✅ **`src/lib/api/demands.ts`** appelle désormais **`/api/demandes`** en interne (liste, détail, stats, export, validate/reject, batch) — migration progressive sans changer les imports existants
- ⏳ Migration des autres appels directs `/api/demands` (DemandView, Demand360Panel, tasksClient, etc.) optionnelle
- ⏳ Tests de régression

## Formation équipe

- **Gestion d’erreurs API** : [docs/API_ERROR_HANDLING.md](./API_ERROR_HANDLING.md) — pattern `withErrorHandler`, validation, réponses standardisées
- **Formation système d’erreurs** : [docs/FORMATION_SYSTEME_ERREURS.md](./FORMATION_SYSTEME_ERREURS.md) — exercices et bonnes pratiques

---

Date de création : 2026-02-04
Dernière mise à jour : 2026-02-04
