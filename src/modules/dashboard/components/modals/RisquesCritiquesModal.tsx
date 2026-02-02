/**
 * Modal Risques critiques — liste des risques nécessitant action (audit ERP BTP 2026).
 * Ouvert au clic sur le KPI "Risques critiques (3)".
 */

'use client';

import React from 'react';
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
import { ClipboardList, Send, Eye } from 'lucide-react';

interface Risque {
  id: string;
  chantier: string;
  type: string;
  gravite: 'critique' | 'eleve' | 'moyen';
  description: string;
  date: string;
  impact?: string;
}

const MOCK_RISQUES: Risque[] = [
  {
    id: 'RISK-001',
    chantier: '#042',
    type: 'Retard livraison',
    gravite: 'critique',
    description: 'Fournisseur peinture en retard — risque 15 j sur phase 4',
    date: '2026-01-29',
    impact: 'Fin chantier +15 j',
  },
  {
    id: 'RISK-002',
    chantier: '#038',
    type: 'Dépassement budget',
    gravite: 'eleve',
    description: 'Dépassement prévu 288K XOF — avenant en attente',
    date: '2026-01-28',
    impact: '288K XOF',
  },
  {
    id: 'RISK-003',
    chantier: '#033',
    type: 'Sécurité',
    gravite: 'critique',
    description: 'PPSPS expiré — renouvellement en cours',
    date: '2026-01-27',
    impact: 'Arrêt possible',
  },
];

export interface RisquesCritiquesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RisquesCritiquesModal({ open, onClose }: RisquesCritiquesModalProps) {
  const risques = MOCK_RISQUES;
  const critique = risques.filter((r) => r.gravite === 'critique').length;
  const eleve = risques.filter((r) => r.gravite === 'eleve').length;
  const moyen = risques.filter((r) => r.gravite === 'moyen').length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl bg-slate-900 text-slate-100 border-slate-700 max-h-[80vh] overflow-y-auto"
        onClose={onClose}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            🔴 Risques critiques ({risques.length})
          </DialogTitle>
          <DialogDescription>
            Risques nécessitant une action ou un suivi
          </DialogDescription>
        </DialogHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card className="bg-slate-800/50 border-red-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400">Critiques</p>
              <p className="text-2xl font-bold text-red-400">{critique}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-amber-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400">Élevés</p>
              <p className="text-2xl font-bold text-amber-400">{eleve}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400">Moyens</p>
              <p className="text-2xl font-bold text-slate-100">{moyen}</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des risques */}
        <div className="space-y-3">
          {risques.map((risque) => (
            <Card
              key={risque.id}
              className={cn(
                'bg-slate-800/50',
                risque.gravite === 'critique' && 'border-red-500/50',
                risque.gravite === 'eleve' && 'border-amber-500/50',
                risque.gravite === 'moyen' && 'border-slate-700'
              )}
            >
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 font-mono">{risque.id}</span>
                      <Badge variant="outline" className="text-slate-400 border-slate-600">
                        {risque.chantier}
                      </Badge>
                      <Badge
                        className={cn(
                          risque.gravite === 'critique' && 'bg-red-500/20 text-red-400',
                          risque.gravite === 'eleve' && 'bg-amber-500/20 text-amber-400',
                          risque.gravite === 'moyen' && 'bg-sky-500/20 text-sky-400'
                        )}
                      >
                        {risque.gravite === 'critique' && 'Critique'}
                        {risque.gravite === 'eleve' && 'Élevé'}
                        {risque.gravite === 'moyen' && 'Moyen'}
                      </Badge>
                      <span className="text-xs text-slate-400">{risque.type}</span>
                    </div>
                    <h4 className="font-semibold text-slate-100 mb-2">{risque.description}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>{risque.date}</span>
                      {risque.impact && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">{risque.impact}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                    Plan d&apos;action
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 inline-flex items-center gap-2">
                    <Send className="h-3.5 w-3.5" aria-hidden />
                    Escalader
                  </Button>
                  <Button size="sm" variant="ghost" className="text-slate-400 inline-flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center pt-4 border-t border-slate-800 gap-2">
          <Button variant="ghost" className="text-slate-400">
            Voir tous les risques
          </Button>
          <Button variant="outline" onClick={onClose} className="border-slate-600">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
