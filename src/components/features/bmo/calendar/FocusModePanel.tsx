'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, X, Filter } from 'lucide-react';
import { bureaux } from '@/lib/data';

interface FocusModePanelProps {
  activeFocus: {
    type?: 'bureau' | 'project' | 'priority';
    value?: string;
  };
  onFocusChange: (focus: { type?: 'bureau' | 'project' | 'priority'; value?: string }) => void;
}

export function FocusModePanel({ activeFocus, onFocusChange }: FocusModePanelProps) {
  const { darkMode } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFocus = activeFocus.type && activeFocus.value;

  return (
    <Card className={cn(
      'transition-all',
      hasActiveFocus 
        ? 'border-orange-500/50 bg-orange-500/5 shadow-lg' 
        : 'border-slate-700/50'
    )}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className={cn('w-4 h-4', hasActiveFocus ? 'text-orange-400' : 'text-slate-400')} />
            <span className="text-xs font-semibold">Mode Focus BMO</span>
            {hasActiveFocus && (
              <Badge variant="warning" className="text-[9px]">
                Actif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFocus && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onFocusChange({})}
                className="text-[9px]"
              >
                <X className="w-3 h-3 mr-1" />
                Réinitialiser
              </Button>
            )}
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px]"
            >
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-2">
            {/* Focus par bureau */}
            <div>
              <label className="block text-[10px] font-semibold mb-1">Focus Bureau</label>
              <div className="flex flex-wrap gap-1">
                {bureaux.map((bureau) => (
                  <button
                    key={bureau.code}
                    onClick={() => onFocusChange({
                      type: 'bureau',
                      value: bureau.code,
                    })}
                    className={cn(
                      'px-2 py-1 rounded text-[9px] transition-all',
                      activeFocus.type === 'bureau' && activeFocus.value === bureau.code
                        ? 'bg-orange-500 text-white'
                        : darkMode
                        ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {bureau.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus par priorité */}
            <div>
              <label className="block text-[10px] font-semibold mb-1">Focus Priorité</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 'critical', label: 'Critique', color: 'bg-red-500' },
                  { value: 'urgent', label: 'Urgent', color: 'bg-orange-500' },
                  { value: 'high', label: 'Haute', color: 'bg-amber-500' },
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => onFocusChange({
                      type: 'priority',
                      value: priority.value,
                    })}
                    className={cn(
                      'px-2 py-1 rounded text-[9px] transition-all',
                      activeFocus.type === 'priority' && activeFocus.value === priority.value
                        ? `${priority.color} text-white`
                        : darkMode
                        ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasActiveFocus && (
          <div className="mt-2 pt-2 border-t border-slate-700/30">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="info" className="text-[9px]">
                {activeFocus.type}: {activeFocus.value}
              </Badge>
              <span className="text-slate-400 text-[10px]">
                Filtre actif - Vue isolée
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

