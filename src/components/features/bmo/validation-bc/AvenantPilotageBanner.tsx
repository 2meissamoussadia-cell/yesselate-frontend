'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Ban, DollarSign, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import type { Amendment } from '@/lib/types/bmo.types';
import { cn } from '@/lib/cn';

interface AvenantPilotageBannerProps {
  avenants: Amendment[];
  onFilterClick?: (type: 'financier' | 'delai' | 'technique' | 'all') => void;
}

export function AvenantPilotageBanner({ avenants, onFilterClick }: AvenantPilotageBannerProps) {
  // Calcul des statistiques
  const stats = {
    total: avenants.length,
    financier: avenants.filter(a => a.impact === 'Financier').length,
    delai: avenants.filter(a => a.impact === 'Délai').length,
    technique: avenants.filter(a => a.impact === 'Technique').length,
    blocked: avenants.filter(a => a.status === 'pending').length,
    totalAmount: avenants.reduce((sum, a) => {
      if (a.montant) {
        const amount = parseFloat(a.montant.replace(/[^\d.]/g, '')) || 0;
        return sum + amount;
      }
      return sum;
    }, 0),
    validatedCount: avenants.filter(a => a.status === 'validated').length,
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
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Avenants</span>
              <Badge variant="info">{stats.total}</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400 mt-1">En attente</p>
          </CardContent>
        </Card>

        {/* Financier */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.financier > 0 ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('financier')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Financier</span>
              <DollarSign className="w-3 h-3 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.financier}</p>
            <p className="text-[10px] text-slate-400 mt-1">Impact budget</p>
          </CardContent>
        </Card>

        {/* Délai */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.delai > 0 ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('delai')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Délai</span>
              <Clock className="w-3 h-3 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.delai}</p>
            <p className="text-[10px] text-slate-400 mt-1">Extension</p>
          </CardContent>
        </Card>

        {/* Technique */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.technique > 0 ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('technique')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Technique</span>
              <FileText className="w-3 h-3 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.technique}</p>
            <p className="text-[10px] text-slate-400 mt-1">Modifications</p>
          </CardContent>
        </Card>

        {/* Bloqués */}
        <Card 
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg',
            stats.blocked > 0 ? 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5' : 'border-slate-700/30'
          )}
          onClick={() => onFilterClick?.('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Bloqués</span>
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
              <span className="text-xs text-slate-400">Impact total</span>
              <DollarSign className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">{formatAmount(stats.totalAmount)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Montant cumulé</p>
          </CardContent>
        </Card>

        {/* Validés */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Validés</span>
              <CheckCircle className="w-3 h-3 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.validatedCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">Ce mois</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

