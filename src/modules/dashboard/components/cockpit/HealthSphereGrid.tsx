'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChantierMock } from '../../data/chantiersMock';
import { ChantierSphere } from './ChantierSphere';
import { ChantierContextMenu } from './ChantierContextMenu';
import { ChantierChatModal } from '../modals/ChantierChatModal';
import { ChantierWhatsAppModal } from '../modals/ChantierWhatsAppModal';
import { ChantierMediaModal } from '../modals/ChantierMediaModal';
import { colors } from '../../utils/dashboardDesignTokens';
import { useCockpitChantiers } from '../../hooks/useCockpitChantiers';
import { useCockpitFps } from '../../hooks/useCockpitFps';
import { useCockpitLive } from '../../hooks/useCockpitLive';
import { LiveStatusBadge } from './LiveStatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { FolderKanban } from 'lucide-react';

interface HealthSphereGridProps {
  className?: string;
  maxSpheres?: number;
  onDrilldown?: (chantierId: string) => void;
}

/** V5 : max sphères selon qualité adaptative (FPS) */
function maxSpheresByQuality(quality: 'low' | 'medium' | 'high' | 'ultra', base: number): number {
  switch (quality) {
    case 'low': return Math.min(10, base);
    case 'medium': return Math.min(15, base);
    case 'high': return Math.min(20, base);
    case 'ultra': return Math.min(28, base);
    default: return base;
  }
}

type CockpitQualityLevel = 'low' | 'medium' | 'high' | 'ultra';

function dprByQuality(quality: CockpitQualityLevel): number {
  switch (quality) {
    case 'low': return 1;
    case 'medium': return 1.5;
    case 'high': return 2;
    case 'ultra': return 2;
    default: return 2;
  }
}

const HealthSphereGridInner = React.memo(function HealthSphereGridInner({
  list,
  onDrilldown,
  onContextMenu,
  quality = 'high',
}: {
  list: ChantierMock[];
  onDrilldown?: (chantierId: string) => void;
  onContextMenu?: (chantier: ChantierMock, event: { clientX: number; clientY: number }) => void;
  quality?: CockpitQualityLevel;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

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
      <pointLight position={[-5, -5, 5]} intensity={0.3} />
      {list.map((chantier, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <ChantierSphere
            key={chantier.id}
            chantier={chantier}
            position={[
              (col - 2) * 2.2,
              (1 - row) * 2.2,
              Math.sin(i * 0.4) * 0.3,
            ]}
            isHovered={hovered === chantier.id}
            onHover={setHovered}
            onClick={handleDrilldown}
            onContextMenu={onContextMenu}
            quality={quality}
          />
        );
      })}
      <OrbitControls enableZoom enablePan={false} />
    </>
  );
});

export function HealthSphereGrid({
  className,
  maxSpheres = 20,
  onDrilldown,
}: HealthSphereGridProps) {
  const { quality } = useCockpitFps({ enabled: true });
  const effectiveMax = maxSpheresByQuality(quality, maxSpheres);
  const {
    chantiers: list,
    totalChantiers,
    totalCa,
    avgMarge,
    isLoading,
    fromApi,
    lastUpdatedAt,
  } = useCockpitChantiers({ maxSpheres: effectiveMax });
  const { isConnected: isLive } = useCockpitLive({ enabled: true });
  const [contextMenu, setContextMenu] = useState<{
    chantier: ChantierMock;
    x: number;
    y: number;
  } | null>(null);
  const [chatChantier, setChatChantier] = useState<ChantierMock | null>(null);
  const [whatsappChantier, setWhatsappChantier] = useState<ChantierMock | null>(null);
  const [mediaChantier, setMediaChantier] = useState<ChantierMock | null>(null);

  const handleContextMenu = useCallback(
    (chantier: ChantierMock, event: { clientX: number; clientY: number }) => {
      setContextMenu({ chantier, x: event.clientX, y: event.clientY });
    },
    []
  );

  const caDisplay = totalCa >= 1_000_000 ? `${(totalCa / 1_000_000).toFixed(1)}M` : `${(totalCa / 1000).toFixed(0)}k`;

  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden',
        colors.border.default,
        colors.bg.secondary,
        'min-h-[480px]',
        className
      )}
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800/60 bg-slate-950/40 flex-wrap gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-semibold text-slate-100 shrink-0">
            Portfolio Health • {totalChantiers} chantiers
          </h2>
          <LiveStatusBadge
            isLive={isLive}
            lastUpdatedAt={lastUpdatedAt}
            isLoading={isLoading}
            compact={false}
          />
        </div>
        <div className="text-xs text-slate-400 shrink-0">
          CA : <span className="font-semibold text-emerald-400">{caDisplay}</span> / 50M •
          Marge : <span className="font-semibold text-amber-400">{avgMarge} %</span>
        </div>
      </div>
      <div className="h-[520px] w-full bg-slate-950/80">
        {list.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center p-6">
            <EmptyState
              title="Aucun chantier"
              description="Aucun chantier à afficher dans le portfolio. Les chantiers apparaîtront ici une fois les données chargées."
              icon={FolderKanban}
              variant="info"
            />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Chargement 3D…
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 0, 10], fov: 50 }}
              gl={{
                antialias: quality !== 'low',
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
              }}
              dpr={dprByQuality(quality)}
              frameloop="always"
            >
              <HealthSphereGridInner list={list} quality={quality} onDrilldown={onDrilldown} onContextMenu={handleContextMenu} />
            </Canvas>
          </Suspense>
        )}
      </div>
      {contextMenu && (
        <ChantierContextMenu
          chantier={contextMenu.chantier}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={(action, ch) => {
            if (action === 'chat') {
              setChatChantier(ch);
            }
            if (action === 'whatsapp') {
              setWhatsappChantier(ch);
            }
            if (action === 'photos') {
              toast.info(`Photos récentes – ${ch.id}`, { description: 'Ouverture de la galerie…' });
            }
            if (action === 'urgent') {
              toast.warning(`Urgence marquée – ${ch.id}`, { description: 'Le chantier est signalé comme prioritaire.' });
            }
            if (action === 'archive') {
              toast.success(`Chantier archivé – ${ch.id}`, { description: 'Déplacé dans les archives.' });
            }
          }}
        />
      )}
      {chatChantier && (
        <ChantierChatModal
          chantier={chatChantier}
          onClose={() => setChatChantier(null)}
        />
      )}
      {whatsappChantier && (
        <ChantierWhatsAppModal
          chantier={whatsappChantier}
          onClose={() => setWhatsappChantier(null)}
        />
      )}
      {mediaChantier && (
        <ChantierMediaModal
          chantier={mediaChantier}
          onClose={() => setMediaChantier(null)}
        />
      )}
    </div>
  );
}
