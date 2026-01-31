/**
 * Composant Card pour afficher un document de validation
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShoppingCart, Receipt, FileText } from 'lucide-react';
import type { DocumentValidation, TypeDocument, StatutDocument } from '../types/validationTypes';

// Fix import pour ValidationModal - utilise le bon chemin
import { ValidationModal as ValidationModalComponent } from './ValidationModal';

interface DocumentCardProps {
  document: DocumentValidation;
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function DocumentCard({ document, onValidate, onReject, onView }: DocumentCardProps) {
  const getTypeIcon = (type: TypeDocument) => {
    switch (type) {
      case 'BC':
        return ShoppingCart;
      case 'FACTURE':
        return Receipt;
      case 'AVENANT':
        return FileText;
    }
  };

  const getStatutConfig = (statut: StatutDocument) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return { icon: Clock, color: 'amber', label: 'En attente' };
      case 'VALIDE':
        return { icon: CheckCircle2, color: 'emerald', label: 'Validé' };
      case 'REJETE':
        return { icon: XCircle, color: 'red', label: 'Rejeté' };
      case 'URGENT':
        return { icon: AlertTriangle, color: 'orange', label: 'Urgent' };
    }
  };

  const TypeIcon = getTypeIcon(document.type);
  const statutConfig = getStatutConfig(document.statut);
  const StatutIcon = statutConfig.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all hover:shadow-lg cursor-pointer',
        'bg-slate-800/50 border-slate-700/50 text-slate-200'
      )}
      onClick={() => onView?.(document.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5 text-slate-400" />
          <span className="font-semibold text-slate-300">{document.numero}</span>
        </div>
        <Badge
          variant={
            statutConfig.color === 'red'
              ? 'destructive'
              : statutConfig.color === 'amber' || statutConfig.color === 'orange'
              ? 'default'
              : 'secondary'
          }
          className={cn(
            statutConfig.color === 'amber' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            statutConfig.color === 'orange' && 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            statutConfig.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          )}
        >
          <StatutIcon className="h-3 w-3 mr-1" />
          {statutConfig.label}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="font-medium text-slate-200 mb-2">{document.titre}</h3>

      {/* Description */}
      {document.description && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{document.description}</p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-400">
        <span>Montant: {document.montant.toLocaleString('fr-FR')} {document.devise || 'EUR'}</span>
        {document.demandeur && <span>• {document.demandeur}</span>}
        {document.delaiMoyen && <span>• Délai: {document.delaiMoyen.toFixed(1)}j</span>}
      </div>

      {/* Actions */}
      {(document.statut === 'EN_ATTENTE' || document.statut === 'URGENT') && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onValidate?.(document.id);
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Valider
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(document.id);
            }}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
        </div>
      )}
    </div>
  );
}

