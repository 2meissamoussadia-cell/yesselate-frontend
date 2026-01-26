/**
 * Page Documents Conformité
 * Vue des documents de conformité (DCE/CCAP/CCAG)
 */

'use client';

import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel } from '../shared';
import { EmptyState } from '../shared/EmptyState';

export function ComplianceDocumentsPage({ data }: any) {
  const missingDocs = Array.isArray(data) ? data : [];

  if (missingDocs.length === 0) {
    return (
      <DashboardPageLayout title="Pièces manquantes" description="Contrats avec pièces incomplètes">
        <EmptyState message="Aucune pièce manquante" />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout title="Pièces manquantes" description="Contrats avec pièces incomplètes">
      <DashboardSection>
        <div className="space-y-3">
          {missingDocs.map((doc: any, idx: number) => (
            <DashboardPanel key={idx}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800/50 rounded-lg">
                    <FileText className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Contrat {doc.contrat_id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.manquant_ccap && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">CCAP manquant</span>
                  )}
                  {doc.manquant_ccag && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">CCAG manquant</span>
                  )}
                  {doc.manquant_pv && (
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">PV manquant</span>
                  )}
                </div>
              </div>
            </DashboardPanel>
          ))}
        </div>
      </DashboardSection>
    </DashboardPageLayout>
  );
}
