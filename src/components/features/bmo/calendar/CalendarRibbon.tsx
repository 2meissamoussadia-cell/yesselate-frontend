'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Filter, 
  Printer,
  Sun,
  CalendarDays,
  CalendarRange,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/cn';

type CalendarViewType = 'day' | 'workweek' | 'week' | 'month';

interface CalendarRibbonProps {
  activeView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onNewEvent: () => void;
  onFilter: () => void;
  onPrint: () => void;
  onDisplayClick?: () => void;
  onHelpClick?: () => void;
}

export function CalendarRibbon({
  activeView,
  onViewChange,
  onNewEvent,
  onFilter,
  onPrint,
  onDisplayClick,
  onHelpClick,
}: CalendarRibbonProps) {
  return (
    <div className="border-b border-slate-700/50 bg-slate-800/30">
      {/* Onglets */}
      <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-700/30">
        <button className="px-3 py-2 text-xs font-semibold border-b-2 border-orange-500 text-orange-400">
          Accueil
        </button>
        <button 
          onClick={onDisplayClick}
          className={cn(
            "px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors",
            onDisplayClick && "cursor-pointer hover:bg-slate-700/30 rounded-t"
          )}
        >
          Afficher
        </button>
        <button 
          onClick={onHelpClick}
          className={cn(
            "px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors",
            onHelpClick && "cursor-pointer hover:bg-slate-700/30 rounded-t"
          )}
        >
          Aide
        </button>
      </div>

      {/* Groupes de boutons */}
      <div className="flex items-center gap-4 px-4 py-2">
        {/* Groupe Nouveau */}
        <div className="flex items-center gap-1 border-r border-slate-700/30 pr-4">
          <Button
            size="sm"
            variant="default"
            onClick={onNewEvent}
            className="text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nouvel événement
          </Button>
        </div>

        {/* Groupe Réorganiser (Vues) */}
        <div className="flex items-center gap-1 border-r border-slate-700/30 pr-4">
          <span className="text-xs text-slate-400 mr-2">Réorganiser:</span>
          <Button
            size="sm"
            variant={activeView === 'day' ? 'default' : 'ghost'}
            onClick={() => onViewChange('day')}
            className={cn(
              'text-xs',
              activeView === 'day' && 'bg-orange-500/20 text-orange-400 border-orange-500/50'
            )}
          >
            <Sun className="w-4 h-4 mr-1" />
            Jour
          </Button>
          <Button
            size="sm"
            variant={activeView === 'workweek' ? 'default' : 'ghost'}
            onClick={() => onViewChange('workweek')}
            className={cn(
              'text-xs',
              activeView === 'workweek' && 'bg-orange-500/20 text-orange-400 border-orange-500/50'
            )}
          >
            <CalendarDays className="w-4 h-4 mr-1" />
            Semaine
          </Button>
          <Button
            size="sm"
            variant={activeView === 'month' ? 'default' : 'ghost'}
            onClick={() => onViewChange('month')}
            className={cn(
              'text-xs',
              activeView === 'month' && 'bg-orange-500/20 text-orange-400 border-orange-500/50'
            )}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            Mois
          </Button>
        </div>

        {/* Groupe Filtrer */}
        <div className="flex items-center gap-1 border-r border-slate-700/30 pr-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={onFilter}
            className="text-xs"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtrer
          </Button>
        </div>

        {/* Groupe Partager */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrint}
            className="text-xs"
          >
            <Printer className="w-4 h-4 mr-1" />
            Imprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

