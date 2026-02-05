'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { TrendChart } from './TrendChart';
import { useRouter } from 'next/navigation';

interface KPIDrillDownProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: {
    id: string;
    label: string;
    value: number | string;
    icon: string;
    color: string;
    trend?: string;
  };
  data?: Array<{ period: string; value: number }>;
  breakdown?: Array<{ label: string; value: number; percentage: number }>;
  route?: string;
}

export function KPIDrillDown({ isOpen, onClose, kpi, data, breakdown, route }: KPIDrillDownProps) {
  const { darkMode } = useAppStore();
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigate = useCallback(() => {
    if (route) {
      router.push(route);
      onClose();
    }
  }, [route, router, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Side Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md z-50',
          'bg-slate-900 border-l border-slate-700',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'overflow-y-auto'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kpi-drilldown-title"
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: `${kpi.color}20` }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <CardTitle id="kpi-drilldown-title" className="text-base">
                    {kpi.label}
                  </CardTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    Détails et analyse
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Valeur principale */}
            <div className="text-center p-4 rounded-lg bg-slate-800/50">
              <p className="text-4xl font-bold mb-2">{kpi.value}</p>
              {kpi.trend && (
                <Badge variant="info" className="text-xs">
                  {kpi.trend}
                </Badge>
              )}
            </div>

            {/* Graphique de tendance */}
            {data && data.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Évolution</h3>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <TrendChart
                    data={data}
                    color={kpi.color}
                    height={150}
                    type="area"
                  />
                </div>
              </div>
            )}

            {/* Breakdown */}
            {breakdown && breakdown.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Répartition</h3>
                <div className="space-y-2">
                  {breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: kpi.color }}
                        />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{item.value}</span>
                        <Badge variant="default" className="text-[9px]">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-700">
              {route && (
                <Button
                  onClick={handleNavigate}
                  className="w-full"
                  variant="secondary"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir les détails complets
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

