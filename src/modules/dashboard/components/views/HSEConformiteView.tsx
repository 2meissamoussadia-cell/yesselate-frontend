/**
 * Vue HSE & Conformité — sous-menu PILOTAGE.
 * ErrorBoundary + Suspense + contenu complet (KPIs, conformité documentaire).
 * Phase 3 audit ERP BTP 2026.
 */

'use client';

import React, { memo, Suspense } from 'react';
import { PlusCircle, ShieldCheck, AlertCircle, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardErrorBoundary } from '../shared/DashboardErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

function HSELoadingSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 bg-slate-800" />
        <Skeleton className="h-10 w-40 bg-slate-800" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 bg-slate-800 rounded-xl" />
    </div>
  );
}

function HSEContent() {
  const accidents = { avecArret: 0, benins: 3, presquAccidents: 7 };

  const conformiteRows = [
    { chantier: '#042', doc: 'PPSPS', expire: '2026-03-15', statut: 'valide' as const },
    { chantier: '#038', doc: 'PPSPS', expire: null, statut: 'manquant' as const },
    { chantier: 'Général', doc: 'Document unique', expire: '2026-02-01', statut: 'a_renouveler' as const },
    { chantier: 'Général', doc: 'Plan de prévention', expire: '2026-06-30', statut: 'valide' as const },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <h1 className="sr-only">HSE & Conformité</h1>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">HSE & Conformité</h2>
          <p className="text-slate-400 mt-1">
            Hygiène, Sécurité, Environnement — Obligation légale BTP
          </p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white min-h-[44px] min-w-[44px]" aria-label="Déclarer un incident HSE">
          <PlusCircle className="w-4 h-4 mr-2" aria-hidden />
          Déclarer un incident
        </Button>
      </div>

      {/* KPIs HSE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Accidents avec arrêt</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{accidents.avecArret}</p>
                <p className="text-xs text-slate-400 mt-1">30 derniers jours</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Incidents bénins</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{accidents.benins}</p>
                <p className="text-xs text-slate-400 mt-1">30 derniers jours</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Taux de fréquence (TF)</p>
                <p className="text-3xl font-bold text-sky-400 mt-1">2.4</p>
                <p className="text-xs text-green-400 mt-1">✓ Objectif &lt; 10</p>
              </div>
              <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <TrendingDown className="w-6 h-6 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Taux de gravité (TG)</p>
                <p className="text-3xl font-bold text-sky-400 mt-1">0.08</p>
                <p className="text-xs text-slate-400 mt-1">Secteur BTP: 0.15</p>
              </div>
              <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <Activity className="w-6 h-6 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conformité documentaire */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Conformité documentaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conformiteRows.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {item.chantier}
                    </Badge>
                    <span className="font-semibold text-slate-100">{item.doc}</span>
                  </div>
                  {item.expire && (
                    <p className="text-sm text-slate-400">
                      Expire le {new Date(item.expire).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <div>
                  {item.statut === 'valide' && (
                    <Badge className="bg-green-500/20 text-green-400 border-0">✓ Valide</Badge>
                  )}
                  {item.statut === 'a_renouveler' && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-0">À renouveler</Badge>
                  )}
                  {item.statut === 'manquant' && (
                    <Badge className="bg-red-500/20 text-red-400 border-0">Manquant</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const HSEConformiteView = memo(function HSEConformiteView() {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<HSELoadingSkeleton />}>
        <HSEContent />
      </Suspense>
    </DashboardErrorBoundary>
  );
});
