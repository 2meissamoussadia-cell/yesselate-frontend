'use client';

/**
 * Instances & Réunions - Conférences, réunions projet, instances de crise
 */

import React from 'react';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';

interface InstancesReunionsViewProps {
  filterType?: 'instances' | 'reunions';
  view?: string | null;
}

export function InstancesReunionsView({ filterType, view }: InstancesReunionsViewProps = {}) {
  const { instances } = useCalendrierStore();

  // Données mockées
  const instancesData = instances.length > 0 ? instances : [];
  const instancesCritiques = instancesData.filter(i => i.critique);
  const instancesEnRetard = instancesData.filter(i => i.statut === 'en-retard');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Réunions du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">
              {instancesData.filter(i => {
                const today = new Date().toISOString().split('T')[0];
                return i.date.startsWith(today);
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Instances en retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">{instancesEnRetard.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conférences critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Conférences critiques</CardTitle>
        </CardHeader>
        <CardContent>
          {instancesCritiques.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune conférence critique</p>
          ) : (
            <div className="space-y-3">
              {instancesCritiques.map((instance) => (
                <div
                  key={instance.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <CalendarDays className="h-5 w-5 text-cyan-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-200">{instance.titre}</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critique</Badge>
                        <Badge variant="gray">{instance.type}</Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(instance.date).toLocaleString('fr-FR')} • {instance.moduleSource}
                      </div>
                    </div>
                  </div>
                  {instance.lienModule && (
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

      {/* Instances en retard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Instances en retard</CardTitle>
        </CardHeader>
        <CardContent>
          {instancesEnRetard.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune instance en retard</p>
          ) : (
            <div className="space-y-3">
              {instancesEnRetard.map((instance) => (
                <div
                  key={instance.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <CalendarDays className="h-5 w-5 text-rose-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200 mb-1">{instance.titre}</div>
                      <div className="text-xs text-slate-400">
                        Date prévue: {new Date(instance.date).toLocaleString('fr-FR')} • {instance.moduleSource}
                      </div>
                    </div>
                  </div>
                  {instance.lienModule && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Replanifier
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

