'use client';

import React from 'react';
import { Calendar, User, DollarSign, FileText, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Demande, DemandeStatus } from '@/modules/demandes/types/demandesTypes';

export interface DemandeDetailPanelProps {
  demande: Demande;
}

const statusConfig: Record<DemandeStatus | string, string> = {
  pending: 'En attente',
  urgent: 'Urgente',
  validated: 'Validée',
  rejected: 'Rejetée',
  overdue: 'En retard',
};

export function DemandeDetailPanel({ demande }: DemandeDetailPanelProps) {
  const dateCreation =
    demande.createdAt instanceof Date ? demande.createdAt : new Date(demande.createdAt);
  const dateLimite =
    demande.dueDate instanceof Date ? demande.dueDate : demande.dueDate ? new Date(demande.dueDate) : null;

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {demande.title}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{demande.reference}</Badge>
          <Badge variant="outline">{statusConfig[demande.status] ?? demande.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <div>
            <span className="text-slate-500 block">Référence</span>
            <p className="font-medium">{demande.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-500" />
          <div>
            <span className="text-slate-500 block">Service</span>
            <p className="font-medium capitalize">{demande.service}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-500" />
          <div>
            <span className="text-slate-500 block">Créée par</span>
            <p className="font-medium">{demande.createdBy}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <div>
            <span className="text-slate-500 block">Créée le</span>
            <p className="font-medium">
              {dateCreation.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        {dateLimite && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-slate-500 block">Date limite</span>
              <p className="font-medium">
                {dateLimite.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
        {demande.montant != null && demande.montant > 0 && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-slate-500 block">Montant</span>
              <p className="font-medium">{demande.montant.toLocaleString()} FCFA</p>
            </div>
          </div>
        )}
      </div>

      {demande.description && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
            {demande.description}
          </p>
        </div>
      )}

      {demande.assignedTo && (
        <div>
          <span className="text-slate-500 block text-sm mb-1">Assignée à</span>
          <p className="font-medium text-sm">{demande.assignedTo}</p>
        </div>
      )}
    </div>
  );
}
