'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Ban, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Invoice } from '@/lib/types/bmo.types';
import { cn } from '@/lib/cn';

interface FacturePilotageBannerProps {
  factures: Invoice[];
  onFilterClick?: (type: 'urgent' | 'overdue' | 'blocked') => void;
}

export function FacturePilotageBanner({ factures, onFilterClick }: FacturePilotageBannerProps) {
  // Calcul des statistiques
  const stats = {
    total: factures.length,
    overdue: factures.filter(facture => {
      const [day, month, year] = facture.dateEcheance.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      return dueDate < new Date() && facture.status === 'pending';
    }).length,
    blocked: factures.filter(facture => facture.status === 'pending').length,
    totalAmount: factures.reduce((sum, facture) => {
      const amount = parseFloat(facture.montant.replace(/[^\d.]/g, '')) || 0;
      return sum + amount;
    }, 0),
    validatedAmount: factures.filter(facture => facture.status === 'validated').reduce((sum, facture) => {
      const amount = parseFloat(facture.montant.replace(/[^\d.]/g, '')) || 0;
      return sum + amount;
    }, 0),
    dueSoon: factures.filter(facture => {
      const [day, month, year] = facture.dateEcheance.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue > 0 && facture.status === 'pending';
    }).length,
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}Md FCFA`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M FCFA`;
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <div className="space-y-4">
      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Factures</span>
              <Badge variant="info">{stats.total}</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400 mt-1">En attente</p>
          </CardContent>
        </Card>

        {/* En retard */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.overdue > 0 ? 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('overdue')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Échues</span>
              <div className="flex items-center gap-1">
                {stats.overdue > 0 && <Clock className="w-3 h-3 text-red-400" />}
                <Badge variant={stats.overdue > 0 ? 'urgent' : 'default'}>{stats.overdue}</Badge>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
            <p className="text-[10px] text-slate-400 mt-1">Date dépassée</p>
          </CardContent>
        </Card>

        {/* À échéance */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.dueSoon > 0 ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('urgent')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">À échéance</span>
              <div className="flex items-center gap-1">
                {stats.dueSoon > 0 && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                <Badge variant={stats.dueSoon > 0 ? 'warning' : 'default'}>{stats.dueSoon}</Badge>
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.dueSoon}</p>
            <p className="text-[10px] text-slate-400 mt-1">Sous 7 jours</p>
          </CardContent>
        </Card>

        {/* Bloquées */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.blocked > 0 ? 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('blocked')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Bloquées</span>
              <div className="flex items-center gap-1">
                {stats.blocked > 0 && <Ban className="w-3 h-3 text-red-400" />}
                <Badge variant={stats.blocked > 0 ? 'urgent' : 'default'}>{stats.blocked}</Badge>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
            <p className="text-[10px] text-slate-400 mt-1">Action requise</p>
          </CardContent>
        </Card>

        {/* Montant total */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">En attente</span>
              <DollarSign className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">{formatAmount(stats.totalAmount)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Montant total</p>
          </CardContent>
        </Card>

        {/* Montant validé */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Validé</span>
              <CheckCircle className="w-3 h-3 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-blue-400">{formatAmount(stats.validatedAmount)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Ce mois</p>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400 mb-2">Actions rapides</p>
            <div className="space-y-1">
              <Button
                size="xs"
                variant={stats.dueSoon > 0 ? 'warning' : 'secondary'}
                className="w-full text-xs"
                onClick={() => onFilterClick?.('urgent')}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                À échéance
              </Button>
              <Button
                size="xs"
                variant={stats.overdue > 0 ? 'destructive' : 'secondary'}
                className="w-full text-xs"
                onClick={() => onFilterClick?.('overdue')}
              >
                <Clock className="w-3 h-3 mr-1" />
                Échues
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

