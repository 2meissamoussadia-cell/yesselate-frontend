/**
 * Conformité & Performance > Conformité contrats & SLA
 * Respect SLA fournisseurs/prestataires, Conformité clauses contrats, Pénalités appliquées/à appliquer, Tendances respect
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export function ContractSLAView() {
  const slas = [
    {
      id: '1',
      provider: 'Fournisseur A',
      contract: 'Contrat Alpha',
      compliance: 96,
      trend: 'up',
      penalties: { applied: '2.5K€', pending: '0€' },
      status: 'compliant',
    },
    {
      id: '2',
      provider: 'Prestataire B',
      contract: 'Contrat Beta',
      compliance: 78,
      trend: 'down',
      penalties: { applied: '0€', pending: '5K€' },
      status: 'non-compliant',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Conformité contrats & SLA</h2>
        <p className="text-sm text-slate-400 mt-1">
          Respect SLA fournisseurs/prestataires, conformité clauses, pénalités, tendances respect
        </p>
      </div>

      {/* Taux de conformité global */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Taux de conformité global</h3>
        </div>
        <div className="text-3xl font-bold text-emerald-400">87%</div>
        <p className="text-sm text-slate-400 mt-1">5 contrats en dépassement</p>
      </div>

      {/* Liste SLA */}
      <div className="space-y-4">
        {slas.map((sla) => (
          <div
            key={sla.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <h3 className="text-base font-semibold text-slate-200">{sla.provider}</h3>
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {sla.contract}
                  </Badge>
                  <Badge
                    variant={sla.status === 'compliant' ? 'default' : 'destructive'}
                    className={cn(
                      'text-xs',
                      sla.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
                    )}
                  >
                    {sla.status === 'compliant' ? 'Conforme' : 'Non conforme'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Taux de conformité:</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xl font-semibold',
                        sla.compliance >= 90 ? 'text-emerald-400' : sla.compliance >= 75 ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {sla.compliance}%
                      </span>
                      {sla.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Pénalités appliquées:</p>
                    <p className="text-slate-300 font-medium">{sla.penalties.applied}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Pénalités à appliquer:</p>
                    <p className={cn(
                      'font-medium',
                      sla.penalties.pending !== '0€' ? 'text-red-400' : 'text-slate-300'
                    )}>
                      {sla.penalties.pending}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

