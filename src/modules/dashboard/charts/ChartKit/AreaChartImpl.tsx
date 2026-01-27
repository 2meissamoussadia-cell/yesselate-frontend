// modules/dashboard/charts/ChartKit/AreaChartImpl.tsx
'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useI18n } from '@/lib/i18n';

export default function AreaChartImpl({ data, series }: { data: any[]; series: Array<{ key: string; label: string; color: string }>}) {
  const { t, fmt } = useI18n();
  if (!data?.length) return <div className="text-slate-400 flex items-center justify-center h-full">{t('empty.noData')}</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3}/>
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8"
          tickFormatter={(value) => {
            if (typeof value === 'string') {
              const date = new Date(value);
              return fmt.date(date, { day: 'numeric', month: 'numeric' });
            }
            return String(value);
          }}
        />
        <YAxis 
          stroke="#94a3b8"
          tickFormatter={(value) => fmt.number(value)}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }}
          formatter={(value: number) => fmt.number(value)}
          labelFormatter={(label) => {
            if (typeof label === 'string') {
              const date = new Date(label);
              return fmt.date(date);
            }
            return String(label);
          }}
        />
        <Legend />
        {series.map(s => (
          <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.2}/>
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
