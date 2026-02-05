/**
 * Phase 4 — AR/VR : Vue 3D chantier (placeholder)
 * Page "Visite virtuelle" / Vue 3D — fondation pour WebXR / Three.js
 */

'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { cn } from '@/lib/cn';
import Link from 'next/link';

function ScenePlaceholder() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <Box args={[2, 1, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      <Box args={[1, 1.5, 1]} position={[3, 0.75, 1]}>
        <meshStandardMaterial color="#10b981" />
      </Box>
      <OrbitControls makeDefault enablePan enableZoom enableRotate />
    </>
  );
}

export default function Vue3DPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Vue 3D / Visite virtuelle</h1>
          <p className="text-sm text-slate-400 mt-1">
            Phase 4 — Fondation AR/VR. Scène 3D placeholder (Three.js). À terme : chantier en 3D, WebXR.
          </p>
        </div>
        <Link
          href="/maitre-ouvrage/dashboard/r/pilotage/dashboard/default"
          className="text-sm text-sky-400 hover:text-sky-300"
        >
          ← Retour dashboard
        </Link>
      </div>
      <div
        ref={containerRef}
        className={cn(
          'flex-1 rounded-xl border border-slate-700/50 bg-slate-900 overflow-hidden',
          'min-h-[300px]'
        )}
      >
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Chargement de la scène 3D…
            </div>
          }
        >
          <Canvas camera={{ position: [5, 4, 5], fov: 50 }} dpr={[1, 2]}>
            <ScenePlaceholder />
          </Canvas>
        </Suspense>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Glissez pour tourner, molette pour zoomer. Bientôt : modèle chantier, mesures, annotations.
      </p>
    </div>
  );
}
