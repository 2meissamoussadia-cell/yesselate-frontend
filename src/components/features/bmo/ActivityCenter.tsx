'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { reminders, notes, systemAlerts, agendaEvents } from '@/lib/data';
import { Activity, ChevronDown } from 'lucide-react';

export function ActivityCenter() {
  const { darkMode } = useAppStore();
  const { tasks, toggleTask, addToast } = useBMOStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compter les éléments non lus/complétés
  const taskCount = tasks.filter((t) => !t.done).length;
  const reminderCount = reminders.filter((r) => r.urgent).length;
  const noteCount = notes.filter((n) => n.pinned).length;
  const agendaCount = agendaEvents.slice(0, 5).length;
  const alertCount = systemAlerts.filter(
    (a) => a.type === 'critical' || a.type === 'warning'
  ).length;

  const totalCount = taskCount + reminderCount + alertCount;

  // Clic en dehors pour fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSection(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const sections = [
    {
      id: 'tasks',
      icon: '✓',
      label: 'Tâches',
      count: taskCount,
      color: darkMode ? 'text-blue-400' : 'text-blue-600',
    },
    {
      id: 'reminders',
      icon: '🔔',
      label: 'Rappels',
      count: reminderCount,
      color: darkMode ? 'text-amber-400' : 'text-amber-600',
    },
    {
      id: 'notes',
      icon: '📝',
      label: 'Notes',
      count: noteCount,
      color: darkMode ? 'text-purple-400' : 'text-purple-600',
    },
    {
      id: 'agenda',
      icon: '📅',
      label: 'Agenda',
      count: agendaCount,
      color: darkMode ? 'text-emerald-400' : 'text-emerald-600',
    },
    {
      id: 'alerts',
      icon: '⚠️',
      label: 'Alertes',
      count: alertCount,
      color: darkMode ? 'text-red-400' : 'text-red-600',
    },
  ];

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'tasks':
        return (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucune tâche
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                    task.done && 'opacity-50',
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    className="rounded border-slate-600"
                  />
                  <span
                    className={cn(
                      'flex-1 text-xs',
                      task.done && 'line-through'
                    )}
                  >
                    {task.text}
                  </span>
                  <Badge
                    variant={
                      task.priority === 'high'
                        ? 'urgent'
                        : task.priority === 'normal'
                        ? 'warning'
                        : 'default'
                    }
                    className="text-[9px]"
                  >
                    {task.due}
                  </Badge>
                </div>
              ))
            )}
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-2 text-xs"
              onClick={() => addToast('Nouvelle tâche ajoutée', 'success')}
            >
              + Ajouter une tâche
            </Button>
          </div>
        );

      case 'reminders':
        return (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucun rappel
              </p>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    reminder.urgent &&
                      'bg-red-500/10 border border-red-500/30',
                    !reminder.urgent &&
                      (darkMode ? 'bg-slate-700/30' : 'bg-gray-100')
                  )}
                >
                  <span className="text-base">{reminder.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{reminder.title}</p>
                    <p className="text-[10px] text-slate-400">{reminder.time}</p>
                  </div>
                  {reminder.urgent && (
                    <Badge variant="urgent" className="text-[9px]">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucune note
              </p>
            ) : (
              notes.map((note) => {
                const colorStyles = {
                  yellow: 'bg-yellow-500/20 border-yellow-500/30',
                  blue: 'bg-blue-500/20 border-blue-500/30',
                  green: 'bg-emerald-500/20 border-emerald-500/30',
                  red: 'bg-red-500/20 border-red-500/30',
                  purple: 'bg-purple-500/20 border-purple-500/30',
                };
                return (
                  <div
                    key={note.id}
                    className={cn(
                      'p-2 rounded-lg border text-xs',
                      colorStyles[note.color]
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="whitespace-pre-wrap flex-1">{note.content}</p>
                      {note.pinned && <span>📌</span>}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">{note.date}</p>
                  </div>
                );
              })
            )}
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-2 text-xs"
              onClick={() => addToast('Nouvelle note créée', 'success')}
            >
              + Nouvelle note
            </Button>
          </div>
        );

      case 'agenda':
        const todayEvents = agendaEvents.slice(0, 5);
        return (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {todayEvents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucun événement
              </p>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                  )}
                >
                  <div className="text-center min-w-[40px]">
                    <p className="text-xs font-semibold">{event.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{event.title}</p>
                    {event.location && (
                      <p className="text-[10px] text-slate-400">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-2 text-xs"
              onClick={() => addToast('Voir calendrier complet', 'info')}
            >
              Voir tout →
            </Button>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {systemAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Aucune alerte
              </p>
            ) : (
              systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    alert.type === 'critical' &&
                      'bg-red-500/10 border border-red-500/30',
                    alert.type === 'warning' &&
                      'bg-amber-500/10 border border-amber-500/30',
                    alert.type === 'success' &&
                      'bg-emerald-500/10 border border-emerald-500/30',
                    alert.type === 'info' &&
                      'bg-blue-500/10 border border-blue-500/30'
                  )}
                >
                  <span className="text-base">
                    {alert.type === 'critical'
                      ? '🚨'
                      : alert.type === 'warning'
                      ? '⚠️'
                      : alert.type === 'success'
                      ? '✅'
                      : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{alert.title}</p>
                    <p className="text-[10px] text-slate-400">{alert.action}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton déclencheur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
          darkMode
            ? 'hover:bg-slate-800 text-slate-300'
            : 'hover:bg-gray-100 text-gray-600',
          isOpen &&
            (darkMode
              ? 'bg-slate-800 text-white'
              : 'bg-gray-100 text-gray-900')
        )}
      >
        <Activity className="w-4 h-4" />
        <span className="hidden sm:inline">Centre d'activités</span>
        {totalCount > 0 && (
          <Badge
            variant="urgent"
            className="ml-1 text-[9px] px-1.5 py-0 h-4 min-w-[18px]"
          >
            {totalCount}
          </Badge>
        )}
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Panneau dépliable */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border overflow-hidden z-50',
            darkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-gray-200'
          )}
        >
          {/* Header avec sections */}
          <div className="p-2 border-b border-slate-700/50">
            <div className="flex flex-wrap gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() =>
                    setActiveSection(
                      activeSection === section.id ? null : section.id
                    )
                  }
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors',
                    activeSection === section.id
                      ? darkMode
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-orange-100 text-orange-600'
                      : darkMode
                      ? 'hover:bg-slate-700/50 text-slate-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  )}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                  {section.count > 0 && (
                    <Badge
                      variant="default"
                      className="ml-1 text-[8px] px-1 py-0 h-3 min-w-[14px]"
                    >
                      {section.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu de la section active */}
          <div className="p-3">
            {activeSection ? (
              renderSectionContent(activeSection)
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-lg transition-colors',
                      darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn('text-base', section.color)}>
                        {section.icon}
                      </span>
                      <span className="text-xs font-medium">{section.label}</span>
                    </div>
                    {section.count > 0 && (
                      <Badge variant="default" className="text-[9px]">
                        {section.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
