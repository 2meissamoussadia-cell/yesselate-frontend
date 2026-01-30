'use client';

/**
 * DocumentLibrary BMO — Gestion de documents intégrée (centralisée, versionnée, collaborative).
 * Plans, DOE, PV, contrats (ERP BTP).
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AccessibleButton } from '@/components/ui/AccessibleButton';
import { DocumentItem } from './DocumentItem';
import type { DocumentItemProps } from './DocumentItem';

export interface DocumentEntry {
  id: string;
  name: string;
  version: string;
  date: string;
  status: DocumentItemProps['status'];
}

interface DocumentLibraryProps {
  /** Contexte projet/chantier (optionnel : portefeuille global si absent) */
  projectId?: string;
  /** Liste des documents (exemples si non fournie) */
  documents?: DocumentEntry[];
  onAddDocument?: () => void;
  onOpenDocument?: (id: string) => void;
  className?: string;
}

const defaultDocuments: DocumentEntry[] = [
  { id: '1', name: "Plan d'exécution.pdf", version: '2', date: '2026-01-25', status: 'Validé' },
  { id: '2', name: 'PV de réception.docx', version: '1', date: '2026-01-20', status: 'En attente' },
  { id: '3', name: 'CCTP chantier A.pdf', version: '3', date: '2026-01-18', status: 'Validé' },
  { id: '4', name: 'Avenant n°2.docx', version: '1', date: '2026-01-15', status: 'Brouillon' },
];

export function DocumentLibrary({
  projectId,
  documents = defaultDocuments,
  onAddDocument,
  onOpenDocument,
  className,
}: DocumentLibraryProps) {
  const title = projectId
    ? 'Documents du projet'
    : 'Documents du portefeuille';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {onAddDocument && (
          <AccessibleButton
            onClick={onAddDocument}
            ariaLabel="Ajouter un document"
          >
            Ajouter un document
          </AccessibleButton>
        )}
      </div>
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 overflow-hidden">
        <header className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Plans, DOE, PV, contrats</span>
          <span className="text-xs text-slate-500">Version, date, statut</span>
        </header>
        <div className="p-2 space-y-0">
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onOpenDocument?.(doc.id)}
              className={cn(
                'w-full text-left rounded transition-colors',
                onOpenDocument && 'hover:bg-slate-800/50'
              )}
            >
              <DocumentItem
                name={doc.name}
                version={doc.version}
                date={doc.date}
                status={doc.status}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
