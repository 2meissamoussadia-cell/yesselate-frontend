/**
 * Composant de visualisation Gantt
 * Graphique Gantt personnalisé avec SVG
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Jalon, EvenementCalendrier, Chantier } from '../types/calendrierTypes';

interface GanttVisualizationProps {
  jalons: Jalon[];
  evenements: EvenementCalendrier[];
  chantiers: Chantier[];
  dateDebut?: string;
  dateFin?: string;
  className?: string;
}

interface GanttItem {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  type: 'jalon' | 'evenement';
  color: string;
  isRetard?: boolean;
  isRisque?: boolean;
  chantierNom?: string;
}

export function GanttVisualization({
  jalons,
  evenements,
  chantiers,
  dateDebut,
  dateFin,
  className,
}: GanttVisualizationProps) {
  // Calculer la plage de dates
  const dateRange = useMemo(() => {
    const allDates: Date[] = [];
    
    jalons.forEach((j) => {
      if (j.date_debut) allDates.push(new Date(j.date_debut));
      if (j.date_fin) allDates.push(new Date(j.date_fin));
    });
    
    evenements.forEach((e) => {
      if (e.date_debut) allDates.push(new Date(e.date_debut));
      if (e.date_fin) allDates.push(new Date(e.date_fin));
    });

    if (allDates.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      };
    }

    const start = dateDebut ? new Date(dateDebut) : new Date(Math.min(...allDates.map(d => d.getTime())));
    const end = dateFin ? new Date(dateFin) : new Date(Math.max(...allDates.map(d => d.getTime())));

    // Ajouter une marge de 7 jours
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }, [jalons, evenements, dateDebut, dateFin]);

  // Préparer les items pour le Gantt
  const ganttItems = useMemo(() => {
    const items: GanttItem[] = [];

    // Ajouter les jalons
    jalons.forEach((jalon) => {
      if (jalon.date_debut && jalon.date_fin) {
        const chantier = chantiers.find((c) => c.id === jalon.chantier_id);
        items.push({
          id: `jalon-${jalon.id}`,
          label: jalon.libelle,
          startDate: new Date(jalon.date_debut),
          endDate: new Date(jalon.date_fin),
          type: 'jalon',
          color: jalon.est_retard
            ? 'rgb(239, 68, 68)'
            : jalon.est_sla_risque
            ? 'rgb(251, 191, 36)'
            : 'rgb(59, 130, 246)',
          isRetard: jalon.est_retard,
          isRisque: jalon.est_sla_risque,
          chantierNom: chantier?.nom,
        });
      }
    });

    // Ajouter les événements
    evenements.forEach((event) => {
      if (event.date_debut && event.date_fin) {
        const chantier = event.chantier_id ? chantiers.find((c) => c.id === event.chantier_id) : null;
        items.push({
          id: `event-${event.id}`,
          label: event.titre || 'Événement',
          startDate: new Date(event.date_debut),
          endDate: new Date(event.date_fin),
          type: 'evenement',
          color: 'rgb(168, 85, 247)',
          chantierNom: chantier?.nom,
        });
      }
    });

    // Trier par date de début
    return items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [jalons, evenements, chantiers]);

  const totalDays = useMemo(() => {
    const diffTime = dateRange.end.getTime() - dateRange.start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [dateRange]);

  const svgWidth = 1000;
  const leftMargin = 150; // Espace pour les labels de chantiers
  const chartWidth = svgWidth - leftMargin;

  const getXPosition = (date: Date) => {
    const diffTime = date.getTime() - dateRange.start.getTime();
    const days = diffTime / (1000 * 60 * 60 * 24);
    return leftMargin + (days / totalDays) * chartWidth;
  };

  const getWidth = (startDate: Date, endDate: Date) => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const days = diffTime / (1000 * 60 * 60 * 24);
    return Math.max((days / totalDays) * chartWidth, 2); // Minimum 2px pour visibilité
  };

  // Grouper par chantier
  const itemsByChantier = useMemo(() => {
    const grouped: Record<string, GanttItem[]> = {};
    ganttItems.forEach((item) => {
      const key = item.chantierNom || 'Autres';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [ganttItems]);

  const rowHeight = 40;
  const chartHeight = Math.max(300, Object.keys(itemsByChantier).length * rowHeight + 100);

  if (ganttItems.length === 0) {
    return (
      <div className={cn('bg-slate-800/50 rounded-lg border border-slate-700/50 p-8 min-h-[400px] flex items-center justify-center', className)}>
        <div className="text-center space-y-2">
          <div className="text-slate-400 text-sm">Aucune donnée à afficher</div>
          <div className="text-slate-400 text-xs">Ajoutez des jalons ou événements avec des dates</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-slate-800/50 rounded-lg border border-slate-700/50 p-6', className)}>
      <div className="space-y-4">
        {/* Légende */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-slate-400">Jalon normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500"></div>
            <span className="text-slate-400">Jalon à risque</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-slate-400">Jalon en retard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span className="text-slate-400">Événement</span>
          </div>
        </div>

        {/* Graphique Gantt */}
        <div className="relative overflow-x-auto" role="img" aria-label="Diagramme de Gantt des jalons et événements par chantier">
          <svg
            width="100%"
            height={chartHeight}
            className="min-w-full"
            viewBox={`0 0 ${svgWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            {/* Ligne de séparation pour les labels */}
            <line
              x1={leftMargin}
              y1="0"
              x2={leftMargin}
              y2={chartHeight}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
            />

            {/* Grille verticale (semaines) */}
            {Array.from({ length: Math.ceil(totalDays / 7) + 1 }).map((_, weekIndex) => {
              const weekDate = new Date(dateRange.start);
              weekDate.setDate(weekDate.getDate() + weekIndex * 7);
              const x = getXPosition(weekDate);
              return (
                <g key={`week-${weekIndex}`}>
                  <line
                    x1={x}
                    y1={40}
                    x2={x}
                    y2={chartHeight}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={x}
                    y={30}
                    fill="rgb(148, 163, 184)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {weekDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </text>
                </g>
              );
            })}

            {/* Barres Gantt */}
            {Object.entries(itemsByChantier).map(([chantierNom, items], groupIndex) => {
              const yBase = 50 + groupIndex * rowHeight;
              
              return (
                <g key={chantierNom}>
                  {/* Label du chantier */}
                  <text
                    x={leftMargin - 10}
                    y={yBase + rowHeight / 2}
                    fill="rgb(203, 213, 225)"
                    fontSize="12"
                    fontWeight="500"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {chantierNom}
                  </text>

                  {/* Ligne horizontale de séparation */}
                  <line
                    x1={0}
                    y1={yBase + rowHeight}
                    x2={svgWidth}
                    y2={yBase + rowHeight}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                  />

                  {/* Barres pour ce chantier */}
                  {items.map((item, itemIndex) => {
                    const x = getXPosition(item.startDate);
                    const width = getWidth(item.startDate, item.endDate);
                    const itemSpacing = rowHeight / Math.max(items.length, 1);
                    const y = yBase + itemIndex * itemSpacing + 5;
                    const barHeight = Math.max(20, itemSpacing - 10);

                    return (
                      <g key={item.id}>
                        {/* Barre principale */}
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={barHeight}
                          fill={item.color}
                          rx="4"
                          opacity={0.8}
                          className="hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        {/* Label sur la barre */}
                        {width > 30 && (
                          <text
                            x={x + width / 2}
                            y={y + barHeight / 2}
                            fill="white"
                            fontSize="10"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none"
                          >
                            {item.label.length > 20 ? `${item.label.substring(0, 20)}...` : item.label}
                          </text>
                        )}
                        {/* Tooltip */}
                        <title>
                          {item.label}
                          {'\n'}
                          {item.startDate.toLocaleDateString('fr-FR')} - {item.endDate.toLocaleDateString('fr-FR')}
                          {item.isRetard && '\n⚠️ En retard'}
                          {item.isRisque && '\n⚠️ À risque'}
                        </title>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Informations supplémentaires */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
          <span>
            {dateRange.start.toLocaleDateString('fr-FR')} - {dateRange.end.toLocaleDateString('fr-FR')}
          </span>
          <span>
            {ganttItems.length} éléments • {Object.keys(itemsByChantier).length} chantiers
          </span>
        </div>
      </div>
    </div>
  );
}

