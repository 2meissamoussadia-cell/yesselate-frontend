/**
 * Conformité & Performance > Engagements (budgets, délais)
 * Respect budgets par projet, Respect jalons contrats, Écarts vs engagement initial, Analyse tendances dépassements
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export function CommitmentsView() {
  const commitments = [
    {
      id: '1',
      project: 'Projet Alpha',
      budget: { committed: '18.7M€', consumed: '12.5M€', percentage: 67, status: 'on-track' },
      milestones: { total: 10, respected: 9, late: 1, percentage: 90 },
      variance: { budget: '-3%', milestones: '+5%' },
    },
    {
      id: '2',
      project: 'Projet Beta',
      budget: { committed: '12.3M€', consumed: '10.2M€', percentage: 83, status: 'at-risk' },
      milestones: { total: 8, respected: 6, late: 2, percentage: 75 },
      variance: { budget: '+8%', milestones: '-10%' },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Engagements (budgets, délais)</h2>
        <p className="text-sm text-slate-400 mt-1">
          Respect budgets par projet, respect jalons contrats, écarts vs engagement initial, tendances dépassements
        </p>
      </div>

      <div className="space-y-4">
        {commitments.map((commitment) => (
          <div
            key={commitment.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-200 mb-4">{commitment.project}</h3>
                
                {/* Budget */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-400">Budget</span>
                    <Badge
                      variant={commitment.budget.status === 'on-track' ? 'default' : 'warning'}
                      className={cn(
                        'text-xs',
                        commitment.budget.status === 'on-track' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
                      )}
                    >
                      {commitment.budget.status === 'on-track' ? 'On-track' : 'At-risk'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Engagé:</span>
                      <span className="text-slate-300">{commitment.budget.committed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Consommé:</span>
                      <span className="text-slate-300">{commitment.budget.consumed}</span>
                    </div>
                    <div className="w-full bg-slate-900/50 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          commitment.budget.percentage <= 75 ? 'bg-emerald-500' :
                          commitment.budget.percentage <= 90 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${commitment.budget.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{commitment.budget.percentage}%</span>
                      <span>Écart: {commitment.variance.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Jalons */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-400">Jalons contrats</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Total:</p>
                      <p className="text-slate-300 font-medium">{commitment.milestones.total}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Respectés:</p>
                      <p className="text-emerald-400 font-medium">{commitment.milestones.respected}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">En retard:</p>
                      <p className="text-red-400 font-medium">{commitment.milestones.late}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Taux respect: {commitment.milestones.percentage}%</span>
                      <span>Écart: {commitment.variance.milestones}</span>
                    </div>
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

