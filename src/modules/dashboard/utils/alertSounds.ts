/**
 * Sons et vibration pour alertes dashboard
 * - Urgence : bip fort (WebSocket / cockpit-urgent)
 * - Info : bip doux (toast info)
 * - Critique : séquence forte + vibration (modal full-screen)
 */

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext
    || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  try {
    return new Ctx();
  } catch {
    return null;
  }
}

/** Bip court urgence (800 Hz, 0.2 gain, 0.3s) — utilisé par useCockpitUrgentNotification */
export function playUrgentSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
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

/** Bip doux info (500 Hz, 0.1 gain, 0.15s) — pour toasts info */
export function playInfoSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 500;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // ignore
  }
}

/** Séquence critique : 3 bips courts (pour modal alerte critique) */
export function playCriticalSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const playBeep = (at: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 900;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, at);
      gain.gain.exponentialRampToValueAtTime(0.01, at + 0.2);
      osc.start(at);
      osc.stop(at + 0.2);
    };
    const t = ctx.currentTime;
    playBeep(t);
    playBeep(t + 0.25);
    playBeep(t + 0.5);
  } catch {
    // ignore
  }
}

/** Bip acceptation (commande vocale / action réussie) — 600 Hz, court */
export function playBeep(type: 'accept' | 'error'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'accept' ? 600 : 300;
    osc.type = 'sine';
    gain.gain.setValueAtTime(type === 'accept' ? 0.15 : 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (type === 'accept' ? 0.12 : 0.2));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (type === 'accept' ? 0.12 : 0.2));
  } catch {
    // ignore
  }
}

/** Vibration (navigator.vibrate) — pour alertes critiques sur mobile */
export function vibrateCritical(): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([200, 100, 200]);
  } catch {
    // ignore
  }
}

/** Vibration courte (toast / info) */
export function vibrateShort(): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(50);
  } catch {
    // ignore
  }
}
