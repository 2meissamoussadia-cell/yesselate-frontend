/**
 * Bouton de navigation vers la page KPIs Budget
 * Utilise le contexte de navigation et NAV_MAP
 */

'use client';

import React from 'react';
import { useDashboardNavigation } from '../../context/DashboardNavigationContext';
import { NAV_MAP } from '../../config/navigationMap';

export function KpiBudgetButton() {
  const { setMain, setSub, setLeaf } = useDashboardNavigation();

  const handleClick = () => {
    const target = NAV_MAP["KPIs Budget"];
    if (!target) return;
    setMain(target.main);
    setSub(target.sub);
    setLeaf(target.leaf);
  };

  return <button onClick={handleClick}>KPIs Budget</button>;
}

