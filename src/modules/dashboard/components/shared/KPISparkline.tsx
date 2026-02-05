/**
 * Composant Sparkline pour afficher un mini graphique de tendance
 * Génère des données mock stables basées sur tone et trend
 */

'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/cn';

export type KPITone = 'ok' | 'warn' | 'crit' | 'info';
export type KPITrend = 'up' | 'down' | 'neutral';

interface KPISparklineProps {
  tone: KPITone;
  trend: KPITrend;
  'aria-label'?: string;
}

export const KPISparkline = memo(function KPISparkline({ 
  tone, 
  trend, 
  'aria-label': ariaLabel 
}: KPISparklineProps) {
  // Générer des données mock stables pour le mini graphique
  // Utiliser un seed basé sur tone+trend pour avoir des valeurs cohérentes
  const sparklineData = useMemo(() => {
    const points = 7;
    const baseValue = 50;
    const variation = trend === 'up' ? 15 : trend === 'down' ? -15 : 5;
    
    // Seed simple pour générer des valeurs pseudo-aléatoires mais stables
    const seed = (tone.charCodeAt(0) + trend.charCodeAt(0)) % 100;
    
    return Array.from({ length: points }, (_, i) => {
      const progress = i / (points - 1);
      // Pseudo-aléatoire déterministe (sans mutation → compatible immutability lint)
      const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
      const pr = x - Math.floor(x); // [0..1)
      const randomVariation = (pr - 0.5) * 10;
      return Math.max(0, Math.min(100, baseValue + variation * progress + randomVariation));
    });
  }, [tone, trend]);

  const getColor = () => {
    if (tone === 'ok') return 'stroke-emerald-400';
    if (tone === 'warn') return 'stroke-amber-400';
    if (tone === 'crit') return 'stroke-red-400';
    return 'stroke-slate-400';
  };

  const height = 20;
  const width = 40;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...sparklineData, 1);
  const minValue = Math.min(...sparklineData, 0);

  const points = sparklineData
    .map((value, index) => {
      const x = padding + (index / (sparklineData.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div 
      className="mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200" 
      aria-label={ariaLabel}
    >
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible transition-opacity duration-200"
        aria-hidden="true"
        role="img"
      >
        <polyline
          points={points}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={getColor()}
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
        />
        {/* Point final pour accent */}
        <circle
          cx={padding + chartWidth}
          cy={padding + chartHeight - ((sparklineData[sparklineData.length - 1] - minValue) / (maxValue - minValue || 1)) * chartHeight}
          r="1.5"
          className={cn('fill-current', getColor())}
        />
      </svg>
    </div>
  );
});
