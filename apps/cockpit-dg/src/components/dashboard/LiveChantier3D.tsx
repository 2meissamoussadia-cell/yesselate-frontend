'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { Scene } from '@/components/3d';
import { useChantierLive } from '@/lib/hooks/useChantiers';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { Button } from '@/components/ui/button';

export interface LiveChantier3DProps {
  chantierId: string;
  gpsLive?: boolean;
  avancement?: number;
  materialsStatus?: 'OK' | 'WARNING' | 'CRITICAL';
  bureauControle?: string;
  onActionClick?: (action: string) => void;
}

interface OuvrierPosition {
  id: string;
  x: number;
  z: number;
  nom?: string;
}

const STATUS_COLOR = {
  OK: '#22c55e',
  WARNING: '#eab308',
  CRITICAL: '#ef4444',
} as const;

function LiveContent({
  chantierId,
  gpsLive = true,
  avancement = 0.5,
  materialsStatus = 'OK',
  bureauControle = '1/3',
  onActionClick,
}: LiveChantier3DProps) {
  const buildingRef = useRef<Mesh>(null);
  const [ouvriers, setOuvriers] = useState<OuvrierPosition[]>([]);
  const { data } = useChantierLive(chantierId, !!chantierId);
  const { on, off, emit } = useWebSocket({ url: process.env.NEXT_PUBLIC_API_URL });

  const height = Math.max(0.5, avancement * 5);
  const color = STATUS_COLOR[materialsStatus];
  const wireframe = avancement < 0.5;

  useEffect(() => {
    if (!chantierId || !gpsLive) return;
    emit('workflow:subscribe', { chantierId });
    return () => {
      emit('workflow:unsubscribe', { chantierId });
    };
  }, [chantierId, gpsLive, emit]);

  useEffect(() => {
    if (!gpsLive) return;
    const handler = (payload: { ouvrierId?: string; lat?: number; lng?: number; nom?: string }) => {
      const { ouvrierId, lat = 0, lng = 0, nom } = payload;
      if (!ouvrierId) return;
      const scale = 0.01;
      setOuvriers((prev) => {
        const next = prev.filter((o) => o.id !== ouvrierId);
        next.push({
          id: ouvrierId,
          x: lng * scale,
          z: -lat * scale,
          nom,
        });
        return next.slice(-50);
      });
    };
    on<{ ouvrierId?: string; lat?: number; lng?: number; nom?: string }>('gps:ouvrier:update', handler);
    return () => {
      off('gps:ouvrier:update');
    };
  }, [gpsLive, on, off]);

  useFrame((_, delta) => {
    if (buildingRef.current?.material && 'emissiveIntensity' in buildingRef.current.material) {
      const m = buildingRef.current.material as { emissiveIntensity?: number };
      m.emissiveIntensity = 0.1 + Math.sin(delta * 10) * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={buildingRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, height, 1.5]} />
        <meshStandardMaterial
          color={color}
          wireframe={wireframe}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {ouvriers.map((o) => (
        <group key={o.id} position={[o.x, 0.2, o.z]}>
          <mesh>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
          </mesh>
          <Html
            center
            distanceFactor={5}
            style={{
              pointerEvents: 'none',
              fontSize: 9,
              color: '#fff',
              textShadow: '0 0 2px #000',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{o.nom || o.id.slice(0, 8)}</span>
          </Html>
        </group>
      ))}

      <group position={[1.5, 0.3, 1]}>
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={materialsStatus === 'OK' ? '#22c55e' : materialsStatus === 'WARNING' ? '#eab308' : '#ef4444'} />
        </mesh>
        <Html center distanceFactor={6} style={{ pointerEvents: 'none', fontSize: 8, color: '#fff' }}>
          <span>Stock</span>
        </Html>
      </group>

      <group position={[-1.2, 0.3, 1]}>
        <mesh>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Html center distanceFactor={6} style={{ pointerEvents: 'none', fontSize: 8, color: '#fff' }}>
          <span>Mat.</span>
        </Html>
      </group>
    </group>
  );
}

export function LiveChantier3D(props: LiveChantier3DProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const avancement = props.avancement ?? 0.5;
  const materialsStatus = props.materialsStatus ?? 'OK';
  const bureauControle = props.bureauControle ?? '1/3';

  return (
    <div className="relative h-[400px] w-full">
      <Scene className="h-full w-full">
        <LiveContent {...props} />
      </Scene>
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="text-xs"
          onClick={() => props.onActionClick?.('photos') ?? setPhotoModalOpen(true)}
        >
          📷 Photos GPS
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="text-xs"
          onClick={() => props.onActionClick?.('call')}
        >
          📞 Appel équipe
        </Button>
      </div>
      <div className="absolute top-2 left-2 rounded bg-background/90 px-2 py-1 text-xs">
        Avancement {Math.round(avancement * 100)}% · Bureau {bureauControle} · {materialsStatus}
      </div>
      {photoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          role="dialog"
          aria-modal="true"
        >
          <div className="rounded-lg border bg-card p-4 shadow-lg">
            <p className="text-sm text-muted-foreground">Photos GPS — à brancher (S3)</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setPhotoModalOpen(false)}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
