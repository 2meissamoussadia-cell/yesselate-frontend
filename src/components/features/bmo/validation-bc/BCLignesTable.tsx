'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Package } from 'lucide-react';
import type { BCLigne } from '@/lib/types/document-validation.types';

interface BCLignesTableProps {
  lignes: BCLigne[];
  montantHT: number;
  tva: number;
  montantTTC: number;
}

export function BCLignesTable({ lignes, montantHT, tva, montantTTC }: BCLignesTableProps) {
  const { darkMode } = useAppStore();

  const tvaAmount = montantTTC - montantHT;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="w-4 h-4" />
          Lignes du bon de commande ({lignes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn('border-b', darkMode ? 'border-slate-700/50 bg-slate-800/30' : 'border-gray-200 bg-gray-50')}>
                <th className="px-4 py-3 text-left font-semibold text-amber-500">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-amber-500">Désignation</th>
                <th className="px-4 py-3 text-right font-semibold text-amber-500">Quantité</th>
                <th className="px-4 py-3 text-right font-semibold text-amber-500">PU HT</th>
                <th className="px-4 py-3 text-right font-semibold text-amber-500">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b',
                    darkMode ? 'border-slate-700/30 hover:bg-slate-800/30' : 'border-gray-100 hover:bg-gray-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <Badge variant="info" className="font-mono text-xs">
                      {ligne.code}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{ligne.designation}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{ligne.quantite}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {ligne.prixUnitaireHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                    {ligne.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={cn('border-t-2', darkMode ? 'border-amber-500/50 bg-amber-500/10' : 'border-amber-500 bg-amber-50')}>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                  Montant HT total :
                </td>
                <td colSpan={2} className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                  {montantHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
                </td>
              </tr>
              <tr className={cn('border-b', darkMode ? 'border-slate-700/30' : 'border-gray-200')}>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                  TVA ({tva}%) :
                </td>
                <td colSpan={2} className="px-4 py-3 text-right font-mono">
                  {tvaAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
                </td>
              </tr>
              <tr className={cn('border-t-2', darkMode ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50')}>
                <td colSpan={3} className="px-4 py-3 text-right font-bold text-lg">
                  Montant TTC :
                </td>
                <td colSpan={2} className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-lg">
                  {montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

