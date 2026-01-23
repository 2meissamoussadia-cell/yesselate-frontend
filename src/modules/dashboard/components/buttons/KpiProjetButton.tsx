/**
 * Bouton de navigation vers la page KPIs Projet
 * Utilise le contexte de navigation et NAV_MAP
 */

'use client';

import React from 'react';
import { useDashboardNavigation } from '../../context/DashboardNavigationContext';
import { NAV_MAP } from '../../config/navigationMap';

export function KpiProjetButton() {
  const { setMain, setSub, setLeaf } = useDashboardNavigation();

  const handleClick = () => {
    const target = NAV_MAP["KPIs Projet"];
    if (!target) return;
    setMain(target.main);
    setSub(target.sub);
    setLeaf(target.leaf);
  };

  return <button onClick={handleClick}>KPIs Projet</button>;
}

