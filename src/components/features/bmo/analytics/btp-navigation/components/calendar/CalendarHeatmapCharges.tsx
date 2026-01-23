/**
 * Heatmap des Charges
 * Analyse visuelle de la charge et disponibilité des ressources
 */

'use client';

import React from 'react';
import { TrendingUp, X, Users, Calendar, Brain } from 'lucide-react';
import { BTPIntelligentModal } from '../BTPIntelligentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarHeatmapChargesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarHeatmapCharges({ isOpen, onClose }: CalendarHeatmapChargesProps) {
  // Simulation de données de charge
  const heatmapData = [
    { resource: 'Équipe Alpha', day: 'Lun', charge: 85, status: 'high' },
    { resource: 'Équipe Alpha', day: 'Mar', charge: 90, status: 'critical' },
    { resource: 'Équipe Alpha', day: 'Mer', charge: 75, status: 'high' },
    { resource: 'Équipe Beta', day: 'Lun', charge: 60, status: 'medium' },
    { resource: 'Équipe Beta', day: 'Mar', charge: 65, status: 'medium' },
    { resource: 'Équipe Beta', day: 'Mer', charge: 70, status: 'medium' },
  ];

  const getChargeColor = (charge: number) => {
    if (charge >= 90) return 'bg-rose-500';
    if (charge >= 75) return 'bg-amber-500';
    if (charge >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Heatmap des Charges"
      description="Analyse visuelle de la charge et disponibilité des ressources - Planification intelligente IA"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-slate-400">Analyse IA - Charge & Disponibilité</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
          <div className="space-y-3">
            <div className="grid grid-cols-8 gap-2 text-xs text-slate-400 mb-2">
              <div></div>
              <div className="text-center">Lun</div>
              <div className="text-center">Mar</div>
              <div className="text-center">Mer</div>
              <div className="text-center">Jeu</div>
              <div className="text-center">Ven</div>
              <div className="text-center">Sam</div>
              <div className="text-center">Dim</div>
            </div>
            
            {['Équipe Alpha', 'Équipe Beta', 'Équipe Gamma'].map((resource) => (
              <div key={resource} className="grid grid-cols-8 gap-2 items-center">
                <div className="text-sm text-slate-300 font-medium">{resource}</div>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => {
                  const data = heatmapData.find(d => d.resource === resource && d.day === day);
                  const charge = data?.charge || Math.floor(Math.random() * 100);
                  return (
                    <div
                      key={day}
                      className={`h-10 rounded flex items-center justify-center text-xs font-medium text-slate-900 ${getChargeColor(charge)}`}
                      title={`${charge}% de charge`}
                    >
                      {charge}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span>&lt; 50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>50-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span>75-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-rose-500" />
            <span>&gt; 90%</span>
          </div>
        </div>

        {/* Recommandations IA */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-400 mb-1">Recommandations IA</div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Équipe Alpha surchargée mardi - suggérer décalage de 2 tâches</li>
                <li>• Équipe Beta disponible jeudi - opportunité de réallocation</li>
                <li>• Créneaux optimaux détectés : mercredi après-midi, vendredi matin</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button variant="default" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="default" size="sm">
            Appliquer Optimisations
          </Button>
        </div>
      </div>
    </BTPIntelligentModal>
  );
}

