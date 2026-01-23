/**
 * Composant de skeleton pour le chargement du contenu du dashboard
 * Affiche des placeholders animés pendant le chargement
 */

'use client';

import React from 'react';

export function ContentLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 bg-gradient-to-r from-slate-800/40 via-slate-800/60 to-slate-800/40 rounded-xl w-1/3 animate-shimmer" />
        <div className="h-4 bg-slate-800/30 rounded-lg w-2/3" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="h-40 bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/30 rounded-xl border border-slate-700/30 p-4 space-y-3 animate-shimmer"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-4 bg-slate-700/40 rounded w-1/2" />
            <div className="h-8 bg-slate-700/40 rounded w-3/4" />
            <div className="h-3 bg-slate-700/30 rounded w-full" />
            <div className="h-3 bg-slate-700/30 rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Chart/Table skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-800/40 rounded-lg w-1/4" />
        <div className="h-80 bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/30 rounded-xl border border-slate-700/30 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-700/30 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-700/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
