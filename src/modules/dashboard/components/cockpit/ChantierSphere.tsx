'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ChantierMock } from '../../data/chantiersMock';
import type { CockpitQualityLevel } from '../../hooks/useCockpitFps';
import {
  sphereGlowVertex,
  sphereGlowFragment,
} from './shaders/sphereGlowShader';

function getSphereColor(sante: number): string {
  if (sante > 0.8) return '#10B981'; // emerald
  if (sante > 0.6) return '#F59E0B'; // amber
  return '#EF4444'; // rose
}

/** Jour 5 GPU: segments selon qualité (LOD) pour cible 120 FPS ultra */
function segmentsByQuality(quality: CockpitQualityLevel): [number, number] {
  switch (quality) {
    case 'low':
      return [12, 12];
    case 'medium':
      return [16, 16];
    case 'high':
      return [24, 24];
    case 'ultra':
      return [32, 32];
    default:
      return [24, 24];
  }
}

interface ChantierSphereProps {
  chantier: ChantierMock;
  position: [number, number, number];
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onContextMenu?: (chantier: ChantierMock, event: { clientX: number; clientY: number }) => void;
  quality?: CockpitQualityLevel;
}

export const ChantierSphere = React.memo(function ChantierSphere({
  chantier,
  position,
  isHovered,
  onHover,
  onClick,
  onContextMenu,
  quality = 'high',
}: ChantierSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const [segmentsMain, segmentsGlow] = segmentsByQuality(quality);
  const useGlowShader = quality === 'high' || quality === 'ultra';

  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Vector3(0, 0, 0) },
      uOpacity: { value: 0.25 },
      uTime: { value: 0 },
    }),
    []
  );

  const glowMaterial = useMemo(() => {
    const color = getSphereColor(chantier.sante);
    const c = new THREE.Color(color);
    glowUniforms.uColor.value.set(c.r, c.g, c.b);
    glowUniforms.uOpacity.value = 0.25;
    return new THREE.ShaderMaterial({
      vertexShader: sphereGlowVertex,
      fragmentShader: sphereGlowFragment,
      uniforms: glowUniforms,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [chantier.sante]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    const pulseSpeed = 0.8 + (1 - chantier.sante) * 1.2;
    const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1;
    const mesh = meshRef.current;
    const glow = glowRef.current;
    if (mesh) mesh.scale.setScalar(scale);
    if (glow) glow.scale.setScalar(1.3 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.15);
    if (useGlowShader && glowUniforms.uTime) {
      glowUniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const radius = Math.max(0.15, Math.min(0.8, chantier.ca / 1_500_000));
  const color = getSphereColor(chantier.sante);

  const handleContextMenu = (e: { nativeEvent: MouseEvent }) => {
    e.nativeEvent.preventDefault();
    onContextMenu?.(chantier, { clientX: e.nativeEvent.clientX, clientY: e.nativeEvent.clientY });
  };

  return (
    <group
      position={position}
      onPointerOver={() => onHover(chantier.id)}
      onPointerOut={() => onHover(null)}
      onClick={() => onClick(chantier.id)}
      onContextMenu={handleContextMenu}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, segmentsMain, segmentsMain]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.35 : 0.12}
          metalness={0.3}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.1, segmentsGlow, segmentsGlow]} />
        {useGlowShader ? (
          <primitive object={glowMaterial} attach="material" />
        ) : (
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            side={THREE.BackSide}
          />
        )}
      </mesh>
      {isHovered && (
        <Html
          position={[0, radius + 0.4, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="bg-slate-900/95 text-white rounded-lg text-xs border border-slate-700/60 shadow-xl max-w-[220px] overflow-hidden"
            title={`${chantier.id} — Santé ${(chantier.sante * 100).toFixed(0)}% • CA ${(chantier.ca / 1e6).toFixed(2)}M • Marge ${(chantier.marge * 100).toFixed(0)}%`}
          >
            <div className="px-3 py-2 font-semibold border-b border-slate-700/60">
              {chantier.id} • {(chantier.sante * 100).toFixed(0)}%
            </div>
            <div className="px-3 py-2 space-y-1 text-slate-300">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">CA</span>
                <span className="font-medium text-slate-200">{(chantier.ca / 1000).toFixed(0)}k FCFA</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Marge</span>
                <span className="font-medium text-emerald-400">{(chantier.marge * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Photos GPS</span>
                <span className="font-medium">{chantier.photosGps}{chantier.photosManquantes != null && chantier.photosManquantes > 0 ? ` (${chantier.photosManquantes} manq.)` : ''}</span>
              </div>
              {(chantier.chefChantierName || chantier.bureauControle) && (
                <div className="flex justify-between gap-3 pt-1 border-t border-slate-700/40">
                  <span className="text-slate-400">Équipe</span>
                  <span className="font-medium text-slate-200 truncate max-w-[120px]" title={chantier.chefChantierName ?? chantier.bureauControle}>
                    {chantier.chefChantierName ?? `Bureau ${chantier.bureauControle}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
});
