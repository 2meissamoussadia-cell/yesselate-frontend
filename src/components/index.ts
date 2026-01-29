/**
 * Index racine des composants (parent).
 * Export des composants globaux ; pour les sous-modules utiliser :
 * @/components/common, @/components/shared, @/components/ui, @/components/navigation.
 */

// Recherche globale (Cmd/Ctrl+K)
export { SearchGlobal } from './SearchGlobal';
export type { SearchResultItem } from './SearchGlobal';

// PWA
export { PwaRegistration } from './pwa/PwaRegistration';
export { PwaInstallPrompt } from './pwa/PwaInstallPrompt';
