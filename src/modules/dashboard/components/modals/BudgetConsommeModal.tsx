/**
 * Modal Budget Consommé — détail consommation budgétaire par chantier.
 * Vue d'ensemble, progression globale, alertes > 95%, détail par chantier.
 */

'use client';

import React from 'react';
import { AlertTriangle, BarChart3, Download, Lock, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

interface ChantierBudget {
  id: string;
  nom: string;
  budgetInitial: number;
  consomme: number;
  pourcentage: number;
}

const MOCK_CHANTIERS: ChantierBudget[] = [
  { id: '#042', nom: 'Rénovation NICE', budgetInitial: 50_000_000, consomme: 48_500_000, pourcentage: 97 },
  { id: '#038', nom: 'Extension bureaux', budgetInitial: 35_000_000, consomme: 33_250_000, pourcentage: 95 },
  { id: '#034', nom: 'Parking souterrain', budgetInitial: 28_000_000, consomme: 26_600_000, pourcentage: 95 },
  { id: '#045', nom: 'Réhabilitation façade', budgetInitial: 42_000_000, consomme: 38_640_000, pourcentage: 92 },
  { id: '#033', nom: 'Aménagement espaces verts', budgetInitial: 18_000_000, consomme: 15_480_000, pourcentage: 86 },
];

export interface BudgetConsommeModalProps {
  open: boolean;
  onClose: () => void;
}

export function BudgetConsommeModal({ open, onClose }: BudgetConsommeModalProps) {
  const chantiers = MOCK_CHANTIERS;
  const budgetTotal = chantiers.reduce((sum, c) => sum + c.budgetInitial, 0);
  const consommeTotal = chantiers.reduce((sum, c) => sum + c.consomme, 0);
  const pourcentageGlobal = Math.round((consommeTotal / budgetTotal) * 100);
  const chantiersAlert = chantiers.filter((c) => c.pourcentage >= 95).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto"
        onClose={onClose}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            <span className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-400 shrink-0" aria-hidden />
              Budget Consommé — Portefeuille
            </span>
          </DialogTitle>
          <DialogDescription>Suivi de la consommation budgétaire par chantier</DialogDescription>
        </DialogHeader>

        {/* Vue d'ensemble */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Budget total alloué</p>
                <p className="text-2xl font-bold text-slate-100">
                  {(budgetTotal / 1_000_000).toFixed(1)}M XOF
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Consommé</p>
                <p className="text-2xl font-bold text-amber-400">
                  {(consommeTotal / 1_000_000).toFixed(1)}M XOF
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Taux de consommation</p>
                <p className="text-2xl font-bold text-red-400">{pourcentageGlobal}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-slate-400">Progression globale</span>
                <span className="text-slate-100 font-semibold">{pourcentageGlobal}%</span>
              </div>
              <Progress value={pourcentageGlobal} variant={pourcentageGlobal >= 95 ? 'error' : 'default'} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Alerte chantiers > 95% */}
        {chantiersAlert > 0 && (
          <div className="rounded-lg border border-red-500/50 bg-red-900/20 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold text-red-300">
                ⚠️ {chantiersAlert} chantier{chantiersAlert > 1 ? 's' : ''} au-dessus de 95%
              </p>
              <p className="text-sm text-red-200/80 mt-1">
                Action requise pour éviter les dépassements budgétaires
              </p>
            </div>
          </div>
        )}

        {/* Liste détaillée des chantiers */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-100 mb-3">Détail par chantier</h4>
          {chantiers.map((chantier) => {
            const reste = chantier.budgetInitial - chantier.consomme;
            const alertLevel =
              chantier.pourcentage >= 95 ? 'critique' : chantier.pourcentage >= 90 ? 'warning' : 'ok';

            return (
              <Card
                key={chantier.id}
                className={cn(
                  'bg-slate-800/50',
                  alertLevel === 'critique' && 'border-red-500/50',
                  alertLevel === 'warning' && 'border-amber-500/50',
                  alertLevel === 'ok' && 'border-slate-700'
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {chantier.id}
                        </Badge>
                        <h5 className="font-semibold text-slate-100">{chantier.nom}</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Budget initial</p>
                          <p className="text-slate-100 font-semibold">
                            {(chantier.budgetInitial / 1_000_000).toFixed(1)}M XOF
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Consommé</p>
                          <p className="text-amber-400 font-semibold">
                            {(chantier.consomme / 1_000_000).toFixed(1)}M XOF
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Reste</p>
                          <p
                            className={cn(
                              'font-semibold',
                              reste < 0 ? 'text-red-400' : 'text-green-400'
                            )}
                          >
                            {(reste / 1_000_000).toFixed(1)}M XOF
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        'shrink-0',
                        alertLevel === 'critique' && 'bg-red-500/20 text-red-400',
                        alertLevel === 'warning' && 'bg-amber-500/20 text-amber-400',
                        alertLevel === 'ok' && 'bg-green-500/20 text-green-400'
                      )}
                    >
                      {chantier.pourcentage}%
                    </Badge>
                  </div>

                  <Progress
                    value={chantier.pourcentage}
                    variant={alertLevel === 'critique' ? 'error' : alertLevel === 'warning' ? 'warning' : 'default'}
                    className="h-2 mb-4"
                  />

                  {alertLevel === 'critique' && (
                    <div className="bg-red-900/20 p-3 rounded-lg mb-3">
                      <p className="text-sm text-red-400 font-semibold mb-2">⚠️ Action urgente requise</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Bloquer nouvelles dépenses non essentielles</li>
                        <li>• Renégocier avec fournisseurs</li>
                        <li>• Demander avenant si nécessaire</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-sky-600 hover:bg-sky-700 text-white inline-flex items-center gap-1.5"
                      onClick={() => {
                        toast.info('Voir détail budget', { description: 'Ouverture de la vue Budget & engagements…' });
                        onClose();
                      }}
                    >
                      <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Voir détail
                    </Button>
                    {alertLevel === 'critique' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/50 text-amber-400 inline-flex items-center gap-1.5"
                        onClick={() => toast.warning('Bloquer dépenses', { description: 'Action à confirmer avec le contrôleur de gestion. Fonctionnalité à venir.' })}
                      >
                        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Bloquer dépenses
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} className="border-slate-600">
            Fermer
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-white inline-flex items-center gap-2">
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Exporter rapport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
