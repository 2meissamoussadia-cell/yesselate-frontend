/**
 * Bouton de navigation générique utilisant NAV_MAP
 * Permet de naviguer vers n'importe quelle page via son label
 */

'use client';

import React from 'react';
import { useDashboardNavigation } from '../../context/DashboardNavigationContext';
import { NAV_MAP, type NavigationLabel, hasNavigationLabel } from '../../config/navigationMap';
import { cn } from '@/lib/utils';

interface NavigationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: NavigationLabel | string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Bouton de navigation générique qui utilise NAV_MAP pour naviguer
 */
export function NavigationButton({
  label,
  children,
  className,
  onClick,
  ...props
}: NavigationButtonProps) {
  const { setMain, setSub, setLeaf } = useDashboardNavigation();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Vérifier si le label existe dans NAV_MAP
    if (!hasNavigationLabel(label)) {
      console.warn(`Label "${label}" n'existe pas dans NAV_MAP`);
      return;
    }

    const target = NAV_MAP[label];
    if (!target) {
      console.warn(`Aucune cible trouvée pour le label "${label}"`);
      return;
    }

    // Mettre à jour la navigation
    setMain(target.main);
    setSub(target.sub);
    setLeaf(target.leaf);

    // Appeler le onClick personnalisé si fourni
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className={cn('transition-colors', className)}
      {...props}
    >
      {children || label}
    </button>
  );
}

