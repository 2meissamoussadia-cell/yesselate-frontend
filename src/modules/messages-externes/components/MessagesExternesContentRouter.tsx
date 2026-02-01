/**
 * Router de contenu pour le module Messages Externes
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MessagesExternesMainCategory } from '../types/messagesExternesNavigationTypes';
import { messagesExternes } from '@/lib/data';
import type { ExternalMessage } from '@/lib/types/bmo.types';
import { useBMOStore } from '@/lib/stores';

type MessageItem = typeof messagesExternes[number];

interface MessagesExternesContentRouterProps {
  mainCategory: MessagesExternesMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function MessagesExternesContentRouter({ mainCategory, subCategory, subSubCategory }: MessagesExternesContentRouterProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const { addToast, addActionLog, currentUser } = useBMOStore();

  const filteredMessages = useMemo(() => {
    let filtered = [...messagesExternes];

    switch (mainCategory) {
      case 'unread':
        filtered = filtered.filter(m => m.status === 'unread');
        break;
      case 'requires_response':
        filtered = filtered.filter(m => m.requiresResponse && m.status !== 'replied');
        break;
      case 'replied':
        filtered = filtered.filter(m => m.status === 'replied');
        break;
      case 'archived':
        filtered = filtered.filter(m => m.status === 'archived');
        break;
      case 'overview':
      default:
        break;
    }

    return filtered;
  }, [mainCategory]);

  const stats = useMemo(() => {
    const unread = messagesExternes.filter(m => m.status === 'unread').length;
    const requiresResponse = messagesExternes.filter(m => m.requiresResponse && m.status !== 'replied').length;
    const replied = messagesExternes.filter(m => m.status === 'replied').length;
    const archived = messagesExternes.filter(m => m.status === 'archived').length;
    return { total: messagesExternes.length, unread, requiresResponse, replied, archived };
  }, []);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { courrier: '📬', email: '📧', fax: '📠', recommande: '📮' };
    return icons[type] || '📩';
  };

  const handleRespond = (message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'modification',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Réponse message ${message.sender}`,
      bureau: 'BMO',
    });
    addToast('✅ Réponse envoyée - Preuve archivée', 'success');
  };

  const handleAssign = (message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'delegation',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message assigné pour traitement`,
      bureau: 'BMO',
    });
    addToast('📨 Message assigné', 'info');
  };

  const handleArchive = (message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'modification',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message archivé`,
      bureau: 'BMO',
    });
    addToast('📁 Message archivé', 'success');
  };

  const selectedM = selectedMessage ? messagesExternes.find(m => m.id === selectedMessage) : null;

  return (
    <div className="p-4">
      {/* Alert pour messages nécessitant réponse */}
      {stats.requiresResponse > 0 && mainCategory === 'overview' && (
        <Card className="border-amber-500/50 bg-amber-500/10 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400">{stats.requiresResponse} message(s) nécessitant réponse</h3>
                <p className="text-sm text-slate-400">Sous responsabilité <strong>BMO (Accountable)</strong></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📨</span>
                <p className="text-slate-400">Aucun message trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((message) => {
              const isSelected = selectedMessage === message.id;
              return (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50'} ${message.status === 'unread' ? 'border-l-4 border-l-red-500' : ''} ${message.requiresResponse && message.status !== 'replied' ? 'border-l-4 border-l-amber-500' : ''} ${message.status === 'replied' ? 'border-l-4 border-l-emerald-500' : ''} ${message.status === 'archived' ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{getTypeIcon(message.type)}</span>
                          <span className="font-mono text-xs text-blue-400">{message.id}</span>
                          <Badge variant={message.status === 'unread' ? 'urgent' : message.status === 'replied' ? 'success' : 'default'}>{message.status}</Badge>
                          <Badge variant={message.priority === 'urgent' ? 'urgent' : message.priority === 'high' ? 'warning' : 'default'}>{message.priority}</Badge>
                        </div>
                        <h3 className="font-bold mt-1">{message.subject}</h3>
                        <p className="text-sm text-slate-400">{message.sender}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{message.date}</p>
                        {message.requiresResponse && message.status !== 'replied' && (
                          <Badge variant="warning" className="mt-1">Réponse requise</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedM ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(selectedM.type)}</span>
                    <Badge variant={selectedM.status === 'unread' ? 'urgent' : selectedM.status === 'replied' ? 'success' : 'default'}>{selectedM.status}</Badge>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedM.id}</span>
                  <h3 className="font-bold">{selectedM.subject}</h3>
                  <p className="text-slate-400">{selectedM.sender}</p>
                </div>
                {selectedM.decisionBMO && (
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-xs text-blue-400 font-mono mb-1">Décision BMO</p>
                    <p className="text-sm text-slate-300">Origine: {selectedM.decisionBMO.origin}</p>
                    <p className="text-xs text-slate-400">Hash: {selectedM.decisionBMO.hash}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-slate-400">Sélectionnez un message pour voir les détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

