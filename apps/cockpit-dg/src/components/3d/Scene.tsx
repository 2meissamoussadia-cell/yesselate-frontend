'use client';

import { Suspense, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { cn } from '@/lib/utils';

interface SceneProps {
  children: ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
}

const defaultCamera = { position: [5, 5, 5] as [number, number, number], fov: 50 };

export function Scene({ children, className, camera = defaultCamera }: SceneProps) {
  return (
    <div className={cn('h-full w-full min-h-[300px] rounded-lg overflow-hidden bg-muted/30', className)}>
      <Canvas
        camera={{
          position: camera.position ?? defaultCamera.position,
          fov: camera.fov ?? defaultCamera.fov,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          {children}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
