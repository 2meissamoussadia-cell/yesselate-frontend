'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CalendarNavigationBarProps {
  currentDate: Date;
  viewType: 'day' | 'workweek' | 'week' | 'month';
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateRangeClick?: () => void;
}

export function CalendarNavigationBar({
  currentDate,
  viewType,
  onPrevious,
  onNext,
  onToday,
  onDateRangeClick,
}: CalendarNavigationBarProps) {
  const formatDateRange = () => {
    if (viewType === 'day') {
      return currentDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    if (viewType === 'workweek' || viewType === 'week') {
      const weekStart = new Date(currentDate);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      
      const weekEnd = new Date(weekStart);
      if (viewType === 'workweek') {
        weekEnd.setDate(weekStart.getDate() + 4); // Lundi à Vendredi
      } else {
        weekEnd.setDate(weekStart.getDate() + 6); // Lundi à Dimanche
      }
      
      const startStr = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const endStr = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
    
    if (viewType === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    
    return '';
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/20">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToday}
          className="text-xs"
        >
          Aujourd'hui
        </Button>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrevious}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNext}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <button
          onClick={onDateRangeClick}
          className="text-sm font-semibold text-slate-200 hover:text-orange-400 transition-colors"
        >
          {formatDateRange()}
        </button>
      </div>
    </div>
  );
}

