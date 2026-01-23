'use client';

/**
 * SLA & Retards - Liste des SLA et retards
 */

import React, { useState } from 'react';
import { Clock, ExternalLink, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { cn } from '@/lib/utils';
import { EmptyState } from '../components/EmptyState';
import type { SLA } from '@/lib/types/calendrier.types';
import { TraiterSLAModal } from '../modals/TraiterSLAModal';
import { ReplanifierModal } from '../modals/ReplanifierModal';

interface SLARetardsViewProps {
  filterType?: 'alerts' | 'retards';
  view?: string | null;
}

export function SLARetardsView({ filterType, view }: SLARetardsViewProps = {}) {
  const { slas } = useCalendrierStore();
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null);
  const [showTraiterModal, setShowTraiterModal] = useState(false);
  const [showReplanifierModal, setShowReplanifierModal] = useState(false);

  // Données mockées (à remplacer par des appels API réels)
  const slasData: SLA[] = slas.length > 0 ? slas : [
    {
      id: '1',
      type: 'validation-bc',
      moduleSource: 'validation-bc',
      elementId: 'bc-123',
      elementLabel: 'Validation BC #123',
      echeancePrevue: '2025-01-15T10:00:00Z',
      echeanceReelle: undefined,
      retard: 2,
      impact: 'critique',
      statut: 'en-retard',
      responsable: 'Jean Dupont',
      bureau: 'BMO',
      lienModule: '/maitre-ouvrage/validation-bc?bc=123',
    },
    {
      id: '2',
      type: 'demande',
      moduleSource: 'demandes',
      elementId: 'dem-456',
      elementLabel: 'Demande #456',
      echeancePrevue: '2025-01-16T14:00:00Z',
      echeanceReelle: undefined,
      retard: 1,
      impact: 'majeur',
      statut: 'en-retard',
      responsable: 'Marie Martin',
      bureau: 'BF',
      lienModule: '/maitre-ouvrage/demandes?demande=456',
    },
  ];

  const slasEnRetard = slasData.filter(sla => sla.statut === 'en-retard');
  const slasAujourdhui = slasData.filter(sla => {
    const today = new Date().toISOString().split('T')[0];
    return sla.echeancePrevue.startsWith(today);
  });
  const slasEnRisque = slasData.filter(sla => sla.statut === 'en-risque');

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en-retard':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">En retard</Badge>;
      case 'en-risque':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">En risque</Badge>;
      case 'a-jour':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">À jour</Badge>;
      default:
        return <Badge variant="gray">{statut}</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critique':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critique</Badge>;
      case 'majeur':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Majeur</Badge>;
      case 'mineur':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Mineur</Badge>;
      default:
        return <Badge variant="gray">{impact}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPIs SLA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">SLA du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">{slasAujourdhui.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">SLA en retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">{slasEnRetard.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">SLA critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {slasData.filter(s => s.impact === 'critique').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">% SLA respectés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {slasData.length > 0
                ? Math.round((slasData.filter(s => s.statut === 'a-jour').length / slasData.length) * 100)
                : 100}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des éléments en retard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Éléments en retard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slasEnRetard.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Aucun élément en retard"
                description={filterType === 'alerts' ? 'Tous les SLA sont à jour' : 'Aucun retard détecté'}
              />
            ) : (
              slasEnRetard.map((sla) => (
                <div
                  key={sla.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Clock className="h-5 w-5 text-rose-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-200">{sla.elementLabel}</span>
                        {getStatutBadge(sla.statut)}
                        {getImpactBadge(sla.impact)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>{sla.moduleSource}</span>
                        <span>•</span>
                        <span>Retard: {sla.retard} jour{sla.retard && sla.retard > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>Responsable: {sla.responsable || 'Non assigné'}</span>
                        {sla.bureau && (
                          <>
                            <span>•</span>
                            <span>Bureau: {sla.bureau}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedSLA(sla);
                        setShowTraiterModal(true);
                      }}
                    >
                      Traiter
                    </Button>
                    {sla.lienModule && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.location.href = sla.lienModule!;
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ouvrir
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des SLA à traiter aujourd'hui */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">SLA à traiter aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slasAujourdhui.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Aucun SLA à traiter aujourd'hui</p>
            ) : (
              slasAujourdhui.map((sla) => (
                <div
                  key={sla.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-200">{sla.elementLabel}</span>
                        {getStatutBadge(sla.statut)}
                        {getImpactBadge(sla.impact)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {sla.moduleSource} • Échéance: {new Date(sla.echeancePrevue).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {sla.lienModule && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.location.href = sla.lienModule!;
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Traiter
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {selectedSLA && (
        <>
          <TraiterSLAModal
            isOpen={showTraiterModal}
            onClose={() => {
              setShowTraiterModal(false);
              setSelectedSLA(null);
            }}
            sla={selectedSLA}
            onSave={(data) => {
              // TODO: Appeler API pour traiter le SLA
              console.log('Traitement SLA:', data);
              setShowTraiterModal(false);
              setSelectedSLA(null);
            }}
          />
          <ReplanifierModal
            isOpen={showReplanifierModal}
            onClose={() => {
              setShowReplanifierModal(false);
              setSelectedSLA(null);
            }}
            elementLabel={selectedSLA.elementLabel}
            dateActuelle={selectedSLA.echeancePrevue}
            onSave={(data) => {
              // TODO: Appeler API pour replanifier
              console.log('Replanification:', data);
              setShowReplanifierModal(false);
              setSelectedSLA(null);
            }}
          />
        </>
      )}
    </div>
  );
}

