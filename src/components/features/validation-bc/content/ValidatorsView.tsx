/**
 * Vue Validateurs - Performance et statistiques
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Target,
  Zap,
} from 'lucide-react';

interface ValidatorsViewProps {
  subCategory?: string;
}

// Données mockées
const validatorsData = [
  {
    id: '1',
    name: 'Marie Diop',
    role: 'Responsable Achats',
    avatar: 'MD',
    stats: {
      total: 156,
      validated: 148,
      rejected: 8,
      avgDelay: 1.2,
      performance: 95,
    },
    trend: 'up',
    status: 'active',
  },
  {
    id: '2',
    name: 'Amadou Seck',
    role: 'Directeur Finance',
    avatar: 'AS',
    stats: {
      total: 143,
      validated: 135,
      rejected: 8,
      avgDelay: 1.8,
      performance: 94,
    },
    trend: 'up',
    status: 'active',
  },
  {
    id: '3',
    name: 'Fatou Kane',
    role: 'Chef Comptable',
    avatar: 'FK',
    stats: {
      total: 128,
      validated: 115,
      rejected: 13,
      avgDelay: 2.1,
      performance: 90,
    },
    trend: 'down',
    status: 'active',
  },
  {
    id: '4',
    name: 'Ibrahima Fall',
    role: 'Juriste Senior',
    avatar: 'IF',
    stats: {
      total: 87,
      validated: 82,
      rejected: 5,
      avgDelay: 1.5,
      performance: 94,
    },
    trend: 'stable',
    status: 'active',
  },
  {
    id: '5',
    name: 'Aissatou Ndiaye',
    role: 'Responsable Contrats',
    avatar: 'AN',
    stats: {
      total: 112,
      validated: 105,
      rejected: 7,
      avgDelay: 1.7,
      performance: 94,
    },
    trend: 'up',
    status: 'active',
  },
];

export function ValidatorsView({ subCategory = 'all' }: ValidatorsViewProps) {
  const [sortBy, setSortBy] = useState<'performance' | 'total' | 'delay'>('performance');

  const sortedValidators = [...validatorsData].sort((a, b) => {
    if (sortBy === 'performance') return b.stats.performance - a.stats.performance;
    if (sortBy === 'total') return b.stats.total - a.stats.total;
    if (sortBy === 'delay') return a.stats.avgDelay - b.stats.avgDelay;
    return 0;
  });

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 95) {
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Excellent</Badge>;
    }
    if (performance >= 90) {
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Très bon</Badge>;
    }
    if (performance >= 85) {
      return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">Bon</Badge>;
    }
    return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/30">À améliorer</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <div className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Validateurs</h2>
          <p className="text-slate-400 text-sm">
            Performance et statistiques des validateurs
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'performance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('performance')}
            className="h-8"
          >
            Performance
          </Button>
          <Button
            variant={sortBy === 'total' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('total')}
            className="h-8"
          >
            Volume
          </Button>
          <Button
            variant={sortBy === 'delay' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('delay')}
            className="h-8"
          >
            Délai
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Validateurs Actifs</p>
                <p className="text-2xl font-bold text-slate-200">{validatorsData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Performance Moyenne</p>
                <p className="text-2xl font-bold text-slate-200">93.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <CheckCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Validés</p>
                <p className="text-2xl font-bold text-slate-200">585</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Délai Moyen</p>
                <p className="text-2xl font-bold text-slate-200">1.7j</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validators List */}
      <div className="space-y-4">
        {sortedValidators.map((validator, index) => (
          <Card
            key={validator.id}
            className="bg-slate-900/40 border-slate-700/50 hover:border-slate-600/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Validator Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-slate-700">
                      <AvatarFallback className="bg-slate-800 text-slate-300">
                        {validator.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 p-1 rounded-full bg-yellow-500">
                        <Award className="h-3 w-3 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-200">
                        {validator.name}
                      </h3>
                      {getPerformanceBadge(validator.stats.performance)}
                      {getTrendIcon(validator.trend)}
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{validator.role}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Total Traités</p>
                        <p className="text-lg font-semibold text-slate-200">
                          {validator.stats.total}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">Validés</p>
                        <p className="text-lg font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {validator.stats.validated}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">Rejetés</p>
                        <p className="text-lg font-semibold text-red-400 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {validator.stats.rejected}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">Délai Moyen</p>
                        <p className="text-lg font-semibold text-blue-400 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {validator.stats.avgDelay}j
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">Performance</p>
                        <p className="text-lg font-semibold text-purple-400 flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {validator.stats.performance}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank Badge */}
                {index < 3 && (
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                        index === 0 && 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50',
                        index === 1 && 'bg-slate-400/20 text-slate-300 border-2 border-slate-400/50',
                        index === 2 && 'bg-amber-700/20 text-amber-600 border-2 border-amber-700/50'
                      )}
                    >
                      #{index + 1}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

