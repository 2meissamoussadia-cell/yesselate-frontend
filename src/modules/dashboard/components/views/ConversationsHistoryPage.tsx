/**
 * Historique conversations centralisé — DG ↔ Chef chantier.
 * Liste des threads par chantier/sujet, clic ouvre le chat.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThreads } from '../../data/chantierChatStore';
import { chantiers } from '../../data/chantiersMock';
import type { ChantierMock } from '../../data/chantiersMock';
import { ChantierChatModal } from '../modals/ChantierChatModal';
import {
  DashboardPageLayout,
  DashboardSection,
  DashboardPanel,
} from '../shared';

function getChantierById(id: string): ChantierMock | null {
  return chantiers.find((c) => c.id === id) ?? null;
}

/** Chantier minimal si non trouvé dans le mock */
function fallbackChantier(chantierId: string): ChantierMock {
  return {
    id: chantierId,
    segment: '—',
    prestation: '—',
    phase: 0,
    ca: 0,
    marge: 0,
    sante: 0,
    gpsLive: false,
    bureauControle: '—',
    photosGps: 0,
  };
}

export function ConversationsHistoryPage() {
  const [threads, setThreads] = useState(() => getThreads());
  const [openChat, setOpenChat] = useState<{ chantier: ChantierMock; subject?: string } | null>(null);

  const refreshThreads = () => setThreads(getThreads());

  const threadsWithChantier = useMemo(() => {
    return threads.map((t) => ({
      ...t,
      chantier: getChantierById(t.chantierId) ?? fallbackChantier(t.chantierId),
    }));
  }, [threads]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardPageLayout>
      <DashboardSection
        title="Historique conversations"
        subtitle="DG ↔ Chef chantier — threads par chantier et sujet"
        icon={MessageSquare}
      >
        <DashboardPanel padding="md">
          <p className="text-sm text-slate-400 mb-4">
            Cliquez sur une conversation pour l&apos;ouvrir. Depuis le cockpit, clic-droit sur un chantier → « Chat chef chantier ».
          </p>
          {threadsWithChantier.length === 0 ? (
            <div className="py-12 text-center text-slate-500 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">Aucune conversation</p>
              <p className="text-xs text-slate-500 mt-1">
                Ouvrez un chat depuis le menu contextuel d&apos;un chantier (Centrale de commandement).
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {threadsWithChantier.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setOpenChat({ chantier: t.chantier, subject: t.subject })}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left',
                      'border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700/60'
                    )}
                  >
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <Building2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {t.chantier.id} — {t.subject}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {t.lastMessagePreview || 'Aucun message'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">{formatDate(t.lastMessageAt)}</p>
                      <p className="text-xs text-slate-600">{t.messageCount} msg.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </DashboardSection>

      {openChat && (
        <ChantierChatModal
          chantier={openChat.chantier}
          initialSubject={openChat.subject}
          onClose={() => {
            setOpenChat(null);
            refreshThreads();
          }}
        />
      )}
    </DashboardPageLayout>
  );
}
