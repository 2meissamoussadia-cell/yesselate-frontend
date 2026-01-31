/**
 * Paiement Detail Modal
 * Modal overlay pour afficher les détails d'un paiement
 * avec navigation rapide entre items
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
  Calendar,
  DollarSign,
  FileText,
  Building,
  MapPin,
  Clock,
  User,
  AlertTriangle,
} from 'lucide-react';

export interface Paiement {
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
  responsable?: string;
  urgence?: 'haute' | 'moyenne' | 'basse';
}

export interface PaiementDetailModalProps {
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

  const getStatutBadge = (statut: string) => {
    const styles = {
      en_attente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      approuve: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejete: 'bg-red-500/20 text-red-400 border-red-500/30',
      en_cours: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return styles[statut as keyof typeof styles] || styles.en_attente;
  };

  const getUrgenceBadge = (urgence?: string) => {
    if (!urgence) return null;
    const styles = {
      haute: 'bg-red-500/20 text-red-400 border-red-500/30',
      moyenne: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      basse: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return (
      <Badge className={styles[urgence as keyof typeof styles]}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        {urgence.toUpperCase()}
      </Badge>
    );
  };

  const isActionnable = paiement.statut === 'en_attente';

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
        isActionnable && (
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
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {paiement.montant.toLocaleString('fr-FR')} €
              </div>
              <div className="text-sm text-slate-400">Montant du paiement</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getUrgenceBadge(paiement.urgence)}
            <Badge className={getStatutBadge(paiement.statut)}>
              {paiement.statut.replace('_', ' ').toUpperCase()}
            </Badge>
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
            icon={<FileText className="w-5 h-5 text-purple-400" />}
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
          {paiement.responsable && (
            <InfoCard
              icon={<User className="w-5 h-5 text-indigo-400" />}
              label="Responsable"
              value={paiement.responsable}
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{paiement.description}</p>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents joints
          </h3>
          <div className="space-y-2">
            <DocumentItem name="Facture.pdf" size="2.4 MB" date="10/01/2026" />
            <DocumentItem name="Bon_de_commande.pdf" size="1.1 MB" date="05/01/2026" />
            <DocumentItem name="Devis.pdf" size="856 KB" date="02/01/2026" />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </h3>
          <div className="space-y-3">
            <TimelineItem
              date="10/01/2026 14:30"
              user="Jean Dupont"
              action="Demande créée"
              status="info"
            />
            <TimelineItem
              date="10/01/2026 15:45"
              user="Marie Martin"
              action="Documents ajoutés"
              status="success"
            />
            <TimelineItem
              date="10/01/2026 16:20"
              user="Système"
              action="En attente de validation"
              status="warning"
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="text-sm font-medium text-slate-200">{value}</div>
    </div>
  );
}

function DocumentItem({ name, size, date }: { name: string; size: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200">{name}</div>
          <div className="text-xs text-slate-400">
            {size} • {date}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
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
        <div className="text-sm text-slate-200 font-medium">{action}</div>
        <div className="text-xs text-slate-400 mt-1">
          {user} • {date}
        </div>
      </div>
    </div>
  );
}

