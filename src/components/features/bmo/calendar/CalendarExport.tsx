'use client';

import { Download, Upload, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface CalendarExportProps {
  activities: CalendarEvent[];
  onImport?: (activities: CalendarEvent[]) => void;
}

export function CalendarExport({ activities, onImport }: CalendarExportProps) {
  const { darkMode } = useAppStore();

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Titre', 'Type', 'Date', 'Heure', 'Bureau', 'Projet', 'Priorité', 'Statut', 'Charge estimée'];
    const rows = activities.map(a => [
      a.title || '',
      a.type || '',
      a.date || '',
      a.time || '',
      a.bureau || '',
      a.project || '',
      a.priority || '',
      a.status || '',
      a.estimatedCharge?.toString() || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `calendrier_bmo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export iCal
  const exportToiCal = () => {
    const formatDate = (date: string, time?: string) => {
      const d = new Date(date);
      if (time) {
        const [hours, minutes] = time.split(':');
        d.setHours(parseInt(hours || '0'), parseInt(minutes || '0'));
      }
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BMO Calendar//Yesselate//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    activities.forEach(activity => {
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${activity.id}@yesselate`,
        `DTSTART:${formatDate(activity.date || '', activity.time)}`,
        `DTEND:${formatDate(activity.date || '', activity.time)}`,
        `SUMMARY:${activity.title || 'Sans titre'}`,
        `DESCRIPTION:${(activity as any).description || ''}`,
        `LOCATION:${activity.location || ''}`,
        `STATUS:${activity.status?.toUpperCase() || 'CONFIRMED'}`,
        'END:VEVENT'
      );
    });

    icalContent.push('END:VCALENDAR');

    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `calendrier_bmo_${new Date().toISOString().split('T')[0]}.ics`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.ics';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
          const imported: CalendarEvent[] = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, ''));
              const activity: CalendarEvent = {
                id: `IMP-${Date.now()}-${Math.random()}`,
                title: values[0] || '',
                type: values[1] as any || 'meeting',
                date: values[2] || '',
                time: values[3] || '10:00',
                bureau: values[4] || undefined,
                project: values[5] || undefined,
                priority: values[6] as any || 'normal',
                status: values[7] as any || 'planned',
                estimatedCharge: values[8] ? parseFloat(values[8]) : undefined,
                createdAt: new Date().toISOString(),
                createdBy: 'USR-001',
              };
              return activity;
            });
          
          onImport?.(imported);
        } else if (file.name.endsWith('.ics')) {
          // Parse iCal (simplifié)
          const imported: CalendarEvent[] = [];
          const events = text.split('BEGIN:VEVENT');
          
          events.slice(1).forEach(eventText => {
            const titleMatch = eventText.match(/SUMMARY:(.+)/);
            const dateMatch = eventText.match(/DTSTART:(.+)/);
            const descMatch = eventText.match(/DESCRIPTION:(.+)/);
            
            if (titleMatch && dateMatch) {
              const dtStart = dateMatch[1].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3');
              const timeMatch = dateMatch[1].match(/T(\d{2})(\d{2})/);
              
              imported.push({
                id: `IMP-${Date.now()}-${Math.random()}`,
                title: titleMatch[1].trim() || 'Sans titre',
                type: 'meeting',
                date: dtStart,
                time: timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : '10:00',
                priority: 'normal' as const,
                ...(descMatch?.[1] ? { description: descMatch[1] } : {}),
                status: 'planned',
                createdAt: new Date().toISOString(),
                createdBy: 'USR-001',
              } as any);
            }
          });
          
          onImport?.(imported);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={exportToCSV}
        className="gap-2 text-xs"
      >
        <FileText className="w-4 h-4" />
        CSV
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={exportToiCal}
        className="gap-2 text-xs"
      >
        <CalendarIcon className="w-4 h-4" />
        iCal
      </Button>
      {onImport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          className="gap-2 text-xs"
        >
          <Upload className="w-4 h-4" />
          Importer
        </Button>
      )}
    </div>
  );
}

