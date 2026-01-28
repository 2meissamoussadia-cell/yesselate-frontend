// src/components/features/bmo/validation-bc/BCRowActions.tsx
'use client';

import { Search, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBcAudit } from '@/ui/hooks/useBcAudit';
import { convertEnrichedBCToBonCommande } from '@/lib/utils/bc-converter';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { BonCommande } from '@/domain/bcTypes';
import type { AuditContext } from '@/domain/bcAudit';

interface BCRowActionsProps {
  bc: EnrichedBC;
  auditContext: AuditContext;
  onOpenViewer: (bcId: string, options?: { audit?: any }) => void;
  onValidate?: () => void;
  darkMode?: boolean;
}

export function BCRowActions({
  bc,
  auditContext,
  onOpenViewer,
  onValidate,
  darkMode = false,
}: BCRowActionsProps) {
  const { running, report, run } = useBcAudit();

  // Vérifier si l'audit a été exécuté pour ce BC
  // On vérifie aussi dans bc.auditReport (qui peut être stocké avec le BC)
  const bcAuditReport = bc.auditReport;
  const hasAudit = (!!report && report.bcId === bc.id) || !!bcAuditReport;
  
  // Utiliser le rapport du hook si disponible, sinon celui du BC (formats différents : AuditReport vs BCAuditReport)
  const currentReport = (report && report.bcId === bc.id)
    ? report
    : bcAuditReport
      ? { recommendation: (bcAuditReport.blocking ? 'reject' : 'approve') as 'approve' | 'reject', risk: bcAuditReport.riskLevel }
      : undefined;
  
  // Le bouton de validation est bloqué si :
  // - L'audit n'a pas été exécuté
  // - L'audit a été exécuté mais la recommandation n'est pas "approve"
  // - L'audit a des anomalies critiques/erreurs
  const blocking = !hasAudit || currentReport?.recommendation !== 'approve' || currentReport?.risk === 'critical';

  const handleRunAudit = async () => {
    try {
      // Convertir en BonCommande
      const bonCommande = convertEnrichedBCToBonCommande(bc);
      
      // Exécuter l'audit
      const auditReport = await run(bonCommande, auditContext);
      
      // Ouvrir le viewer avec les résultats de l'audit
      onOpenViewer(bc.id, { audit: auditReport });
    } catch (error) {
      console.error('Erreur lors de l\'audit:', error);
    }
  };

  return (
    <div className="flex gap-1 items-center flex-wrap">
      {/* Loupe = audit complet */}
      <Button
        size="xs"
        variant="secondary"
        className={cn(
          "h-7 w-7 p-0 shrink-0",
          darkMode 
            ? "bg-white/10 hover:bg-white/15" 
            : "bg-gray-100 hover:bg-gray-200"
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleRunAudit();
        }}
        title="Audit complet (loupe)"
        disabled={running}
      >
        <Search className={cn(
          "h-3.5 w-3.5",
          darkMode ? "text-white" : "text-gray-700"
        )} />
      </Button>

      {/* Ouvrir viewer */}
      <Button
        size="xs"
        variant="info"
        className="h-7 w-7 p-0 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onOpenViewer(bc.id);
        }}
        title="Voir détails"
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      {/* Validation BMO : à BLOQUER tant que audit pas ok */}
      <Button
        size="xs"
        variant={blocking ? 'ghost' : 'success'}
        className={cn(
          "h-7 px-2 shrink-0 text-[10px] font-semibold",
          blocking 
            ? darkMode
              ? "bg-emerald-500/20 text-emerald-200/50 cursor-not-allowed opacity-50"
              : "bg-emerald-100 text-emerald-400/50 cursor-not-allowed opacity-50"
            : ""
        )}
        disabled={blocking}
        title={
          blocking 
            ? !hasAudit 
              ? "Audit requis avant validation" 
              : currentReport?.recommendation !== 'approve'
                ? `Audit bloquant : ${currentReport?.recommendation}`
                : "Anomalies à corriger"
            : "Valider BMO"
        }
        onClick={(e) => {
          e.stopPropagation();
          if (onValidate && !blocking) {
            onValidate();
          }
        }}
      >
        <CheckCircle className={cn(
          "h-3 w-3 mr-1",
          blocking && "opacity-50"
        )} />
        Valider
      </Button>
    </div>
  );
}

