/**
 * Instances & Coordination - Onglet 7
 * Coordonne les instances décisionnelles critiques
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  MessageSquare,
  Mail,
  ChevronRight,
  Play,
  Clock,
  CheckCircle2,
  Archive,
  UserPlus,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { CalendarNavigationBar } from '@/components/features/bmo/calendar';

// Données mock pour la démo
const criticalConferences = [
  {
    id: '1',
    title: 'Conférence arbitrage Projet Alpha',
    date: '15/01/2025 14:00',
    participants: 5,
    agenda: 'Arbitrage budget dépassement',
    status: 'planned' as const,
    type: 'arbitrage' as const,
  },
  {
    id: '2',
    title: 'Conférence escalade critique',
    date: '12/01/2025 10:00',
    participants: 4,
    agenda: 'Traitement escalades niveau 3',
    status: 'completed' as const,
    type: 'escalation' as const,
  },
];

const escalatedExchanges = [
  {
    id: '1',
    subject: 'Échange - Projet Gamma en retard',
    source: 'Chef de projet',
    date: '11/01/2025',
    status: 'open' as const,
    strategicImpact: true,
  },
  {
    id: '2',
    subject: 'Échange - Validation BC bloquée',
    source: 'Direction financière',
    date: '10/01/2025',
    status: 'open' as const,
    strategicImpact: true,
  },
];

const strategicExternalMessages = [
  {
    id: '1',
    sender: 'Client stratégique - Groupe ABC',
    subject: 'Demande modification périmètre projet',
    date: '11/01/2025',
    impact: 'financial' as const,
    amount: '850K€',
    status: 'open' as const,
  },
  {
    id: '2',
    sender: 'Client VIP - Entreprise XYZ',
    subject: 'Réclamation majeure',
    date: '09/01/2025',
    impact: 'reputation' as const,
    status: 'open' as const,
  },
];

export function InstancesCoordinationView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedTab, setSelectedTab] = useState<'conferences' | 'exchanges' | 'messages'>(
    'conferences'
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'workweek' | 'week' | 'month'>('month');

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === 'workweek' || viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === 'workweek' || viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Calendrier - Affichée seulement pour l'onglet Conférences */}
      {selectedTab === 'conferences' && (
        <CalendarNavigationBar
          currentDate={currentDate}
          viewType={viewType}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onDateRangeClick={() => {
            // Optionnel: ouvrir un sélecteur de date
          }}
        />
      )}

      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTab('conferences')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'conferences'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Conférences critiques
            {criticalConferences.length > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {criticalConferences.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('exchanges')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'exchanges'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Échanges escaladés
            {escalatedExchanges.length > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {escalatedExchanges.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('messages')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'messages'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Messages externes stratégiques
            {strategicExternalMessages.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {strategicExternalMessages.length}
              </Badge>
            )}
          </div>
        </button>
      </div>

      {/* Contenu selon l'onglet sélectionné */}
      {selectedTab === 'conferences' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Conférences décisionnelles critiques
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-slate-300"
              onClick={() => openModal('action-plan' as any, {})}
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Convoquer
            </Button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {criticalConferences.map((conference) => (
              <div
                key={conference.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('action-plan' as any, conference)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{conference.title}</p>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          conference.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        )}
                      >
                        {conference.status === 'completed' ? 'Terminée' : 'Planifiée'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {conference.date}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        <Users className="h-3 w-3 inline mr-1" />
                        {conference.participants} participants
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{conference.agenda}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('action-plan' as any, conference);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'exchanges' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-medium text-slate-300">Échanges structurés escaladés</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {escalatedExchanges.map((exchange) => (
              <div
                key={exchange.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('action-plan' as any, exchange)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{exchange.subject}</p>
                      {exchange.strategicImpact && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                          Impact stratégique
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Source: {exchange.source}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">Date: {exchange.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('action-plan', { ...exchange, action: 'treat' });
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Traiter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'messages' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Messages externes à impact stratégique
              </h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {strategicExternalMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('action-plan' as any, message)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                    <Mail className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{message.subject}</p>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          message.impact === 'financial'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        )}
                      >
                        Impact: {message.impact === 'financial' ? 'Financier' : 'Réputationnel'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Expéditeur: {message.sender}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">Date: {message.date}</span>
                      {message.amount && (
                        <>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-amber-400">Montant: {message.amount}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('action-plan', { ...message, action: 'treat' });
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Traiter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
