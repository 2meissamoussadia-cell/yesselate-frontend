"use client";

/**
 * BMOCalendar — Calendrier FullCalendar pour jalons, comités, échéances BMO.
 */

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const events = [
  { title: "Comité DG", date: "2026-02-03" },
  { title: "Échéance facture", date: "2026-02-07" },
];

export function BMOCalendar() {
  function handleDateClick(arg: { dateStr: string }) {
    // TODO: ouvrir un drawer / formulaire BMO pour la date arg.dateStr
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 p-3 [&_.fc]:text-slate-800 dark:[&_.fc]:text-slate-200 [&_.fc-button]:bg-slate-100 dark:[&_.fc-button]:bg-slate-800 [&_.fc-button]:border-slate-200 dark:[&_.fc-button]:border-slate-700 [&_.fc-button:hover]:bg-slate-200 dark:[&_.fc-button:hover]:bg-slate-700 [&_.fc-theme-standard]:border-slate-200 dark:[&_.fc-theme-standard]:border-slate-800 [&_.fc-scrollgrid]:border-slate-200 dark:[&_.fc-scrollgrid]:border-slate-800 [&_.fc-daygrid-day]:border-slate-200 dark:[&_.fc-daygrid-day]:border-slate-800">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        height="auto"
      />
    </div>
  );
}
