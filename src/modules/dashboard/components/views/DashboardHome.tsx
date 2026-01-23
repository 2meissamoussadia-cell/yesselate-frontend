/**
 * Page d'accueil du Dashboard
 */

'use client';

import React from 'react';

export function DashboardHome() {
  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-slate-400 text-sm">Page d'accueil du tableau de bord</p>
      </div>
      
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
        <p className="text-slate-300">Contenu Dashboard Home à implémenter</p>
      </div>
    </div>
  );
}

