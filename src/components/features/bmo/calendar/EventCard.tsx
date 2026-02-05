'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  ChevronRight,
  Edit2,
  Calendar as CalendarIcon
} from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (e?: React.MouseEvent) => void;
  onEdit?: () => void;
  compact?: boolean;
  showConflicts?: boolean;
}

const eventTypeIcons: Record<string, string> = {
  meeting: '📅',
  visio: '💻',
  deadline: '⏰',
  site: '🏗️',
  delivery: '📦',
  legal: '⚖️',
  inspection: '🔍',
  training: '📚',
  hr: '👥',
  intervention: '🔧',
  audit: '📊',
  formation: '🎓',
};

const priorityColors = {
  critical: 'border-l-red-500 bg-red-500/10 hover:bg-red-500/15',
  urgent: 'border-l-orange-500 bg-orange-500/10 hover:bg-orange-500/15',
  high: 'border-l-amber-500 bg-amber-500/10 hover:bg-amber-500/15',
  normal: 'border-l-blue-500 bg-blue-500/10 hover:bg-blue-500/15',
  low: 'border-l-slate-500 bg-slate-500/10 hover:bg-slate-500/15',
};

export function EventCard({ 
  event, 
  onClick, 
  onEdit, 
  compact = false,
  showConflicts = true 
}: EventCardProps) {
  const { darkMode } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  
  const hasConflicts = event.conflicts && event.conflicts.length > 0;
  const priority = event.priority || 'normal';
  const icon = eventTypeIcons[event.type] || '📌';

  if (compact) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative p-2 rounded-lg border-l-4 cursor-pointer transition-all duration-200',
          'hover:shadow-lg hover:scale-[1.02] hover:z-10',
          priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal,
          darkMode ? 'text-white' : 'text-gray-900'
        )}
      >
        <div className="flex items-start gap-2">
          <span className="text-sm flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-semibold text-xs truncate">{event.title}</p>
              {hasConflicts && showConflicts && (
                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
              {event.bureau && <BureauTag bureau={event.bureau} className="text-[9px] px-1" />}
            </div>
          </div>
        </div>
        
        {hasConflicts && showConflicts && (
          <div className="absolute top-1 right-1">
            <Badge variant="urgent" className="text-[8px] px-1 py-0">
              {event.conflicts!.length}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02] hover:z-10',
        priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal,
        darkMode ? 'text-white' : 'text-gray-900'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate mb-0.5">{event.title}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={priority === 'critical' || priority === 'urgent' ? 'urgent' : 'default'}
                className="text-[9px] px-1.5"
              >
                {priority}
              </Badge>
              {event.bureau && <BureauTag bureau={event.bureau} className="text-[9px] px-1.5" />}
              {hasConflicts && showConflicts && (
                <Badge variant="urgent" className="text-[9px] px-1.5 flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {event.conflicts!.length} conflit{event.conflicts!.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {isHovered && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={cn(
              'p-1.5 rounded-md transition-colors flex-shrink-0',
              darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-200'
            )}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {event.date && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {new Date(event.date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          )}
          {event.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
          )}
        </div>

        {event.location && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="w-3 h-3" />
            <span>{event.participants.length} participant{event.participants.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {event.project && (
          <div className="mt-1.5">
            <Badge variant="info" className="text-[9px] px-1.5">
              {event.project}
            </Badge>
          </div>
        )}
      </div>

      {/* Conflicts indicator */}
      {hasConflicts && showConflicts && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="space-y-1">
            {event.conflicts!.slice(0, 2).map((conflict, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[10px]">
                <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-300">{conflict.description}</span>
              </div>
            ))}
            {event.conflicts!.length > 2 && (
              <p className="text-[10px] text-slate-400">
                +{event.conflicts!.length - 2} autre{event.conflicts!.length > 3 ? 's' : ''} conflit{event.conflicts!.length > 3 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hover arrow */}
      {isHovered && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </div>
  );
}

