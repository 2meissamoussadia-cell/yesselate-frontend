'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClientsDashboardProps {
  clientsGlobalStats: any;
  evolution: Array<{ month: string; nouveaux: number; chiffreAffaires: number }>;
}

const fmtFcfa = (n: number) =>
  Number(n ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA';

export function ClientsDashboard({ clientsGlobalStats, evolution }: ClientsDashboardProps) {
  const summary = useMemo(() => {
    return {
      totalClients: clientsGlobalStats?.totalClients ?? 0,
      clientsActifs: clientsGlobalStats?.clientsActifs ?? 0,
      nouveauxClientsMois: clientsGlobalStats?.nouveauxClientsMois ?? 0,
      chiffreAffairesTotalAnnee: clientsGlobalStats?.chiffreAffairesTotalAnnee ?? 0,
      tauxFidelisation: clientsGlobalStats?.tauxFidelisation ?? 0,
      scoreSatisfactionMoyen: clientsGlobalStats?.scoreSatisfactionMoyen ?? 0,
      topClients: clientsGlobalStats?.topClients ?? [],
      repartitionParType: clientsGlobalStats?.repartitionParType ?? [],
    };
  }, [clientsGlobalStats]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              👥 Clients (total)
              <Badge variant="info">{summary.totalClients}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{summary.totalClients.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-slate-400 mt-1">Actifs: {summary.clientsActifs.toLocaleString('fr-FR')}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              🆕 Nouveaux (mois)
              <Badge variant="success">+{summary.nouveauxClientsMois}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-400">{summary.nouveauxClientsMois}</div>
            <p className="text-xs text-slate-400 mt-1">Taux fidélisation: {Number(summary.tauxFidelisation).toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              💸 CA (année)
              <Badge variant="warning">YTD</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-400">{fmtFcfa(summary.chiffreAffairesTotalAnnee)}</div>
            <p className="text-xs text-slate-400 mt-1">Satisfaction: {Number(summary.scoreSatisfactionMoyen).toFixed(0)}/100</p>
          </CardContent>
        </Card>
        <Card className="border-slate-600/40">
          <CardHeader>
            <CardTitle className="text-sm">🏷️ Répartition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {summary.repartitionParType.map((r: any) => (
              <div key={r.type} className="flex items-center justify-between">
                <span className="text-slate-400">{r.type}</span>
                <span className="font-semibold">
                  {r.count} <span className="text-slate-400">({r.percentage}%)</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-slate-600/40">
          <CardHeader>
            <CardTitle className="text-sm">📊 Nouveaux clients (mensuel)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={evolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="nouveaux" fill="#10B981" name="Nouveaux clients" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/40">
          <CardHeader>
            <CardTitle className="text-sm">📈 Chiffre d'affaires (mensuel)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart data={evolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => fmtFcfa(Number(value))}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="chiffreAffaires" stroke="#F97316" strokeWidth={2} name="CA" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-600/40">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            🏆 Top clients
            <Badge variant="default">{summary.topClients.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {summary.topClients.map((c: any) => (
            <div key={c.clientId} className="flex items-center justify-between">
              <span className="text-slate-300">{c.clientName}</span>
              <span className="font-semibold text-amber-400">{fmtFcfa(c.chiffreAffaires)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


