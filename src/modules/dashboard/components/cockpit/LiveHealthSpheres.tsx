/**
 * Phase 5 — LiveHealthSpheres
 * Health Spheres en mode live : /api/chantiers/health, refresh 5s, WebSocket gps/stock.
 */

'use client';

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChantierMock } from '../../data/chantiersMock';
import { ChantierSphere } from './ChantierSphere';
import { GpsPhotosOrbits } from './GpsPhotosOrbits';
import { ChantierContextMenu } from './ChantierContextMenu';
import { ChantierChatModal } from '../modals/ChantierChatModal';
import { ChantierWhatsAppModal } from '../modals/ChantierWhatsAppModal';
import { ChantierMediaModal } from '../modals/ChantierMediaModal';
import { ChantierDetailModal } from '../modals/ChantierDetailModal';
import { colors } from '../../utils/dashboardDesignTokens';
import { useLiveChantiers } from '../../hooks/useLiveChantiers';
import { useCockpitFps } from '../../hooks/useCockpitFps';
import { LiveStatusBadge } from './LiveStatusBadge';
import { EmptyState } from '../shared/EmptyState';
import { CockpitSpheresLoadingSkeleton } from './CockpitSpheresLoadingSkeleton';
import { FolderKanban } from 'lucide-react';

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

function LiveCanvasContent({
  list,
  quality,
  onDrilldown,
  onContextMenu,
}: {
  list: ChantierMock[];
  quality: CockpitQualityLevel;
  onDrilldown?: (chantierId: string) => void;
  onContextMenu?: (chantier: ChantierMock, event: { clientX: number; clientY: number }) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const handleDrilldown = useCallback((id: string) => { onDrilldown?.(id); }, [onDrilldown]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.3} />
      {list.map((chantier, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const pos: [number, number, number] = [(col - 2) * 2.2, (1 - row) * 2.2, Math.sin(i * 0.4) * 0.3];
        return (
          <React.Fragment key={chantier.id}>
            <ChantierSphere
              chantier={chantier}
              position={pos}
              isHovered={hovered === chantier.id}
              onHover={setHovered}
              onClick={handleDrilldown}
              onContextMenu={onContextMenu}
              quality={quality}
            />
            <GpsPhotosOrbits chantierId={chantier.id} chantier={chantier} position={pos} />
          </React.Fragment>
        );
      })}
      <OrbitControls enableZoom enablePan={false} />
    </>
  );
}

export interface LiveHealthSpheresProps {
  className?: string;
  maxSpheres?: number;
  onDrilldown?: (chantierId: string) => void;
  onNewChantier?: () => void;
}

export function LiveHealthSpheres({
  className,
  maxSpheres = 20,
  onDrilldown,
  onNewChantier,
}: LiveHealthSpheresProps) {
  const { quality } = useCockpitFps({ enabled: true });
  const effectiveMax = maxSpheresByQuality(quality, maxSpheres);
  const {
    chantiers: list,
    totalChantiers,
    isLoading,
    isLive,
    lastUpdatedAt,
  } = useLiveChantiers({ maxSpheres: effectiveMax, refetchIntervalMs: 5000 });

  const { totalCa, avgMarge } = useMemo(() => {
    const total = list.reduce((a, c) => a + c.ca, 0);
    const avg = list.length ? list.reduce((a, c) => a + c.marge, 0) / list.length : 0;
    return { totalCa: total, avgMarge: Math.round(avg * 100) };
  }, [list]);

  const [contextMenu, setContextMenu] = useState<{ chantier: ChantierMock; x: number; y: number } | null>(null);
  const [chatChantier, setChatChantier] = useState<ChantierMock | null>(null);
  const [whatsappChantier, setWhatsappChantier] = useState<ChantierMock | null>(null);
  const [mediaChantier, setMediaChantier] = useState<ChantierMock | null>(null);
  const [detailChantier, setDetailChantier] = useState<ChantierMock | null>(null);

  const handleDrilldownInternal = useCallback(
    (id: string) => {
      const ch = list.find((c) => c.id === id) ?? null;
      setDetailChantier(ch);
      onDrilldown?.(id);
    },
    [list, onDrilldown]
  );

  const handleContextMenu = useCallback(
    (chantier: ChantierMock, event: { clientX: number; clientY: number }) => {
      setContextMenu({ chantier, x: event.clientX, y: event.clientY });
    },
    []
  );

  const caDisplay = totalCa >= 1_000_000 ? `${(totalCa / 1_000_000).toFixed(1)}M` : `${(totalCa / 1000).toFixed(0)}k`;

  if (isLoading && list.length === 0) {
    return <CockpitSpheresLoadingSkeleton className={className} />;
  }

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
            Portfolio Health • {totalChantiers} chantiers • Live
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
        {list.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <EmptyState
              title="Aucun chantier"
              description="Aucun chantier à afficher. Vérifiez l’API /api/chantiers/health ou créez un chantier."
              icon={FolderKanban}
              variant="info"
              actionLabel={onNewChantier ? 'Nouveau chantier' : undefined}
              actionAriaLabel={onNewChantier ? 'Créer un chantier' : undefined}
              onAction={onNewChantier}
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
              <LiveCanvasContent
                list={list}
                quality={quality}
                onDrilldown={handleDrilldownInternal}
                onContextMenu={handleContextMenu}
              />
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
            if (action === 'chat') setChatChantier(ch);
            if (action === 'whatsapp') setWhatsappChantier(ch);
            if (action === 'photos') toast.info(`Photos – ${ch.id}`, { description: 'Ouverture galerie…' });
            if (action === 'urgent') toast.warning(`Urgence – ${ch.id}`, { description: 'Prioritaire.' });
            if (action === 'archive') toast.success(`Archivé – ${ch.id}`, { description: 'Archives.' });
          }}
        />
      )}
      {chatChantier && <ChantierChatModal chantier={chatChantier} onClose={() => setChatChantier(null)} />}
      {whatsappChantier && <ChantierWhatsAppModal chantier={whatsappChantier} onClose={() => setWhatsappChantier(null)} />}
      {mediaChantier && <ChantierMediaModal chantier={mediaChantier} onClose={() => setMediaChantier(null)} />}
      {detailChantier && <ChantierDetailModal chantier={detailChantier} onClose={() => setDetailChantier(null)} />}
    </div>
  );
}
