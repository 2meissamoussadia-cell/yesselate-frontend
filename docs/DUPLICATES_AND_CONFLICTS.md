# Doublons et conflits résolus

Ce document décrit les doublons et conflits identifiés dans le projet et les actions effectuées.

## Résumé des actions

| Élément | Problème | Action |
|--------|----------|--------|
| **AuthContext** | 3 fichiers (lib/contexts, src/lib/contexts, src/contexts) | Source unique : `lib/contexts/AuthContext.tsx`. Suppression des doublons ; `src/contexts/index.ts` ré-exporte depuis `@lib-root/contexts/AuthContext`. |
| **verifyHash** | lib/utils/verifyHash.ts et src/lib/utils/verifyHash.ts | Suppression de `lib/utils/verifyHash.ts` (inutilisé). Source : `src/lib/utils/verifyHash.ts` (`@/lib/utils`). |
| **clientsMockData** | lib/data/clientsMockData.ts et src/lib/data/clientsMockData.ts | Suppression de `lib/data/clientsMockData.ts` (inutilisé). Source : `src/lib/data/clientsMockData.ts` (`@/lib/data/clientsMockData`). |
| **lib/stores** | Doublon de src/lib/stores (mêmes noms de fichiers) | Aucune suppression. Tous les imports utilisent `@/lib/stores` (src). Voir `lib/stores/README.md`. |

## Conventions d’import

- **Auth / contextes** : utiliser `@lib-root/contexts/AuthContext` (ou `@/contexts` qui ré-exporte).
- **Stores** : utiliser `@/lib/stores/*` (src/lib/stores).
- **Types** : `@/lib/types` ou `lib/types/index.ts` (ré-exporte src/lib/types).
- **Données mock (clients)** : `@/lib/data/clientsMockData`.
- **Utils (verifyHash)** : `@/lib/utils` (verifyDecisionHash, useHashVerification).

## Fichiers supprimés (doublons)

- `src/contexts/AuthContext.tsx` — remplacé par ré-export depuis lib
- `src/lib/contexts/AuthContext.tsx` — doublon de lib/contexts
- `lib/utils/verifyHash.ts` — doublon inutilisé
- `lib/data/clientsMockData.ts` — doublon inutilisé

## Conflits Git

Aucun marqueur de conflit Git (`<<<<<<<`, `=======`, `>>>>>>>`) n’a été trouvé dans le dépôt.
