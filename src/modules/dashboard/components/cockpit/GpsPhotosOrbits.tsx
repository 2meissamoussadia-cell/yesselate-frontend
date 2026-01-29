/**
 * Phase 6 — Photos GPS en orbite 3D autour de la sphère chantier
 * 6 dernières photos géolocalisées (texture dynamique), badge phase 25/50/75/100%.
 */

'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { photosGps } from '../../data/photoGpsMock';
import type { ChantierMock } from '../../data/chantiersMock';

const PLACEHOLDER_PHOTO = '/images/placeholder-photo.svg';
const ORBIT_COUNT = 6;

export interface GpsPhotoOrbitItem {
  id: string;
  url: string;
  phase: number;
  timestamp: number;
}

function getPhotosForChantier(chantierId: string, count: number): GpsPhotoOrbitItem[] {
  const byChantier = photosGps.filter((p) => p.chantierId === chantierId);
  const last = byChantier.slice(-count);
  return last.map((p, i) => ({
    id: p.id,
    url: p.url || PLACEHOLDER_PHOTO,
    phase: p.phase ?? Math.floor(Math.random() * 4) + 1,
    timestamp: Date.now() - i * 3600000,
  }));
}

/** Fallback: mock photos from chantier.photosGps count when no photoGpsMock entries */
function getMockPhotosForChantier(chantier: ChantierMock, count: number): GpsPhotoOrbitItem[] {
  const n = Math.min(count, Math.max(0, chantier.photosGps));
  return Array.from({ length: n }, (_, i) => ({
    id: `mock-${chantier.id}-${i}`,
    url: `https://yessalate-photos.s3.af-south-1.amazonaws.com/${chantier.id}/gps-${i + 1}.jpg`,
    phase: Math.floor(Math.random() * 4) + 1,
    timestamp: Date.now() - Math.random() * 86400000,
  }));
}

interface GpsPhotosOrbitsProps {
  chantierId: string;
  chantier?: ChantierMock;
  /** Position du groupe (même que la sphère) */
  position: [number, number, number];
}

export const GpsPhotosOrbits = React.memo(function GpsPhotosOrbits({
  chantierId,
  chantier,
  position,
}: GpsPhotosOrbitsProps) {
  const orbitGroupsRef = useRef<(THREE.Group | null)[]>([]);

  const photos = useMemo(() => {
    const fromMock = getPhotosForChantier(chantierId, ORBIT_COUNT);
    if (fromMock.length >= ORBIT_COUNT) return fromMock.slice(-ORBIT_COUNT);
    if (chantier) {
      const mock = getMockPhotosForChantier(chantier, ORBIT_COUNT - fromMock.length);
      return [...fromMock, ...mock].slice(-ORBIT_COUNT);
    }
    return fromMock;
  }, [chantierId, chantier]);

  // Une seule texture placeholder en dev (évite CORS S3) ; en prod = URLs S3
  const sharedTexture = useTexture(PLACEHOLDER_PHOTO);

  useFrame((state) => {
    orbitGroupsRef.current.forEach((group, i) => {
      if (group) {
        const angle = (state.clock.elapsedTime + i * 0.5) * 0.8;
        const radius = 1.5 + i * 0.2;
        group.position.x = Math.cos(angle) * radius;
        group.position.z = Math.sin(angle) * radius;
        group.position.y = (i % 3 - 1) * 0.3;
        group.rotation.y += 0.01;
      }
    });
  });

  if (photos.length === 0) return null;

  return (
    <group position={position}>
      {photos.slice(0, ORBIT_COUNT).map((photo, i) => {
        const isPhase4 = photo.phase === 4;
        return (
          <group
            key={`${chantierId}-${photo.id}`}
            ref={(el) => {
              orbitGroupsRef.current[i] = el;
            }}
            position={[0, 0, 0]}
          >
            <mesh>
              <planeGeometry args={[0.8, 0.6]} />
              <meshBasicMaterial
                map={sharedTexture}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, -0.4, 0.01]}>
              <planeGeometry args={[0.3, 0.15]} />
              <meshBasicMaterial
                color={isPhase4 ? '#10B981' : '#F59E0B'}
                transparent
                opacity={0.9}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});
