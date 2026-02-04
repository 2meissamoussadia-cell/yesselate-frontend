/**
 * Graphiques complémentaires pour la vue Gantt
 * Statistiques et tendances
 */

'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Jalon, EvenementCalendrier, Chantier } from '../types/calendrierTypes';

interface GanttStatsChartsProps {
  jalons: Jalon[];
  evenements: EvenementCalendrier[];
  chantiers: Chantier[];
  className?: string;
}

const COLORS = {
  normal: '#3b82f6',
  risque: '#f59e0b',
  retard: '#ef4444',
  evenement: '#a855f7',
};

export function GanttStatsCharts({
  jalons,
  evenements,
  chantiers,
  className,
}: GanttStatsChartsProps) {
  // Statistiques par type de jalon
  const statsByType = useMemo(() => {
    const stats = {
      CONTRAT: { normal: 0, risque: 0, retard: 0 },
      SLA: { normal: 0, risque: 0, retard: 0 },
      INTERNE: { normal: 0, risque: 0, retard: 0 },
    };

    jalons.forEach((jalon) => {
      if (jalon.type && stats[jalon.type as keyof typeof stats]) {
        if (jalon.est_retard) {
          stats[jalon.type as keyof typeof stats].retard++;
        } else if (jalon.est_sla_risque) {
          stats[jalon.type as keyof typeof stats].risque++;
        } else {
          stats[jalon.type as keyof typeof stats].normal++;
        }
      }
    });

    return [
      { name: 'CONTRAT', normal: stats.CONTRAT.normal, risque: stats.CONTRAT.risque, retard: stats.CONTRAT.retard },
      { name: 'SLA', normal: stats.SLA.normal, risque: stats.SLA.risque, retard: stats.SLA.retard },
      { name: 'INTERNE', normal: stats.INTERNE.normal, risque: stats.INTERNE.risque, retard: stats.INTERNE.retard },
    ];
  }, [jalons]);

  // Distribution par chantier
  const distributionByChantier = useMemo(() => {
    const distribution: Record<number, { nom: string; jalons: number; evenements: number }> = {};

    jalons.forEach((jalon) => {
      if (jalon.chantier_id) {
        if (!distribution[jalon.chantier_id]) {
          const chantier = chantiers.find((c) => c.id === jalon.chantier_id);
          distribution[jalon.chantier_id] = {
            nom: chantier?.nom || `Chantier ${jalon.chantier_id}`,
            jalons: 0,
            evenements: 0,
          };
        }
        distribution[jalon.chantier_id].jalons++;
      }
    });

    evenements.forEach((event) => {
      if (event.chantier_id) {
        if (!distribution[event.chantier_id]) {
          const chantier = chantiers.find((c) => c.id === event.chantier_id);
          distribution[event.chantier_id] = {
            nom: chantier?.nom || `Chantier ${event.chantier_id}`,
            jalons: 0,
            evenements: 0,
          };
        }
        distribution[event.chantier_id].evenements++;
      }
    });

    return Object.values(distribution);
  }, [jalons, evenements, chantiers]);

  // Distribution par statut
  const distributionByStatut = useMemo(() => {
    const normal = jalons.filter((j) => !j.est_retard && !j.est_sla_risque).length;
    const risque = jalons.filter((j) => j.est_sla_risque && !j.est_retard).length;
    const retard = jalons.filter((j) => j.est_retard).length;

    return [
      { name: 'Normal', value: normal, color: COLORS.normal },
      { name: 'À risque', value: risque, color: COLORS.risque },
      { name: 'En retard', value: retard, color: COLORS.retard },
    ];
  }, [jalons]);

  // Événements par type
  const evenementsByType = useMemo(() => {
    const types: Record<string, number> = {};
    evenements.forEach((event) => {
      const type = event.type || 'AUTRE';
      types[type] = (types[type] || 0) + 1;
    });

    return Object.entries(types).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  }, [evenements]);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {/* Graphique par type de jalon */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">
            Jalons par type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <YAxis
                tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgb(255, 255, 255)' }}
              />
              <Legend
                wrapperStyle={{ color: 'rgb(203, 213, 225)', fontSize: '12px' }}
              />
              <Bar dataKey="normal" stackId="a" fill={COLORS.normal} name="Normal" />
              <Bar dataKey="risque" stackId="a" fill={COLORS.risque} name="À risque" />
              <Bar dataKey="retard" stackId="a" fill={COLORS.retard} name="En retard" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution par statut */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200">
            Distribution par statut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distributionByStatut}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionByStatut.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution par chantier */}
      {distributionByChantier.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">
              Répartition par chantier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distributionByChantier}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="nom"
                  tick={{ fill: 'rgb(148, 163, 184)', fontSize: 10 }}
                  stroke="rgba(255, 255, 255, 0.1)"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  wrapperStyle={{ color: 'rgb(203, 213, 225)', fontSize: '12px' }}
                />
                <Bar dataKey="jalons" fill={COLORS.normal} name="Jalons" />
                <Bar dataKey="evenements" fill={COLORS.evenement} name="Événements" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Événements par type */}
      {evenementsByType.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-200">
              Événements par type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={evenementsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgb(148, 163, 184)', fontSize: 10 }}
                  stroke="rgba(255, 255, 255, 0.1)"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill={COLORS.evenement} name="Nombre" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

