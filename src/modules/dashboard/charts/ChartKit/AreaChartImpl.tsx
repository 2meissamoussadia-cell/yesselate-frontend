// modules/dashboard/charts/ChartKit/AreaChartImpl.tsx
'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AreaChartImpl({ data, series }: { data: any[]; series: Array<{ key: string; label: string; color: string }>}) {
  if (!data?.length) return <div className="text-slate-400 flex items-center justify-center h-full">Aucune donnée</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3}/>
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }}/>
        <Legend />
        {series.map(s => (
          <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.2}/>
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
