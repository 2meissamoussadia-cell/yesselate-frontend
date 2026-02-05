'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, X, Clock, Zap } from 'lucide-react';

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

export function FocusMode({ isActive, onToggle, className }: FocusModeProps) {
  const { darkMode } = useAppStore();
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isActive || !isRunning) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggle}
        className={cn('text-xs', className)}
        aria-label="Activer le mode focus"
      >
        <Target className="w-3 h-3 mr-1" />
        Focus
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 p-3 rounded-lg border shadow-lg',
        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold">Mode Focus</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggle}
          className="h-6 w-6 p-0 ml-auto"
          aria-label="Désactiver le mode focus"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isRunning ? 'secondary' : 'ghost'}
          onClick={() => setIsRunning(!isRunning)}
          className="text-xs"
        >
          {isRunning ? <Clock className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
          {isRunning ? 'Pause' : 'Démarrer'}
        </Button>
        <Badge variant="info" className="text-[9px]">
          {formatTime(timer)}
        </Badge>
      </div>
    </div>
  );
}

