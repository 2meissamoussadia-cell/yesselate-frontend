/**
 * Modal Décisions en attente — décisions stratégiques nécessitant validation.
 * Stats (urgence haute/moyenne, délai moyen), liste avec Approuver / Rejeter / Demander infos.
 */

'use client';

import React from 'react';
import { ClipboardList, CheckCircle2, Eye, MessageCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Decision {
  id: string;
  titre: string;
  demandeur: string;
  date: string;
  urgence: 'haute' | 'moyenne' | 'basse';
  impact: string;
  delaiReponse: number;
  montant: number | null;
}

const MOCK_DECISIONS: Decision[] = [
  {
    id: 'DEC-001',
    titre: 'Validation dépassement budget chantier #042',
    demandeur: 'Chef de projet NICE',
    date: '2026-01-28',
    urgence: 'haute',
    impact: 'Dépassement de 288K XOF, retard 15 jours',
    delaiReponse: 2,
    montant: 288_000,
  },
  {
    id: 'DEC-002',
    titre: 'Arbitrage choix fournisseur électrique',
    demandeur: 'Resp. Achats',
    date: '2026-01-25',
    urgence: 'moyenne',
    impact: 'Différence 450K XOF entre offres',
    delaiReponse: 5,
    montant: 450_000,
  },
  {
    id: 'DEC-003',
    titre: 'Replanification phase 3 - #038',
    demandeur: 'Coord. Planning',
    date: '2026-01-24',
    urgence: 'haute',
    impact: 'Décalage livraison 3 semaines',
    delaiReponse: 6,
    montant: null,
  },
  {
    id: 'DEC-004',
    titre: 'Changement prestataire nettoyage',
    demandeur: 'Resp. Exploitation',
    date: '2026-01-22',
    urgence: 'basse',
    impact: 'Économie 120K XOF/an',
    delaiReponse: 8,
    montant: -120_000,
  },
  {
    id: 'DEC-005',
    titre: 'Achat équipement sécurité supplémentaire',
    demandeur: 'Resp. HSE',
    date: '2026-01-20',
    urgence: 'haute',
    impact: 'Conformité réglementation 2026',
    delaiReponse: 10,
    montant: 350_000,
  },
];

export interface DecisionsEnAttenteModalProps {
  open: boolean;
  onClose: () => void;
}

export function DecisionsEnAttenteModal({ open, onClose }: DecisionsEnAttenteModalProps) {
  const decisions = MOCK_DECISIONS;
  const urgenceHaute = decisions.filter((d) => d.urgence === 'haute').length;
  const urgenceMoyenne = decisions.filter((d) => d.urgence === 'moyenne').length;
  const delaiMoyen =
    decisions.length > 0
      ? (
          decisions.reduce((sum, d) => sum + d.delaiReponse, 0) / decisions.length
        ).toFixed(1)
      : '0';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto"
        onClose={onClose}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">📋 Décisions en attente ({decisions.length})</DialogTitle>
          <DialogDescription>
            Décisions stratégiques nécessitant votre validation
          </DialogDescription>
        </DialogHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card className="bg-slate-800/50 border-red-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400">Urgence haute</p>
              <p className="text-2xl font-bold text-red-400">{urgenceHaute}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-amber-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400">Urgence moyenne</p>
              <p className="text-2xl font-bold text-amber-400">{urgenceMoyenne}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400">Délai moyen</p>
              <p className="text-2xl font-bold text-slate-100">{delaiMoyen} jours</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des décisions */}
        <div className="space-y-3">
          {decisions.map((decision) => (
            <Card
              key={decision.id}
              className={cn(
                'bg-slate-800/50',
                decision.urgence === 'haute' && 'border-red-500/50',
                decision.urgence === 'moyenne' && 'border-amber-500/50',
                decision.urgence === 'basse' && 'border-slate-700'
              )}
            >
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 font-mono">{decision.id}</span>
                      <Badge
                        className={cn(
                          decision.urgence === 'haute' && 'bg-red-500/20 text-red-400',
                          decision.urgence === 'moyenne' && 'bg-amber-500/20 text-amber-400',
                          decision.urgence === 'basse' && 'bg-sky-500/20 text-sky-400'
                        )}
                      >
                        {decision.urgence === 'haute' && 'Haute'}
                        {decision.urgence === 'moyenne' && 'Moyenne'}
                        {decision.urgence === 'basse' && 'Basse'}
                      </Badge>
                      {decision.delaiReponse <= 3 && (
                        <Badge variant="destructive">⏰ Urgent</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-100 mb-2">{decision.titre}</h4>
                    <p className="text-sm text-slate-400 mb-3">{decision.impact}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>Par: {decision.demandeur}</span>
                      <span>•</span>
                      <span>Il y a {decision.delaiReponse} jours</span>
                      {decision.montant != null && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              decision.montant > 0 ? 'text-amber-400' : 'text-green-400'
                            }
                          >
                            {decision.montant > 0 ? '+' : ''}
                            {(decision.montant / 1000).toFixed(0)}K XOF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 inline-flex items-center gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Rejeter
                  </Button>
                  <Button size="sm" variant="ghost" className="text-slate-400 inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Demander + d&apos;infos
                  </Button>
                  <Button size="sm" variant="ghost" className="text-slate-400 inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center pt-4 border-t border-slate-800 gap-2">
          <Button variant="ghost" className="text-slate-400">
            Voir historique complet
          </Button>
          <Button variant="outline" onClick={onClose} className="border-slate-600">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
