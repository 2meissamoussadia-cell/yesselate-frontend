'use client';

/**
 * Échéances opérationnelles - Liste et calendrier des échéances
 */

import React, { useState } from 'react';
import { CheckCircle2, Calendar as CalendarIcon, List, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { CalendrierInteractif } from '../components/CalendrierInteractif';
import { FiltresAvances } from '../components/FiltresAvances';

export function EcheancesOperationnellesView() {
  const { echeances, vueCalendrier, setVueCalendrier, periodeCalendrier, setPeriodeCalendrier } = useCalendrierStore();
  const [showFiltres, setShowFiltres] = useState(false);

  // Données mockées
  const echeancesData = echeances.length > 0 ? echeances : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Boutons de vue */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">Échéances opérationnelles</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showFiltres ? 'default' : 'outline'}
            onClick={() => setShowFiltres(!showFiltres)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button
            size="sm"
            variant={vueCalendrier === 'liste' ? 'default' : 'outline'}
            onClick={() => setVueCalendrier('liste')}
          >
            <List className="h-4 w-4 mr-2" />
            Liste
          </Button>
          <Button
            size="sm"
            variant={vueCalendrier === 'calendrier' ? 'default' : 'outline'}
            onClick={() => setVueCalendrier('calendrier')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendrier
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {showFiltres && (
        <FiltresAvances onClose={() => setShowFiltres(false)} />
      )}

      {vueCalendrier === 'liste' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">Liste des échéances</CardTitle>
          </CardHeader>
          <CardContent>
            {echeancesData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Aucune échéance</p>
            ) : (
              <div className="space-y-3">
                {echeancesData.map((echeance) => (
                  <div
                    key={echeance.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-200">{echeance.elementLabel}</span>
                          <Badge variant="gray">{echeance.type}</Badge>
                          <Badge variant="gray">{echeance.statut}</Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          {echeance.moduleSource} • {new Date(echeance.date).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    {echeance.lienModule && (
                      <Button size="sm" variant="outline">
                        Ouvrir
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <CalendrierInteractif
          echeances={echeancesData}
          periode={periodeCalendrier}
          onPeriodeChange={setPeriodeCalendrier}
          onDateClick={(date) => {
            // TODO: Gérer le clic sur une date
            console.log('Date cliquée:', date);
          }}
          onEventClick={(echeance) => {
            // TODO: Ouvrir le détail de l'échéance
            if (echeance.lienModule) {
              window.location.href = echeance.lienModule;
            }
          }}
          onCreateEvent={(date) => {
            // TODO: Ouvrir modal création événement
            console.log('Créer événement pour:', date);
          }}
        />
      )}
    </div>
  );
}

