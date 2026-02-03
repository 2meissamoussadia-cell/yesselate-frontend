'use client';

/**
 * Comparateur RACI - Compare deux activités côte à côte
 * Permet d'analyser rapidement les différences et similitudes
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { X, GitCompare } from 'lucide-react';

interface RACIComparatorProps {
  activities: Array<{
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    description?: string;
  }>;
  bureaux: string[];
  onClose?: () => void;
}

export function RACIComparator({ activities, bureaux, onClose }: RACIComparatorProps) {
  const { darkMode } = useAppStore();
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);

  const activity1 = selected1 ? activities.find(a => a.activity === selected1) : null;
  const activity2 = selected2 ? activities.find(a => a.activity === selected2) : null;

  const differences = activity1 && activity2 ? useMemo(() => {
    const diff: Array<{ bureau: string; role1: string; role2: string }> = [];
    bureaux.forEach(bureau => {
      const r1 = activity1.roles[bureau] || '-';
      const r2 = activity2.roles[bureau] || '-';
      if (r1 !== r2) {
        diff.push({ bureau, role1: r1, role2: r2 });
      }
    });
    return diff;
  }, [activity1, activity2, bureaux]) : [];

  const RACI_COLORS: Record<string, string> = {
    'R': 'bg-emerald-400/80 text-white',
    'A': 'bg-blue-400/80 text-white',
    'C': 'bg-amber-400/80 text-white',
    'I': 'bg-slate-400/80 text-white',
    '-': 'bg-slate-700/30 text-slate-400',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-purple-400/80" />
            Comparateur RACI
          </span>
          {onClose && (
            <Button size="xs" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélecteurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Activité 1</label>
            <Select value={selected1 || '__none__'} onValueChange={(v) => setSelected1(v === '__none__' ? null : v)}>
              <SelectTrigger className={cn(
                'w-full px-2 py-2 rounded text-xs border h-9',
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
              )}>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sélectionner...</SelectItem>
                {activities.map(a => (
                  <SelectItem key={a.activity} value={a.activity}>{a.activity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Activité 2</label>
            <Select value={selected2 || '__none__'} onValueChange={(v) => setSelected2(v === '__none__' ? null : v)}>
              <SelectTrigger className={cn(
                'w-full px-2 py-2 rounded text-xs border h-9',
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
              )}>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sélectionner...</SelectItem>
                {activities.map(a => (
                  <SelectItem key={a.activity} value={a.activity}>{a.activity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparaison */}
        {activity1 && activity2 && (
          <div className="space-y-3">
            {/* Différences */}
            {differences.length > 0 ? (
              <div className="p-3 rounded-lg bg-amber-400/8 border border-amber-400/20">
                <p className="text-xs font-semibold text-amber-300/80 mb-2">
                  {differences.length} différence(s) détectée(s)
                </p>
                <div className="space-y-1">
                  {differences.map((diff, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge variant="default" className="text-[9px]">{diff.bureau}</Badge>
                      <span className="text-slate-300">
                        <span className={cn("px-1.5 py-0.5 rounded", RACI_COLORS[diff.role1])}>{diff.role1}</span>
                        {' → '}
                        <span className={cn("px-1.5 py-0.5 rounded", RACI_COLORS[diff.role2])}>{diff.role2}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-400/8 border border-emerald-400/20">
                <p className="text-xs text-emerald-300/80">✅ Aucune différence — Rôles identiques</p>
              </div>
            )}

            {/* Comparaison côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={cn("p-3 rounded-lg border", darkMode ? "bg-slate-800/30 border-slate-700" : "bg-gray-50")}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={activity1.criticality === 'critical' ? 'urgent' : 'default'} className="text-[9px]">
                    {activity1.criticality}
                  </Badge>
                  <span className="text-xs font-semibold">{activity1.activity}</span>
                </div>
                <div className="space-y-1">
                  {bureaux.map(bureau => (
                    <div key={bureau} className="flex items-center justify-between text-xs">
                      <span>{bureau}</span>
                      <span className={cn("w-6 h-6 rounded flex items-center justify-center font-bold", RACI_COLORS[activity1.roles[bureau] || '-'])}>
                        {activity1.roles[bureau] || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cn("p-3 rounded-lg border", darkMode ? "bg-slate-800/30 border-slate-700" : "bg-gray-50")}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={activity2.criticality === 'critical' ? 'urgent' : 'default'} className="text-[9px]">
                    {activity2.criticality}
                  </Badge>
                  <span className="text-xs font-semibold">{activity2.activity}</span>
                </div>
                <div className="space-y-1">
                  {bureaux.map(bureau => (
                    <div key={bureau} className="flex items-center justify-between text-xs">
                      <span>{bureau}</span>
                      <span className={cn("w-6 h-6 rounded flex items-center justify-center font-bold", RACI_COLORS[activity2.roles[bureau] || '-'])}>
                        {activity2.roles[bureau] || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {(!activity1 || !activity2) && (
          <div className="text-center py-8 text-slate-400 text-xs">
            Sélectionnez deux activités pour comparer leurs rôles RACI
          </div>
        )}
      </CardContent>
    </Card>
  );
}

