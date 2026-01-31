/**
 * Depense Detail Modal
 * Pattern Modal Overlay pour module Depenses
 */

'use client';

import React from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Receipt,
  Calendar,
  User,
  DollarSign,
  Tag,
  Building,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  CreditCard,
} from 'lucide-react';

interface Depense {
  id: string;
  reference: string;
  description: string;
  montant: number;
  categorie: string;
  dateDepense: string;
  dateSoumission: string;
  statut: 'en_attente' | 'approuve' | 'rejete' | 'rembourse';
  employe: string;
  departement: string;
  projet?: string;
  modePaiement: string;
  justificatifs: number;
}

interface DepenseDetailModalProps {
  depenses: Depense[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRembourser?: (id: string) => void;
}

export function DepenseDetailModal({
  depenses,
  selectedId,
  onClose,
  onPrevious,
  onNext,
  onApprove,
  onReject,
  onRembourser,
}: DepenseDetailModalProps) {
  const depense = depenses.find((d) => d.id === selectedId);

  if (!depense) return null;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'approuve':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rembourse':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejete':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getCategoryIcon = (categorie: string) => {
    switch (categorie.toLowerCase()) {
      case 'transport':
        return '🚗';
      case 'restauration':
        return '🍽️';
      case 'hébergement':
        return '🏨';
      case 'matériel':
        return '🔧';
      case 'formation':
        return '📚';
      default:
        return '📄';
    }
  };

  return (
    <UniversalDetailModal
      isOpen={!!selectedId}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      title={`Dépense ${depense.reference}`}
      subtitle={depense.employe}
      headerColor="amber"
      width="xl"
      actions={
        <>
          {depense.statut === 'en_attente' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(depense.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeter
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove?.(depense.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approuver
              </Button>
            </div>
          )}
          {depense.statut === 'approuve' && (
            <Button
              size="sm"
              onClick={() => onRembourser?.(depense.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Rembourser
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Amount Banner */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Receipt className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-100">
                {depense.montant.toLocaleString('fr-FR')} €
              </div>
              <div className="text-sm text-slate-400 mt-1">Montant de la dépense</div>
            </div>
          </div>
          <Badge className={getStatutColor(depense.statut)}>
            {depense.statut.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<Tag className="w-5 h-5 text-purple-400" />}
            label="Catégorie"
            value={depense.categorie}
            emoji={getCategoryIcon(depense.categorie)}
          />
          <InfoCard
            icon={<CreditCard className="w-5 h-5 text-cyan-400" />}
            label="Mode de paiement"
            value={depense.modePaiement}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
            label="Date de la dépense"
            value={new Date(depense.dateDepense).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Clock className="w-5 h-5 text-emerald-400" />}
            label="Date de soumission"
            value={new Date(depense.dateSoumission).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<User className="w-5 h-5 text-pink-400" />}
            label="Employé"
            value={depense.employe}
          />
          <InfoCard
            icon={<Building className="w-5 h-5 text-indigo-400" />}
            label="Département"
            value={depense.departement}
          />
          {depense.projet && (
            <InfoCard
              icon={<FileText className="w-5 h-5 text-teal-400" />}
              label="Projet associé"
              value={depense.projet}
            />
          )}
          <InfoCard
            icon={<FileText className="w-5 h-5 text-slate-400" />}
            label="Justificatifs"
            value={`${depense.justificatifs} document(s)`}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{depense.description}</p>
          </div>
        </div>

        {/* Justificatifs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Justificatifs ({depense.justificatifs})
          </h3>
          <div className="space-y-2">
            {Array.from({ length: depense.justificatifs }).map((_, index) => (
              <JustificatifItem
                key={index}
                name={`Justificatif_${index + 1}.pdf`}
                size={`${(Math.random() * 2 + 0.5).toFixed(1)} MB`}
                date={depense.dateDepense}
              />
            ))}
          </div>
        </div>

        {/* Validation History */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </h3>
          <div className="space-y-3">
            <TimelineItem
              date={new Date(depense.dateSoumission).toLocaleString('fr-FR')}
              user={depense.employe}
              action="Dépense soumise"
              status="info"
            />
            {depense.statut === 'approuve' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user="Manager"
                action="Dépense approuvée"
                status="success"
              />
            )}
            {depense.statut === 'rejete' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user="Manager"
                action="Dépense rejetée"
                status="error"
              />
            )}
            {depense.statut === 'rembourse' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user="Comptabilité"
                action="Dépense remboursée"
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
  emoji,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  emoji?: string;
}) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {emoji && <span className="text-lg">{emoji}</span>}
      </div>
      <div className="text-sm font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function JustificatifItem({ name, size, date }: { name: string; size: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <FileText className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200">{name}</div>
          <div className="text-xs text-slate-400">
            {size} • {new Date(date).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Download className="w-4 h-4" />
      </Button>
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
