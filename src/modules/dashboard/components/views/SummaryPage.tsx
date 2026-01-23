/**
 * Page Synthèse
 */

'use client';

import React from 'react';

export function SummaryPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fadeIn min-w-0 overflow-hidden">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">Synthèse</h2>
        <p className="text-slate-400 text-xs sm:text-sm break-words">Résumé des indicateurs clés</p>
      </div>
      
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-6 min-w-0 overflow-hidden">
        <p className="text-slate-300 text-sm sm:text-base break-words">Contenu Synthèse à implémenter</p>
      </div>
    </div>
  );
}

