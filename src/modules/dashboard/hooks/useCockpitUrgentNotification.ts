/**
 * V5 — Écoute les événements cockpit-urgent (WebSocket) et déclenche son + notification navigateur.
 */

'use client';

import { useEffect, useRef } from 'react';

function playUrgentSound(): void {
  if (typeof window === 'undefined' || !window.AudioContext && !(window as any).webkitAudioContext) return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore
  }
}

export interface UseCockpitUrgentNotificationOptions {
  enabled?: boolean;
  sound?: boolean;
  browserNotification?: boolean;
}

export function useCockpitUrgentNotification(options: UseCockpitUrgentNotificationOptions = {}) {
  const { enabled = true, sound = true, browserNotification = false } = options;
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ type: string; data: Record<string, unknown>; timestamp: string }>;
      const msg = ev.detail;
      if (!msg) return;
      const key = `${msg.type}-${msg.timestamp}`;
      if (notifiedRef.current.has(key)) return;
      notifiedRef.current.add(key);
      if (notifiedRef.current.size > 100) {
        const arr = Array.from(notifiedRef.current);
        notifiedRef.current = new Set(arr.slice(-50));
      }

      if (sound) playUrgentSound();

      if (browserNotification && 'Notification' in window && Notification.permission === 'granted') {
        const title = msg.type === 'cockpit_emergency' || msg.type === 'emergency:alert' ? 'Urgence Cockpit' : 'Alerte Cockpit';
        const body = (msg.data?.title as string) || (msg.data?.message as string) || msg.type;
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    };

    window.addEventListener('cockpit-urgent', handler);
    return () => window.removeEventListener('cockpit-urgent', handler);
  }, [enabled, sound, browserNotification]);
}
