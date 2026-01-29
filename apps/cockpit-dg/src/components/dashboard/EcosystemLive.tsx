'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { endpoints, type EcosystemNode, type EcosystemLink } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';

export interface EcosystemLiveProps {
  ouvriersKyc?: number;
  quincailleries?: number;
  huissiersPending?: number;
  onNodeClick?: (type: string, id: string) => void;
}

type NodeWithPosition = EcosystemNode & { x?: number; y?: number; vx?: number; vy?: number };
type LinkWithNodes = { source: NodeWithPosition; target: NodeWithPosition; weight: number; status: string };

const NODE_EMOJI: Record<string, string> = {
  center: '🏢',
  ouvrier: '👷',
  quincaillerie: '🔧',
  huissier: '📄',
  client: '👤',
};

const STATUS_COLOR = {
  ok: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
} as const;

function buildMockGraph(ouvriersKyc: number, quincailleries: number, huissiersPending: number): { nodes: NodeWithPosition[]; links: EcosystemLink[] } {
  const nodes: NodeWithPosition[] = [
    { id: 'center', type: 'center', label: 'NICE RÉNOVATION', status: 'ok' },
  ];
  const links: EcosystemLink[] = [];

  for (let i = 0; i < Math.min(ouvriersKyc, 8); i++) {
    const id = `ouvrier-${i}`;
    nodes.push({ id, type: 'ouvrier', label: `Ouvrier ${i + 1}`, status: i < 6 ? 'ok' : 'warning' });
    links.push({ source: 'center', target: id, weight: 1, status: 'ok' });
  }
  for (let i = 0; i < Math.min(quincailleries, 5); i++) {
    const id = `quinc-${i}`;
    nodes.push({ id, type: 'quincaillerie', label: `Quinc. ${i + 1}`, status: 'ok' });
    links.push({ source: 'center', target: id, weight: 1, status: 'ok' });
  }
  for (let i = 0; i < Math.min(huissiersPending, 3); i++) {
    const id = `huissier-${i}`;
    nodes.push({ id, type: 'huissier', label: `Huissier ${i + 1}`, status: i === 0 && huissiersPending > 0 ? 'warning' : 'ok' });
    links.push({ source: 'center', target: id, weight: 1, status: i === 0 ? 'warning' : 'ok' });
  }

  return { nodes, links };
}

export function EcosystemLive({
  ouvriersKyc = 5,
  quincailleries = 3,
  huissiersPending = 1,
  onNodeClick,
}: EcosystemLiveProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [nodes, setNodes] = useState<NodeWithPosition[]>([]);
  const [links, setLinks] = useState<LinkWithNodes[]>([]);
  const simulationRef = useRef<d3.Simulation<NodeWithPosition, EcosystemLink> | null>(null);

  const { data } = useQuery({
    queryKey: ['ecosystem'],
    queryFn: () => endpoints.analytics.ecosystem(),
    refetchInterval: 10 * 1000,
    staleTime: 8 * 1000,
  });

  const graphData = data?.nodes?.length ? data : buildMockGraph(ouvriersKyc, quincailleries, huissiersPending);

  useEffect(() => {
    const w = containerRef.current?.clientWidth ?? 600;
    const h = containerRef.current?.clientHeight ?? 400;
    setDimensions({ width: w, height: h });
  }, []);

  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodesData: NodeWithPosition[] = graphData.nodes.map((n) => ({
      ...n,
      x: centerX + (Math.random() - 0.5) * 100,
      y: centerY + (Math.random() - 0.5) * 100,
    }));

    const linksData: EcosystemLink[] = graphData.links;

    const linkForce = d3
      .forceLink<NodeWithPosition, EcosystemLink>(linksData)
      .id((d) => (d as NodeWithPosition).id)
      .distance(120)
      .strength(0.5);

    const simulation = d3
      .forceSimulation<NodeWithPosition>(nodesData)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(45))
      .on('tick', () => {
        setNodes([...simulation.nodes()]);
        const simLinks = simulation.force<d3.ForceLink<NodeWithPosition, EcosystemLink>>('link')?.links() ?? [];
        setLinks(
          simLinks.map((l, i) => ({
            source: l.source as NodeWithPosition,
            target: l.target as NodeWithPosition,
            weight: linksData[i]?.weight ?? 1,
            status: linksData[i]?.status ?? 'ok',
          }))
        );
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [graphData.nodes, graphData.links, dimensions]);

  const handleDrag = useCallback(
    (event: d3.D3DragEvent<SVGCircleElement, NodeWithPosition, NodeWithPosition>) => {
      if (!event.subject) return;
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      simulationRef.current?.alphaTarget(0.3).restart();
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: d3.D3DragEvent<SVGCircleElement, NodeWithPosition, NodeWithPosition>) => {
      if (!event.subject) return;
      event.subject.fx = null;
      event.subject.fy = null;
      simulationRef.current?.alphaTarget(0);
    },
    []
  );

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const drag = d3.drag<SVGCircleElement, NodeWithPosition>().on('drag', handleDrag).on('end', handleDragEnd);
    d3.select(svgRef.current).selectAll<SVGCircleElement, NodeWithPosition>('circle.node').call(drag);
  }, [nodes.length, handleDrag, handleDragEnd]);

  const getRadius = (type: string) => (type === 'center' ? 40 : 28);
  const truncate = (s: string, max = 15) => (s.length <= max ? s : s.slice(0, max - 2) + '…');

  return (
    <div
      ref={containerRef}
      className={cn('h-[400px] w-full overflow-hidden rounded-lg border bg-card')}
      style={{ minHeight: 400 }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="overflow-visible"
      >
        <g>
          {links.map((l, i) => (
            <line
              key={i}
              x1={l.source.x ?? 0}
              y1={l.source.y ?? 0}
              x2={l.target.x ?? 0}
              y2={l.target.y ?? 0}
              stroke={STATUS_COLOR[l.status as keyof typeof STATUS_COLOR] ?? '#94a3b8'}
              strokeWidth={Math.max(1, l.weight)}
              strokeOpacity={0.7}
            />
          ))}
        </g>
        <g>
          {nodes.map((n) => {
            const r = getRadius(n.type);
            const isCritical = n.status === 'critical';
            return (
              <g key={n.id}>
                <circle
                  className={cn('node cursor-grab', isCritical && 'animate-pulse')}
                  r={r}
                  cx={n.x ?? 0}
                  cy={n.y ?? 0}
                  fill={STATUS_COLOR[n.status]}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: 'grab' }}
                  onClick={() => onNodeClick?.(n.type, n.id)}
                />
                <text
                  x={n.x ?? 0}
                  y={(n.y ?? 0) - 4}
                  textAnchor="middle"
                  fontSize={n.type === 'center' ? 16 : 12}
                  className="pointer-events-none select-none fill-white"
                >
                  {NODE_EMOJI[n.type] ?? '•'}
                </text>
                <text
                  x={n.x ?? 0}
                  y={(n.y ?? 0) + r + 12}
                  textAnchor="middle"
                  fontSize={10}
                  className="pointer-events-none fill-foreground"
                >
                  {truncate(n.label)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
