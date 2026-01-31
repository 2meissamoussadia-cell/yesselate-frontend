/**
 * Reclamation Detail Modal
 * Pattern Modal Overlay pour module Reclamations
 */

'use client';

import React from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calendar,
  User,
  Building,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface Reclamation {
  id: string;
  reference: string;
  objet: string;
  type: 'qualite' | 'delai' | 'service' | 'autre';
  priorite: 'haute' | 'normale' | 'basse';
  statut: 'nouvelle' | 'en_cours' | 'resolue' | 'fermee';
  client: string;
  dateCreation: string;
  dateResolution?: string;
  description: string;
  responsable: string;
  satisfaction?: number; // 1-5
}

interface ReclamationDetailModalProps {
  reclamations: Reclamation[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onResolve?: (id: string) => void;
  onAssign?: (id: string) => void;
}

export function ReclamationDetailModal({
  reclamations,
  selectedId,
  onClose,
  onPrevious,
  onNext,
  onResolve,
  onAssign,
}: ReclamationDetailModalProps) {
  const reclamation = reclamations.find((r) => r.id === selectedId);

  if (!reclamation) return null;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'nouvelle':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'en_cours':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolue':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'fermee':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'haute':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'normale':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'basse':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
      title={reclamation.objet}
      subtitle={`Réf: ${reclamation.reference}`}
      headerColor="orange"
      width="xl"
      actions={
        reclamation.statut !== 'fermee' && (
          <div className="flex gap-2">
            {reclamation.statut === 'nouvelle' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssign?.(reclamation.id)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <User className="w-4 h-4 mr-1" />
                Assigner
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onResolve?.(reclamation.id)}
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
        {/* Status Banner */}
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-100">{reclamation.type.toUpperCase()}</div>
                <div className="text-sm text-slate-400 mt-1">
                  Ouverte depuis {Math.floor((Date.now() - new Date(reclamation.dateCreation).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatutColor(reclamation.statut)}>
                {reclamation.statut.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPrioriteColor(reclamation.priorite)}>
                {reclamation.priorite.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<Building className="w-5 h-5 text-blue-400" />}
            label="Client"
            value={reclamation.client}
          />
          <InfoCard
            icon={<User className="w-5 h-5 text-cyan-400" />}
            label="Responsable"
            value={reclamation.responsable}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-emerald-400" />}
            label="Date de création"
            value={new Date(reclamation.dateCreation).toLocaleDateString('fr-FR')}
          />
          {reclamation.dateResolution && (
            <InfoCard
              icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
              label="Date de résolution"
              value={new Date(reclamation.dateResolution).toLocaleDateString('fr-FR')}
            />
          )}
        </div>

        {/* Satisfaction */}
        {reclamation.satisfaction && (
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {reclamation.satisfaction >= 4 ? (
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm font-medium text-slate-300">Satisfaction client</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < reclamation.satisfaction! ? 'bg-amber-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description de la réclamation
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{reclamation.description}</p>
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
              date={new Date(reclamation.dateCreation).toLocaleString('fr-FR')}
              user={reclamation.client}
              action="Réclamation créée"
              status="error"
            />
            {reclamation.statut === 'en_cours' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user={reclamation.responsable}
                action="Prise en charge"
                status="warning"
              />
            )}
            {reclamation.statut === 'resolue' && reclamation.dateResolution && (
              <TimelineItem
                date={new Date(reclamation.dateResolution).toLocaleString('fr-FR')}
                user={reclamation.responsable}
                action="Réclamation résolue"
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
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-200">{value}</div>
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
        <div className="text-xs text-slate-400 mt-1">
          {user} • {date}
        </div>
      </div>
    </div>
  );
}

