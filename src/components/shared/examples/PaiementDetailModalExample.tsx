/**
 * Exemple d'implémentation du pattern Modal Overlay
 * Module: Paiements
 * 
 * Ce pattern remplace la navigation vers une page de détail
 * par une modal overlay qui préserve le contexte
 */

'use client';

import React from 'react';
import { UniversalDetailModal, useListNavigation } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  User,
  Building,
  MapPin,
} from 'lucide-react';

// Types
interface Paiement {
  id: string;
  reference: string;
  montant: number;
  fournisseur: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  dateCreation: string;
  dateEcheance: string;
  description: string;
  categorie: string;
  projet?: string;
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
      case 'approuve':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejete':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
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
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {paiement.montant.toLocaleString('fr-FR')} €
              </div>
              <div className="text-sm text-slate-400">Montant du paiement</div>
            </div>
          </div>
          <Badge className={getStatutColor(paiement.statut)}>
            {paiement.statut.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<Building className="w-5 h-5" />}
            label="Fournisseur"
            value={paiement.fournisseur}
          />
          <InfoCard
            icon={<FileText className="w-5 h-5" />}
            label="Référence"
            value={paiement.reference}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5" />}
            label="Date de création"
            value={new Date(paiement.dateCreation).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5" />}
            label="Date d'échéance"
            value={new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<FileText className="w-5 h-5" />}
            label="Catégorie"
            value={paiement.categorie}
          />
          {paiement.projet && (
            <InfoCard
              icon={<MapPin className="w-5 h-5" />}
              label="Projet"
              value={paiement.projet}
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300">Description</h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300">{paiement.description}</p>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Documents joints</h3>
          <div className="space-y-2">
            <DocumentItem
              name="Facture.pdf"
              size="2.4 MB"
              date="10/01/2026"
            />
            <DocumentItem
              name="Bon_de_commande.pdf"
              size="1.1 MB"
              date="05/01/2026"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Historique</h3>
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
              action="Document ajouté"
              status="success"
            />
          </div>
        </div>
      </div>
    </UniversalDetailModal>
  );
}

// Composants helper
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2 text-slate-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-sm font-medium text-slate-200">{value}</div>
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
          <div className="text-xs text-slate-400">{size} • {date}</div>
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
        <div className="text-sm text-slate-200">{action}</div>
        <div className="text-xs text-slate-400 mt-1">
          {user} • {date}
        </div>
      </div>
    </div>
  );
}

// Exemple d'utilisation dans une page
export function PaiementsPageExample() {
  const [paiements] = React.useState<Paiement[]>([
    {
      id: '1',
      reference: 'PAY-2026-001',
      montant: 15000,
      fournisseur: 'Entreprise ABC',
      statut: 'en_attente',
      dateCreation: '2026-01-10',
      dateEcheance: '2026-01-30',
      description: 'Travaux de rénovation',
      categorie: 'Travaux',
      projet: 'Rénovation Immeuble A',
    },
    // ... autres paiements
  ]);

  // Utiliser le hook de navigation
  const {
    selectedId,
    selectedItem,
    isOpen,
    handleNext,
    handlePrevious,
    handleClose,
    handleOpen,
  } = useListNavigation(paiements, (p) => p.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Paiements</h1>

      {/* Liste */}
      <div className="space-y-2">
        {paiements.map((paiement) => (
          <div
            key={paiement.id}
            onClick={() => handleOpen(paiement.id)}
            className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-200">{paiement.reference}</div>
                <div className="text-sm text-slate-400">{paiement.fournisseur}</div>
              </div>
              <div className="text-lg font-bold text-slate-100">
                {paiement.montant.toLocaleString('fr-FR')} €
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail */}
      <PaiementDetailModal
        paiements={paiements}
        selectedId={selectedId}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onApprove={(id) => {
          console.log('Approuver', id);
          handleClose();
        }}
        onReject={(id) => {
          console.log('Rejeter', id);
          handleClose();
        }}
      />
    </div>
  );
}

