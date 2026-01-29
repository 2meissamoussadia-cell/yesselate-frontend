/**
 * V5 Ultimate — Hook FPS + qualité adaptative (frontend)
 * Mesure FPS via requestAnimationFrame ; expose niveau qualité pour 3D (sphères, particules).
 * Jour 5 GPU: cible 120 FPS pour niveau "ultra" (écrans haute fréquence).
 */

'use client';

import { useState, useEffect, useRef } from 'react';

export type CockpitQualityLevel = 'low' | 'medium' | 'high' | 'ultra';

const FPS_SAMPLE_SIZE = 30;
/** En dessous → qualité "low" (réduction sphères, LOD, dpr 1) */
const LOW_FPS_THRESHOLD = 35;
/** 60 FPS → passage à "medium" */
const MEDIUM_FPS_THRESHOLD = 55;
/** 85+ FPS → "high" ; 100+ → "ultra" (cible 120 FPS pour écrans 120Hz) */
const HIGH_FPS_THRESHOLD = 85;
export const TARGET_FPS_ULTRA = 120;

/** Mobile viewport (Semaine 3 perf) : démarrer en "low" pour moins de sphères 3D */
const MOBILE_BREAKPOINT_PX = 640;

export function useCockpitFps(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [fps, setFps] = useState(0);
  const [quality, setQuality] = useState<CockpitQualityLevel>('high');
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsSamples = useRef<number[]>([]);

  // Perf mobile : qualité initiale "low" sur petit écran
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < MOBILE_BREAKPOINT_PX) {
      setQuality('low');
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let rafId: number;

    const tick = () => {
      frameCount.current += 1;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / delta);
        setFps(currentFps);
        frameCount.current = 0;
        lastTime.current = now;

        fpsSamples.current.push(currentFps);
        if (fpsSamples.current.length > FPS_SAMPLE_SIZE) {
          fpsSamples.current.shift();
        }

        if (fpsSamples.current.length >= FPS_SAMPLE_SIZE) {
          const avg = fpsSamples.current.reduce((a, b) => a + b, 0) / fpsSamples.current.length;
          setQuality((prev) => {
            if (avg < LOW_FPS_THRESHOLD && prev !== 'low') return 'low';
            if (avg < MEDIUM_FPS_THRESHOLD && prev === 'low') return prev;
            if (avg >= MEDIUM_FPS_THRESHOLD && prev === 'low') return 'medium';
            if (avg < MEDIUM_FPS_THRESHOLD && prev === 'ultra') return 'high';
            if (avg >= 100) return 'ultra'; // 120 FPS target
            if (avg >= HIGH_FPS_THRESHOLD && prev !== 'ultra') return 'high';
            if (avg < HIGH_FPS_THRESHOLD && prev === 'ultra') return 'high';
            return prev;
          });
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  return { fps, quality, setQuality };
}
