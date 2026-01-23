/**
 * Litige Detail Modal
 * Pattern Modal Overlay pour module Litiges
 */

'use client';

import React from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Calendar,
  User,
  Building,
  FileText,
  Clock,
  DollarSign,
  Scale,
  MessageSquare,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export interface Litige {
  id: string;
  reference: string;
  titre: string;
  type: 'contractuel' | 'technique' | 'financier' | 'autre';
  gravite: 'critique' | 'majeure' | 'mineure';
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  partie: string;
  montantLitige?: number;
  dateOuverture: string;
  dateResolution?: string;
  description: string;
  responsable: string;
}

export interface LitigeDetailModalProps {
  litiges: Litige[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onResolve?: (id: string) => void;
  onEscalade?: (id: string) => void;
}

export function LitigeDetailModal({
  litiges,
  selectedId,
  onClose,
  onPrevious,
  onNext,
  onResolve,
  onEscalade,
}: LitigeDetailModalProps) {
  const litige = litiges.find((l) => l.id === selectedId);

  if (!litige) return null;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ouvert':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'en_cours':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolu':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ferme':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'critique':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'majeure':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'mineure':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contractuel':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'technique':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'financier':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <UniversalDetailModal
      isOpen={!!selectedId}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      title={litige.titre}
      subtitle={`Réf: ${litige.reference}`}
      headerColor="red"
      width="xl"
      actions={
        litige.statut !== 'ferme' && (
          <div className="flex gap-2">
            {litige.statut === 'ouvert' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEscalade?.(litige.id)}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Escalader
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onResolve?.(litige.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Résoudre
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* Alert Banner */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-100">Litige {litige.gravite}</div>
              <div className="text-sm text-slate-400 mt-1">
                Ouvert depuis {Math.floor((Date.now() - new Date(litige.dateOuverture).getTime()) / (1000 * 60 * 60 * 24))} jours
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatutColor(litige.statut)}>
              {litige.statut.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getGraviteColor(litige.gravite)}>
              {litige.gravite.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<Scale className="w-5 h-5 text-purple-400" />}
            label="Type de litige"
            value={litige.type.toUpperCase()}
            badge={<Badge className={getTypeColor(litige.type)}>{litige.type}</Badge>}
          />
          <InfoCard
            icon={<Building className="w-5 h-5 text-blue-400" />}
            label="Partie concernée"
            value={litige.partie}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-emerald-400" />}
            label="Date d'ouverture"
            value={new Date(litige.dateOuverture).toLocaleDateString('fr-FR')}
          />
          {litige.dateResolution && (
            <InfoCard
              icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
              label="Date de résolution"
              value={new Date(litige.dateResolution).toLocaleDateString('fr-FR')}
            />
          )}
          <InfoCard
            icon={<User className="w-5 h-5 text-cyan-400" />}
            label="Responsable"
            value={litige.responsable}
          />
          {litige.montantLitige && (
            <InfoCard
              icon={<DollarSign className="w-5 h-5 text-amber-400" />}
              label="Montant du litige"
              value={`${litige.montantLitige.toLocaleString('fr-FR')} €`}
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description du litige
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{litige.description}</p>
          </div>
        </div>

        {/* Communications */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Échanges
          </h3>
          <div className="space-y-3">
            <CommunicationItem
              date={new Date(litige.dateOuverture).toLocaleDateString('fr-FR')}
              sender={litige.responsable}
              message="Litige ouvert - En attente d'analyse"
              type="internal"
            />
            <CommunicationItem
              date={new Date().toLocaleDateString('fr-FR')}
              sender={litige.partie}
              message="Demande de clarification sur les termes du contrat"
              type="external"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </h3>
          <div className="space-y-3">
            <TimelineItem
              date={new Date(litige.dateOuverture).toLocaleString('fr-FR')}
              user="Système"
              action="Litige ouvert"
              status="error"
            />
            {litige.statut === 'en_cours' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user={litige.responsable}
                action="Prise en charge du litige"
                status="warning"
              />
            )}
            {litige.statut === 'resolu' && (
              <TimelineItem
                date={litige.dateResolution ? new Date(litige.dateResolution).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')}
                user={litige.responsable}
                action="Litige résolu"
                status="success"
              />
            )}
          </div>
        </div>
      </div>
    </UniversalDetailModal>
  );
}

// Helper Components
function InfoCard({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-200">{value}</div>
        {badge}
      </div>
    </div>
  );
}

function CommunicationItem({
  date,
  sender,
  message,
  type,
}: {
  date: string;
  sender: string;
  message: string;
  type: 'internal' | 'external';
}) {
  return (
    <div className={`p-4 rounded-lg border ${type === 'internal' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-200">{sender}</span>
        </div>
        <Badge variant="default" className="text-xs border">
          {type === 'internal' ? 'Interne' : 'Externe'}
        </Badge>
      </div>
      <p className="text-sm text-slate-300">{message}</p>
      <div className="text-xs text-slate-500 mt-2">{date}</div>
    </div>
  );
}

function TimelineItem({
  date,
  user,
  action,
  status,
}: {
  date: string;
  user: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
}) {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <div className="w-px h-full bg-slate-700/50 mt-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className="text-sm font-medium text-slate-200">{action}</div>
        <div className="text-xs text-slate-500 mt-1">
          {user} • {date}
        </div>
      </div>
    </div>
  );
}
