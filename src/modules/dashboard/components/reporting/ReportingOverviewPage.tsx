'use client';
import { KPICard } from '../shared';
import { ChartContainer } from '@/modules/dashboard/charts/ChartKit/ChartContainer';
import { AreaChartLazy } from '@/modules/dashboard/charts/ChartKit/AreaChart';
import { toneToColor } from '@/lib/dashboard/kpi';

export function ReportingOverviewPage({ data }: { data: { monthly: Array<{ mois: string; production_ht: number; facture_ht: number; encaisse_ht: number; rap_ht: number; raf_ht: number }>, dso?: Array<{ mois: string; dso_jours: number }> }}) {
  const last = data.monthly?.[data.monthly.length - 1];
  const kpis = [
    { id:'prod', label:'Production (mois)', value:new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(last?.production_ht ?? 0), color:toneToColor('info') },
    { id:'fact', label:'Facturé (mois)',   value:new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(last?.facture_ht ?? 0),    color:toneToColor('ok') },
    { id:'raf',  label:'Reste à facturer', value:new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(last?.raf_ht ?? 0),       color:toneToColor('warn') },
    { id:'dso',  label:'DSO (jours)',      value:Math.round(data.dso?.[data.dso.length-1]?.dso_jours ?? 0),                                         color:toneToColor('warn') },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map(k => <KPICard key={k.id} kpi={{ id:k.id, label:k.label, value:k.value, color:k.color }} size="md" />)}
      </div>

      <ChartContainer title="Séries mensuelles">
        <AreaChartLazy
          data={data.monthly?.map(m => ({ date:m.mois, prod:m.production_ht, fact:m.facture_ht, enca:m.encaisse_ht })) ?? []}
          series={[
            { key:'prod', label:'Production', color:'#3b82f6' },
            { key:'fact', label:'Facturé',    color:'#22c55e' },
            { key:'enca', label:'Encaisse',   color:'#f59e0b' },
          ]}
        />
      </ChartContainer>
    </div>
  );
}
