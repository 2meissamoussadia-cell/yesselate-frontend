/**
 * Chat interne par chantier — DG ↔ Chef chantier.
 * Threads par sujet. Ouverture depuis menu contextuel ou "Chat chef chantier".
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChantierMock } from '../../data/chantiersMock';
import {
  getOrCreateThread,
  getThreads,
  getMessages,
  sendMessage as sendMessageToStore,
  DEFAULT_SUBJECTS,
  type ChatMessage,
  type ChatRole,
} from '../../data/chantierChatStore';

export interface ChantierChatModalProps {
  chantier: ChantierMock;
  initialSubject?: string;
  onClose: () => void;
}

export function ChantierChatModal({
  chantier,
  initialSubject,
  onClose,
}: ChantierChatModalProps) {
  const [threads, setThreads] = useState(() => getThreads(chantier.id));
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialSubject ? getOrCreateThread(chantier.id, initialSubject).id : null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeThread = activeThreadId
    ? threads.find((t) => t.id === activeThreadId)
    : null;

  useEffect(() => {
    if (activeThreadId) {
      setMessages(getMessages(activeThreadId));
    } else {
      setMessages([]);
    }
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (role: ChatRole = 'dg') => {
    const subject = activeThread?.subject ?? (newSubject.trim() || 'Sujet');
    if (!input.trim()) return;
    const thread = getOrCreateThread(chantier.id, subject);
    sendMessageToStore(chantier.id, subject, role, input.trim());
    setInput('');
    setThreads(getThreads(chantier.id));
    setMessages(getMessages(thread.id));
    if (!activeThreadId) {
      setActiveThreadId(thread.id);
      setShowNewThread(false);
      setNewSubject('');
    }
  };

  const handleNewThread = () => {
    const subject = newSubject.trim() || DEFAULT_SUBJECTS[0];
    const thread = getOrCreateThread(chantier.id, subject);
    setThreads(getThreads(chantier.id));
    setActiveThreadId(thread.id);
    setMessages(getMessages(thread.id));
    setShowNewThread(false);
    setNewSubject('');
    inputRef.current?.focus();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chantier-chat-title"
    >
      <div
        className={cn(
          'w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl',
          'flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-800/60 bg-slate-900/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 id="chantier-chat-title" className="text-base font-semibold text-slate-100 truncate">
                Chat — {chantier.id}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                DG ↔ Chef chantier • {chantier.prestation} • Phase {chantier.phase}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Liste des threads (sujets) */}
          <div className="w-48 shrink-0 border-r border-slate-800/60 bg-slate-900/50 flex flex-col">
            <div className="p-2 border-b border-slate-800/50">
              <button
                type="button"
                onClick={() => setShowNewThread(true)}
                className="w-full px-3 py-2 text-left text-xs font-medium text-blue-400 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                + Nouveau sujet
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {threads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreadId(t.id)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-xs rounded-lg transition-colors',
                    activeThreadId === t.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  )}
                >
                  <span className="font-medium truncate block">{t.subject}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{t.lastMessagePreview || '—'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Zone messages */}
          <div className="flex-1 flex flex-col min-w-0">
            {showNewThread ? (
              <div className="p-4 space-y-2">
                <p className="text-sm text-slate-400">Nouveau sujet de conversation</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Ex. Pourquoi Phase 4 bloquée ?"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleNewThread()}
                  />
                  <Button size="sm" onClick={handleNewThread} className="shrink-0">
                    Créer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewThread(false)} className="border-slate-600">
                    Annuler
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Ou choisir :</p>
                <div className="flex flex-wrap gap-1">
                  {DEFAULT_SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setNewSubject(s);
                        setActiveThreadId(getOrCreateThread(chantier.id, s).id);
                        setShowNewThread(false);
                        setThreads(getThreads(chantier.id));
                        setMessages(getMessages(getOrCreateThread(chantier.id, s).id));
                      }}
                      className="px-2 py-1 rounded-md text-xs bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeThread ? (
              <>
                <div className="px-4 py-2 border-b border-slate-800/50">
                  <p className="text-sm font-medium text-slate-200">{activeThread.subject}</p>
                  <p className="text-xs text-slate-500">{activeThread.messageCount} message(s)</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">
                      Aucun message. Écrivez « Pourquoi Phase 4 bloquée ? » pour démarrer.
                    </p>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2',
                        msg.role === 'dg' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.role === 'chef_chantier' && (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-amber-400" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                          msg.role === 'dg'
                            ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700/60'
                        )}
                      >
                        <p className="text-xs text-slate-500 mb-0.5">
                          {msg.role === 'dg' ? 'DG' : 'Chef chantier'} • {formatTime(msg.createdAt)}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'dg' && (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-800/60 flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrire un message…"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend('dg');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSend('dg')}
                    disabled={!input.trim()}
                    className="gap-2 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                    Envoyer
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-sm">
                Sélectionnez un sujet ou créez un nouveau thread.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
