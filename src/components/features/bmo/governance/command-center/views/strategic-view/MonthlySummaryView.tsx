/**
 * Vue stratégique > Synthèse mensuelle
 * Rapport mensuel synthétique, Tableau comparatif avec période précédente, Points d'attention majeurs, Export/partage DG
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Share2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export function MonthlySummaryView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-200">Synthèse mensuelle</h2>
          <p className="text-sm text-slate-400 mt-1">
            Rapport mensuel synthétique, comparaison période précédente, points d'attention majeurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
            <Share2 className="h-4 w-4 mr-2" />
            Partager DG
          </Button>
        </div>
      </div>

      {/* Période */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Période</h3>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-slate-400">Période actuelle</p>
            <p className="text-base font-medium text-slate-200">Janvier 2025</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <p className="text-sm text-slate-400">Période précédente</p>
            <p className="text-base font-medium text-slate-200">Décembre 2024</p>
          </div>
        </div>
      </div>

      {/* Tableau comparatif */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Tableau comparatif</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-sm font-medium text-slate-400">Indicateur</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-slate-400">Jan 2025</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-slate-400">Déc 2024</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-slate-400">Évolution</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Projets actifs', current: '24', previous: '22', evolution: '+2', trend: 'up' },
                { label: 'Budget consommé', current: '67%', previous: '70%', evolution: '-3%', trend: 'down' },
                { label: 'Jalons respectés', current: '90%', previous: '88%', evolution: '+2%', trend: 'up' },
                { label: 'Risques critiques', current: '3', previous: '5', evolution: '-2', trend: 'down' },
                { label: 'Validations en attente', current: '12', previous: '15', evolution: '-3', trend: 'down' },
              ].map((row) => (
                <tr key={row.label} className="border-b border-slate-800/50">
                  <td className="py-2 px-3 text-sm text-slate-300">{row.label}</td>
                  <td className="py-2 px-3 text-sm text-right text-slate-200 font-medium">{row.current}</td>
                  <td className="py-2 px-3 text-sm text-right text-slate-400">{row.previous}</td>
                  <td className="py-2 px-3 text-sm text-right">
                    <div className={cn(
                      'flex items-center justify-end gap-1',
                      row.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {row.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {row.evolution}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points d'attention majeurs */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-200">Points d'attention majeurs</h3>
        </div>
        <div className="space-y-3">
          {[
            { id: '1', title: 'Dépassement budget lot 4 - Projet Alpha', impact: '450K€', priority: 'critical' },
            { id: '2', title: 'Retard validation BC bloquant', impact: '1.2M€', priority: 'critical' },
            { id: '3', title: 'Ressource critique indisponible', impact: 'Jalon J5', priority: 'high' },
            { id: '4', title: 'Escalade niveau 3 en cours', impact: 'Résolution urgente', priority: 'high' },
          ].map((point) => (
            <div
              key={point.id}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700/30"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{point.title}</p>
                <p className="text-xs text-slate-400 mt-1">Impact: {point.impact}</p>
              </div>
              <Badge
                variant={point.priority === 'critical' ? 'destructive' : 'warning'}
                className="ml-4"
              >
                {point.priority === 'critical' ? 'Critique' : 'Élevé'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

