/**
 * Utilitaire de fusion intelligente pour la migration Outlook-like
 * Détermine la stratégie (create/merge/upgrade/skip) pour chaque composant
 * Usage: passer exists + content depuis un script Node (audit-bmo)
 */

export interface FusionStrategy {
  mode: 'create' | 'merge' | 'upgrade' | 'skip';
  reason: string;
  actions: FusionAction[];
}

export interface FusionAction {
  type: 'backup' | 'merge' | 'rename' | 'delete' | 'update' | 'create';
  path: string;
  details: string;
}

/**
 * Détermine la stratégie de fusion à partir de l'état du fichier
 * @param exists - le fichier existe-t-il ?
 * @param content - contenu actuel (vide si n'existe pas)
 * @param targetPath - chemin cible pour les actions
 */
export function determineFusionStrategy(
  exists: boolean,
  content: string,
  targetPath: string
): FusionStrategy {
  if (!exists) {
    return {
      mode: 'create',
      reason: 'Component does not exist',
      actions: [{ type: 'create', path: targetPath, details: 'Create new component' }],
    };
  }

  if (isCompatibleWithNewArchitecture(content)) {
    return {
      mode: 'skip',
      reason: 'Component already follows new architecture',
      actions: [],
    };
  }

  if (canBeUpgraded(content)) {
    return {
      mode: 'upgrade',
      reason: 'Component can be upgraded to new architecture',
      actions: [
        { type: 'backup', path: `${targetPath}.backup`, details: 'Backup existing' },
        { type: 'update', path: targetPath, details: 'Upgrade component' },
      ],
    };
  }

  return {
    mode: 'merge',
    reason: 'Component exists but incompatible, needs merge',
    actions: [
      { type: 'backup', path: `${targetPath}.backup`, details: 'Backup' },
      { type: 'rename', path: `${targetPath}.legacy`, details: 'Rename to .legacy' },
      { type: 'create', path: targetPath, details: 'Create new' },
    ],
  };
}

function isCompatibleWithNewArchitecture(content: string): boolean {
  const checks = [
    (content.includes('interface') || content.includes('type')) && content.includes('Props'),
    content.includes('export'),
    !content.includes(': any'),
  ];
  return checks.filter(Boolean).length >= 2;
}

function canBeUpgraded(content: string): boolean {
  return (
    !content.includes('class ') &&
    content.includes('export') &&
    !content.includes('TODO:')
  );
}
