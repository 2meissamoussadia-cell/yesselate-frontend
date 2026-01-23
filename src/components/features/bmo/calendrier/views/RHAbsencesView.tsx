'use client';

/**
 * RH & Absences - Absences, missions, délégations
 */

import React from 'react';
import { Users, Calendar, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';

interface RHAbsencesViewProps {
  view?: string | null;
  showImpact?: boolean;
}

export function RHAbsencesView({ view, showImpact }: RHAbsencesViewProps = {}) {
  const { absences, missions, delegations } = useCalendrierStore();

  // Données mockées
  const absencesData = absences.length > 0 ? absences : [];
  const missionsData = missions.length > 0 ? missions : [];
  const delegationsData = delegations.length > 0 ? delegations : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Absences du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">{absencesData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Missions terrain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">{missionsData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Délégations actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">
              {delegationsData.filter(d => d.actif).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Absences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Absences</CardTitle>
        </CardHeader>
        <CardContent>
          {absencesData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune absence</p>
          ) : (
            <div className="space-y-3">
              {absencesData.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{absence.employeNom}</div>
                      <div className="text-xs text-slate-400">
                        {absence.type} • {new Date(absence.dateDebut).toLocaleDateString('fr-FR')} - {new Date(absence.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {absence.bureau && <Badge variant="gray">{absence.bureau}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Missions terrain</CardTitle>
        </CardHeader>
        <CardContent>
          {missionsData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune mission</p>
          ) : (
            <div className="space-y-3">
              {missionsData.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{mission.employeNom}</div>
                      <div className="text-xs text-slate-400">
                        {mission.lieu && `${mission.lieu} • `}
                        {new Date(mission.dateDebut).toLocaleDateString('fr-FR')} - {new Date(mission.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {mission.bureau && <Badge variant="gray">{mission.bureau}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Délégations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Délégations actives</CardTitle>
        </CardHeader>
        <CardContent>
          {delegationsData.filter(d => d.actif).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune délégation active</p>
          ) : (
            <div className="space-y-3">
              {delegationsData.filter(d => d.actif).map((delegation) => (
                <div
                  key={delegation.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <UserCheck className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {delegation.delegantNom} → {delegation.delegueNom}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(delegation.dateDebut).toLocaleDateString('fr-FR')} - {new Date(delegation.dateFin).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

