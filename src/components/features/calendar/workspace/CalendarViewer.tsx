'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { FluentButton } from '@/components/ui/fluent-button';
import { useCalendarWorkspaceStore, type CalendarUIState } from '@/lib/stores/calendarWorkspaceStore';
import {
  PanelLeftClose,
  PanelLeft,
  FileText,
  Users,
  MapPin,
  AlertTriangle,
  Clock,
  History as HistoryIcon,
  Edit2,
  XCircle,
  Calendar,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type CalendarModalType = 
  | 'edit' 
  | 'reschedule' 
  | 'cancel' 
  | 'add_participant' 
  | 'export'
  | null;

interface Props {
  tabId: string;
  eventId: string;
  onOpenModal?: (modal: CalendarModalType) => void;
}

// ============================================
// CALENDAR VIEWER
// ============================================

export function CalendarViewer({ tabId, eventId, onOpenModal }: Props) {
  const { setTabUI, getTabUI } = useCalendarWorkspaceStore();
  const ui = getTabUI(tabId) ?? { section: 'overview' as const, explorerOpen: true };

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'événement
  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        // TODO: Brancher sur vraie API
        // const res = await fetch(`/api/calendar/events/${eventId}`);
        // if (res.ok) setEvent(await res.json());
        
        // Mock pour l'instant
        await new Promise(r => setTimeout(r, 300));
        setEvent({
          id: eventId,
          title: 'Réunion de suivi projet',
          description: 'Revue d\'avancement mensuelle',
          kind: 'meeting',
          bureau: 'BMO',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000).toISOString(),
          priority: 'normal',
          severity: 'info',
          status: 'open',
        });
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);

  const toggleExplorer = useCallback(() => {
    setTabUI(tabId, { explorerOpen: !ui.explorerOpen });
  }, [tabId, ui.explorerOpen, setTabUI]);

  const navigateToSection = useCallback((section: CalendarUIState['section'], sub?: CalendarUIState['sub']) => {
    setTabUI(tabId, { section, sub });
  }, [tabId, setTabUI]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Événement introuvable</div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 h-full">
      {/* Explorer (sidebar) */}
      {ui.explorerOpen && (
        <div className="w-64 flex-shrink-0 rounded-2xl border border-slate-200/70 bg-white/90 p-3 dark:border-slate-700 dark:bg-[#1f1f1f]/90">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              Navigation
            </h3>
            <button
              onClick={toggleExplorer}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-1">
            <ExplorerItem
              icon={FileText}
              label="Vue d'ensemble"
              active={ui.section === 'overview'}
              onClick={() => navigateToSection('overview')}
            />
            <ExplorerItem
              icon={FileText}
              label="Détails"
              active={ui.section === 'details'}
              onClick={() => navigateToSection('details')}
            />
            <ExplorerItem
              icon={Users}
              label="Participants"
              active={ui.section === 'participants'}
              onClick={() => navigateToSection('participants')}
            />
            <ExplorerItem
              icon={MapPin}
              label="Logistique"
              active={ui.section === 'logistics'}
              onClick={() => navigateToSection('logistics')}
            />
            <ExplorerItem
              icon={AlertTriangle}
              label="Conflits"
              active={ui.section === 'conflicts'}
              onClick={() => navigateToSection('conflicts')}
            />
            <ExplorerItem
              icon={Clock}
              label="SLA"
              active={ui.section === 'sla'}
              onClick={() => navigateToSection('sla')}
            />
            <ExplorerItem
              icon={HistoryIcon}
              label="Historique"
              active={ui.section === 'history'}
              onClick={() => navigateToSection('history')}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 rounded-2xl border border-slate-200/70 bg-white/90 dark:border-slate-700 dark:bg-[#1f1f1f]/90 overflow-hidden">
        {!ui.explorerOpen && (
          <button
            onClick={toggleExplorer}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <PanelLeft className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {/* Header avec actions */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                {event.title}
              </h2>
              <p className="text-sm text-slate-400 mt-1">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal?.('edit')}>
                <Edit2 className="w-3.5 h-3.5" /> Modifier
              </FluentButton>
              <FluentButton size="sm" variant="warning" onClick={() => onOpenModal?.('reschedule')}>
                <Calendar className="w-3.5 h-3.5" /> Déplacer
              </FluentButton>
              <FluentButton size="sm" variant="destructive" onClick={() => onOpenModal?.('cancel')}>
                <XCircle className="w-3.5 h-3.5" /> Annuler
              </FluentButton>
            </div>
          </div>
        </div>

        {/* Section content */}
        <div className="p-6">
          <SectionRouter
            eventId={eventId}
            event={event}
            section={ui.section}
            sub={ui.sub}
            onRefresh={() => {}}
            onOpenModal={onOpenModal}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPLORER ITEM
// ============================================

function ExplorerItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
        active
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ============================================
// SECTION ROUTER
// ============================================

function SectionRouter({
  eventId,
  event,
  section,
  sub,
  onRefresh,
  onOpenModal,
}: {
  eventId: string;
  event: any;
  section: CalendarUIState['section'];
  sub?: CalendarUIState['sub'];
  onRefresh: () => void;
  onOpenModal?: (modal: CalendarModalType) => void;
}) {
  switch (section) {
    case 'overview':
      return (
        <div>
          <h3 className="font-semibold mb-4">Vue d&apos;ensemble</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-400">Type:</span> {event.kind}
            </div>
            <div>
              <span className="text-slate-400">Bureau:</span> {event.bureau}
            </div>
            <div>
              <span className="text-slate-400">Début:</span>{' '}
              {new Date(event.start).toLocaleString('fr-FR')}
            </div>
            <div>
              <span className="text-slate-400">Fin:</span>{' '}
              {new Date(event.end).toLocaleString('fr-FR')}
            </div>
            <div>
              <span className="text-slate-400">Statut:</span> {event.status}
            </div>
          </div>
        </div>
      );

    case 'details':
      return (
        <div>
          <h3 className="font-semibold mb-4">Détails</h3>
          <p className="text-sm text-slate-400">Section détails à implémenter</p>
        </div>
      );

    case 'participants':
      return (
        <div>
          <h3 className="font-semibold mb-4">Participants</h3>
          <p className="text-sm text-slate-400">Liste des participants à implémenter</p>
          <FluentButton
            size="sm"
            variant="secondary"
            className="mt-4"
            onClick={() => onOpenModal?.('add_participant')}
          >
            <Users className="w-3.5 h-3.5" /> Ajouter un participant
          </FluentButton>
        </div>
      );

    case 'logistics':
      return (
        <div>
          <h3 className="font-semibold mb-4">Logistique</h3>
          <p className="text-sm text-slate-400">
            Lieu, équipement, budget à implémenter
          </p>
        </div>
      );

    case 'conflicts':
      return (
        <div>
          <h3 className="font-semibold mb-4">Conflits</h3>
          <p className="text-sm text-slate-400">
            Détection des conflits de planification
          </p>
        </div>
      );

    case 'sla':
      return (
        <div>
          <h3 className="font-semibold mb-4">SLA</h3>
          <p className="text-sm text-slate-400">
            Suivi des échéances et alertes
          </p>
        </div>
      );

    case 'history':
      return (
        <div>
          <h3 className="font-semibold mb-4">Historique</h3>
          <p className="text-sm text-slate-400">
            Historique des modifications et traçabilité
          </p>
        </div>
      );

    default:
      return <div className="text-slate-400 text-center py-8">Section inconnue</div>;
  }
}

