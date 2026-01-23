/**
 * Système de redirections pour les routes obsolètes
 * Redirige automatiquement les anciennes routes vers les nouvelles
 */

export interface RedirectRule {
  from: {
    main: string;
    sub?: string;
    leaf?: string;
  };
  to: {
    main: string;
    sub?: string;
    leaf?: string;
  };
  reason?: string;
}

/**
 * Règles de redirection pour les routes supprimées/modifiées
 */
export const navigationRedirects: RedirectRule[] = [
  // Redirection: actions/urgent → actions/all
  {
    from: { main: 'actions', sub: 'urgent' },
    to: { main: 'actions', sub: 'all' },
    reason: 'La section "urgent" a été fusionnée dans "all"',
  },
  // Redirection: actions/urgent/critiques → actions/all/critiques
  {
    from: { main: 'actions', sub: 'urgent', leaf: 'critiques' },
    to: { main: 'actions', sub: 'all', leaf: 'critiques' },
  },
  // Redirection: actions/urgent/importantes → actions/all/importantes
  {
    from: { main: 'actions', sub: 'urgent', leaf: 'importantes' },
    to: { main: 'actions', sub: 'all', leaf: 'importantes' },
  },
  // Redirection: risks/blocages → actions/blocked
  {
    from: { main: 'risks', sub: 'blocages' },
    to: { main: 'actions', sub: 'blocked' },
    reason: 'Les blocages ont été déplacés dans la section Actions',
  },
  // Redirection: risks/blocages/actifs → actions/blocked/actifs
  {
    from: { main: 'risks', sub: 'blocages', leaf: 'actifs' },
    to: { main: 'actions', sub: 'blocked', leaf: 'actifs' },
  },
  // Redirection: risks/blocages/resolus → actions/blocked/resolus
  {
    from: { main: 'risks', sub: 'blocages', leaf: 'resolus' },
    to: { main: 'actions', sub: 'blocked', leaf: 'resolus' },
  },
  // Redirection: overview/kpis/highlights → overview/kpis/strategique
  {
    from: { main: 'overview', sub: 'kpis', leaf: 'highlights' },
    to: { main: 'overview', sub: 'kpis', leaf: 'strategique' },
    reason: 'Le label "highlights" a été renommé en "strategique" pour éviter la confusion',
  },
];

/**
 * Trouve une règle de redirection correspondante
 */
export function findRedirect(
  main: string,
  sub: string | null,
  leaf: string | null
): RedirectRule | null {
  return (
    navigationRedirects.find((rule) => {
      const matchMain = rule.from.main === main;
      const matchSub =
        rule.from.sub === undefined
          ? sub === null
          : rule.from.sub === sub;
      const matchLeaf =
        rule.from.leaf === undefined
          ? leaf === null
          : rule.from.leaf === leaf;

      return matchMain && matchSub && matchLeaf;
    }) || null
  );
}

/**
 * Applique une redirection et retourne la nouvelle route
 */
export function applyRedirect(
  main: string,
  sub: string | null,
  leaf: string | null
): { main: string; sub: string | null; leaf: string | null; redirected: boolean } {
  const redirect = findRedirect(main, sub, leaf);

  if (!redirect) {
    return { main, sub, leaf, redirected: false };
  }

  return {
    main: redirect.to.main,
    sub: redirect.to.sub || null,
    leaf: redirect.to.leaf || null,
    redirected: true,
  };
}

