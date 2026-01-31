/**
 * Paiement Detail Modal
 * Pattern Modal Overlay pour module Paiements
 */

'use client';

import React from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Building,
  MapPin,
  User,
  Clock,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface Paiement {
  id: string;
  reference: string;
  montant: number;
  fournisseur: string;
  statut: 'en_attente' | 'approuve' | 'rejete' | 'en_cours';
  dateCreation: string;
  dateEcheance: string;
  description: string;
  categorie: string;
  projet?: string;
  facture?: string;
  priorite?: 'haute' | 'normale' | 'basse';
}

interface PaiementDetailModalProps {
  paiements: Paiement[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function PaiementDetailModal({
  paiements,
  selectedId,
  onClose,
  onPrevious,
  onNext,
  onApprove,
  onReject,
}: PaiementDetailModalProps) {
  const paiement = paiements.find((p) => p.id === selectedId);

  if (!paiement) return null;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'en_cours':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'approuve':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejete':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPrioriteColor = (priorite?: string) => {
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
      title={`Paiement ${paiement.reference}`}
      subtitle={paiement.fournisseur}
      headerColor="blue"
      width="xl"
      actions={
        paiement.statut === 'en_attente' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject?.(paiement.id)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeter
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove?.(paiement.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approuver
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-100">
                {paiement.montant.toLocaleString('fr-FR')} €
              </div>
              <div className="text-sm text-slate-400 mt-1">Montant du paiement</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatutColor(paiement.statut)}>
              {paiement.statut.replace('_', ' ').toUpperCase()}
            </Badge>
            {paiement.priorite && (
              <Badge className={getPrioriteColor(paiement.priorite)}>
                {paiement.priorite.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<Building className="w-5 h-5 text-blue-400" />}
            label="Fournisseur"
            value={paiement.fournisseur}
          />
          <InfoCard
            icon={<FileText className="w-5 h-5 text-slate-400" />}
            label="Référence"
            value={paiement.reference}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-emerald-400" />}
            label="Date de création"
            value={new Date(paiement.dateCreation).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            label="Date d'échéance"
            value={new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Tag className="w-5 h-5 text-purple-400" />}
            label="Catégorie"
            value={paiement.categorie}
          />
          {paiement.projet && (
            <InfoCard
              icon={<MapPin className="w-5 h-5 text-cyan-400" />}
              label="Projet"
              value={paiement.projet}
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{paiement.description}</p>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents joints
          </h3>
          <div className="space-y-2">
            <DocumentItem
              name={`Facture_${paiement.reference}.pdf`}
              size="2.4 MB"
              date={paiement.dateCreation}
            />
            <DocumentItem
              name="Bon_de_commande.pdf"
              size="1.1 MB"
              date={paiement.dateCreation}
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
              date={new Date(paiement.dateCreation).toLocaleString('fr-FR')}
              user="Système"
              action="Demande créée"
              status="info"
            />
            {paiement.statut === 'approuve' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user="Manager"
                action="Paiement approuvé"
                status="success"
              />
            )}
            {paiement.statut === 'rejete' && (
              <TimelineItem
                date={new Date().toLocaleString('fr-FR')}
                user="Manager"
                action="Paiement rejeté"
                status="error"
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

function DocumentItem({ name, size, date }: { name: string; size: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <FileText className="w-4 h-4 text-blue-400" />
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
          <User className="w-3 h-3 inline mr-1" />
          {user} • {date}
        </div>
      </div>
    </div>
  );
}

