/**
 * Phase 7 — InstancedMesh pour 60 FPS sur mobile (1000+ sphères).
 * Utilise Three.js InstancedMesh au lieu de N meshes individuels.
 */

'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface MobileSphereOptimizerProps {
  /** Nombre d'instances (sphères) */
  count: number;
  /** Santé par index (0–1), utilisé pour scale. Si absent, scale uniforme. */
  santeByIndex?: (i: number) => number;
}

const DUMMY = new THREE.Object3D();

export function MobileSphereOptimizer({
  count,
  santeByIndex = () => 0.7,
}: MobileSphereOptimizerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    const time = Date.now() * 0.005;

    for (let i = 0; i < count; i++) {
      const sante = santeByIndex(i);
      DUMMY.position.x = Math.cos(time + i) * 4;
      DUMMY.position.y = Math.sin(time * 0.7 + i) * 3;
      DUMMY.position.z = Math.sin(time * 0.3 + i) * 2;
      const scale = 0.5 + sante * 0.5;
      DUMMY.scale.setScalar(scale);
      DUMMY.updateMatrix();
      meshRef.current.setMatrixAt(i, DUMMY.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#3b82f6" />
    </instancedMesh>
  );
}
