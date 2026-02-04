/**
 * Provider global alertes dashboard : Toaster (sonner) + modal urgences + sons + vibration
 * Écoute cockpit-urgent (WebSocket) et affiche toasts / modal full-screen selon sévérité
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { CriticalAlertModal, type CriticalAlertPayload } from './modals/CriticalAlertModal';
import { playUrgentSound, playCriticalSound, vibrateCritical } from '../utils/alertSounds';
import { useOpenAlerts } from '../hooks/useAlerts';
import type { AlertEvent } from '../hooks/useAlerts';

type CockpitUrgentDetail = {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: string;
};

function buildCriticalPayload(detail: CockpitUrgentDetail): CriticalAlertPayload {
  const d = detail.data ?? {};
  const title = (d.title as string) || (d.message as string) || detail.type;
  const chantier = d.chantier as string | undefined;
  const reason = d.reason as string | undefined;
  const impact = d.impact as string | undefined;
  const id = (d.id as string) || `critical-${(detail.timestamp ?? Date.now())}`;
  const actions = (d.actions as Array<{ label: string; primary?: boolean }>) ?? [
    { label: 'Appeler fournisseur', primary: true },
    { label: 'Voir alternative', primary: false },
  ];
  return {
    id,
    title,
    chantier,
    reason,
    impact,
    actions: actions.map((a) => ({
      label: typeof a === 'string' ? a : a.label,
      onClick: undefined,
      primary: typeof a === 'object' && a.primary,
    })),
    payload: d,
  };
}

export function DashboardAlertProvider({ children }: { children: React.ReactNode }) {
  const [criticalAlert, setCriticalAlert] = useState<CriticalAlertPayload | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const notifiedRef = useRef<Set<string>>(new Set());
  const { data: openAlertsData } = useOpenAlerts(20);

  const isCriticalType = useCallback((type: string) => {
    return (
      type === 'cockpit_emergency' ||
      type === 'emergency:alert' ||
      type === 'cockpit_alert' ||
      (type as string).toLowerCase().includes('critical')
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const ev = e as CustomEvent<CockpitUrgentDetail>;
      const detail = ev.detail;
      if (!detail) return;

      const key = `${detail.type}-${detail.timestamp ?? ''}-${JSON.stringify(detail.data?.id ?? '')}`;
      if (notifiedRef.current.has(key)) return;
      notifiedRef.current.add(key);
      if (notifiedRef.current.size > 100) {
        const arr = Array.from(notifiedRef.current);
        notifiedRef.current = new Set(arr.slice(-50));
      }

      const title = (detail.data?.title as string) || (detail.data?.message as string) || detail.type;
      const isCritical = isCriticalType(detail.type);

      if (isCritical) {
        playCriticalSound();
        vibrateCritical();
        setCriticalAlert(buildCriticalPayload(detail));
        toast.error(title, { duration: 5000 });
      } else {
        playUrgentSound();
        toast.warning(title, { duration: 4000 });
      }
    };

    window.addEventListener('cockpit-urgent', handler);
    return () => window.removeEventListener('cockpit-urgent', handler);
  }, [isCriticalType]);

  const handleNotifyEmail = useCallback(async (alertId: string) => {
    setEmailLoading(true);
    try {
      const res = await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, channel: 'email' }),
      });
      if (res.ok || res.status === 202) {
        if (typeof (window as unknown as { toast?: { success: (t: string) => void } }).toast !== 'undefined') {
          (window as unknown as { toast: { success: (t: string) => void } }).toast?.success?.('Demande d\'envoi par email enregistrée');
        }
      }
    } finally {
      setEmailLoading(false);
    }
  }, []);

  const handleNotifySms = useCallback(async (alertId: string) => {
    setSmsLoading(true);
    try {
      const res = await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, channel: 'sms' }),
      });
      if (res.ok || res.status === 202) {
        toast.success('Demande d\'envoi par SMS enregistrée');
      }
    } finally {
      setSmsLoading(false);
    }
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: { background: 'rgb(15 23 42)', border: '1px solid rgb(51 65 85)', color: 'rgb(226 232 240)' },
        }}
      />
      {children}
      <CriticalAlertModal
        alert={criticalAlert}
        onClose={() => setCriticalAlert(null)}
        onNotifyEmail={handleNotifyEmail}
        onNotifySms={handleNotifySms}
        emailLoading={emailLoading}
        smsLoading={smsLoading}
      />
    </>
  );
}
