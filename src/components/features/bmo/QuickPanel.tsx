'use client';

import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reminders, notes, systemAlerts, agendaEvents } from '@/lib/data';

export function QuickPanel() {
  const { darkMode } = useAppStore();
  const { activePanel, setActivePanel, tasks, toggleTask, addToast } = useBMOStore();

  if (!activePanel) return null;

  const renderContent = () => {
    switch (activePanel) {
      case 'todo':
        return (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
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
                >
                  {task.due}
                </Badge>
              </div>
            ))}
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-2"
              onClick={() => addToast('Nouvelle tâche ajoutée', 'success')}
            >
              + Ajouter une tâche
            </Button>
          </div>
        );

      case 'reminders':
        return (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  reminder.urgent && 'bg-red-500/10 border border-red-500/30',
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                )}
              >
                <span className="text-lg">{reminder.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{reminder.title}</p>
                  <p className="text-[10px] text-slate-400">{reminder.time}</p>
                </div>
                {reminder.urgent && (
                  <Badge variant="urgent" pulse>
                    Urgent
                  </Badge>
                )}
              </div>
            ))}
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-2">
            {notes.map((note) => {
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
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    {note.pinned && <span>📌</span>}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">{note.date}</p>
                </div>
              );
            })}
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-2"
              onClick={() => addToast('Nouvelle note créée', 'success')}
            >
              + Nouvelle note
            </Button>
          </div>
        );

      case 'agenda':
        const todayEvents = agendaEvents.slice(0, 5);
        return (
          <div className="space-y-2">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                )}
              >
                <div className="text-center min-w-[40px]">
                  <p className="text-xs font-bold">{event.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{event.title}</p>
                  {event.location && (
                    <p className="text-[10px] text-slate-400">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-2"
              onClick={() => addToast('Voir calendrier complet', 'info')}
            >
              Voir tout →
            </Button>
          </div>
        );

      case 'alertPanel':
        return (
          <div className="space-y-2">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  alert.type === 'critical' && 'bg-red-500/10 border border-red-500/30',
                  alert.type === 'warning' && 'bg-amber-500/10 border border-amber-500/30',
                  alert.type === 'success' && 'bg-emerald-500/10 border border-emerald-500/30',
                  alert.type === 'info' && 'bg-blue-500/10 border border-blue-500/30'
                )}
              >
                <span className="text-lg">
                  {alert.type === 'critical'
                    ? '🚨'
                    : alert.type === 'warning'
                    ? '⚠️'
                    : alert.type === 'success'
                    ? '✅'
                    : 'ℹ️'}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{alert.title}</p>
                  <p className="text-[10px] text-slate-400">{alert.action}</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const panelTitles: Record<string, string> = {
    todo: '✔ Tâches',
    reminders: '🔔 Rappels',
    notes: '📝 Notes',
    agenda: '📅 Agenda',
    alertPanel: '⚠️ Alertes',
  };

  return (
    <div
      className={cn(
        'fixed top-[calc(48px+36px+16px)] right-4 w-80 z-30',
        'rounded-xl shadow-xl border overflow-hidden',
        darkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="font-bold text-sm">{panelTitles[activePanel]}</h3>
        <button
          onClick={() => setActivePanel(null)}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="p-3 max-h-[400px] overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
