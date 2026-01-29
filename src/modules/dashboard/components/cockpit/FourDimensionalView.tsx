'use client';

/**
 * Vue 4D Cockpit DG V2 — Axe temporel vertical (présent → +7j → +30j)
 * Bas = Présent (sphères chantiers), Milieu/Haut = marqueurs d'insights prédictifs
 * Connexions causales chantier → insight (lignes pointillées)
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import type { ChantierMock } from '../../data/chantiersMock';
import type { PredictiveInsight } from '../../types/cockpitV2';
import { ChantierSphere } from './ChantierSphere';

const TIMELINE_TOP = 12;
const Y_PRESENT = 0;
const Y_7_DAYS = 5;
const Y_30_DAYS = 10;

function getChantierPosition(index: number): [number, number, number] {
  const row = Math.floor(index / 5);
  const col = index % 5;
  return [
    (col - 2) * 2.2,
    Y_PRESENT,
    (1 - row) * 2.2 + Math.sin(index * 0.4) * 0.3,
  ];
}

function getInsightY(deadline: Date): number {
  const daysAhead = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
  return daysAhead <= 7 ? Y_7_DAYS : Y_30_DAYS;
}

function severityColor(severity: PredictiveInsight['severity']): string {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'medium': return '#3B82F6';
    default: return '#6B7280';
  }
}

interface InsightMarkerProps {
  insight: PredictiveInsight;
  position: [number, number, number];
}

const InsightMarker = React.memo(function InsightMarker({ insight, position }: InsightMarkerProps) {
  const color = severityColor(insight.severity);
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          className="bg-slate-900/95 text-white px-2 py-1 rounded text-[10px] font-medium border whitespace-nowrap max-w-[140px] truncate"
          style={{ borderColor: color }}
        >
          {insight.prediction}
        </div>
      </Html>
    </group>
  );
});

interface CausalLineProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}

function CausalLine({ from, to, color }: CausalLineProps) {
  const points = useMemo(() => [from, to] as [number, number, number][], [from, to]);
  return (
    <Line
      points={points}
      color={color}
      dashed
      lineWidth={1}
    />
  );
}

function TimelineAxis() {
  const points = useMemo(() => [[0, 0, 0], [0, TIMELINE_TOP, 0]] as [number, number, number][], []);
  return <Line points={points} color="#475569" lineWidth={1.5} />;
}

interface FourDimensionalViewInnerProps {
  chantiers: ChantierMock[];
  insights: PredictiveInsight[];
  onDrilldown?: (chantierId: string) => void;
}

function FourDimensionalViewInner({ chantiers, insights, onDrilldown }: FourDimensionalViewInnerProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const chantierPositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    chantiers.forEach((c, i) => map.set(c.id, getChantierPosition(i)));
    return map;
  }, [chantiers]);

  const insightPositions = useMemo(() => {
    return insights.slice(0, 12).map((insight, i) => {
      const y = getInsightY(insight.deadline);
      const angle = (i / Math.max(insights.length, 1)) * Math.PI * 2;
      const x = Math.sin(angle) * 6;
      const z = Math.cos(angle) * 6;
      return { insight, position: [x, y, z] as [number, number, number] };
    });
  }, [insights]);

  const handleDrilldown = useCallback(
    (id: string) => {
      onDrilldown?.(id);
    },
    [onDrilldown]
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.3} />

      <TimelineAxis />
      <Html position={[1.5, Y_PRESENT, 0]} center>
        <span className="text-[10px] text-slate-400 font-medium">PRÉSENT</span>
      </Html>
      <Html position={[1.5, Y_7_DAYS, 0]} center>
        <span className="text-[10px] text-slate-400 font-medium">+7 J</span>
      </Html>
      <Html position={[1.5, Y_30_DAYS, 0]} center>
        <span className="text-[10px] text-slate-400 font-medium">+30 J</span>
      </Html>

      {chantiers.map((chantier, i) => (
        <ChantierSphere
          key={chantier.id}
          chantier={chantier}
          position={getChantierPosition(i)}
          isHovered={hovered === chantier.id}
          onHover={setHovered}
          onClick={handleDrilldown}
        />
      ))}

      {insightPositions.map(({ insight, position }) => (
        <InsightMarker key={insight.id} insight={insight} position={position} />
      ))}

      {insightPositions.map(({ insight, position }) => {
        const from = chantierPositions.get(insight.chantier_id);
        if (!from) return null;
        return (
          <CausalLine
            key={`line-${insight.id}`}
            from={from}
            to={position}
            color={severityColor(insight.severity)}
          />
        );
      })}

      <OrbitControls enableZoom enablePan={false} />
    </>
  );
}

export interface FourDimensionalViewProps {
  chantiers: ChantierMock[];
  insights: PredictiveInsight[];
  onDrilldown?: (chantierId: string) => void;
  className?: string;
}

export function FourDimensionalView({
  chantiers,
  insights,
  onDrilldown,
  className = '',
}: FourDimensionalViewProps) {
  return (
    <div className={`rounded-2xl border border-slate-800/60 bg-slate-950/80 overflow-hidden min-h-[480px] ${className}`}>
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800/60 bg-slate-950/40">
        <span className="text-sm font-semibold text-slate-100">Vue 4D — Présent → +7j → +30j</span>
        <span className="text-xs text-slate-400">{insights.length} prédiction(s)</span>
      </div>
      <div className="h-[520px] w-full">
        <Canvas
          camera={{ position: [0, 6, 14], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <FourDimensionalViewInner
            chantiers={chantiers}
            insights={insights}
            onDrilldown={onDrilldown}
          />
        </Canvas>
      </div>
    </div>
  );
}
