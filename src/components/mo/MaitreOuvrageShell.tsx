/**
 * MaitreOuvrageShell - Shell pour panneau métier 3 niveaux
 * 
 * Fournit la structure de base pour les pages Maître d'Ouvrage avec:
 * - Navigation contextuelle 3 niveaux
 * - Support pour sidebar métier, header, subnav, etc.
 * - Configuration via prop `nav`
 */

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { NavDomain } from './nav.maitre-ouvrage';

interface MaitreOuvrageShellProps {
  children: ReactNode;
  nav: NavDomain[];
}

export function MaitreOuvrageShell({ children, nav }: MaitreOuvrageShellProps) {
  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 
        Le panneau métier 3 niveaux est géré par chaque page individuellement
        car chaque module (analytics, governance, etc.) a ses propres composants :
        - Sidebar métier (AnalyticsCommandSidebar, CommandCenterSidebar, etc.)
        - Header avec actions
        - SubNavigation (Niveau 2)
        - ViewSelector + Filtres (Niveau 3)
        - KPIBar (optionnel)
        - Contenu (children)
        
        La prop `nav` est disponible pour les pages qui en ont besoin
        pour construire leur navigation contextuelle.
      */}
      {children}
    </div>
  );
}

