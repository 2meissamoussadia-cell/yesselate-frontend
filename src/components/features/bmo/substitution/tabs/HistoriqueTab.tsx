/**
 * ====================================================================
 * TAB: Historique Global
 * Vue chronologique de tous les événements du système
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, Filter, Calendar, Search, Loader2 } from 'lucide-react';
import type { TimelineEvent } from '@/lib/types/substitution.types';

export function HistoriqueTab() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, events]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { mockTimelineEvents } = await import('@/lib/data/timeline-documents-mock-data');
      
      // Sort by createdAt descending (most recent first)
      const sorted = [...mockTimelineEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setEvents(sorted);
      setFilteredEvents(sorted);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filter.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      filtered = filtered.filter(e => new Date(e.createdAt) >= fromDate);
    }

    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      filtered = filtered.filter(e => new Date(e.createdAt) <= toDate);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.description?.toLowerCase().includes(q) ||
        e.user?.name?.toLowerCase().includes(q)
      );
    }

    setFilteredEvents(filtered);
  };

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    events.forEach(event => {
      const date = new Date(event.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });

    return groups;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Historique Global
          </h2>
          <div className="text-sm text-slate-400">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="substitution_created">Substitution créée</option>
            <option value="substitution_assigned">Assignation</option>
            <option value="absence_created">Absence créée</option>
            <option value="delegation_created">Délégation créée</option>
            <option value="comment_added">Commentaire</option>
            <option value="document_uploaded">Document ajouté</option>
          </select>

          <input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Date de début"
          />

          <input
            type="date"
            value={filter.dateTo}
            onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Date de fin"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Aucun événement trouvé
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 z-10 flex items-center gap-3 mb-4 pb-2 bg-slate-900/95 backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-white">{date}</h3>
                  <div className="flex-1 h-px bg-slate-700" />
                </div>

                {/* Events for this date */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />
                  
                  <div className="space-y-4">
                    {dateEvents.map((event, index) => (
                      <div key={`${event.entityId}-${index}`} className="relative flex gap-4">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                            event.color || 'bg-slate-700'
                          } relative z-10`}
                        >
                          {event.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-white">{event.description ?? '—'}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(event.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              {event.user && (
                                <span className="flex items-center gap-1">
                                  👤 {event.user.name}
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-slate-700 rounded">
                                {event.entityType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

