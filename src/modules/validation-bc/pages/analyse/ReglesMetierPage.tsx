/**
 * Page : Analyse > Règles métier
 */

'use client';

import React from 'react';
import { getReglesMetier } from '../../api/validationApi';
import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ReglesMetierPage() {
  const { data: regles, isLoading, error } = useQuery({
    queryKey: ['validation-bc-regles-metier'],
    queryFn: getReglesMetier,
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des règles métier...</div>
      </div>
    );
  }

  if (error || !regles) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des règles métier</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">Règles métier</h2>
        </div>
        <p className="text-sm text-slate-400">
          Configuration des règles de validation automatique ({regles.length})
        </p>
      </div>

      {regles.length > 0 ? (
        <div className="space-y-4">
          {regles.map((regle) => (
            <div
              key={regle.id}
              className={cn(
                'p-4 rounded-lg border',
                regle.active
                  ? 'bg-slate-800/50 border-slate-700/50'
                  : 'bg-slate-900/30 border-slate-700/30 opacity-60'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-200">{regle.nom}</h3>
                  {regle.active ? (
                    <Badge variant="gray" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactif
                    </Badge>
                  )}
                </div>
                <Badge
                  variant={
                    regle.priorite === 'CRITIQUE'
                      ? 'destructive'
                      : regle.priorite === 'ELEVEE'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {regle.priorite}
                </Badge>
              </div>

              <p className="text-sm text-slate-400 mb-3">{regle.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Type de document:</span>
                  <span className="text-slate-300 ml-2">{regle.typeDocument}</span>
                </div>
                <div>
                  <span className="text-slate-500">Condition:</span>
                  <span className="text-slate-300 ml-2 font-mono">{regle.condition}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500">Action:</span>
                  <span className="text-slate-300 ml-2 font-mono">{regle.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucune règle métier configurée</div>
        </div>
      )}
    </div>
  );
}

