/**
 * Types Index - Re-export vers src/lib/types
 * ===========================================
 * 
 * ⚠️ FICHIER DE COMPATIBILITÉ ⚠️
 * 
 * Ce fichier existe uniquement pour maintenir la compatibilité avec
 * les anciens imports depuis @/lib/types ou ../../../lib/types.
 * 
 * TOUS les types sont maintenant définis dans src/lib/types/
 * 
 * STRUCTURE :
 * - Types communs → src/lib/types/common.types.ts
 * - Types BMO → src/lib/types/bmo.types.ts
 * - Types API → src/lib/types/api-error.types.ts
 * - Index central → src/lib/types/index.ts
 * 
 * Ce fichier fait simplement un re-export pour éviter de casser
 * les imports existants.
 */

// Re-export TOUT depuis src/lib/types
export * from '../../src/lib/types/index';
