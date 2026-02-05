'use client';

/**
 * Vue d'ensemble - Onglet principal du module Calendrier
 * KPIs, alertes, calendrier mensuel, actions rapides
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { CalendrierInteractif } from '../components/CalendrierInteractif';
import { CreerEvenementModal } from '../modals/CreerEvenementModal';
import {
  CalendrierQuickActions,
  CalendrierAlertsBanner,
  type CalendrierAlert,
} from '../command-center';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import type { CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';

interface VueEnsembleViewProps {
  section?: CalendrierSection;
  view?: CalendrierView;
}

export function VueEnsembleView({ section = 'global', view = 'gantt' }: VueEnsembleViewProps = {}) {
  const { kpis, echeances, periodeCalendrier, setPeriodeCalendrier, statutsSynchronisation, openModal } = useCalendrierStore();
  const { navigateTo } = usePageNavigation('calendrier');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | undefined>();
  
  // Déterminer le type de vue à afficher
  const displayView = view || 'gantt';
  const displaySection = section || 'global';

  // Données mockées (à remplacer par des appels API réels)
  const kpisData = kpis || {
    evenementsAujourdhui: 12,
    evenementsCetteSemaine: 45,
    retardsSLA: 3,
    conflitsActifs: 2,
    evenementsTerminesAujourdhui: 8,
    totalEvenementsCeMois: 156,
  };

  // Alertes spécifiques au Calendrier (4 types selon spécifications)
  const alerts: CalendrierAlert[] = useMemo(() => {
    const alertsList: CalendrierAlert[] = [];

    // 1. Jalons SLA à risque (J-7)
    if (kpisData.retardsSLA > 0) {
      alertsList.push({
        id: 'sla-risk',
        type: 'sla-risk',
        title: 'Jalons SLA à risque',
        description: `${kpisData.retardsSLA} jalons SLA en retard ou à risque (J-7)`,
        count: kpisData.retardsSLA,
        actionLabel: 'Voir dans Contrats',
        actionUrl: '/maitre-ouvrage/validation-contrats',
        severity: 'warning',
      });
    }

    // 2. Retards détectés
    if (kpisData.retardsSLA > 0) {
      alertsList.push({
        id: 'retards',
        type: 'retard',
        title: 'Retards détectés',
        description: `${kpisData.retardsSLA} tâches/jalons en retard`,
        count: kpisData.retardsSLA,
        actionLabel: 'Voir dans Gestion Chantiers',
        actionUrl: '/maitre-ouvrage/projets-en-cours',
        severity: 'critical',
      });
    }

    // 3. Sur-allocation ressources (si 2+ absences critiques)
    if (kpisData.conflitsActifs > 0) {
      alertsList.push({
        id: 'sur-allocation',
        type: 'sur-allocation',
        title: 'Sur-allocation ressources',
        description: `${kpisData.conflitsActifs} conflit(s) de sur-allocation détecté(s)`,
        count: kpisData.conflitsActifs,
        actionLabel: 'Voir dans Ressources',
        actionUrl: '/maitre-ouvrage/employes',
        severity: 'warning',
      });
    }

    // 4. Réunion critique manquée (mock - à remplacer par données réelles)
    // TODO: Récupérer depuis les données réelles
    const reunionsManquees = 0; // À remplacer par données réelles
    if (reunionsManquees > 0) {
      alertsList.push({
        id: 'reunion-manquee',
        type: 'reunion-manquee',
        title: 'Réunion critique manquée',
        description: `${reunionsManquees} réunion(s) critique(s) manquée(s)`,
        count: reunionsManquees,
        actionLabel: 'Voir dans Gouvernance',
        actionUrl: '/maitre-ouvrage/governance',
        severity: 'critical',
      });
    }

    return alertsList;
  }, [kpisData]);

  // Handlers pour les actions rapides
  const handleCreateEvent = () => {
    setCreateModalDate(undefined);
    setShowCreateModal(true);
  };

  const handleAddAbsence = () => {
    navigateTo('employes', { tab: 'absences' });
  };

  const handleLinkToChantier = () => {
    navigateTo('projets-en-cours');
  };

  const handleExport = () => {
    openModal('export', {
      domain: 'overview',
      section,
      period: periodeCalendrier === 'mois' ? 'month' : periodeCalendrier === 'semaine' ? 'week' : 'quarter',
    });
  };

  const handleActivateAlert = () => {
    openModal('alert-config');
  };

  const handleAlertAction = (alert: CalendrierAlert) => {
    window.location.href = alert.actionUrl;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Note: Les KPIs sont affichés dans CalendrierKPIBar (bandeau supérieur) */}
      {/* Cette section peut être utilisée pour des KPIs supplémentaires si nécessaire */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes nécessitant attention */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">Alertes nécessitant attention</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <CalendrierAlertsBanner
                alerts={alerts}
                onAction={handleAlertAction}
              />
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Aucune alerte critique
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendrierQuickActions
              onCreateEvent={handleCreateEvent}
              onAddAbsence={handleAddAbsence}
              onLinkToChantier={handleLinkToChantier}
              onExport={handleExport}
              onActivateAlert={handleActivateAlert}
            />
          </CardContent>
        </Card>
      </div>

      {/* Poste de contrôle Calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Poste de contrôle Calendrier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statutsSynchronisation.length > 0 ? (
              statutsSynchronisation.map((statut) => (
                <div key={statut.module} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      statut.etat === 'synchronise'
                        ? 'bg-emerald-500'
                        : statut.etat === 'en-cours'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-red-500'
                    )}
                  />
                  <span className="text-sm text-slate-400 capitalize">
                    {statut.module.replace(/-/g, ' ')}
                  </span>
                  <Badge
                    variant="gray"
                    className={cn(
                      'ml-auto text-xs',
                      statut.etat === 'synchronise'
                        ? 'border-emerald-500/30 text-emerald-400'
                        : statut.etat === 'en-cours'
                        ? 'border-amber-500/30 text-amber-400'
                        : 'border-red-500/30 text-red-400'
                    )}
                  >
                    {statut.etat === 'synchronise'
                      ? 'Synchronisé'
                      : statut.etat === 'en-cours'
                      ? 'En cours...'
                      : 'Erreur'}
                  </Badge>
                </div>
              ))
            ) : (
              // Fallback avec modules par défaut
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-400">Demandes</span>
                  <Badge variant="gray" className="ml-auto">Synchronisé</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-400">Validations</span>
                  <Badge variant="gray" className="ml-auto">Synchronisé</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-400">Projets</span>
                  <Badge variant="gray" className="ml-auto">Synchronisé</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-400">RH</span>
                  <Badge variant="gray" className="ml-auto">Synchronisé</Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vue principale selon le type sélectionné */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">
            {displayView === 'gantt' && 'Vue Gantt multi-chantiers'}
            {displayView === 'calendar' && 'Calendrier mensuel'}
            {displayView === 'timeline' && 'Timeline des événements'}
            {!displayView && 'Vue mensuelle'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayView === 'gantt' ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-sm text-slate-400 mb-3">Gantt multi-chantiers (placeholder)</div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-32 text-xs text-slate-400">Chantier {i + 1}</div>
                      <div className="flex-1 h-6 bg-slate-700 rounded relative">
                        <div 
                          className="absolute h-full bg-blue-500 rounded"
                          style={{ width: `${60 + i * 10}%`, left: `${i * 5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  Idée : barres par chantier/lot + jalons critiques + surbrillance des conflits
                </div>
              </div>
            </div>
          ) : displayView === 'timeline' ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-sm text-slate-400 mb-3">Timeline des événements (placeholder)</div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-400 mb-1">J-{7 - i}</div>
                        <div className="text-sm font-medium text-slate-200">Événement / jalon #{i + 1}</div>
                        <div className="text-xs text-slate-400 mt-1">Détail + action + lien</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  Idée : tri + regroupement + priorisation (SLA, jalons, réunions)
                </div>
              </div>
            </div>
          ) : (
            <CalendrierInteractif
              echeances={echeances}
              periode={periodeCalendrier}
              onPeriodeChange={setPeriodeCalendrier}
              onDateClick={(date) => {
                setCreateModalDate(date);
                setShowCreateModal(true);
              }}
              onEventClick={(echeance) => {
                if (echeance.lienModule) {
                  window.location.href = echeance.lienModule;
                }
              }}
              onCreateEvent={(date) => {
                setCreateModalDate(date);
                setShowCreateModal(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Modale création événement */}
      <CreerEvenementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        dateInitiale={createModalDate}
        onSave={async (data) => {
          try {
            const res = await fetch('/api/calendar/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error();
          } catch {
            logger.debug('Événement créé (local)', { component: 'VueEnsembleView', data });
          }
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

