/**
 * Page : Alertes en cours > Critiques > Paiements bloqués
 */

'use client';

import React from 'react';
import { useAlertesByTypologie } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alerte } from '../types/alertesTypes';

export function CritiquesPaiementsBloques() {
  const { data: alertes, isLoading } = useAlertesByTypologie('paiement-bloque');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des alertes...</div>
      </div>
    );
  }

  if (!alertes || alertes.length === 0) {
    return (
      <div className="p-6">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun paiement bloqué pour le moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getDaysSince = (date: Date) => {
    const diff = Date.now() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Paiements bloqués</h2>
        <p className="text-sm text-slate-400">
          {alertes.length} paiement{alertes.length > 1 ? 's' : ''} bloqué{alertes.length > 1 ? 's' : ''} nécessitant une action immédiate
        </p>
      </div>

      <div className="grid gap-4">
        {alertes.map((alerte: Alerte) => {
          const daysSince = getDaysSince(alerte.dateCreation);
          return (
            <Card
              key={alerte.id}
              className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-slate-200 mb-2">
                      {alerte.titre}
                    </CardTitle>
                    <p className="text-sm text-slate-400">{alerte.description}</p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Critique
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Montant</p>
                      <p className="text-sm font-medium text-slate-200">
                        {alerte.montant?.toLocaleString('fr-FR')} {alerte.devise}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Responsable</p>
                      <p className="text-sm font-medium text-slate-200">
                        {alerte.responsable || 'Non assigné'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Bloqué depuis</p>
                      <p className="text-sm font-medium text-slate-200">
                        {daysSince} jour{daysSince > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400">
                    Créé le {formatDate(alerte.dateCreation)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

