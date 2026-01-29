'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, Points, Color } from 'three';
import * as THREE from 'three';
import { Scene } from '@/components/3d';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api/endpoints';

export interface HealthReactor3DProps {
  operations?: number;
  finance?: number;
  workflow?: number;
  criticalAlerts?: number;
  onSphereClick?: (domain: string) => void;
}

const SUB_SPHERE_POSITIONS: [number, number, number][] = [
  [3, 0, 0],
  [-1.5, 2.6, 0],
  [-1.5, -2.6, 0],
];

const SUB_SPHERE_LABELS = ['Opérations', 'Finance', 'Workflow'] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, t);
}

function ReactorContent({
  operations = 0.8,
  finance = 0.7,
  workflow = 0.6,
  criticalAlerts = 0,
  onSphereClick,
}: HealthReactor3DProps) {
  const mainRef = useRef<Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<Points>(null);
  const scaleRef = useRef(1);
  const pulsePhaseRef = useRef(0);
  const colorRef = useRef(new Color());

  const avg = (operations + finance + workflow) / 3;
  const hue = avg > 0.7 ? 0.33 : avg > 0.4 ? 0.15 : 0;
  const targetColor = useMemo(() => new Color().setHSL(hue, 0.7, 0.5), [hue]);
  const pulseFreq = useMemo(
    () => 0.1 + (criticalAlerts / 10) * 1.9,
    [criticalAlerts]
  );

  const particleCount = useMemo(
    () => Math.min(150, Math.max(10, 10 + criticalAlerts * 20)),
    [criticalAlerts]
  );

  const [particlePositions, particleSeeds] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const seeds: number[] = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      seeds.push(Math.random() * 100, Math.random() * 100);
    }
    return [positions, seeds];
  }, [particleCount]);

  useFrame((_, delta) => {
    pulsePhaseRef.current += delta * pulseFreq * Math.PI * 2;
    const pulse = Math.sin(pulsePhaseRef.current) * 0.025 + 1;
    scaleRef.current = lerp(scaleRef.current, pulse, delta * 5);
    if (mainRef.current) {
      mainRef.current.scale.setScalar(scaleRef.current);
    }

    colorRef.current.lerp(targetColor, delta * 2);
    if (mainRef.current?.material && 'color' in mainRef.current.material) {
      (mainRef.current.material as { color: Color }).color.copy(colorRef.current);
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.15;
    }

    if (pointsRef.current?.geometry) {
      const pos = pointsRef.current.geometry.attributes.position?.array as Float32Array;
      const seedsArr = particleSeeds;
      if (pos && seedsArr) {
        const t = pulsePhaseRef.current * 0.5;
        for (let i = 0; i < particleCount; i++) {
          const s1 = seedsArr[i * 2] ?? 0;
          const s2 = seedsArr[i * 2 + 1] ?? 0;
          pos[i * 3] += Math.sin(t + s1) * 0.008;
          pos[i * 3 + 1] += Math.cos(t * 0.7 + s2) * 0.008;
          pos[i * 3 + 2] += Math.sin(t * 0.5 + s1 + s2) * 0.008;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <mesh
        ref={mainRef}
        onClick={() => onSphereClick?.('main')}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color={colorRef.current}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      <group ref={orbitRef}>
        {SUB_SPHERE_POSITIONS.map((pos, i) => {
          const val = [operations, finance, workflow][i] ?? 0.5;
          const h = val > 0.7 ? 0.33 : val > 0.4 ? 0.15 : 0;
          const subColor = `hsl(${h * 360}, 70%, 50%)`;
          return (
            <group key={i} position={pos as [number, number, number]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSphereClick?.(SUB_SPHERE_LABELS[i].toLowerCase());
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial
                  color={subColor}
                  metalness={0.3}
                  roughness={0.5}
                />
              </mesh>
              <Html
                center
                distanceFactor={8}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: 10,
                  color: '#fff',
                  textShadow: '0 0 4px #000',
                }}
              >
                <span>{SUB_SPHERE_LABELS[i]} {Math.round(val * 100)}%</span>
              </Html>
            </group>
          );
        })}
      </group>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={criticalAlerts > 5 ? '#ef4444' : criticalAlerts > 2 ? '#eab308' : '#22c55e'}
          sizeAttenuation
          transparent
          opacity={0.8}
        />
      </points>
    </group>
  );
}


export function HealthReactor3D(props: HealthReactor3DProps) {
  const hasInitial = props.operations !== undefined || props.finance !== undefined || props.workflow !== undefined || props.criticalAlerts !== undefined;
  const { data } = useQuery({
    queryKey: ['health', 'metrics'],
    queryFn: () => endpoints.analytics.healthMetrics(),
    refetchInterval: 30 * 1000,
    staleTime: 25 * 1000,
    initialData: hasInitial
      ? {
          operations: props.operations ?? 0.87,
          finance: props.finance ?? 0.76,
          workflow: props.workflow ?? 0.62,
          criticalAlerts: props.criticalAlerts ?? 0,
        }
      : undefined,
  });

  const operations = data?.operations ?? props.operations ?? 0.87;
  const finance = data?.finance ?? props.finance ?? 0.76;
  const workflow = data?.workflow ?? props.workflow ?? 0.62;
  const criticalAlerts = data?.criticalAlerts ?? props.criticalAlerts ?? 0;

  return (
    <Scene className="h-[400px] w-full">
      <ReactorContent
        operations={operations}
        finance={finance}
        workflow={workflow}
        criticalAlerts={criticalAlerts}
        onSphereClick={props.onSphereClick}
      />
    </Scene>
  );
}
