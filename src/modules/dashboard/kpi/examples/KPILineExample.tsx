/**
 * Exemple d'utilisation du composant KPILine
 * 
 * Montre comment utiliser KPILine dans différents contextes
 */

'use client';

import React from 'react';
import { KPILine } from '../KPILine';

// ============================================
// EXEMPLE 1 : Liste simple de KPIs
// ============================================

export function KPILineListExample() {
  const kpis = [
    { label: 'Demandes', value: 247, tone: 'ok' as const, trend: '+12%' },
    { label: 'Validations', value: '89%', tone: 'ok' as const, trend: '+3%' },
    { label: 'Blocages', value: 5, tone: 'warn' as const, trend: '-2' },
    { label: 'Risques critiques', value: 3, tone: 'crit' as const, trend: '+1' },
    { label: 'Budget consommé', value: '67%', tone: 'info' as const, trend: '—' },
  ];

  return (
    <div className="space-y-1 rounded-xl border border-slate-800/60 bg-slate-950/35 p-4">
      {kpis.map((kpi) => (
        <KPILine key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}

// ============================================
// EXEMPLE 2 : Dans un tableau
// ============================================

export function KPILineTableExample() {
  const data = [
    { label: 'Projet A', value: '85%', tone: 'ok' as const, trend: '+5%' },
    { label: 'Projet B', value: '62%', tone: 'warn' as const, trend: '-2%' },
    { label: 'Projet C', value: '45%', tone: 'crit' as const, trend: '-10%' },
  ];

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Avancement des projets</h3>
      <div className="space-y-1">
        {data.map((item) => (
          <KPILine key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXEMPLE 3 : Avec valeurs monétaires
// ============================================

export function KPILineCurrencyExample() {
  const budget = [
    { label: 'Budget alloué', value: '15 000 000 FCFA', tone: 'info' as const, trend: undefined },
    { label: 'Budget consommé', value: '10 050 000 FCFA', tone: 'warn' as const, trend: '+5%' },
    { label: 'Reste disponible', value: '4 950 000 FCFA', tone: 'ok' as const, trend: '-5%' },
  ];

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/35 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Budget du projet</h3>
      <div className="space-y-1">
        {budget.map((item) => (
          <KPILine key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
