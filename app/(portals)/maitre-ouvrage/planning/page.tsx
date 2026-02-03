'use client';

import { useState } from 'react';
import { CalendarViewLayout, type CalendarEvent } from '@/components/bmo/layout/CalendarViewLayout';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import { planningModuleConfig } from '@/lib/config/modules/planning.config';
import { useTaches } from '@/hooks/planning/useTaches';
import { TacheDetailPanel, CreateTacheDialog } from '@/components/bmo/planning';

export default function PlanningPage() {
  const [selectedTache, setSelectedTache] = useState<CalendarEvent | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogDate, setCreateDialogDate] = useState<Date | null>(null);

  const { data } = useTaches();

  const events: CalendarEvent[] = (data?.data ?? []).map((tache) => ({
    id: tache.id,
    title: tache.titre,
    start: new Date(tache.dateDebut),
    end: new Date(tache.dateFin),
    allDay: tache.journeeComplete,
    color: tache.couleur,
    category: tache.categorie,
    location: tache.chantier?.nom,
    description: tache.description,
    attendees: tache.assignes?.map((a) => ({ id: a.id, name: a.nom })),
  }));

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedTache(event);
  };

  const handleSlotClick = (date: Date) => {
    setCreateDialogDate(date);
    setCreateDialogOpen(true);
  };

  const sections = planningModuleConfig.subSidebar?.sections ?? [];

  return (
    <>
      <CalendarViewLayout
        sidebar={
          <ModuleSubSidebar
            sections={sections}
            selectedId="tous"
            onSelect={() => {}}
            headerLabel={planningModuleConfig.name}
          />
        }
        events={events}
        onEventClick={handleEventClick}
        onSlotClick={handleSlotClick}
        defaultView="week"
        views={['month', 'week', 'day', 'agenda']}
        detailPanel={
          <TacheDetailPanel tache={selectedTache} onClose={() => setSelectedTache(null)} />
        }
        detailPanelOpen={!!selectedTache}
        eventColors={{
          'gros-oeuvre': '#3B82F6',
          'second-oeuvre': '#10B981',
          finitions: '#F59E0B',
          livraison: '#8B5CF6',
        }}
      />

      <CreateTacheDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultDate={createDialogDate}
      />
    </>
  );
}
