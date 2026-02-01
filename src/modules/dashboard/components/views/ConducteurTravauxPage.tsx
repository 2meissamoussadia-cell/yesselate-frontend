/**
 * Page Dashboard Conducteur de Travaux
 * 
 * Vue dédiée pour les conducteurs de travaux avec :
 * - Drilldown intuitif sur les projets
 * - Liste des derniers événements (blocages, décisions, risques)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle,
  FileText,
  Gavel,
  ChevronRight,
  Clock,
  User,
  Building2,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  MockDataIndicator,
} from '../shared';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

// ============================================
// TYPES
// ============================================

type EvenementType = 'blocage' | 'decision' | 'risque';

interface Evenement {
  id: string;
  type: EvenementType;
  titre: string;
  description: string;
  projet: string;
  bureau: string;
  date: string;
  priorite: 'critique' | 'haute' | 'moyenne';
  responsable: string;
  statut: 'actif' | 'resolu' | 'en_cours';
}

interface Projet {
  id: string;
  nom: string;
  bureau: string;
  avancement: number;
  budgetConsomme: number;
  budgetAlloue: number;
  retard: number;
  evenements: number;
}

// ============================================
// COMPOSANT
// ============================================

export function ConducteurTravauxPage() {
  const { go } = useDashboardCommandCenterStore();
  const [selectedProjet, setSelectedProjet] = useState<string | null>(null);

  // ⚠️ DONNÉES MOCKÉES - Phase 1
  const projets: Projet[] = useMemo(() => [
    { id: 'PRJ-0018', nom: 'Construction Route Nationale', bureau: 'BF', avancement: 75, budgetConsomme: 42000000, budgetAlloue: 50000000, retard: 15, evenements: 3 },
    { id: 'PRJ-0017', nom: 'Réhabilitation École Primaire', bureau: 'BJ', avancement: 60, budgetConsomme: 21000000, budgetAlloue: 35000000, retard: 8, evenements: 2 },
    { id: 'PRJ-0016', nom: 'Installation Éclairage Public', bureau: 'BCG', avancement: 45, budgetConsomme: 16800000, budgetAlloue: 28000000, retard: 5, evenements: 1 },
  ], []);

  const evenements: Evenement[] = useMemo(() => [
    {
      id: 'E1',
      type: 'blocage',
      titre: 'Blocage matériel manquant',
      description: 'Attente livraison ciment pour poursuivre travaux',
      projet: 'PRJ-0018',
      bureau: 'BF',
      date: '2025-01-20',
      priorite: 'critique',
      responsable: 'A. DIALLO',
      statut: 'actif',
    },
    {
      id: 'E2',
      type: 'decision',
      titre: 'Décision validation avenant',
      description: 'Avenant contrat n°BC-2025-0041 en attente validation',
      projet: 'PRJ-0018',
      bureau: 'BF',
      date: '2025-01-19',
      priorite: 'haute',
      responsable: 'M. KANE',
      statut: 'en_cours',
    },
    {
      id: 'E3',
      type: 'risque',
      titre: 'Risque retard livraison',
      description: 'Risque de retard sur livraison équipements électriques',
      projet: 'PRJ-0017',
      bureau: 'BJ',
      date: '2025-01-18',
      priorite: 'moyenne',
      responsable: 'S. FALL',
      statut: 'actif',
    },
    {
      id: 'E4',
      type: 'blocage',
      titre: 'Blocage autorisation',
      description: 'Attente autorisation mairie pour travaux',
      projet: 'PRJ-0016',
      bureau: 'BCG',
      date: '2025-01-17',
      priorite: 'haute',
      responsable: 'K. NDIAYE',
      statut: 'en_cours',
    },
  ], []);

  const getEvenementIcon = (type: EvenementType) => {
    switch (type) {
      case 'blocage':
        return AlertTriangle;
      case 'decision':
        return Gavel;
      case 'risque':
        return AlertCircle;
    }
  };

  const getEvenementColor = (type: EvenementType) => {
    switch (type) {
      case 'blocage':
        return 'rose';
      case 'decision':
        return 'blue';
      case 'risque':
        return 'amber';
    }
  };

  const filteredEvenements = selectedProjet
    ? evenements.filter(e => e.projet === selectedProjet)
    : evenements;

  return (
    <div className="relative">
      <MockDataIndicator message="Données mockées - Phase 1 (Backend en attente)" />
      
      <DashboardPageLayout>
        {/* Header */}
        <DashboardSection>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Conducteur de Travaux</h1>
              <p className="text-slate-400 text-sm mt-1">
                Drilldown projets et événements récents
              </p>
            </div>
          </div>
        </DashboardSection>

        {/* Projets avec drilldown */}
        <DashboardSection>
          <DashboardPanel title="Projets" className="bg-slate-900/40">
            <div className="space-y-3">
              {projets.map((projet) => (
                <div
                  key={projet.id}
                  className={cn(
                    'rounded-xl border p-4 transition-all cursor-pointer',
                    selectedProjet === projet.id
                      ? 'border-blue-500/60 bg-blue-500/5'
                      : 'border-slate-800/60 bg-slate-950/35 hover:bg-slate-900/50'
                  )}
                  onClick={() => setSelectedProjet(selectedProjet === projet.id ? null : projet.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-200 truncate">{projet.nom}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {projet.bureau} • {projet.avancement}% avancé
                          {projet.retard > 0 && (
                            <span className="ml-2 text-rose-400">+{projet.retard}j retard</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-200">
                          {projet.evenements} événement{projet.evenements > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-slate-400">
                          {(projet.budgetConsomme / 1000000).toFixed(1)}M / {(projet.budgetAlloue / 1000000).toFixed(1)}M XOF
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        'h-5 w-5 text-slate-400 transition-transform',
                        selectedProjet === projet.id && 'rotate-90'
                      )} />
                    </div>
                  </div>

                  {/* Détails projet (expandable) */}
                  {selectedProjet === projet.id && (
                    <div className="mt-4 pt-4 border-t border-slate-800/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          go({ main: 'overview', sub: 'summary', leaf: 'projets' });
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-slate-200">Voir détails complets</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DashboardPanel>
        </DashboardSection>

        {/* Événements récents */}
        <DashboardSection>
          <DashboardPanel 
            title={`Événements récents${selectedProjet ? ` - ${projets.find(p => p.id === selectedProjet)?.nom}` : ''}`}
            className="bg-slate-900/40"
          >
            {selectedProjet && (
              <button
                onClick={() => setSelectedProjet(null)}
                className="mb-3 text-xs text-blue-400 hover:text-blue-300"
              >
                ← Voir tous les événements
              </button>
            )}

            <div className="space-y-2">
              {filteredEvenements.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Aucun événement pour ce projet
                </div>
              ) : (
                filteredEvenements.map((evenement) => {
                  const Icon = getEvenementIcon(evenement.type);
                  const color = getEvenementColor(evenement.type);
                  
                  return (
                    <div
                      key={evenement.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        evenement.priorite === 'critique'
                          ? 'border-rose-500/40 bg-rose-500/5'
                          : evenement.priorite === 'haute'
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-slate-800/60 bg-slate-950/35'
                      )}
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        `bg-${color}-500/10`
                      )}>
                        <Icon className={cn('h-5 w-5', `text-${color}-400`)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-200 truncate">
                              {evenement.titre}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {evenement.description}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {evenement.projet} • {evenement.bureau}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(evenement.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {evenement.responsable}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              evenement.statut === 'actif'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : evenement.statut === 'en_cours'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            )}>
                              {evenement.statut === 'actif' ? 'Actif' : evenement.statut === 'en_cours' ? 'En cours' : 'Résolu'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DashboardPanel>
        </DashboardSection>
      </DashboardPageLayout>
    </div>
  );
}
