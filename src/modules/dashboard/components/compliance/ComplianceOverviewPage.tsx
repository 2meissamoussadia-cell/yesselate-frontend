// modules/dashboard/components/compliance/ComplianceOverviewPage.tsx
'use client';
import { KPICard } from '../shared';
import { toneToColor } from '@lib-root/dashboard/kpi';

export function ComplianceOverviewPage({ data }: { data: {
  ratio_completude_procedure: number; delai_visa_moy_j: number;
  lots_non_attribues: number; avenants_en_visa: number; contrats_pieces_incompletes: number;
}}) {
  const kpis = [
    { id:'comp',  label:'Completude procédures', value: `${Math.round((data.ratio_completude_procedure ?? 0)*100)}%`, color: toneToColor('ok') },
    { id:'visa',  label:'Délai visa (moy/j)',   value: Math.round(data.delai_visa_moy_j ?? 0),                      color: toneToColor('info') },
    { id:'lots',  label:'Lots non attribués',   value: data.lots_non_attribues ?? 0,                                color: toneToColor('warn') },
    { id:'av',    label:'Avenants en visa',     value: data.avenants_en_visa ?? 0,                                  color: toneToColor('warn') },
    { id:'docs',  label:'Contrats incomplets',  value: data.contrats_pieces_incompletes ?? 0,                       color: toneToColor('crit') },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {kpis.map(k => <KPICard key={k.id} kpi={{ id:k.id, label:k.label, value:k.value, color:k.color }} size="md" />)}
    </div>
  );
}
