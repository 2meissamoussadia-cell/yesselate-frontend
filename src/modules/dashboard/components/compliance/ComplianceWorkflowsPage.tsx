/**
 * Page Backlog Visas
 * Vue des workflows de visa en attente
 */

'use client';

import { FileText } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel } from '../shared';
import { EmptyState } from '../shared/EmptyState';

export function ComplianceWorkflowsPage({ data }: any) {
  const workflows = Array.isArray(data) ? data : [];

  if (workflows.length === 0) {
    return (
      <DashboardPageLayout title="Backlog visas" description="File d'attente des visas">
        <EmptyState message="Aucun visa en attente" />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout title="Backlog visas" description="File d'attente des visas">
      <DashboardSection>
        <div className="space-y-3">
          {workflows.map((wf: any, idx: number) => (
            <DashboardPanel key={idx}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800/50 rounded-lg">
                    <FileText className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{wf.ref_objet}</div>
                    <div className="text-xs text-slate-400">
                      {wf.chaine_visa}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {wf.etape_en_cours !== null && (
                    <div className="text-sm text-slate-400">
                      Étape {wf.etape_en_cours}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span>{wf.nb_etapes_restantes} étape{wf.nb_etapes_restantes > 1 ? 's' : ''} restante{wf.nb_etapes_restantes > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </DashboardPanel>
          ))}
        </div>
      </DashboardSection>
    </DashboardPageLayout>
  );
}

export default ComplianceWorkflowsPage;
