'use client';

import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  Plus,
} from 'lucide-react';

interface Props {
  delegation: any;
  onAddEngagement: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  OBLIGATION: { label: 'Obligation', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600' },
  PROHIBITION: { label: 'Interdiction', icon: <XCircle className="w-4 h-4" />, color: 'text-rose-600' },
  ALERT: { label: 'Alerte', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-600' },
  REPORTING: { label: 'Reporting', icon: <FileText className="w-4 h-4" />, color: 'text-blue-600' },
  DOCUMENTATION: { label: 'Documentation', icon: <FileText className="w-4 h-4" />, color: 'text-purple-600' },
  COMPLIANCE: { label: 'Conformité', icon: <Shield className="w-4 h-4" />, color: 'text-indigo-600' },
};

const CRITICALITY_CONFIG: Record<string, { label: string; bgClass: string }> = {
  LOW: { label: 'Faible', bgClass: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Moyen', bgClass: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Élevé', bgClass: 'bg-amber-100 text-amber-800' },
  CRITICAL: { label: 'Critique', bgClass: 'bg-rose-100 text-rose-700' },
};

export function DelegationCommitmentsSection({ delegation, onAddEngagement }: Props) {
  if (!delegation) {
    return <div className="text-slate-400 text-center py-8">Aucune donnée</div>;
  }

  const engagements = delegation.engagements || [];

  // Grouper par type
  const byType = engagements.reduce((acc: Record<string, any[]>, eng: any) => {
    const type = eng.engagementType || 'OBLIGATION';
    if (!acc[type]) acc[type] = [];
    acc[type].push(eng);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-purple-500" />
            Engagements du délégataire
          </h2>
          <p className="text-sm text-slate-400">
            Obligations, interdictions et règles à respecter.
          </p>
        </div>
        <FluentButton size="sm" variant="secondary" onClick={onAddEngagement}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Ajouter
        </FluentButton>
      </div>

      {/* Par type */}
      {Object.entries(byType).map(([type, items]) => {
        const config = TYPE_CONFIG[type] || { label: type, icon: <FileText className="w-4 h-4" />, color: 'text-slate-600' };
        
        return (
          <div key={type}>
            <h3 className={cn("font-medium mb-3 flex items-center gap-2", config.color)}>
              {config.icon}
              {config.label}s ({items.length})
            </h3>
            
            <div className="space-y-2">
              {items.map((eng: any) => (
                <EngagementCard key={eng.id} engagement={eng} />
              ))}
            </div>
          </div>
        );
      })}

      {engagements.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <ListChecks className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400">Aucun engagement défini.</p>
          <FluentButton size="sm" variant="secondary" className="mt-4" onClick={onAddEngagement}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Ajouter un engagement
          </FluentButton>
        </div>
      )}
    </div>
  );
}

function EngagementCard({ engagement }: { engagement: any }) {
  const typeConfig = TYPE_CONFIG[engagement.engagementType] || TYPE_CONFIG.OBLIGATION;
  const critConfig = CRITICALITY_CONFIG[engagement.criticality] || CRITICALITY_CONFIG.MEDIUM;
  const isEnabled = engagement.enabled === 1 || engagement.enabled === true;
  
  // Parser les documents requis
  let requiredDocs: any[] = [];
  if (engagement.requiredDocs) {
    try {
      requiredDocs = typeof engagement.requiredDocs === 'string' 
        ? JSON.parse(engagement.requiredDocs) 
        : engagement.requiredDocs;
    } catch {
      requiredDocs = [];
    }
  }

  return (
    <div className={cn(
      "p-4 rounded-xl border",
      isEnabled ? "border-slate-200/70 dark:border-slate-700" : "border-slate-200/50 opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <span className={typeConfig.color}>{typeConfig.icon}</span>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{engagement.title}</span>
            <span className={cn("px-1.5 py-0.5 rounded text-xs", critConfig.bgClass)}>
              {critConfig.label}
            </span>
            {!isEnabled && (
              <span className="text-xs text-slate-400">(désactivé)</span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {engagement.description}
          </p>
          
          {/* Fréquence */}
          {engagement.frequency && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              Fréquence : {engagement.frequency}
            </div>
          )}
          
          {/* Documents requis */}
          {requiredDocs.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-slate-400 mb-1">Documents requis :</div>
              <div className="flex flex-wrap gap-1">
                {requiredDocs.map((doc: any, i: number) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      doc.mandatory
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    )}
                    title={doc.description}
                  >
                    {doc.type} {doc.mandatory && '*'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

