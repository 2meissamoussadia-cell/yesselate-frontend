/**
 * Vue Calendrier & échéances — sous-menu PILOTAGE.
 * Suivi des dates clés et deadlines du portefeuille.
 * Audit ERP BTP 2026 : KPIs, filtres par type, liste avec actions (marquer complété, reporter).
 */

'use client';

import React, { memo, useState } from 'react';
import { Calendar as CalendarIcon, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EcheanceType = 'livraison' | 'paiement' | 'administratif' | 'reunion' | 'hse';
type EcheanceStatut = 'a_venir' | 'en_retard' | 'complete';

interface Echeance {
  id: string;
  titre: string;
  type: EcheanceType;
  date: string;
  priorite: string;
  statut: EcheanceStatut;
  chantier?: string;
  montant?: number;
}

const MOCK_ECHEANCES: Echeance[] = [
  {
    id: 'ECH-001',
    titre: 'Livraison matériel chantier #042',
    type: 'livraison',
    date: '2026-01-28',
    priorite: 'haute',
    statut: 'en_retard',
    chantier: '#042',
  },
  {
    id: 'ECH-002',
    titre: 'Paiement fournisseur ABC',
    type: 'paiement',
    date: '2026-01-30',
    priorite: 'haute',
    statut: 'a_venir',
    montant: 2500000,
  },
  {
    id: 'ECH-003',
    titre: 'Rapport HSE mensuel',
    type: 'hse',
    date: '2026-02-01',
    priorite: 'moyenne',
    statut: 'a_venir',
  },
  {
    id: 'ECH-004',
    titre: 'Dépôt permis chantier Z',
    type: 'administratif',
    date: '2026-02-03',
    priorite: 'moyenne',
    statut: 'a_venir',
  },
  {
    id: 'ECH-005',
    titre: 'Comité de pilotage mensuel',
    type: 'reunion',
    date: '2026-02-05',
    priorite: 'moyenne',
    statut: 'a_venir',
  },
  {
    id: 'ECH-006',
    titre: 'Paiement salaires équipe',
    type: 'paiement',
    date: '2026-02-28',
    priorite: 'haute',
    statut: 'a_venir',
    montant: 8500000,
  },
];

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    livraison: '📦',
    paiement: '💰',
    administratif: '📄',
    reunion: '👥',
    hse: '⚠️',
  };
  return icons[type] ?? '📌';
}

function getTypeBadge(type: string): string {
  const colors: Record<string, string> = {
    livraison: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    paiement: 'bg-green-500/20 text-green-400 border-green-500/50',
    administratif: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    reunion: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    hse: 'bg-red-500/20 text-red-400 border-red-500/50',
  };
  return colors[type] ?? colors.administratif;
}

function getStatutBadge(statut: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    a_venir: { label: 'À venir', color: 'bg-blue-500/20 text-blue-400' },
    en_retard: { label: 'En retard', color: 'bg-red-500/20 text-red-400' },
    complete: { label: 'Complété', color: 'bg-green-500/20 text-green-400' },
  };
  return badges[statut] ?? badges.a_venir;
}

export const CalendrierEcheancesView = memo(function CalendrierEcheancesView() {
  const [echeances, setEcheances] = useState<Echeance[]>(MOCK_ECHEANCES);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEcheances =
    filterType === 'all'
      ? echeances
      : echeances.filter((e) => e.type === filterType);

  const echeancesEnRetard = echeances.filter((e) => e.statut === 'en_retard').length;
  const echeancesProchaines7j = echeances.filter((e) => {
    const diff = new Date(e.date).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const echeancesCompletees30j = 24; // mock
  const totalAVenir = echeances.filter((e) => e.statut === 'a_venir').length;

  const handleMarquerComplete = (id: string) => {
    setEcheances((prev) =>
      prev.map((e) => (e.id === id ? { ...e, statut: 'complete' as EcheanceStatut } : e))
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden">
      <h1 className="sr-only">Calendrier & Échéances</h1>
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Calendrier & Échéances</h2>
          <p className="text-slate-400 mt-1">Suivi des dates clés et deadlines du portefeuille</p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white min-h-[44px]" aria-label="Ajouter une échéance">
          <CalendarIcon className="w-4 h-4 mr-2" aria-hidden />
          Ajouter échéance
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">En retard</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{echeancesEnRetard}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Prochains 7 jours</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{echeancesProchaines7j}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Complétées (30j)</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{echeancesCompletees30j}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total à venir</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{totalAVenir}</p>
              </div>
              <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center" aria-hidden>
                <CalendarIcon className="w-6 h-6 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
          aria-label={`Filtrer : Toutes (${echeances.length})`}
          className={`min-h-[44px] ${filterType === 'all' ? 'bg-sky-600 hover:bg-sky-700' : 'border-slate-600'}`}
        >
          Toutes ({echeances.length})
        </Button>
        <Button
          size="sm"
          variant={filterType === 'paiement' ? 'default' : 'outline'}
          onClick={() => setFilterType('paiement')}
          aria-label="Filtrer : Paiements"
          className={`min-h-[44px] ${filterType === 'paiement' ? 'bg-sky-600 hover:bg-sky-700' : 'border-slate-600'}`}
        >
          💰 Paiements
        </Button>
        <Button
          size="sm"
          variant={filterType === 'livraison' ? 'default' : 'outline'}
          onClick={() => setFilterType('livraison')}
          aria-label="Filtrer : Livraisons"
          className={`min-h-[44px] ${filterType === 'livraison' ? 'bg-sky-600 hover:bg-sky-700' : 'border-slate-600'}`}
        >
          📦 Livraisons
        </Button>
        <Button
          size="sm"
          variant={filterType === 'hse' ? 'default' : 'outline'}
          onClick={() => setFilterType('hse')}
          aria-label="Filtrer : HSE"
          className={`min-h-[44px] ${filterType === 'hse' ? 'bg-sky-600 hover:bg-sky-700' : 'border-slate-600'}`}
        >
          ⚠️ HSE
        </Button>
        <Button
          size="sm"
          variant={filterType === 'reunion' ? 'default' : 'outline'}
          onClick={() => setFilterType('reunion')}
          aria-label="Filtrer : Réunions"
          className={`min-h-[44px] ${filterType === 'reunion' ? 'bg-sky-600 hover:bg-sky-700' : 'border-slate-600'}`}
        >
          👥 Réunions
        </Button>
      </div>

      {/* Liste des échéances */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Échéances à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...filteredEcheances]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((echeance) => {
                const daysUntil = Math.ceil(
                  (new Date(echeance.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const statutBadge = getStatutBadge(echeance.statut);

                return (
                  <div
                    key={echeance.id}
                    className={cn(
                      'p-4 bg-slate-900/50 border rounded-lg transition-colors',
                      echeance.statut === 'en_retard'
                        ? 'border-red-500/50 hover:border-red-500/60'
                        : 'border-slate-700 hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-2xl" aria-hidden>
                            {getTypeIcon(echeance.type)}
                          </span>
                          <Badge className={cn('border', getTypeBadge(echeance.type))}>
                            {echeance.type}
                          </Badge>
                          <Badge className={statutBadge.color}>{statutBadge.label}</Badge>
                          {echeance.chantier && (
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {echeance.chantier}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-slate-100 font-semibold mb-2">{echeance.titre}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 shrink-0" aria-hidden />
                            {new Date(echeance.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                          {daysUntil >= 0 && echeance.statut !== 'en_retard' && (
                            <span
                              className={
                                daysUntil <= 7 ? 'text-amber-400 font-semibold' : 'text-slate-400'
                              }
                            >
                              Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                            </span>
                          )}
                          {echeance.statut === 'en_retard' && (
                            <span className="text-red-400 font-semibold">
                              ⚠️ Retard de {Math.abs(daysUntil)} jour
                              {Math.abs(daysUntil) > 1 ? 's' : ''}
                            </span>
                          )}
                          {echeance.montant != null && (
                            <span className="text-green-400 font-semibold">
                              {(echeance.montant / 1000).toFixed(0)}K XOF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {echeance.statut !== 'complete' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleMarquerComplete(echeance.id)}
                          >
                            ✅ Marquer complété
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600">
                            ⏰ Reporter
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                        👁️ Voir détails
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
