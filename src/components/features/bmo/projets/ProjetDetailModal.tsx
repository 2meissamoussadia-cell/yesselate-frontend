/**
 * Projet Detail Modal
 * Pattern Modal Overlay pour module Projets
 */

'use client';

import React from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Target,
  Activity,
} from 'lucide-react';

export interface Projet {
  id: string;
  nom: string;
  reference: string;
  statut: 'planification' | 'en_cours' | 'en_pause' | 'termine' | 'annule';
  budget: number;
  budgetUtilise: number;
  dateDebut: string;
  dateFin: string;
  responsable: string;
  localisation: string;
  description: string;
  priorite?: 'haute' | 'moyenne' | 'basse';
  avancement: number;
}

export interface ProjetDetailModalProps {
  projets: Projet[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ProjetDetailModal({
  projets,
  selectedId,
  onClose,
  onPrevious,
  onNext,
}: ProjetDetailModalProps) {
  const projet = projets.find((p) => p.id === selectedId);

  if (!projet) return null;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planification':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'en_cours':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'en_pause':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'termine':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'annule':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const budgetPercentage = (projet.budgetUtilise / projet.budget) * 100;
  const getBudgetColor = () => {
    if (budgetPercentage > 90) return 'text-red-400';
    if (budgetPercentage > 75) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <UniversalDetailModal
      isOpen={!!selectedId}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      title={projet.nom}
      subtitle={`Réf: ${projet.reference}`}
      headerColor="blue"
      width="xl"
      actions={
        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
          <FolderOpen className="w-4 h-4 mr-1" />
          Ouvrir
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status & Progress Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={getStatutColor(projet.statut)}>
                {projet.statut.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-sm text-slate-400">Avancement: {projet.avancement}%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: `${projet.avancement}%` }}
            />
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
            label="Budget total"
            value={`${projet.budget.toLocaleString('fr-FR')} €`}
          />
          <InfoCard
            icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
            label="Budget utilisé"
            value={`${projet.budgetUtilise.toLocaleString('fr-FR')} €`}
            badge={
              <span className={getBudgetColor()}>
                {budgetPercentage.toFixed(0)}%
              </span>
            }
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-purple-400" />}
            label="Date de début"
            value={new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            label="Date de fin prévue"
            value={new Date(projet.dateFin).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Users className="w-5 h-5 text-cyan-400" />}
            label="Responsable"
            value={projet.responsable}
          />
          <InfoCard
            icon={<MapPin className="w-5 h-5 text-pink-400" />}
            label="Localisation"
            value={projet.localisation}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description du projet
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{projet.description}</p>
          </div>
        </div>

        {/* Objectifs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objectifs clés
          </h3>
          <div className="space-y-2">
            <ObjectifItem status="completed" text="Phase de conception terminée" />
            <ObjectifItem status="in_progress" text="Développement en cours" />
            <ObjectifItem status="pending" text="Tests et validation" />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activité récente
          </h3>
          <div className="space-y-3">
            <TimelineItem
              date={new Date().toLocaleString('fr-FR')}
              user={projet.responsable}
              action="Mise à jour de l'avancement"
              status="info"
            />
            <TimelineItem
              date={new Date(projet.dateDebut).toLocaleString('fr-FR')}
              user="Système"
              action="Projet démarré"
              status="success"
            />
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
        {badge && <div className="text-xs font-bold">{badge}</div>}
      </div>
    </div>
  );
}

function ObjectifItem({ status, text }: { status: 'completed' | 'in_progress' | 'pending'; text: string }) {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      {getIcon()}
      <span className="text-sm text-slate-300">{text}</span>
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
