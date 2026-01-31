/**
 * Vue Analytics & rapports — sous-menu PILOTAGE.
 * Rapports, tableaux de bord, export, tendances, métriques de performance.
 * Audit ERP BTP 2026 : période, rapports disponibles, métriques.
 */

'use client';

import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type PeriodeKey = '7j' | '30j' | '90j' | '12m';

interface RapportDisponible {
  id: number;
  titre: string;
  type: string;
  date: string;
  pages: number;
  format: string;
  statut: string;
}

interface MetriquePerformance {
  id: string;
  label: string;
  valeur: string | number;
  evolution: number;
  unite?: string;
}

const RAPPORTS_DISPONIBLES: RapportDisponible[] = [
  {
    id: 1,
    titre: 'Rapport mensuel - Janvier 2026',
    type: 'Mensuel',
    date: '2026-01-31',
    pages: 24,
    format: 'PDF',
    statut: 'Prêt',
  },
  {
    id: 2,
    titre: 'Analyse financière Q4 2025',
    type: 'Trimestriel',
    date: '2026-01-15',
    pages: 45,
    format: 'PDF + Excel',
    statut: 'Prêt',
  },
  {
    id: 3,
    titre: 'KPIs opérationnels - Semaine 4',
    type: 'Hebdomadaire',
    date: '2026-01-28',
    pages: 8,
    format: 'PDF',
    statut: 'Prêt',
  },
  {
    id: 4,
    titre: 'Bilan HSE 2025',
    type: 'Annuel',
    date: '2026-01-10',
    pages: 67,
    format: 'PDF',
    statut: 'Prêt',
  },
];

const METRIQUES_PERFORMANCE: MetriquePerformance[] = [
  { id: 'ca', label: 'Chiffre d\'affaires', valeur: '2,4 Mds', evolution: 12.3, unite: 'XOF' },
  { id: 'delais', label: 'Délai moyen livraison', valeur: '18 j', evolution: -5.2, unite: 'jours' },
  { id: 'qualite', label: 'Score qualité', valeur: '87%', evolution: 2.1 },
  { id: 'tresorerie', label: 'Trésorerie nette', valeur: '420 M', evolution: 8.0, unite: 'XOF' },
];

export const AnalyticsReportsView = memo(function AnalyticsReportsView() {
  const [periodeSelected, setPeriodeSelected] = useState<PeriodeKey>('30j');

  const periodes: { key: PeriodeKey; label: string }[] = [
    { key: '7j', label: '7 jours' },
    { key: '30j', label: '30 jours' },
    { key: '90j', label: '90 jours' },
    { key: '12m', label: '12 mois' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <h1 className="sr-only">Analytics & Rapports</h1>
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Analytics & Rapports</h2>
          <p className="text-slate-400 mt-1">Rapports, tendances et métriques de performance</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white min-h-[44px]" aria-label="Générer un rapport">
          <FileText className="w-4 h-4 mr-2" aria-hidden />
          Générer un rapport
        </Button>
      </div>

      {/* Sélecteur de période */}
      <div className="flex flex-wrap gap-2">
        {periodes.map((p) => (
          <Button
            key={p.key}
            size="sm"
            variant={periodeSelected === p.key ? 'default' : 'outline'}
            onClick={() => setPeriodeSelected(p.key)}
            aria-label={`Période : ${p.label}`}
            className={`min-h-[44px] ${
              periodeSelected === p.key
                ? 'bg-violet-600 hover:bg-violet-700'
                : 'border-slate-600 text-slate-300'
            }`}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Métriques de performance */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Métriques de performance</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRIQUES_PERFORMANCE.map((m) => (
            <Card key={m.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-slate-400 text-sm truncate">{m.label}</p>
                    <p className="text-2xl font-bold text-slate-100 mt-1">{m.valeur}</p>
                    <p
                      className={cn(
                        'text-xs font-medium mt-1',
                        m.evolution >= 0 ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {m.evolution >= 0 ? '+' : ''}
                      {m.evolution}% vs période précédente
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp
                      className={cn('w-5 h-5', m.evolution >= 0 ? 'text-green-400' : 'text-red-400')}
                      aria-hidden
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rapports disponibles */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Rapports disponibles</CardTitle>
          <p className="text-sm text-slate-400">Téléchargez les rapports générés</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RAPPORTS_DISPONIBLES.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-violet-400" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-slate-100 font-semibold truncate">{r.titre}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{r.type}</span>
                      <span>•</span>
                      <span>{r.pages} pages</span>
                      <span>•</span>
                      <span>{r.format}</span>
                      <span>•</span>
                      <span
                        className={
                          r.statut === 'Prêt'
                            ? 'text-green-400 font-medium'
                            : 'text-amber-400'
                        }
                      >
                        {r.statut}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">
                    {new Date(r.date).toLocaleDateString('fr-FR')}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px] border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    aria-label={`Télécharger ${r.titre}`}
                  >
                    <Download className="w-4 h-4 mr-1" aria-hidden />
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accès rapide */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" aria-hidden />
            Accès rapide
          </CardTitle>
          <p className="text-sm text-slate-400">Rapports par périmètre</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              aria-label="Ouvrir le rapport DG"
              className="min-h-[44px] border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
            >
              Rapport DG
            </Button>
            <Button
              variant="outline"
              aria-label="Rapport chantiers"
              className="min-h-[44px] border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
            >
              Chantiers
            </Button>
            <Button
              variant="outline"
              aria-label="Rapport trésorerie"
              className="min-h-[44px] border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
            >
              Trésorerie
            </Button>
            <Button
              variant="outline"
              aria-label="Rapport validations"
              className="min-h-[44px] border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
            >
              Validations
            </Button>
            <Button
              variant="outline"
              aria-label="Rapport HSE"
              className="min-h-[44px] border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
            >
              HSE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
