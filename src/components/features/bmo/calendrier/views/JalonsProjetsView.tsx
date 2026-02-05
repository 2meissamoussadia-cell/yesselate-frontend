'use client';

/**
 * Jalons Projets - Jalons critiques, en retard, du mois
 * Supporte les vues: gantt, timeline
 */

import React from 'react';
import { Calendar, ExternalLink, GanttChart, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { EmptyState } from '../components/EmptyState';
import { cn } from '@/lib/cn';

interface JalonsProjetsViewProps {
  view?: string | null;
}

export function JalonsProjetsView({ view = 'gantt' }: JalonsProjetsViewProps = {}) {
  const { jalons } = useCalendrierStore();

  // Données mockées
  const jalonsData = jalons.length > 0 ? jalons : [];
  const jalonsCritiques = jalonsData.filter(j => j.impact === 'critique');
  const jalonsEnRetard = jalonsData.filter(j => j.statut === 'en-retard');
  const jalonsDuMois = jalonsData.filter(j => {
    const jalonDate = new Date(j.datePrevue);
    const now = new Date();
    return jalonDate.getMonth() === now.getMonth() && jalonDate.getFullYear() === now.getFullYear();
  });

  const displayView = view || 'gantt';

  // Vue Gantt
  if (displayView === 'gantt') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPIs jalons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-400">Jalons du mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-200">{jalonsDuMois.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-400">% à l'heure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {jalonsDuMois.length > 0
                  ? Math.round((jalonsDuMois.filter(j => j.statut !== 'en-retard').length / jalonsDuMois.length) * 100)
                  : 100}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-400">En retard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">{jalonsEnRetard.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gantt des jalons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <GanttChart className="h-5 w-5" />
              Timeline jalons critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jalonsCritiques.length === 0 ? (
              <EmptyState
                icon={GanttChart}
                title="Aucun jalon critique"
                description="Tous les jalons sont à jour"
              />
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 mb-3">Gantt horizontal des jalons par projet</div>
                {jalonsCritiques.map((jalon) => (
                  <div key={jalon.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-200">{jalon.jalonLabel}</span>
                      <span className="text-slate-400">{jalon.projetLabel}</span>
                    </div>
                    <div className="relative h-8 bg-slate-800/50 rounded border border-slate-700">
                      <div
                        className={cn(
                          'absolute h-full rounded flex items-center justify-center text-xs font-medium',
                          jalon.statut === 'en-retard'
                            ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                            : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                        )}
                        style={{
                          width: '60%',
                          left: '20%',
                        }}
                      >
                        {new Date(jalon.datePrevue).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue Timeline
  if (displayView === 'timeline') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPIs jalons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-400">Jalons du mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-200">{jalonsDuMois.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-400">% à l'heure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {jalonsDuMois.length > 0
                  ? Math.round((jalonsDuMois.filter(j => j.statut !== 'en-retard').length / jalonsDuMois.length) * 100)
                  : 100}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-400">En retard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">{jalonsEnRetard.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline des jalons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline jalons critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jalonsCritiques.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Aucun jalon critique"
                description="Tous les jalons sont à jour"
              />
            ) : (
              <div className="space-y-3">
                {jalonsCritiques.map((jalon, index) => {
                  const jalonDate = new Date(jalon.datePrevue);
                  const now = new Date();
                  const daysDiff = Math.ceil((jalonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={jalon.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:border-slate-600 transition-colors"
                    >
                      <div className={cn(
                        'mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0',
                        jalon.statut === 'en-retard' ? 'bg-red-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-200">{jalon.jalonLabel}</span>
                          <Badge className={cn(
                            jalon.statut === 'en-retard'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          )}>
                            {jalon.statut === 'en-retard' ? 'En retard' : daysDiff > 0 ? `J-${daysDiff}` : 'Aujourd\'hui'}
                          </Badge>
                          {jalon.bloquant && <Badge variant="gray">Bloquant</Badge>}
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Projet: {jalon.projetLabel}</div>
                          <div>Date prévue: {jalonDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </div>
                      </div>
                      {jalon.lienProjet && (
                        <Button size="sm" variant="outline" className="flex-shrink-0">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue par défaut (liste)
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPIs jalons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Jalons du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">{jalonsDuMois.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">% à l'heure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {jalonsDuMois.length > 0
                ? Math.round((jalonsDuMois.filter(j => j.statut !== 'en-retard').length / jalonsDuMois.length) * 100)
                : 100}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">En retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">{jalonsEnRetard.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Jalons critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Jalons critiques</CardTitle>
        </CardHeader>
        <CardContent>
          {jalonsCritiques.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucun jalon critique</p>
          ) : (
            <div className="space-y-3">
              {jalonsCritiques.map((jalon) => (
                <div
                  key={jalon.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-200">{jalon.jalonLabel}</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critique</Badge>
                        {jalon.bloquant && <Badge variant="gray">Bloquant</Badge>}
                      </div>
                      <div className="text-xs text-slate-400">
                        Projet: {jalon.projetLabel} • Date: {new Date(jalon.datePrevue).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {jalon.lienProjet && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir projet
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jalons en retard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Jalons en retard</CardTitle>
        </CardHeader>
        <CardContent>
          {jalonsEnRetard.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucun jalon en retard</p>
          ) : (
            <div className="space-y-3">
              {jalonsEnRetard.map((jalon) => (
                <div
                  key={jalon.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Calendar className="h-5 w-5 text-rose-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200 mb-1">{jalon.jalonLabel}</div>
                      <div className="text-xs text-slate-400">
                        Projet: {jalon.projetLabel} • Date prévue: {new Date(jalon.datePrevue).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {jalon.lienProjet && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

