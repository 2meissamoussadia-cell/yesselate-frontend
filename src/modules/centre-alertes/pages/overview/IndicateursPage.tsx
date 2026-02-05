/**
 * Page : Vue d'ensemble > Indicateurs en temps réel
 */

'use client';

import React from 'react';
import { useAlertesStats } from '../../hooks';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';

export function IndicateursPage() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:13',message:'Component render start',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const { data: stats, isLoading, error, isError } = useAlertesStats();

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:16',message:'Hook result',data:{hasStats:!!stats,isLoading,isError,hasError:!!error,statsType:typeof stats,statsKeys:stats?Object.keys(stats):null,parStatutExists:!!stats?.parStatut,parStatutType:typeof stats?.parStatut},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des indicateurs...</div>
      </div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:26',message:'Before stats check',data:{hasStats:!!stats,isError,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (isError || error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:30',message:'Error state detected',data:{isError,errorType:typeof error,errorMessage:error?.message,errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Aucune donnée disponible</div>
      </div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:41',message:'Before kpiCards creation',data:{statsTotal:stats?.total,statsCritiques:stats?.critiques,statsSla:stats?.sla,statsRh:stats?.rh,statsProjets:stats?.projets,hasParStatut:!!stats?.parStatut,parStatutResolue:stats?.parStatut?.RESOLUE},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C,D'})}).catch(()=>{});
  // #endregion

  const kpiCards = [
    {
      icon: Activity,
      title: 'Total alertes',
      value: stats.total,
      color: 'muted',
    },
    {
      icon: AlertTriangle,
      title: 'Critiques',
      value: stats.critiques,
      color: 'critical',
    },
    {
      icon: AlertCircle,
      title: 'SLA',
      value: stats.sla,
      color: 'warning',
    },
    {
      icon: AlertCircle,
      title: 'RH',
      value: stats.rh,
      color: 'warning',
    },
    {
      icon: AlertCircle,
      title: 'Projets',
      value: stats.projets,
      color: 'warning',
    },
    {
      icon: CheckCircle2,
      title: 'Résolues',
      value: stats.parStatut?.RESOLUE ?? 0,
      color: 'success',
    },
  ];

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:70',message:'kpiCards created',data:{cardsLength:kpiCards.length,cardValues:kpiCards.map(c=>({title:c.title,value:c.value,valueType:typeof c.value}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Indicateurs en temps réel</h2>
        <p className="text-sm text-slate-400">
          Vue d'ensemble des alertes actives et des métriques clés
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/0b964413-eed3-40ad-a394-ee48eac3d7a0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IndicateursPage.tsx:83',message:'Rendering card',data:{cardTitle:card.title,cardValue:card.value,valueType:typeof card.value,valueIsUndefined:card.value===undefined,valueIsNull:card.value===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                'p-4 rounded-lg border transition-all hover:scale-105',
                card.color === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : card.color === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : card.color === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{card.title}</span>
              </div>
              <div className="text-2xl font-bold">{card.value ?? 0}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

