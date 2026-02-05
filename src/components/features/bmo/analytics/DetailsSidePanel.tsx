'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, Info, BarChart3 } from 'lucide-react';

interface DetailsSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    type: 'kpi' | 'chart' | 'metric' | 'bureau';
    details: Record<string, any>;
    trend?: 'up' | 'down' | 'stable';
    metadata?: Record<string, string>;
  } | null;
}

export function DetailsSidePanel({ isOpen, onClose, data }: DetailsSidePanelProps) {
  const { darkMode } = useAppStore();

  // ESC pour fermer (cohérent avec overlays)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-800 border-l border-slate-700 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <CardTitle className="text-lg flex items-center gap-2">
              {data.type === 'kpi' && <BarChart3 className="w-5 h-5" />}
              {data.type === 'chart' && <Info className="w-5 h-5" />}
              {data.type === 'bureau' && <BarChart3 className="w-5 h-5" />}
              {data.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Trend indicator */}
          {data.trend && (
            <div className={cn(
              'mb-4 p-3 rounded-lg flex items-center gap-2',
              data.trend === 'up' && 'bg-emerald-500/10 border border-emerald-500/30',
              data.trend === 'down' && 'bg-red-500/10 border border-red-500/30',
              data.trend === 'stable' && 'bg-blue-500/10 border border-blue-500/30',
            )}>
              {data.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              {data.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              {data.trend === 'stable' && <Info className="w-4 h-4 text-blue-400" />}
              <span className="text-sm">
                {data.trend === 'up' && 'Tendance à la hausse'}
                {data.trend === 'down' && 'Tendance à la baisse'}
                {data.trend === 'stable' && 'Tendance stable'}
              </span>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            {Object.entries(data.details).map(([key, value]) => (
              <Card key={key} className="bg-slate-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-semibold">
                      {typeof value === 'number' 
                        ? value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                        : String(value)
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metadata */}
          {data.metadata && Object.keys(data.metadata).length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-semibold mb-3">Métadonnées</h4>
              <div className="space-y-2">
                {Object.entries(data.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <Button variant="default" className="w-full" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

